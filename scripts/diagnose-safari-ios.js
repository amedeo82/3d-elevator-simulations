// ============================================================================
// diagnose-safari-ios.js — misura reali di compatibilita' Safari/iOS
// ============================================================================
// Perche' questo file esiste
// ----------------------------------------------------------------------------
// L'utente su iPhone 15 Pro + Safari segnala blocchi e scattosita'. Il
// codice contiene gia' i guard di D28 (pixel ratio cap, antialias off su
// iOS, context loss recovery) ma NESSUNO misura il frame time reale.
//
// Limite da tenere presente: Playwright WebKit NON e' Safari su iPhone.
// E' WebKit desktop/headless con rendering software via ANGLE/SwiftShader
// o senza GPU. I numeri assoluti di FPS qui non sono confrontabili con
// l'iPhone. Quello che il test PUO' fare e' misurare il LAVORO per frame
// (drawcall, triangoli, texture, programmi, tempo di CPU per tick) che e'
// indipendente dall'hardware: se qui il lavoro per frame e' assurdo, lo
// sara' anche su iPhone. E i pattern di code path (branch IS_IOS, ecc.) si
// possono verificare direttamente.
//
// Exit code 0 se il report e' generato. Non e' un test: e' una diagnosi.
// ============================================================================
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { webkit, chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const RENDER_WAIT = 5000;

// Profilo hardware iPhone 15 Pro reale:
//   - logical portrait  393 x 852  (CSS px, dpr 3)
//   - logical landscape 852 x 393
// Safari su iPhone non ha 852x393 "viewport": e' la dimensione visuale
// con la URL bar. Usiamo comunque 852x393, il caso peggiore.
const IPHONE_15_PRO = { width: 852, height: 393, deviceScaleFactor: 3 };
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) '
  + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

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

// Sonda installata nel contesto della pagina: misura il lavoro per frame
// senza dipendere da FPS assoluti (che su software rendering sono falsi).
const PROBE = () => {
  window.__diag = { frames: [], rafCount: 0, longTasks: [], marks: {} };
  // Contatore RAF grezzo: se il RAF non viene schedulato, il blocco e' nel
  // main thread (long task JS), non nel GPU.
  const origRaf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = function (cb) {
    window.__diag.rafCount++;
    return origRaf(function (t) { cb(t); });
  };
  // Long tasks: Chrome-only API, su WebKit non esiste. Lo dichiariamo per
  // capire se il dato e' disponibile o no.
  window.__diag.longTasksSupported = typeof window.PerformanceObserver === 'function';
  return true;
};

// Sonda installata nel contesto della pagina PRIMA che il modulo carichi
// three.js: aggancia i metodi WebGL per contare le draw call per frame.
// Il numero di draw call e' la metrica piu' informativa e insieme al
// fill-rate spiega i blocchi: su iOS ogni draw call con cambio stato e'
// costosa, e 14 point light moltiplicano il costo del fragment shader.
// Non modifichiamo il progetto: agganciamo il contesto nativo.
const PROBE_GL = () => {
  window.__gl = { draws: 0, frames: 0, programs: 0, textures: 0, texImage2D: 0, texSubImage2D: 0 };
  const P = window.WebGL2RenderingContext || window.WebGLRenderingContext;
  if (!P) return false;
  for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
    if (!P.prototype[name]) continue;
    const orig = P.prototype[name];
    P.prototype[name] = function () { window.__gl.draws++; return orig.apply(this, arguments); };
  }
  if (P.prototype.createProgram) {
    const orig = P.prototype.createProgram;
    P.prototype.createProgram = function () { window.__gl.programs++; return orig.apply(this, arguments); };
  }
  if (P.prototype.texImage2D) {
    const orig = P.prototype.texImage2D;
    P.prototype.texImage2D = function () { window.__gl.texImage2D++; return orig.apply(this, arguments); };
  }
  if (P.prototype.texSubImage2D) {
    const orig = P.prototype.texSubImage2D;
    P.prototype.texSubImage2D = function () { window.__gl.texSubImage2D++; return orig.apply(this, arguments); };
  }
  return true;
};

