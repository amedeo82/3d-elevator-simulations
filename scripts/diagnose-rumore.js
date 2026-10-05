// ============================================================================
// diagnose-rumore.js — misure con ripetizioni interleaved
// ============================================================================
// Perche' esiste questo file
// ----------------------------------------------------------------------------
// La prima passata di diagnose-ab-sombra.js ha mostrato che il baseline
// misurava 67ms in una run e 50ms in un'altra: +/-25% di rumore. Con un
// rumore cosi' grande, le differenze di ~10ms fra varianti NON sono
// significanti e riportarle come "questo fix migliora del 22%" sarebbe
// inventare un dato. AGENTS.md lo dice esplicitamente: "Prima di
// dichiarare risolto un bug: verificalo davvero" e "un runner non e' mai
// stato visto fallire non e' un runner testato".
//
// Metodo: N ripetizioni per variante, eseguite INTERLEAVED (A,B,C,A,B,C...)
// e non in blocchi (A,A,A,B,B,B). Il drift termico o di carico della
// macchina colpisce tutte le varianti allo stesso modo, quindi interlacciare
// lo cancella. Si riporta mediana E range, non solo il p50 di una run.
//
// Costo: ogni variante avvia un contesto WebKit nuovo. Sono tempi lunghi
// per scelta: meglio pochi minuti di misura che una diagnosi sbagliata.
// ============================================================================
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { webkit } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const RENDER_WAIT = 3000;
const SETTLE_MS = 1500;
const MEASURE_MS = 4000;
const REPS = 3;
const IPHONE = { width: 852, height: 393, deviceScaleFactor: 3 };
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) '
  + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const PROBE_GL = () => {
  window.__gl = { draws: 0 };
  const P = window.WebGL2RenderingContext || window.WebGLRenderingContext;
  if (!P) return false;
  for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
    if (!P.prototype[name]) continue;
    const orig = P.prototype[name];
    P.prototype[name] = function () { window.__gl.draws++; return orig.apply(this, arguments); };
  }
  return true;
};

const COLLECT = (ms) => new Promise((resolve) => {
  const samples = []; const draws = [];
  let last = performance.now(); const t0 = last;
  let lastD = window.__gl ? window.__gl.draws : 0;
  function step(now) {
    samples.push(now - last); last = now;
    if (window.__gl) { const d = window.__gl.draws - lastD; lastD = window.__gl.draws; if (d > 0) draws.push(d); }
    if (now - t0 < ms) requestAnimationFrame(step);
    else {
      samples.sort((a, b) => a - b); draws.sort((a, b) => a - b);
      const p = (arr, q) => arr[Math.min(arr.length - 1, Math.floor(arr.length * q))] || 0;
      resolve({
        frameMs_p50: +p(samples, 0.5).toFixed(1),
        draws_p50: p(draws, 0.5),
        frames: samples.length,
      });
    }
  }
  requestAnimationFrame(step);
});

