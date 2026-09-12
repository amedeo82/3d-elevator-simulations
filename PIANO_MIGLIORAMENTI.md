# Piano di Miglioramento — Simulatore Ascensore 3D
**Hotel Royal Edition → BOSS HOTEL Premium Edition**

Documento di design e implementation log.
**Versione 1.3 — Polish Pack v1.5 in corso** · Aggiornato 2026-09-12

> Questo documento traccia il piano originale, le decisioni approvate, lo stato di implementazione di ogni fase, gli scostamenti dal piano e i bug fix successivi. Per la documentazione del progetto vedi `README.md`.

---

## 0. Status overview

| Item | Stato |
|---|---|
| Decisioni approvate | ✅ 7/7 |
| Fasi implementate | ✅ 9/9 (100%) |
| Polish Pack v1.1 | ✅ 5/5 (#17 ✅, #15 ✅, #21 ✅, #1 ✅, #3 ✅) |
| Polish Pack v1.2 | ✅ 3/3 (#10 ✅, #5 ✅, #11 ✅) |
| Polish Pack v1.3 | ✅ 5/5 (#4 ✅, #6 ✅, #7 ✅, #8 ✅, #22 ✅) — merged su `main` |
| Polish Pack v1.4 | ✅ 4/4 (#2 ✅, #9 ✅, #19 ✅, #20 ✅) — branch `feature/polish-pack-v1.4` |
| Polish Pack v1.4 hotfix | ✅ 1/1 (display touchscreen passo-passo) — commit `e02adca` |
| Polish Pack v1.5 | 🟡 0/3 (#13 🔄, #14 🔄, #18 🔄) — branch `feature/polish-pack-v1.5` |
| Bug fix post-fasi | ✅ 6 (TDZ state, TDZ hoveredBtn, drawDisplay residuo, celle touch disallineate, dispose corridor vuoto, addSkylineWindow eZ non definito) |
| Documentazione | ✅ README.md + questo file |
| Deploy pubblico | ✅ Live |
| File di progetto | `elevator.html` (~162KB, single file) |

**Tempo effettivo di sviluppo**: ~3 sessioni di lavoro, in linea con la stima iniziale di 10-12 ore.

**Polish Pack v1.4** (completato 2026-09-12): 4 feature selezionate dall'utente dal backlog §11,
tutte tranne #19 ad alto impatto. Implementate e committate su `feature/polish-pack-v1.4`.

**Hotfix post-v1.4** (2026-09-12, commit `e02adca`): piccolo enhancement richiesto dall'utente
per allineare il display touchscreen della cabina al comportamento "passo-passo" già presente
nel cartello del corridoio (`drawMovingSign`, Polish Pack v1.3 #4) e nella strip DOM
`#floor-strip`. Non aggiunge una nuova voce al backlog §11 ma migliora la coerenza UX.

**Polish Pack v1.5** (in corso, aperto 2026-09-12): tre feature a basso/medio sforzo dal
backlog residuo post-v1.4 — #13 accessibilità WASD, #14 logica passeggeri tematica,
#18 caching canvas offscreen per il display touch. Nessuna decisione architetturale
pendente (esclude deliberatamente #12 i18n e #16 PWA). Branch `feature/polish-pack-v1.5`.
Target: 20/22 funzionalità implementate (90.9%).

---

## 1. Sintesi esecutiva (originale)

L'obiettivo era trasformare l'attuale simulazione in una **cabina ascensore di un hotel di lusso**, mantenendo l'interazione in prima persona e aggiungendo:

1. Interni cabina con dettagli realistici di grado "AAA" (giunture, profili, ventilazione, telecamera, ecc.).
2. Una **pulsantiera digitale moderna** con display LCD principale che sostituisce i tasti numerici meccanici, mostrando:
   - Selezione piani
   - Direzione di viaggio
   - Mappa dell'edificio con posizione cabina
   - **Meteo casuale** (icona + temperatura + condizioni)
   - **Informazioni sull'edificio** (nome, indirizzo, orario, piani)
3. Tasti fisici solo per le funzioni "hard" (emergenza, stop, porte).
4. Miglioramenti accessori (annunci vocali, illuminazione dinamica, pubblicità, sicurezza).

**Risultato finale**: tutti gli obiettivi raggiunti. Singolo file HTML deployabile. Prestazioni accettabili (60 FPS su hardware medio).

---

## 2. Analisi dello stato attuale (al momento della proposta)

### 2.1 Cosa c'era al tempo della proposta
| Area | Stato | Note |
|---|---|---|
| Cabina base (muri, pavimento, soffitto) | ✅ Funzionante | Doppio lato sui plane, corretto dopo fix camera |
| Pannello pulsanti meccanico (1..9, T, ◄\|, \|►, !, STOP) | ✅ Funzionante | Tasti fisici 3D cliccabili |
| Display LCD verde secondario | ✅ Funzionante | Solo "piano" + stato testuale |
| Indicatore direzione sopra porte | ✅ Funzionante | Texture canvas "▲/▼/·" |
| Corridoio tematico per piano | ❌ Assente | Da creare |
| Cartello piano lato corridoio | ❌ Assente | Da creare |
| Uscita/rientro cabina | ❌ Assente | Da creare |
| Movimento FPS nel corridoio | ❌ Assente | Da creare |
| Allarme + luci rosse | ❌ Assente | Da creare |
| Audio annunci vocali | ❌ Assente | |
| Telecamera di sicurezza | ❌ Assente | |
| Meteo | ❌ Assente | |
| Info edificio | ❌ Assente | Solo nome hotel sul cartello |
| Pubblicità / display secondari | ❌ Assente | |
| Illuminazione dinamica | ❌ Assente | Solo statica |

### 2.2 Limitazioni note (al momento della proposta)
- **Pannello meccanico "datato"**: la pulsantiera attuale è anni '90; in hotel di lusso moderni si usa un touch screen + tasti fisici solo per emergenza. ✅ **Risolto in Fase 3**
- **Display principale troppo piccolo**: il LCD attuale è 8×3 cm nel pannello, illeggibile dalla camera. ✅ **Risolto in Fase 3**
- **Nessuna informazione contestuale**: l'utente non sa che ore sono, che tempo fa, dove si trova nell'edificio. ✅ **Risolto in Fasi 3-4-5**
- **Mancanza di annunci vocali**: in un vero hotel c'è una voce che annuncia "Piano tre, prego". ✅ **Risolto in Fase 6**
- **Pochi dettagli "premium"**: niente griglie di ventilazione, niente profili in alluminio agli spigoli, niente telecamera interna. ✅ **Risolto in Fase 1**

---

## 3. Decisioni approvate

Sostituisce la sezione "Decisioni richieste" del piano originale. Tutte le 7 decisioni sono state approvate dall'utente il **2026-08-24**.

| # | Decisione | Scelta approvata |
|---|---|---|
| 1 | Approvazione generale del piano | ✅ Tutte le 9 fasi |
| 2 | Layout pulsantiera (4.2) | ✅ Conferma del layout proposto |
| 3 | Annunci vocali TTS | ✅ Inclusi, con toggle V |
| 4 | Città meteo | ✅ **Roma** |
| 5 | Brand hotel | ✅ **BOSS HOTEL** (invece di HOTEL ROYAL proposto) |
| 6 | Pannello pubblicitario laterale | ✅ Inclusa Fase 2 |
| 7 | Modalità notte + extra "feel" | ✅ Inclusa Fase 8 |

---

## 4. Stato implementazione per fase

### Fase 1 — Dettagli interni cabina ✅
- ✅ Profili in alluminio ai 4 spigoli della cabina
- ✅ Battiscopa su tutto il perimetro
- ✅ Giunti pannelli pareti (linee sottili)
- ✅ Striscia LED ambientale lungo il soffitto + PointLight soffusa
- ✅ Griglia di ventilazione con lamelle sul soffitto
- ✅ 2 bocchette rotonde ai lati del pannello LED
- ✅ Soglia in ottone sotto le porte
- ✅ Tappetino di ingresso con righe antiscivolo
- ✅ Telecamera dome con cupola + lente + LED rosso lampeggiante + targhetta "CCTV — REC"
- ✅ Altoparlante circolare sul soffitto sopra le porte
- ✅ Citofono con tasto verde illuminato "INTERFONO"
- ✅ Targa dorata "BOSS HOTEL ★★★★★ Via Veneto 142 Roma"
- ✅ Targa "MAX 8 PERSONE · 630 kg · CE EN 81-20"
- ✅ Targa "ULTIMA MANUTENZIONE AGO 2026 · Cert. n. 4187"
- ✅ LED telecamera animato nel loop (lampeggia 100ms ogni 2s)

### Fase 2 — Pannello pubblicitario laterale ✅
- ✅ Display 16:9 sulla parete sinistra sopra lo specchio
- ✅ 5 schermate a rotazione ogni 12s:
  1. Orologio analogico animato in tempo reale (lancette ore/minuti/secondi)
  2. Meteo esteso con previsioni
  3. "BENVENUTI al Boss Hotel" + storia
  4. Menù del giorno del Ristorante "La Terrazza"
  5. Offerte Boss Spa & Wellness
- ✅ Cornice nera + LED di stato verde
- ✅ Funzione `updateAdScreen(now)` chiamata nel loop

### Fase 3 — Pulsantiera moderna digitale ✅
- ✅ Rimozione completa dei 9 tasti meccanici 1-9 + T
- ✅ Nuovo display touch 540×1100 px in vetro nero con cornice alluminio
- ✅ Display posizionato in alto nel pannello (36×78 mm)
- ✅ Vetro riflettente (`MeshPhysicalMaterial`) davanti al display
- ✅ 4 tasti fisici sotto al display: ◄| (apri), |► (chiudi), STOP (giallo), ! (allarme, rosso)
- ✅ Tasto ↗ (Esci) in alto a destra del pannello
- ✅ Header display: nome hotel + orologio digitale in tempo reale + data italiana
- ✅ Sezione centrale: piano corrente gigante (130px) con freccia direzione animata
- ✅ Griglia touch 3×4 con celle per piani 9..1 + T (Terra)
- ✅ Mappa edificio stilizzata (10 quadratini) sotto la sezione meteo
- ✅ Hover visivo: cella si sporge in avanti + highlight blu/verde sul rendering
- ✅ Animazione di pressione (scale 0.92 per 130ms)
- ✅ Marchio "BOSS HOTEL" dorato sotto i tasti

### Fase 4 — Sistema meteo casuale ✅
- ✅ Generatore con 7 condizioni e pesi realistici
- ✅ Icone disegnate su canvas con animazioni (raggi, gocce, fiocchi, fulmini, nebbia)
- ✅ Range temperature coerente con condizione
- ✅ Variazione di temperatura per piano (più freddo ai piani alti)
- ✅ Rigenerazione al 50% di probabilità ad ogni arrivo al piano
- ✅ Località: **Roma** (come approvato)
- ✅ Funzione `maybeRegenerateWeather(floor)` integrata con `tickMove`

### Fase 5 — Info edificio + mappa + orologio ✅
- ✅ Header display con nome hotel
- ✅ Indirizzo nella targa della cabina e nel cartello del corridoio
- ✅ Orologio digitale nel display touch (formato 24h, in tempo reale)
- ✅ Orologio analogico nel pannello pubblicitario laterale
- ✅ Data in italiano (es. "MER 24 AGO")
- ✅ Mappa edificio stilizzata 1×10 con quadratini color-coded:
  - Verde = piano corrente
  - Arancione = in coda
  - Grigio = altro
  - Giallo durante il movimento

### Fase 6 — Annunci vocali TTS ✅
- ✅ Web Speech API con voce italiana (`it-IT`)
- ✅ Funzione `speak(text, opts)` con rate/pitch/volume configurabili
- ✅ `announceArrival(floor)` — "Piano quinto, prego"
- ✅ `announceAlarm()` — "Allarme. Chiamata di soccorsi in corso. Restate calmi."
- ✅ `announceDoorClosing()` — "Attenzione. Le porte si stanno chiudendo."
- ✅ Toggle con tasto **V**
- ✅ Fallback graceful se Web Speech API non disponibile

### Fase 7 — Countdown chiusura porte ✅
- ✅ Overlay 3..2..1 sul display touch quando le porte iniziano a chiudersi
- ✅ Bordo rosso lampeggiante (blink 200ms)
- ✅ Beep a tono crescente (600Hz → 700Hz → 850Hz)
- ✅ Si cancella automaticamente se l'utente preme "Apri porta"
- ✅ Funzioni `startDoorCountdown()` / `cancelDoorCountdown()` / `tickDisplay()`

### Fase 8 — Illuminazione dinamica + extra ✅
- ✅ **Modalità notte** (tasto N): ceiling light 0.35, fill light 0.08, fog scuro
- ✅ **Indicatore carico** "👤 X/8" nel header del display
- ✅ Variazione randomica passeggeri ogni 8s quando la cabina è ferma
- ✅ **Vibrazione cabina** al click: oscillazione Y ±3mm per 250ms (decay esponenziale)
- ✅ Logica nel loop: `state.nightMode` switcha le intensità delle luci

### Fase 9 — Test + bilanciamento ✅
- ✅ Verifica sintassi con `node --check`
- ✅ Bilanciamento parentesi (0/0/0)
- ✅ Verifica una sola dichiarazione di `state` e `hoveredBtn`
- ✅ File deployato e funzionante

### Fase 10 — Polish Pack v1.1 🟡 (in corso, branch `feature/polish-pack-v1.1`)
Miglioramenti a basso rischio tratti dal backlog §11, in ordine di priorità impatto/sforzo.

- ✅ **#17 Fix dispose corridoi** — `disposeCorridor()` aveva un `if` con corpo vuoto: le texture di tutti i materiali del corridoio (esclusi i `signMat`) non venivano mai dispose(), causando memory leak a ogni cambio piano. Riscritto il ciclo per gestire materiali singoli e array, scartare esplicitamente `signTex` condivisa, e dispose() texture + materiali in modo uniforme.
- ✅ **#15 Persistenza preferenze in localStorage** — aggiunte `loadPrefs()` / `savePrefs()` con chiave versionata `bossHotelPrefs@v1`. `muted`, `ttsEnabled`, `nightMode` ora permangono dopo il refresh. Hook chiamato nei 3 toggle handler (M, V, N). Aggiunto feedback visivo "Audio: ON/OFF" al tasto M (era assente).
- ✅ **#21 Specchio riflettente** — sostituito `MeshStandardMaterial` con `Reflector` di `three/addons/objects/Reflector.js` (riga ~622). Render target 512×512, `clipBias: 0.003`, tinta `0xb0b4b8`. Lo specchio riflette ora davvero l'interno cabina (display LED, striscia LED soffitto, pannello, passeggeri). Importmap `three/addons/` era già pronto da una predisposizione precedente.
- ✅ **#1 Shake cabina durante viaggio** — aggiunti 5 nuovi campi a `state` (`vibrationX`, `vibrationZ`, `vibrationRoll`, `vibrationPitch`, `_movePhase`). In `tickMove()` calcolo oscillazioni X/Z ±3.5mm + roll/pitch ~2° con envelope a campana `sin(π·moveT)` (max al centro, nullo ai capi). Decay graduale (`×0.85`/frame) quando la cabina è ferma. Applicato al `cabin` group nel LOOP.
- ✅ **#3 Whoosh loop** — aggiunte 3 funzioni audio (`makeNoiseBuffer`, `startWhoosh`, `stopWhoosh`) in sezione AUDIO (~riga 2856). White noise 1s in loop attraverso `BiquadFilter` bandpass; pitch 300→1100Hz modulato da `sin(π·moveT)` (envelope a campana), gain 0→0.025. Stop con `linearRampToValueAtTime(0, +0.05s)` per evitare click. Hook start/stop in cima a `tickMove()` (riga ~2998) basato su `state.isMoving && !movePaused`.

### Fase 11 — Polish Pack v1.2 ✅ (merged su `main`)

Tre feature UX/accessibilità a basso rischio dal backlog §11.3.

- ✅ **#10 Scorciatoie tastiera 1–9/0 per piani** — aggiunto blocco nel `keydown` listener (riga ~3435) che riconosce `Digit1`–`Digit9`, `Digit0`, `Numpad1`–`Numpad9`, `Numpad0` e chiama `requestFloor(floor)`. Rispetta `state.alarmOn` (già gestito da `requestFloor`). Aggiunta riga nel pannello help HUD. Feedback visivo via `statusText` ("Chiamato piano N") con reset automatico dopo 1.5s.
- ✅ **#5 Ding differenziato all'arrivo** — `playChime()` ora accetta parametro `kind` (`'final'` | `'intermediate'`, default `'final'`). Quando la cabina arriva a un piano e la coda è vuota → 2 ding (arrivo finale). Se ci sono altri piani in coda → 1 ding singolo a 660Hz (fermata intermedia). Modificata la chiamata in `tickMove()` riga ~3096.
- ✅ **#11 Sottotitoli annunci vocali** — aggiunto `<div id="subtitle">` in HUD (riga 268) con CSS dedicato (pillola gialla con icona 🔊 sopra lo status). Nuova funzione `showSubtitle(text, durationMs)` con fade in/out 250ms tramite classe `.show`. Hook in `announceArrival()`, `announceAlarm()`, `announceDoorClosing()`: ogni annuncio TTS mostra il testo in caps sul HUD. Funziona anche con TTS disabilitato (fallback accessibilità).

### Fase 12 — Polish Pack v1.3 ✅ (completato, branch `feature/polish-pack-v1.3`)

Cinque quick-win dal backlog §11, selezionati per rapporto impatto/sforzo. Scope approvato dall'utente il 2026-09-11. Branch mergiato su `main`.

- ✅ **#4 Indicatore direzione "passo passo" sul cartello corridoio** — nuova `drawMovingSign(fromFloor, toFloor, currentShown)` ridisegna il cartello ad ogni cambio di `floorShown` mostrato (guard con `_lastShownFloor` per evitare update ridondanti). Freccia ▲ verde / ▼ ambra + lista piani attraversati separati da " · " con piano corrente evidenziato. All'arrivo `buildCorridor(moveTo)` ripristina il formato statico "PIANO N°". Hook in `tickMove()` riga ~3158 + reset guard in `startMoveTo()`.
- ✅ **#6 Modalità "Fuori servizio" (tasto `O`)** — aggiunto `state.outOfOrder`. Nuovo handler `KeyO` nel `keydown` listener che: ferma movimento (`movePaused=true`), chiude porte, svuota coda, suona 2 beep discendenti (440→220Hz square). Display touch sostituisce il piano con "FUORI SERVIZIO" rosso + "Ascensore in manutenzione" + "Premere O per ripristinare". Griglia piani renderizzata grigia/disabilitata. Cartello corridoio diventa warning rosso. `requestFloor()` rifiuta le selezioni con tono basso 220Hz. Annuncio vocale italiano all'attivazione/disattivazione. Beep ascendente 660Hz al ripristino. Disattivazione → `movePaused=false`, display torna normale. Priorità OOO anche in `drawMovingSign` (se outOfOrder, delega a `drawFloorSign`).
- ✅ **#7 Numerazione camere hotel contestuale** — nuova `floorRoomRange(f)`: ritorna `Camere N01–N32` per piani 4–6 (32 camere per piano), `Lobby · Reception` per T, `Uffici N° piano` per 1–3, `Attico · Suite N0N` per 7–9. Rendering condizionato a `!state.isMoving && !state.alarmOn` (visibile solo a cabina ferma). Disabilitato implicitamente quando outOfOrder (la sezione "fuori servizio" prende il posto).
- ✅ **#8 Orologio mondiale sul pannello pubblicitario** — aggiunta 6ª schermata `'worldclock'` all'array `AD_SCREENS`. Nuova `drawWorldClock(ctx, w, h)` con sfondo blu notte e tabella: Roma (Europe/Rome), New York (America/New_York), Tokyo (Asia/Tokyo), Londra (Europe/London), Sydney (Australia/Sydney). Orari calcolati con `now.toLocaleTimeString('it-IT', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false })`. Fallback "N/D" graceful se timezone non supportata. Rotazione 12s come le altre schermate.
- ✅ **#22 Schermata "Welcome" interattiva** — aggiunto carosello 5 slide sulla start screen: 🛗 Cabina 5★, 📱 Touch screen, 🌤️ Meteo live, 🗣️ Annunci vocali, 🏨 4 temi corridoio. CSS dedicato (`.slide` + `.slide.active` con bordo dorato + leggero lift). Auto-rotazione 2.5s via `setInterval`; `clearInterval` al click su `startBtn`. Wrappato in `initStartSlides()` IIFE per non rompere se l'HTML non ha le slide.

**Acceptance comune**:
- [x] Nessun calo FPS percepibile (target ≥50)
- [x] Tasto `O` documentato nel pannello help HUD
- [x] TTS italiano coerente con annunci esistenti
- [x] Cleanup corretto risorse (texture, listener)

**Commit Polish Pack v1.3**:
| # | Commit | Descrizione |
|---|---|---|
| docs | `64ea875` | Apre branch + doc iniziale |
| #4 | `356bf5b` | Indicatore passo passo cartello |
| #6 | `3a968f1` | Modalità fuori servizio |
| #7 | `f3f79bb` | Numerazione camere hotel |
| #8 | `ac29bbd` | Orologio mondiale |
| #22 | `fb8576a` | Welcome carosello |
| build | `bcacdfb` | Sync `dist/index.html` |

### Fase 13 — Polish Pack v1.4 ✅ (completato, branch `feature/polish-pack-v1.4`)

Quattro feature selezionate dall'utente il **2026-09-12** dal backlog §11, tutte le 4 voci
della tabella "Prossimi candidati" del `piani/README.md`. Tre ad alto impatto (#2, #9, #20) e
una a basso impatto (#19) completano la copertura dei backlog §11.1, §11.3 e §11.6.

- ✅ **#2 Musica di sottofondo contestuale** — `startMusic()` / `stopMusic()` / `tickMusic()`
  aggiunti in sezione AUDIO (dopo whoosh, ~riga 3311). Tre `OscillatorNode` sine filtrati con
  `BiquadFilter` low-pass + LFO lento per "breathing". Track "jazz" ai piani T–3: accordo
  Cmaj7 un'ottava sotto (130.81 / 196.00 / 246.94 / 293.66 Hz) — suona insieme, ognuno con
  gain 0.15. Track "classica" ai piani 4–9: arpeggio C-E-G-C (261.63 / 329.63 / 392.00 / 523.25 Hz)
  con sequenza [0,1,2,3,2,1] ogni 900ms via `setInterval`. Volume target 0.04, fade-in 1.5s,
  fade-out 0.5s (0.1s se allarme/OOO). `tickMusic()` chiamato nel loop decide start/stop/
  cambio track. Rispetta `state.muted`, `state.alarmOn`, `state.outOfOrder`,
  `state.maintenanceMode`. Si ferma se cabina in movimento o `doorsActual < 0.4` (cabina
  ancora chiusa dopo un viaggio). Cleanup con `stopMusic(true)` su `beforeunload`.

- ✅ **#20 Prenotazione cabina dal corridoio** — nuovo `state.prenotationActive`. Hook in
  `tickPlayer(dt)` (~riga 4269) che calcola ogni frame: `canPrenotate = !playerInCabin &&
  !isMoving && !alarmOn && !outOfOrder` e `isNearDoors = distToDoors < 1.0 && |x| < 0.9`.
  Se vicino e porte chiuse → apre senza countdown né annuncio (`animateDoorsTo(1, 1.4)`).
  Se allontanato dopo aver prenotato → chiude gentilmente (`animateDoorsTo(0, 0.8)`, no
  countdown). Stato `state.prenotationActive` distingue da richieste esplicite. In
  `drawModernDisplay` (~riga 2918) nuovo overlay azzurro "PRENOTATA · Tieni premuto E per
  entrare" che sostituisce il piano quando `prenotationActive && !playerInCabin`.
  `enterCabin()` resetta `prenotationActive=false`. Rifiuta in caso di allarme/OOO.

- ✅ **#9 Comando vocale (speech-to-text)** — `startVoice()` / `stopVoice()` /
  `processVoiceCommand()` aggiunti in sezione AUDIO (~riga 3435). `webkitSpeechRecognition`
  con `lang='it-IT'`, `continuous=true`, `interimResults=false`. Mappa nomi italiani
  (`ITALIAN_NUMBERS`: terra, zero, uno, … nove) + cifre 0-9 a `requestFloor(N)`.
  Toggle con tasto `K`. `recognition.onresult` chiama `processVoiceCommand` che fa regex
  su cifra singola o nome italiano. Feedback `statusText` "Voce: 'piano cinque' → piano 5".
  Funziona solo in cabina (non nel corridoio per non confondere con prenotazione). Cleanup
  con `recognition.stop()` su `beforeunload`. Fallback silente se API non disponibile
  (Firefox). `onend` riavvia automaticamente se `state.voiceEnabled=true`.

- ✅ **#19 Modalità manutentore (`Shift+M`)** — nuovo `state.maintenanceMode`. Nuovo overlay
  HUD `#maint-overlay` (CSS dedicato, ~riga 137): pannello verde in alto a sinistra con FPS,
  draw calls, piano attuale/target, coda, passeggeri, modalità (cabina/corridoio), stato
  OOO, ultimi 10 eventi da `state._eventLog`. Toggle con `Shift+M` (non `M` da solo per
  non confondere con mute). `applyWireframe(true)` attraversa `cabin` e mette
  `material.wireframe=true` su tutti i mesh, salvando snapshot per ripristino. Uscita
  ripristina tutto. In maintenance, i tasti `1`–`9` chiamano `teleportToFloor(n)`
  che salta l'animazione di movimento: cambia `currentFloor`, ricostruisce corridoio,
  ridisegna cartello, apre porte. `tickMaintenance(now)` aggiorna l'overlay ogni frame.
  Buffer FPS a 60 campioni (~1s). Visibile solo a cabina ferma per scelta implementativa
  (i tasti 1-9 sono condizionati a `state.maintenanceMode`).

**Acceptance comune v1.4**:
- [x] Nessun calo FPS percepibile (target ≥50, musica usa 3-4 oscillator a gain 0.04, trascurabile)
- [x] Rispetto vincolo singolo file HTML (verificato: nessuna feature richiede file esterni)
- [x] Web Speech API solo in browser che la supportano; fallback silente in Firefox
- [x] Modalità manutentore non accessibile "per sbaglio" (richiede Shift+M)
- [x] Musica rispetta `state.muted` e si interrompe su allarme / OOO / movimento
- [x] Prenotazione non interferisce con richieste esplicite (è gated da `state.doorsActual < 0.1`)
- [x] Cleanup risorse (recognition.stop, stopMusic) su `beforeunload`
- [x] `node --check` sul JS estratto: exit 0
- [x] Brace/paren balance: 0/0

**Commit Polish Pack v1.4**:
| # | Commit | Descrizione |
|---|---|---|
| docs | `f7afb7e` | Apre branch + scope confermato |
| feat | `0b5c8fc` | Implementazione 4 feature (#2 #9 #19 #20) |
| build | `d16c5a5` | Sync `dist/index.html` |
| docs | (questo commit) | Finalizzazione docs |

**Decisioni di scope**:
- Tutte e 4 le feature in un unico branch (approccio speculare a v1.1 e v1.3)
- Implementate in un commit unico (`0b5c8fc`) perché le modifiche sono strettamente
  interleaved nel codice (state, audio section, keydown listener, loop). Approccio simile
  a v1.2 (un solo commit per 3 feature)
- Backlog residuo post-v1.4: **5/22 feature**. Le restanti sono tutte a bassa priorità
  o alto sforzo (#12 i18n, #16 PWA, #14 logica passeggeri, #13 accessibilità tastiera,
  #18 texture atlas)
- D2 (single-file vs PWA) resta **pendente**: #16 richiede 2 file esterni e non è in scope v1.4

### Fase 14 — Polish Pack v1.4 hotfix: display touchscreen passo-passo ✅ (2026-09-12, commit `e02adca`)

Mini-enhancement richiesto dall'utente subito dopo il merge di v1.4. Non aggiunge una
nuova voce al backlog §11 ma **migliora la coerenza UX** tra i 3 display che mostrano il piano:

| Display | Prima | Dopo |
|---|---|---|
| Cartello corridoio (`drawMovingSign`) | Passo-passo (Polish Pack v1.3 #4) | Invariato ✅ |
| Strip DOM HUD (`#floor-strip`) | Passo-passo (aggiornato in `tickMove`) | Invariato ✅ |
| **Display touchscreen** (`drawModernDisplay`) | **Mostrava solo il piano di partenza per tutta la corsa, poi saltava al piano di arrivo** | **Mostra il piano attualmente attraversato + indicatore "X → Y"** |

**Modifiche** (`elevator.html`, +19/-2 righe):
1. Nuovo `state.floorShown: 0` nello state object
2. `tickMove()` ora scrive `state.floorShown = Math.round(currentDisplay)` ogni frame
   (stessa formula di `Math.round` usata per `drawMovingSign` — coerente)
3. `drawModernDisplay()` usa `state.isMoving ? state.floorShown : state.currentFloor`
   per il grande numero 130px
4. Sotto al numero, durante il movimento, mostra "X → Y" (es. "5 → 2") per chiarezza
5. `tickMove()` arrival + `teleportToFloor()` sincronizzano `floorShown` al piano reale

**Verifiche**:
- [x] `node --check` sul JS estratto: exit 0
- [x] Brace/paren balance: 0/0
- [x] Display passa per T→1→2→3→4→5 durante una salita da Terra a 5 (smooth)
- [x] Display passa per 5→4→3→2→1→T durante una discesa da 5 a Terra
- [x] Teletrasporto (Shift+M + tasto 1-9) mostra il piano corretto
- [x] All'arrivo finale, il display si stabilizza sul piano raggiunto

**Rationale**: il cartello del corridoio e la strip DOM mostravano già il "passo-passo"
ma il display touchscreen (il più prominente, 130px) no. Era incongruente: l'utente vedeva
"sul cartello esterno 1·2·3·4·5" mentre "sul display interno sempre 5 finché non si arriva".

---

### Fase 15 — Polish Pack v1.5 🟡 (in corso, branch `feature/polish-pack-v1.5`)

Tre feature selezionate dall'utente il **2026-09-12** dal backlog residuo post-v1.4:
tutte a basso/medio sforzo, nessuna decisione architetturale pendente. Completa
§11.4 (qualità) e §11.5 (performance), lasciando fuori solo #12 i18n (alto sforzo)
e #16 PWA (richiede decisione D2).

- 🔄 **#13 Verifica accessibilità tastiera nel corridoio** — audit del handler `keydown`
  e del listener `WASD` in sezione `MOVIMENTO FPS` per verificare che:
  - Premendo `W`/`A`/`S`/`D` in cabina la camera NON si muova (guard `state.playerInCabin`)
  - Premendo i tasti `1`–`9`/`0` nel corridoio le porte si aprano o la cabina chiami
    il piano solo se le porte sono aperte (no chiamata con porte chiuse a destinazione
    sbagliata)
  - Fix di eventuali drift di posizione dopo inattività prolungata in cabina
  Acceptance: 3 test manuali + verifica `grep` dei guard esistenti.

- 🔄 **#14 Logica passeggeri coerente** — sostituisce il timer random di Fase 8
  (cambio passeggeri ogni 8s quando la cabina è ferma) con una logica condizionata al
  piano tematico, agganciata all'apertura porte in `buildCorridor()`:
  - Lobby (T): salgono (0–2 nuovi passeggeri)
  - Uffici (1–3): scendono (fino a –2)
  - Hotel (4–6): ±1 random (check-in / check-out)
  - Attico (7–9): +1 (per lo più suite, scende poco)
  Acceptance: clamp [0, 8], display si aggiorna immediatamente, comportamento
  credibile dopo 5+ viaggi random Terra↔3.

- 🔄 **#18 Texture atlas / caching canvas offscreen per display touch** — refactor di
  `drawModernDisplay()` in 3 layer:
  - **Layer statico** (cornice, header con nome hotel): disegnato 1 volta, cached
    offscreen in `displayCacheStatic`
  - **Layer semi-statico** (meteo, mappa edificio, griglia touch): ridisegnato solo
    su evento specifico (cambio meteo, cambio lingua)
  - **Layer dinamico** (piano corrente 130px, freccia, stato, "X → Y"): ridisegnato
    a ogni `markDisplayDirty('dynamic')`
  Acceptance: visivamente identico, FPS in idle sale da ~50 a ~58 (stimato), nessun
  glitch durante cambio meteo o movimento cabina.

**Acceptance comune v1.5** (obiettivi):
- [ ] Nessun calo FPS percepibile (target ≥50; #18 mira a migliorare)
- [ ] Rispetto vincolo singolo file HTML (verificato: tutte e 3 le feature single-file)
- [ ] Nessuna dipendenza npm aggiunta
- [ ] Documentazione aggiornata (`README.md`, questo file, `piani/README.md`)
- [ ] `node --check` JS estratto: exit 0 · brace/paren balance 0/0

**Decisioni di scope**:
- Singolo branch per tutte e 3 le feature (stesso approccio di v1.4)
- Implementazione in commit separati: 1 commit per #13, 1 per #14, 1 per #18
  + 1 commit finale per sync `dist/index.html` + 1 commit per docs finali
- Esclude deliberatamente #12 (i18n) e #16 (PWA) — richiedono decisioni separate
- D2 resta pendente (non toccata da v1.5)

**Commit Polish Pack v1.5** (in progress):
| # | Commit | Descrizione |
|---|---|---|
| docs | (questo commit) | Apre branch + scope confermato |
| #13 | 🔄 da fare | Audit + fix accessibilità tastiera |
| #14 | 🔄 da fare | Logica passeggeri coerente |
| #18 | 🔄 da fare | Caching canvas offscreen display touch |
| build | 🔄 da fare | Sync `dist/index.html` |
| docs | 🔄 da fare | Finalizzazione docs |

**Polish Pack v1.5 → target 20/22 funzionalità implementate (90.9%)**.
Backlog residuo post-v1.5: 2/22 (#12 i18n, #16 PWA).

---

## 5. Scostamenti dal piano

### 5.1 Modifiche al brand
- **Hotel**: da "HOTEL ROYAL" proposto a **"BOSS HOTEL"** approvato dall'utente
- **Sottotitolo**: "★★★★★ Luxury since 1898"
- **Indirizzo**: "Via Veneto 142, Roma"
- Tutti i riferimenti nel codice, nel cartello del corridoio, nella pulsantiera e nel pannello pubblicitario aggiornati di conseguenza

### 5.2 Aggiunte non previste nel piano
- **Favicon SVG inline** — data URI con "B" dorata, per evitare 404 su `/favicon.ico`
- **Indicatore carico** — era "opzionale" nella sezione 7.3, implementato in Fase 8
- **Vibrazione cabina** — era "opzionale" nella sezione 7.5, implementato in Fase 8

### 5.3 Semplificazioni
- **Texture**: restate procedurali (no asset esterni), come da vincolo
- **Pubblicità laterale**: 5 schermate implementate come da piano (no cross-fade complessi, switch secco)
- **No musica di sottofondo**: non prevista nel piano, non aggiunta

---

## 6. Bug fix post-fasi

Elenco dei bug risolti **dopo** il completamento delle 9 fasi, scoperti durante il playtest:

### 6.1 TDZ: `state` acceduto prima dell'inizializzazione
- **Errore**: `(index):1123 Uncaught ReferenceError: Cannot access 'state' before initialization`
- **Causa**: nella Fase 1 (telecamera), `state._camLed = camLed` veniva eseguito prima che `const state = {...}` fosse dichiarato
- **Fix**: spostata la dichiarazione di `state` in cima al codice (subito dopo CONFIGURAZIONE), inclusi tutti i campi `_camLed`, `_camLedSphere`, `_alarmId`, `_lastPassengerChange` inizializzati a `null/0`

### 6.2 TDZ: `hoveredBtn` acceduto prima dell'inizializzazione
- **Errore**: `(index):2642 Uncaught ReferenceError: Cannot access 'hoveredBtn' before initialization`
- **Causa**: `drawModernDisplay` (Fase 3) usava `hoveredBtn.current` ma `hoveredBtn` era dichiarato dopo
- **Fix**: spostata la dichiarazione di `hoveredBtn` in cima al codice, accanto a `state`

### 6.3 Riferimento residuo a `drawDisplay`
- **Errore**: `(index):2956 Uncaught ReferenceError: drawDisplay is not defined`
- **Causa**: in `tickMove` c'era una chiamata residua a `drawDisplay(...)` (vecchia funzione rimossa in Fase 3) per aggiornare il piano durante il movimento
- **Fix**: sostituita con `markDisplayDirty()`

### 6.4 Celle touch del display non cliccabili
- **Sintomo**: l'utente non riusciva a cliccare nessun tasto dei piani sul display
- **Causa**: le celle 3D invisibili (per raycast) erano posizionate a `y = -0.16` mentre il rendering del display le disegnava a `y = +0.17` — disallineamento completo
- **Fix**: ricalcolate tutte le costanti di posizione confrontando pixel del canvas (540×1100) con dimensioni reali del display (0.36×0.78m). Aggiornato anche il feedback hover (celle diventano leggermente visibili in hover, opacity 0 → 0.18, e il rendering del display mostra un highlight blu/verde)

### 6.5 Audit generale post-bug
Dopo i bug sopra, ho fatto `grep` per verificare che non ci fossero altri riferimenti orfani:
- `grep "drawDisplay|drawSub|subDisplay|subCtx|subTex|subMat|subMesh"` → 0 risultati
- `grep "^const state"` → 1 risultato
- `grep "^const hoveredBtn"` → 1 risultato

### 6.6 `addSkylineWindow`: `eZ` non definito (bug latente scopertosi ai piani 7-9)
- **Errore**: `(index):2120 Uncaught ReferenceError: eZ is not defined at addSkylineWindow`
- **Causa**: `addSkylineWindow(parent, x, y, z, rotY)` è definita top-level (riga 2059), fuori da `buildCorridor()`. Alla riga 2120 la funzione usava `eZ` (variabile locale di `buildCorridor`) invece del parametro `z`. Il bug era **pre-esistente** e dormiente: si manifestava solo andando ai piani 7-9 (penthouse) dove `addSkylineWindow` viene chiamata per la vetrata panoramica.
- **Fix**: sostituito `eZ - 0.5` con `z - 0.5` (riga 2120). `z` è il parametro già ricevuto correttamente dalla chiamata (riga 1666: `addSkylineWindow(corridor, 0, 1.3, eZ - 0.01, 0)`).
- **Verifica**: `grep "\beZ\b"` → 3 risultati, tutti dentro `buildCorridor` (scope corretto). `node --check` EXIT=0.
- **Lezione**: il pattern "funzioni helper top-level che usano variabili di chi le chiama" è fragile. Andrebbe evitato passando i valori come parametri espliciti (come già faceva correttamente la firma della funzione).

---

## 7. Statistiche finali del progetto

| Metrica | Valore |
|---|---|
| File principale | `elevator.html` |
| Dimensione | ~122 KB |
| Linee di codice | ~3.500 |
| Sezioni di codice | 25+ numerate e commentate |
| Tasti interattivi | 14 (10 celle piano + 4 tasti fisici) |
| Texture dinamiche | 9 canvas (display, meteo, pubblicità, cartello, targhe, loghi, frecce, orologio) |
| Temi corridoio | 4 (lobby, uffici, hotel, attico) |
| Condizioni meteo | 7 |
| Piani | 10 (T + 1..9) |
| Arredi 3D | ~30 tipi diversi (piante, divani, scrivanie, porte camere, vetrata, ecc.) |
| Audio effetti | ~7 tipi (beep, chime, allarme, porta, countdown, whoosh loop) |
| Comandi tastiera | 6 (M, V, N, E, WASD, ESC) |
| Preferenze persistenti | 3 (muted, tts, nightMode) via localStorage `bossHotelPrefs@v1` |
| Tempo di sviluppo | ~3 sessioni |

---

## 8. Architettura finale

### 8.1 Vincoli rispettati
- ✅ Singolo file HTML (no build step)
- ✅ No dipendenze npm (solo Three.js via CDN con importmap)
- ✅ WebGL only (niente canvas 2D overlay)
- ✅ Texture dinamiche via Canvas 2D (per display, meteo, pubblicità)
- ✅ Audio via Web Audio API + TTS via Web Speech API
- ✅ Deployabile come sito statico

### 8.2 Sezioni del codice (ordine)
1. HTML head (meta, favicon, CSS)
2. HTML body (HUD overlay + start screen)
3. Importmap (alias three)
4. CONFIGURAZIONE (costanti)
5. **STATO GLOBALE** (state + hoveredBtn — spostati in alto per evitare TDZ)
6. SCENA, RENDERER, CAMERA
7. ILLUMINAZIONE
8. TEXTURE PROCEDURALI
9. CABINA (geometria base)
10. **DETTAGLI PREMIUM CABINA** (Fase 1)
11. **PANNELLO PUBBLICITARIO** (Fase 2)
12. CORRIDOIO + ARREDI TEMATICI
13. **PULSANTIERA MODERNA DIGITALE** (Fase 3)
14. **RENDER DEL DISPLAY TOUCH** + logica meteo (Fasi 3+4+5)
15. FUNZIONI DI STATO
16. AUDIO
17. **ANNUNCI VOCALI TTS** (Fase 6)
18. MOVIMENTO CABINA
19. ANIMAZIONE PORTE + **countdown** (Fase 7)
20. ALLARME
21. ESCI/RIENTRA
22. RAYCASTING & CLICK PULSANTI
23. POINTER LOCK
24. MOVIMENTO FPS
25. **Illuminazione dinamica** (Fase 8) — integrata nel loop
26. LOOP
27. AVVIO

### 8.3 Modello dati `state`
```js
const state = {
  currentFloor: 0,        // piano attuale (0 = Terra)
  targetFloor: 0,         // piano destinazione durante movimento
  isMoving: false,
  doorsOpen: false,
  doorsActual: 0,         // 0-1 per animazione fluida porte
  doorsTarget: 0,
  alarmOn: false,
  requestedFloors: Set,   // coda piani
  muted: false,
  playerInCabin: true,    // true = prima persona nella cabina
  nightMode: false,       // Fase 8
  passengers: 1,          // 0-8 (Fase 8)
  vibration: 0,           // offset Y per vibrazione cabina (Fase 8)
  vibrationX: 0,          // shake X continuo durante viaggio (Fase 10 #1)
  vibrationZ: 0,          // shake Z continuo durante viaggio (Fase 10 #1)
  vibrationRoll: 0,       // rollio cabina (rad)
  vibrationPitch: 0,      // beccheggio cabina (rad)
  _movePhase: 0,          // fase oscillazioni shake
  _camLed: null,          // riferimento PointLight telecamera
  _camLedSphere: null,    // riferimento sfera LED telecamera
  _alarmId: null,         // interval ID sirena allarme
  _lastPassengerChange: 0 // timestamp ultima variazione passeggeri
};
```

---

## 9. Roadmap futura (post-implementation)

Possibili miglioramenti non implementati (backlog):

### 9.1 Funzionalità
- [ ] Più di 10 piani (parametrico)
- [ ] Multi-cabina (ascensori A/B connessi)
- [ ] Musica di sottofondo (jazz nella lobby, classica ai piani alti)
- [ ] Effetto "shake" durante il movimento per dare più "peso"
- [ ] Personalizzazione hotel (nome, indirizzo, tema)
- [ ] Modalità multiplayer (più utenti nella stessa cabina)
- [ ] Visualizzazione "dietro le quinte" del vano ascensore (shaft visibile quando porte aperte)
- [ ] Supporto VR (WebXR)
- [ ] Texture HD per gli arredi (rimangono procedurali per ora)

### 9.2 Miglioramenti tecnici
- [ ] Service Worker per offline-first
- [ ] PWA installabile
- [ ] Texture atlas per ridurre draw calls
- [ ] Lazy load di alcune schermate pubblicitarie
- [ ] Internazionalizzazione (italiano + inglese)
- [ ] Tema scuro / chiaro per il rendering del display

### 9.3 Contenuti
- [ ] Più condizioni meteo (grandine, tornado, foschia)
- [ ] Stagionalità del meteo (più neve in inverno)
- [ ] Eventi speciali dell'hotel (matrimoni, conferenze) che cambiano il corridoio
- [ ] Musica del ristorante udibile al piano 8

---

## 10. Note finali

### 10.1 Lezioni apprese

1. **Dichiarare lo stato in cima**: in un file single-page con molte sezioni, dichiarare `state` e `hoveredBtn` in alto evita errori TDZ ricorrenti. È buona prassi in JavaScript con `const`/`let` quando il codice è organizzato in molte sezioni.

2. **Allineamento rendering 3D ↔ texture 2D**: quando si usano plane invisibili per il raycast sopra una canvas texture, le posizioni devono essere calcolate con la stessa formula di conversione pixel→world del rendering. Un errore di pochi cm rende l'interfaccia non cliccabile senza errori visibili.

3. **Audit post-refactor**: dopo un grande refactor (es. pulsantiera meccanica → touch), fare `grep` per cercare riferimenti a funzioni rimosse (`drawDisplay`, `drawSub`, `subDisplay`, ecc.). Anche un singolo riferimento residuo rompe l'app.

4. **Piano approvato in anticipo**: il fatto di aver creato un piano dettagliato e averlo fatto approvare dall'utente prima di scrivere codice ha ridotto drasticamente i rework. Tutte le 9 fasi sono state implementate in linea con la stima di 10-12 ore.

### 10.2 Metriche di successo raggiunte
- ✅ FPS ≥ 50 su hardware medio
- ✅ Tutte le interazioni esistenti continuano a funzionare
- ✅ Display touch leggibile e intuitivo
- ✅ Meteo cambia in modo credibile
- ✅ Annunci vocali chiari (quando voce italiana disponibile)
- ✅ Tempo di apprendimento < 30 secondi
- ✅ File resta deployabile e veloce da caricare

### 10.3 Riferimenti
- `README.md` — panoramica del progetto, comandi, deploy
- `elevator.html` — file principale (single file)
- `dist/index.html` — copia per il deploy
- `LICENSE` — MIT License

---

**Stato finale: 100% completo, 0 bug noti, deployato e funzionante** ✅

---

## 11. Estensione backlog (post-2026-09-11)

Analisi condotta dopo il rilascio per identificare ulteriori miglioramenti attuabili nel rispetto dei vincoli di progetto (singolo file HTML, no npm, Three.js via CDN). Le idee sono raggruppate per categoria e marcate con priorità: 🔴 alta, 🟡 media, 🟢 bassa.

### 11.1 Funzionalità "core" mancanti

| # | Idea | Impatto | Sforzo | Prio | Note |
|---|---|---|---|---|---|
| 1 | ~~**Effetto shake/movimento cabina durante il viaggio**~~ — ✅ **Implementato in Polish Pack v1.1 (#1)** | Alto | Basso | 🔴 | 5 nuovi state fields, envelope a campana, decay `×0.85` |
| 2 | ~~**Musica di sottofondo contestuale** — jazz morbido in lobby, classica all'attico, allarme silenzia tutto~~ — ✅ **Implementato in Polish Pack v1.4 (#2)** | Alto | Medio | 🔴 | ✅ Backlog §9.1. WebAudio: 4 oscillator sine + low-pass + LFO. ~110 righe |
| 3 | ~~**Effetto sonoro di movimento cabina**~~ — ✅ **Implementato in Polish Pack v1.1 (#3)** | Alto | Medio | 🔴 | White noise + bandpass filter, envelope a campana |
| 4 | **Indicatore direzione "passo passo"** — sul cartello del corridoio mostrare i piani che la cabina sta attraversando (es. "▲ 2·3·4·5") durante la corsa | Medio | Basso | 🟡 | Implementabile in `tickMove` dove già calcoli `floorShown`. Texture canvas già pronta |

### 11.2 Funzionalità hotel "premium" (low effort, alto effetto)

| # | Idea | Impatto | Sforzo | Prio | Note |
|---|---|---|---|---|---|
| 5 | **Suono "ding" differenziato all'arrivo + apertura porte** — `playChime()` esiste ma è uguale per ogni direzione. Distinguere: 1 ding per fermata intermedia, 2 ding per arrivo finale | Medio | Basso | 🟡 | Estensione minima di Fase 6 |
| 6 | **Modalità "Fuori servizio" / "Manutenzione"** — tasto `O` (Out-of-order) oscura il display, mostra "FUORI SERVIZIO" sul cartello del corridoio, disabilita la selezione piani | Medio | Basso | 🟡 | Easter-egg credibile, utile anche per debug |
| 7 | **Numerazione camere hotel contestuale** — i piani 4–6 hanno già porte numerate ma il numero è decorativo. Mostrare sul display quando si è fermi (es. "Camere 401–432") | Basso | Basso | 🟢 | Si lega al tema "corridoio hotel" |
| 8 | **Orologio mondiale sul pannello pubblicitario** — affiancare all'orologio analogico di Roma una piccola griglia con orari di NY, Tokyo, Londra | Basso | Basso | 🟢 | Estensione naturale di Fase 2. Tema "hotel internazionale" |

### 11.3 UX / accessibilità

| # | Idea | Impatto | Sforzo | Prio | Note |
|---|---|---|---|---|---|
| 9 | ~~**Comando vocale (speech-to-text)** — "Piano cinque" chiama il piano 5 via `SpeechRecognition` API~~ — ✅ **Implementato in Polish Pack v1.4 (#9)** | Alto | Medio | 🟡 | ✅ Tasto `K`. Si sposa con l'esistente TTS (Fase 6). ~70 righe |
| 10 | **Scorciatoie tastiera 1–9 per piani** — quando si è in cabina o nel corridoio, premere i tasti `1`..`9`/`0` chiama direttamente quel piano | Medio | Basso | 🟡 | L'utente medio non sa che si può cliccare il display touch |
| 11 | **Sottotitoli per annunci vocali** — striscia HUD che replica il testo pronunciato, per chi non sente l'audio o ha TTS rotto | Medio | Basso | 🟡 | Si aggancia a `speak()` aggiungendo side-effect DOM |
| 12 | **Lingua selezionabile (IT/EN)** — display touch, cartelli corridoio, menu del ristorante e annunci TTS | Alto | Alto | 🟢 | Backlog §9.2. Richiede refactor di tutte le stringhe hardcoded in un dict `STRINGS[lang]` |

### 11.4 Robustezza e qualità

| # | Idea | Impatto | Sforzo | Prio | Note |
|---|---|---|---|---|---|
| 13 | **Verifica accessibilità tastiera nel corridoio** — controllare se `WASD` è correttamente disattivato quando si è nella cabina (potrebbe creare drift di posizione della camera) | Medio | Basso | 🟡 | Da testare in playtest |
| 14 | **Logica passeggeri coerente** — i "passeggeri" cambiano ma senza coerenza (possono scendere da 8 a 0 durante la notte). Aggiungere logica: "scendono quando le porte sono aperte al lobby/ufficio, salgono ai piani alti" | Basso | Medio | 🟢 | Estensione di Fase 8 |
| 15 | ~~**Persistenza preferenze in localStorage**~~ — ✅ **Implementato in Polish Pack v1.1 (#15)** | Medio | Basso | 🟡 | Chiave `bossHotelPrefs@v1`, hook in M/V/N toggle |

### 11.5 Tecnico / performance

| # | Idea | Impatto | Sforzo | Prio | Note |
|---|---|---|---|---|---|
| 16 | **Service Worker offline-first + PWA installabile** — l'app è già single-file e statica, perfetta per PWA. Richiede un file `sw.js` + `manifest.json` | Alto | Medio | 🟡 | Backlog §9.2. Aggiunge 2 file ma abilita installazione mobile |
| 17 | ~~**Verifica `dispose()` dei corridoi ricostruiti**~~ — ✅ **Implementato in Polish Pack v1.1 (#17)** | Alto | Basso | 🔴 | Trovato e corretto bug reale: `if` con corpo vuoto leakava tutte le texture non-cartello |
| 18 | **Texture atlas / caching canvas offscreen per il display touch** — oggi ridisegni l'intero canvas a ogni frame sporco. Cachare le sezioni statiche (cornice, header) in canvas offscreen e redraw solo le sezioni dinamiche | Medio | Medio | 🟢 | Backlog §9.2 |

### 11.6 Idee nuove (non presenti nel backlog originale)

| # | Idea | Impatto | Sforzo | Prio | Note |
|---|---|---|---|---|---|
| 19 | ~~**Modalità manutentore** — tasto segreto `Shift+M` mostra wireframe della cabina, statistiche FPS, draw calls, e permette di teletrasportarsi a un piano con `1`–`9`~~ — ✅ **Implementato in Polish Pack v1.4 (#19)** | Basso | Medio | 🟢 | ✅ Overlay `#maint-overlay` con FPS, draw calls, log eventi. ~80 righe |
| 20 | ~~**Sistema di "prenotazione cabina" dal corridoio** — cammini verso le porte e queste si aprono automaticamente quando sei a <1m + il display mostra "PRENOTATA · TIENI PREMUTO E"~~ — ✅ **Implementato in Polish Pack v1.4 (#20)** | Alto | Medio | 🟡 | ✅ Hook in `tickPlayer(dt)`. Proximity check 1m + `|x|<0.9`. Display overlay "PRENOTATA". ~30 righe |
| 21 | ~~**Specchio riflettente credibile**~~ — ✅ **Implementato in Polish Pack v1.1 (#21)** | Molto alto | Medio | 🔴 | Reflector addon, render target 512×512 |
| 22 | **Schermata "Welcome" interattiva** — la start screen attuale è solo un bottone. Aggiungere carosello di feature ("Cabina 5★ · Touch screen · Meteo live · Annunci vocali · 4 temi corridoio") con screenshot animati | Basso | Basso | 🟢 | Onboarding migliore per nuovi utenti |

### 11.7 Priorità di implementazione (storico + prospettiva)

L'ordine ottimale storico per rapporto impatto/sforzo, riflettendo l'effettiva sequenza dei
Polish Pack:

1. ✅ **#21 Specchio riflettente** — Polish Pack v1.1
2. ✅ **#3 Whoosh loop** — Polish Pack v1.1
3. ✅ **#1 Shake cabina** — Polish Pack v1.1
4. ✅ **#17 Verifica dispose corridoi** — Polish Pack v1.1 (era un bug latente)
5. ✅ **#15 Persistenza localStorage** — Polish Pack v1.1
6. ✅ **#10 Scorciatoie tastiera 1–9** — Polish Pack v1.2
7. ✅ **#5 Ding differenziato** — Polish Pack v1.2
8. ✅ **#11 Sottotitoli TTS** — Polish Pack v1.2
9. ✅ **#4 Indicatore passo passo** — Polish Pack v1.3
10. ✅ **#6 Fuori servizio** — Polish Pack v1.3
11. ✅ **#7 Numerazione camere** — Polish Pack v1.3
12. ✅ **#8 Orologio mondiale** — Polish Pack v1.3
13. ✅ **#22 Welcome carosello** — Polish Pack v1.3
14. ✅ **#2 Musica di sottofondo** — Polish Pack v1.4
15. ✅ **#9 Comando vocale** — Polish Pack v1.4
16. ✅ **#19 Modalità manutentore** — Polish Pack v1.4
17. ✅ **#20 Prenotazione cabina** — Polish Pack v1.4
18. 🔄 **#13 Accessibilità tastiera corridoio** — Polish Pack v1.5 (in corso)
19. 🔄 **#14 Logica passeggeri coerente** — Polish Pack v1.5 (in corso)
20. 🔄 **#18 Caching canvas offscreen** — Polish Pack v1.5 (in corso)

Dopo v1.5, le feature residue nel backlog sono solo 2: #12 (i18n IT/EN, alto sforzo) e
#16 (Service Worker + PWA, richiede decisione D2 sull'architettura multi-file).

### 11.8 Decisioni richieste (per procedere)

| # | Decisione | Default proposto | Stato |
|---|---|---|---|
| D1 | Quale sottoinsieme implementare? | Suggeriti #1, #3, #15, #17, #21 per un "Polish Pack v1.1" | ✅ Risolto — approvato 2026-08-24 (Polish Pack v1.1) |
| D2 | Mantenere singolo file o aggiungere `sw.js` + `manifest.json` per PWA? | Singolo file (conservativo) | 🟡 Pendente — blocca #16 |
| D3 | Aprire una nuova fase documentale (Fase 10) o procedere come "bug-fix/miglioramenti minori"? | Nuova fase documentale | ✅ Risolto — approvato (Fase 10–13, approccio Polish Pack) |
| D4 | Aggiornare `dist/index.html` ad ogni modifica o solo a release consolidate? | Solo a release | ✅ Risolto — sync a fine feature (commit dedicato) |
| D5 | Scope Polish Pack v1.4 | Tutti e 4 i candidati (#2, #9, #19, #20) | ✅ Risolto — approvato 2026-09-12 |
| D6 | Scope Polish Pack v1.5 | I 3 candidati a basso/medio sforzo (#13, #14, #18) — esclusi #12 e #16 | ✅ Risolto — approvato 2026-09-12 |

### 11.9 Note di compatibilità

- Tutte le idee sono compatibili con i vincoli §8.1 (singolo file HTML, Three.js CDN, WebGL only)
- L'unica eccezione è **#16 (PWA)** che richiede 2 file esterni e quindi esce dal pattern single-file
- **#12 (i18n)** è l'unica che richiede un refactor strutturale significativo di tutte le stringhe del codice

---

**Stato: Polish Pack v1.5 in corso (0/3 — #13 #14 #18)** 🟡
Polish Pack v1.4 completato (4/4 — #2 #9 #19 #20) + hotfix display touchscreen passo-passo (commit `e02adca`)** ✅🟢

**Polish Pack v1.4 → 17/22 funzionalità implementate (77.3%)**. Polish Pack v1.5 → target
**20/22 (90.9%)**. Backlog residuo post-v1.5: 2/22 (#12 i18n, #16 PWA). Hotfix display
passo-passo non è una nuova voce di backlog ma un enhancement di coerenza UX (allinea
display touchscreen a cartello corridoio e strip DOM, già passo-passo).
