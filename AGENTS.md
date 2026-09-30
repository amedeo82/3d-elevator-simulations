# AGENTS.md — Guida per agenti di coding su BOSS HOTEL Elevator 3D

## Cos'è il progetto
Simulatore 3D prima-persona di una cabina ascensore di hotel di lusso.
Single-file HTML (~507 KB, ~12.000 righe) con JS inline (modulo ES).
Three.js r160 via importmap (unpkg). Nessuna build step, nessuna dipendenza npm.

Stato: **22/22 funzionalità backlog implementate (100%)** — V1 chiuso con v1.8.
Polish Pack V2 **chiuso 2026-09-17** (10/13 step, 77%; Step 6 PWA, 11 L-block,
13 WebXR rinviati).
Polish Pack V3 **chiuso 2026-09-23** (9/9 step, 100%).
Polish Pack V4 **chiuso 2026-09-26** (8/8 step, 100%).
Piano attivo: nessuno — i pack sono chiusi. Dettaglio in `PIANO_V4.md`.
Backlog futuro aperto: `ROADMAP_POST_V7.md`.
Log implementativo: `PIANO_MIGLIORAMENTI.md` (fasi 1–30).
Audit oggetto `state`: `STATE.md`.

---

## Layout del file `elevator.html`

Navigazione per **ancora testuale**, non per numero di riga. I numeri
invecchiano a ogni commit (il file è passato da ~9.250 a ~11.400 righe e la
tabella basata su righe era già fuori di ~2.500 righe); le ancore restano
valide e si cercano con `rg`:

```bash
rg -n "^// CONFIGURAZIONE" elevator.html          # dove inizia una sezione
rg -n "function showWebglFallback" elevator.html  # dove sta una funzione
rg -n "id=\"rotate-device-overlay\"" elevator.html
```

