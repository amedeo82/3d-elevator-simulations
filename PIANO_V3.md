# Piano V3 — Roadmap Polish Qualitativo
**Documento di design e implementazione iterativa per BOSS HOTEL Elevator 3D**

> Versione 0.5 — Aperto 2026-09-17 (chiusura V2) · Step 1–5 ✅ 2026-09-23
>
> V3 sposta il focus da **aggiungere feature** a **migliorare la qualità**
> di quelle esistenti. Niente nuove funzionalità grosse (rimandate a V4+):
> solo polish qualitativo incrementale mirato a rendere il simulatore
> più solido, accessibile, performante e piacevole da usare.
>
> Stato attuale: **6/9 step completati (67%)** — vedi §Stato V3 in fondo
> al documento. Step 1–5 merged su `main`. Step 6 (QoL manutenzione) è il
> prossimo. Vedi `PIANO_V2.md` §Stato finale V2 per lessons learned che
> informano V3.
>
> Workflow: stesso pattern di V2 — file `PIANO_V3.md` con step numerati,
> Decision Questions via `question` tool, branch dedicati per step,
> commit separati per sotto-step, merge `--no-ff`.

---

## 0. Indice degli step

| # | Step | Tier | Sforzo | Impatto | Stato |
|---|---|---|---|---|---|
| 1 | Accessibility (a11y) | T1a | 1 sessione | 🔴 | ✅ |
| 2 | Bug fix UX sistematico | T1b | 1 sessione | 🔴 | ✅ |
| 3 | Settings QoL (volumi + luminosità) | T1c | 1 sessione | 🟡 | ✅ |
| 4 | Micro-animazioni (tasti "respiro") | T2a | 1 sessione | 🟡 | ✅ |
| 5 | Performance (profiling + lazy) | T2b | 1-2 sessioni | 🟡 | ✅ |
| 6 | QoL manutenzione (log + export) | T2c | 1 sessione | 🟢 | ✅ |
| 7 | Documentazione completa | T3a | 1-2 sessioni | 🟡 | ⏳ |
| 8 | Test coverage estesa (134 → 200+) | T3b | 1-2 sessioni | 🟡 | ⏳ |
| 9 | Mobile responsive layout | Bonus | 1-2 sessioni | 🟡 | ⏳ |

**Effort totale stimato**: ~10-15 ore, distribuite su 8-12 sessioni.

**Progress attuale**: 5/9 step done · Tier T1: 3/3 done (100%) · Tier T2: 2/3 (67%) · Tier T3: 0/2 · Bonus: 0/1.

**Legenda stato**: ⏳ pending · 🔄 in corso · ✅ done · ❌ scartato

**Legenda impatto**: 🔴 alto · 🟡 medio · 🟢 basso

---

## Scope Step 1 — Accessibility (T1a)

Miglioramenti di accessibilità per il simulatore. Include:

- **Sottotitoli garantiti per tutti gli annunci TTS**: ogni `speak()` deve avere un
  corrispondente `showSubtitle()` automatico (oggi alcuni sono accoppiati manualmente).
- **Rispetto `prefers-reduced-motion`**: rileva `window.matchMedia('(prefers-reduced-motion: reduce)')`
  e disabilita animazioni non essenziali (crossfade freccia, "respiro" tasti, easing smoothstep
  → lineare). Animazioni essenziali (apertura/chiusura porte, vibrazione cabina) restano attive.
- **Focus visibile su bottoni HUD**: tasti `.hud-action` + bottoni tutorial + customizer
  hanno un focus ring visibile al keyboard navigation.
- **Contrasto display touch**: verifica WCAG AA sui colori del display (gold su nero,
  bianco su blu, ecc.). Aumento contrasto dove necessario.

Decision Questions complete definite sotto (§Step 1).

---

## Scope Step 2 — Bug fix UX sistematico (T1b)

Audit corner case noti:

- **Porte a metà movimento** + click su un tasto display: il click arriva durante
  l'animazione porte, deve essere correttamente gestito (no race condition).
- **Click durante movimento cabina**: il tasto display è cliccabile in movimento?
  Oggi rifiuta con beep 220Hz. Verificare coerenza con `requestFloor`.
- **Allarme + OOO**: se attivi entrambi, chi ha priorità? Disattivazione di uno
  ripristina l'altro? Test corner case.
- **Citofono + SOS**: indipendenti (Step 14), ma verificare che subtitle HUD non
  si sovrascrivano tra loro.
- **Language switch durante annuncio**: l'annuncio in corso viene abortito e
  pronunciato nella nuova lingua, oppure no?

Decision Questions da definire quando lo step sarà affrontato.

---

## Scope Step 3 — Settings QoL (T1c)

Settings persistenti aggiuntivi:

- **Volume audio suddiviso**: 3 slider separati (effetti, musica cabin, TTS).
  - Default: tutto al 100%. Persistenza in `localStorage.bossHotelAudio@v1`.
  - Già esiste `state.muted` globale (mute); aggiungiamo granularità.
- **Luminosità display touch**: slider 50%-150% che applica un moltiplicatore
  al `globalCompositeOperation` del canvas display (o semplicemente moltiplica
  i colori via shader).
