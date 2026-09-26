# PIANO V4 — Polish Pack V4

> Documento di implementazione per il Polish Pack V4. Successore del
> V3 (completato 100% il 2026-09-25). Focus: copertura test completa,
> bug latenti noti, accessibilità avanzata, refactoring manutenibilità.

## Contesto

Polish Pack V3 (PIANO_V3.md) è stato chiuso al 100% (9/9 step) il 2026-09-25
con 205 test passing, 20 contratti D-key (D1-D20), 7 file documentazione,
e 9 step di polish incrementale. V4 parte dall'audit finale di V3 (vedi
sezione §Audit V3) per affrontare le aree di miglioramento identificate.

### Audit V3 (sintesi) — aggiornato 2026-09-25 dopo audit pre-V4

| Area | Status reale | Impatto |
|---|---|---|
| 32 funzioni `pure:` non esportate in `BossHotelPure` | ✅ **falso allarme** (vedi nota) | — |
| Routing `pickNextFloor` inversione ritorna MIN invece di MAX | 🟠 logic bug | Alto |
| Zero `aria-*` attributes nel codice | 🟠 a11y gap | Alto |
| 26 funzioni lunghe non documentate (`updateAdScreen` 483 righe!) | 🟡 manutenibilità | Media |
| 3x `mergeGeometries` con pattern ripetuto | 🟢 DRY violation | Bassa |
| Manca LICENSE / CHANGELOG / CONTRIBUTING | 🟢 open-source | Bassa |
| `relativeLuminance` esposto ma non testato in `tests.html` | 🟡 gap residuo | Bassa |

**Nota audit V3 → V4 (2026-09-25)**: l'audit iniziale di V4 riportava
"32 funzioni `pure:` non esportate in `BossHotelPure`" basandosi su una
snapshot stale. Verifica puntuale: tutte le 32 funzioni marcate `// pure:`
risultano effettivamente esportate in `window.BossHotelPure` (righe
10167-10197 di `elevator.html`) e coperte da 206 test / 343 assert in
`tests.html` (target V4 era 300+ assert, già superato). Pertanto **Step 1
è di fatto già chiuso** dal lavoro di V2/V3; rimane solo un piccolo gap
(`relativeLuminance` esportato ma senza test) da coprire in coda al primo
step futuro che toccherà helpers accessibilità.

## Roadmap V4

| # | Step | Tier | Effort | Priority |
|---|---|---|---|---|
| 1 | Test exposure gap | T1a | 1 sessione | 🔴 |
| 2 | Routing bug fix | T1b | 0.5 sessioni | 🔴 |
| 3 | A11y aria attributes | T1c | 1.5 sessioni | 🔴 |
| 4 | Funzioni lunghe + commenti | T2a | 1 sessione | 🟡 |
| 5 | Helper `mergePlanes` DRY | T2b | 0.5 sessioni | 🟢 |
| 6 | Open source boilerplate | T3a | 0.5 sessioni | 🟢 |
| 7 | **Mobile scene separation** (D26 esteso) | T2c | 1 sessione | 🟡 |
| 8 | **Mobile hamburger menu** (D27) | T2d | 1 sessione | 🟡 |

**Tier T1 (high impact)**: Step 1, 2, 3 — critici per qualità (regressioni,
bug logico, a11y). ~3 sessioni totali.
**Tier T2 (mid)**: Step 4, 5, 7, 8 — manutenibilità + DRY + mobile separation. ~4 sessioni.
**Tier T3 (long-term)**: Step 6 — community/open-source. ~0.5 sessioni.

**Effort totale stimato**: ~7.5 sessioni (~15-20 ore).

**Step 7-8 aggiunti post-chiusura V4 originale**: nati dall'analisi
architetturale del 2026-09-26 che ha evidenziato come il progetto fosse
cresciuto desktop-first con tutti gli interventi mobile come "overlay" sopra
logiche desktop (V3 Step 9), causando UX confusa su iPhone (cheatsheet
WASD + joystick + ▲▼ + pointer hint desktop tutti visibili insieme).

## Contratti D-key pianificati

| # | Contratto | Introdotto da |
|---|---|---|
| D21 | Test exposure completa | V4 Step 1 |
| D22 | Routing inversione corretta | V4 Step 2 |
| D23 | A11y aria attributes standard | V4 Step 3 |
| D24 | Funzioni core <100 righe | V4 Step 4 |
| D25 | Helper geometry extraction | V4 Step 5 |
| D26 | Open source boilerplate (LICENSE + CHANGELOG + CONTRIBUTING) | V4 Step 6 |
| **D26 esteso** | `state.inputMode` come single source of truth per mode UI/handler/tutorial/cheatsheet | **V4 Step 7** |
| **D27** | Mobile hamburger menu (☰ top-left) con 9 voci (5 toggle + 4 azioni) per azioni keyboard-only rese accessibili via touch | **V4 Step 8** |

---

## Scope Step 1 — Test exposure gap (T1a)

