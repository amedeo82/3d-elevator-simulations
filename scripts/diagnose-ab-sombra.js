// ============================================================================
// diagnose-ab-sombra.js — esperimento A/B controllato
// ============================================================================
// Domanda: quanto costa davvero la PointLight con castShadow=true?
//
// In three.js una PointLight con castShadow usa una CUBE shadow map, cioe'
// 6 render pass (le 6 facce del cubo) della scena intera per frame. Una
// DirectionalLight ne usa 1. Il progetto ha:
//
//   ceilingLight = PointLight + castShadow=true + mapSize 1024
//   -> 6 pass di rendering della scena, ogni frame
//
// Ispirato da three.js issue #22254 "Bad performance and stutters on iOS
// when using lights + shadows", chiuso come "not fixable in three.js,
// report to Apple": su iOS Safari luci + ombre causano stutter anche con
// l'FPS graph a 50+.
//
// Metodo: copiamo elevator.html in tre varianti e misuriamo le stesse
// metriche. Il confrontro e' A/B/C sulla sola variabile "castShadow".
// ============================================================================
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { webkit } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const RENDER_WAIT = 3500;
const MEASURE_MS = 4000;
const IPHONE = { width: 852, height: 393, deviceScaleFactor: 3 };
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) '
  + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

const PROBE_GL = () => {
  window.__gl = { draws: 0, programs: 0 };
  const P = window.WebGL2RenderingContext || window.WebGLRenderingContext;
  if (!P) return false;
  for (const name of ['drawElements', 'drawArrays', 'drawElementsInstanced', 'drawArraysInstanced']) {
    if (!P.prototype[name]) continue;
    const orig = P.prototype[name];
    P.prototype[name] = function () { window.__gl.draws++; return orig.apply(this, arguments); };
  }
  const op = P.prototype.createProgram;
  if (op) P.prototype.createProgram = function () { window.__gl.programs++; return op.apply(this, arguments); };
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
      const n = samples.length;
      resolve({
        fps: +(n / ((now - t0) / 1000)).toFixed(2),
        frameMs_p50: +p(samples, 0.5).toFixed(1),
        frameMs_p90: +p(samples, 0.9).toFixed(1),
        draws_p50: p(draws, 0.5),
        draws_p90: p(draws, 0.9),
        framesOver33ms: samples.filter((x) => x > 33).length,
        totalFrames: n,
      });
    }
  }
  requestAnimationFrame(step);
});

