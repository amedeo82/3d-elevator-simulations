// ============================================================================
// diagnose-freeze.js — misura del costo di buildCorridor (i "blocchi")
// ============================================================================
// La scattosita' e il blocco sono due sintomi diversi con cause diverse:
//
//   scattosita' = frame time alto ma regolare  -> fill-rate (vedi
//                 diagnose-rumore.js)
//   blocco      = un singolo frame lunghissimo -> lavoro sincrono nel
//                 main thread
//
// Il sospetto per i blocchi: buildCorridor(floor) viene chiamata a OGNI
// arrivo (riga ~9859) ed e' completamente sincrona. Distrugge il corridoio
// e ne ricostruisce 30-50 mesh, texture procedurali, luci e merge. Tutto
// dentro un unico frame: l'utente vede un freeze di centinaia di ms.
//
// Metodo: NON tocchiamo elevator.html. Generiamo una variante strumentata
// che (a) avvolge buildCorridor con un timer, (b) espone un ponte per
// pilotare il cambio piano, e (c) registra in window.__bc un array di
// durate. Poi pilotiamo la ricostruzione e leggiamo i numeri.
// ============================================================================
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { webkit } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css' };
const RENDER_WAIT = 4000;
const IOS_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) '
  + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

// Sonda: registra TUTTI i frame lunghi (>16ms) con la loro durata, cosi'
// vediamo i "blocchi" separati dalla normale scattosita'.
const PROBE = () => {
  window.__frames = [];
  let last = performance.now();
  function step(now) {
    window.__frames.push(now - last);
    if (window.__frames.length > 3000) window.__frames.shift();
    last = now;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
};

// Riassumi: quanti frame oltre soglie, e i piu' lunghi in assoluto.
const SUMMARIZE = () => {
  const f = (window.__frames || []).slice().sort((a, b) => a - b);
  const n = f.length;
  const p = (q) => f[Math.min(n - 1, Math.floor(n * q))] || 0;
  const long = f.filter((x) => x > 100);
  return {
    frames: n,
    p50: +p(0.5).toFixed(1),
    p90: +p(0.9).toFixed(1),
    p99: +p(0.99).toFixed(1),
    max: +(f[n - 1] || 0).toFixed(1),
    // "Blocchi" = frame > 100ms: l'utente li percepisce come freeze.
    framesOver100ms: long.length,
    framesOver200ms: f.filter((x) => x > 200).length,
    framesOver500ms: f.filter((x) => x > 500).length,
    top10: f.slice(-10).reverse().map((x) => +x.toFixed(1)),
  };
};

function instrument(src) {
  let out = src;

  // 1) Timer attorno a buildCorridor: la rinominiamo per poterla
  //    avvolgere. La funzione interna mantiene il corpo identico.
  const anchor = 'function buildCorridor(floor) {';
  if (out.indexOf(anchor) === -1) throw new Error('ancora buildCorridor non trovata');
  out = out.replace(anchor, 'function __buildCorridorInner(floor) {');
  // chiude la funzione originale: inseriamo il wrapper subito dopo.
  // Individuiamo la fine approssimativa inserendo il wrapper all'AVVIO
  // del modulo, che e' dopo tutte le definizioni: li' bindiamo il nome.
  out = out.replace('buildCorridor(0);',
    'window.__bc = [];\n'
    + 'buildCorridor = function (floor) {\n'
    + '  const t0 = performance.now();\n'
    + '  const r = __buildCorridorInner(floor);\n'
    + '  window.__bc.push(performance.now() - t0);\n'
    + '  return r;\n'
    + '};\n'
    + 'buildCorridor(0);');

  // 2) UNA sola sostituzione per avvolgimento + ponte di test.
  //    String.replace rimpiazza la PRIMA occorrenza: se il testo che
  //    inserisco contiene a sua volta 'buildCorridor(0);', la sostituzione
  //    successiva colpirebbe quella e non quella vera. E' successo al primo
  //    tentativo, e il risultato era "nessun freeze" mentre il freeze
  //    c'era: una sonda che misura niente e lo dichiara assente.
  const boot = 'buildCorridor(0);';
  if (out.indexOf(boot) === -1) throw new Error('ancora buildCorridor(0) non trovata');
  out = out.replace(boot,
    'window.__bc = [];\n'
    // `var` e' obbligatorio: rinominando la function declaration abbiamo
    // eliminato l'unico binding `buildCorridor`, e dentro un module (che
    // e' sempre strict mode) assegnare a un nome non dichiarato lancia
    // ReferenceError. Il sintomo era subdolo: la pagina sembrava viva ma
    // window.BossHotelPure era undefined, cioe' il modulo era abortito.
    + 'var buildCorridor = function (fl) {\n'
    + '  const t0 = performance.now();\n'
    + '  const r = __buildCorridorInner(fl);\n'
    + '  window.__bc.push(+(performance.now() - t0).toFixed(2));\n'
    + '  return r;\n'
    + '};\n'
    + 'buildCorridor(0);\n'
    // Il percorso REALE dell'utente non e' il teletrasporto (che richiede
    // maintenanceMode) ma l'arrivo a piano durante un viaggio: e' li' che
    // buildCorridor gira, a riga ~9859 dentro tickMove. Pilotiamo quello,
    // altrimenti misuriamo un percorso che l'utente non usa mai.
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
  const src = fs.readFileSync(path.join(ROOT, 'elevator.html'), 'utf8');
  const file = 'zz-freeze.html';
  fs.writeFileSync(path.join(ROOT, file), instrument(src));
  const { server, port } = await startServer();
  const report = { generatedAt: new Date().toISOString() };
  let browser; let fatal = null;

  try {
    browser = await webkit.launch();
    const ctx = await browser.newContext({
      viewport: { width: 852, height: 393 },
      deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: IOS_UA,
    });
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(e.message));
    await page.addInitScript(PROBE);
    await page.goto(`http://127.0.0.1:${port}/${file}`, { waitUntil: 'load', timeout: 90000 });
    await page.waitForTimeout(RENDER_WAIT);

    // Guardia D30: se il modulo e' abortito, la pagina sembra viva ma non
    // c'e' piu' nessun codice applicativo. Senza questo controllo una
    // sonda rotta riporta "nessun freeze" invece di "non ho misurato
    // niente", che e' il falso verde peggiore.
    report.moduleAlive = await page.evaluate(() => ({
      bossHotelPure: typeof window.BossHotelPure,
      requestFloor: typeof window.__requestFloor,
      state: typeof window.__state,
      bc: Array.isArray(window.__bc),
    }));
    if (report.moduleAlive.bossHotelPure !== 'object' || report.moduleAlive.requestFloor !== 'function') {
      throw new Error('modulo abortito: ' + JSON.stringify(report.moduleAlive)
        + ' pageErrors=' + JSON.stringify(errs));
    }
    await page.evaluate(() => { const b = document.getElementById('startBtn'); if (b) b.click(); });
    await page.waitForTimeout(1500);
    await page.evaluate(() => { const s = document.getElementById('tt-skip'); if (s) s.click(); });
    await page.waitForTimeout(1500);

    // Linea di base: 4s di attesa, nessun cambio piano.
    report.baseline = await page.evaluate(SUMMARIZE);
    report.buildCorridorStartupMs = await page.evaluate(() => (window.__bc || []).slice());

    // Ora 4 viaggi reali (0->1->5->2->7). buildCorridor gira all'ARRIVO,
    // quindi aspettiamo che il viaggio finisca prima di leggere. Il
    // teletrasporto e' scartato perche' richiede maintenanceMode e non e'
    // il percorso che l'utente vive.
    await page.evaluate(() => { window.__frames.length = 0; });
    const trips = [1, 5, 2, 7];
    for (const f of trips) {
      await page.evaluate((fl) => window.__requestFloor(fl), f);
      // Attesa attiva: non si assume una durata di viaggio, si aspetta
      // che la cabina sia ferma al piano richiesto.
      const arrived = await page.waitForFunction(
        (fl) => window.__state.currentFloor === fl && !window.__state.isMoving,
        f, { timeout: 60000 },
      ).then(() => true).catch(() => false);
      report['arrived_' + f] = arrived;
      await page.waitForTimeout(800);
    }
    await page.waitForTimeout(800);

    report.afterMoves = await page.evaluate(SUMMARIZE);
    report.buildCorridorDurationsMs = await page.evaluate(() => (window.__bc || []).slice());
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
  fs.writeFileSync(path.join(ROOT, 'safari-ios-freeze.json'), JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  process.exit(fatal ? 1 : 0);
})();
