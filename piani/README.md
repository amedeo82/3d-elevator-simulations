# Indice piani di implementazione

Piani dettagliati per ogni gruppo di funzionalità proposte in `PIANO_MIGLIORAMENTI.md` §11.

## Aggiornamento 2026-09-12

Aperto branch **`feature/polish-pack-v1.4`** con scope confermato dall'utente: 4 feature
selezionate dal backlog §11 (candidati post-v1.3), ordinate per impatto/sforzo.

| # | Funzionalità | Gruppo | Stato | Branch | Note |
|---|---|---|---|---|---|
| #2 | Musica di sottofondo contestuale | §11.1 Core | 🟡 in corso | `feature/polish-pack-v1.4` | WebAudio loop, jazz lobby / classica attico, silenzia su allarme |
| #20 | Prenotazione cabina dal corridoio | §11.6 Nuove | 🟡 in corso | `feature/polish-pack-v1.4` | Proximity check (<1m) → porte si aprono, display "PRENOTATA" |
| #9 | Comando vocale (speech-to-text) | §11.3 UX | 🟡 in corso | `feature/polish-pack-v1.4` | `SpeechRecognition` API it-IT, mapping "piano N" → `requestFloor(N)` |
| #19 | Modalità manutentore (`Shift+M`) | §11.6 Nuove | 🟡 in corso | `feature/polish-pack-v1.4` | Wireframe overlay + FPS/drawcalls + teletrasporto `1`–`9` |

**Acceptance comune v1.4**:
- [ ] Nessun calo FPS percepibile (target ≥50)
- [ ] Rispetto vincolo singolo file HTML
- [ ] Nessuna dipendenza npm aggiunta (WebAudio, Web Speech API native)
- [ ] Documentazione aggiornata (`PIANO_MIGLIORAMENTI.md` §11 + questo README)

**Decisioni di scope**:
- Singolo branch per tutte e 4 le feature (un commit per feature + commit di sync docs)
- Approccio speculare a v1.3: un Polish Pack = un branch
- Backlog residuo post-v1.4 stimato: 8/22 funzionalità (vs 12/22 attuali)

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
| §11.1 — Funzionalità "core" | [PIANO_11.1_core.md](./PIANO_11.1_core.md) | 4 | 3/4 (#1 ✅, #3 ✅, #4 ✅) |
| §11.2 — Hotel premium | [PIANO_11.2_premium.md](./PIANO_11.2_premium.md) | 4 | 4/4 (#5 ✅, #6 ✅, #7 ✅, #8 ✅) |
| §11.3 — UX / accessibilità | [PIANO_11.3_ux.md](./PIANO_11.3_ux.md) | 4 | 2/4 (#10 ✅, #11 ✅) |
| §11.4 — Robustezza e qualità | [PIANO_11.4_qualita.md](./PIANO_11.4_qualita.md) | 3 | 1/3 (#15 ✅) |
| §11.5 — Tecnico / performance | [PIANO_11.5_tecnico.md](./PIANO_11.5_tecnico.md) | 3 | 1/3 (#17 ✅) |
| §11.6 — Idee nuove | [PIANO_11.6_nuove.md](./PIANO_11.6_nuove.md) | 4 | 2/4 (#21 ✅, #22 ✅) |

**Totale backlog residuo post-v1.3 (pre-v1.4)**: 12/22 funzionalità non ancora implementate.

**Polish Pack v1.4** (in corso su `feature/polish-pack-v1.4`) mira a chiudere 4 di queste 12:
#2 (Core), #9 (UX), #19 e #20 (Nuove). Backlog residuo post-v1.4 stimato: 8/22.

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

### §11.6 Nuove (2)
- #19 — Modalità manutentore (`Shift+M`)
- #20 — Sistema di prenotazione cabina dal corridoio

## Prossimi candidati (post-v1.4)

Dopo il Polish Pack v1.4, le feature ad alto impatto ancora nel backlog sono poche. Le priorità
candidate per Polish Pack v1.5 o successivi:

| # | Idea | Impatto | Sforzo | Note |
|---|---|---|---|---|
| #12 | Lingua selezionabile (IT/EN) | Alto | Alto | Refactor `STRINGS[lang]` in tutte le stringhe hardcoded |
| #16 | Service Worker + PWA installabile | Alto | Medio | Richiede 2 file esterni (`sw.js` + `manifest.json`) — D2 pendente |
| #14 | Logica passeggeri coerente | Basso | Medio | Estensione di Fase 8 — coerenza salita/discesa ai piani tematici |
| #13 | Verifica accessibilità tastiera nel corridoio | Medio | Basso | Test in playtest per drift camera WASD |

Nota: #2, #9, #19, #20 sono stati **promossi** da "Prossimi candidati" allo scope di Polish Pack v1.4
e sono ora tracciati nella sezione "Aggiornamento 2026-09-12" in cima a questo README.

## Decisioni aperte residue

Vedi `PIANO_MIGLIORAMENTI.md` §11.8:
- **D2**: singolo file vs aggiunta `sw.js` + `manifest.json` per PWA (#16) — pendente
- **D3**: aprire Fase 11 o continuare come bug-fix/miglioramenti minori — risolta (Polish Pack approach)

D1, D3 e D4 sono state risolte: scope = Polish Pack, sync dist a fine feature.
