# AGENTS.md — Guida per agenti di coding su BOSS HOTEL Elevator 3D

## Cos'è il progetto
Simulatore 3D prima-persona di una cabina ascensore di hotel di lusso.
Single-file HTML (~190 KB, ~5000 righe) con JS inline (modulo ES).
Tre.js 0.160 via importmap. Nessuna build step, nessuna dipendenza npm.

Stato: **22/22 funzionalità implementate** (Polish Pack v1.6 merged).
Roadmap attiva: `PIANO_V2.md` (13 step, tutti ⏳).
Log implementativo: `PIANO_MIGLIORAMENTI.md`.

---

## Layout del file `elevator.html`

| Sezione | Riga ~ | Contenuto |
|---|---|---|
| Importmap + script module | 459–468 | Bootstrap three.js |
| CONFIGURAZIONE + STATE | 473–533 | Costanti, `state`, `hoveredBtn`, `buttonList` (dichiarati in cima) |
| Scena / Renderer / Camera | 535–560 | three.js core |
| Illuminazione | 562–580 | ceilingLight, fillLight, alarmLight |
| Texture procedurali | 588–680 | makeBrushedMetalTexture, makeMarbleTexture, makeCeilingTexture |
| Cabina | 705–1595 | Pavimento, soffitto, pareti, specchio, pannello pubblicitario |
| Dettagli premium cabina | 1207–1595 | Profili alluminio, battiscopa, LED, telecamera, citofono, targhe |
| Porte | 1597–1675 | Anta sx/dx, indicatore direzione |
| Corridoio tematico | 1678–2775 | Costruzione corridoio per piano, pulsantiera esterna ▲/▼ |
| Pulsantiera moderna | 2781–2975 | Display touch + 4 tasti fisici (◄\| \|► STOP !) |
| Display touch (rendering) | 2979–3568 | 3-layer caching (Polish Pack v1.6 #18) |
| Funzioni di stato | 3609–3656 | updateFloorDisplay, refreshHudButtons |
| Audio | 3656–3965 | whoosh, musica contestuale, vocale (TTS), comandi |
| Overlay manutentore | 3970–4068 | Shift+M: FPS, draw calls, wireframe, teletrasporto |
| Annunci vocali TTS | 4070–4147 | announceArrival, announceAlarm, announceDoorClosing |
| Movimento cabina | 4150–4285 | requestFloor, actuallyStartMove, tickMove |
| Animazione porte | 4287–4332 | setDoors, animateDoorsTo, tickDoors, scheduleAutoClose |
| Allarme | 4334–4355 | toggleAlarm |
| Esci/Rientra cabina | 4357–4435 | exitCabin, enterCabin, prenotazione |
| Raycasting | 4437–4572 | Click + hover pulsanti 3D |
| Pointer lock | 4575–4615 | First-person mouse look |
| Movimento FPS + tastiera | 4617–4812 | tickPlayer, keydown listener |
| Loop | 4834–4908 | RAF + tutte le tick* |
| Avvio | 4910–4974 | buildCorridor iniziale, start screen, init |

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

---

## Comandi build / verifica

| Comando | Scopo |
|---|---|
| `node scripts/check-balance.js elevator.html` | Verifica sintassi + brace balance (autorevole) |
| Aprire `elevator.html` in browser | Smoke test locale (Chrome/Edge/Firefox) |
| Copia `elevator.html` → `dist/index.html` | Build per deploy (vedi ultimo commit di ogni Polish Pack) |
| `git checkout feature/<branch>` | Lavorare su branch dedicato, merge solo dopo validazione |

CI GitHub Actions: `.github/workflows/ci.yml` gira `check-balance.js` su ogni push/PR.

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

## Backlog attivo (V2)

Vedi `PIANO_V2.md` per i 13 step pianificati. Stato: tutti ⏳ pending.
Step 1 (questo branch): salute del codice (CI + AGENTS.md + audit state + event bus).

---

## Workflow di sessione interattiva (per PIANO_V2)

1. Apri la sezione dello step, leggi le Decision Questions
2. Usa il tool `question` per chiedere 1 domanda alla volta
3. Implementa SOLO le opzioni approvate, nello scope approvato
4. Aggiorna `PIANO_V2.md` segnando lo step ✅
5. Esegui `node scripts/check-balance.js elevator.html` dopo ogni modifica
6. Fai commit separati per ogni sotto-step (Q1.5 = opzione C)
7. Aggiorna `PIANO_MIGLIORAMENTI.md` con la fase implementata al merge finale