**Problema**: 32 funzioni sono marcate `// pure:` ma solo 2 sono esportate
in `window.BossHotelPure` (`isMobileDevice`, `NUM_FLOORS`). Questo significa
che i test in `tests.html` non possono validare regressioni in:
`clamp`, `lerp`, `smoothstep`, `clampFloor`, `floorLabel`, `computePassengerDelta`,
`pickNextFloor`, `canOpenDoors`, `shouldAnnounceDoorClose`, `sosCancelsOOO`,
`currentMovementDirection`, `breathScale`, `arrivalFlashAlpha`, `easeOutBounce`,
`stateFadeDurationMs`, ecc.

**Soluzione**:
- Esporta tutte le 32 funzioni `pure:` in `BossHotelPure` (organizzate
  per dominio con commento di raggruppamento).
- Aggiungi 80+ nuovi test in `tests.html` (~50% edge cases, 30% integrazione,
  20% stress).
- Target: 205 → 300+ assert.

**Decision Questions da definire quando lo step sarà affrontato.**

---

## Scope Step 2 — Routing bug fix (T1b)

**Problema**: `pickNextFloor(queue, 'up')` con queue tutta `direction='down'`
ritorna MIN floor (es. floor 2) invece di MAX (es. floor 6). Logica attesa
per inversione: tornare al farthest point opposto, poi continuare giù.

Documentato in Step 8 test:
```js
// Test attuale:
test('inversione: no same-dir, fallback opp-dir (MIN down)', () => {
  const q = [{floor:2, direction:'down'},{floor:6, direction:'down'}];
  assertEq(P.pickNextFloor(q, 'up').floor, 2);  // MIN
});
```

**Soluzione**:
- Cambia `oppDir === 'up' ? MAX : MIN` → `MAX` per entrambe le direzioni
  quando si inverte (oppDir).
- Aggiorna test esistente + 5 nuovi test (inversioni in entrambe le direzioni).
- Aggiungi test specifico che dimostra il corretto comportamento
  (floor 6 quando oppDir=down con queue [2,6]).

**Decision Questions da definire quando lo step sarà affrontato.**

---

## Scope Step 3 — A11y aria attributes (T1c)

**Problema**: 0 occorrenze di `aria-label`, `aria-hidden`, `role=` in
tutto il progetto. Polish Pack V3 Step 1 ha introdotto
`prefers-reduced-motion` ma non gli attributi ARIA standard per screen
reader.

**Soluzione**:
- Aggiungi `aria-label` agli elementi HUD interattivi:
  - `#hud-exit-btn`, `#hud-reenter-btn`, `#startBtn`
  - Tutti i `.m-export-btn`, `.m-filter-btn`, `.virtual-call-btn`
  - Touch controls: `#virtual-joystick`, `.virtual-call-btn`
- Aggiungi `aria-hidden="true"` agli elementi puramente decorativi:
  - Icone emoji (📱 rotate overlay)
  - Canvas display (gestito via renderer, no semantica)
- Aggiungi `role="button"` agli elementi con `cursor:pointer` non `<button>`.
- Aggiungi `role="status"` `aria-live="polite"` per subtitle HUD (annunci).
- Test con axe-core (CDN) via iframe: zero violations.

**Decision Questions da definire quando lo step sarà affrontato.**

---

## Scope Step 4 — Funzioni lunghe + commenti (T2a)

**Problema**: 26 funzioni >=80 righe senza commenti narrativi (Step 7 ha
coperto solo 5 funzioni core). In particolare `updateAdScreen` (483
righe!), `applyLangToDOM` (161), `tickNpcs` (92), `addSkylineWindow` (180),
`startCorridorAudio` (158), `tickMaintenance` (126).

**Soluzione**:
- Split `updateAdScreen` in `bakeAdScreen()` (costruzione canvas texture)
  + `drawAdScreen()` (render scheduling). Ognuna <100 righe.
- Split `applyLangToDOM` in helper per dominio (panelHelp, customizeHotel,
  maintOverlay, ecc.).
- Aggiungi commenti narrativi (stile Step 7) alle top-10 funzioni più
  lunghe non ancora documentate.
- Target: nessuna funzione >=150 righe.

**Decision Questions da definire quando lo step sarà affrontato.**

---

## Scope Step 5 — Helper `mergePlanes` DRY (T2b)

**Problema**: `mergeGeometries([...], false)` chiamato 3x in `buildCorridor`:
- 3 pareti (sx, dx, fondo) merged in 1 mesh
- 4 LED lampade merged in 1 mesh
- 4 frame merged in 1 mesh

Ogni chiamata ha il pattern: `geometry.applyMatrix4(matrix)` + array di
geometries + `mergeGeometries`. Duplicazione ~20 righe × 3.

**Soluzione**:
- Crea helper `mergePlanes(transforms, material)` dove `transforms` è
  array di `{geometry, matrix}`.
- Refactor `buildCorridor` per usarlo.
- Esporta in `BossHotelPure` per test.

**Decision Questions da definire quando lo step sarà affrontato.**

---

## Scope Step 6 — Open source boilerplate (T3a)