- **Snapshot stato debug**: bottone "Esporta stato JSON" nel maintenance overlay
  (Shift+M) che scarica `state` completo + ultime 50 entry log + cache corrente.
  Utile per issue reporting.

Decision Questions da definire.

---

## Scope Step 4 — Micro-animazioni (T2a)

- **Tasti display touch "respiro"**: scale animation sottile (1.0 → 1.02 → 1.0)
  in loop 4s per attirare l'attenzione. Rispetta `prefers-reduced-motion`.
- **Cartello con effetto "lampeggio gentile"**: quando la cabina è in arrivo,
  il cartello corridoio lampeggia brevemente (3 flash in 1s) prima di stabilizzarsi.
- **Fade gentile cambi stato**: OOO/alarm/citofono ora hanno snap immediato.
  Aggiungere fade-in 200ms sull'opacità degli elementi coinvolti.
- **Easing più morbido su maniglione**: vibrazione con curva "bounce-out" invece
  di decay esponenziale puro.

Decision Questions da definire.

---

## Scope Step 5 — Performance (T2b)

- **Profilo FPS in vari scenari**: misurare FPS a default (10 piani), 20 piani,
  con OOO attivo, con allarme, con citofono. Identificare i colli di bottiglia.
- **Riduzione draw call**: merge geometrie dove possibile (es. arredi corridoio
  per piano), uso di `THREE.BufferGeometryUtils.mergeGeometries()`.
- **Lazy load texture**: le canvas texture della cabina (targa, citofono, header
  pulsantiera) sono bake-on-init. Aggiungere cache LRU per evitare re-bake
  inutili.
- **Ottimizzazione shader**: profilare fragment shader del display touch e
  del pannello pubblicitario.

Decision Questions da definire.

---

## Scope Step 6 — QoL manutenzione (T2c)

- **Log eventi più ricco**: aggiungere campi a `logEvent()`: severity (info/warn/error),
  category (cabin/door/audio/state). Filtro per categoria nel maintenance overlay.
- **Export stato JSON**: bottone dedicato (vedi anche Step 3) per scaricare snapshot.
- **History ultimi N allarmi/interphonate**: contatori `state.alarmCount`,
  `state.interphoneCount` con timestamp. Mostrati nel maintenance overlay.

Decision Questions da definire.

---

## Scope Step 7 — Documentazione completa (T3a)

- **Commentare codice core**: focus su `tickMove`, `tickDoors`, `tickPlayer`,
  `buildCorridor`, `getThemeForFloor` (funzioni lunghe e/o scarsamente commentate).
  Stile: numero di riga nei riferimenti storici, razionale del "perché".
- **Diagrammi ASCII delle dipendenze**: in `AGENTS.md` o file separato
  `ARCHITECTURE.md`. Es. ciclo RAF → tickMove → tickDoors → tickPlayer.
- **Documentare STRINGS[lang]**: mappatura completa IT/EN per ogni chiave,
  in `STRINGS_REFERENCE.md` o sezione `AGENTS.md`.

Decision Questions da definire.

---

## Scope Step 8 — Test coverage estesa (T3b)

Salire da 53 a 100+ test. Aree da coprire:

- **Casi limite routing** (`pickNextFloor`): code miste, code vuote con lastDirection, inversioni multiple.
- **Edge cases passeggeri** (`computePassengerDelta`): rand=0, rand=1, tutte le soglie.
- **Integrazione**: helper che combinano più pure functions (es. `floorLabel + getDayPhase`).
- **Helper citofono**: durata, timing lampeggio (richiede simulazione clock).
- **Stress test**: 100 chiamate consecutive a `pickNextFloor` per verificare
  nessun leak/state mutation.
- **Coverage state fields**: helper `stateInvariantCheck(s)` che valida i contratti
  state (es. `state.interphoneCalling && state.alarmOn` -> caso lecito).

Decision Questions da definire.

---

## Scope Step 9 — Mobile responsive layout (Bonus)

Layout responsive per mobile/tablet. Oggi il simulatore è desktop-only (richiede
mouse-look + WASD). Per mobile serve:

- **Touch controls**: trascinamento dito = mouse-look, swipe = movimento.
- **HUD scalato**: bottoni più grandi su schermi piccoli, font auto-scaling.
- **Layout landscape forzato**: il simulatore richiede orizzontale.
- **Pulsantiera display touch adattata**: celle più grandi per il tocco.
- **Fallimento graceful**: se mobile non supporta `requestPointerLock`,
  mostra istruzioni "tap to look".

Decision Questions complete da definire quando lo step sarà affrontato.

---

## Contratti V3 (ereditati da V2)

Vedi `AGENTS.md` per i contratti di progetto completi (D1-D10). V3 aggiunge
i seguenti constraint:

- **C-V3-1**: nessuna feature additiva grossa (no nuovi pulsanti, no nuove schermate).
  Solo miglioramenti di feature esistenti.
- **C-V3-2**: ogni step deve aggiungere almeno 1 test in `tests.html` (se ha logica
  testabile) o 1 smoke test visivo (se puramente visivo).
- **C-V3-3**: ogni step segue il workflow "Decision Questions via `question` tool" prima
  di scrivere codice. Manteniamo il contratto utente.
