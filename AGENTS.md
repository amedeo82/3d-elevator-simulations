# AGENTS.md — Guida per agenti di coding su BOSS HOTEL Elevator 3D

## Cos'è il progetto
Simulatore 3D prima-persona di una cabina ascensore di hotel di lusso.
Single-file HTML (~390 KB, ~9250 righe) con JS inline (modulo ES).
Three.js r160 via importmap. Nessuna build step, nessuna dipendenza npm.

Stato: **22/22 funzionalità backlog implementate (100%)** — V1 chiuso con v1.8.
Polish Pack V2 **chiuso 2026-09-17** (10/13 step, 77%; Step 6 PWA, 11 L-block,
13 WebXR rinviati).
Polish Pack V3 **in corso** (5/9 step, 56%; Step 1–5 ✅, Step 6–9 ⏳).
Roadmap attiva: `PIANO_V3.md`.
Log implementativo: `PIANO_MIGLIORAMENTI.md` (fasi 1–22).
Audit oggetto `state`: `STATE.md`.

---

## Layout del file `elevator.html`

| Sezione | Riga ~ | Contenuto |
|---|---|---|
| Importmap + script module | 459–468 | Bootstrap three.js |
| CONFIGURAZIONE | 791–1452 | Costanti (CABIN, NUM_FLOORS, FLOOR_HEIGHT, preset hotel, i18n) |
| STATO GLOBALE (`state` + `hoveredBtn` + `buttonList` + `movePaused`) | 1579–1683 | Dichiarati in cima per evitare TDZ (D2, D15) |
| Mini event bus | 1693–1724 | `bus.emit/on` homemade (Polish Pack V2 Step 1d) |
| Scena / Renderer / Camera | 1725–1752 | three.js core |
| Illuminazione | 1753–1777 | ceilingLight, fillLight, alarmLight |
| Texture procedurali | 1778–1894 | makeBrushedMetalTexture, makeMarbleTexture, makeCeilingTexture |
| Cabina (gruppo radice) | 1895–2040 | Pavimento, soffitto, pareti, specchio, maniglione |
| Pannello pubblicitario laterale | 2041–2461 | Display 5 schermate rotanti (Fase 2) |
| Dettagli premium cabina | 2462–2868 | Profili alluminio, battiscopa, LED, telecamera, citofono, targhe (Fase 1) |
| Porte | 2869–3030 | Anta sx/dx + indicatori direzione |
| Corridoio tematico + arredi + cartello piano | 3031–4331 | Costruzione corridoio per piano, pulsantiera esterna ▲/▼, helper arredi |
| Pulsantiera moderna digitale | 4332–4529 | Display touch + 4 tasti fisici (◄ \| \| ► STOP !) |
| Render display touch | 4530–5163 | `drawModernDisplay()` + 3-layer caching (Polish Pack v1.6 #18) |
| Tutorial contestuale prima volta | 5164–5344 | Polish Pack V2 Step 2b (5 step, tasto `?`) |
| Helper matematici puri | 5346–5555 | Polish Pack V2 Step 12 (`clamp`, `lerp`, ...) |
| 3-layer rendering caching | 5557–5948 | Polish Pack v1.6 #18 (statico / semi-statico / dinamico) |
| Funzioni di stato | 5950–6002 | updateFloorDisplay, refreshHudButtons |
| Audio (WebAudio sintetizzato) | 6004–6209 | Whoosh, musica contestuale cabin/corridoio/ristorante |
| Audio contestuale corridoio | 6211–6415 | Polish Pack V2 Step 3a (4 temi corridoio) |
| Musica ristorante "La Terrazza" | 6417–6972 | Polish Pack V2 Step 3b |
| Annunci vocali TTS | 6974–7188 | `speak`, `speakWithSubtitle`, `announceArrival`, `announceAlarm`, ecc. |
| Movimento cabina | 7190–7483 | requestFloor, actuallyStartMove, tickMove (con envelope sin/π) |
| Animazione porte | 7484–7678 | setDoors, animateDoorsTo, tickDoors, scheduleAutoClose, sensor IR |
| Allarme | 7603–7678 | toggleAlarm (luci rosse, sirena 660/880Hz) |
| Citofono interattivo (EN 81-28) | 7680–7812 | Polish Pack V2 Step 14 (lampeggio 4Hz, reception simulata) |
| Esci / Rientra cabina | 7814–7901 | exitCabin, enterCabin, prenotazione, ADA compliance |
| Raycasting & click pulsanti | 7903–8049 | Click + hover pulsanti 3D |
| Pointer lock — mouse look | 8051–8180 | First-person mouse look |
| Movimento FPS + tastiera | 8182–8443 | tickPlayer, keydown listener, NPC passeggeri |
| assert runtime contratti state | 8445–8479 | Polish Pack V2 Step 1c (`assertStateInvariants`) |
| LOOP (RAF + tick*) | 8480–8583 | `loop()`, `tickDisplay`, `tickMove`, `tickDoors`, `tickPlayer`, `tickFadeStates` |
| Settings QoL UI wiring | 8585–8704 | Polish Pack V3 Step 3 (sliders volume + brightness + export JSON) |
| AVVIO | 8706–8742 | buildCorridor iniziale, start screen, init eventi |
| Preferenze persistenti (localStorage) | 8743–9223 | 5 chiavi @v1: prefs, lang, config, audio, display, onboarded |
| `window.BossHotelPure` namespace | 9229–9253 | 30+ helper puri per `tests.html` |

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

## Comandi build / verifica

| Comando | Scopo |
|---|---|
| `node scripts/check-balance.js elevator.html` | Verifica sintassi + brace balance (autorevole) |
| Aprire `tests.html` in browser (via server locale) | Esegue 134 test (~228 assert vanilla) su `window.BossHotelPure` |
| Aprire `elevator.html` in browser | Smoke test locale (Chrome/Edge/Firefox) |
| Copia `elevator.html` → `dist/index.html` | Build per deploy (vedi ultimo commit di ogni Polish Pack) |
| `git checkout feature/<branch>` | Lavorare su branch dedicato, merge solo dopo validazione |

CI GitHub Actions: `.github/workflows/ci.yml` ha 2 job paralleli:
1. `check` — `check-balance.js` su ogni push/PR
2. `tests` — validazione statica: presenza `window.BossHotelPure` in `elevator.html`, presenza `tests.html`, conteggio `test('` >= 30, referenziamento `elevator.html` in `tests.html`

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
| D15 | **Micro-animazioni rispettano `state.reducedMotion` + `movePaused` in CONFIGURATION** | Polish Pack V3 Step 4. Animazioni cosmetiche (respiro tasti panel, lampeggio gentile cartello, bounce-out vibrazione, fade stati) skippate se `shouldDisableMotion(state) === true`. Animazioni essenziali (lampeggio allarme, vibrazione cabina, apertura/chiusura porte) restano attive. `movePaused` dichiarato in CONFIGURATION (riga ~1683) per evitare TDZ in `drawModernDisplay` (chiamato durante init prima della dichiarazione originaria). Pattern coerente con `state`/`hoveredBtn`/`buttonList` — lezione V2 bug TDZ. |
| D16 | **Performance: `textureCache` LRU + `mergeGeometries` + skip no-op costosi** | Polish Pack V3 Step 5. `textureCache` LRU capacity 10 cacha canvas texture della cabina (es. base di `drawMovingSign` durante flash gentile, hit ratio ~90%). `mergeGeometries` per geometrie dello stesso materiale (richiede `geometry.applyMatrix4(matrix)` per posizionare le singole geometrie prima del merge). Skip no-op costosi (`ctx.filter = brightness(1.0)` quando default). Benchmark via `runBenchmark()` (5s idle + 5s moving) + bottone in maintenance overlay (Shift+M) per misurazione iterativa. |
| D22 | **Routing inversione asimmetrico (look algorithm)** | Polish Pack V4 Step 2. `pickNextFloor`/`queueNextSmart` quando non ci sono richieste same-dir nella coda: `lastDir='up'` + invert a `down` → ritorna MAX (highest) della coda down; `lastDir='down'` + invert a `up` → ritorna MIN (lowest) della coda up. Logica: la cabina prosegue nella direzione attuale fino al farthest della direzione opposta, poi serve i restanti tornando indietro (algoritmo elevator classico). Versione stateful `queueNextSmart` deve restare in sync con `pickNextFloor` (test in `tests.html` bloccano la divergenza). |
| D23 | **A11y: `aria-label`/`role`/`aria-live`/`aria-hidden` su elementi chiave** | Polish Pack V4 Step 3. Helper `applyAriaLabels()` chiamato da `applyLangToDOM()` setta `aria-label` localizzati (nuove chiavi `aria*` in `STRINGS.it`/`STRINGS.en`) su bottoni HUD (`hud-exit-btn`, `hud-reenter-btn`, `startBtn`, 5 `m-filter-btn`, `m-export-json`, `m-benchmark-btn`, 2 `virtual-call-btn`, `virtual-joystick`, tutorial, customizer). Live regions: `#subtitle` e `#mode-badge` con `role="status" aria-live="polite" aria-atomic="true"`. Decorative: `#pointerhint`, `.rotate-icon`, `.joystick-knob`, `#rotate-device-overlay` con `aria-hidden="true"` o `role="alertdialog"`. Test: 15+ assert manuali in `tests.html` (no CDN, conforme D1) che verificano presenza attributi + cambio lingua aggiorna `aria-label`. `setLang`/`applyLangToDOM`/`applyAriaLabels` esposti in `BossHotelPure` per test cross-iframe. |
| D24 | **Funzioni core <150 righe con commenti narrativi** | Polish Pack V4 Step 4. Tutte le funzioni top-level in `elevator.html` devono essere <150 righe (target raggiunto: 0 funzioni >=150). Le 16 funzioni piu' lunghe (>=80 righe) hanno commenti narrativi stile V3 Step 7 (`Polish Pack V4 Step 4 (D24):` + scopo + sezioni + contratti D-key + performance). Pattern di split consentito: estrarre helper mantenendo stesso module scope + side-effect su `state`. Esempi: `buildCorridor` 178 → 76 (estratto `buildCorridorShell` + `buildCorridorLights`); `startCorridorAudio` 156 → ~50 (estratto 4 helper `setupLobbyAudio`/`setupOfficeAudio`/`setupHotelAudio`/`setupPenthouseAudio`). Helper tool: `node scripts/find-long-fns.js` (brace-counting corretto) da rieseguire dopo refactor importanti. |

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

## Backlog attivo (V3)

Vedi `PIANO_V3.md` per i 9 step pianificati (T1a/b/c + T2a/b/c + T3a/b + Bonus mobile).
**Stato attuale**: 5/9 step ✅ (Step 1 Accessibility, 2 Bug fix UX, 3 Settings QoL,
4 Micro-animazioni, 5 Performance). Prossimo: Step 6 QoL manutenzione.
Polish Pack V2 è chiuso al 77% (10/13 step; Step 6 PWA, 11 L-block, 13 WebXR
rinviati a V4+).

---

## Workflow di sessione interattiva (per PIANO_V3)

1. Apri la sezione dello step, leggi le Decision Questions
2. Usa il tool `question` per chiedere 1 domanda alla volta
3. Implementa SOLO le opzioni approvate, nello scope approvato
4. Aggiorna `PIANO_V3.md` segnando lo step ✅
5. Esegui `node scripts/check-balance.js elevator.html` dopo ogni modifica
6. Fai commit separati per ogni sotto-step (Q5.1 = opzione A nel pattern V3)
7. Aggiorna `PIANO_MIGLIORAMENTI.md` con la fase implementata al merge finale
8. Smoke test screenshot pre/post ottimizzazione (obbligo V3, lezione V2)