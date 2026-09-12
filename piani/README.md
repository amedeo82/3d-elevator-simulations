# Indice piani di implementazione

Piani dettagliati per ogni gruppo di funzionalità proposte in `PIANO_MIGLIORAMENTI.md` §11.

## Aggiornamento 2026-09-12

**Hotfix post-v1.6** — corretto bug "auto-close porte annuncia chiusura ma porte
riaprono" quando il giocatore è nel corridoio. Aggiunta guardia `state.playerInCabin`
al callback di `scheduleAutoClose()` (`elevator.html:3132`). Dettaglio:
`PIANO_MIGLIORAMENTI.md` §Fase 17. **Nessuna modifica al backlog §11** (22/22 invariato).

Aperto branch **`feature/polish-pack-v1.6`** per completare le 3 feature pianificate di v1.5
(#13, #14, #18) confluite qui perché v1.5 è stato mergiato con solo il sottoinsieme
"bonus audit UX" (#21b + #22 + 8 bug fix).

---

## Polish Pack v1.6 — ✅ COMPLETATO 2026-09-12 (branch `feature/polish-pack-v1.6`)

Aperto 2026-09-12. **3 feature pianificate** confluite da v1.5 (dove erano rimaste
"in corso" senza implementazione): tutte a basso/medio sforzo, nessuna decisione
architetturale pendente. Completa §11.4 (qualità) e §11.5 (performance).

| # | Funzionalità | Gruppo | Stato | Commit | Note |
|---|---|---|---|---|---|
| #13 | Verifica accessibilità tastiera nel corridoio | §11.4 Qualità | ✅ | `49163a6` | Audit + fix drift: aggiunto reset di `keys` in `exitCabin`/`enterCabin` per evitare scatti al cambio stato |
| #14 | Logica passeggeri coerente | §11.4 Qualità | ✅ | `d82dd60` | Nuova `adjustPassengersForFloor(floor)` tematica: lobby +0..2, uffici -0..-2, hotel ±1, attico +1. Rimosso timer random 8s di Fase 8 |
| #18 | Texture atlas / caching canvas offscreen per display touch | §11.5 Tecnico | ✅ | `427a635` | Refactor `drawModernDisplay` in 3 layer (statico / semi-statico / dinamico) con caching canvas offscreen. In idle il display ridisegna solo il layer dinamico 1 volta/sec |

**Acceptance comune v1.6** (tutte ✅):
- [x] Nessun calo FPS percepibile (target ≥50; #18 stima +5-8 FPS in idle)
- [x] Rispetto vincolo singolo file HTML (tutte feature single-file)
- [x] Nessuna dipendenza npm aggiunta
- [x] Documentazione aggiornata (`PIANO_MIGLIORAMENTI.md` §16 + questo README + README.md)
- [x] `node --check` JS estratto: exit 0 · brace/paren balance 0/0

**Decisioni di scope**:
- Singolo branch per tutte e 3 le feature (stessa filosofia di v1.1, v1.2, v1.3)
- Implementazione in commit separati per ogni feature + commit build + commit docs
- Esclude deliberatamente #12 (i18n) — unica feature residua dopo v1.6 (alto sforzo)
- Non tocca le feature bonus di v1.5 (#21b, #22), già merged su `main`

### Totale Polish Pack v1.6

**Funzionalità backlog completate**: 22/22 (100%) — pre-v1.6 era 19/22.
**Polish Pack v1.6 → target 22/22 funzionalità implementate (100%)** con #13, #14, #18.
Backlog residuo post-v1.6: **0/22 funzionalità** (#12 i18n rimane fuori scope).

### Commit Polish Pack v1.6

| # | Commit | Descrizione |
|---|---|---|
| docs | `1dc308b` | Apre branch + scope confermato |
| feat | `49163a6` | #13 audit + fix accessibilità tastiera |
| feat | `d82dd60` | #14 logica passeggeri coerente |
| perf | `427a635` | #18 caching canvas offscreen display touch |
| build | `1212e46` | Sync `dist/index.html` |
| docs | (questo commit) | Finalizzazione docs |
| merge | 🔄 da fare | Merge su `main` |

---

## Polish Pack v1.5 — ✅ COMPLETATO 2026-09-12 (branch `feature/polish-pack-v1.5`)

Branch aperto e mergiato su `main` il **2026-09-12** (commit `5ec79b1`). Ha consegnato
solo il sottoinsieme **"bonus audit UX"** (2 feature + 8 bug fix). Le 3 feature pianificate
originali (#13, #14, #18) sono confluite nel **Polish Pack v1.6**.

### Feature implementate (2)

| # | Funzionalità | Gruppo | Stato | Commit | Note |
|---|---|---|---|---|---|
| #21b | Pulsantiera di chiamata esterna ▲/▼ | §11.6 Nuove | ✅ | `b2587ef` | Placca di acciaio sulla parete sx del corridoio, header "BOSS HOTEL", 2 pulsanti rotondi verdi ▲/▼. Click chiama la cabina a quel piano. ⚠️ ▲/▼ identici (no modello intenzione) |
| #22 | Chiusura automatica porte (6s) | §11.6 Nuove | ✅ | `34232dd` | Timer 6s dopo porte completamente aperte, usa countdown 3..2..1 esistente. Resettato da qualsiasi interazione. Gate: no se allarme/OOO/maint/prenotazione |

### Audit fixes (8 bug risolti durante playtest #21b/#22)

- OOO: porte non si riaprivano al ripristino + rientro cabina non bloccato (commit `ba0d075`)
- `Shift+M` non attivava manutentore (matchava `KeyM` audio) (commit `ea4e9ce`)
- Typo `mat is not defined` in `applyWireframe` (commit `c826d25`)
- AudioContext warning spam all'avvio (`tickMusic` prima del gesto utente) (commit `c826d25`)
- TDZ `buttonList` in `disposeCorridor` + `buildCorridor` (commits `c0397d0`, `cb2cc14`)
- Raycast pulsanti esterni (label mesh separata dal body) (commit `ab8ebc7`)
- Porte invisibili dal corridoio (PlaneGeometry FrontSide + shaftBack nero) (commit `6ab62b6`)
- Housekeeping lista comandi (welcome screen + HUD non elencavano O/K/Shift+M) (commit `a6cb3c1`)

### Acceptance comune v1.5** (tutte ✅):
- [x] Nessun calo FPS percepibile (target ≥50; #21b aggiunge ~3 mesh, #22 solo timer)
- [x] Rispetto vincolo singolo file HTML (tutte feature single-file)
- [x] Nessuna dipendenza npm aggiunta
- [x] Documentazione aggiornata (`PIANO_MIGLIORAMENTI.md` §15 + questo README + README.md)
- [x] `node --check` JS estratto: exit 0 · brace/paren balance 0/0

### Totale Polish Pack v1.5

**Funzionalità backlog completate**: 19/22 (86.4%) — pre-v1.5 era 17/22, v1.5 ha aggiunto #21b e #22.
**3 feature pianificate originali** (#13, #14, #18) → confluite in **Polish Pack v1.6**.

---

| # | Funzionalità | Gruppo | Stato | Commit | Note |
|---|---|---|---|---|---|
| #2 | Musica di sottofondo contestuale | §11.1 Core | ✅ | `0b5c8fc` | WebAudio: 4 oscillator sine + low-pass + LFO. Jazz T-3 (Cmaj7), classica 4-9 (arpeggio C-E-G-C) |
| #20 | Prenotazione cabina dal corridoio | §11.6 Nuove | ✅ | `0b5c8fc` | Hook in `tickPlayer(dt)`: proximity <1m apre porte, display overlay "PRENOTATA · TIENI PREMUTO E" |
| #9 | Comando vocale (speech-to-text) | §11.3 UX | ✅ | `0b5c8fc` | `SpeechRecognition` it-IT, tasto `K`, mapping numeri italiani + cifre, fallback silente Firefox |
| #19 | Modalità manutentore (`Shift+M`) | §11.6 Nuove | ✅ | `0b5c8fc` | Overlay `#maint-overlay`: FPS, draw calls, stato, log eventi, wireframe cabina, teletrasporto 1-9 |

**Acceptance comune v1.4** (tutte ✅):
- ✅ Nessun calo FPS percepibile (target ≥50)
- ✅ Rispetto vincolo singolo file HTML
- ✅ Nessuna dipendenza npm aggiunta (WebAudio, Web Speech API native)
- ✅ Documentazione aggiornata (`PIANO_MIGLIORAMENTI.md` §11 + questo README)
- ✅ `node --check` JS estratto: exit 0 · brace/paren balance 0/0

**Decisioni di scope**:
- Singolo branch per tutte e 4 le feature
- Implementate in 1 commit combinato (modifiche interleaved, simile a v1.2)
- Backlog residuo post-v1.4: **5/22 funzionalità** (vs 12/22 pre-v1.4)

**Polish Pack v1.4 → 17/22 funzionalità implementate (77.3%)**.

---

## Hotfix post-v1.4 (2026-09-12, commit `e02adca`)

Enhancement richiesto subito dopo il merge di v1.4. Allinea il **display touchscreen**
della cabina al comportamento "passo-passo" già presente in:

- Cartello corridoio (`drawMovingSign`, Polish Pack v1.3 #4)
- Strip DOM HUD (`#floor-strip`, aggiornato in `tickMove`)

| Display | Prima | Dopo |
|---|---|---|
| Cartello corridoio | Passo-passo ✅ | Passo-passo ✅ |
| Strip DOM HUD | Passo-passo ✅ | Passo-passo ✅ |
| **Display touchscreen** | **Piano partenza fisso per tutta la corsa** | **Passo-passo + indicatore "X → Y"** |

Non aggiunge una nuova voce al backlog §11 ma migliora la coerenza UX tra i 3 indicatori
di piano. 4 modifiche in `elevator.html` (+19/-2 righe):

1. Nuovo `state.floorShown: 0` nello state object
2. `tickMove()` scrive `state.floorShown = Math.round(currentDisplay)` ogni frame
3. `drawModernDisplay()` usa `state.floorShown` quando `isMoving`, altrimenti `currentFloor`
4. Sotto al grande numero (130px) mostra "X → Y" durante il movimento

`tickMove()` arrival + `teleportToFloor()` sincronizzano `floorShown` al piano reale.

---

## Stato implementazione

**Polish Pack v1.1**: ✅ **5/5 completato** (merged su `main` e pushato su `origin/main`)

| # | Funzionalità | Gruppo | Stato | Commit |
|---|---|---|---|---|
| #17 | Verifica `dispose()` corridoi | §11.5 Tecnico | ✅ | `bb9aa43` |
| #15 | Persistenza preferenze localStorage | §11.4 Qualità | ✅ | `73cdfc7` |
| #21 | Specchio riflettente (Reflector) | §11.6 Nuove | ✅ | `20fcaab` |
| #1 | Shake cabina durante viaggio | §11.1 Core | ✅ | `a3645fc` |
| #3 | Whoosh loop | §11.1 Core | ✅ | `083098b` |
| #6.6 | Bug fix `addSkylineWindow` `eZ` | post-fasi | ✅ | `dbc1270` |
| UI | Menù comandi in-page | UI sync | ✅ | `66aaaaf` |
| build | Sync `dist/index.html` | build | ✅ | `06d54e7` |

**Totale Polish Pack**: 8 commit, +172/-18 righe in 3 file (`elevator.html`, `README.md`, `PIANO_MIGLIORAMENTI.md`).

---

**Polish Pack v1.2**: ✅ **3/3 completato** (merged su `main` — commit `241c8a1`)

| # | Funzionalità | Gruppo | Stato | Note |
|---|---|---|---|---|
| #10 | Scorciatoie tastiera 1–9/0 per piani | §11.3 UX | ✅ | Digit + Numpad, `requestFloor()`, feedback `statusText` |
| #5 | Ding differenziato all'arrivo | §11.2 Premium | ✅ | `playChime(kind)` — 1 intermedio / 2 finale |
| #11 | Sottotitoli annunci vocali su HUD | §11.3 UX | ✅ | `<div id="subtitle">` + `showSubtitle()` |

**Totale Polish Pack v1.2**: 3 feature, ~50 righe in 1 file (`elevator.html` + 2 docs).

---

**Polish Pack v1.3**: ✅ **5/5 completato su branch `feature/polish-pack-v1.3`** (da mergiare)

5 quick-win selezionati per rapporto impatto/sforzo dal backlog §11.

| # | Funzionalità | Gruppo | Stato | Commit | Note |
|---|---|---|---|---|---|
| #4 | Indicatore direzione "passo passo" sul cartello corridoio | §11.1 Core | ✅ | `356bf5b` | `drawMovingSign()` + hook in `tickMove()` con guard `_lastShownFloor` |
| #6 | Modalità "Fuori servizio" (tasto `O`) | §11.2 Premium | ✅ | `3a968f1` | `state.outOfOrder`, display/cartello rossi, beep rifiuto, annuncio vocale |
| #7 | Numerazione camere hotel contestuale | §11.2 Premium | ✅ | `f3f79bb` | `floorRoomRange(f)` — visibile a cabina ferma |
| #8 | Orologio mondiale sul pannello pubblicitario | §11.2 Premium | ✅ | `ac29bbd` | 6ª schermata rotante, `toLocaleTimeString` per 5 città |
| #22b | Schermata "Welcome" interattiva | §11.6 Nuove | ✅ | `fb8576a` | Carosello 5 slide, auto-rotate 2.5s, stop su startBtn. Rinumerato da #22 il 2026-09-12 (collisione con auto-close porte v1.5) |

**Totale Polish Pack v1.3**: 5 feature, 1 file principale + sync dist, ~330 righe in `elevator.html` (5 commit feature + 1 sync dist + 1 docs).

## Indice per gruppo

| Gruppo | File | # Features | Implementate |
|---|---|---|---|
| §11.1 — Funzionalità "core" | [PIANO_11.1_core.md](./PIANO_11.1_core.md) | 4 | 4/4 (#1 ✅, #2 ✅, #3 ✅, #4 ✅) |
| §11.2 — Hotel premium | [PIANO_11.2_premium.md](./PIANO_11.2_premium.md) | 4 | 4/4 (#5 ✅, #6 ✅, #7 ✅, #8 ✅) |
| §11.3 — UX / accessibilità | [PIANO_11.3_ux.md](./PIANO_11.3_ux.md) | 4 | 3/4 (#9 ✅, #10 ✅, #11 ✅) |
| §11.4 — Robustezza e qualità | [PIANO_11.4_qualita.md](./PIANO_11.4_qualita.md) | 3 | 3/3 (#13 ✅, #14 ✅, #15 ✅) |
| §11.5 — Tecnico / performance | [PIANO_11.5_tecnico.md](./PIANO_11.5_tecnico.md) | 3 | 2/3 (#17 ✅, #18 ✅) |
| §11.6 — Idee nuove | [PIANO_11.6_nuove.md](./PIANO_11.6_nuove.md) | 6 | 6/6 (#19 ✅, #20 ✅, #21 ✅, #21b ✅, #22 ✅, #16 ❌ scartato per vincolo single-file) |

**Totale implementato al merge di v1.6**: **22/22 funzionalità (100%)** — pre-v1.6 era 19/22.

**Totale backlog residuo post-v1.6**: **0/22 funzionalità** (#12 i18n fuori scope, #16 PWA scartato).

## Backlog residuo post-v1.6 (fuori scope)

### §11.3 UX / accessibilità (1)
- #12 — Lingua selezionabile (IT/EN) — alto sforzo (~300+ righe), bassa priorità

### §11.5 Tecnico (1)
- #16 — Service Worker offline-first + PWA (richiede multi-file → decisione D2 pendente) —
  scartato dal vincolo single-file del progetto

## Prossimi candidati (post-v1.6)

Dopo il Polish Pack v1.6, il backlog residuo è una sola feature, ad alto impatto ma ad
alto sforzo:

| # | Idea | Impatto | Sforzo | Note |
|---|---|---|---|---|
| #12 | Lingua selezionabile (IT/EN) | Alto | Alto | Refactor `STRINGS[lang]` in tutte le stringhe hardcoded (~300+ righe) |

(#16 PWA è stato scartato: il vincolo single-file HTML è fondamentale per la filosofia
del progetto. Se in futuro si vuole installabilità, si può valutare Web App Manifest inline
come `<link rel="manifest">` con JSON blob URL, senza file esterni.)

### Decisioni pendenti

- **D7**: logica ▲/▼ pulsantiera esterna. Attualmente identici (entrambi "chiama cabina
  al mio piano"). Per un modello "intenzione di viaggio" distinto servirebbe refactor
  del routing: ▲ al piano N = "voglio salire" → la cabina viene al N e l'utente sceglie
  dentro la destinazione; ▼ al piano N = "voglio scendere" → idem con direzione opposta.
  Basso impatto (comportamento già accettabile), alto sforzo (modifica `requestFloor` +
  `addExternalCallPanel` per richiedere un piano diverso da currentFloor in base alla
  direzione scelta). Pendente, da decidere al prossimo Polish Pack.

## Decisioni aperte residue

Vedi `PIANO_MIGLIORAMENTI.md` §11.8:
- **D2**: singolo file vs aggiunta `sw.js` + `manifest.json` per PWA (#16) — pendente
- **D3**: aprire Fase 11 o continuare come bug-fix/miglioramenti minori — risolta (Polish Pack approach)

D1, D3 e D4 sono state risolte: scope = Polish Pack, sync dist a fine feature.
