// ============================================================================
// run-ui-tests.js — test COMPORTAMENTALI di layout e interazione
// ============================================================================
// Perche' questo file esiste
// ----------------------------------------------------------------------------
// `scripts/run-tests.js` esegue i 285 test su `window.BossHotelPure`: funzioni
// pure in un iframe nascosto, nessun layout, nessun rendering. E' la job che
// ha scoperto il test a11y rotto dal locale, ma NON avrebbe mai beccato i due
// bug bloccanti chiusi il 2026-09-28, perche' entrambi erano di CSS:
//   - #startBtn sotto il bordo inferiore con overflow non scorrevole
//     (1366x768, 1280x720, 1024x768, ...): l'app non si avviava
//   - avviso "ruota il dispositivo" overlay 100vw/100vh rgba(0,0,0,0.92) che
//     intercettava i tap sul #startBtn: su iPhone 15 Pro l'app non partiva
// Una CI verde poteva quindi stare accanto a un'app inutilizzabile. Qui si
// verifica il comportamento reale: l'utente puo' premere il pulsante?
//
// Uso:
//   npm install --no-save playwright@1.56.0 && npx playwright install chromium
//   node scripts/run-ui-tests.js
//
// Exit code 1 se un test fallisce. 0 test eseguiti = fallimento, non passaggio.
//
// Nota tecnica: `page.screenshot()` va in timeout su questa app perche'
// aspetta una stabilita' di frame che un loop requestAnimationFrame continuo
// non raggiunge mai. Per l'ispezione dei pixel si usa CDP
// Page.captureScreenshot, che bypassa l'attesa.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };

const NAV_TIMEOUT = 90_000;
// Attesa del primo frame 3D: la scena costruisce corridoio e texture
// procedurali prima di essere disegnabile.
const RENDER_WAIT = 4000;

// Risoluzioni in cui il pulsante start era irraggiungibile (D29) piu' quelle
// in cui non lo era, come controllo negativo. 1366x768 e' la risoluzione
// laptop piu' diffusa al mondo.
const DESKTOP_VIEWPORTS = [
  [1920, 1080], [1600, 900], [1440, 900], [1366, 768],
  [1280, 800], [1280, 720], [1600, 720], [1024, 768], [1440, 810],
];
// 393x659 e' il portrait del profilo iPhone 15 Pro di Playwright.
const MOBILE_VIEWPORTS = [[852, 393], [393, 659]];

// ---------------------------------------------------------------------------
// Micro-framework. `test` e' async-aware: una fn async che rigetta DEVE
// contare come fallimento, altrimenti il runner mente (falso verde).
// ---------------------------------------------------------------------------
const results = [];
let currentGroup = '';

const group = (name) => { currentGroup = name; };

async function test(name, fn) {
  const full = `[${currentGroup}] ${name}`;
  try {
    await fn();
    results.push({ name: full, pass: true });
  } catch (e) {
    results.push({ name: full, pass: false, error: (e && e.message) || String(e) });
  }
}

function assert(cond, msg) { if (!cond) throw new Error(msg || 'assertion failed'); }

// ---------------------------------------------------------------------------
// Server HTTP statico su porta effimera.
// Serve perche' elevator.html e' un ES module con importmap: su file:// i
// moduli non si caricano (CORS) e l'app non parte.
// ---------------------------------------------------------------------------
function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const target = path.resolve(ROOT, '.' + (rel === '/' ? '/elevator.html' : rel));
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

const LAUNCH_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

// Geometria di un elemento, normalizzata.
const box = (page, selector) => page.evaluate((sel) => {
  const el = document.querySelector(sel);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  return { y: r.top, bottom: r.bottom, x: r.left, right: r.right, w: r.width, h: r.height };
}, selector);

const fits = (b, vh, vw) => !!b && b.y >= -1 && b.bottom <= vh + 1 && b.x >= -1 && b.right <= vw + 1;

// ===========================================================================

