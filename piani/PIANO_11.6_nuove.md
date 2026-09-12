# Piano §11.6 — Idee nuove

**Riferimento**: `PIANO_MIGLIORAMENTI.md` §11.6 · **Funzionalità**: 4 · **File**: `elevator.html`

Idee non presenti nel backlog originale §9. Sono le più "creative" del set.

> Nota: il backlog originale del documento `PIANO_MIGLIORAMENTI.md` ha 5 gruppi numerati (§11.1–§11.5). Questo documento copre il sesto gruppo (§11.6 "Idee nuove") che ho aggiunto durante la brainstorming iniziale.

---

## #19 — Modalità manutentore 🟢

**Obiettivo**: overlay nascosto per sviluppatori con statistiche FPS, draw calls, posizione camera, e teletrasporto tra piani.

**Approccio**: tasto segreto `Shift+M` toggle un pannello DOM in alto a sinistra. `1`–`9` teletrasportano quando attivo.

**Posizione codice**:
- Sezione `HTML body` (inizio file) — aggiungere `<div id="debugPanel">`
- Sezione `LISTENERS TASTIERA` (~riga 3278)
- Sezione `LOOP` (~riga 3378)

**Modifiche**:

```html
<!-- in HUD overlay, prima di </body> -->
<div id="debugPanel" style="display:none; position:fixed; left:14px; top:14px;
  background:rgba(0,0,0,0.8); border:1px solid #0f0; color:#0f0;
  font:11px monospace; padding:10px; min-width:240px; z-index:10;
  border-radius:6px;">
  <div>FPS: <span id="dbgFps">--</span></div>
  <div>Draw calls: <span id="dbgDraws">--</span></div>
  <div>Tris: <span id="dbgTris">--</span></div>
  <div>Camera: <span id="dbgCam">--</span></div>
  <div>Floor: <span id="dbgFloor">--</span></div>
  <div>Moving: <span id="dbgMoving">--</span></div>
  <div>Passengers: <span id="dbgPax">--</span></div>
  <div>Weather: <span id="dbgWeather">--</span></div>
  <div style="margin-top:8px; opacity:0.6">Shift+M to hide · 1-9 to teleport</div>
</div>
```

```js
// nuove variabili:
let debugMode = false;
let fpsCounter = { last: performance.now(), frames: 0, value: 0 };
let rendererInfo = null; // popolato dopo renderer setup

// listener Shift+M:
window.addEventListener('keydown', (e) => {
  if (e.shiftKey && e.key.toLowerCase() === 'm') {
    debugMode = !debugMode;
    document.getElementById('debugPanel').style.display = debugMode ? 'block' : 'none';
  }
  // teletrasporto quando debug attivo
  if (debugMode && !e.ctrlKey && !e.altKey) {
    if (e.key >= '1' && e.key <= '9') {
      const f = parseInt(e.key);
      if (!state.isMoving) {
        // teleport istantaneo
        cabin.position.y = f * FLOOR_HEIGHT;
        state.currentFloor = f;
        updateFloorDisplay();
        buildCorridor(f);
      }
    }
  }
});

// nel LOOP:
fpsCounter.frames++;
if (performance.now() - fpsCounter.last > 500) {
  fpsCounter.value = Math.round(fpsCounter.frames * 1000 / (performance.now() - fpsCounter.last));
  fpsCounter.frames = 0;
  fpsCounter.last = performance.now();
}
if (debugMode) updateDebugPanel();
```

```js
// nuova funzione:
function updateDebugPanel() {
  document.getElementById('dbgFps').textContent = fpsCounter.value;
  document.getElementById('dbgFloor').textContent = state.currentFloor === 0 ? 'T' : state.currentFloor;
  document.getElementById('dbgMoving').textContent = state.isMoving ? 'YES' : 'no';
  document.getElementById('dbgPax').textContent = state.passengers;
  document.getElementById('dbgWeather').textContent = `${weather.temp}° ${weather.icon}`;
  document.getElementById('dbgCam').textContent =
    `x:${camera.position.x.toFixed(2)} y:${camera.position.y.toFixed(2)} z:${camera.position.z.toFixed(2)}`;
  // renderer info (Three.js r160+):
  if (renderer.info) {
    document.getElementById('dbgDraws').textContent = renderer.info.render.calls;
    document.getElementById('dbgTris').textContent = renderer.info.render.triangles;
  }
}
```

