// ============================================================================
// diagnose-shader.js — i blocchi sono compilazione shader?
// ============================================================================
// Dalla misura precedente (diagnose-freeze.js):
//   buildCorridor dura 6..17ms  -> NON e' la causa dei blocchi
//   ma i frame piu' lunghi sono 2121ms, 1859ms, 510ms, 451ms
//
// Quattro frame da mezzo secondo o piu', senza corrispondenza con il
// lavoro di costruzione. Ipotesi: quando il corridoio viene ricostruito
// il materiale ha un NUMERO DIVERSO DI LUCI, quindi three.js deve
// COMPILARE NUOVI PROGRAMMI SHADER. Su WebKit la compilazione e'
// sincrona e blocca il main thread per centinaia di ms. E' il meccanismo
// classico dello "stutter al cambio di scena" su iOS Safari, ed e' anche
// il meccanismo di three.js issue #22254 (luci + ombre = stutter su iOS).
//
// La verifica e' diretta: agganciamo createProgram, linkProgram, shaderSource
// e texImage2D, e registriamo QUANTI eventi di compilazione cadono in
// ciascun frame. Se i frame da 2000ms hanno dentro 3-4 compilazioni e gli
// altri ne hanno zero, la correlazione e' dimostrata e non serve tirare a
// indovinare.
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

// Sonda: per ogni frame registra durata + quante compilazioni shader e
// quanti upload di texture sono avvenuti DURANTE quel frame.
const PROBE = () => {
  const G = { frames: [], programs: 0, links: 0, shaderSrc: 0, texImage2D: 0 };
  window.__G = G;
  window.__frames = [];
  window.__batches = [];

  const P = window.WebGL2RenderingContext || window.WebGLRenderingContext;
  const bump = (k) => { G[k]++; (window.__pending = window.__pending || {}), window.__pending[k] = (window.__pending[k] || 0) + 1; };
  if (P) {
    for (const [fn, key] of [['createProgram', 'programs'], ['linkProgram', 'links'],
      ['shaderSource', 'shaderSrc'], ['texImage2D', 'texImage2D']]) {
      if (!P.prototype[fn]) continue;
      const orig = P.prototype[fn];
      P.prototype[fn] = function () { bump(key); return orig.apply(this, arguments); };
    }
  }

  let last = performance.now();
  function step(now) {
    const dt = now - last;
    last = now;
    const p = window.__pending || {};
    window.__frames.push(dt);
    // Tiene solo i frame con eventi notevoli, o i piu' lenti.
    window.__batches.push({ dt: +dt.toFixed(1), p: p.programs || 0, l: p.links || 0, s: p.shaderSrc || 0, t: p.texImage2D || 0 });
    if (window.__batches.length > 2000) { window.__batches.shift(); window.__frames.shift(); }
    window.__pending = {};
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

const SUMMARIZE = () => {
  const b = (window.__batches || []).slice();
  const f = (window.__frames || []).slice().sort((a, b2) => a - b2);
  const n = f.length;
  const p = (q) => f[Math.min(n - 1, Math.floor(n * q))] || 0;
  // I frame "con compilazione": almeno un programma o uno shader compilato.
  const compiled = b.filter((x) => x.p > 0 || x.s > 0 || x.l > 0);
  const withTex = b.filter((x) => x.t > 0);
  return {
    frames: n,
    p50: +p(0.5).toFixed(1),
    p90: +p(0.9).toFixed(1),
    p99: +p(0.99).toFixed(1),
    max: +(f[n - 1] || 0).toFixed(1),
    over100: f.filter((x) => x > 100).length,
    over500: f.filter((x) => x > 500).length,
    // Totali
    totalPrograms: window.__G.programs,
    totalLinks: window.__G.links,
    totalShaderSrc: window.__G.shaderSrc,
    totalTexImage2D: window.__G.texImage2D,
    // Frame che contengono compilazioni: quanto durano?
    framesWithCompile: compiled.length,
    compileFrame_p50: compiled.length ? +compiled.map((x) => x.dt).sort((a, c) => a - c)[Math.floor(compiled.length / 2)].toFixed(1) : null,
    compileFrame_max: compiled.length ? +Math.max(...compiled.map((x) => x.dt)).toFixed(1) : null,
    framesWithTexUpload: withTex.length,
    texFrame_max: withTex.length ? +Math.max(...withTex.map((x) => x.dt)).toFixed(1) : null,
    // Top 12 frame con il dettaglio di cosa ci stava dentro
    top12: b.slice().sort((x, y) => y.dt - x.dt).slice(0, 12)
      .map((x) => `${x.dt}ms prog=${x.p} link=${x.l} shader=${x.s} tex=${x.t}`),
  };
};

function instrument(src) {
  let out = src.replace('function buildCorridor(floor) {', 'function __buildCorridorInner(floor) {');
  const boot = 'buildCorridor(0);';
  out = out.replace(boot,
    'window.__bc = [];\n'
    + 'var buildCorridor = function (fl) {\n'
    + '  const t0 = performance.now();\n'
    + '  const r = __buildCorridorInner(fl);\n'
    + '  window.__bc.push(+(performance.now() - t0).toFixed(2));\n'
    + '  return r;\n'
    + '};\n'
    + 'buildCorridor(0);\n'
    + 'window.__requestFloor = requestFloor;\n'
    + 'window.__state = state;\n'
    + 'window.__bc.length = 0;');
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
  const file = 'zz-shader.html';
  fs.writeFileSync(path.join(ROOT, file), instrument(fs.readFileSync(path.join(ROOT, 'elevator.html'), 'utf8')));
  const { server, port } = await startServer();
  const report = { generatedAt: new Date().toISOString() };
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
    await page.goto(`http://127.0.0.1:${port}/${file}`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(RENDER_WAIT);
    await page.evaluate(() => { const b = document.getElementById('startBtn'); if (b) b.click(); });
    await page.waitForTimeout(1500);
    await page.evaluate(() => { const s = document.getElementById('tt-skip'); if (s) s.click(); });
    await page.waitForTimeout(1500);

    // Fase 1: idle. Nessun cambio piano.
    await page.evaluate(() => { window.__batches.length = 0; window.__G.programs = 0; window.__G.links = 0; window.__G.shaderSrc = 0; window.__G.texImage2D = 0; });
    await page.waitForTimeout(6000);
    report.idle = await page.evaluate(SUMMARIZE);

    // Fase 2: 5 viaggi reali, ognuno seguito da 2.5s di quiete.
    await page.evaluate(() => { window.__batches.length = 0; window.__G.programs = 0; window.__G.links = 0; window.__G.shaderSrc = 0; window.__G.texImage2D = 0; });
    for (const f of [1, 5, 2, 7, 4]) {
      await page.evaluate((fl) => window.__requestFloor(fl), f);
      await page.waitForFunction((fl) => window.__state.currentFloor === fl && !window.__state.isMoving,
        f, { timeout: 60000 }).catch(() => {});
      await page.waitForTimeout(2500);
    }
    report.trips = await page.evaluate(SUMMARIZE);
    report.buildCorridorMs = await page.evaluate(() => (window.__bc || []).slice());
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
  fs.writeFileSync(path.join(ROOT, 'safari-ios-shader.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(fatal ? 1 : 0);
})();