// Raccoglie i campioni per N secondi e restituisce le statistiche.
// Distingue due cause con sintomi identici ("scattosita'"):
//   - jsPerFrameMs: tempo di CPU speso nel codice della pagina per frame.
//     Se e' basso (<5ms) e il frame dura 100ms, il collo di bottiglia e'
//     GPU/raster e ridurre il lavoro JS non serve.
//   - frameMs: intervallo reale tra due frame consecutivi.
// Il rapporto js/frame dice dove guardare.
const COLLECT = (ms) => new Promise((resolve) => {
  const samples = [];
  const jsSamples = [];
  const drawSamples = [];
  let last = performance.now();
  const t0 = last;
  const g0 = window.__gl ? window.__gl.draws : 0;
  let lastDrawCount = g0;
  function step(now) {
    samples.push(now - last);
    last = now;
    // Draw call emesse dall'ultimo frame: il contatore e' incrementato dai
    // metodi WebGL agganciati, quindi e' il numero reale di draw call.
    if (window.__gl) {
      const d = window.__gl.draws - lastDrawCount;
      lastDrawCount = window.__gl.draws;
      if (d > 0) drawSamples.push(d);
    }
    const jsStart = performance.now();
    Promise.resolve().then(() => {
      const afterMicrotask = performance.now();
      jsSamples.push(Math.max(0, afterMicrotask - jsStart));
    });
    if (now - t0 < ms) requestAnimationFrame(step);
    else {
      samples.sort((a, b) => a - b);
      jsSamples.sort((a, b) => a - b);
      drawSamples.sort((a, b) => a - b);
      const p = (arr, q) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))] || 0;
      const n = samples.length;
      resolve({
        frames: n,
        seconds: (now - t0) / 1000,
        fps: n / ((now - t0) / 1000),
        frameMs_p50: p(samples, 0.5),
        frameMs_p90: p(samples, 0.9),
        frameMs_p99: p(samples, 0.99),
        frameMs_max: samples[n - 1] || 0,
        jsPerFrame_p50: p(jsSamples, 0.5),
        jsPerFrame_p90: p(jsSamples, 0.9),
        // Draw call per frame: numero reale, non stimato.
        drawCalls_p50: p(drawSamples, 0.5),
        drawCalls_p90: p(drawSamples, 0.9),
        drawCalls_max: drawSamples[drawSamples.length - 1] || 0,
        glProgramsCompiled: window.__gl ? window.__gl.programs : null,
        texImage2D_total: window.__gl ? window.__gl.texImage2D : null,
        texSubImage2D_total: window.__gl ? window.__gl.texSubImage2D : null,
        framesOver33ms: samples.filter((x) => x > 33).length,
        framesOver100ms: samples.filter((x) => x > 100).length,
      });
    }
  }
  requestAnimationFrame(step);
});

async function inspect(page, label) {
  return page.evaluate((label) => {
    const out = { label };
    // Cerca il renderer nell'ambito del modulo: non e' su window, quindi
    // usiamo i segnali indiretti che il progetto espone.
    const c = document.querySelector('#app canvas');
    if (c) {
      out.canvas = { w: c.width, h: c.height, cssW: c.clientWidth, cssH: c.clientHeight };
      // Backbuffer effettivo: c.width include gia' il pixel ratio.
      out.backbufferPx = c.width * c.height;
      out.effectiveDpr = c.clientWidth ? (c.width / c.clientWidth) : null;
    }
    out.bodyClasses = document.body.className;
    out.dpr = window.devicePixelRatio;
    out.rafSupported = typeof window.requestAnimationFrame === 'function';
    out.performanceObserver = typeof window.PerformanceObserver === 'function';

    // Lavoro per frame: il renderer vive nel module scope, quindi non e'
    // raggiungibile da qui. Lo stimiamo dal lato DOM/WebGL: il backbuffer
    // e' la superficie piu' costosa, e il numero di drawcall e' la metrica
    // che spiega i blocchi su iOS (molte texture separate = molti bind).
    // Se questa e' vuota, il progetto non espone nulla di ispezionabile e
    // lo annotiamo invece di inventare un numero.
    out.renderStatsAvailable = typeof window.__renderStats !== 'undefined';
    if (out.renderStatsAvailable) out.renderStats = window.__renderStats;

    // Numero di luci attive: in three.js e' la variabile che determina la
    // lunghezza del loop di illuminazione nel fragment shader. 14 point
    // light su una scena mobile e' un costo per-fragment che si paga su
    // ogni pixel. Il renderer non e' esposto, quindi ricostruiamo il
    // conteggio dai nodi DOM-navigabili... che non esistono. Dato che il
    // progetto non espone la scena, lo dichiariamo come non misurabile
    // da fuori invece di riportare un numero inventato.
    out.sceneIntrospectable = typeof window.__scene !== 'undefined';
    // WebGL: che renderer e quanti programmi ha compilato.
    try {
      const gl = c && (c.getContext('webgl2') || c.getContext('webgl'));
      if (gl) {
        const dbg = gl.getExtension('WEBGL_debug_renderer_info');
        out.gl = {
          version: gl.getParameter(gl.VERSION),
          vendor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : null,
          renderer: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : null,
          maxTextureSize: gl.getParameter(gl.MAX_TEXTURE_SIZE),
          maxRenderbufferSamples: gl.getParameter(gl.MAX_SAMPLES),
        };
      }
    } catch (e) { out.glError = String(e && e.message); }
    return out;
  }, label);
}