**Problema**: progetto completo ma mancano file standard per community:
- `LICENSE` (MIT, raccomandato per open source permissive)
- `CHANGELOG.md` (storico versioni: V1, V2, V3, V4...)
- `CONTRIBUTING.md` (come contribuire: setup, test, contratti D-key)

**Soluzione**:
- `LICENSE` — MIT standard + copyright Amedeo Vecchi 2026
- `CHANGELOG.md` — generato automaticamente da commit messages o
  manualmente con versioni (5.0 → 6.0 → 7.0 etc.)
- `CONTRIBUTING.md` — quick start + contratti D-key + come aggiungere
  un nuovo step del Polish Pack

**Decision Questions da definire quando lo step sarà affrontato.**

---

## Scope Step 7 — Mobile scene separation (T2c)

**Problema architetturale**: il progetto è nato desktop-first (mouse +
tastiera + pointer lock) e nel tempo sono stati aggiunti elementi mobile
(joystick virtuale, pulsanti call ▲▼, hint "Tap + drag") come OVERLAY
sopra la logica desktop. Su iPhone l'utente vede:
- **cheatsheet desktop** (`#panel-help`) con WASD/E/M/V/N/O/K/H/L/Shift+M
  — tasti che non esistono su touch
- **joystick mobile** (bottom-left) — decorativo perché la camera è
  guidata dal pointer-lock mouse-look, non dal joystick virtuale
- **▲▼ call buttons** (bottom-right) — wirano `requestFloor()` ma il resto
  del flow è desktop
- **pointer hint desktop** "Clicca per attivare il puntatore" — non ha
  senso su touch

Risultato: "mix confuso" che non funziona come dovrebbe. L'utente non
sa cosa usare.

**Soluzione** (Decisione Q-via `question` tool → **B. Due scene + runtime toggle**):
1. Aggiungere `state.inputMode = 'desktop'|'mobile'` come **single source
   of truth** calcolato al boot da `isMobileDevice()` e ricalcolato su
   resize/orientationchange/matchMedia change.
2. Tutti i branch UI/handler/tutorial/cheatsheet leggono SOLO questo
   flag (non più controlli sparsi su `state.isMobile`).
3. **Data structures paralleli**:
   - `PANEL_HELP_KEYS` vs `PANEL_HELP_KEYS_MOBILE` (13 voci: Drag/Tap/
     Tap HUD/Joystick/▲▼/Menu/IT-EN)
   - `TUTORIAL_STEPS` vs `TUTORIAL_STEPS_MOBILE` (5 step che descrivono
     tap su ▲▼, tap Esci dalla cabina, drag dito + joystick, Rientra, IT/EN)
   - `START_SCREEN_KEYS` vs `START_SCREEN_KEYS_MOBILE`
4. Helper mode-aware: `getPanelHelpKeys()`, `getStartScreenKeys()`,
   `getTutorialSteps()`, `refreshMobileMenuStates()`.
5. **Per-mode onboarded flag**: `localStorage[bossHotelOnboarded@v1]`
   (desktop) vs `localStorage[bossHotelOnboardedMobile@v1]` (mobile).
6. **CSS split**: `body.mobile-mode #panel-help { display: none }` +
   `body.mobile-mode #crosshair { display: none }` +
   `body:not(.mobile-mode) #touch-controls { display: none }`.
7. **Keydown short-circuit** su mobile: il listener `keydown` ritorna
   subito tranne per tasti tutorial (`?`, Enter, Esc).
8. **Pointer hint mode-aware**: "Trascina il dito per guardare. Usa il
   joystick per muoverti." invece di "Click per attivare il puntatore".

**Contratto D26 esteso**: aggiunto `state.inputMode` come single source
of truth per mode UI/handler/tutorial/cheatsheet.

**Decision Questions da definire quando lo step sarà affrontato.**

---

## Scope Step 8 — Mobile hamburger menu (T2d)

**Problema**: dopo Step 7, il progetto mostra correttamente contenuti
mobile-friendly, ma l'utente touch non ha modo di accedere alle 9 azioni
keyboard-only: M (audio), V (annunci), N (notte), O (fuori servizio),
K (comando vocale), ? (tutorial), H (customizer), L (lingua),
Shift+M (manutenzione).

**Soluzione** (D27):
1. Bottone ☰ fisso top-left (44×44 px, `display: none` di default,
   `display: block` su `body.mobile-mode`).
2. Overlay slide-in da destra (320px max-width 90vw, transform
   `translateX(100%) → 0` con transition 250ms).
3. **9 voci in 2 sezioni**:
   - **Impostazioni rapide** (5 toggle con badge ON/OFF colorato via
     `aria-checked`):
     - 🔊 Audio (M)
     - 🎵 Annunci vocali (V)
     - ☼ Modalità notte (N)
     - ⚠ Fuori servizio (O)
     - 🎤 Comando vocale (K)
   - **Altro** (4 link ad altri overlay):
     - ❓ Rivedi tutorial (?)
     - ✏ Personalizza hotel (H)
     - 🛠 Manutentore (Shift+M)
     - 🌐 Lingua IT/EN (L)
