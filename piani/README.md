# Indice piani di implementazione

Piani dettagliati per ogni gruppo di funzionalità proposte in `PIANO_MIGLIORAMENTI.md` §11.

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

**Polish Pack v1.3**: 🟡 **0/5 in corso su branch `feature/polish-pack-v1.3`** (creato 2026-09-11)

5 quick-win selezionati per rapporto impatto/sforzo dal backlog §11.

| # | Funzionalità | Gruppo | Stato | Effort | Note |
|---|---|---|---|---|---|
| #4 | Indicatore direzione "passo passo" sul cartello corridoio | §11.1 Core | 🟡 | ~30 righe | `drawMovingSign(floorShown)` + hook in `tickMove()` |
| #6 | Modalità "Fuori servizio" (tasto `O`) | §11.2 Premium | 🟡 | ~40 righe + texture | `state.outOfOrder`, display rosso, annuncio vocale |
| #7 | Numerazione camere hotel contestuale | §11.2 Premium | 🟡 | ~15 righe | `floorRoomRange(f)` + sezione nel display |
| #8 | Orologio mondiale sul pannello pubblicitario | §11.2 Premium | 🟡 | ~30 righe | 6ª schermata rotante con `toLocaleTimeString` |
| #22 | Schermata "Welcome" interattiva | §11.6 Nuove | 🟡 | ~30 righe HTML/CSS/JS | Carosello 5 slide, auto-rotate 2.5s |

**Totale Polish Pack v1.3** (a completamento): 5 feature, ~145 righe + HTML/CSS, 1 file (`elevator.html` + docs).

**Decisioni**:
- **Deploy**: sync `dist/index.html` solo a fine feature (come v1.1 / v1.2)
- **Commit**: 1 commit per feature + commit di chiusura `Polish Pack v1.3 completato`
- **Acceptance comune**: nessun calo FPS, tasto `O` documentato in help HUD, cleanup risorse

## Indice per gruppo

| Gruppo | File | # Features | Implementate |
|---|---|---|---|
| §11.1 — Funzionalità "core" | [PIANO_11.1_core.md](./PIANO_11.1_core.md) | 4 | 2/4 (#1 ✅, #3 ✅) — **#4 in corso** |
| §11.2 — Hotel premium | [PIANO_11.2_premium.md](./PIANO_11.2_premium.md) | 4 | 1/4 (#5 ✅) — **#6, #7, #8 in corso** |
| §11.3 — UX / accessibilità | [PIANO_11.3_ux.md](./PIANO_11.3_ux.md) | 4 | 2/4 (#10 ✅, #11 ✅) |
| §11.4 — Robustezza e qualità | [PIANO_11.4_qualita.md](./PIANO_11.4_qualita.md) | 3 | 1/3 (#15 ✅) |
| §11.5 — Tecnico / performance | [PIANO_11.5_tecnico.md](./PIANO_11.5_tecnico.md) | 3 | 1/3 (#17 ✅) |
| §11.6 — Idee nuove | [PIANO_11.6_nuove.md](./PIANO_11.6_nuove.md) | 4 | 1/4 (#21 ✅) — **#22 in corso** |

**Totale backlog residuo post-v1.3**: 12/22 funzionalità non ancora implementate.

## Funzionalità non implementate (backlog residuo post-v1.3)

### §11.1 Core (1)
- #2 — Musica di sottofondo contestuale (jazz/classica per piano)

### §11.3 UX / accessibilità (2)
- #9 — Comando vocale (speech-to-text)
- #12 — Lingua selezionabile (IT/EN)

### §11.4 Qualità (2)
- #13 — Verifica accessibilità tastiera nel corridoio
- #14 — Logica passeggeri coerente

### §11.5 Tecnico (2)
- #16 — Service Worker offline-first + PWA (richiede multi-file → decisione D2)
- #18 — Texture atlas / caching canvas offscreen

### §11.6 Nuove (3)
- #19 — Modalità manutentore (`Shift+M`)
- #20 — Sistema di prenotazione cabina dal corridoio

**Backlog §11.6** dopo v1.3: 2 residue (era 3, con #22 completato).

## Prossimi candidati (post-v1.3)

| # | Idea | Impatto | Sforzo | Note |
|---|---|---|---|---|
| #2 | Musica di sottofondo contestuale | Alto | Medio | Backlog §11.1. WebAudio oscillator loop |
| #20 | Prenotazione automatica dal corridoio | Alto | Medio | Backlog §11.6. Proximity check nel loop FPS |
| #9 | Comando vocale | Alto | Medio | Backlog §11.3. SpeechRecognition API |
| #19 | Modalità manutentore | Basso | Medio | Backlog §11.6. Overlay debug, `Shift+M` |

## Decisioni aperte residue

Vedi `PIANO_MIGLIORAMENTI.md` §11.8:
- **D2**: singolo file vs aggiunta `sw.js` + `manifest.json` per PWA (#16) — pendente
- **D3**: aprire Fase 11 o continuare come bug-fix/miglioramenti minori — risolta (Polish Pack approach)

D1, D3 e D4 sono state risolte: scope = Polish Pack, sync dist a fine feature.
