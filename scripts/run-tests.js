// Runner headless per tests.html — usato dalla CI GitHub Actions.
// ============================================================================
// Perche' questo file esiste
// ----------------------------------------------------------------------------
// La job `tests` in .github/workflows/ci.yml faceva SOLO controlli statici
// con grep (BossHotelPure presente, >= 30 dichiarazioni test, tests.html che
// referenzia elevator.html). I 285 test non venivano MAI eseguiti: CI verde
// non significava test verdi. E' cosi' che 4 test sono rimasti rossi per mesi
// senza che nulla lo segnalasse, e che due bug bloccanti (overlay portrait
// iPhone, startBtn irraggiungibile su desktop) sono arrivati in main.
//
// Uso:
//   node scripts/run-tests.js            # richiede `npx playwright install chromium`
// Restituisce exit code 1 se un test fallisce, cosi' la job fallisce.
//
// Perche' serve un server HTTP e non file://
// ----------------------------------------------------------------------------
// tests.html carica elevator.html in un <iframe sandbox> e elevator.html e' un
// ES module con importmap verso unpkg. Su file:// i moduli non si caricano
// (CORS) e l'iframe sandbox non puo' accedere agli stessi origin.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

// Timeout generoso: l'iframe deve scaricare three.js da unpkg e costruire
// l'intera scena 3D (corridoio, texture procedurali) prima che i test siano
// eseguibili. Su runner CI la rete e' piu' lenta del laptop di sviluppo.
const NAV_TIMEOUT = 90_000;
const RESULTS_TIMEOUT = 60_000;

// ---------------------------------------------------------------------------
// three.js da buffer locale (ottimizzazione CI 2026-10-13, P4).
// ---------------------------------------------------------------------------
// elevator.html ha un importmap verso unpkg: ogni load di pagina scaricava
// ~600 KB + addon dalla CDN con cache del contesto vuota, aggiungendo latenza
// e un punto di fragilita' (unpkg lento/giu' = CI rossa per motivi non di
// codice, esattamente il tipo di falso rosso che D30 voleva eliminare).
// Scarichiamo i file una volta per run e li serviamo via route interception:
// il browser riceve gli stessi byte senza toccare la rete. elevator.html
// resta intatto (D1): l'intercettazione e' infrastruttura di solo test.
// Degrado: se il prefetch fallisce (rete offline) non si registra nessun
// route e la pagina usa la CDN direttamente, come prima della modifica.
// ---------------------------------------------------------------------------
const CDN_BASE = 'https://unpkg.com/three@0.160.0/';
const CDN_FILES = [
  'build/three.module.js',
  'examples/jsm/objects/Reflector.js',
  'examples/jsm/utils/BufferGeometryUtils.js',
];
const cdnBuffer = new Map();

async function prefetchCdnFiles() {
  const settled = await Promise.allSettled(CDN_FILES.map(async (rel) => {
    const res = await fetch(CDN_BASE + rel, { redirect: 'follow' });
    if (!res.ok) throw new Error(`HTTP ${res.status} per ${rel}`);
    return [rel, Buffer.from(await res.arrayBuffer())];
  }));
  for (const r of settled) {
    if (r.status === 'fulfilled') cdnBuffer.set(r.value[0], r.value[1]);
    else console.log(`CDN locale: prefetch parziale (${r.reason && r.reason.message})`);
  }
  if (cdnBuffer.size === 0) console.log('CDN locale: nessun file scaricato — degrado su rete diretta');
}