(async () => {
  const { server, port } = await startServer();
  const url = `http://127.0.0.1:${port}/elevator.html`;
  const report = { total: 0, passed: 0, failed: 0, tests: [], fatal: null };
  let browser;
  let fatal = null;

  try {
    browser = await chromium.launch({ args: LAUNCH_ARGS });

    // ===================== DESKTOP =====================
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));

    await page.goto(url, { waitUntil: 'load', timeout: NAV_TIMEOUT });
    await page.waitForTimeout(RENDER_WAIT);

    group('Avvio e canvas');
    await test('il modulo espone BossHotelPure (nessun abort all\'avvio)', async () => {
      const t = await page.evaluate(() => typeof window.BossHotelPure);
      assert(t === 'object', `BossHotelPure non disponibile (tipo: ${t})`);
    });

    await test('nessun errore di pagina durante l\'avvio', async () => {
      assert(pageErrors.length === 0, 'errori JS: ' + pageErrors.join(' | '));
    });

    await test('il canvas WebGL esiste e ha dimensioni reali', async () => {
      const b = await box(page, '#app canvas');
      assert(b, 'nessun canvas in #app');
      assert(b.w > 100 && b.h > 100, `canvas troppo piccolo: ${Math.round(b.w)}x${Math.round(b.h)}`);
    });

    await test('la pagina non mostra un fallback WebGL', async () => {
      const fb = await page.evaluate(() => !!document.getElementById('webgl-fallback'));
      assert(!fb, '#webgl-fallback presente: WebGL non e\' stato creato');
    });

    await test('la scena 3D produce un frame non vuoto (pixel via CDP)', async () => {
      const cdp = await ctx.newCDPSession(page);
      const { data } = await cdp.send('Page.captureScreenshot', { format: 'png' });
      await cdp.detach();
      assert(data && data.length > 5000,
        `frame sospettosamente vuoto (${data ? data.length : 0} byte): il canvas potrebbe essere nero`);
    });

    group('Pulsante start raggiungibile (regressione D29)');
    for (const [w, h] of DESKTOP_VIEWPORTS) {
      await test(`desktop ${w}x${h}: #startBtn nel viewport o su contenitore scorrevole`, async () => {
        await page.setViewportSize({ width: w, height: h });
        await page.waitForTimeout(500);
        const ss = await page.evaluate(() => {
          const el = document.getElementById('startscreen');
          const cs = getComputedStyle(el);
          return {
            overflowY: cs.overflowY,
            overflowing: el.scrollHeight > el.clientHeight,
            bodyOverflow: getComputedStyle(document.body).overflow,
          };
        });
        const b = await box(page, '#startBtn');
        assert(b, '#startBtn non trovato');
        const scrollable = ss.overflowY === 'auto' || ss.overflowY === 'scroll';
        assert(fits(b, h, w) || (scrollable && ss.overflowing),
          `a ${w}x${h} il pulsante (y=${Math.round(b.y)}..${Math.round(b.bottom)}) e' fuori dal viewport `
          + `e #startscreen non e' scrollabile (overflowY=${ss.overflowY}, `
          + `body.overflow=${ss.bodyOverflow}). L'utente non puo' avviare l'app.`);
      });
    }

    group('Avvio reale col mouse (nessun aiuto di Playwright)');
    await test('1366x768: un utente puo\' premere il pulsante col mouse', async () => {
      await page.setViewportSize({ width: 1366, height: 768 });
      await page.reload({ waitUntil: 'load' });
      await page.waitForTimeout(RENDER_WAIT);

      // Scroll col mouse come farebbe l'utente, se serve.
      await page.mouse.move(683, 400);
      for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(60); }
      await page.waitForTimeout(400);

      const b = await box(page, '#startBtn');
      assert(b, '#startBtn non trovato');
      assert(fits(b, 768, 1366),
        `dopo lo scroll il pulsante e' ancora fuori dal viewport `
        + `(y=${Math.round(b.y)}..${Math.round(b.bottom)}, viewport alto 768). Nessun modo di premerlo.`);

      // Click alle coordinate reali, NON locator.click(): quest'ultimo fa
      // scrollIntoView forzato e mascherebbe proprio il difetto da intercettare.
      await page.mouse.click(683, b.y + b.h / 2);
      await page.waitForTimeout(1500);
      const hidden = await page.evaluate(() =>
        getComputedStyle(document.getElementById('startscreen')).display === 'none');
      assert(hidden, 'il click non ha avviato la simulazione: #startscreen resta visibile');
    });

    await test('dopo l\'avvio il canvas copre l\'intera viewport', async () => {
      const b = await box(page, '#app canvas');
      assert(b, 'canvas sparito dopo l\'avvio');
      assert(fits(b, 768, 1366),
        `il canvas non riempie il viewport (${Math.round(b.w)}x${Math.round(b.h)} su 1366x768)`);
    });

    await ctx.close();

    // ===================== MOBILE =====================
    group('Overlay portrait non blocca i tap (regressione iPhone)');
    for (const [w, h] of MOBILE_VIEWPORTS) {
      await test(`mobile ${w}x${h}: il tap su #startBtn arriva al pulsante`, async () => {
        const m = await browser.newContext({
          viewport: { width: w, height: h },
          isMobile: true, hasTouch: true, deviceScaleFactor: 3,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) '
            + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        });
        const mp = await m.newPage();
        await mp.goto(url, { waitUntil: 'load' });
        await mp.waitForTimeout(RENDER_WAIT);

        // elementFromPoint: dice davvero chi riceverebbe il tap. Se un overlay
        // a schermo intero e' sopra, restituisce l'overlay, non il pulsante.
        const hit = await mp.evaluate(({ vw, vh }) => {
          const btn = document.getElementById('startBtn');
          if (!btn) return { err: '#startBtn non trovato' };
          const r = btn.getBoundingClientRect();
          const cx = r.left + r.width / 2;
          const cy = r.top + r.height / 2;
          if (cy < 0 || cy > vh) {
            return { err: `#startBtn fuori dal viewport (y=${Math.round(r.top)}..${Math.round(r.bottom)}, vh=${vh})` };
          }
          const top = document.elementFromPoint(cx, cy);
          const reaches = top === btn || (top && btn.contains(top));
          return { reaches, blocker: top ? (top.id || top.className || top.tagName) : 'null' };
        }, { vw: w, vh: h });

        assert(!hit.err, hit.err);
        assert(hit.reaches,
          `il tap su #startBtn cadrebbe su "${hit.blocker}" invece che sul pulsante. `
          + `Un overlay intercetta i tap: su iPhone l'app non si avvia.`);

        // E il tap parte davvero?
        const b = await box(mp, '#startBtn');
        await mp.touchscreen.tap(Math.round(b.x + b.w / 2), Math.round(b.y + b.h / 2));
        await mp.waitForTimeout(1500);
        const started = await mp.evaluate(() =>
          getComputedStyle(document.getElementById('startscreen')).display === 'none');
        assert(started, 'il tap non ha avviato la simulazione: #startscreen resta visibile');

        await m.close();
      });
    }

    group('Mobile: avviso portrait e\' dismissabile');
    for (const [w, h] of MOBILE_VIEWPORTS) {
      await test(`mobile ${w}x${h}: l'avviso portrait si chiude col bottone`, async () => {
        const m = await browser.newContext({
          viewport: { width: w, height: h },
          isMobile: true, hasTouch: true, deviceScaleFactor: 3,
          userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) '
            + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        });
        const mp = await m.newPage();
        await mp.goto(url, { waitUntil: 'load' });
        await mp.waitForTimeout(RENDER_WAIT);

        const state = await mp.evaluate(() => {
          const ov = document.getElementById('rotate-device-overlay');
          const btn = document.getElementById('rotate-ok-btn');
          return {
            visible: getComputedStyle(ov).display !== 'none',
            pointerEvents: getComputedStyle(ov).pointerEvents,
            hasButton: !!btn,
            coversViewport: (() => {
              const r = ov.getBoundingClientRect();
              return r.width >= innerWidth * 0.98 && r.height >= innerHeight * 0.98;
            })(),
          };
        });

        // In landscape l'avviso non deve comparire; in portrait puo' comparire
        // ma non puo' coprire tutto lo schermo.
        const isPortrait = h > w;
        if (!isPortrait) {
          assert(!state.visible, 'avviso portrait visibile in landscape');
        } else {
          assert(!state.coversViewport,
            'l\'avviso portrait copre l\'intero viewport: schermo nero e app irraggiungibile');
          assert(state.pointerEvents === 'none' || state.hasButton,
            'l\'avviso intercetta i tap e non ha un bottone per chiuderlo');
          if (state.visible && state.hasButton) {
            const b = await box(mp, '#rotate-ok-btn');
            assert(fits(b, h, w), 'il bottone "Continua" dell\'avviso non e\' raggiungibile');
            await mp.locator('#rotate-ok-btn').click();
            await mp.waitForTimeout(400);
            const dismissed = await mp.evaluate(() =>
              document.getElementById('rotate-device-overlay').classList.contains('rot-dismissed'));
            assert(dismissed, 'il bottone "Continua" non ha chiuso l\'avviso');
          }
        }
        await m.close();
      });
    }
  } catch (err) {
    fatal = (err && err.message) || String(err);
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.close();
  }

  // ---------------------------- reporter ----------------------------
  const passed = results.filter((r) => r.pass).length;
  const failed = results.length - passed;
  report.total = results.length;
  report.passed = passed;
  report.failed = failed;
  report.tests = results;
  report.fatal = fatal;

  console.log('\nTest UI eseguiti : ' + results.length);
  console.log('Passati         : ' + passed);
  console.log('Falliti         : ' + failed + '\n');

  if (failed > 0) {
    console.log('::group::Test UI falliti');
    for (const r of results.filter((x) => !x.pass)) {
      console.log('  ✗ ' + r.name);
      console.log('      ' + String(r.error).split('\n').join('\n      '));
    }
    console.log('::endgroup::');
  }
  if (fatal) console.log('::error::Esecuzione interrotta: ' + fatal);
  if (results.length === 0) console.log('::error::0 test eseguiti: non considerarlo un successo');

  try {
    fs.writeFileSync(path.join(ROOT, 'ui-test-output.json'),
      JSON.stringify(report, null, 2));
  } catch (_) { /* non fatale */ }

  process.exit(failed === 0 && !fatal && results.length > 0 ? 0 : 1);
})();
