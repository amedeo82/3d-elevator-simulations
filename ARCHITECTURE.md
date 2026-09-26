# ARCHITECTURE — BOSS HOTEL Elevator 3D

> Documento di riferimento architetturale (Polish Pack V3 Step 7, Q7.3).
> Complementa `AGENTS.md` (regole progetto + contratti D-key) con i diagrammi
> dei flussi principali del codice.

## Indice

1. [Ciclo RAF (main loop)](#1-ciclo-raf-main-loop)
2. [Init flow (bootstrap)](#2-init-flow-bootstrap)
3. [State machine movimento cabina](#3-state-machine-movimento-cabina)
4. [Audio pipeline](#4-audio-pipeline)
5. [Render pipeline](#5-render-pipeline)
6. [Maintenance overlay flow](#6-maintenance-overlay-flow)
7. [Module dependencies (file interni)](#7-module-dependencies-file-interni)
8. [LocalStorage schema](#8-localstorage-schema)

---

## 1. Ciclo RAF (main loop)

```
                       requestAnimationFrame(loop)
                                 |
                                 v
   +---> [loop(now)] --------------------------------------+
   |                                                        |
   |   tickDoors(dt)         <-- animazione porte (queue)   |
   |   tickMove(dt)          <-- movimento cabina (easing)   |
   |   tickDisplay(now)      <-- display passo-passo + redraw |
   |   tickPlayer(dt)        <-- FPS nel corridoio (WASD)     |
   |   tickFadeStates(now)   <-- V3 Step 4: fade alarm/citofono|
   |   tickBenchmark(now)     <-- V3 Step 5: profiler 10s     |
   |   tickIRSensor()         <-- V2 Step 2: anti-ostruzione  |
   |   tickInactivityPrompt() <-- prompt vocale 30s idle      |
   |   tickInterphoneCall(now) <-- citofono lampeggio + TTS   |
   |   tickNpcs(dt, now)     <-- NPC passeggeri corridoio    |
   |   tickArrowFade(now)    <-- crossfade freccia 200ms     |
   |   tickBreathButtons(now) <-- V3 Step 4: tasti respiro   |
   |   tickTimeOfDay()       <-- ciclo giorno/notte          |
   |   tickMusic()           <-- start/stop musica cabin      |
   |   tickCorridorAudio()   <-- audio corridoio             |
   |   tickRistoranteAudio() <-- audio ristorante 7° piano   |
   |   tickMaintenance(now)  <-- FPS + draw calls live      |
   |   tickMaintenanceLog()  <-- log realistici random       |
   |                                                        |
   |   updateHover()          <-- raycast pulsanti 3D        |
   |                                                        |
   |   renderer.render(scene, camera)  <-- draw call finale  |
   |                                                        |
   +--- (loop continua, ~60 FPS target) -------------------+
```

**Note**:
- `tickMove` esegue SOLO se `state.isMoving === true`, altrimenti gestisce
  vibrazione residua via `state._vibSnap` (V3 Step 4 Q4.5).
- `tickDisplay` redraw il display touchscreen SOLO se `displayDirty === true`
  (caching 3-layer: statico / semi-statico / dinamico).
- `tickBenchmark` è attivo solo durante un benchmark attivo (`state._benchPhase !== null`).

---

## 2. Init flow (bootstrap)

```
   <script type="module">
   |  import { THREE, Reflector, mergeGeometries }
   |
   v
   CONFIGURAZIONE  (linee ~700-1700)
   |  - CABIN, NUM_FLOORS, FLOOR_HEIGHT
   |  - HOTEL_CONFIG + HOTEL_CONFIG_DEFAULTS (frozen)
   |  - STRINGS.it / STRINGS.en (i18n)
   |  - state = { ... }  (CONFIGURATION, vedi AGENTS.md §Stato)
   |  - hoveredBtn = { current: null }
   |  - buttonList = []
   |  - movePaused = false  (V3 Step 4: spostato qui per TDZ safety)
   |  - textureCache = createLruCache(10)
   |
   v
   SCENA / RENDERER / CAMERA / LIGHTS (linee ~1700-1900)
   |  - alarmLight, ceilingLight, fillLight
   |  - makeBrushedMetalTexture / makeMarbleTexture / makeCeilingTexture
   |
   v
   CABINA + CORRIDOIO + PULSANTIERA (linee ~1900-5000)
   |  - Pavimento, soffitto, pareti, specchio, maniglione
   |  - Pannello pubblicitario
   |  - Profili alluminio, battiscopa, LED, telecamera, citofono, targhe
   |  - Porte (anta sx + dx + indicatori direzione)
   |  - Corridor group (vuoto, popolato da buildCorridor)
   |  - Modern display (pulsantiera touch)
   |
   v
   BOOTSTRAP  (linee ~5000-5500)
   |  - Tutorial contestuale prima volta (5 step)
   |  - 3-layer rendering caching (static/semistatic/dynamic)
   |  - Helper matematici puri (clamp, lerp, smoothstep, easeInOutCubic)
   |  - 30+ helper puri in window.BossHotelPure
   |
   v
   CARICA PREFS (linee ~9130-9150)
   |  - loadPrefs()        <-- muted/tts/night/interphone da localStorage
   |  - loadAudioSettings() <-- V3 Step 3: volumi
   |  - loadDisplaySettings() <-- V3 Step 3: brightness
   |  - loadHistory()       <-- V3 Step 6: alarmHistory/interphoneHistory
   |  - loadLang()          <-- IT/EN da localStorage
   |
   v
   INIT HELPERS + LISTENERS (linee ~8400-8800)
   |  - initSettingsQoL()  <-- slider audio + display
   |  - applyLangToDOM()   <-- riempi tutti i testi i18n
   |  - requestAnimationFrame(loop)  <-- AVVIA IL MAIN LOOP
```

---

## 3. State machine movimento cabina

```
                 +------------------------+
                 |        IDLE            |
                 |  state.isMoving = false |
                 |  state.targetFloor = *  |
                 +------------------------+
                          |   ^
                  requestFloor()   |
                          v       |
                 +------------------------+
                 |     CLOSING DOORS      |  animateDoorsTo(0, 0.8)
                 |  state.doorsTarget = 0 |  (con Q2.3 promise chaining)
                 +------------------------+
                          |   ^
              .then() → startMoveTo()  |
                          v       |
                 +------------------------+
                 |      MOVING           |
                 |  state.isMoving = true |  <-- tickMove gestisce easing
                 |  moveElapsed / moveT   |
                 |  arrivalPhase: normal  |
                 +------------------------+
                          |   ^
                          |   +-- arrivalPhase = 'blinking' (V3 Step 4 Q4.3)
                          |   |   quando moveElapsed > moveDuration - 1.0
                          |   |   → overlay gold tint 3 flash/sec
                          |   v
                 +------------------------+
                 |      ARRIVED           |  moveT >= 1
                 |  currentFloor = moveTo|  snap + announce + doors open
                 |  arrivalPhase = normal |  queueNextSmart per prossimo
                 +------------------------+
                          |
                          v
                     (back to IDLE)
                          |
                  OR  (if queue non vuota)
                          v
                 +------------------------+
                 |    QUEUE PROCESSING    |  setTimeout 1200ms
                 |  queueRemove + requestFloor  (V2 Step 7d routing)
                 +------------------------+
                          |
                          v
                    (back to CLOSING)
```

---

## 4. Audio pipeline

```
   AUDIO CONTEXT (singleton)
   |
   +-- playBeep(freq, dur, type, vol)
   |    |
   |    +-- OscillatorNode (freq, type)
   |    +-- GainNode (vol * state.audio.effects)  <-- V3 Step 3
   |    |
   |    v
   |    (OscillatorNode + GainNode) → audioCtx.destination
   |
   +-- startMusic() / stopMusic()
   |    |
   |    +-- 4 OscillatorNodes (accordo Cmaj7 o C major)
   |    +-- BiquadFilter (lowpass 800Hz)
   |    +-- GainNode (0.04 * state.audio.music)  <-- V3 Step 3
   |    +-- LFO per "breathing" 0.1Hz
   |
   +-- startCorridorAudio() / stopCorridorAudio()
   |    +-- masterGain (0.8 * state.audio.music)  <-- V3 Step 3
   |
   +-- startRistoranteAudio() / stopRistoranteAudio()
   |    +-- 4 OscillatorNodes (chitarra classica arpeggio C-Am-F-G)
   |    +-- white noise buffer (highpass 8kHz piatti)
   |    +-- masterGain (0.9 * state.audio.music)  <-- V3 Step 3
   |
   +-- startWhoosh() / stopWhoosh() (tickMove)
   |    +-- noise buffer (1s loop, bandpass 300-1000Hz)
   |    +-- GainNode (0.025 * speed * state.audio.effects)  <-- V3 Step 3
   |
   +-- speak() (Web Speech API TTS)
   |    +-- SpeechSynthesisUtterance (lang: it-IT | en-GB)
   |    +-- u.volume = opts.volume || state.audio.tts  <-- V3 Step 3
   |    +-- speakWithSubtitle wrapper (V3 Step 1 D11)
   |
   v
   audioCtx.destination → speaker
```

**Note**:
- Tutti i gain moltiplicati per `state.audio.effects` (effetti) o `state.audio.music` (musica)
  o `state.audio.tts` (annunci). Slider nel pannello Personalizza hotel (H) — V3 Step 3.
- `state.muted === true` → tutti i gain a 0 (kill switch globale).
- `state.alarmOn === true` → musica/whoosh stop automatici.

---

## 5. Render pipeline

```
   SCENE (THREE.Group)
   |
   +-- cabin (Group)
   |    +-- pavimento, soffitto, pareti, specchio, maniglione
   |    +-- panel pubblicitario (5 schermate rotanti)
   |    +-- dettagli premium (profili, battiscopa, LED, telecamera)
   |    +-- doors (anta sx + dx, indicatori)
   |    +-- panel (pulsantiera touch)
   |    +-- displayStaticCanvas + displaySemistaticCanvas + displayCanvas
   |    +-- alarmLight, ceilingLight, fillLight
   |
   +-- corridor (Group) - popolato da buildCorridor(floor)
   |    +-- shell merged (pavimento + soffitto + 3 pareti merged, V3 Step 5 Q5.2)
   |    +-- arredi (4 lampade merged + LED merged, bancone, piante, divani...)
   |    +-- floorSignGroup (cartello corridoio, condiviso)
   |    +-- externalCallPanel (pulsantiera esterna con ▲/▼)
   |
   +-- npcs (Group) - passeggeri corridoio (V2 Step 10)
   |    +-- NPC meshes con semplice animazione walk
   |
   v
   renderer.render(scene, camera)
   |
   v
   HTML <canvas> (fullscreen)
```

**3-layer display caching** (V1.6 #18):

```
   renderDisplayStaticLayer()    <-- solo al primo frame, cached 1 volta
   renderDisplaySemistaticLayer() <-- cached finché markDisplaySemistaticDirty
   renderDisplayDynamicLayer()   <-- redraw ogni secondo (orologio, passeggeri)
   |
   v
   displayTex (CanvasTexture → Three.js → shader)
```

**Brightness filter** (V3 Step 3):
```
   ctx.filter = `brightness(${state.display.brightness})`
   <-- default 1.0 (no-op skip), 0.5..1.5 range
```

**Texture LRU cache** (V3 Step 5 Q5.3):
```
   textureCache = createLruCache(10)
   <-- usato in drawMovingSign per cachare la base del cartello durante
       il lampeggio gentile pre-arrivo (V3 Step 4 Q4.3).
   <-- cache hit ratio ~90% durante flash, 100% al di fuori.
```

---

## 6. Maintenance overlay flow

```
   Shift+M → toggleMaintenance()
   |
   +-- se maintenanceMode ON:
   |    +-- overlay.classList.add('show')
   |    +-- applyWireframe(true) — tutti i materiali cabin in wireframe
   |    +-- logEvent('Maint ON', {category: 'maint'})
   |    +-- mostra FPS + draw calls live
   |    +-- export JSON button + benchmark button visibili
   |    +-- filter buttons (cabin/door/audio/state/maint) interattivi
   |    +-- counters allarmi/interphonate + history
   |
   +-- se maintenanceMode OFF:
   |    +-- overlay.classList.remove('show')
   |    +-- applyWireframe(false) - ripristina materiali
   |    +-- logEvent('Maint OFF', {category: 'maint'})
   |
   +-- teleportToFloor(floor)  <-- 1-9 (Shift+M + digit)
   |    +-- richiede maintenanceMode === true
   |    +-- cambia currentFloor + ricostruisci corridoio + setDoors(true)
   |
   +-- exportStateJSON()
   |    +-- payload: meta + state clone + filteredLog + history + logFilter
   |                + lastBenchmark
   |    +-- download boss-hotel-state-<ts>.json
   |
   +-- runBenchmark()
   |    +-- misura 5s idle + 5s moving
   |    +-- log + subtitle HUD
   |    +-- salva in state._lastBenchmark per export
   |
   +-- logEvent(label, {severity, category})  <-- V3 Step 6 D17
        +-- _eventLog: array cap 10 (UI maintenance overlay)
        +-- _exportLog: array cap 50 (export JSON)
        +-- 5 toggle buttons filter per category
```

---

## 7. Module dependencies (file interni)

```
   elevator.html (single-file, ~9700 righe)
   |
   +-- import { THREE } from 'three'
   +-- import { Reflector } from 'three/addons/objects/Reflector.js'
   +-- import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
   |
   +-- window.BossHotelPure (esposto a tests.html)
   |    |
   |    +-- ~30 helper puri (matematici + business logic + accessibility + Q2.x + Q4.x + Q5.x + Q6.x)
   |
   +-- bus (mini event bus homemade, V2 Step 1d)
   |    +-- emit/on/off — pattern semplice per disaccoppiare produttori/consumatori
   |
   +-- tests.html (iframe sandbox, esegue assert vanilla su BossHotelPure)
        +-- 183+ assert, ~30 describe block
```

**Nessuna build step, nessuna dipendenza npm** (single-file HTML con importmap
three.js + addons da CDN unpkg).

---

## 8. LocalStorage schema

| Chiave | Versione | Contenuto | Introdotto da |
|---|---|---|---|
| `bossHotelPrefs@v1` | `v: 1` | `{muted, tts, night, interphone}` | V2 Step 14c |
| `bossHotelLang` | `v: 1` | `{lang: 'it'\|'en'}` | V2 Step 8b |
| `bossHotelAudio@v1` | `v: 1` | `{effects, music, tts}` (0..1) | **V3 Step 3** (D14) |
| `bossHotelDisplay@v1` | `v: 1` | `{brightness}` (0.5..1.5) | **V3 Step 3** (D14) |
| `bossHotelHistory@v1` | `v: 1` | `{alarmHistory, alarmCount, interphoneHistory, interphoneCount}` | **V3 Step 6** (D17) |
| `bossHotelOnboarded@v1` | `v: 1` | `{onboarded: true}` (desktop wizard completed) | **V2 Step 2b** |
| `bossHotelOnboardedMobile@v1` | `v: 1` | `{onboarded: true}` (mobile wizard completed) | **V4 Step 7** (D26est) |

**Pattern**: ogni dominio ha la sua chiave separata + `v: 1` esplicito per
migrazione forward-compatible. Nuovi campi futuri si aggiungono senza
rompere consumers esistenti. **Per `onboarded*`** le chiavi sono separate
per mode (desktop vs mobile) perche' il wizard ha testi diversi (touch vs
keyboard shortcuts) e l'utente che ha completato quello desktop deve poter
vedere quello mobile la prima volta che usa un touch device.

---

## 9. Mode-aware rendering pattern (V4 Step 7+8, D26est + D27)

Il progetto era nato **desktop-first** (mouse + tastiera + pointer lock).
Nel tempo sono stati aggiunti elementi mobile (joystick virtuale,
pulsanti call ▲▼, hint "Tap + drag") come OVERLAY sopra la logica
desktop. Risultato su iPhone: cheatsheet WASD desktop + joystick mobile
+ ▲▼ mobile + pointer hint desktop tutti visibili insieme ("mix confuso").

V4 Step 7+8 ha introdotto il pattern **mode-aware rendering** con `state.inputMode`
come single source of truth.

### 9.1 `state.inputMode` derivation

```
boot
  ↓
isMobileDevice() = touch + (smallestViewportDim <= 500 || Math.min(dims) <= 768)
  ↓
state.isMobile = boolean
state.inputMode = state.isMobile ? 'mobile' : 'desktop'  // single source of truth
  ↓
document.body.classList.toggle('mobile-mode', state.isMobile)
```

Runtime re-evaluation su `matchMedia` change + `resize` + `orientationchange`
(gestisce rotazione tablet/iPad):
```
recheck():
  wasMode = state.inputMode
  state.inputMode = isMobileDevice() ? 'mobile' : 'desktop'
  if (wasMode !== state.inputMode) {
    refreshMobileControls()    // add/remove body.mobile-mode
    applyLangToDOM()           // re-render cheatsheet + pointer hint
    if (state.tutorialActive) startTutorial(true)  // restart con nuovi step
  }
```

### 9.2 Data structures paralleli

```
desktop mode:                          mobile mode:
─────────────────                      ──────────────
PANEL_HELP_KEYS (15)                   PANEL_HELP_KEYS_MOBILE (13)
  WASD, E, M, V, N, O, K, ?, H, L        Drag dito, Tap, Tap HUD, Joystick,
  + Mouse, Clic, ESC                     ▲▼, Menu, IT/EN
                                        (no ESC: nessun mouse da rilasciare)

TUTORIAL_STEPS (5)                     TUTORIAL_STEPS_MOBILE (5)
  Step 1-5 con WASD/E/H/M/V/N/O/K        Step 1-5 con tap/drag/joystick/▲▼
                                        + menu impostazioni

START_SCREEN_KEYS (15)                 START_SCREEN_KEYS_MOBILE (13)
  Mouse/Click/ESC/E/WASD/...             Drag/Tap/Tap HUD/Joystick/▲▼
```

### 9.3 Helper mode-aware

```js
function getPanelHelpKeys() {
  return state.inputMode === 'mobile' ? PANEL_HELP_KEYS_MOBILE : PANEL_HELP_KEYS;
}
function getStartScreenKeys() {
  return state.inputMode === 'mobile' ? START_SCREEN_KEYS_MOBILE : START_SCREEN_KEYS;
}
function getTutorialSteps() {
  return state.inputMode === 'mobile' ? TUTORIAL_STEPS_MOBILE : TUTORIAL_STEPS;
}
```

Tutti i callsites che usano questi data structures passano per gli helper.
Mai controlli sparsi su `state.isMobile`.

### 9.4 CSS split (mutualmente esclusivo)

```css
body.mobile-mode #panel-help,
body.mobile-mode #crosshair { display: none !important; }
body:not(.mobile-mode) #touch-controls { display: none !important; }
```

Risultato: su desktop vedi cheatsheet + crosshair + (no touch controls).
Su mobile vedi joystick + ▲▼ + hamburger (no cheatsheet, no crosshair).

### 9.5 Keydown short-circuit

```js
addEventListener('keydown', e => {
  // FIX mobile bug: short-circuit su mobile.
  if (state.inputMode === 'mobile') {
    const isTutorialKey = state.tutorialActive && (Enter/Space/ArrowRight/Escape);
    const isTutorialHelp = (Shift+/);
    if (!isTutorialKey && !isTutorialHelp) return;
  }
  // ... gestione normale WASD/M/V/N/O/K/H/L/E
});
```

### 9.6 Hamburger menu (V4 Step 8, D27)

Su mobile, dopo D26est, le 9 azioni keyboard-only (M/V/N/O/K/?/H/L/Shift+M)
restavano inaccessibili via touch. D27 aggiunge un menu hamburger:

```
[☰ top-left 44×44px]  → tap
                              ↓
[slide-in overlay 320px da destra]
  Header: "Menu" + [×]
  ─────────────
  IMPOSTAZIONI RAPIDE
    🔊 Audio              [ON/OFF]   ← aria-checked
    🎵 Annunci vocali      [ON/OFF]
    ☼ Modalità notte      [ON/OFF]
    ⚠ Fuori servizio      [ON/OFF]
    🎤 Comando vocale      [ON/OFF]
  ─────────────
  ALTRO
    ❓ Rivedi tutorial        ›   ← openTutorial()
    ✏ Personalizza hotel     ›   ← openHotelCustomizer()
    🛠 Manutentore            ›   ← toggleMaintenance()
    🌐 Lingua IT/EN           ›   ← setLang()
```

**Architettura**:
- `handleMobileMenuAction(action)` switch su 9 casi (5 toggle inline +
  4 link che chiudono menu + aprono overlay)
- `refreshMobileMenuStates()` legge `state.muted/ttsEnabled/nightMode/...`
  e aggiorna `aria-checked` + badge ON/OFF
- `initMobileMenu()` bind click handler (idempotente: `initMobileMenu._bound`)
- Event delegation su `.mm-item` (un listener × 9 voci)
- Esposto in `BossHotelPure`: `openMobileMenu/closeMobileMenu/toggleMobileMenu/
  isMobileMenuOpen/handleMobileMenuAction`

**Sicurezza UX** (D27):
- `openMobileMenu()` rilascia `pointer-lock` (evita mouse-look su tap)
- `openMobileMenu()` chiude tutorial attivo (evita overlay stacking)
- 4 azioni link chiudono il menu prima di aprire l'overlay target

**i18n**: 25 nuove chiavi × IT + EN = **50 stringhe** (`mmTitle`,
`mmSectionToggles/Actions`, `mmAudio/Voice/Night/OOO/VoiceCmd/Tutorial/
Customize/Maint/Lang`, `mmStateOn/Off`, `ariaHamburger/MmClose/MmToggleAudio/...`).

**FIX cabin nera iOS (post-merge)**: `#mobile-menu` ha `visibility: hidden`
di default + `visibility: visible` su `.mobile-menu-shown`. Su iOS Safari un
elemento `position: fixed` con `z-index` > canvas anche con
`pointer-events: none` + `opacity: 0` + `transform: translateX(100%)`
può causare "cabina nera" (bug `preserveDrawingBuffer: true` introdotto in
PR #7). `visibility: hidden` è il fix canonico perché rimuove l'elemento
dal compositor. `display: none` sarebbe troppo aggressivo (romperebbe la
transition CSS del panel).

---

## Contratti D-key (riferimento rapido)

Vedi `AGENTS.md` §Contratti D-key per i dettagli completi. Riassunto:

| # | Contratto | Introdotto da |
|---|---|---|
| D1 | Single-file HTML | V1 |
| D2 | Stato in cima | V2 (TDZ lesson) |
| D3 | No emoji | V1 |
| D4 | Italiano + sezioni | V1 |
| D5 | HOTEL_CONFIG centralizzato | V2 Step 5 |
| D6 | Config prime texture IIFE | V2 Step 5 |
| D7 | Coda viaggi `{floor, direction}` | V2 Step 7 |
| D8 | STRINGS[lang] i18n | V2 Step 8 |
| D9 | BossHotelPure helpers testabili | V2 Step 12 |
| D10 | Citofono vs SOS distinti | V2 Step 14 |
| D11 | speakWithSubtitle esplicito | V3 Step 1 |
| D12 | prefers-reduced-motion | V3 Step 1 |
| D13 | Bug latenti documentati | V3 Step 2 |
| D14 | Settings QoL 2 chiavi @v1 | V3 Step 3 |
| D15 | Micro-animazioni reducedMotion | V3 Step 4 |
| D16 | Performance pattern (LRU + merge) | V3 Step 5 |
| D17 | Log strutturato + history persist | V3 Step 6 |
| D18 | (riservato, non introdotto) | — |
| D19 | (riservato, non introdotto) | — |
| D20 | (riservato, non introdotto) | — |
| D21 | Test exposure completa | V4 Step 1 |
| D22 | Routing inversione asimmetrico | V4 Step 2 |
| D23 | A11y ARIA standard | V4 Step 3 |
| D24 | Funzioni core <150 righe | V4 Step 4 |
| D25 | mergePlanes DRY | V4 Step 5 |
| D26 | Open source boilerplate | V4 Step 6 |
| **D26est** | **state.inputMode single source of truth** | **V4 Step 7** |
| **D27** | **Mobile hamburger menu (☰)** | **V4 Step 8** |

---

Vedi anche:
- `AGENTS.md` — regole progetto + convenzioni codice + 27 contratti D-key completi
- `PIANO_V4.md` — roadmap Polish Pack V4 (piano attuale, 8/8 step chiuso)
- `PIANO_MIGLIORAMENTI.md` — log implementativo di tutte le fasi
- `README.md` — overview user-facing del progetto
- `tests.html` — test suite vanilla JS (262+ assert)
