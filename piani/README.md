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

## Indice per gruppo

| Gruppo | File | # Features | Implementate |
|---|---|---|---|
| §11.1 — Funzionalità "core" | [PIANO_11.1_core.md](./PIANO_11.1_core.md) | 4 | 2/4 (#1 ✅, #3 ✅) |
| §11.2 — Hotel premium | [PIANO_11.2_premium.md](./PIANO_11.2_premium.md) | 4 | 0/4 |
| §11.3 — UX / accessibilità | [PIANO_11.3_ux.md](./PIANO_11.3_ux.md) | 4 | 0/4 |
| §11.4 — Robustezza e qualità | [PIANO_11.4_qualita.md](./PIANO_11.4_qualita.md) | 3 | 1/3 (#15 ✅) |
| §11.5 — Tecnico / performance | [PIANO_11.5_tecnico.md](./PIANO_11.5_tecnico.md) | 3 | 1/3 (#17 ✅) |
| §11.6 — Idee nuove | [PIANO_11.6_nuove.md](./PIANO_11.6_nuove.md) | 4 | 1/4 (#21 ✅) |

**Totale backlog residuo**: 17/22 funzionalità non ancora implementate.

## Funzionalità non implementate (backlog residuo)

### §11.1 Core (2)
- #2 — Musica di sottofondo contestuale (jazz/classica per piano)
- #4 — Indicatore direzione "passo passo" sul cartello corridoio

### §11.2 Hotel premium (4)
- #5 — Suono "ding" differenziato all'arrivo
- #6 — Modalità "Fuori servizio" (tasto O)
- #7 — Numerazione camere hotel contestuale
- #8 — Orologio mondiale sul pannello pubblicitario

### §11.3 UX / accessibilità (4)
- #9 — Comando vocale (speech-to-text)
- #10 — Scorciatoie tastiera 1-9 per piani
- #11 — Sottotitoli per annunci vocali
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
- #22 — Schermata "Welcome" interattiva

## Ordine di implementazione raccomandato (prossimi)

Da `PIANO_MIGLIORAMENTI.md` §11.7, dopo Polish Pack v1.1 i candidati per impatto/sforzo sono:

| # | Idea | Impatto | Sforzo |
|---|---|---|---|
| #10 | Scorciatoie tastiera 1-9 per piani | Medio | Basso |
| #5 | Suono "ding" differenziato all'arrivo | Medio | Basso |
| #22 | Schermata Welcome interattiva | Basso | Basso |
| #6 | Modalità Fuori servizio | Medio | Basso |
| #11 | Sottotitoli annunci vocali | Medio | Basso |

## Decisioni aperte residue

Vedi `PIANO_MIGLIORAMENTI.md` §11.8:
- **D2**: singolo file vs aggiunta `sw.js` + `manifest.json` per PWA (#16)
- **D3**: aprire Fase 11 o continuare come bug-fix/miglioramenti minori
- **D4**: frequenza sync `dist/index.html` (risolto: per ora solo a fine feature)

D1 e parte di D3 sono state risolte durante Polish Pack v1.1 (scelta: Polish Pack come scope, sync dist a fine feature).