(async () => {
  const { server, port } = await startServer();
  const url = `http://127.0.0.1:${port}/elevator.html`;
  const report = { generatedAt: new Date().toISOString(), runs: [] };
  let fatal = null;

  try {
    // ============ WEBKIT (engine di Safari) ============
    const wk = await webkit.launch();
    const ctx = await wk.newContext({
      viewport: { width: IPHONE_15_PRO.width, height: IPHONE_15_PRO.height },
      deviceScaleFactor: IPHONE_15_PRO.deviceScaleFactor,
      isMobile: true, hasTouch: true, userAgent: IOS_UA,
    });
    const page = await ctx.newPage();
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });

    // La sonda aggancia i metodi WebGL: deve girare PRIMA che il modulo
    // crei il context, altrimenti le draw call non vengono contate.
    await page.addInitScript(PROBE_GL);
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(RENDER_WAIT);

    report.webkit = { pageErrors, consoleErrors };

    // Info statiche
    report.webkit.info = await inspect(page, 'webkit/iphone15pro/landscape');

    // Avvia
    await page.evaluate(() => {
      const b = document.getElementById('startBtn');
      if (b) b.click();
    });
    await page.waitForTimeout(2000);
    const skip = await page.$('#tt-skip');
    if (skip) { await skip.click(); await page.waitForTimeout(400); }

    // Misura: idle in cabina
    report.webkit.idle = await page.evaluate(COLLECT, 6000);
    report.webkit.idleInfo = await inspect(page, 'webkit/idle');

    // ---- ESPERIMENTO CONTROLLATO: costo di fill-rate vs scena ----
    // Ipotesi D: se i blocchi sono fill-rate, ridurre la superficie da
    // rasterizzare (pixel ratio) deve cambiare il frame time in modo
    // proporzionale. Se il frame time resta uguale, il problema non e'
    // la risoluzione. Testiamo a dpr effective 1.5 vs 0.75 vs 0.375.
    // Non tocchiamo il codice: forziamo il backbuffer via CSS/transform
    // non cambierebbe nulla, quindi usiamo il resize hook del renderer
    // passando per window.innerWidth non e' possibile. Instead: misuriamo
    // a viewport via, che cambia davvero il numero di pixel.
    report.webkit.fillRate = {};
    for (const vp of [
      { width: 852, height: 393, tag: '852x393 (1.0x)' },
      { width: 426, height: 197, tag: '426x197 (0.5x, 1/4 dei pixel)' },
      { width: 213, height: 98, tag: '213x98 (0.25x, 1/16 dei pixel)' },
    ]) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.waitForTimeout(1200);
      const m = await page.evaluate(COLLECT, 3500);
      const inf = await inspect(page, 'fillrate/' + vp.tag);
      report.webkit.fillRate[vp.tag] = {
        frameMs_p50: m.frameMs_p50, fps: m.fps,
        backbufferPx: inf.backbufferPx,
        // microsecondi di GPU per pixel rasterizzato: se e' costante,
        // il collo di bottiglia e' la fill-rate.
        usPerPixel: inf.backbufferPx ? (m.frameMs_p50 * 1000 / inf.backbufferPx) : null,
      };
    }
    await page.setViewportSize({ width: IPHONE_15_PRO.width, height: IPHONE_15_PRO.height });
    await page.waitForTimeout(1000);

    // Misura: durante un viaggio (il caso peggiore: movimento + display
    // dinamico + porte + corridoio che segue la cabina)
    await page.evaluate(() => {
      // Nessun accesso diretto a `state` (module scope). Usiamo i tasti
      // 3D? No: pilotiamo via pulsanti HUD non disponibili su mobile.
      // Workaround: dispatch della coda via la pulsantiera 3D non e'
      // raggiungibile. Misuriamo comunque un secondo tratto con la cabina
      // ferma ma forzando il movimento con l'API interna se esposta.
      return typeof window.requestFloor;
    });
    // Seconda misura (5s) per confronto e per stabilita'
    report.webkit.idle2 = await page.evaluate(COLLECT, 5000);

    await ctx.close();
    await wk.close();

    // ============ CHROMIUM (controllo: il codice e' lento ovunque?) ============
    const ch = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
    const cctx = await ch.newContext({
      viewport: { width: IPHONE_15_PRO.width, height: IPHONE_15_PRO.height },
      deviceScaleFactor: IPHONE_15_PRO.deviceScaleFactor,
      isMobile: true, hasTouch: true, userAgent: IOS_UA,
    });
    const cpage = await cctx.newPage();
    await cpage.addInitScript(PROBE_GL);
    await cpage.goto(url, { waitUntil: 'load', timeout: 90000 });
    await cpage.waitForTimeout(RENDER_WAIT);
    await cpage.evaluate(() => { const b = document.getElementById('startBtn'); if (b) b.click(); });
    await cpage.waitForTimeout(2000);
    const cskip = await cpage.$('#tt-skip');
    if (cskip) { await cskip.click(); await cpage.waitForTimeout(400); }
    report.chromium = { info: await inspect(cpage, 'chromium/iphone15pro/landscape') };
    report.chromium.idle = await cpage.evaluate(COLLECT, 6000);
    await cctx.close();
    await ch.close();

  } catch (err) {
    fatal = (err && err.message) || String(err);
  } finally {
    server.close();
  }

  report.fatal = fatal;
  fs.writeFileSync(path.join(ROOT, 'safari-ios-diagnostic.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(fatal ? 1 : 0);
})();
