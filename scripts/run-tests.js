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
