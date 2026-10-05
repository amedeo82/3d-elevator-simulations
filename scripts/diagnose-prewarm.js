// ============================================================================
// diagnose-prewarm.js — il fix "precompila i 4 temi" funziona?
// ============================================================================
// Diagnosi (diagnose-shader.js): i blocchi di 0.4-2.4s sono compilazione
// shader sincrona. Al cambio piano buildCorridor crea materiali con un
// numero diverso di luci, three.js non trova il programma in cache e
// compila 8 programmi nuovi, bloccando il main thread.
//
// Fix candidato: PRE-COMPILE i 4 temi durante l'avvio (mentre l'utente
// legge la start screen) invece che al primo arrivo.
//
// Prima di proporlo va verificato che la cache funzioni davvero: se
// three.js riusa i programmi gia' compilati, allora tornare a un piano
// gia' visitato NON deve ricompilare. Se invece ricompila sempre, il
// pre-warm non serve e il fix e' un altro.
//
// Test: 0 -> 1 -> 2 -> 1 -> 2 -> 1. Compilazioni per arrivo:
//   primo arrivo a un piano  = deve compilare (cache fredda)
//   ritorno a un piano gia' visto = NON deve compilare, se la cache funziona
// ============================================================================
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { webkit } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const RENDER_WAIT = 5000;
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) '
  + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const PROBE = () => {
  const G = { programs: 0, links: 0 };
  window.__G = G;
  window.__pending = { programs: 0, links: 0 };
  const P = window.WebGL2RenderingContext || window.WebGLRenderingContext;
  if (P) {
    for (const [fn, key] of [['createProgram', 'programs'], ['linkProgram', 'links']]) {
      if (!P.prototype[fn]) continue;
      const orig = P.prototype[fn];
      P.prototype[fn] = function () { G[key]++; window.__pending[key]++; return orig.apply(this, arguments); };
    }
  }
  window.__log = [];
  let last = performance.now();
  function step(now) {
    const dt = now - last; last = now;
    const p = window.__pending;
    if (p.programs > 0 || dt > 100) {
      window.__log.push({ dt: +dt.toFixed(1), programs: p.programs });
    }
    window.__pending = { programs: 0, links: 0 };
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

function instrument(src) {
  let out = src.replace('function buildCorridor(floor) {', 'function __buildCorridorInner(floor) {');
  out = out.replace('buildCorridor(0);',
    'var buildCorridor = function (fl) { return __buildCorridorInner(fl); };\n'
    + 'buildCorridor(0);\n'
    + 'window.__requestFloor = requestFloor;\n'
    + 'window.__state = state;\n'
    + 'window.__buildCorridor = buildCorridor;\n'
    + 'window.__mark = function (tag) { window.__G.programs = 0; window.__log = []; window.__tag = tag; };\n'
    + 'window.__read = function () { return { tag: window.__tag, programs: window.__G.programs, log: window.__log.slice() }; };');
  return out;
}

function startServer() {
  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const target = path.resolve(ROOT, '.' + (rel === '/' ? '/elevator.html' : rel));
      if (target !== ROOT && !target.startsWith(ROOT + path.sep)) { res.writeHead(403).end(); return; }
      if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { res.writeHead(404).end(); return; }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(target)] || 'application/octet-stream' });
      res.end(fs.readFileSync(target));
    });
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

(async () => {
  const file = 'zz-prewarm.html';
  fs.writeFileSync(path.join(ROOT, file), instrument(fs.readFileSync(path.join(ROOT, 'elevator.html'), 'utf8')));
  const { server, port } = await startServer();
  const report = { generatedAt: new Date().toISOString(), arrivals: [] };
  let browser; let fatal = null;

  try {
    browser = await webkit.launch();
    const ctx = await browser.newContext({
      viewport: { width: 852, height: 393 }, deviceScaleFactor: 3,
      isMobile: true, hasTouch: true, userAgent: IOS_UA,
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.addInitScript(PROBE);
    // D36-EXPERIMENT: attiva la modalita' "non disporre i materiali"
    // per verificare se la cache dei programmi three.js sopravvive.
    await page.addInitScript(() => { window.__D36_NO_DISPOSE = true; });
    await page.goto(`http://127.0.0.1:${port}/${file}`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(RENDER_WAIT);
    await page.evaluate(() => { const b = document.getElementById('startBtn'); if (b) b.click(); });
    await page.waitForTimeout(1500);
    await page.evaluate(() => { const s = document.getElementById('tt-skip'); if (s) s.click(); });
    await page.waitForTimeout(1500);

    // Sequenza: piano 1, 2, poi torniamo a 1, 2, 1.
    // Il punto e' il PROGRAMMA compilato all'ARRIVO a ciascun piano.
    const seq = [1, 2, 1, 2, 1];
    for (const f of seq) {
      await page.evaluate(() => window.__mark('prima di partire'));
      await page.evaluate((fl) => window.__requestFloor(fl), f);
      await page.waitForFunction((fl) => window.__state.currentFloor === fl && !window.__state.isMoving,
        f, { timeout: 60000 }).catch(() => {});
      // 1.5s di quiete: la compilazione avviene all'arrivo, non durante
      // il viaggio (dove la scena non cambia).
      await page.waitForTimeout(1500);
      const r = await page.evaluate(() => window.__read());
      const worst = r.log.reduce((m, x) => Math.max(m, x.dt), 0);
      report.arrivals.push({
        floor: f,
        programsCompiled: r.programs,
        worstFrameMs: worst,
        longFrames: r.log.filter((x) => x.dt > 100).length,
      });
      console.log(`arrivo a piano ${f}: programmi=${r.programs} worstFrame=${worst}ms`);
    }
    report.pageErrors = errs;
    await ctx.close();
  } catch (e) {
    fatal = (e && e.message) || String(e);
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.close();
    try { fs.unlinkSync(path.join(ROOT, file)); } catch (_) {}
  }
  report.fatal = fatal;
  fs.writeFileSync(path.join(ROOT, 'safari-ios-prewarm.json'), JSON.stringify(report, null, 2));
  console.log('\n' + JSON.stringify(report.arrivals, null, 2));
  console.log('\nInterpretazione: se il ritorno a un piano gia\' visitato compila 0');
  console.log('programmi, la cache dei programmi funziona e il pre-warm dei 4 temi');
  console.log('all\'avvio elimina i blocchi.');
  process.exit(fatal ? 1 : 0);
})();