| Sezione | Ancoraggio | Contenuto |
|---|---|---|
| Importmap + script module | `type="importmap"` (three.js 0.160 via unpkg) | Bootstrap three.js |
| CONFIGURAZIONE | `// CONFIGURAZIONE` | Costanti (CABIN, NUM_FLOORS, FLOOR_HEIGHT, preset hotel, i18n `STRINGS`) |
| STATO GLOBALE | `// STATO GLOBALE`, `const state = {` | `state` + `hoveredBtn` + `buttonList` + `movePaused`: dichiarati in cima per evitare TDZ (D2, D15) |
| Mini event bus | `// POLISH PACK V2 STEP 1d — MINI EVENT BUS`, `bus.emit` | Event bus homemade (V2 Step 1d) |
| Scena / Renderer / Camera | `// SCENA, RENDERER, CAMERA` | three.js core. Qui vivono `detectIOS()`, `computePixelRatioCap()`, `showWebglFallback()` e la creazione del renderer (D28) |
| Illuminazione | `// ILLUMINAZIONE` | ceilingLight, fillLight, alarmLight |
| Texture procedurali | `// TEXTURE PROCEDURALI` | makeBrushedMetalTexture, makeMarbleTexture, makeCeilingTexture |
| Cabina (gruppo radice) | `const cabin = new THREE.Group()` | Pavimento, soffitto, pareti, specchio, maniglione |
| Pannello pubblicitario laterale | `// PANNELLO PUBBLICITARIO` | Display 6 schermate rotanti (Fase 2) |
| Dettagli premium cabina | `// DETTAGLI PREMIUM CABINA` | Profili alluminio, battiscopa, LED, telecamera, citofono, targhe (Fase 1) |
| Porte | `// PORTE` | Anta sx/dx + indicatori direzione |
| Corridoio tematico + arredi | `// CORRIDOIO, ARREDI` | Costruzione corridoio per piano, pulsantiera esterna ▲/▼, `buildCorridor` + helper `buildCorridorShell`/`buildCorridorLights` |
| Pulsantiera moderna digitale | `// PULSANTIERA MODERNA` | Display touch + 4 tasti fisici (◄ \| \| ► STOP !) |
| Render display touch | `// RENDER DEL DISPLAY TOUCH` | `drawModernDisplay()` + 3-layer caching (V1.6 #18) |
| Tutorial contestuale | `function startTutorial` | V2 Step 2b (5 step, tasto `?`) |
| Helper matematici puri | `function clamp`, `function lerp` | V2 Step 12 |
| 3-layer rendering caching | `function renderDisplayDynamicLayer` | V1.6 #18 (statico / semi-statico / dinamico) |
| Funzioni di stato | `// FUNZIONI DI STATO` | updateFloorDisplay, refreshHudButtons |
| Audio (WebAudio sintetizzato) | `// AUDIO` | Whoosh, musica contestuale cabin/corridoio/ristorante |
| Audio contestuale corridoio | `function startCorridorAudio` | V2 Step 3a (4 temi corridoio) |
| Musica ristorante "La Terrazza" | `// POLISH PACK V2 STEP 3b — MUSICA RISTORANTE` | V2 Step 3b |
| Annunci vocali TTS | `// ANNUNCI VOCALI`, `function speak(` | `speak`, `speakWithSubtitle`, `announceArrival`, `announceAlarm` (D11) |
| Movimento cabina | `// MOVIMENTO CABINA` | requestFloor, actuallyStartMove, `tickMove` (envelope sin/π) |
| Animazione porte | `// ANIMAZIONE PORTE` | setDoors, animateDoorsTo, tickDoors, scheduleAutoClose, sensor IR |
| Allarme | `// ALLARME`, `function toggleAlarm` | Luci rosse, sirena 660/880Hz |
| Citofono interattivo (EN 81-28) | `INTERPHONE_DURATION_MS` | V2 Step 14 (lampeggio 4Hz, reception simulata, D10) |
| Esci / Rientra cabina | `function exitCabin`, `function enterCabin` | Prenotazione, ADA compliance |
| Raycasting & click pulsanti | `function updateHover` | Click + hover pulsanti 3D |
| Pointer lock — mouse look | `function onClick` | First-person mouse look (con guard try/catch su `requestPointerLock`, D28) |
| Movimento FPS + tastiera | `// MOVIMENTO FPS` | `tickPlayer`, keydown listener, NPC passeggeri |
| Menu mobile + detection | `// POLISH PACK V4 STEP 8` | `initMobileMenu`, `openMobileMenu`, `refreshMobileMenuStates` (D27) |
| `isMobileDevice` / `initMobileDetection` | `function isMobileDevice` | `state.inputMode` single source of truth (D26est) |
| Avviso portrait (non bloccante) | `id="rotate-device-overlay"`, `function initRotateNotice` | Card dismissabile, `pointer-events: none` (D29) |
| assert runtime contratti state | `function assertStateInvariants` | V2 Step 1c |
| LOOP (RAF + tick*) | `function loop(` | `tickDisplay`, `tickMove`, `tickDoors`, `tickPlayer`, `tickFadeStates`; salta `render()` se `_ctxLost` (D28) |
| Gestione context WebGL | `CTX_WATCHDOG_MS`, `function reviveRendererAfterContextRestore` | Listener `webglcontextlost`/`restored` + watchdog (D28) |
| Settings QoL UI wiring | `function initSettingsQoL` | Slider volume + brightness + export JSON (D14) |
| AVVIO | `// AVVIO` | `buildCorridor` iniziale, start screen, init eventi |
| Preferenze persistenti | `const LANG_KEY`, `function loadLang` | Chiavi localStorage @v1: prefs, lang, config, audio, display, onboarded |
| `window.BossHotelPure` namespace | `window.BossHotelPure = {` | 62 helper per `tests.html` — è il punto in cui finisce il file |

---

## Convenzioni codice (contratti di progetto)

1. **No emoji nel codice JS** (decorazioni emoji solo in README, HUD, documentazione).
2. **Italiano**: commenti, nomi di variabili dove possibile, label, annunci TTS.
3. **Commenti utili, non superflui**: spiega il "perché", non il "cosa". Numeri di riga
   nei riferimenti storici sono validi alla data del commit — aggiornare con cautela.
4. **Sezioni numerate**: ogni macro-blocco è preceduto da `// ===========` + titolo.
5. **Stato in cima al file**: `state`, `hoveredBtn`, `buttonList` sono dichiarati in
   CONFIGURAZIONE (riga ~480) PRIMA di qualsiasi funzione che li usa. Vedi lezione §.
6. **Single-file sempre**: niente file esterni a parte `dist/index.html` (build copy).
   Eventuali eccezioni (asset, suoni) solo via blob URL (`URL.createObjectURL`).
7. **Processi Chrome dell'utente**: MAI usare `Stop-Process -Name chrome` o equivalente.
   L'utente ha una o più finestre Chrome attive per il suo lavoro. Per screenshot
   o smoke test locali usare **unicamente istanze headless dedicate** con un
   `--user-data-dir` separato (es. `%TEMP%\kilo-chrome-XXXX`) e `--no-first-run`
   `--no-default-browser-check`. Il comando tipo è:
   `& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new
   --disable-gpu --no-sandbox --hide-scrollbars --user-data-dir=<tempdir>
   --window-size=W,H --virtual-time-budget=N --screenshot=<file> <url>`
   Non serve (e non va) terminare il processo: headless con `--screenshot`
   esce automaticamente dopo aver scritto il file. Per test ripetuti, riusare
   lo stesso `--user-data-dir` per coerenza di profile (evita lock su
   `SingletonLock` se due istanze partono in contemporanea).
   Per server HTTP locali usare `background_process` con `lifetime: session`
   e `stop` esplicito a fine sessione (non di ogni test).

---

## Workflow operativo (Git + verifica)

Regole emerse dall'esperienza diretta del 2026-09-28. **Valgono per ogni
sessione** che tocchi codice, test, documenti o workflow.

### `main` è protetta: mai commit diretti

`git push origin main` viene **rifiutato** (`GH006: Protected branch update
failed`). Il flusso corretto è sempre:

```bash
git checkout -b fix/<slug>          # oppure docs/<slug>
# ... modifiche ...
git add <file>
git commit -F <file-messaggio>
git push -u origin <branch>
```

Poi si resetta `main` per non lasciarla avanti:

```bash
git checkout main && git reset --hard origin/main
```

`gh` CLI **non è installato** su questa macchina: la PR va aperta a mano e
va consegnato all'utente l'URL
`https://github.com/<owner>/<repo>/compare/main...<branch>?expand=1`.
Non dire "PR creata" senza averla effettivamente creata.

I doc possono viaggiare **nello stesso commit/PR** del codice: un solo
merge invece di due, e la coerenza del conteggio D-key resta garantita.

### Sequenza di verifica obbligatoria prima del commit

```bash
node scripts/check-balance.js elevator.html   # sintassi + brace balance
node scripts/run-tests.js                      # 299 test in Chromium headless
node scripts/run-ui-tests.js                   # 20 test di layout e interazione (D31)
cp elevator.html dist/index.html              # build copy
```

Il terzo passaggio è quello che si dimentica più spesso. La CI verifica la
**parità SHA-256** tra `elevator.html` e `dist/index.html` e fallisce con
un messaggio esplicito se divergono. `elevator.html` e `tests.html` non
hanno bisogno di essere copiati da nessuna parte: sono gli unici sorgenti.

Dopo la copia, `run-tests.js` va **ri-eseguito**? No: la copia non cambia
`elevator.html`. Basta `check-balance` su `dist/index.html` per sicurezza.

### Prima di dichiarare risolto un bug: verificalo davvero

I due bug bloccanti della sessione del 2026-09-28 (overlay portrait iPhone,
startBtn irraggiungibile su desktop) erano già "chiusi" da fix precedenti che
non funzionavano, perché erano basati su diagnosi mai verificate. Metodo che
ha funzionato:

1. **Riprodurre** il sintomo in un engine reale (Playwright + WebKit per
   Safari, `page.mouse.wheel` + `page.mouse.click` per l'interattività).
2. **Far fallire di proposito** la verifica per provarla: un test iniettato
   che fallisce deve dare exit 1; un modulo rotto deve dare exit 1. Un runner
   che non si è mai visto fallire non è un runner testato.
3. **Provare la matrice** (più viewport, più locale), non un caso solo.

Attenzione: `locator.click()` e `scrollIntoView` di Playwright **mascherano**
i problemi di raggiungibilità. Per verificare che un elemento sia
raggiungibile serve interagire come un utente (ruota del mouse, click alle
coordinate reali) e controllare che l'elemento sia dentro il viewport.

### Refactor: dimostra che è puro spostamento di codice

Quando sposti il body di una funzione in helper (D24), i test esistenti
**non bastano**: i 299 test coprono funzioni pure e i 20 test UI coprono
layout e interazione, nessuno dei due guarda il contenuto disegnato su canvas.

Metodo usato il 2026-09-29 per lo split di `renderDisplayDynamicLayer`
(148 righe → orchestratore + 3 helper): confronto **multiset delle righe di
codice** tra il body originale e i body nuovi, normalizzando l'indentazione.
Se le righe sono solo spostate, l'uguaglianza dei multiset dimostra
l'equivalenza per costruzione, senza dipendere dal timing del rendering.

Da solleapre, perché `drawModernDisplay` disegna l'ora corrente (`new Date()`)
e il meteo casuale: **congelare il clock e seminare `Math.random`** con un
init script prima di confrontare i pixel, altrimenti le due esecuzioni
differiscono per motivi che non hanno nulla a che vedere col refactor. E
non confrontare stati accumulati in sequenza: il movimento dipende da
`performance.now()` e i due run divergono comunque.

### Test indipendenti dal locale del browser

`loadLang()` cade su `detectBrowserLang()`, quindi la lingua al boot è
`navigator.language`: **en-US sui runner CI**, `it-IT` su molte macchine dev.
Un test che assume "la pagina parte in italiano" passa in locale e fallisce
in CI (è successo con un test a11y, agosto 2026-09-28). Quando un test
riguarda le due lingue, **impostale esplicitamente** con `setLang('it')` /
`setLang('en')` invece di dedurre la lingua iniziale, e ripristina la lingua
di boot leggendola da `#langSwitch`.

Verifica multi-locale prima del commit:

```bash
node scripts/run-tests.js   # eseguito 3 volte con locale en-US, it-IT, de-DE
```

### Gotcha Windows / PowerShell 5.1

- **Niente heredoc**: `git commit -F - <<'EOF'` non funziona. Scrivere il
  messaggio in un file e usare `git commit -F <path>`.
- **Encoding**: PowerShell 5.1 legge i file in **ANSI** per default. Usare
  `Get-Content <file> -Encoding UTF8` prima di giudicare caratteri
  accentiati o emoji: senza, `à` ed emoji appaiono come mojibake
  (`â€`, `ðŸŽ‰`) e si conclude erroneamente che il file sia corrotto.
- **`-replace` su file grandi** (500 KB) è inaffidabile: se il pattern non
  corrisponde esattamente (per es. fine riga diverse) non modifica nulla e
  `$new -eq $old` resta vero. Per modifiche puntuali usare l'editor.
- **`git reset --hard`** sovrascrive il working tree: verificare sempre prima
  che non ci siano modifiche non committate da salvare.
- **`Stop-Process -Name chrome`** è vietato (contratto 7 sopra). Vale anche
  per i processi Playwright/WebKit lanciati per i test.

---

## Regole di aggiornamento della documentazione

Prima esistevano solo in `CONTRIBUTING.md`, che un agente non apre per primo.
Stanno qui perché la loro assenza è la causa ricorrente di documentazione
stale: nella sola sessione del 2026-09-28 il conteggio dei D-key era
disallineato su tre file, `CHANGELOG.md` era fermo a due PR prima, e la
tabella layout era fuori di ~2.500 righe.

| Hai cambiato... | Devi aggiornare... |
|---|---|
| Le dimensioni / righe / KB di `elevator.html` | `README.md` § "Panoramica", `docs/DEVELOPMENT.md` § "Struttura del progetto" |
| Il numero di test in `tests.html` | `AGENTS.md` (conteggio in "Comandi build / verifica" + in "Polish Pack attivi"), `README.md` (badge `Tests-` e le occorrenze in "Funzionalità" / "Comandi" / "Contribuire"), `docs/DEVELOPMENT.md` |
| Le funzioni in `BossHotelPure` | Conteggio nella tabella layout qui sopra, e `README.md` se menziona il numero |
| Il numero di contratti D-key | `AGENTS.md` (tabella D-key + "Contratti D-key totali"), `CONTRIBUTING.md`, `ROADMAP_POST_V7.md` — **tutti e tre insieme** |
| Il workflow di un Polish Pack | `PIANO_VN.md` (step ✅ + log decisioni), `PIANO_MIGLIORAMENTI.md` (Fase NN) e `docs/ROADMAP.md` |
| Un contratto D-key nuovo o modificato | `AGENTS.md` (riga della tabella) **e** `CONTRIBUTING.md` (checklist PR, step 6) |
| Il comportamento di build/CI | `AGENTS.md` sezione "Comandi build / verifica" + la **tabella dei 4 job e dei loro `name:` esatti**, e segna la job nuova come required in Settings → Branches |
| Qualsiasi cosa, al merge | `node scripts/generate-changelog.js` (D26) |

**Mappa della documentazione** (il README è una landing breve, i dettagli
sono in `docs/` e nei documenti di progetto alla root):

| Doc | Contenuto | Manutenerlo quando... |
|---|---|---|
| `README.md` | Landing: hero, quick start, griglia funzioni sintetica, indice | Cambiano utenza, comandi ad alto livello, badge |
| `docs/FEATURES.md` | Catalogo completo delle 30 aree funzionali | Aggiungi o modifichi una funzionalità |
| `docs/CONTROLS.md` | Comandi mouse / tastiera / touch | Aggiungi o cambi un tasto, un controllo touch |
| `docs/DEVELOPMENT.md` | Struttura, sviluppo locale, test, deploy | Cambia il workflow di build/test/deploy |
| `docs/ROADMAP.md` | Storico release, Polish Pack, backlog | Chiudi un pack o un hotfix |
| `docs/images/` | Screenshot del README (WebP) | Cambia l'aspetto della UI in modo visibile |
| `ARCHITECTURE.md` | Diagrammi e flussi dati | Cambia l'architettura |
| `STATE.md` | Audit campo per campo di `state` | Aggiungi o rimuovi un campo di `state` |
| `STRINGS_*.md` | Mappatura i18n | Aggiungi o rimuovi una chiave in `STRINGS` |

> **Attenzione**: `STATE.md` e l'elenco delle sezioni in `AGENTS.md` erano
> entrambi fermi ai campi di `state` della fase V2. Se aggiungi un campo,
> aggiornali insieme: è esattamente il tipo di drift che ha fatto
> sbagliare il conteggio dei D-key.

**Regola generale**: se un numero compare in più di un file, aggiornalo in
tutti nello stesso commit. Un numero stale in un solo file è peggio di
nessun numero, perché il lettore si fida.

**Cosa NON aggiornare**: i conteggi storici dentro le sezioni "Roadmap" e i
log dei singoli step di `README.md`/`PIANO_*.md` (es. *"134 → 206 test,
V3 Step 8"*). Sono il record di cosa è successo al tempo: correggerli
falsificherebbe la storia del progetto. Solo lo stato corrente va tenuto
allineato.

---

## Comandi build / verifica

| Comando | Scopo |
|---|---|
| `node scripts/check-balance.js elevator.html` | Verifica sintassi + brace balance (autorevole) |
| `node scripts/run-tests.js` | Esegue i 299 test in Chromium headless, exit 1 se uno fallisce |
| `node scripts/run-ui-tests.js` | 20 test **comportamentali** di layout/interazione (D31), exit 1 se uno fallisce |
| `cp elevator.html dist/index.html` | Build copy obbligatoria: la CI ne verifica la parità SHA-256 |
| Aprire `elevator.html` in browser | Smoke test locale (Chrome/Edge/Firefox) |
| `node scripts/generate-changelog.js` | Rigenera `CHANGELOG.md` dai commit (D26) |
| `node scripts/find-long-fns.js` | Elenca le funzioni più lunghe (invariante D24) |

CI GitHub Actions: `.github/workflows/ci.yml` ha 4 job paralleli.
**I `name:` dei job sono la chiave con cui GitHub li identifica** nei
required status checks: sono quelli da copiare in Settings → Branches.

| # | `name:` della job (stringa esatta) | Cosa verifica |
|---|---|---|
| 1 | `Sintassi + brace balance + invarianti build` | `check-balance.js`, parità SHA-256 `dist/index.html` === `elevator.html`, invariante D24 (0 funzioni >= 150 righe) |
| 2 | `Test framework (Polish Pack V2 Step 12)` | Validazione statica: presenza `window.BossHotelPure` in `elevator.html`, presenza `tests.html`, conteggio `test('` >= 30, referenziamento di `elevator.html` in `tests.html` |
| 3 | `Esecuzione test in browser (Chromium headless)` | 299 test reali via `scripts/run-tests.js` (server HTTP statico + attesa di `window.__testResults`). È la job che intercetta i bug logici: le due precedenti sono solo `grep` ed eseguivano zero test (D30) |
| 4 | `Test UI layout e interazione (Chromium headless)` | 20 test comportamentali via `scripts/run-ui-tests.js`: `#startBtn` premibile, tap su mobile che non finiscono su un overlay, scena che produce un frame. È l'unica job che avrebbe beccato i due bug bloccanti di CSS (D31) |

### Tutte e 4 devono essere "required status checks"

Una job che gira ma non blocca il merge **non è un controllo**: è un
suggerimento che qualcuno deve notare. Le impostazioni stanno in
Settings → Branches → `main` → "Status checks that are required", e non
vivono nel repo: **nessuno script può verificarle**, quindi l'onere è di chi
aggiunge una job.

Stato al 2026-09-29: le 4 job sono **tutte required** e la protezione di
`main` le elenca tutte e quattro. La quarta, `ui-tests`, è stata aggiunta ai
required check a mano dopo la PR #20, quando la job era verde ma non
compariva nella schermata delle impostazioni: in quel buco i 20 test di
layout, che esistono proprio per intercettare i bug di CSS, non bloccavano
nessun merge.

Se in futuro aggiungi una job, ricorda che GitHub la propone in
autocompletamento **solo dopo** che quel job è passato almeno una volta su
`main` o su una PR. Fino ad allora resta invisibile nella schermata.

Nota: in PR #27 GitHub mostra un quinto check, `GitGuardian Security Checks`.
**Non viene dal `ci.yml` di questo repo**: è uno scanner esterno, senza
side effect sul merge perche' non e' tra i required check. Se in futuro
diventa required, sara' un quinto controllo da mettere in tabella qui sopra.

Regola pratica: **aggiungere una job alla CI e segnarla required è un unico
gesto.** Una job verde e non richiesta dà una falsa sensazione di sicurezza,
che è il motivo per cui i due bug del 2026-09-28 sono arrivati in `main`
con la CI verde.

## Test in locale (runner headless, come la CI)

`scripts/run-tests.js` fa `require('playwright')`, ma il progetto è
single-file e **non ha `node_modules`** (`node_modules/` è gitignored).
Servono quindi **due** passi, non uno: `npx playwright install` scarica i
browser ma NON installa il pacchetto npm che lo script richiede.

```bash
npm install --no-save --no-audit --no-fund playwright@1.56.0  # una volta sola
npx playwright install chromium                                # una volta sola
node scripts/run-tests.js                                      # exit 1 se un test fallisce
node scripts/run-ui-tests.js                                   # exit 1 se un test fallisce
```

`--no-save` evita di creare `package.json`/`package-lock.json`, che il
progetto non vuole. La versione **va pinnata**: se non combacia con il
build del browser, `chromium.launch()` fallisce con
`Executable doesn't exist at .../chromium_headless_shell-XXXX` e la causa
appeare illeggibile.

I due runner usano la stessa installazione. `run-tests.js` copre la logica
pura (299 test su `window.BossHotelPure` in un iframe nascosto),
`run-ui-tests.js` copre layout e interazione (20 test che aprono l'app in
viewport reali, desktop e mobile) — vedi D30 e D31. Scrivono rispettivamente
`test-output.json` e `ui-test-output.json` nella root (gitignored).
Usa un server HTTP statico, non `file://`: `tests.html` carica `elevator.html`
in un `<iframe sandbox>` e `elevator.html` è un ES module con importmap, che su
`file://` non si carica per CORS.

## Test in locale (opzionale, manuale)

Per ispezionare `tests.html` nel browser senza aprire Chrome dell'utente:

```bash
# 1. Avvia server HTTP locale (background, lifetime session)
node -e "const http=require('http');const fs=require('fs');const path=require('path');const mime={'.html':'text/html','.js':'text/javascript'};http.createServer((req,res)=>{let p=req.url==='/'?'/tests.html':req.url;const fp=path.join(process.cwd(),p.split('?')[0]);if(!fp.startsWith(process.cwd())){res.writeHead(403);res.end();return;}if(!fs.existsSync(fp)){res.writeHead(404);res.end();return;}const ext=path.extname(fp);res.writeHead(200,{'Content-Type':mime[ext]||'text/plain'});res.end(fs.readFileSync(fp));}).listen(8765,()=>console.log('ready'));"

# 2. Lancia Chrome headless DEDICATO con --user-data-dir separato
#    (NON killa il processo: headless con --screenshot esce da solo)
$tdir = Join-Path $env:TEMP ("kilo-chrome-" + [Guid]::NewGuid().ToString().Substring(0,8))
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --no-sandbox --hide-scrollbars --no-first-run --no-default-browser-check --user-data-dir=$tdir --window-size=1100,3500 --virtual-time-budget=8000 --screenshot="tests-screenshot.png" http://localhost:8765/tests.html

# 3. Stop esplicito del server (background_process stop)
#    NON stoppare il processo Chrome: si chiude da solo dopo lo screenshot.
```

---

## Decisioni D-key (contratti di progetto)

| # | Decisione | Razionale |
|---|---|---|
| D1 | **Singolo file HTML sempre** | Vincolo architetturale; nessuna build, deploy = copia. PWA via blob URL. |
| D2 | **Stato in cima al file** | Lezione dei bug TDZ (Phase 13, 15, 16): dichiarare `state`, `hoveredBtn`, `buttonList` PRIMA delle funzioni che li usano. |
| D3 | **No emoji nel codice** | Consistenza; emoji solo in output utente (HUD/README). |
| D4 | **Commenti in italiano + sezioni numerate** | Coerenza con codebase esistente; leggibilità. |
| D5 | **HOTEL_CONFIG centralizzato + HOTEL_CONFIG_DEFAULTS frozen** | Polish Pack V2 Step 5. Refactor di 23 stringhe brand hardcoded in un oggetto unico. `HOTEL_CONFIG_DEFAULTS` è `Object.freeze()` per i reset; `HOTEL_CONFIG` è la copia runtime mutabile. Modificabile via HUD tasto `H`. |
| D6 | **Carica config PRIMA delle cabin texture IIFE** | Polish Pack V2 Step 5 fix critico. `loadHotelConfig()` deve girare prima delle IIFE che bakano `HOTEL_CONFIG` nelle canvas texture (targa cabina, header pulsantiera). Altrimenti le texture sono baked con valori originali e l'utente vede "BOSS HOTEL" anche dopo aver salvato "Sky Tower". Sintomo: 'non vedo differenze tra preset'. |
| D7 | **Coda viaggi come `Array<{floor, direction}>` (non `Set`)** | Polish Pack V2 Step 7. La pulsantiera ▲/▼ esprime "intenzione viaggio"; `direction: 'up'\|'down'\|null` viene memorizzata per instradamento intelligente e visualizzazione. `queueNextSmart(currentFloor, lastDirection)` serve stessa direzione, poi inversione automatica. |
| D8 | **`STRINGS[lang]` + refactor HTML statico → dinamico** | Polish Pack V2 Step 8 (i18n IT/EN). Tutte le stringhe UI in `STRINGS[lang]`. Helper `t(key)` per lookup. `applyLangToDOM()` consolidata chiamata all'init + ad ogni `setLang()`. Le tabelle HTML statiche (`#panel-help`, start screen `.keys`, slides) sono ora rigenerate via JS da array di costanti (`PANEL_HELP_KEYS`, `SLIDE_DEFS`, `PRESET_KEYS`). Event delegation sul parent `.hc-presets` per i bottoni preset (sopravvive ai re-render di `applyLangToDOM`). 100% copertura testi visibili. |
| D9 | **Funzioni pure in `window.BossHotelPure`** | Polish Pack V2 Step 12. Le funzioni senza side-effect sono esposte in un namespace globale per renderle testabili da `tests.html` (che le consuma via iframe sandbox). Nuove helper pure (`clamp`, `lerp`, `smoothstep`, `clampFloor`, `floorLabel`, `computePassengerDelta`, `pickNextFloor`) aggiunte accanto a quelle gia' pure preesistenti (`floorRoomRange`, `getThemeForFloor`, `parseHexColor`, `getDayPhase`, `easeInOutCubic`). Quando aggiungi una funzione pura, mettila in `BossHotelPure` e aggiungi test in `tests.html`. Le funzioni con side-effect vanno refactorate in `computeX(state, ...args)` + `applyX(state, ...)`. |
| D10 | **Due sistemi di emergenza distinti: citofono (soft) vs SOS (hard)** | Polish Pack V2 Step 14 (EN 81-28). Citofono (`state.interphoneCalling`) chiama la reception dell'hotel: nessun blocco cabina, nessuna luce rossa, lampeggio pulsante verde a 4Hz, TTS soft "Chiamata in corso. Attendere prego.". SOS (`state.alarmOn` via `toggleAlarm`) chiama i soccorsi: blocco cabina immediato, luci rosse pulsanti, sirena alternata 660/880Hz, TTS hard "Allarme. Chiamata di soccorsi in corso. Restate calmi.". I due sistemi sono indipendenti e possono coesistere. Nessuna escalation automatica citofono → SOS. |
| D11 | **`speak()` puro + `speakWithSubtitle()` helper esplicito** | Polish Pack V3 Step 1a (accessibility). `speak(text, opts)` resta pura sintesi TTS (no side-effect visivi). Nuovo helper `speakWithSubtitle(text, opts)` wrappa `speak()` + `showSubtitle()` con durata calcolata via `computeSubtitleDuration(text)` (default ~150 parole/min, clampata in [2000, 6000] ms). Tutti gli announce* pubblici (announceArrival, announceAlarm, announceDoorClosing, announceMoveStart) usano `speakWithSubtitle`. `opts.durationMs` opzionale per override esplicito. |
| D12 | **`prefers-reduced-motion` OS-level → `state.reducedMotion`** | Polish Pack V3 Step 1b. `initReducedMotion()` legge `window.matchMedia('(prefers-reduced-motion: reduce)').matches` e ascolta i cambi a runtime. `shouldDisableMotion(state)` decide se skippare le micro-animazioni non essenziali (crossfade freccia 200ms, futuri "respiro" tasti dello Step 4). Animazioni essenziali (apertura/chiusura porte, vibrazione cabina, lampeggio allarme) restano attive per ragioni di sicurezza/realismo. Helper puro, esposto in `BossHotelPure` per test. |
| D13 | **Bug latenti documentati con decisione esplicita (fix o "leave alone")** | Polish Pack V3 Step 2. L'audit corner case dei 5 noti + ricerca attiva di bug latenti ha prodotto 4 fix (Q2.6 A/B/C + promise-chaining Q2.3) e 1 "leave alone" con razionale (D = memory leak promise, risolto indirettamente dal refactor Q2.3). Pattern: ogni bug latente emerso durante l'audit viene documentato con decisione esplicita, non lasciato implicito. |
| D14 | **Settings QoL in due chiavi localStorage separate @v1** | Polish Pack V3 Step 3. `bossHotelAudio@v1` (effects / music / tts, default 1.0/0.5/0.85) + `bossHotelDisplay@v1` (brightness, default 1.0). Init `initSettingsQoL()` chiamato DOPO `loadAudioSettings/loadDisplaySettings` per garantire che gli sliders riflettano le preferenze salvate dell'utente e non i default. `v=1` esplicito per migrazione forward-compatible. |
| D15 | **Micro-animazioni rispettano `state.reducedMotion` + `movePaused` in CONFIGURATION** | Polish Pack V3 Step 4. Animazioni cosmetiche (respiro tasti panel, lampeggio gentile cartello, bounce-out vibrazione, fade stati) skippate se `shouldDisableMotion(state) === true`. Animazioni essenziali (lampeggio allarme, vibrazione cabina, apertura/chiusura porte) restano attive. `movePaused` dichiarato in CONFIGURATION (subito dopo `state`) per evitare TDZ in `drawModernDisplay` (chiamato durante init prima della dichiarazione originaria). Pattern coerente con `state`/`hoveredBtn`/`buttonList` — lezione V2 bug TDZ. |
| D16 | **Performance: `textureCache` LRU + `mergeGeometries` + skip no-op costosi** | Polish Pack V3 Step 5. `textureCache` LRU capacity 10 cacha canvas texture della cabina (es. base di `drawMovingSign` durante flash gentile, hit ratio ~90%). `mergeGeometries` per geometrie dello stesso materiale (richiede `geometry.applyMatrix4(matrix)` per posizionare le singole geometrie prima del merge). Skip no-op costosi (`ctx.filter = brightness(1.0)` quando default). Benchmark via `runBenchmark()` (5s idle + 5s moving) + bottone in maintenance overlay (Shift+M) per misurazione iterativa. |
| D17 | **Log eventi strutturati + history persistita** | Polish Pack V3 Step 6. `logEvent(label, {severity, category})` con categorie (cabin/door/audio/state/maint) e severity, separato dal log UI da 10 entry: `_exportLog` ne conserva 50 per il reporting. Il filtro per categoria vive in `state._logFilter` e viene applicato da `filterLogEvents()`. History persistita sotto `localStorage.bossHotelHistory@v1` (`HISTORY_KEY`): `alarmHistory`, `alarmCount`, `interphoneHistory`, `interphoneCount` — i contatori sono totali vita e non si resettano al reload. |
| D18 | **Documentazione architetturale per le funzioni core** | Polish Pack V3 Step 7. Ogni funzione >= 80 righe riceve un commento narrativo con scopo, sezioni interne e contratti di performance applicabili. Il riferimento e' `ARCHITECTURE.md` piu' la tabella "Layout del file" qui sopra, che naviga per ancore e non per numeri di riga. Nota: `ARCHITECTURE.md` riportava D18 come "(riservato, non introdotto)": era sbagliato, il contratto e' attivo dal 2026-09-23. |
| D19 | **Copertura test estesa via helper puri** | Polish Pack V3 Step 8. Il pattern e' portare in `window.BossHotelPure` la logica calcolabile delle funzioni con effetti, cosi' da testarla senza istanziare la scena. Da allora e' la regola generale (D9) ed e' anche il motivo per cui un bug come il `ReferenceError` su `now` dentro `tickMove` era invisibile: `tickMove` non era pura e non aveva test. Correzione del 2026-09-29: estratti `computeMoveState`, `computeArrivalPhase`, `computeMoveVibration`, `computeIdleVibration`, `computeArrivalDirection`. |
| D20 | **Layout mobile responsive con `isMobileDevice()`** | Polish Pack V3 Step 9. `isMobileDevice()` raccoglie 6 dimensioni (innerWidth/innerHeight, clientWidth/clientHeight, screen.width/height): `true` se **qualsiasi** <= 500, altrimenti `Math.min(...dims) <= 768` (cattura gli iPad in portrait). `isViewportMobile()` e' il force-mobile (`width<=900 || height<=500`) usato da `initMobileDetection`. Il layout adesso **non** blocca: l'avviso portrait e' una card dismissabile e il gioco resta usabile in portrait (vedi D29). |
| D21 | **Test exposure completa** | Polish Pack V4 Step 1. Namespace `window.BossHotelPure` con 62 funzioni pure, consumato da `tests.html` via `iframe.contentWindow.BossHotelPure` (l'iframe e' sandboxed con `allow-same-origin allow-scripts`). `tests.html` contiene 299 test in 54 blocchi `describe`. Attenzione: esporre su `window` non basta, i test cross-iframe leggono **solo** `BossHotelPure` — e' stato un bug per questo (vedi la nota su `openMobileMenu` sotto D27). |
| D22 | **Routing inversione asimmetrico (look algorithm)** | Polish Pack V4 Step 2. `pickNextFloor`/`queueNextSmart` quando non ci sono richieste same-dir nella coda: `lastDir='up'` + invert a `down` → ritorna MAX (highest) della coda down; `lastDir='down'` + invert a `up` → ritorna MIN (lowest) della coda up. Logica: la cabina prosegue nella direzione attuale fino al farthest della direzione opposta, poi serve i restanti tornando indietro (algoritmo elevator classico). Versione stateful `queueNextSmart` deve restare in sync con `pickNextFloor` (test in `tests.html` bloccano la divergenza). |
| D23 | **A11y: `aria-label`/`role`/`aria-live`/`aria-hidden` su elementi chiave** | Polish Pack V4 Step 3. Helper `applyAriaLabels()` chiamato da `applyLangToDOM()` setta `aria-label` localizzati (nuove chiavi `aria*` in `STRINGS.it`/`STRINGS.en`) su bottoni HUD (`hud-exit-btn`, `hud-reenter-btn`, `startBtn`, 5 `m-filter-btn`, `m-export-json`, `m-benchmark-btn`, 2 `virtual-call-btn`, `virtual-joystick`, tutorial, customizer). Live regions: `#subtitle` e `#mode-badge` con `role="status" aria-live="polite" aria-atomic="true"`. Decorative: `#pointerhint`, `.rotate-icon`, `.joystick-knob`, `#rotate-device-overlay` con `aria-hidden="true"` o `role="alertdialog"`. Test: 15+ assert manuali in `tests.html` (no CDN, conforme D1) che verificano presenza attributi + cambio lingua aggiorna `aria-label`. `setLang`/`applyLangToDOM`/`applyAriaLabels` esposti in `BossHotelPure` per test cross-iframe. |
| D24 | **Funzioni core <150 righe con commenti narrativi** | Polish Pack V4 Step 4. Tutte le funzioni top-level in `elevator.html` devono essere <150 righe (target raggiunto: 0 funzioni >=150). Le 16 funzioni piu' lunghe (>=80 righe) hanno commenti narrativi stile V3 Step 7 (`Polish Pack V4 Step 4 (D24):` + scopo + sezioni + contratti D-key + performance). Pattern di split consentito: estrarre helper mantenendo stesso module scope + side-effect su `state`. Esempi: `buildCorridor` 178 → 76 (estratto `buildCorridorShell` + `buildCorridorLights`); `startCorridorAudio` 156 → ~50 (estratto 4 helper `setupLobbyAudio`/`setupOfficeAudio`/`setupHotelAudio`/`setupPenthouseAudio`); `renderDisplayDynamicLayer` 148 → 7 + 3 helper (estratto `drawDisplayHeaderLayer`/`drawDisplayFloorLayer`/`drawDisplayDoorCountdown`, 2026-09-29). Attenzione al **margine**: 148/150 significa che la modifica successiva l'avrebbe rotta, quindi la soglia pratica da tenere è ~120, non 149. Helper tool: `node scripts/find-long-fns.js` (brace-counting corretto) da rieseguire dopo refactor importanti. Uno split va verificato come puro spostamento di codice, vedi § "Refactor: dimostra che è puro spostamento di codice". |
| D25 | **Helper `mergePlanes` DRY per mergeGeometries** | Polish Pack V4 Step 5. Helper `mergePlanes(transforms, material, useGroups=false)` clona le geometries di input (non muta), applica la matrix via `applyMatrix4`, esegue `mergeGeometries` (three.js BufferGeometryUtils), e ritorna un `THREE.Mesh` con il materiale passato (o `null` se merge fallisce). Sostituisce 3 callsites duplicati in `buildCorridorShell` (3 pareti) + `buildCorridorLights` (4 LED planes + 4 frame boxes). Esposto in `BossHotelPure` per testing cross-iframe. Test: input vuoto → null, input non-array → null, merge 3 plane 1x1 → 12 vertici + 18 indici, NON mutazione input, materiale propagato. |
| D26 | **Open source boilerplate (LICENSE + CHANGELOG + CONTRIBUTING)** | Polish Pack V4 Step 6. `LICENSE` MIT + copyright Amedeo Vecchi 2026. `CHANGELOG.md` auto-generato da `scripts/generate-changelog.js` (~85 righe) che parsa `git log` con regex euristiche e bucketa per Polish Pack V1..V4. `CONTRIBUTING.md` comprehensive: prereq + quick start + comandi utili + sommario dei contratti D-key + workflow Polish Pack + code style + PR convention. Il conteggio dei contratti in quel file va tenuto allineato al totale dichiarato in fondo a questo documento. |
| D26est | **`state.inputMode` come single source of truth per scene selection** | Polish Pack V4 Step 7 (D26 esteso). Il progetto era nato desktop-first con tutti gli interventi mobile come overlay sopra logiche desktop (causando "mix confuso" su iPhone: cheatsheet WASD + joystick + ▲▼ + pointer hint desktop tutti visibili). Soluzione: aggiungere `state.inputMode = 'desktop' \| 'mobile'` dichiarato nel state object in CONFIGURATION (top of file per evitare TDZ), derivato da `isMobileDevice()` al boot e ricalcolato su resize/orientationchange/matchMedia change. Tutti i branch UI/handler/tutorial/cheatsheet leggono SOLO questo flag (non piu' controlli sparsi su `state.isMobile`). Data structures paralleli: `PANEL_HELP_KEYS_MOBILE` (13 voci touch-friendly) vs `PANEL_HELP_KEYS` (15 voci desktop); `TUTORIAL_STEPS_MOBILE` vs `TUTORIAL_STEPS`; `START_SCREEN_KEYS_MOBILE` vs `START_SCREEN_KEYS`. Helper mode-aware: `getPanelHelpKeys()`, `getStartScreenKeys()`, `getTutorialSteps()`. Per-mode onboarded flag: `localStorage[bossHotelOnboarded@v1]` (desktop) vs `localStorage[bossHotelOnboardedMobile@v1]` (mobile). Keydown short-circuit su mobile: il listener `keydown` ritorna subito tranne per tasti tutorial (`?`, Enter, Esc) per evitare che tastiere Bluetooth/USB inneschino azioni WASD/M/V/N/O/K/H/L. CSS split: `body.mobile-mode #panel-help/#crosshair { display: none }` + `body:not(.mobile-mode) #touch-controls { display: none }`. Runtime toggle in `initMobileDetection.recheck()`: su mode change chiama `applyLangToDOM()` e riavvia il tutorial con i nuovi step. |
| D27 | **Mobile hamburger menu (☰ top-left) per azioni keyboard-only** | Polish Pack V4 Step 8. Il progetto mostrava contenuti mobile-friendly dopo D26est ma le 9 azioni keyboard-only (M audio, V annunci, N notte, O fuori servizio, K comando vocale, ? tutorial, H customizer, L lingua, Shift+M manutenzione) restavano inaccessibili via touch. Soluzione: bottone ☰ fisso top-left 44×44 px glassmorphism (`display: none` di default, `display: block` su `body.mobile-mode`) + overlay slide-in da destra (320px max-width 90vw, transform `translateX(100%)→0` con transition 250ms, z-index 5800). 9 voci in 2 sezioni: 5 toggle rapidi (audio/V/notte/OOO/vocale con badge ON/OFF colorato via `aria-checked`) + 4 link ad altri overlay (tutorial/customizer/manutenzione/lingua). 25 nuove stringhe IT/EN: `mmTitle`, `mmSectionToggles/Actions`, `mmAudio/Voice/Night/OOO/VoiceCmd/Tutorial/Customize/Maint/Lang`, `mmStateOn/Off` + 13 `ariaMm*`. 7 nuove funzioni JS: `openMobileMenu/closeMobileMenu/toggleMobileMenu/isMobileMenuOpen/handleMobileMenuAction/refreshMobileMenuStates/initMobileMenu`. Esposti in `BossHotelPure` per testing cross-iframe. Sicurezza UX: `openMobileMenu()` rilascia `pointer-lock` + chiude tutorial attivo (evita overlay stacking). NOTA 2026-09-28: la parte finale di questa riga riportava come causa dello "schermo nero" su iOS l'interferenza di un elemento fixed con z-index sul rendering WebGL (preserveDrawingBuffer). Quella diagnosi era **errata** — nessun browser si comporta in questo modo. Cause reali: overlay full-screen 92% nero che intercettava i tap sul #startBtn, `WebGLRenderer` senza guard, `preserveDrawingBuffer: true` inutile, context perso non recuperato. Vedi D28. La regola `visibility: hidden` resta comunque corretta di per se'. |
| D28 | **Robustezza WebGL su iOS/Safari (guard, budget GPU, recupero context)** | Polish Pack fix 2026-09-28 (PR #14). 4 difetti reali alla base dello "schermo nero" su iPhone 15 Pro, riprodotti in WebKit 26.0. (1) `new THREE.WebGLRenderer()` va SEMPRE in try/catch: se il context non si crea il modulo abortisce e il listener su `#startBtn` non viene mai agganciato → `showWebglFallback()` inietta un overlay con bottone "Ricarica" invece di lasciare uno schermo nero muto. (2) `preserveDrawingBuffer: true` vietato: copia il buffer a ogni frame e nulla nel progetto legge i pixel del canvas (nessun `toDataURL`/`toBlob`) → costo puro, ed è la config che su iOS favorisce frame neri. Se in futuro serve catturare il canvas, farlo on-demand con `toDataURL` nel frame giusto, non con il flag permanente. (3) Budget memoria tarato da `computePixelRatioCap(dpr, isIOS)` (puro, esposto in `BossHotelPure`): max **1.5** su iOS, max 2 su desktop. `antialias` disattivato solo su iOS (backbuffer MSAA). Su iPhone 15 Pro landscape il backbuffer passa da 1704x786 a 1278x589. (4) Context perso recuperabile: `state._ctxLost`/`_ctxLostAt` (dichiarati in CONFIGURAZIONE, vincolo D2) vengono **letti** dal loop, che salta `renderer.render()`; `reviveRendererAfterContextRestore()` re-applica size/pixelRatio, `resetState()` e forza `needsUpdate` su tutti i materiali + `shadowMap.needsUpdate`; watchdog `CTX_WATCHDOG_MS` (6s) chiama `WEBGL_lose_context.restoreContext()` e, se il context non torna, mostra la fallback. Su iOS il context viene ucciso dal sistema (backgrounding, pressione di memoria) e Safari NON emette sempre `webglcontextrestored`. `requestPointerLock()` va sempre in try/catch e va saltato in mobile mode: l'API non esiste su iOS Safari. |
| D29 | **Lo start screen deve essere sempre interamente raggiungibile** | Polish Pack fix 2026-09-28 (PR #15). Il contenuto di `#startscreen` misura ~772px in verticale. Sotto i ~870px di altezza viewport eccedeva, ma `#startscreen` aveva `overflow: visible` e `html, body` hanno `overflow: hidden`: **nessuno scroll possibile** e `#startBtn` finiva sotto il bordo inferiore, non cliccabile. Colpiva le risoluzioni laptop più comuni (1366x768, 1280x720, 1600x720, 1024x768, 1280x800, 1440x810). Regole: (1) `#startscreen` ha `overflow-y: auto` nella regola **base**, non dentro una media query — i fix "solo mobile" lasciano sempre scoperto il caso desktop; (2) mai `justify-content: center` su un contenitore scrollabile: l'eccedenza in alto diventa irraggiungibile (lo scroll parte da 0 mentre il centro è stato spostato fuori). Si usa `flex-start` + centraggio tramite `margin-top: auto` su `h1` e `margin-bottom: auto` su `#startBtn`: gli auto-margin assorbono lo spazio libero quando il contenuto entra e valgono 0 quando non entra; (3) mai usare lo shorthand `margin:` su quegli elementi dopo gli auto-margin, perché li azzera — usare solo longhand. **Trap CSS scoperto il 2026-09-29**: `overflow-y: auto` sembra ridondante perché da solo `overflow-x: hidden` fa calcolare `overflow-y` come `auto` (regola CSS: se un asse non è `visible`, l'altro calcola ad `auto`). Rimuovendo solo `overflow-y` per "pulizia" lo start screen resta scorrevole, ma **rimuovendo entrambi il bug torna** e i test UI lo intercettano. Non trattarli come intercambiabili. Verifica: `node scripts/run-ui-tests.js` (13 test su 9 viewport desktop + 2 mobile). |
| D30 | **La CI deve ESEGUIRE i test, non solo controllarli staticamente** | Polish Pack fix 2026-09-28 (PR #15). Fino a questa data la job `tests` eseguiva solo `grep` (esistenza di `BossHotelPure`, conteggio `test(` >= 30, referenziamento di `elevator.html`): **zero test eseguiti**. Di conseguenza 4 test restarono rossi per mesi senza allarme e i bug bloccanti iPhone e startBtn arrivarono in `main`. Ora esiste la job `tests-run` che esegue `tests.html` in Chromium headless via `scripts/run-tests.js`, fallendo se un test non passa. Vincoli: (1) i test devono essere **indipendenti dal locale del browser** — `loadLang()` cade su `detectBrowserLang()`, quindi un test che assume "la pagina parte in italiano" passa solo su macchina IT e fallisce su runner `en-US`; (2) Playwright va **pinnato** a una versione allineata al build del browser, altrimenti `Executable doesn't exist`; (3) il runner deve avere una guardia anti-falso-verde (0 test eseguiti = fallimento, non successo) e deve stampare gli errori di pagina raccolti, altrimenti un modulo non caricato produce solo "Timeout" illeggibile; (4) i test si eseguono su **server HTTP**, mai `file://` (ES module + importmap + iframe sandbox falliscono per CORS). Aggiungere un test = eseguirlo in locale con `node scripts/run-tests.js` prima del commit. |
| D31 | **I test puri non coprono il layout: serve una job UI comportamentale** | Polish Pack fix 2026-09-29. D30 ha chiuso il gap "la CI non eseguiva i test", ma i 299 test girano su funzioni pure in un iframe nascosto: **nessun layout, nessun rendering**. Una CI verde poteva quindi stare accanto a un'app inutilizzabile, ed è esattamente ciò che è successo con i due bug bloccanti del 2026-09-28, entrambi di CSS. Esiste `scripts/run-ui-tests.js` + job `ui-tests` che verificano il comportamento reale: `#startBtn` dentro il viewport o su contenitore scorrevole su 9 viewport desktop, avvio col mouse alle coordinate vere, `elementFromPoint` per verificare che il tap su mobile arrivi al pulsante e non a un overlay, avviso portrait dismissabile e non a tutto schermo, frame 3D non vuoto via CDP. Tre regole non negoziabili, ciascuna imparata sul campo: (1) **mai `locator.click()`** per testare la raggiungibilità — usa `scrollIntoView` forzato e mascherebbe proprio il difetto cercato; usare `page.mouse.click(x, y)` alle coordinate reali; (2) **mai `page.screenshot()`** su questa app — va in timeout perché aspetta una stabilità di frame che un loop `requestAnimationFrame` continuo non raggiunge; usare CDP `Page.captureScreenshot`; (3) il framework di `test()` deve essere **async-aware**: una fn `async` che rigetta senza `await` passa silenziosamente e il runner mente. Un runner non mai visto fallire non è un runner testato. |

---

## Lezione "state in cima" (post-mortem di bug storici)

3 bug critici nella storia del progetto sono stati causati da **Temporal Dead Zone
(TDZ)**: una variabile usata prima di essere `let`/`const`-dichiarata.

| Bug | Sintomo | Causa | Fix |
|---|---|---|---|
| TDZ state | Cabin non si muove | `tickMove` legge `state.isMoving` prima che `state` sia definito | `state`/`hoveredBtn`/`buttonList` ora dichiarati in CONFIGURAZIONE |
| TDZ hoveredBtn | Display flicker | `drawModernDisplay` accede `hoveredBtn.current` prima della dichiarazione | idem |
| TDZ buttonList | `Cannot access 'buttonList' before initialization` in `buildCorridor` | `disposeCorridor` (chiamata all'avvio) accede l'array | idem |

**Regola**: se aggiungi un nuovo state globale (es. `state.myNewFlag`), dichiaralo
nella sezione CONFIGURAZIONE, mai inline in funzioni. Se devi esporre un nuovo
array condiviso, segue lo stesso pattern di `buttonList`.

---

## Polish Pack attivi

- **Polish Pack V4**: 8/8 step (100%) — chiuso il 2026-09-26.
  Step 1-6 (Test exposure/Routing/A11y/Funzioni lunghe/Helper DRY/Open source)
  + Step 7 (Mobile scene separation D26est) + Step 8 (Mobile hamburger menu D27).
  Contratti D-key totali: **31** (D1-D20 V1+V2+V3, D21-D27 V4, D28-D30 fix 2026-09-28, D31 fix 2026-09-29).
  Vedi `PIANO_V4.md` per dettagli + `ROADMAP_POST_V7.md` per backlog futuro.
  Totale test vanilla: **299 test** (285 al 2026-09-28, poi +13 sui helper puri
  del movimento cabina il 2026-09-29: `computeMoveState`,
  `computeArrivalPhase`, `computeMoveVibration`, `computeIdleVibration`,
  `computeArrivalDirection` — estratti da `tickMove`, che fino a allora non
  aveva alcuna copertura).

- **Polish Pack V3**: 9/9 step (100%) — chiuso il 2026-09-23 (vedi
  `PIANO_V3.md` storico per roadmap completa).

---

## Workflow di sessione interattiva (per un nuovo Polish Pack)

Valido quando si apre un nuovo pack. I pack V1–V4 sono chiusi: per il
lavoro di manutenzione valgono invece le regole di "Workflow operativo
(Git + verifica)" e "Regole di aggiornamento della documentazione" piu' in alto.

1. Apri la sezione dello step, leggi le Decision Questions
2. Usa il tool `question` per chiedere 1 domanda alla volta
3. Implementa SOLO le opzioni approvate, nello scope approvato
4. Aggiorna `PIANO_VN.md` segnando lo step ✅
5. Esegui la sequenza completa: `check-balance` → `run-tests` → `run-ui-tests`
   → copia in `dist/index.html`
6. Fai commit separati per ogni sotto-step
7. Aggiorna `PIANO_MIGLIORAMENTI.md` con la fase implementata al merge
8. Smoke test screenshot pre/post ottimizzazione
9. Aggiorna la tabella D-key se hai introdotto un contratto nuovo