**Acceptance**:
- [ ] `Shift+M` mostra/nasconde il pannello
- [ ] FPS si aggiorna ogni 500ms
- [ ] `1`–`9` in modalità debug teletrasportano la cabina
- [ ] Pannello si chiude con ESC o Shift+M
- [ ] Teletrasporto non funziona durante movimento (no glitch)

**Effort**: ~70 righe + HTML · **Rischio**: basso (solo overlay, non tocca logica core)

---

## #20 — Sistema di "prenotazione cabina" dal corridoio 🟡

**Obiettivo**: quando sei nel corridoio e ti avvicini alle porte della cabina, queste si aprono automaticamente + display mostra "PRENOTATA".

**Approccio**: aggiungere un proximity check nel loop movimento FPS. Se `distance(camera, doors) < 1.5m` E stato `available` (cabina ferma al tuo piano, porte chiuse) → apri le porte.

**Posizione codice**:
- Sezione `MOVIMENTO FPS` (~riga 3278)
- Sezione `STATO` — aggiungere `state.reservedBy`
- Sezione `RENDER DEL DISPLAY TOUCH` (~riga 2456)

**Modifiche**:

```js
// in state:
reservedBy: null, // null = nessuno, oppure id univoco utente (per ora solo 1 utente)
```

```js
// nuova funzione:
const DOOR_POS = new THREE.Vector3(0, 0, CABIN.d / 2 + 0.3); // posizione porte nel mondo
const PROXIMITY_RADIUS = 1.5;

function checkCorridorReservation() {
  if (state.playerInCabin) return;
  if (state.isMoving) return;
  if (!state.doorsOpen) {
    const dist = camera.position.distanceTo(DOOR_POS.clone().add(cabin.position));
    if (dist < PROXIMITY_RADIUS && !state.reservedBy) {
      state.reservedBy = 'user1';
      setDoors(true);
      speak(STRINGS[LANG].reserved || 'Cabina prenotata.');
    }
  }
  // mostra "PRENOTATA" sul display cabin se sei nel corridoio davanti
  // (richiede che il display sia visibile dalla porta — attualmente no, si può skippare)
}
```

```js
// nel LOOP, dopo tickMove():
checkCorridorReservation();
```

**Acceptance**:
- [ ] Ti avvicini alle porte nel corridoio → si aprono automaticamente a <1.5m
- [ ] Ti allontani → restano aperte (comportamento hotel realistico)
- [ ] Se le porte sono già aperte, non fa nulla
- [ ] Se la cabina si sta muovendo, non interferisce

**Effort**: ~50 righe · **Rischio**: basso

---

## #21 — Specchio riflettente credibile 🔴

**Obiettivo**: lo specchio sulla parete sinistra riflette davvero l'interno cabina (incluso display LED, passeggeri, striscia LED soffitto).

**Approccio**: usare `Reflector` di Three.js (in `examples/jsm/objects/Reflector.js`). Aggiungerlo al importmap e sostituire la texture statica dello specchio (~riga 624).

**Posizione codice**:
- Sezione `HTML head` importmap (inizio file)
- Sezione `CABINA` (~riga 624) — sostituire specchio

**Modifiche**:

```html
<!-- in importmap, aggiungere: -->
<script type="importmap">
{
  "imports": {
    "three": "https://unpkg.com/three@0.160.0/build/three.module.js",
    "three/addons/": "https://unpkg.com/three@0.160.0/examples/jsm/"
  }
}
</script>
```

