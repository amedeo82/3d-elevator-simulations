#!/usr/bin/env node
// =========== CAPTURE VISUALS ===========
// Cattura gli screenshot della galleria (docs/images/*.webp) e la GIF demo
// (docs/images/demo.gif) mostrata in cima al README.
//
// Uso:
//   node scripts/capture-visuals.js
//
// Dipendenze (come i runner di test):
//   npm install --no-save --no-audit --no-fund playwright@1.56.0
//   npx playwright install chromium
//   ffmpeg nel PATH (per GIF e conversione WebP)
//
// Contratti rispettati:
//   - D31: mai page.screenshot() (il loop requestAnimationFrame continuo lo
//     porta in timeout) -> si usa CDP Page.captureScreenshot.
//   - Contratto 7 AGENTS.md: nessun processo Chrome dell'utente viene toccato;
//     Playwright lancia un Chromium dedicato e lo chiude con browser.close().
//   - La lingua e' fissata a it-IT via context locale (D30: la lingua di boot
//     dipende da navigator.language, non va dedotta).
//
// Cosa produce:
//   start-screen.webp  schermata di avvio (desktop 1600x900)
//   cabina.webp        vista dalla cabina verso le porte aperte (lobby)
//   pulsantiera.webp   primo piano del pannello touch in cabina
//   corridoio.webp     corridoio del piano arrivo (attico), usciti dalla cabina
//   manutenzione.webp  overlay manutenzione (Shift+M)
//   mobile.webp        corridoio su iPhone 15 Pro landscape (852x393 @3x)
//   demo.gif           sequenza: avvio -> chiamata piano -> salita -> arrivo -> uscita

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'docs', 'images');
const TMP_DIR = path.join(os.tmpdir(), 'kilo', 'capture-visuals');

// Stessi arg dei runner di test (WebGL in headless via SwiftShader).
const LAUNCH_ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.json': 'application/json',
  '.md': 'text/plain',
};

// Cadenza cattura frame GIF (ms) e risoluzione di lavoro. Le dimensioni
// devono superare `isMobileDevice()` e `isViewportMobile()`:
//   isViewportMobile: width <= 900 || height <= 500
//   isMobileDevice:   Math.min(innerWidth,innerHeight,clientWidth,...) <= 768
// 1024x800 sta sopra entrambe le soglie (1024>900, 800>500, 800>768) cosi'
// state.inputMode resta 'desktop' e i tasti 1-9 chiamano effettivamente un
// piano (su mobile sono short-circuitati, D26est).
const GIF_INTERVAL_MS = 250;
const GIF_WIDTH = 1024;
const GIF_HEIGHT = 800;

// Rotazione mouse-look: px cumulativi di movimento verso destra provati per
// inquadrare il pannello touch (parete destra della cabina, yaw -80..-90 gradi).
const PANEL_STEPS = [400, 650, 900, 1150];

function log(msg) { console.log('[capture]', msg); }

// =========== Server statico (stesso pattern dei runner di test) ===========
function startServer() {
  return new Promise((resolve, reject) => {
    const srv = http.createServer((req, res) => {
      let p = decodeURIComponent(req.url.split('?')[0]);
      if (p === '/') p = '/elevator.html';
      const fp = path.join(ROOT, p);
      if (!fp.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      if (!fs.existsSync(fp) || !fs.statSync(fp).isFile()) { res.writeHead(404); res.end(); return; }
      const ext = path.extname(fp);
      res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
      res.end(fs.readFileSync(fp));
    });
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => resolve({ srv, port: srv.address().port }));
  });
}

// =========== Cattura via CDP (D31: niente page.screenshot) ===========
// `opts.format` = 'png' | 'jpeg'. La galleria usa PNG lossless come sorgente
// per la conversione WebP; i frame della GIF usano JPEG q85 perche' SwiftShader
// + encoding PNG via base64 e' il collo di bottiglia (2s/frame a 1280x720).
function attachCdp(ctx, page, opts = {}) {
  const fmt = opts.format || 'png';
  return (async () => {
    const cdp = await ctx.newCDPSession(page);
    return async (name, dir = TMP_DIR) => {
      const args = { format: fmt };
      if (fmt === 'jpeg') args.quality = opts.quality || 85;
      const { data } = await cdp.send('Page.captureScreenshot', args);
      const ext = fmt === 'jpeg' ? '.jpg' : '.png';
      fs.writeFileSync(path.join(dir, name + ext), Buffer.from(data, 'base64'));
      log('  [shot] ' + name);
    };
  })();
}