function buildVariants() {
  const src = fs.readFileSync(path.join(ROOT, 'elevator.html'), 'utf8');
  const V = [];
  V.push({ id: 'A-baseline', file: 'zz-A.html', html: src });

  // B: via la cube shadow map della PointLight (6 pass invece di 1)
  const b = src.replace('ceilingLight.castShadow = true;', 'ceilingLight.castShadow = false;');
  if (b !== src) V.push({ id: 'B-no-cube-shadow', file: 'zz-B.html', html: b });

  // D: 3 point light invece di 14 (costo per-fragment)
  let d = src
    .replace('const ambientStrip = new THREE.PointLight(0xfff1c8, 0.25, 4, 2);',
      'const ambientStrip = new THREE.PointLight(0xfff1c8, 0.0, 0.0001, 2); ambientStrip.visible = false;')
    .replace('const camLed = new THREE.PointLight(0xff2020, 0.0, 1.0, 2);',
      'const camLed = new THREE.PointLight(0xff2020, 0.0, 0.0001, 2); camLed.visible = false;')
    .replace('const light = new THREE.PointLight(0xfff1c8, 0.5, 5, 1.5);',
      'const light = new THREE.PointLight(0xfff1c8, 0.0, 0.0001, 1.5); light.visible = false;');
  // neutralizza nel loop le intensita' che il progetto riassegna ogni frame
  d = d.replace('const k = 0.5 + 0.5 * Math.sin(now * 0.012);',
    'if (state._camLed) state._camLed.intensity = 0;'
    + ' if (typeof ambientStrip !== "undefined") ambientStrip.intensity = 0;'
    + ' const k = 0.5 + 0.5 * Math.sin(now * 0.012);');
  if (d !== src) V.push({ id: 'D-3-lights', file: 'zz-D.html', html: d });

  // E: via il tone mapping ACES (curva per-fragment)
  const e = src.replace('renderer.toneMapping = THREE.ACESFilmicToneMapping;', 'renderer.toneMapping = THREE.NoToneMapping;');
  if (e !== src) V.push({ id: 'E-no-ACES', file: 'zz-E.html', html: e });

  return V;
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

function stats(arr) {
  const s = arr.slice().sort((a, b) => a - b);
  const med = s[Math.floor(s.length / 2)];
  return { runs: s, median: med, min: s[0], max: s[s.length - 1] };
}

(async () => {
  const V = buildVariants();
  for (const v of V) fs.writeFileSync(path.join(ROOT, v.file), v.html);
  const { server, port } = await startServer();
  const acc = {}; for (const v of V) acc[v.id] = [];
  const drawsAcc = {}; for (const v of V) drawsAcc[v.id] = [];
  const order = [];

  let browser; let fatal = null;
  try {
    browser = await webkit.launch();
    // Interleaved: ogni ripetizione passa tutte le varianti in ordine.
    for (let rep = 0; rep < REPS; rep++) {
      for (const v of V) {
        const ctx = await browser.newContext({
          viewport: { width: IPHONE.width, height: IPHONE.height },
          deviceScaleFactor: IPHONE.deviceScaleFactor,
          isMobile: true, hasTouch: true, userAgent: IOS_UA,
        });
        const page = await ctx.newPage();
        await page.addInitScript(PROBE_GL);
        await page.goto(`http://127.0.0.1:${port}/${v.file}`, { waitUntil: 'load', timeout: 90000 });
        await page.waitForTimeout(RENDER_WAIT);
        await page.evaluate(() => {
          const b = document.getElementById('startBtn'); if (b) b.click();
        });
        await page.waitForTimeout(SETTLE_MS);
        await page.evaluate(() => { const s = document.getElementById('tt-skip'); if (s) s.click(); });
        await page.waitForTimeout(400);
        const m = await page.evaluate(COLLECT, MEASURE_MS);
        acc[v.id].push(m.frameMs_p50);
        drawsAcc[v.id].push(m.draws_p50);
        order.push(`rep${rep + 1} ${v.id}: ${m.frameMs_p50}ms (${m.draws_p50} draws)`);
        console.log(order[order.length - 1]);
        await ctx.close();
      }
    }
  } catch (err) {
    fatal = (err && err.message) || String(err);
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.close();
    for (const v of V) { try { fs.unlinkSync(path.join(ROOT, v.file)); } catch (_) {} }
  }

  const base = acc['A-baseline'] ? stats(acc['A-baseline']).median : null;
  const report = {
    generatedAt: new Date().toISOString(),
    method: `${REPS} ripetizioni interleaved per variante, 852x393, WebKit`,
    caveat: 'Playwright WebKit NON e\' Safari su iPhone: i FPS assoluti non sono '
      + 'comparabili con l\'iPhone. Valgono i CONFRONTI fra varianti a parita\' di macchina.',
    runs: order,
    summary: V.map((v) => {
      const st = stats(acc[v.id]);
      return {
        variant: v.id,
        frameMs_runs: st.runs,
        frameMs_median: st.median,
        frameMs_range: st.min + '..' + st.max,
        deltaVsBaseline_pct: base ? +(((st.median - base) / base) * 100).toFixed(1) : null,
        drawCalls: drawsAcc[v.id][0],
      };
    }),
    fatal,
  };
  fs.writeFileSync(path.join(ROOT, 'safari-ios-rumore.json'), JSON.stringify(report, null, 2));
  console.log('\n=== RIEPILOGO (mediana su ' + REPS + ' run interleaved) ===');
  for (const s of report.summary) {
    console.log(
      s.variant.padEnd(18) + ' ' + String(s.frameMs_median).padStart(6) + 'ms  '
      + 'range ' + s.frameMs_range.padEnd(14) + ' '
      + 'draws ' + String(s.drawCalls).padStart(4) + '  '
      + (s.deltaVsBaseline_pct > 0 ? '+' : '') + (s.deltaVsBaseline_pct === null ? 'n/d' : s.deltaVsBaseline_pct + '%'));
  }
  process.exit(fatal ? 1 : 0);
})();