```js
// nella sezione CABINA, sostituire la creazione dello specchio:
import { Reflector } from 'three/addons/objects/Reflector.js';

// rimozione vecchio:
const mirrorGeom = new THREE.PlaneGeometry(0.9, 1.6);
const mirrorTex = makeMirrorTexture(); // ← rimuovere
const mirrorMat = new THREE.MeshStandardMaterial({ map: mirrorTex, metalness: 0.9, roughness: 0.05 });
const mirror = new THREE.Mesh(mirrorGeom, mirrorMat);
mirror.position.set(-CABIN.w/2 + 0.02, 1.3, -CABIN.d/2 + 1.0);
mirror.rotation.y = Math.PI / 2;
cabin.add(mirror);

// NUOVO:
const mirrorGeom = new THREE.PlaneGeometry(0.9, 1.6);
const mirror = new Reflector(mirrorGeom, {
  clipBias: 0.003,
  textureWidth: 512,
  textureHeight: 512,
  color: 0xb0b0b0,
});
mirror.position.set(-CABIN.w/2 + 0.02, 1.3, -CABIN.d/2 + 1.0);
mirror.rotation.y = Math.PI / 2;
cabin.add(mirror);

// cornice attorno (mantenere)
const mirrorFrame = new THREE.Mesh(
  new THREE.BoxGeometry(0.95, 1.65, 0.02),
  new THREE.MeshStandardMaterial({ color: 0x6b5a3a, metalness: 0.7, roughness: 0.3 })
);
mirrorFrame.position.copy(mirror.position);
mirrorFrame.position.x -= 0.015;
mirrorFrame.rotation.y = Math.PI / 2;
cabin.add(mirrorFrame);
```

**Acceptance**:
- [ ] Lo specchio riflette il display touch quando lo guardi
- [ ] Riflesso aggiornato durante shake cabina (vedi #1)
- [ ] Nessun calo FPS >5 in idle
- [ ] Il riflesso del passeggero virtuale (se presente in futuro) appare

**Effort**: ~30 righe (cambio materiale, niente logica) · **Rischio**: basso (Reflector è API stabile)

---

## #22b — Schermata "Welcome" interattiva 🟢

> **Nota 2026-09-12**: rinumerata da `#22` a `#22b` perché il numero `#22` è stato
> riassegnato in Polish Pack v1.5 a "Chiusura automatica porte (6 secondi)".
> Il backlog effettivo del progetto è quindi 22 voci + 2 bonus audit UX (`#21b`, `#22b`)
> = **24 entry implementate**.

**Obiettivo**: la start screen mostra un carosello di feature con icone + testi.

**Approccio**: aggiungere uno slider automatico di slide nell'overlay start screen.

**Posizione codice**:
- Sezione `HTML body` (inizio file) — `start-screen` overlay

**Modifiche**:

```html
<!-- in start screen overlay -->
<div id="startSlides" style="display:flex; gap:18px; margin:24px 0;">
  <div class="slide active"><div style="font-size:36px">🛗</div><div>Cabina 5★<br><small>Boss Hotel Edition</small></div></div>
  <div class="slide"><div style="font-size:36px">📱</div><div>Touch screen<br><small>Display 540×1100</small></div></div>
  <div class="slide"><div style="font-size:36px">🌤️</div><div>Meteo live<br><small>Roma in tempo reale</small></div></div>
  <div class="slide"><div style="font-size:36px">🗣️</div><div>Annunci vocali<br><small>Web Speech API</small></div></div>
  <div class="slide"><div style="font-size:36px">🏨</div><div>4 temi corridoio<br><small>Lobby, Uffici, Hotel, Attico</small></div></div>
</div>
```

```css
/* in <style> */
.slide {
  width: 110px; height: 110px;
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  text-align: center; font-size: 11px;
  opacity: 0.5; transition: opacity 0.4s;
}
.slide.active { opacity: 1; border-color: #ffd66b; }
```

```js
// in AVVIO:
let slideIdx = 0;
const slides = document.querySelectorAll('#startSlides .slide');
setInterval(() => {
  slides.forEach((s, i) => s.classList.toggle('active', i === slideIdx));
  slideIdx = (slideIdx + 1) % slides.length;
}, 2500);
```

**Acceptance**:
- [ ] 5 slide ruotano ogni 2.5s
- [ ] Active slide evidenziata in giallo
- [ ] Si ferma quando l'utente clicca "Entra nell'ascensore"
- [ ] Layout responsive su mobile

**Effort**: ~30 righe + HTML/CSS · **Rischio**: basso

---

## Checklist comune

- [ ] Aggiungere `Shift+M` al pannello-help come easter-egg
- [ ] Test Reflector su diversi browser (potrebbe avere bug su Safari)
- [ ] Test proximity detection con vari movimenti utente
- [ ] Aggiornare `README.md` con "Modalità manutentore" nascosta