// Registra la route su un target Playwright (BrowserContext o Page).
// NOTA 2026-10-13: NON usare `browser.on('context')` — verificato con probe
// (DNS unpkg blackholato) che l'evento NON viene emesso per i contesti
// impliciti creati da `browser.newPage()` in Playwright 1.56: la route non
// sarebbe mai registrata e i test passerebbero comunque via rete reale,
// cioe' un falso verde. La registrazione esplicita con `await` prima del
// goto elimina anche la gara tra installazione route e prima richiesta.
async function attachCdnRoute(target) {
  if (cdnBuffer.size === 0) return;
  await target.route('**/unpkg.com/three@0.160.0/**', async (route) => {
    const url = new URL(route.request().url());
    const rel = url.pathname.replace('/three@0.160.0/', '');
    const body = cdnBuffer.get(rel);
    if (body) {
      // MIME javascript obbligatorio: i module script rifiutano altri type.
      await route.fulfill({ status: 200, contentType: 'text/javascript; charset=utf-8', body });
    } else {
      // Percorso non in cache (futuri addon): lascia andare in rete.
      await route.continue();
    }
  });
  console.log(`CDN locale: ${cdnBuffer.size}/${CDN_FILES.length} file three.js serviti da buffer`);
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      // Blocca il path traversal: normalizza e verifica che resti sotto ROOT.
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const target = path.resolve(ROOT, '.' + (rel === '/' ? '/tests.html' : rel));
      if (target !== ROOT && !target.startsWith(ROOT + path.sep)) {
        res.writeHead(403).end('Forbidden');
        return;
      }
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
        res.writeHead(404).end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' });
      res.end(fs.readFileSync(target));
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

(async () => {
  const { server, port } = await startServer();
  const url = `http://127.0.0.1:${port}/tests.html`;
  const report = { total: 0, passed: 0, failed: 0, tests: [], pageErrors: [], error: null };
  const pageErrors = [];
  let browser;
  let exitCode = 1;

  try {
    await prefetchCdnFiles();
    browser = await chromium.launch({
      args: [
        // WebGL in headless: senza questi lo SwiftShader puo' non essere
        // disponibile e `new THREE.WebGLRenderer()` in elevator.html
        // lancerebbe -> il modulo abortisce -> 0 test eseguibili.
        '--use-gl=angle',
        '--use-angle=swiftshader',
        '--enable-unsafe-swiftshader',
      ],
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
    await attachCdnRoute(page);

    // Errori di pagina: un modulo che non si carica e' la causa piu' comune
    // di "0 test eseguiti", e va segnalato con messaggio utile. Raccolti in
    // scope esterno perche' nel ramo catch sotto si arriva quando la
    // waitForFunction va in timeout: senza questo, un modulo che non si
    // carica produrrebbe solo "Timeout 60000ms exceeded", illeggibile.
    page.on('pageerror', (e) => pageErrors.push(e.message));

    await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT });

    // Aspetta che l'harness pubblichi window.__testResults.
    await page.waitForFunction(() => !!window.__testResults, null, { timeout: RESULTS_TIMEOUT });

    const results = await page.evaluate(() => window.__testResults);
    const { total, passed, failed } = results;
    // Shape dei test: { name: "[section] nome", pass: boolean, error?: string }
    const failedTests = (results.tests || []).filter((t) => t && !t.pass);

    report.total = total;
    report.passed = passed;
    report.failed = failed;
    report.tests = results.tests || [];
    report.pageErrors = pageErrors;

    console.log(`\nTest eseguiti : ${total}`);
    console.log(`Passati      : ${passed}`);
    console.log(`Falliti      : ${failed}\n`);

    if (failed > 0) {
      console.log('::group::Test falliti');
      for (const t of failedTests) {
        console.log(`  ✗ ${t.name}`);
        if (t.error) console.log(`      ${String(t.error).split('\n').join('\n      ')}`);
      }
      console.log('::endgroup::');
    }

    if (pageErrors.length) {
      console.log('::group::Errori di pagina (possibile modulo non caricato)');
      for (const e of pageErrors.slice(0, 20)) console.log(`  - ${e}`);
      console.log('::endgroup::');
    }

    // Guardia anti-falso-verde: 0 test eseguiti non e' un pass.
    if (total === 0) {
      console.log('::error::0 test eseguiti — la CI non deve considerarlo un successo');
    }

    if (failed === 0 && total > 0) {
      exitCode = 0;
      console.log(`OK: ${passed}/${total} test passati`);
    }
  } catch (err) {
    report.error = err.message;
    console.log(`::error::Esecuzione test fallita: ${err.message}`);
    if (pageErrors.length) {
      console.log('::group::Errori di pagina — quasi certamente la causa reale');
      for (const e of pageErrors.slice(0, 20)) console.log(`  - ${e}`);
      console.log('::endgroup::');
    }
    if (/Timeout/.test(err.message)) {
      console.log('::error::Timeout in attesa di window.__testResults: elevator.html '
        + 'non ha esposto BossHotelPure (modulo abortito, three.js non scaricato '
        + 'da unpkg, o WebGL non disponibile in headless).');
    }
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.close();
    // Artefatto per il debug in caso di fallimento (caricato dalla CI).
    try {
      fs.writeFileSync(
        path.join(ROOT, 'test-output.json'),
        JSON.stringify(report, null, 2)
      );
    } catch (_) { /* non fatale */ }
  }

  process.exit(exitCode);
})();
