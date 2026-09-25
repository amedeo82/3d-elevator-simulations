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

**Tier T1 (high impact)**: Step 1, 2, 3 — critici per qualità (regressioni,
bug logico, a11y). ~3 sessioni totali.
**Tier T2 (mid)**: Step 4, 5 — manutenibilità + DRY. ~1.5 sessioni.
**Tier T3 (long-term)**: Step 6 — community/open-source. ~0.5 sessioni.

**Effort totale stimato**: ~5 sessioni (~10-15 ore).

## Contratti D-key pianificati

| # | Contratto | Introdotto da |
|---|---|---|
| D21 | Test exposure completa | V4 Step 1 |
| D22 | Routing inversione corretta | V4 Step 2 |
| D23 | A11y aria attributes standard | V4 Step 3 |
| D24 | Funzioni core <100 righe | V4 Step 4 |
| D25 | Helper geometry extraction | V4 Step 5 |
| D26 | Open source boilerplate (LICENSE + CHANGELOG + CONTRIBUTING) | V4 Step 6 |

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

## Decision Questions da definire

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
| 4 | Funzioni lunghe + commenti | ✅ done | (in arrivo) | feature/v4-step-4-fn-comments |
| 5 | Helper `mergePlanes` DRY | ⏳ pending | — | — |
| 6 | Open source boilerplate | ⏳ pending | — | — |

**Risultato atteso**: **6/6 step completati (100%)** se si decide di fare
tutto V4.

**Contratti D-key ereditati**: D1-D20 (V1+V2+V3) · **nuovi V4**: D21-D26
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
