# Indice piani di implementazione

Piani dettagliati per ogni gruppo di funzionalità proposte in `PIANO_MIGLIORAMENTI.md` §11.

## Aggiornamento 2026-09-12

Aperto e completato branch **`feature/polish-pack-v1.4`** con 4 feature implementate dal backlog §11.

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
| #22 | Schermata "Welcome" interattiva | §11.6 Nuove | ✅ | `fb8576a` | Carosello 5 slide, auto-rotate 2.5s, stop su startBtn |

**Totale Polish Pack v1.3**: 5 feature, 1 file principale + sync dist, ~330 righe in `elevator.html` (5 commit feature + 1 sync dist + 1 docs).

## Indice per gruppo

| Gruppo | File | # Features | Implementate |
|---|---|---|---|
| §11.1 — Funzionalità "core" | [PIANO_11.1_core.md](./PIANO_11.1_core.md) | 4 | 4/4 (#1 ✅, #2 ✅, #3 ✅, #4 ✅) |
| §11.2 — Hotel premium | [PIANO_11.2_premium.md](./PIANO_11.2_premium.md) | 4 | 4/4 (#5 ✅, #6 ✅, #7 ✅, #8 ✅) |
| §11.3 — UX / accessibilità | [PIANO_11.3_ux.md](./PIANO_11.3_ux.md) | 4 | 3/4 (#9 ✅, #10 ✅, #11 ✅) |
| §11.4 — Robustezza e qualità | [PIANO_11.4_qualita.md](./PIANO_11.4_qualita.md) | 3 | 1/3 (#15 ✅) |
| §11.5 — Tecnico / performance | [PIANO_11.5_tecnico.md](./PIANO_11.5_tecnico.md) | 3 | 1/3 (#17 ✅) |
| §11.6 — Idee nuove | [PIANO_11.6_nuove.md](./PIANO_11.6_nuove.md) | 4 | 4/4 (#19 ✅, #20 ✅, #21 ✅, #22 ✅) |

**Totale implementato**: 17/22 funzionalità (77.3%) — *vedi nota*.

**Totale backlog residuo post-v1.4**: 4/22 funzionalità non ancora implementate
(#12 i18n, #13 accessibilità tastiera, #14 logica passeggeri, #16 PWA, #18 texture atlas).
Apparentemente 5 voci ma #12 e #16 sono raggruppate: in realtà sono 5 backlog items singoli.

> *Aggiornamento conteggio: Polish Pack v1.4 ha aggiunto 4 feature (#2 #9 #19 #20). Totale
> corretto: 17/22 implementate, 5/22 backlog (#12, #13, #14, #16, #18).*

## Funzionalità non implementate (backlog residuo post-v1.4)

### §11.3 UX / accessibilità (1)
- #12 — Lingua selezionabile (IT/EN)

### §11.4 Qualità (2)
- #13 — Verifica accessibilità tastiera nel corridoio
- #14 — Logica passeggeri coerente

### §11.5 Tecnico (2)
- #16 — Service Worker offline-first + PWA (richiede multi-file → decisione D2)
- #18 — Texture atlas / caching canvas offscreen

## Prossimi candidati (post-v1.4)

Dopo il Polish Pack v1.4, le feature residue nel backlog sono tutte a bassa priorità o ad
alto sforzo. Le priorità candidate per Polish Pack v1.5 o successivi:

| # | Idea | Impatto | Sforzo | Note |
|---|---|---|---|---|
| #12 | Lingua selezionabile (IT/EN) | Alto | Alto | Refactor `STRINGS[lang]` in tutte le stringhe hardcoded |
| #16 | Service Worker + PWA installabile | Alto | Medio | Richiede 2 file esterni (`sw.js` + `manifest.json`) — D2 pendente |
| #14 | Logica passeggeri coerente | Basso | Medio | Estensione di Fase 8 — coerenza salita/discesa ai piani tematici |
| #13 | Verifica accessibilità tastiera nel corridoio | Medio | Basso | Test in playtest per drift camera WASD |
| #18 | Texture atlas / caching canvas offscreen | Medio | Medio | Performance del display touch |

## Decisioni aperte residue

Vedi `PIANO_MIGLIORAMENTI.md` §11.8:
- **D2**: singolo file vs aggiunta `sw.js` + `manifest.json` per PWA (#16) — pendente
- **D3**: aprire Fase 11 o continuare come bug-fix/miglioramenti minori — risolta (Polish Pack approach)

D1, D3 e D4 sono state risolte: scope = Polish Pack, sync dist a fine feature.