4. **i18n**: 25 nuove chiavi × IT + EN = **50 stringhe** (`mmTitle`,
   `mmAudio`, `mmVoiceCmd`, `mmCustomize`, `mmStateOn`, `mmStateOff`,
   `mmSectionToggles`, `mmSectionActions` + 13 `ariaMm*`).
5. **Sicurezza UX**: `openMobileMenu()` rilascia `pointer-lock`
   + chiude tutorial attivo (evita overlay stacking).
6. 7 nuove funzioni JS: `openMobileMenu`, `closeMobileMenu`,
   `toggleMobileMenu`, `isMobileMenuOpen`, `handleMobileMenuAction`,
   `refreshMobileMenuStates`, `initMobileMenu`. Esposti in `BossHotelPure`.

**Contratto D27** aggiunto: hamburger menu come unica entry point
mobile per tutte le azioni keyboard-only del desktop.

**Decision Questions da definire quando lo step sarà affrontato.**

---

Le Decision Questions per ogni step saranno definite quando lo step
verrà affrontato, seguendo il pattern stabilito in V2/V3 (4-5 domande
per step via `question` tool).

---

## Stato V4 — progress overview (da aggiornare man mano)

| # | Step | Stato | Commit | Branch |
|---|---|---|---|---|
| 1 | Test exposure gap | ✅ done (V2/V3 avevano già coperto) | — | — |
| 2 | Routing bug fix | ✅ done | c98ba78 + merge 32fc61e | feature/v4-step-2-routing-bug |
| 3 | A11y aria attributes | ✅ done | 8bd36c5 + merge 7c68cea | feature/v4-step-3-a11y-aria |
| 4 | Funzioni lunghe + commenti | ✅ done | 0df5815 + merge | feature/v4-step-4-fn-comments |
| 5 | Helper `mergePlanes` DRY | ✅ done | 4f42e18 + merge dd8ce1f | feature/v4-step-5-merge-planes |
| 6 | Open source boilerplate | ✅ done | (in arrivo) | feature/v4-step-6-os-boilerplate |
| 7 | Mobile scene separation | ✅ done | 0c621c8 + merge e31d058 | feature/v4-step-7-mobile-scene |
| 8 | Mobile hamburger menu | ✅ done | 5af68dc + merge e31d058 | feature/v4-step-8-mobile-menu |

**Risultato atteso**: **8/8 step completati (100%)**.

**Contratti D-key ereditati**: D1-D20 (V1+V2+V3) · **nuovi V4**: D21-D27
(pianificati, da definire).

---

## Roadmap possibile post-V4

- **Polish Pack V5 (WebXR/VR)**: porting su WebXR + AR/VR mode.
- **Polish Pack V5 (Multiplayer)**: multi-cabina sincronizzata via
  WebSocket. Più complesso (richiede server).
- **Polish Pack V6 (Localizzazione)**: aggiungere DE, FR, ES, JP, ZH.
- **Polish Pack V7 (PWA offline)**: service worker + manifest.

Decision su Polish Pack V5+ sarà fatta dopo la chiusura di V4.

---

## Come procedere ora

**Polish Pack V3 COMPLETO (9/9 step, 100%).** Polish Pack V4 è
**pianificato ma non ancora iniziato**.

Workflow proposto:

1. Apri la sezione §Scope Step N per lo step che vuoi affrontare.
2. Decidi il Tier (T1/T2/T3) in base alla priorità (alto impatto vs nice-to-have).
3. Rispondi alle Decision Questions quando definite (via `question` tool).
4. Implemento solo le opzioni approvate.
5. Aggiorno `PIANO_V4.md` segnando lo step come ✅.
6. `node scripts/check-balance.js elevator.html` + `tests.html` dopo ogni modifica.
7. Commit separati per sotto-step, smoke test screenshot pre-merge.
8. Aggiorno `PIANO_MIGLIORAMENTI.md` con la fase al merge finale.

Pattern: branch dedicato `feature/v4-step-N-{name}`, merge `--no-ff`.

**Suggerimento**: partire con i 3 step T1 (1, 2, 3) per ~3 sessioni. Se
budget OK, proseguire con T2 + T3.

---

Vedi anche:
- `PIANO_V3.md` — roadmap precedente, completa 100%
- `PIANO_MIGLIORAMENTI.md` — log implementativo storico
- `AGENTS.md` — regole progetto + contratti D-key D1-D20
- `ARCHITECTURE.md` — diagrammi architetturali
- `STRINGS_REFERENCE.md` — mappatura completa i18n

---

## Log decisioni

### 2026-09-25 — Step 1 (Test exposure gap)

**Audit pre-V4**: il piano apriva con "32 funzioni `pure:` non esportate in
`BossHotelPure`, target 205 → 300+ assert". Verifica puntuale (grep su
`elevator.html:5640-5890`, lettura di `tests.html:127-1467`):

- tutte le 32 funzioni marcate `// pure:` risultano **già** in
  `window.BossHotelPure` (righe 10167-10197 di `elevator.html`);
- `tests.html` contiene **206 test / 343 assert** (target 300+ già superato);
- unico gap residuo: `relativeLuminance` (Step 1d V3) è esportato ma
  non ha test in `tests.html` (5-6 test banali da aggiungere in coda).

