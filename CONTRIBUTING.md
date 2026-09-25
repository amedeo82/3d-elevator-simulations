# Contributing to BOSS HOTEL Elevator 3D

Grazie per l'interesse a contribuire a questo progetto. Questa guida
spiega come configurare l'ambiente, eseguire i test, e seguire le
convenzioni di codice (contratti **D-key**).

## Prerequisiti

- **Browser moderno** con supporto ES2020+ e WebGL 2 (Chrome/Edge/Firefox/Safari recenti)
- **Node.js >= 18** (per gli script CLI di build/audit, **non** per eseguire il simulatore)
- **Git** (per branching e PR)

Nessuna dipendenza npm: il progetto e **single-file** (`elevator.html`
+ `tests.html`) e usa three.js r160 via importmap. Niente `npm install`.

## Quick start

```bash
# 1. Clona il repository
git clone https://github.com/<owner>/3d-elevator-simulations.git
cd 3d-elevator-simulations

# 2. Apri elevator.html nel browser (doppio click, o server locale)
#    Per ispezione iframe, consigliato un server locale:
node -e "const http=require('http'),fs=require('fs'),path=require('path');const mime={'.html':'text/html'};http.createServer((req,res)=>{const fp=path.join(process.cwd(),req.url.split('?')[0]);if(!fs.existsSync(fp)){res.writeHead(404);res.end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(fp)]||'text/plain'});res.end(fs.readFileSync(fp));}).listen(8765);"
# Apri http://localhost:8765/elevator.html

# 3. Esegui la test suite
# Apri http://localhost:8765/tests.html
# Aspettati: tutti i test verdi (target 230+ test, 380+ assert).

# 4. (Opzionale) Genera CHANGELOG.md dalla history
node scripts/generate-changelog.js
```

## Comandi utili

| Comando | Scopo |
|---|---|
| `node scripts/check-balance.js elevator.html` | Verifica sintassi + brace balance del file principale |
| `node scripts/find-long-fns.js` | Lista le funzioni piu' lunghe (per audit D24) |
| `node scripts/generate-changelog.js` | Rigenera CHANGELOG.md dai commit git |
| `node scripts/extract-strings.js` | Estrae tutte le chiavi `STRINGS.it`/`STRINGS.en` per audit i18n |
| `node scripts/extract-js.js` | Estrae funzioni JS dal file single-file per analisi esterna |

## Convenzioni codice (contratti D-key)

Il progetto ha **26 contratti D-key** documentati in `AGENTS.md`. Ogni
modifica che li tocca deve aggiornare la documentazione. Lista rapida:

| # | Contratto | Regola chiave |
|---|---|---|
| D1 | Single-file HTML | Vincolo architetturale: nessuna build, deploy = copia. |
| D2 | State in cima al file | `state`, `hoveredBtn`, `buttonList` dichiarati in CONFIGURATION. |
| D3 | No emoji nel codice | Emoji solo in output utente (HUD/README). |
| D4 | Italiano + sezioni numerate | Commenti italiani, sezioni `// =====...=====`. |
| D5 | HOTEL_CONFIG centralizzato | Preset hotel + customizer `H`. |
| D7 | Coda viaggi `Array<{floor,direction}>` | Direzione intenzione viaggio. |
| D8 | `STRINGS[lang]` i18n | Helper `t(key)`, refresh su cambio lingua. |
| D9 | Pure helpers in `BossHotelPure` | Side-effect-free, testabili. |
| D10 | Citofono (soft) vs SOS (hard) | EN 81-28, due sistemi indipendenti. |
| D11 | `speak()` puro + `speakWithSubtitle()` | Subtitle helper esplicito. |
| D12 | `prefers-reduced-motion` | OS-level, `shouldDisableMotion(state)`. |
| D14 | Settings QoL in 2 chiavi localStorage | `bossHotelAudio@v1`, `bossHotelDisplay@v1`. |
| D15 | Micro-animazioni rispettano reducedMotion | Animazioni essenziali restano attive. |
| D16 | Performance LRU + mergeGeometries | `textureCache` + `mergePlanes`. |
| D22 | Routing inversione asimmetrico | Look algorithm MAX/MIN. |
| D23 | A11y `aria-label`/`role`/`aria-live` | Helper `applyAriaLabels()`. |
| D24 | Funzioni <150 righe + commenti narrativi | Target raggiunto: 0 funzioni >=150. |
| D25 | Helper `mergePlanes` DRY | Clona geometries, no side-effect. |
| D26 | Open source boilerplate | LICENSE + CHANGELOG + CONTRIBUTING. |

Per la lista completa (D1-D26) vedi `AGENTS.md`.

## Workflow "Polish Pack"

Il progetto e organizzato in **Polish Pack** (V1, V2, V3, V4). Ogni pack
e un insieme di step tematici (es. V3 T1 = Tier 1 ad alto impatto,
V3 T2 = Tier 2 manutenibilita, ecc.).

### Aggiungere un nuovo step

1. **Apri un branch dedicato**: `git checkout -b feature/vN-step-M-descr`
2. **Definisci Decision Questions** prima di implementare (4-5 via `question` tool)
3. **Implementa** seguendo i pattern esistenti (vedi D9 per helper puri)
4. **Aggiungi test** in `tests.html` (assert vanilla, no dipendenze)
5. **Esegui** `node scripts/check-balance.js elevator.html` + apri `tests.html`
6. **Aggiorna** `AGENTS.md` se introduci un nuovo D-key
7. **Aggiorna** `PIANO_VN.md` (stato step + log decisioni) e
   `PIANO_MIGLIORAMENTI.md` (Fase NN)
8. **Sync dist**: `Copy-Item elevator.html dist/index.html`
9. **Commit atomico**: `git commit -m "type(scope): descrizione"`
10. **Merge `--no-ff`** su `main`: `git merge --no-ff feature/vN-step-M-descr`
11. **Push**: `git push origin main`

### Code style

- **Indentazione**: 2 spazi, no tab
- **Stringhe**: single quote `'...'`, escape unicode con `\u00e0`
- **Commenti**: italiano, sezioni `// ====================`
- **No emoji** nel codice (decorazioni emoji solo in README, HUD)
- **No build step**: vincolo D1, niente transpiler
- **No dipendenze CDN**: vincolo D1, asset via blob URL se servono

## Issue / PR

- **Issue**: descrivi il bug o la feature, includi screenshot se visivo
- **PR**: un commit atomico per step, descrizione con riferimento al D-key
  contratto se rilevante (es. "fix(D22): ...")

## Licenza

MIT — vedi `LICENSE`. Contribuendo accetti che il tuo codice sia
rilasciato sotto la stessa licenza.