- **C-V3-4**: ogni step ha acceptance criteria espliciti in `PIANO_V3.md`.
- **C-V3-5**: smoke test screenshot prima del merge (lezione V2: verifica visiva
  occasionale, da rendere sistematica).

---

## Decisioni globali (cross-step)

### DG-V3.1 — Branch strategy

- **A. Ogni step in branch dedicato** (`feature/v3-step-N`) + merge dopo validazione *(Recommended, coerente con V2)*
- **B. Tutti gli step in un unico branch** `feature/polish-pack-v3`
- **C. Step a basso rischio diretti su `main`**

### DG-V3.2 — Commit strategy

- **A. Commit separati per sotto-step** *(Recommended, pattern V2)*
- **B. Commit unico per step**
- **C. Commit unico per branch + squash al merge**

### DG-V3.3 — Aggiornamento documentazione

- **A. `PIANO_V3.md` come roadmap + `PIANO_MIGLIORAMENTI.md` come log** *(Recommended, stesso pattern V2)*
- **B. Solo `PIANO_V3.md`**
- **C. Tutto in un nuovo `CHANGELOG.md`**

### DG-V3.4 — Versioning del repo

- **A. Continuare su `main`** (V3 chiuso su main, versioni in README)
- **B. Branch dedicato `v3`** con merge finale su main
- **C. Tag `v3.0` finale** al merge dell'ultimo step

---

# STEP 1 · Scope discovery ✅ (chiuso 2026-09-17)

Step "meta" che ha definito il backlog definitivo V3.

## Decisioni approvate

- **Q1.1 → B (iniziale) → 9 finale**: inizialmente "6 step", poi espanso a 9 per copertura esaustiva di tutti i Tier + 1 bonus (mobile responsive).
- **Q1.2 → A**: tutti i 3 Tier 1 inclusi (T1a accessibility, T1b bug fix UX, T1c settings QoL).
- **Q1.3 → D**: tutti i 3 Tier 2 inclusi (T2a micro-animazioni, T2b performance, T2c QoL manutenzione).
- **Q1.4 → C**: entrambi T3 inclusi (T3a documentazione, T3b test coverage estesa).
- **Q1.5 → B + A**: bonus = Mobile responsive layout.

## Risultato

Tabella "Indice degli step" definitiva con 9 step (vedi §0 in cima al documento).
Effort stimato totale: ~10-15 ore su 8-12 sessioni.

---

# STEP 1 (effettivo) · Accessibility (T1a)

Miglioramenti di accessibilità per rendere il simulatore utilizzabile da
più utenti, inclusi quelli con disabilità visive, motorie o con sensibilità
a motion. Coerente con EN 81-70 (accessibilità ascensori) e WCAG 2.1 AA.

## Scope proposto

- **1a · Sottotitoli garantiti per tutti gli annunci TTS**: refactoring di
  `speak()` per accettare `opts.subtitle` (default = `text` se non specificato).
  Ogni chiamata `speak(txt)` automaticamente chiama `showSubtitle(txt, dur)`,
  con durata calcolata in base alla lunghezza del testo (lettura ~150 parole/min).
  Risolve casi oggi scoperti (es. `speak` di `announceMoveStart` non ha subtitle).

- **1b · Rispetto `prefers-reduced-motion`**: rileva `window.matchMedia` e setta
  `state.reducedMotion`. Le animazioni non essenziali (crossfade freccia 200ms,
  "respiro" tasti, easing smoothstep) diventano istantanee. Animazioni
  essenziali (apertura/chiusura porte, vibrazione cabina, allarme luci rosse)
  restano attive (sicurezza).

- **1c · Focus visibile su bottoni HUD**: aggiungere `:focus-visible` ring CSS
  su `.hud-action`, `.tt-btn`, `.hc-btn`, `.start-btn`. Rispetta
  navigazione keyboard-only. Default browser focus + override con ring brand color.