// Cattura frame a cadenza fissa per ms millisecondi; ritorna {n, meanMs, next}.
// `start` e' l'indice iniziale per la numerazione; lo usiamo perche' la GIF
// e' costruita da piu' blocchi che scrivono in serie (f0000..fNNNNN).
async function captureFrames(shotFn, page, ms, start, prefix) {
  const ts = [];
  let i = start;
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    const a = Date.now();
    await shotFn(prefix + String(i++).padStart(4, '0'));
    ts.push(Date.now() - a);
    await page.waitForTimeout(GIF_INTERVAL_MS);
  }
  const sum = ts.reduce((x, y) => x + y, 0);
  const meanMs = ts.length ? sum / ts.length : 0;
  return { n: i - start, meanMs, next: i };
}

// Muove il mouse di dx pixel (relativi) in step dolci (rotazione camera).
// Con il pointer lock attivo il delta di movimento e' la differenza tra due
// eventi consecutivi: ricentrare il mouse ad ogni chiamata produrrebbe un
// delta negativo che annulla la rotazione appena fatta. Si tiene quindi una
// posizione assoluta monotona per pagina (le coordinate oltre il viewport
// restano valide: conta solo il delta).
function makeRotator(page) {
  let curX = null;
  return async (dx, steps = 10) => {
    const { width, height } = page.viewportSize();
    if (curX === null) curX = width / 2;
    curX += dx;
    await page.mouse.move(curX, height / 2, { steps });
  };
}

// =========== Polling DOM ===========
// `requestFloor` aggiorna #status ("In attesa" -> "Porta in chiusura" ->
// "Diretto al piano N" -> "Porte in apertura" -> "In attesa"). A fps bassi
// (SwiftShader) moveDuration=1.6+d*0.6 secondi di tempo simulato richiedono
// molto wall time a causa del clamp `dt = Math.min(0.05, ...)` (vedi
// `loop()`). Le attese fisse non funzionano: si attende che lo stato cambi.
async function waitForMoveStart(page, timeoutMs = 30000) {
  await page.waitForFunction(() => {
    const t = (document.querySelector('#status')?.textContent || '').trim();
    return /Diretto al piano|Port|chiusur|apertura/i.test(t);
  }, null, { timeout: timeoutMs });
}
async function waitForArrival(page, timeoutMs = 240000) {
  await page.waitForFunction(() => {
    const t = (document.querySelector('#status')?.textContent || '').trim();
    return /In attesa/i.test(t);
  }, null, { timeout: timeoutMs });
}
async function waitForCorridorMode(page, timeoutMs = 60000) {
  await page.waitForFunction(
    () => document.body.classList.contains('corridor-mode'),
    null, { timeout: timeoutMs }
  );
}