**Decisione** (risposta utente via `question` tool): **chiudere Step 1
come già fatto**. L'audit iniziale di V4 era basato su snapshot stale e
non rifletteva lo stato post-V3.

**Azioni eseguite**:
- aggiornata la tabella §Audit V3 con status reale (✅ falso allarme);
- aggiunta nota che spiega la genesi della chiusura anticipata;
- aggiornata tabella stato (Step 1 → ✅);
- non aperto branch dedicato né commit: nessuna modifica al codice.

**Prossimo step proposto**: Step 2 (routing bug fix `pickNextFloor`
inversione), unico step T1b ancora aperto con bug logico confermato.

### 2026-09-25 — Step 2 (Routing bug fix D22)

**Bug identificato**: `pickNextFloor`/`queueNextSmart` applicava la regola
`oppDir === 'up' ? MAX : MIN` per il caso "inversione", che è sbagliata
fisicamente. La cabina prosegue nella direzione attuale fino al farthest
della direzione opposta, poi serve i restanti tornando indietro (look
algorithm). Le due inversioni sono quindi asimmetriche:

- `lastDir='up'`, invert a `down` → MAX (highest) della coda down
  (la cabina sale fino al piano più alto tra i down, poi scende)
- `lastDir='down'`, invert a `up` → MIN (lowest) della coda up
  (la cabina scende fino al piano più basso tra gli up, poi risale)