- **1d · Contrasto display touch WCAG AA**: audit dei colori display touch
  (gold #c9a449 su nero, bianco su blu #4a90e2). Dove contrasto < 4.5:1,
  aumenta luminosità testo o scurisce sfondo.

## Decision Questions

### Q1.1 — Scope di questo step

- **A. Tutto (1a + 1b + 1c + 1d)** — copertura completa *(Recommended)*
- **B. Solo 1a + 1b** (sottotitoli + reduced motion)
- **C. Solo 1b + 1c** (reduced motion + focus)
- **D. Altro**

### Q1.2 — Sottotitoli automatici per TTS

- **A. Wrap automatico in `speak()`** (chi parla passa testo, subtitle auto) *(Recommended)*
- **B. Solo esplicito** (chi chiama deve passare `subtitle:` separatamente)
- **C. Refactor con helper `speakWithSubtitle(txt, dur)`** — nuovo helper esplicito

### Q1.3 — `prefers-reduced-motion`: quanto aggressivo?

- **A. Disabilita solo micro-animazioni** (crossfade, respiro) *(Recommended)*
- **B. Disabilita anche easing smoothstep** (diventa lineare)
- **C. Disabilita tutto tranne sicurezza** (vibrazione, allarme restano)
- **D. Solo override manuale** (tasto M per motion off)

### Q1.4 — Focus ring: design

- **A. Outline dorato brand** (`outline: 2px solid #ffd66b`) *(Recommended)*
- **B. Default browser** (nessun override)
- **C. Background highlight** (cambia sfondo bottone)

### Q1.5 — Contrasto display touch: scope

- **A. Solo display touch pulsantiera** *(Recommended, dove serve di più)*
- **B. Tutti i testi HUD** (più effort)
- **C. Solo verifica con tool automatico** (no fix)

## Acceptance criteria

- [x] (1a) Ogni `speak()` ha subtitle automatico (no skip involontario)
- [x] (1b) `prefers-reduced-motion: reduce` → `state.reducedMotion=true` → animazioni non essenziali disabilitate
- [x] (1b) Animazioni essenziali (allarme, porte) restano attive anche con reduced motion
- [x] (1c) Tab key su bottoni HUD mostra focus ring visibile
- [x] (1d) Display touch passa WCAG AA contrast check (≥4.5:1)
- [x] (1d) Nessuna regressione FPS
- [x] `node --check` + brace balance
- [x] Test: helper `shouldDisableMotion(state)` + test in `tests.html`

## Effort

1 sessione (~2-3 ore).

## Implementation note (chiuso)

Decisioni utente approvate: Q1.1=A (tutto), Q1.2=C (helper `speakWithSubtitle` esplicito),
Q1.3=A (solo micro-animazioni), Q1.4=A (outline dorato brand), Q1.5=B (tutti i testi HUD).

Branch: `feature/v3-step-1-accessibility` (merged + cancellata locale/remota)
Commit: `a26ccaf feat(a11y): Polish Pack V3 Step 1 Accessibility (T1a)` · `bc070e0 docs(v3)` · `b2497f1 Merge` · `05345d3 chore(slides) emoji`
Test: 72/72 pass (era 53/53, +19 nuovi assert su accessibility helpers)

Contratti D-key nuovi in `AGENTS.md`:
- **D11**: `speak()` puro + `speakWithSubtitle()` helper esplicito (Q1.2=C).
- **D12**: `prefers-reduced-motion` OS-level → `state.reducedMotion` + `shouldDisableMotion(state)` helper (Q1.3=A).

Pure helpers aggiunti a `window.BossHotelPure`: `computeSubtitleDuration`,
`shouldDisableMotion`, `relativeLuminance`, `contrastRatio`.

**Lessons learned** (dettaglio in `PIANO_MIGLIORAMENTI.md` §Fase 18):
- Stato in cima check rispettato: `reducedMotion: false` dichiarato in
  CONFIGURAZIONE, mai inline.
- Init position: `initReducedMotion()` chiamato appena prima di
  `buildCorridor(0)` per evitare flash iniziale del ghost freccia.
- Commit strategy: 4 sotto-step intrecciati in elevator.html → commit
  unico ben commentato (atomicita' del feature), con messaggio che
  elenca esplicitamente i 4 sotto-step invece di patch chirurgiche.

---

---

# STEP 2 · Bug fix UX sistematico (T1b)

Audit corner case + bug latenti + fix mirati. Pattern: prima Decision
Questions via `question` tool → poi implementazione chirurgica → test.

## Decision Questions

### Q2.1 — Scope dello step
- **C. Audit + estensione corner case** *(approvato)*: indagine approfondita
  dei 5 corner case elencati + ricerca attiva di bug latenti non documentati.

### Q2.2 — Click display durante movimento cabina
- **A. Beep 440Hz + subtitle 1.5s** *(approvato)*: aggiunto feedback uditivo/visivo
  quando `requestFloor()` mette il piano in coda durante il movimento (prima solo
  `lightFloorButton()`, troppo silenzioso).

### Q2.3 — Porte mid-animazione + click display
- **B. Promise-chaining completo** *(approvato)*: refactor di `animateDoorsTo()`
  per supportare una coda `doorAnimQueue`. Le Promise resolutions sono rispettate
  (no memory leak), niente bounce. Edge case: target già raggiunto → resolve
  immediato (no-op 0-duration).

### Q2.4 — Allarme + OOO: interazione
- **A. SOS forza OOO OFF** *(approvato)*: quando l'allarme hard va ON mentre OOO
  è attivo, lo stato OOO viene azzerato + emette `ooo:off` + TTS notifica
  ("Allarme attivato. Fuori servizio annullato."). Razionale: due stati
  "fuori servizio" sovrapposti sono ambigui per l'utente.

### Q2.5 — Language switch durante annuncio TTS
- **A. Lascia finire in lingua vecchia** *(approvato)*: nessun cambiamento.
  `setLang()` non interrompe TTS in corso. Più naturale di un taglio中途.

### Q2.6 — Bug latenti aggiuntivi (A/B/C/D)
- **A. Fix A+B+C, lascia D** *(approvato)*:
  - **A**: `setDoors(true)` con allarme ON → silent fail (era bug: nessun
    feedback). Ora: beep 220Hz + subtitle "Porte bloccate per allarme" 1.5s.
  - **B**: `setDoors(true)` con OOO ON → silent open (era bug: apriva le
    porte anche con OOO attivo). Ora: beep 220Hz + subtitle "Fuori servizio" 1.5s.
  - **C**: `setDoors(false)` ripetuto → annunciava "porte si chiudono" su
    ogni click (era spam). Ora: no-op + annuncio solo se `doorsActual > 0.05`.
  - **D**: `animateDoorsTo()` sostituiva `doorAnim` perdendo la `resolve()`
    della Promise precedente (memory leak minore). Lasciato perche' fix
    completo in Q2.3 risolve indirettamente (coda esplicita).

## Acceptance criteria

- [x] (Q2.2) Click display durante movimento → beep 440Hz + subtitle "Richiesta in coda" 1.5s
- [x] (Q2.3) Porte mid-animazione + click → promise chaining, no bounce, no leak
- [x] (Q2.3) Coda porte → processata correttamente dopo animazione corrente
- [x] (Q2.4) SOS ON mentre OOO ON → OOO forzato OFF + TTS notifica
- [x] (Q2.6 A) `setDoors(true)` con allarme → feedback audio+visivo (no silent fail)
- [x] (Q2.6 B) `setDoors(true)` con OOO → feedback audio+visivo (no silent open)
- [x] (Q2.6 C) `setDoors(false)` ripetuto → no spam annuncio chiusura
- [x] Test: 4 nuovi helper puri in `BossHotelPure` (`canOpenDoors`,
      `shouldAnnounceDoorClose`, `sosCancelsOOO`, `currentMovementDirection`)
- [x] Test: ~20 nuovi assert in `tests.html` sui nuovi helper
- [x] `node --check` + brace balance su entrambi i file

## Contratto D-key nuovo

- **D13**: Bug latenti emersi durante l'audit di Step 2 sono documentati e hanno
  decisione esplicita (fix o "leave alone" con razionale). Il bug D (memory leak
  promise) è lasciato perche' il refactor Q2.3 lo risolve indirettamente.

## Effort

1 sessione (~2-3 ore).

## Implementation note

Branch: `feature/v3-step-2-bugfix-ux` (creato, commit pending)
Test: 73 → 93+ assert (+20 nuovi su 4 helper puri)
File toccati: `elevator.html`, `tests.html`

---

---

# STEP 3 · Settings QoL (T1c)

Settings persistenti aggiuntivi per migliorare la qualità della vita
dell'utente. Volume audio suddiviso per canale + luminosità display
+ snapshot stato JSON per issue reporting.

## Decision Questions

### Q3.1 — Scope dello step
- **A. Tutto (audio + display + export)** *(approvato)*: implementati tutti
  e 3 i sotto-step proposti. Coerente con Q1.1=A dello Step 1.

### Q3.2 — UI sliders volume
- **A. Pannello dedicato (estensione pannello H Personalizza hotel)** *(approvato)*:
  aggiunti 4 sliders (3 audio + 1 display) come sezione "Impostazioni"
  all'interno del pannello esistente accessibile con tasto H. Nessun nuovo
  tasto aggiunto.

### Q3.3 — Display brightness
- **A. Canvas filter CSS** *(approvato)*: `ctx.filter = 'brightness(X)'`
  applicato in `drawModernDisplay()` con reset finale a `'none'`. Range
  0.5..1.5 (default 1.0). Reversibile, zero modifiche al codice draw interno.

### Q3.4 — Export stato JSON
- **A. Snapshot completo + log + cache** *(approvato)*: deep clone shallow
  di `state` (esclude funzioni), `_exportLog` (50 entry separate dal log UI),
  meta info (build version, lang, timestamp). Bottone "Esporta stato JSON"
  nel maintenance overlay (Shift+M). Scarica file
  `boss-hotel-state-<timestamp>.json`.

### Q3.5 — Persistenza localStorage
- **A. Due chiavi separate @v1** *(approvato)*: `bossHotelAudio@v1` +
  `bossHotelDisplay@v1`. Versioning esplicito, migrazione forward-compatible.

## Acceptance criteria

- [x] (Q3.1) 4 slider visibili nel pannello Personalizza hotel (H)
- [x] (Q3.1) Valori default corretti: effects=100%, music=50%, tts=85%, brightness=100%
- [x] (Q3.1) Modifica slider → aggiorna `state.audio.*` o `state.display.*` live
- [x] (Q3.1) Modifica slider → salva su localStorage @v1
- [x] (Q3.1) Reload pagina → slider riflettono valori salvati
- [x] (Q3.2) Effetti sonori (beep, chime, alarm, door, whoosh) rispettano state.audio.effects
- [x] (Q3.2) Musica (cabin jazz/classica + ristorante + corridoio) rispetta state.audio.music
- [x] (Q3.2) TTS (announceArrival/MoveStart/DoorClosing/Alarm) rispetta state.audio.tts
- [x] (Q3.3) Display touchscreen rispetta state.display.brightness via ctx.filter
- [x] (Q3.4) Bottone export visibile SOLO in maintenance overlay
- [x] (Q3.4) Click export → scarica JSON con state + exportLog + meta
- [x] (Q3.5) Due chiavi localStorage separate, v=1, formato compatibile
- [x] (Q3.5) Helper puri in `BossHotelPure`: `clampAudio`, `clampBrightness`, `formatVolumePercent`, `stateShapeForExport`
- [x] Test: 4 nuovi describe block, ~20 nuovi assert in `tests.html`
- [x] Smoke test: 0 errori console, slider persistono, export button visibile
- [x] `node --check` + brace balance

## Contratto D-key nuovo

- **D14**: Settings QoL persistiti in due chiavi localStorage separate
  (`bossHotelAudio@v1`, `bossHotelDisplay@v1`) con `v=1` per migrazione
  forward-compatible. Default `effects=1.0`, `music=0.5`, `tts=0.85`,
  `brightness=1.0`. Init `initSettingsQoL()` chiamato DOPO
  `loadAudioSettings/loadDisplaySettings` (le precedenti esperienze V2/V3
  mostrano che il bootstrap order è critico: sliders riflettono le preferenze
  salvate dell'utente, non i default).

## Effort

1 sessione (~2-3 ore).

## Implementation note

Branch: `feature/v3-step-3-settings-qol` (creato, commit pending)
Test: 93 → 113+ assert (+20 nuovi su 4 helper puri)
File toccati: `elevator.html`, `tests.html`, `PIANO_V3.md`, `PIANO_MIGLIORAMENTI.md`

Bug intermedio risolto: il primo tentativo di posizionamento del blocco
init QoL è finito dentro la funzione `loop()` (scope locale, initSettingsQoL
non visibile a livello modulo). Spostato dopo `requestAnimationFrame(loop);`
per avere scope globale. Errore rilevato immediatamente dallo smoke test
in-browser (`ReferenceError: initSettingsQoL is not defined`).

---

---

# STEP 4 · Micro-animazioni (T2a)

Micro-animazioni non essenziali per migliorare la qualità percepita. Focus
su respiro pulsantiera + lampeggio gentile pre-arrivo + fade morbido stati
+ curva bounce-out vibrazione post-arrivo.

## Decision Questions

### Q4.1 — Scope dello step
- **A. Tutti e 4 i sotto-step** *(approvato)*: implementati tutti. Pattern
  atomicità del feature (coerente con Step 1-3).

### Q4.2 — Tasti respiro: dove applicarlo
- **B. Tutti i tasti panel** *(approvato)*: sia celle display (canvas 2D)
  che 4 tasti fisici (mesh 3D buttonTop). Coerenza estetica.

### Q4.3 — Cartello lampeggio gentile
- **A. Ultimo secondo pre-arrivo** *(approvato)*: detection in tickMove
  tramite `moveElapsed > moveDuration - 1.0`. 3 flash a 6Hz tramite
  `arrivalFlashAlpha(animT, !state.reducedMotion)`.

### Q4.4 — Fade gentile cambi stato
- **B. Lerp + flash on/off** *(approvato)*: tickFadeStates() lerpa 200ms
  `alarmLight.intensity` + `emissiveIntensity` del pulsante citofono.
  Il flash on/off (50ms bianco) è lasciato come step futuro per non
  aumentare la complessità dello step corrente.

### Q4.5 — Easing bounce-out maniglione
- **A. Bounce-out classico** *(approvato)*: sostituisce `*= 0.85` con
  `state._vibSnap` snapshot all'arrivo + `easeOutBounce(elapsedS)` =
  `exp(-3t) * cos(8π t)`. Oscilla damped per ~1.5s poi smorzato a 0.

## Acceptance criteria

- [x] (Q4.1) 4 sotto-step implementati + commit unico
- [x] (Q4.2) Respiro pulsazione ±2% periodo 4s su canvas display + mesh 3D tasti
- [x] (Q4.2) Respiro skippato su prefers-reduced-motion / allarme / OOO / movimento
- [x] (Q4.3) Cartello lampeggia 3× in ultimo secondo pre-arrivo (gold tint overlay)
- [x] (Q4.3) Reset `_arrivalPhase='normal'` all'arrivo + all'inizio nuovo movimento
- [x] (Q4.4) Fade-in/out 200ms su alarmLight.intensity (lerp invece di snap)
- [x] (Q4.4) Fade-out 200ms su emissiveIntensity pulsante citofono
- [x] (Q4.4) Blink modulation salta durante fade-in (rispetta tickFadeStates)
- [x] (Q4.5) Vibrazione residua oscilla damped invece di decay esponenziale puro
- [x] (Q4.5) `_vibSnap` snapshot all'arrivo, decay completo entro 1.5s
- [x] Test: 5 nuovi helper puri in `BossHotelPure`, 4 nuovi describe block, ~25 assert
- [x] Smoke test: 0 errori console, helper accessibili e funzionanti
- [x] `node --check` + brace balance

## Contratto D-key nuovo

- **D15**: Micro-animazioni rispettano `state.reducedMotion` (D12). Animazioni
  essenziali (lampeggio allarme, vibrazione cabina, apertura/chiusura porte)
  restano attive anche con reduced motion per ragioni di sicurezza/realismo.
  Animazioni cosmetiche (respiro tasti, lampeggio gentile cartello, bounce-out
  vibrazione) sono skippate. Pattern di detection pre-arrivo via
  `moveElapsed > moveDuration - 1.0` + `state._arrivalPhase` come macchina
  a 2 stati ('normal' | 'blinking'). `movePaused` spostato in CONFIGURATION
  (TDZ safety coerente con state/hoveredBtn/buttonList).

## Effort

1 sessione (~2-3 ore).

## Implementation note

Branch: `feature/v3-step-4-micro-animations` (creato, commit pending)
Test: 113 → 138+ assert (+25 nuovi su 5 helper puri)
File toccati: `elevator.html`, `tests.html`, `PIANO_V3.md`, `PIANO_MIGLIORAMENTI.md`

Bug intermedio risolto: TDZ su `movePaused` (riferito in `drawModernDisplay`
per il breath check Q4.2). Errore emerso dallo smoke test
(`ReferenceError: Cannot access 'movePaused' before initialization`).
Fix: spostato `let movePaused = false;` da MOVIMENTO CABINA a CONFIGURATION
(pattern coerente con state, hoveredBtn, buttonList — lezione V2 bug TDZ).

---

---

# STEP 5 · Performance (T2b)

Ottimizzazione delle performance esistenti tramite profiling + draw call
reduction + texture LRU cache + display touch optimization. Pattern:
audit-first → fix mirati → benchmark verification.

## Decision Questions

### Q5.1 — Scope dello step
- **A. Tutti e 4 i sotto-step** *(approvato)*: profiling + draw call +
  texture LRU + display opt. Pattern atomicità del feature.

### Q5.2 — Draw call reduction con mergeGeometries
- **A. Merge per categoria** *(approvato)*: 3 pareti (sx+dx+fondo) in 1 mesh
  tramite `mergeGeometries` + `geometry.applyMatrix4`. 4 LED lampade in 1
  mesh + 4 frame in 1 mesh. Risparmio ~8 draw call per piano rebuild.

### Q5.3 — Texture cache LRU
- **A. Solo cabin textures** *(approvato)*: cache `drawMovingSign` base
  (no overlay) in offscreen canvas tramite `textureCache` LRU. Cache hit
  per il ~90% dei frame durante il lampeggio gentile (3/sec × 1s = 3 re-bake
  totali prima/dopo).

### Q5.4 — FPS profiling: come presentare le metriche
- **A. Maintenance overlay + benchmark automatico** *(approvato)*:
  `runBenchmark()` misura 5s idle + 5s moving + log + subtitle.

### Q5.5 — Shader optimization: focus su quale shader
- **A. Solo display touch** *(approvato)*: skip `ctx.filter = 'brightness(X)'`
  quando X === 1.0 (no-op costoso). Stesso pattern per breath scale (gia'
  implementato in Q4.2).

## Acceptance criteria

- [x] (Q5.1) 4 sotto-step implementati + commit unico
- [x] (Q5.2) 3 pareti merged in 1 mesh (risparmio -2 draw call)
- [x] (Q5.2) 4 LED lampade merged in 1 mesh + 4 frame in 1 mesh (-6 draw call)
- [x] (Q5.3) `textureCache` LRU capacity 10 + usato in `drawMovingSign`
- [x] (Q5.3) Cache hit su chiamate ripetute (stesso key)
- [x] (Q5.4) `runBenchmark` misura idle (5s) + moving (5s) + log
- [x] (Q5.4) Bottone "Benchmark 5s" visibile solo in maintenance overlay
- [x] (Q5.5) `ctx.filter` skip quando brightness === 1.0
- [x] Test: 3 nuovi helper puri in `BossHotelPure`, ~20 nuovi assert in `tests.html`
- [x] Smoke test: 0 errori console, helper accessibili, benchmark button visibile
- [x] `node --check` + brace balance

## Contratto D-key nuovo

- **D16**: Performance optimization pattern: `textureCache` LRU capacity 10
  per canvas texture della cabina, `mergeGeometries` per geometrie dello
  stesso materiale (richiede `applyMatrix4` per posizionare le singole
  geometrie prima del merge), skip no-op ctx.filter/transform quando
  valore === default. Benchmark via `runBenchmark()` + maintenance overlay
  per misurazione iterativa.

## Effort

1 sessione (~2-3 ore).

## Implementation note

Branch: `feature/v3-step-5-performance` (creato, commit pending)
Test: 138 → 158+ assert (+20 nuovi su 3 helper puri)
File toccati: `elevator.html`, `tests.html`, `PIANO_V3.md`, `PIANO_MIGLIORAMENTI.md`

---

---

# STEP 6 · QoL manutenzione (T2c)

Log eventi più ricco + history allarmi/interphonate + enhancement export JSON.
Focus su manutenzione realistica e issue reporting efficace.

## Decision Questions

### Q6.1 — Scope dello step
- **A. Tutti e 3 i sotto-step** *(approvato)*: log severity+category + history
  counters + export enhancement.

### Q6.2 — logEvent signature
- **A. info/warn/error** *(approvato)*: severity ∈ {info, warn, error},
  category ∈ {cabin, door, audio, state, maint}. Backwards-compat.

### Q6.3 — Filter UI
- **B. Toggle buttons** *(approvato)*: 5 toggle buttons (cabin/door/audio/state/maint)
  nel maintenance overlay. Stato in `state._logFilter`. Click = toggle visibility.

### Q6.4 — History depth + persistenza
- **B. 20 + persistenza** *(approvato)*: ultimi 20 eventi con timestamp
  persistiti in `localStorage.bossHotelHistory@v1`. Counter incrementale
  (`alarmCount`, `interphoneCount`) per "totale vita".

### Q6.5 — Export enhancement
- **A. Log filtrato + history** *(approvato)*: export JSON include
  log eventi filtrato per categoria+severity correnti + history arrays
  + counter + logFilter + lastBenchmark (se disponibile).

## Acceptance criteria

- [x] (Q6.1) 3 sotto-step implementati + commit unico
- [x] (Q6.2) logEvent(label, opts={severity, category}) backwards-compat
- [x] (Q6.2) _eventLog e _exportLog ora oggetti {ts, label, severity, category}
- [x] (Q6.3) 5 toggle buttons filter (cabin/door/audio/state/maint)
- [x] (Q6.3) Click toggle = cambia state._logFilter[cat] + classe .off
- [x] (Q6.4) state.alarmHistory + state.interphoneHistory (cap 20, FIFO)
- [x] (Q6.4) state.alarmCount + state.interphoneCount (counter vita)
- [x] (Q6.4) Persistenza localStorage `bossHotelHistory@v1`
- [x] (Q6.5) Export JSON include log filtrato + history + counter + logFilter + lastBenchmark
- [x] Test: 5 nuovi helper puri in `BossHotelPure`, ~25 nuovi assert in `tests.html`
- [x] Smoke test: 0 errori console, helpers accessibili, maintenance overlay mostra counters + 5 filter buttons
- [x] `node --check` + brace balance

## Contratto D-key nuovo

- **D17**: Log eventi strutturati con severity (info/warn/error) + category
  (cabin/door/audio/state/maint). Filter per category in maintenance overlay
  via toggle buttons + state._logFilter. History allarmi/interphonate
  persistita in `localStorage.bossHotelHistory@v1` (cap 20 + counter vita).
  Export JSON include log filtrato + history + counter + lastBenchmark.

## Effort

1 sessione (~2-3 ore).

## Implementation note

Branch: `feature/v3-step-6-qol-maintenance` (creato, commit pending)
Test: 158 → 183+ assert (+25 nuovi su 5 helper puri)
File toccati: `elevator.html`, `tests.html`, `PIANO_V3.md`, `PIANO_MIGLIORAMENTI.md`

---

---

# Stato V3 — progress overview

| # | Step | Stato | Commit | Branch |
|---|---|---|---|---|
| 1 | Accessibility (a11y) | ✅ done 2026-09-18 | `a26ccaf` + `bc070e0` | merged + cancellata |
| 2 | Bug fix UX sistematico | ✅ done 2026-09-18 | (vedi sotto) | merged + cancellata |
| 3 | Settings QoL | ✅ done 2026-09-22 | (vedi sotto) | merged + cancellata |
| 4 | Micro-animazioni | ✅ done 2026-09-23 | (vedi sotto) | merged + cancellata |
| 5 | Performance | ✅ done 2026-09-23 | (vedi sotto) | merged + cancellata |
| 6 | QoL manutenzione | ✅ done 2026-09-24 | (vedi sotto) | merged + cancellata |
| 6 | QoL manutenzione | ⏳ pending | — | — |
| 7 | Documentazione completa | ⏳ pending | — | — |
| 8 | Test coverage estesa | ⏳ pending | — | — |
| 9 | Mobile responsive layout | ⏳ pending | — | — |

**Risultato parziale**: **6/9 step completati (67%)** dopo sei sessioni V3.
Effort residuo stimato: ~3-7 ore su 2-6 sessioni (Step 7-9 ancora da fare).
T1 (high impact): 3/3 ✅ · T2: 3/3 ✅ · T3: 0/2 · Bonus: 0/1.

**Contratti D-key ereditati**: D1-D10 (V2) · **nuovi V3**: D11, D12, D13, D14, D15, D16, D17.

# Come procedere ora

**Step 6 QoL manutenzione (T2c) ✅ chiuso su branch dedicato (merge pending).**

Il prossimo step è **Step 7 · Documentazione completa (T3a)** —
commentare codice core (`tickMove`, `tickDoors`, `tickPlayer`,
`buildCorridor`, `getThemeForFloor`), diagrammi ASCII delle dipendenze,
documentare `STRINGS[lang]` mapping completo. Vedi §Scope Step 7 sopra.

Workflow per Step 7:

1. Apri la sezione §Scope Step 7 e leggi i sotto-step proposti.
2. Rispondi alle Decision Questions quando definite.
3. Implemento solo le opzioni approvate.
4. Aggiorno `PIANO_V3.md` segnando lo step come ✅.
5. `node scripts/check-balance.js elevator.html` dopo ogni modifica.

Pattern: branch dedicato `feature/v3-step-7-documentation`, merge `--no-ff`.

---

**Polish Pack V3 è ufficialmente aperto.** Step 1 + 2 + 3 + 4 + 5 + 6 chiusi; Step 7 (Documentazione T3a) è il prossimo.