async function main() {
  fs.rmSync(TMP_DIR, { recursive: true, force: true });
  fs.mkdirSync(TMP_DIR, { recursive: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const { srv, port } = await startServer();
  const url = 'http://127.0.0.1:' + port + '/elevator.html';
  log('server statico su ' + url);

  const browser = await chromium.launch({ args: LAUNCH_ARGS });

  try {
    // ============ SESSIONE DESKTOP 1600x900 (galleria) ============
    const ctx = await browser.newContext({
      viewport: { width: 1600, height: 900 },
      locale: 'it-IT',
    });
    const page = await ctx.newPage();
    page.on('pageerror', (e) => log('  [pageerror] ' + e.message));
    const shot = await attachCdp(ctx, page);

    await page.goto(url, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#startBtn', { timeout: 20000 });
    await page.waitForTimeout(3000); // pre-warm shader (D36) + primo frame scena
    await shot('start-screen');

    // Avvio + skip tutorial wizard
    await page.click('#startBtn');
    await page.waitForSelector('#tt-skip', { timeout: 8000 });
    await page.click('#tt-skip');
    await page.waitForTimeout(2000);

    // Cabina: vista di default verso le porte aperte sul lobby
    await shot('cabina');

    // Pannello touch: pointer lock + rotazione monotona a destra, candidati
    // progressivi (parete destra della cabina).
    const vp = page.viewportSize();
    const rotate = makeRotator(page);
    await page.mouse.click(vp.width / 2, vp.height / 2);
    await page.waitForTimeout(400);
    let prev = 0;
    for (const cum of PANEL_STEPS) {
      await rotate(cum - prev);
      prev = cum;
      await page.waitForTimeout(350);
      await shot('panel-cand-' + cum);
    }

    // Torna verso le porte e chiama il piano 9: attico. A fps bassi
    // (SwiftShader) il movimento richiede molto wall time per via del clamp
    // dt, quindi si attende lo stato DOM invece di usare tempi fissi.
    await rotate(-prev, 14);
    await page.waitForTimeout(400);
    await page.keyboard.press('9');
    await waitForArrival(page);
    // exitCabin richiede doorsOpen + !isMoving: a volte lo status passa a
    // "In attesa" prima che `state.doorsOpen` sia effettivamente true. Si
    // clicca il bottone di uscita in loop finche' body non entra in
    // corridor-mode (gestito da refreshHudButtons).
    for (let i = 0; i < 25; i++) {
      const cls = await page.evaluate(() => {
        const b = document.querySelector('#hud-exit-btn');
        if (b) b.click();
        return document.body.className;
      });
      if (cls.includes('corridor-mode')) break;
      await page.waitForTimeout(800);
    }
    await waitForCorridorMode(page);
    await page.waitForTimeout(1200);
    await shot('corridoio');

    // Overlay manutenzione (Shift+M), poi si chiude con lo stesso toggle
    await page.keyboard.down('Shift');
    await page.keyboard.press('KeyM');
    await page.keyboard.up('Shift');
    await page.waitForTimeout(900);
    await shot('manutenzione');
    await page.keyboard.down('Shift');
    await page.keyboard.press('KeyM');
    await page.keyboard.up('Shift');

    await ctx.close();

    // ============ SESSIONE MOBILE 852x393 @3x (iPhone 15 Pro landscape) ============
    const mctx = await browser.newContext({
      viewport: { width: 852, height: 393 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      locale: 'it-IT',
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) '
        + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
    });
    const mpage = await mctx.newPage();
    mpage.on('pageerror', (e) => log('  [pageerror mobile] ' + e.message));
    const mshot = await attachCdp(mctx, mpage);

    await mpage.goto(url, { waitUntil: 'load', timeout: 30000 });
    await mpage.waitForSelector('#startBtn', { timeout: 20000 });
    await mpage.waitForTimeout(2500);
    await mpage.tap('#startBtn');
    await mpage.waitForSelector('#tt-skip', { timeout: 8000 });
    await mpage.tap('#tt-skip');
    await mpage.waitForTimeout(1500);
    // Esce dalla cabina al piano 0 (Terra) per mostrare il corridoio con
    // joystick virtuale e menu hamburger (D33, D35). Si evita il viaggio
    // completo: a piano 0 le porte sono gia' aperte e l'uscita e' istantanea,
    // senza dipendere dal dt clamp a fps bassi su mobile.
    await waitForArrival(mpage);  // status "In attesa" (idle, porte aperte)
    await mpage.waitForTimeout(500);
    const exitOk = await mpage.evaluate(() => {
      const b = document.querySelector('#hud-exit-btn');
      if (!b) return { ok: false, reason: 'no button' };
      b.click();
      return { ok: true, cls: document.body.className };
    });
    log('  [mobile exit] ' + JSON.stringify(exitOk));
    await waitForCorridorMode(mpage);
    await mpage.waitForTimeout(1500);
    await mshot('mobile');
    await mctx.close();

    // ============ SESSIONE GIF 1024x800 (demo animata) ============
    // Si usa `Page.startScreencast` di CDP per catturare frame al ritmo di
    // rendering del browser (anziche' un Page.captureScreenshot alla volta,
    // che con SwiftShader costa ~6s per frame a 1024x800). In 15-20s di
    // storia si raccolgono cosi' 50-100 frame JPEG, sufficienti per una
    // GIF a 8-10 fps fluida. L'input framerate della GIF viene impostato
    // sul ritmo reale dei frame screencast (derivato dai timestamp).
    const gctx = await browser.newContext({
      viewport: { width: GIF_WIDTH, height: GIF_HEIGHT },
      locale: 'it-IT',
    });
    const gpage = await gctx.newPage();
    gpage.on('pageerror', (e) => log('  [pageerror gif] ' + e.message));
    const gCdp = await gctx.newCDPSession(gpage);

    const framesDir = path.join(TMP_DIR, 'frames');
    fs.rmSync(framesDir, { recursive: true, force: true });
    fs.mkdirSync(framesDir, { recursive: true });

    const frameTimes = []; // timestamp CDP di ogni frame (per calcolare fps)
    let frameIdx = 0;
    // Il listener e' agganciato ora, ma startScreencast parte solo DOPO che
    // la schermata iniziale sia renderizzata (vedi sotto): cosi' il primo
    // frame della GIF e' la start screen, non un about:blank bianco.

    // Storia utente. Lo screencast parte DOPO la prima attesa cosi' il primo
    // frame catturato e' gia' la schermata iniziale (altrimenti ffmpeg
    // riceverebbe fotogrammi bianchi di about:blank prima del rendering).
    await gpage.goto(url, { waitUntil: 'load', timeout: 30000 });
    await gpage.waitForSelector('#startBtn', { timeout: 20000 });
    await gpage.waitForTimeout(2500);

    gCdp.on('Page.screencastFrame', async (ev) => {
      const buf = Buffer.from(ev.data, 'base64');
      const fn = path.join(framesDir, 'f' + String(frameIdx).padStart(5, '0') + '.jpg');
      fs.writeFileSync(fn, buf);
      frameIdx++;
      frameTimes.push(ev.metadata && ev.metadata.timestamp ? ev.metadata.timestamp : Date.now() / 1000);
      try { await gCdp.send('Page.screencastFrameAck', { sessionId: ev.sessionId }); } catch (_) {}
    });
    await gCdp.send('Page.startScreencast', { format: 'jpeg', quality: 75, everyNthFrame: 1 });
    await gpage.click('#startBtn');
    await gpage.waitForSelector('#tt-skip', { timeout: 8000 });
    await gpage.click('#tt-skip');
    await gpage.waitForFunction(() => {
      const t = (document.querySelector('#statusText')?.textContent || '').trim();
      return /In attesa/i.test(t);
    }, null, { timeout: 15000 });
    // Chiama piano 1 (viaggio breve)
    await gpage.keyboard.press('1');
    await waitForMoveStart(gpage, 30000);
    await gpage.waitForTimeout(1500);
    // Attesa arrivo (le porte si riaprono): screencast cattura l'animazione
    await waitForArrival(gpage);
    await gpage.waitForTimeout(2000);
    // Uscita in corridoio
    for (let i = 0; i < 25 && !(await gpage.evaluate(() => document.body.className.includes('corridor-mode'))); i++) {
      await gpage.evaluate(() => {
        const b = document.querySelector('#hud-exit-btn');
        if (b) b.click();
      });
      await gpage.waitForTimeout(800);
    }
    await waitForCorridorMode(gpage);
    await gpage.waitForTimeout(2500);

    try { await gCdp.send('Page.stopScreencast'); } catch (_) {}
    log('frame GIF catturati: ' + frameIdx);
    await gctx.close();

    // ============ FFMPEG: GIF + WebP ============
    // L'input framerate viene derivato dal ritmo reale dei frame screencast,
    // ma si applica un minimo di 8 fps per restare nel target "10-15 secondi"
    // del README hero (regola di visibilita' AGENTS.md). Se la cattura reale
    // e' piu' lenta, la GIF e' una versione "accelerata" della stessa storia:
    // effetto desiderato per un demo.
    let inputFps = 8;
    if (frameTimes.length >= 2) {
      const span = frameTimes[frameTimes.length - 1] - frameTimes[0];
      if (span > 0) inputFps = Math.max(8, Math.min(12, +(frameTimes.length / span).toFixed(2)));
    }
    log('GIF input framerate: ' + inputFps + ' fps (' + frameIdx + ' frame, ' + (frameIdx / inputFps).toFixed(1) + 's)');
    const palette = path.join(TMP_DIR, 'palette.png');
    execFileSync('ffmpeg', [
      '-y', '-framerate', String(inputFps),
      '-i', path.join(framesDir, 'f%05d.jpg'),
      '-vf', 'scale=640:-1:flags=lanczos,palettegen=max_colors=160:stats_mode=diff',
      palette,
    ], { stdio: 'pipe' });
    const gifPath = path.join(OUT_DIR, 'demo.gif');
    execFileSync('ffmpeg', [
      '-y', '-framerate', String(inputFps),
      '-i', path.join(framesDir, 'f%05d.jpg'),
      '-i', palette,
      '-lavfi', 'scale=640:-1:flags=lanczos [x]; [x][1:v] paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle',
      '-loop', '0', gifPath,
    ], { stdio: 'pipe' });
    log('demo.gif: ' + Math.round(fs.statSync(gifPath).size / 1024) + ' KB');

    const gallery = ['start-screen', 'cabina', 'pulsantiera', 'corridoio', 'manutenzione', 'mobile'];
    // La galleria prende il miglior candidato pannello, scelto a mano dopo
    // l'ispezione (PANEL_CAND env, default il piu' estremo).
    const panelPick = process.env.PANEL_CAND || String(PANEL_STEPS[PANEL_STEPS.length - 1]);
    const sources = {
      'start-screen': 'start-screen',
      'cabina': 'cabina',
      'pulsantiera': 'panel-cand-' + panelPick,
      'corridoio': 'corridoio',
      'manutenzione': 'manutenzione',
      'mobile': 'mobile',
    };
    for (const [out, src] of Object.entries(sources)) {
      const srcPng = path.join(TMP_DIR, src + '.png');
      const outWebp = path.join(OUT_DIR, out + '.webp');
      execFileSync('ffmpeg', [
        '-y', '-i', srcPng,
        '-c:v', 'libwebp', '-quality', '88', '-compression_level', '6',
        outWebp,
      ], { stdio: 'pipe' });
      log(out + '.webp: ' + Math.round(fs.statSync(outWebp).size / 1024) + ' KB');
    }
  } finally {
    await browser.close();
    srv.close();
  }
}

main().then(() => {
  log('OK');
  process.exit(0);
}).catch((e) => {
  console.error('[capture] FALLITO:', e && e.message ? e.message : e);
  process.exit(1);
});