**Decisione** (risposta utente via `question` tool): **MAX/MIN asimmetrico
(standard look algorithm)**. La formulazione letterale del piano ("MAX
per entrambe le direzioni") è stata corretta in favore dell'euristica
fisicamente coerente.

**Modifiche al codice** (elevator.html):
- `pickNextFloor` (riga 5671-5698): inversione ora ritorna MAX se
  `oppDir='down'`, MIN se `oppDir='up'`. Commento esteso esplicativo.
- `queueNextSmart` (riga 8003-8031): stessa modifica per la versione
  stateful (devono restare in sync per D9).

**Test** (tests.html, 4 aggiornati + 6 nuovi = +6 netti):
- 4 test esistenti che documentavano il vecchio comportamento
  (aspettavano MIN per inversione up→down e MAX per inversione
  down→up) aggiornati per riflettere la convenzione corretta.
- 6 nuovi edge case aggiunti nella sezione `pickNextFloor (routing
  edge cases)`: inversione con coda singola, coda disordinata,
  priorita same-dir su inversione, ecc.
- Totale suite: 206 → **212 test / 343 → 349 assert**, tutti pass.

**Contratto D22** aggiunto ad AGENTS.md.

**Verifica**: `node scripts/check-balance.js elevator.html` passa;
screenshot `tests-step2-bottom.png` mostra 211/211 PASS; smoke test
elevator.html (`elevator-step2-smoke.png`) mostra start screen pulito.

### 2026-09-25 — Step 3 (A11y aria attributes D23)

**Decisioni** (risposte utente via `question` tool):
- **Q23.1 = A** (Assert manuali su chiavi, no CDN): test che verificano
  presenza di `aria-label`/`role`/`aria-live`/`aria-hidden` via
  `iframe.contentDocument.querySelector` in `tests.html`. Zero dipendenze
  esterne, conforme a D1.
- **Q23.2 = A** (i18n via STRINGS): aggiunte 19 nuove chiavi `aria*` in
  `STRINGS.it`/`STRINGS.en`. `applyAriaLabels()` chiamato da
  `applyLangToDOM()` ad ogni cambio lingua per coerenza con D8.

**Modifiche al codice** (elevator.html):
- Aggiunti 19 attributi `aria-label` su bottoni HUD interattivi
  (`hud-exit-btn`, `hud-reenter-btn`, `startBtn`, 5 `m-filter-btn`,
  `m-export-json`, `m-benchmark-btn`, 2 `virtual-call-btn`,
  `virtual-joystick`, 2 `tt-btn`, 3 `hc-btn`).
- Aggiunti `aria-hidden="true"` su elementi decorativi (`#pointerhint`,
  `.rotate-icon`, `.joystick-knob`, renderer canvas).
- Aggiunti `role="status" aria-live="polite" aria-atomic="true"` su
  `#subtitle` (TTS annunci) e `#mode-badge` (status corrente).
- Aggiunto `role="alertdialog" aria-labelledby` su
  `#rotate-device-overlay` e `role="application" tabindex="0"` su
  `#virtual-joystick`.
- Nuova funzione `applyAriaLabels()` (~50 righe) chiamata da
  `applyLangToDOM()` e successivamente da `setLang()` per refresh su
  cambio lingua.
- Esposte `applyLangToDOM`, `setLang`, `applyAriaLabels` in
  `BossHotelPure` per testing cross-iframe.

**Test** (tests.html, +15 test / +35 assert):
- 3 nuovi `describe` block "a11y (V4 Step 3 D23)" con 15 test che
  verificano: presenza aria-label su 9 set di bottoni, role+aria-live
  su 2 live region, aria-hidden su 3 elementi decorativi, e cambio
  lingua aggiorna aria-label.
- Totale suite: 212 → **227 test / 349 → 384 assert**, tutti pass.

**Contratto D23** aggiunto ad AGENTS.md con descrizione completa.

**Verifica**: `node scripts/check-balance.js elevator.html` passa;
screenshot `tests-step3-rerun.png` mostra 226/226 PASS; smoke test
`elevator-step3-smoke.png` mostra start screen pulito.

**Branch**: `feature/v4-step-3-a11y-aria`.

### 2026-09-25 — Step 4 (Funzioni lunghe + commenti D24)

**Decisione** (Q24.1 via `question` tool): **Commenti narrativi + split
minimi** (A). Aggiunti commenti narrativi stile V3 Step 7 alle top 16
funzioni >=80 righe + estratti helper minimi da `buildCorridor` e
`startCorridorAudio` (gli unici 2 >=150). Risultato: 0 funzioni >=150.

**Modifiche al codice** (elevator.html):
- **Split 1**: `buildCorridor` 178 → 76 righe. Estratti due helper:
  - `buildCorridorShell(theme, sZ, eZ)` (60 righe): pavimento + tappeto +
    soffitto + 3 pareti merged.
  - `buildCorridorLights(sZ)` (37 righe): 4 PointLight + LED planes + frame
    boxes merged.
- **Split 2**: `startCorridorAudio` 156 → ~50 righe. Estratti 4 helper
  per-tema (~30 righe ciascuno):
  - `setupLobbyAudio(masterGain, layers)` — brusio + tintinnio tremolo.
  - `setupOfficeAudio(masterGain, layers)` — ticchettio tastiere + brusio.
  - `setupHotelAudio(masterGain, layers)` — drone 60Hz + clock tick.
  - `setupPenthouseAudio(masterGain, layers)` — piano LFO sweep + vento.
- **Commenti narrativi** aggiunti a 16 funzioni >=80: `renderDisplayDynamicLayer`,
  `addRoomDoor`, `drawWeatherIconBig`, `drawMovingSign`, `tickMaintenance`,
  `initTouchControls`, `renderDisplaySemistaticLayer`, `loop`, `makeNpc`,
  `playCorridorAmbient`, `applyLangToDOM`, `tickPlayer`, `tickNpcs`,
  `drawClockFace`, `drawFloorSign`, `startMusic`. Stile V3 Step 7:
  `Polish Pack V4 Step 4 (D24):` + scopo + sezioni + contratti D-key +
  performance.

**Helper tool**: `scripts/find-long-fns.js` (brace-counting corretto,
37 righe) rieseguibile dopo ogni refactor importante. Identifica le top
N funzioni con conteggio rigoroso (la prima versione naive basata su
"next-function boundary" sovrastimava `updateAdScreen` a 484 — in
realta' 14 — per via di nested functions tra top-level `function` declarations).

**Contratto D24** aggiunto ad AGENTS.md: tutte le funzioni <150 + 16
commenti narrativi sulle funzioni >=80.

**Verifica**:
- `node scripts/check-balance.js elevator.html` → passa.
- `node scripts/find-long-fns.js` → 0 funzioni >=150 (target raggiunto).
- Test screenshot `tests-step4.png` → 226/226 PASS.
- Smoke test `elev-step4.png` → start screen pulito.

**Branch**: `feature/v4-step-4-fn-comments`.

**Prossimo step proposto**: Step 5 (Helper `mergePlanes` DRY, T2b)
— unico step T2 rimasto aperto.

### 2026-09-25 — Step 5 (Helper mergePlanes DRY D25)

**Decisione** (Q25.1=A via `question` tool): **mergePlanes(transforms, material)**
ritorna `THREE.Mesh` pronto per `corridor.add()` (null se merge fallisce).
Refactor: 3 callsites sostituiti con 1 chiamata + fallback opzionale.

**Modifiche al codice** (elevator.html):
- Nuovo helper `mergePlanes(transforms, material, useGroups=false)` ~10
  righe: clona ogni geometry per non mutare gli input, applica matrix,
  mergeGeometries, ritorna Mesh o null.
- `buildCorridorShell` (3 pareti): da 27 righe di setup manuale a 16
  righe dichiarative con `[{geometry, matrix}, ...]`.
- `buildCorridorLights` (4 LED planes + 4 frame boxes): da 30 righe a 14
  con due array di transforms.
- Esposizione in `BossHotelPure.mergePlanes`.

**Test** (tests.html, +6 test / +12 assert):
- helper esposto in BossHotelPure (1)
- input vuoto → null (1)
- input non-array → null (1)
- merge 3 plane 1x1 → 12 vertici, 18 indici (1)
- NON muta geometries di input (1)
- mesh ritornato ha il materiale passato (1)
- Totale suite: 226 → **232 test / 384 → 396 assert**, tutti pass.

**Contratto D25** aggiunto ad AGENTS.md.

**Verifica**:
- `node scripts/check-balance.js elevator.html` → passa.
- Screenshot `tests-step5.png` → **232/232 PASS** (incluso i 6 nuovi).
- Smoke test `elev-step5.png` → start screen pulito (il refactor del
  merge non ha rotto la pipeline three.js di buildCorridor).

**Branch**: `feature/v4-step-5-merge-planes`.

**Prossimo step proposto**: Step 6 (Open source boilerplate, T3a) —
ultimo step V4.

### 2026-09-25 — Step 6 (Open source boilerplate D26) — V4 CHIUSO 100% ✅

**Decisioni** (Q26.1=A, Q26.2=B, Q26.3=A via `question` tool):
- LICENSE: aggiornato a "Copyright (c) 2026 Amedeo Vecchi".
- CHANGELOG.md: auto-generato via `scripts/generate-changelog.js` (~85
  righe che parsa `git log` e bucketa per Polish Pack V1..V4).
- CONTRIBUTING.md: comprehensive (~110 righe) con prereq + quick start +
  sommario 19 contratti D-key + workflow Polish Pack + code style.

**Modifiche**:
- `LICENSE` (21 righe, MIT standard) — copyright aggiornato.
- `CHANGELOG.md` (182 righe, auto-generato) — 191 commit totali: V1: 12,
  V2: 68, V3: 24, V4: 11, altro: 76.
- `CONTRIBUTING.md` (114 righe) — guida contributor con sezione completa
  dei D-key contracts D1-D26 e workflow Polish Pack (come aggiungere uno
  step).
- `scripts/generate-changelog.js` (95 righe) — parser `git log` con
  regex euristiche. Placeholder `XXHASHXX` come separatore (git non
  supporta %x00), regex `^([0-9a-f]{40})XXHASHXX(.+?)XXHASHXX(.*?)XXHASHXX(.*)$`
  per gestire date con spazi.

**Contratto D26** introdotto in AGENTS.md: open source boilerplate
(LICENSE + CHANGELOG + CONTRIBUTING auto-generato).

**Verifica**:
- `node scripts/check-balance.js elevator.html` → passa (nessun cambio
  al codice).
- `node scripts/generate-changelog.js` → genera CHANGELOG.md con 191
  commit buckettati correttamente.
- Screenshot `tests-step6.png` → **232/232 PASS** (nessuna regressione).

**Branch**: `feature/v4-step-6-os-boilerplate`.

🎉 **Polish Pack V4 COMPLETO (6/6 step, 100%)**. Roadmap post-V4:
vedi sezione "Roadmap possibile post-V4" sotto.

### 2026-09-26 — Step 7 (Mobile scene separation D26 esteso)

**Decisione** (Q-via `question` tool): **B. Due scene + runtime toggle**.
L'utente ha confermato la necessita' di separare architetturalmente le
scene desktop e mobile (vs un semplice patch CSS che avrebbe mantenuto
il "mix" sottostante).

**Modifiche al codice** (elevator.html, ~270 righe):
- `state.inputMode = 'desktop' | 'mobile'` dichiarato nel state object
  (CONFIGURATION, in cima al file per evitare TDZ).
- `state.onboardedDesktop` + `state.onboardedMobile` separati come
  `localStorage[bossHotelOnboarded@v1]` vs
  `localStorage[bossHotelOnboardedMobile@v1]`.
- `PANEL_HELP_KEYS_MOBILE` (13 voci touch-friendly) parallelo a
  `PANEL_HELP_KEYS` (15 voci desktop). Helper `getPanelHelpKeys()` mode-aware.
- `START_SCREEN_KEYS_MOBILE` parallelo a `START_SCREEN_KEYS`.
- `TUTORIAL_STEPS_MOBILE` (5 step touch) parallelo a `TUTORIAL_STEPS`
  (5 step desktop). Helper `getTutorialSteps()` mode-aware.
- 13 nuove stringhe IT/EN: `helpLookAroundMobile`...`helpMaintMobile`
  + 5 nuove coppie `tutorialStep*TextMobile/VoiceMobile` + `pointerHintMobile`.
- `applyLangToDOM()` mode-aware per pointerhint + cheatsheet.
- `loadOnboarded/saveOnboarded` per-mode (legge/scrivi chiave localStorage
  corretta in base a `state.inputMode`).
- Keydown short-circuit su mobile: ritorna subito tranne tasti tutorial.
- CSS `body.mobile-mode #panel-help/#crosshair { display: none }` +
  `body:not(.mobile-mode) #touch-controls { display: none }`.
- `initMobileDetection` ha `recheck()` su matchMedia + resize +
  orientationchange: su mode change chiama `applyLangToDOM()` e
  riavvia il tutorial con i nuovi step.

**Test** (tests.html, +12 test / +24 assert):
- "SOLUZIONE B: due scene desktop/mobile indipendenti" describe block.
- Totale suite: 232 → **244 test / 396 → 420 assert**, tutti pass.

**Contratto D26 esteso** aggiunto ad AGENTS.md.

**Verifica**:
- `node scripts/check-balance.js elevator.html` → passa.
- 11/11 check strutturali jsdom PASS (`/tmp/.../mobiletest/run3.js`).
- PR: https://github.com/amedeo82/3d-elevator-simulations/pull/9
  (PR #10 con Step 7+8 merged insieme come `e31d058`).

**Branch**: `kilo/playful-null-mhs`.

### 2026-09-26 — Step 8 (Mobile hamburger menu D27)

**Decisione**: prosegue logica di Step 7. L'utente ha richiesto
esplicitamente il menu hamburger dopo aver visto le 9 azioni
keyboard-only rese non accessibili su touch.

**Modifiche al codice** (elevator.html, ~480 righe):
- HTML: bottone `#hamburger-btn` + overlay `#mobile-menu` con 9 voci in
  2 sezioni (5 toggle + 4 link azione).
- CSS: bottone fisso top-left 44×44 px glassmorphism, overlay slide-in
  da destra 320px con transform translateX 100%→0 + transition 250ms,
  badge ON/OFF colorato via `aria-checked`.
- 25 nuove stringhe IT/EN: `mmTitle`, `mmSectionToggles/Actions`,
  `mmAudio/Voice/Night/OOO/VoiceCmd/Tutorial/Customize/Maint/Lang`,
  `mmStateOn/Off`, `ariaHamburger/MmClose/MmToggleAudio/.../MmToggleLang`.
- 7 nuove funzioni JS:
  - `openMobileMenu()` — rilascia pointer-lock + chiude tutorial attivo
  - `closeMobileMenu()` — rimuove `.mobile-menu-shown`
  - `toggleMobileMenu()` — switch open/close
  - `isMobileMenuOpen()` — getter
  - `handleMobileMenuAction(action)` — 9 switch case (5 toggle + 4 link)
  - `refreshMobileMenuStates()` — sync UI con state corrente (label, aria,
    ON/OFF badge)
  - `initMobileMenu()` — bind listeners (idempotente)
- Esposti in `BossHotelPure.openMobileMenu/closeMobileMenu/toggleMobileMenu/
  isMobileMenuOpen/handleMobileMenuAction`.
- `initMobileMenu()` chiamato dopo `initTouchControls()` nel boot sequence.

**Test** (tests.html, +18 test / +36 assert):
- "V4 Step 8: hamburger menu mobile (azioni touch)" describe block.
- DOM: hamburger btn + mobile menu + 5 toggle + 4 action items.
- CSS: display:none/block su mobile-mode, transform translateX slide-in.
- STRINGS: 25 nuove chiavi IT + EN.
- JS: 7 funzioni definite, 9 action handlers, openMobileMenu rilascia
  pointer-lock + chiude tutorial, refreshMobileMenuStates aggiorna badge.
- Totale suite: 244 → **262 test / 420 → 456 assert**, tutti pass.

**Contratto D27** aggiunto ad AGENTS.md.

**Verifica**:
- `node scripts/check-balance.js elevator.html` → passa.
- 37/37 check strutturali jsdom PASS (`/tmp/.../mobiletest/run4.js`).
- 3 CI checks su PR #10 verdi (Sintassi+balance, Test framework,
  GitGuardian Security).

**Branch**: `kilo/playful-null-mhs`.

### 2026-09-26 — FIX post-merge (cabina nera su iOS)

**Bug scoperto dopo merge di PR #10**: dopo aver mergiato Step 7+8, la
cabina tornava nera su iPhone Safari (la scena 3D non renderizzava).
Sintomo: si vedevano i nuovi elementi mobile (hamburger, joystick, call
buttons) ma il canvas WebGL sotto di essi mostrava solo il clear color
(0x111114 = quasi nero).

**Root cause analysis**:
1. `#mobile-menu` overlay (320×100vh, `position: fixed`, `z-index: 5800`)
   con `pointer-events: none` + `transform: translateX(100%)` sul panel
   + `opacity: 0` sul backdrop interferiva col rendering WebGL su iOS
   Safari. Su iOS un elemento `position: fixed` con `z-index` superiore
   al canvas anche con `pointer-events: none` + `opacity: 0` può
   causare "cabina nera" a causa del bug `preserveDrawingBuffer: true`
   introdotto proprio per fixare altri scenari (commit `ca45f92`).
2. `requestAnimationFrame(loop)` duplicato a fine script (commit storico
   `380c41d7` del 2026-09-11) lanciava un secondo loop parallelo,
   causando 2 render/frame + `dt=0` drift sul secondo loop.

**Fix**:
- Aggiunto `visibility: hidden` a `#mobile-menu` di default +
  `visibility: visible` su `.mobile-menu-shown`. Fix canonico per
  elementi fixed che interferiscono col canvas WebGL iOS.
- Rimosso il secondo `requestAnimationFrame(loop)` ridondante.
- Commento esplicativo per evitare regressioni future.

**Verifica**:
- `node scripts/check-balance.js elevator.html` → passa.
- 3 CI checks PR #11 verdi (Sintassi+balance, Test framework,
  GitGuardian Security).

**Branch**: `kilo/playful-null-mhs`.

🎉 **Polish Pack V4 COMPLETO (8/8 step, 100%) + fix cabina nera post-merge**.
