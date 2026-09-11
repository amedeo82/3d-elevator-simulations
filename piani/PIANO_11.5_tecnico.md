# Piano §11.5 — Tecnico / performance

**Riferimento**: `PIANO_MIGLIORAMENTI.md` §11.5 · **Funzionalità**: 3 · **File**: `elevator.html`, eventuali `sw.js` + `manifest.json`

Interventi tecnici su performance, persistenza e architettura.

---

## #16 — Service Worker offline-first + PWA 🟡

**Obiettivo**: l'app funziona offline dopo il primo caricamento ed è installabile come PWA.

**Approccio**: NOTA: questo rompe il vincolo "singolo file". Richiede:
- `sw.js` (~30 righe): cache strategy `cache-first` per `elevator.html`, CDN three.js
- `manifest.json` (~20 righe): icone, nome, colori
- Modifica di `elevator.html` per registrare il service worker

**File da creare**:

```js
// sw.js
const CACHE = 'boss-hotel-v1';
const ASSETS = [
  './elevator.html',
  './manifest.json',
  'https://unpkg.com/three@0.160.0/build/three.module.js',
];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)));
});
```

```json
// manifest.json
{
  "name": "BOSS HOTEL — Simulatore Ascensore 3D",
  "short_name": "Boss Elevator",
  "start_url": "./elevator.html",
  "display": "fullscreen",
  "background_color": "#000",
  "theme_color": "#000",
  "icons": [
    { "src": "icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

```html
<!-- in elevator.html, prima di </body> -->
<link rel="manifest" href="manifest.json">
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
  }
</script>
```

**Acceptance**:
- [ ] Dopo primo caricamento, disabilitare la rete e ricaricare: l'app funziona
- [ ] Lighthouse PWA score ≥ 90
- [ ] App installabile su mobile (banner A2HS)

**Effort**: ~60 righe (2 file nuovi + 5 righe in HTML) · **Rischio**: medio (cambia architettura)

**Decisione richiesta D2**: questo rompe il pattern single-file. Approvazione necessaria prima di procedere.

---

## #17 — Verifica `dispose()` dei corridoi ricostruiti 🔴

**Obiettivo**: assicurarsi che `buildCorridor()` non lasci memory leak quando ricostruisce il corridoio a ogni arrivo al piano.

**Approccio**: AUDIT prima, FIX dopo. Verificare che `buildCorridor()` faccia `dispose()` su geometrie, materiali e texture del gruppo precedente prima di crearne uno nuovo.

**Posizione codice**:
- Sezione `CORRIDOIO + ARREDI TEMATICI` (~riga 1411)

**Audit step**:

```bash
# Cerca come viene ricostruito il corridoio
grep -n "buildCorridor\|scene.remove\|dispose" elevator.html
```

```js
// ipotetico pattern attuale da verificare:
function buildCorridor(floor) {
  // 1. ricostruisce il gruppo corridoio (pareti, pavimento, soffitto)
  // 2. ricostruisce gli arredi
  // 3. aggiorna il cartello
  // ← QUI: manca dispose() del gruppo precedente?
}
```

**Modifiche attese**:

```js
// in cima a buildCorridor(), aggiungere:
function buildCorridor(floor) {
  // dispose vecchio corridoio per evitare memory leak
  if (window._corridorGroup) {
    window._corridorGroup.traverse(obj => {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
      // dispose texture se create via canvas
      if (obj.material && obj.material.map && obj.material.map.dispose) obj.material.map.dispose();
    });
    scene.remove(window._corridorGroup);
  }
  // ... resto della funzione esistente
}
// e in fondo, prima del return:
window._corridorGroup = corridorGroup; // salvataggio riferimento
```

**Acceptance**:
- [ ] Dopo 50 cambi piano (script automatico), uso memoria rimane stabile (delta < 5MB)
- [ ] Console DevTools "Memory" snapshot: nessuna crescita monotona
- [ ] Nessun errore in console dopo 50 cambi

**Test automatico**:

```js
// nella console DevTools:
const initialMem = performance.memory?.usedJSHeapSize;
for (let i = 0; i < 20; i++) {
  requestFloor(Math.floor(Math.random() * 10));
  await new Promise(r => setTimeout(r, 3000));
}
console.log('Delta:', performance.memory.usedJSHeapSize - initialMem);
```

**Effort**: ~15 righe + audit · **Rischio**: basso (è una fix), ma attenzione a non rompere riferimenti usati altrove

---

## #18 — Texture atlas / caching canvas offscreen per display touch 🟢

**Obiettivo**: il display touch ridisegna l'intero canvas (540×1100) a ogni frame sporco, anche se solo il piano corrente è cambiato.

**Approccio**: separare il rendering in 3 layer:
- **Layer statico** (cornice, header con nome hotel): disegnato 1 volta, cached offscreen
- **Layer semi-statico** (meteo, mappa edificio, griglia touch): ridisegnato solo su evento
- **Layer dinamico** (piano corrente, freccia, stato): ridisegnato a ogni frame

**Posizione codice**:
- Sezione `RENDER DEL DISPLAY TOUCH` (~riga 2456)
- Sezione `STATO` — `markDisplayDirty()` (~riga 2750)

**Modifiche**:

```js
// nuove variabili:
let displayCacheStatic = null; // OffscreenCanvas o HTMLCanvasElement cached
let displayCacheSemi = null;
let displayDirty = { semi: true, dynamic: true }; // bitfield

function rebuildStaticLayer() {
  const c = document.createElement('canvas');
  c.width = 540; c.height = 1100;
  const ctx = c.getContext('2d');
  // disegna cornice, header con nome hotel (mai cambia)
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 540, 1100);
  // ... cornice, header, ecc
  displayCacheStatic = c;
}

function rebuildSemiStaticLayer() {
  // disegna meteo, mappa edificio, griglia touch
  // ...
  displayCacheSemi = c;
}

function drawModernDisplay() {
  // compositа i 3 layer
  const ctx = displayCanvas.getContext('2d');
  ctx.drawImage(displayCacheStatic, 0, 0);
  if (displayDirty.semi) {
    rebuildSemiStaticLayer();
    displayDirty.semi = false;
  }
  ctx.drawImage(displayCacheSemi, 0, 0);
  // layer dinamico
  drawDynamic(ctx);
  displayDirty.dynamic = false;
}
```

```js
// in markDisplayDirty(), aggiungere granulare:
function markDisplayDirty(layer = 'all') {
  if (layer === 'all') { displayDirty.semi = true; displayDirty.dynamic = true; }
  else if (layer === 'semi') displayDirty.semi = true;
  else displayDirty.dynamic = true;
}
// Esempi d'uso:
// - quando cambia piano: markDisplayDirty('dynamic')
// - quando cambia meteo: markDisplayDirty('semi')
// - resize/lingua: markDisplayDirty('all')
```

**Acceptance**:
- [ ] FPS display aumenta da ~50 a ~58 in idle (solo layer dinamico)
- [ ] Visivamente identico all'attuale
- [ ] Nessun glitch durante cambio meteo

**Effort**: ~60 righe (refactor di `drawModernDisplay`) · **Rischio**: medio (refactor di una funzione complessa)

---

## Checklist comune

- [ ] Test memoria con DevTools Performance → Memory
- [ ] Test offline (DevTools → Network → Offline)
- [ ] Benchmark FPS prima/dopo con `stats.js` o contatore manuale
- [ ] Decisione D2 (single-file vs multi-file) prima di #16
- [ ] Lighthouse audit dopo #16