// Genera le varianti dalla sorgente, cambiando una sola variabile per volta.
function variants() {
  const src = fs.readFileSync(path.join(ROOT, 'elevator.html'), 'utf8');
  const list = [];

  // A: sorgente invariata
  list.push({ name: 'A-baseline', html: src });

  // B: PointLight cabin senza castShadow.
  // In three.js una PointLight con castShadow usa una CUBE shadow map:
  // 6 render pass (le facce del cubo) invece di 1. Ecco cosa misuriamo.
  list.push({
    name: 'B-no point-light shadow (cube map 6 facce eliminata)',
    html: src.replace('ceilingLight.castShadow = true;', 'ceilingLight.castShadow = false;'),
  });

  // C: shadowMap del tutto disattivato
  list.push({
    name: 'C-shadowMap del tutto off',
    html: src
      .replace('ceilingLight.castShadow = true;', 'ceilingLight.castShadow = false;')
      .replace('renderer.shadowMap.enabled = true;', 'renderer.shadowMap.enabled = false;'),
  });

  // D: PointLight ridotte. Nello shader fragment ogni point light attiva
  // aggiunge un contributo per-fragment su ogni pixel illuminato. 14 luci
  // e' un numero alto per un device mobile. Qui teniamo solo le 3 luci
  // cabina (le uniche che servono davvero quando si e' dentro) e spegniamo
  // quelle degli arredi corridoio.
  let d = src.replace(
    /new THREE\.PointLight\(([^)]*)\)/g,
    (m, args) => {
      // tinte le 3 luci cabina ( ceiling / fill / alarm ) per posizione
      return m; // gestito sotto
    });
  // Spegniamo per posizione: le luci arredo sono dentro gruppi con
  // intensity <= 0.6 e range corto; le distinguiamo dai nomi di variabile.
  d = d.replace('const ambientStrip = new THREE.PointLight(0xfff1c8, 0.25, 4, 2);',
    'const ambientStrip = new THREE.PointLight(0xfff1c8, 0.0, 0.0001, 2); ambientStrip.visible = false; const _as = ambientStrip;');
  d = d.replace('const camLed = new THREE.PointLight(0xff2020, 0.0, 1.0, 2);',
    'const camLed = new THREE.PointLight(0xff2020, 0.0, 0.0001, 2); camLed.visible = false;');
  // le 4 luci soffitto corridoio
  d = d.replace('const light = new THREE.PointLight(0xfff1c8, 0.5, 5, 1.5);',
    'const light = new THREE.PointLight(0xfff1c8, 0.0, 0.0001, 1.5); light.visible = false;');
  // applichiamo l'update nel loop: intensity 0 + visible false
  d = d.replace('const k = 0.5 + 0.5 * Math.sin(now * 0.012);',
    'if (state._camLed) state._camLed.intensity = 0; if (typeof ambientStrip !== "undefined") ambientStrip.intensity = 0; const k = 0.5 + 0.5 * Math.sin(now * 0.012);');
  list.push({ name: 'D-solo 3 point light cabina (14 -> 3)', html: d });

  // E: tone mapping ACESFilmico spento (costo per-fragment: curva + conversioni)
  list.push({
    name: 'E-no ACES tone mapping',
    html: src.replace('renderer.toneMapping = THREE.ACESFilmicToneMapping;', 'renderer.toneMapping = THREE.NoToneMapping;'),
  });

  // F: PBR -> Lambert. MeshStandardMaterial calcola la BRDF GGX per
  // fragment; MeshLambertMaterial e' molto piu' economico. Non e' un
  // paragone estetico equo, serve solo a quantificare quanto della fill
  // rate e' "shader troppo caro" rispetto a "troppi pixel".
  list.push({
    name: 'F-MeshStandard -> MeshLambert (costo shader, non estetico)',
    html: src.replace(/new THREE\.MeshStandardMaterial/g, 'new THREE.MeshLambertMaterial'),
  });

  // G: combinazione realistica: niente cube shadow + 3 luci + no tone mapping
  list.push({
    name: 'G-combo (no cube shadow + 3 luci + no ACES)',
    html: d
      .replace('ceilingLight.castShadow = true;', 'ceilingLight.castShadow = false;')
      .replace('renderer.toneMapping = THREE.ACESFilmicToneMapping;', 'renderer.toneMapping = THREE.NoToneMapping;'),
  });

  // Scarta le varianti la cui sostituzione non ha colpito (se la
  // sostituzione e' identica alla sorgente, la variante non testerebbe
  // niente e produrrebbe un falso "nessun effetto").
  const seen = new Set();
  return list.filter((v) => {
    if (v.html === src) { console.log('  [scartata, nessuna sostituzione] ' + v.name); return false; }
    if (seen.has(v.name)) return false;
    seen.add(v.name);
    return true;
  });
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
  const variants_ = variants();
  console.log('Varianti generate: ' + variants_.map((v) => v.name).join(' | '));
  const report = { generatedAt: new Date().toISOString(), results: [] };
  const { server, port } = await startServer();

  // Scriviamo le varianti in file temporanei serviti dallo stesso server.
  for (const v of variants_) {
    const f = 'ab-' + v.name.charAt(0) + '.html';
    fs.writeFileSync(path.join(ROOT, f), v.html);
  }

  let browser;
  let fatal = null;
  try {
    browser = await webkit.launch();
    for (const v of variants_) {
      const f = 'ab-' + v.name.charAt(0) + '.html';
      const ctx = await browser.newContext({
        viewport: { width: IPHONE.width, height: IPHONE.height },
        deviceScaleFactor: IPHONE.deviceScaleFactor,
        isMobile: true, hasTouch: true, userAgent: IOS_UA,
      });
      const page = await ctx.newPage();
      const errs = [];
      page.on('pageerror', (e) => errs.push(e.message));
      await page.addInitScript(PROBE_GL);
      await page.goto(`http://127.0.0.1:${port}/${f}`, { waitUntil: 'load', timeout: 90000 });
      await page.waitForTimeout(RENDER_WAIT);
      await page.evaluate(() => { const b = document.getElementById('startBtn'); if (b) b.click(); });
      await page.waitForTimeout(2000);
      // Skip tutorial: dispatch diretto, non click. locator/elementHandle
      // fanno stability check che fallisce se l'elemento non e' cliccabile,
      // e una variante potrebbe renderlo non cliccabile per ragioni che non
      // c'entrano con la misura.
      await page.evaluate(() => {
        const s = document.getElementById('tt-skip');
        if (s) s.click();
      });
      await page.waitForTimeout(500);
      const m = await page.evaluate(COLLECT, MEASURE_MS);
      report.results.push({ variant: v.name, ...m, pageErrors: errs });
      console.log(v.name + ' -> ' + JSON.stringify(m));
      await ctx.close();
      fs.unlinkSync(path.join(ROOT, f));
    }
  } catch (e) {
    fatal = (e && e.message) || String(e);
  } finally {
    if (browser) await browser.close().catch(() => {});
    server.close();
  }
  report.fatal = fatal;
  fs.writeFileSync(path.join(ROOT, 'safari-ios-ab.json'), JSON.stringify(report, null, 2));
  console.log('\n' + JSON.stringify(report, null, 2));
  process.exit(fatal ? 1 : 0);
})();
