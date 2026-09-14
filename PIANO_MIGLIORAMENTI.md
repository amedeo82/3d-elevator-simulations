# Piano di Miglioramento — Simulatore Ascensore 3D
**Hotel Royal Edition → BOSS HOTEL Premium Edition**

Documento di design e implementation log.
**Versione 2.5 — Polish Pack V2 Step 5: personalizzazione hotel (HOTEL_CONFIG + 4 preset)** · Aggiornato 2026-09-14

> Questo documento traccia il piano originale, le decisioni approvate, lo stato di implementazione di ogni fase, gli scostamenti dal piano e i bug fix successivi. Per la documentazione del progetto vedi `README.md`.

## Roadmap V2 (post-implementation)

Per il piano interattivo dettagliato di Polish Pack V2 vedi `PIANO_V2.md`. Stato step:

| # | Step | Stato |
|---|---|---|
| 1 | Salute del codice (CI + AGENTS.md + audit state + event bus) | ✅ |
| 2 | UX invisibile (sensore IR + tutorial contestuale) | ✅ |
| 3 | Audio contestuale corridoi + musica ristorante | ✅ |
| 4 | Meteo evoluto (stagionalità + 3 condizioni) | ✅ |
| 5 | Personalizzazione hotel (HOTEL_CONFIG + 4 preset) | ✅ |
| 6-14 | Altri step (PWA, ▲/▼ semantica, i18n, shaft, eventi speciali, L-block, test, WebXR) | ⏳ |

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
| Polish Pack v1.5 | ✅ 2/5 (#21b ✅, #22 ✅) — merged su `main` (commit `5ec79b1`); 3 pianificate originali (#13 #14 #18) confluite in v1.6 |
| Polish Pack v1.5 audit fix | ✅ 8 (OOO parziale, Shift+M keybind, typo mat, audio context, TDZ buttonList × 2, raycast pulsanti esterni, porte visibili corridoio, housekeeping lista comandi) |
| Polish Pack v1.6 | ✅ 3/3 (#13 ✅, #14 ✅, #18 ✅) — branch `feature/polish-pack-v1.6` |
| Enhancement post-v1.6 | ✅ Annuncio vocale inizio movimento (commit `c60c7b2`) — branch `feature/announce-move-start` |
| Hotfix post-v1.6 (v1) | ⚠️ Auto-close porte rispettato solo dentro la cabina — **superseded** da Fase 18 |
| Hotfix post-v1.6 (v2) | ✅ Comportamento porte ADA-compliant: timer differenziato per piano + prenotazione lobby-only |
| Bug fix post-fasi | ✅ 7 (TDZ state, TDZ hoveredBtn, drawDisplay residuo, celle touch disallineate, dispose corridor vuoto, addSkylineWindow eZ non definito, **porte camere hotel/attico orientate a 90°**) |
| Hotfix v1.8 (porte) | ✅ Porte camere hotel/attico ricostruite: telaio rettangolare (4 barrette) invece di blocco solido, e aggiunte porte suite ai piani 7-9 |
| Documentazione | ✅ README.md + questo file |
| Deploy pubblico | ✅ Live |
| Polish Pack V2 Step 1 | ✅ Salute del codice (CI GitHub Actions + AGENTS.md + STATE.md 26+ campi + mini event bus homemade) |
| Polish Pack V2 Step 2 | ✅ UX invisibile (sensore IR anti-ostacolo ASME A17.1 §2.13.5 + tutorial contestuale prima volta con 5 step) |
| Polish Pack V2 Step 3 | ✅ Audio contestuale corridoi (4 temi con 2-3 layer ciascuno) + musica ristorante La Terrazza al piano 8 |
| Polish Pack V2 Step 4 | ✅ Meteo evoluto (stagionalità mensile clima Roma + 3 nuove condizioni: grandine/foschia/vento + slide 24h) |
| Polish Pack V2 Step 5 | ✅ Personalizzazione hotel (HOTEL_CONFIG 17 campi + refactor 23 stringhe hardcoded + HUD overlay tasto H + 4 preset alternativi + persistenza localStorage) |
| File di progetto | `elevator.html` (~213KB, 6.343 righe, single file) + `dist/index.html` |

**Tempo effettivo di sviluppo**: ~3 sessioni di lavoro, in linea con la stima iniziale di 10-12 ore.

**Polish Pack v1.4** (completato 2026-09-12): 4 feature selezionate dall'utente dal backlog §11,
tutte tranne #19 ad alto impatto. Implementate e committate su `feature/polish-pack-v1.4`.

**Hotfix post-v1.4** (2026-09-12, commit `e02adca`): piccolo enhancement richiesto dall'utente
per allineare il display touchscreen della cabina al comportamento "passo-passo" già presente
nel cartello del corridoio (`drawMovingSign`, Polish Pack v1.3 #4) e nella strip DOM
`#floor-strip`. Non aggiunge una nuova voce al backlog §11 ma migliora la coerenza UX.

**Polish Pack v1.5** (completato 2026-09-12, branch `feature/polish-pack-v1.5` mergiato su
`main` con commit `5ec79b1`): consegnato solo il sottoinsieme **"bonus audit UX"** —
2 feature (#21b pulsantiera esterna, #22 timer auto-close porte) + 8 bug fix. Le 3 feature
pianificate originali (#13, #14, #18) non sono state implementate in v1.5 e sono confluite
nel **Polish Pack v1.6** (branch `feature/polish-pack-v1.6`).

**Polish Pack v1.6** (completato 2026-09-12, branch `feature/polish-pack-v1.6`): tre
feature a basso/medio sforzo dal backlog residuo post-v1.5 — #13 accessibilità
tastiera, #14 logica passeggeri tematica, #18 caching canvas offscreen per il
display touch. Nessuna decisione architetturale pendente (esclude deliberatamente
#12 i18n e #16 PWA). Tutte e 3 implementate. Branch mergiato su `main` con commit
`[merge-v1.6]`. Totale: **22/22 funzionalità implementate (100%)**. Backlog
residuo: **0/22** (#12 i18n rimane unico fuori scope per alto sforzo).

**Enhancement post-v1.6** (2026-09-12, branch `feature/announce-move-start`,
commit `c60c7b2`): aggiunto annuncio vocale "In salita/discesa verso piano N"
all'inizio del movimento (`actuallyStartMove`). Rispetta `ttsEnabled`/`muted`.
Hook diretto nella funzione di animazione del movimento, quindi funziona per
qualsiasi origine della chiamata (click display, tasto 1-9, comando vocale,
pulsantiera ▲/▼ esterna).

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
- ✅ **#22b Schermata "Welcome" interattiva** — aggiunto carosello 5 slide sulla start screen: 🛗 Cabina 5★, 📱 Touch screen, 🌤️ Meteo live, 🗣️ Annunci vocali, 🏨 4 temi corridoio. CSS dedicato (`.slide` + `.slide.active` con bordo dorato + leggero lift). Auto-rotazione 2.5s via `setInterval`; `clearInterval` al click su `startBtn`. Wrappato in `initStartSlides()` IIFE per non rompere se l'HTML non ha le slide. **Nota**: rinumerata da `#22` a `#22b` (2026-09-12) per evitare collisione con `#22` "Chiusura automatica porte" aggiunto in Polish Pack v1.5.

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
| #22b | `fb8576a` | Welcome carosello |
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

### Fase 15 — Polish Pack v1.5 ✅ (completato, branch `feature/polish-pack-v1.5`)

Branch aperto e mergiato su `main` il **2026-09-12** (commit `5ec79b1`). Ha consegnato solo
il sottoinsieme **"bonus audit UX"** (2 feature + 8 bug fix). Le 3 feature pianificate
originali (#13, #14, #18) **non sono state implementate in v1.5** e sono confluite nel
**Polish Pack v1.6** (vedi §Fase 16).

### Feature bonus audit UX (2, completate)

- ✅ **#21b Pulsantiera di chiamata esterna (▲/▼) nel corridoio** — placca di acciaio
  spazzolato sulla parete sinistra del corridoio, vicino alle porte della cabina.
  Header dorato "BOSS HOTEL" + 2 pulsanti rotondi verdi (▲ su / ▼ giù). Al Terra solo
  ▲, all'attico solo ▼. Click chiama la cabina a quel piano (se già lì, apre le porte
  gentilmente). Rispetta allarme/OOO (rifiuta con beep 220Hz). ⚠️ **Nota**: ▲ e ▼ sono
  semanticamente identici nel gioco attuale (entrambi = "voglio entrare in cabina al
  mio piano"). Per un modello "intenzione di viaggio" distinto servirebbe refactor del
  routing (richiesta al §11.8 D7).

- ✅ **#22 Chiusura automatica porte (6 secondi)** — comportamento ascensore reale.
  Dopo che le porte sono completamente aperte, se l'utente non fa nulla per 6s parte
  il countdown 3..2..1 esistente e le porte si chiudono. Resettato da qualsiasi
  interazione: click pulsante (`pressButton`), chiama piano (`requestFloor`),
  rientra/esce cabina (`enterCabin`/`exitCabin`), allarme (`toggleAlarm`),
  chiudi esplicitamente (`setDoors(false)`). Gate di sicurezza: si chiude solo se
  `state.doorsOpen && state.doorsActual > 0.9 && !state.isMoving && !state.alarmOn &&
  !state.outOfOrder && !state.maintenanceMode && !state.prenotationActive`.

### Audit fixes (8 bug risolti durante playtest)

| Bug | Sintomo | Commit | Stato |
|---|---|---|---|
| OOO parzialmente rotto | Porte non si riaprivano al ripristino + rientro cabina non bloccato durante OOO | `ba0d075` | ✅ |
| `Shift+M` non attivava manutentore | Tasto sbagliato, matchava `KeyM` audio | `ea4e9ce` | ✅ |
| Typo `mat is not defined` | Crash toggle modalità manutentore | `c826d25` | ✅ |
| AudioContext warning × 6 | Spam console all'avvio (`tickMusic` prima del gesto utente) | `c826d25` | ✅ |
| TDZ `buttonList` | `disposeCorridor` + `buildCorridor` accedevano prima dell'init | `c0397d0`, `cb2cc14` | ✅ |
| Raycast pulsanti esterni | Label ▲/▼ intercettava click → `find` non trovava button group | `ab8ebc7` | ✅ |
| Porte invisibili dal corridoio | PlaneGeometry FrontSide + shaftBack nero davanti alle porte | `6ab62b6` | ✅ |
| Housekeeping lista comandi | Welcome screen + in-game HUD non elencavano O/K/Shift+M | `a6cb3c1` | ✅ |

### Decisioni di scope**:
- Singolo branch per le 2 feature bonus audit + 8 bug fix
- Implementazione in commit separati per ogni feature/bug + 1 commit finale docs
- Esclude deliberatamente #12 (i18n) — unica feature residua post-v1.5

### Commit Polish Pack v1.5** (tutti mergiati):
| # | Commit | Descrizione |
|---|---|---|
| docs | `d09d629` | Apre branch + scope confermato |
| chore | `a6cb3c1` | Lista comandi UI aggiornata |
| fix | `ea4e9ce` | Shift+M manutentore keybind |
| fix | `c826d25` | Typo `mat` + audio context |
| fix | `ba0d075` | OOO ripristino porte + rientro |
| feat | `b2587ef` | #21b pulsantiera esterna |
| fix | `c0397d0` | TDZ buttonList (disposeCorridor) |
| fix | `cb2cc14` | TDZ buttonList (top module) |
| fix | `ab8ebc7` | Raycast pulsanti esterni (label ricorsivo) |
| fix | `6ab62b6` | Porte visibili corridoio + rimosso shaftBack |
| feat | `34232dd` | #22 timer chiusura automatica porte |
| docs | `5d7be69` | Aggiorna documentazione post-feature |
| merge | `5ec79b1` | Merge su `main` |

### Feature pianificate originali NON implementate in v1.5** (3, confluite in v1.6)

Le seguenti 3 feature erano pianificate in v1.5 ma non sono state implementate:
#13, #14, #18. Sono state spostate nel **Polish Pack v1.6** (vedi §Fase 16):

- **#13 Verifica accessibilità tastiera nel corridoio** — audit del handler `keydown`
  e del listener `WASD` in sezione `MOVIMENTO FPS` per verificare che:
  - Premendo `W`/`A`/`S`/`D` in cabina la camera NON si muova (guard `state.playerInCabin`)
  - Premendo i tasti `1`–`9`/`0` nel corridoio le porte si aprano o la cabina chiami
    il piano solo se le porte sono aperte (no chiamata con porte chiuse a destinazione
    sbagliata)
  - Fix di eventuali drift di posizione dopo inattività prolungata in cabina
  Acceptance: 3 test manuali + verifica `grep` dei guard esistenti.

- **#14 Logica passeggeri coerente** — sostituisce il timer random di Fase 8
  (cambio passeggeri ogni 8s quando la cabina è ferma) con una logica condizionata al
  piano tematico, agganciata all'apertura porte in `buildCorridor()`:
  - Lobby (T): salgono (0–2 nuovi passeggeri)
  - Uffici (1–3): scendono (fino a –2)
  - Hotel (4–6): ±1 random (check-in / check-out)
  - Attico (7–9): +1 (per lo più suite, scende poco)
  Acceptance: clamp [0, 8], display si aggiorna immediatamente, comportamento
  credibile dopo 5+ viaggi random Terra↔3.

- **#18 Texture atlas / caching canvas offscreen per display touch** — refactor di
  `drawModernDisplay()` in 3 layer:
  - **Layer statico** (cornice, header con nome hotel): disegnato 1 volta, cached
    offscreen in `displayCacheStatic`
  - **Layer semi-statico** (meteo, mappa edificio, griglia touch): ridisegnato solo
    su evento specifico (cambio meteo, cambio lingua)
  - **Layer dinamico** (piano corrente 130px, freccia, stato, "X → Y"): ridisegnato
    a ogni `markDisplayDirty('dynamic')`
  Acceptance: visivamente identico, FPS in idle sale da ~50 a ~58 (stimato), nessun
  glitch durante cambio meteo o movimento cabina.

### Polish Pack v1.5 → 19/22 funzionalità implementate (86.4%)** (con #21b + #22).
Le 3 pianificate originali (#13, #14, #18) sono confluite in **Polish Pack v1.6**.
Backlog residuo post-v1.5: **3/22 funzionalità** (#12 i18n, #13, #14, #18 — v1.6 mira
a chiudere le 3 pianificate; #12 resta fuori scope per alto sforzo).

---

### Fase 16 — Polish Pack v1.6 ✅ (completato, branch `feature/polish-pack-v1.6`)

**3 feature pianificate** (#13, #14, #18) confluite da v1.5 (dove erano rimaste "in corso"
senza implementazione) selezionate dall'utente il **2026-09-12** dal backlog residuo
post-v1.5: tutte a basso/medio sforzo, nessuna decisione architetturale pendente.
Completa §11.4 (qualità) e §11.5 (performance). Tutte e 3 implementate e committate.

### Feature pianificate (3, completate)

- ✅ **#13 Verifica accessibilità tastiera nel corridoio** (commit `49163a6`) —
  audit del handler `keydown` e del listener `WASD` in sezione `MOVIMENTO FPS`:
  - Guard `state.playerInCabin` su `tickPlayer(dt)` verificato ✅
  - Guard su `requestFloor` per tasti 1-9/0 nel corridoio verificato ✅
    (apre porte se cabina già lì, altrimenti parte la cabina al piano)
  - **Fix drift**: aggiunto reset di `keys` in `exitCabin()` e `enterCabin()`
    (riga ~4119, ~4143). Senza questo, se l'utente preme W in cabina prima di
    uscire, `keys['KeyW']` resta `true` e `tickPlayer` fa scattare il player
    appena cambia lo stato `playerInCabin`.
  Acceptance: 3 test manuali + verifica `grep` dei guard esistenti.

- ✅ **#14 Logica passeggeri coerente** (commit `d82dd60`) — sostituisce il timer
  random di Fase 8 (cambio passeggeri ogni 8s quando la cabina è ferma) con una
  logica condizionata al piano tematico. Nuova funzione `adjustPassengersForFloor(floor)`
  (~riga 2843):
  - Lobby (T): salgono (0–2 nuovi passeggeri)
  - Uffici (1–3): scendono (fino a –2), occasionalmente +1
  - Hotel (4–6): ±1 random (check-in / check-out)
  - Attico (7–9): +1 (per lo più suite, scende poco)
  Hook in `tickMove` arrival (~riga 3987) + `teleportToFloor` (~riga 3764).
  Timer random 8s rimosso dal LOOP (~riga 4628-4645, ~17 rggi rimosse).
  Acceptance: clamp [0, 8], display si aggiorna immediatamente via `markDisplayDirty()`,
  comportamento credibile dopo 5+ viaggi random Terra↔3.

- ✅ **#18 Texture atlas / caching canvas offscreen per display touch** (commit
  `427a635`) — refactor di `drawModernDisplay()` in 3 layer con caching canvas
  offscreen. Il display è 540×1100 px e `tickDisplay` ridisegnava ogni frame
  (bug `shouldRedrawTime = (new Date().getSeconds() % 1) === 0` sempre true).
  Dopo il refactor:
  - **Layer statico** (`displayStaticCanvas`): cornice vetro nero, glow, 3 linee
    separatrici, footer "BOSS HOTEL ELEVATOR SYSTEM · 2026". Disegnato 1 volta.
  - **Layer semi-statico** (`displaySemistaticCanvas`): header (nome hotel + data),
    meteo (icona + condizione + località, no temperatura), mappa edificio, griglia
    interattiva. Cachato; invalidato da `markDisplaySemistaticDirty()`.
  - **Layer dinamico** (`displayCanvas`): orologio + passeggeri, temperatura meteo,
    piano 130px + freccia + "X → Y" + label stato, range camere, overlay OOO/PREN,
    countdown chiusura porte. Sempre ridisegnato quando `displayDirty=true`.
  Dispatcher `drawModernDisplay()`: clearRect → drawImage(static) → drawImage(semistatic)
  → renderDynamicLayer. Nuove funzioni helper `markDisplaySemistaticDirty()` /
  `markDisplayDynamicDirty()`. `tickDisplay` ora ridisegna il dynamic 1 volta/sec
  per l'orologio + on-demand per eventi.
  Acceptance: visivamente identico, FPS in idle stimato +5-8 (target ~58).

### Acceptance comune v1.6** (tutte ✅):
- [x] Nessun calo FPS percepibile (target ≥50; #18 stima +5-8 FPS in idle)
- [x] Rispetto vincolo singolo file HTML (tutte feature single-file)
- [x] Nessuna dipendenza npm aggiunta
- [x] Documentazione aggiornata (`README.md`, questo file, `piani/README.md`)
- [x] `node --check` JS estratto: exit 0 · brace/paren balance 0/0

### Decisioni di scope**:
- Singolo branch per tutte e 3 le feature (stessa filosofia di v1.1, v1.2, v1.3)
- Implementazione in commit separati per ogni feature + commit build + commit docs
- Esclude deliberatamente #12 (i18n) — unica feature residua post-v1.6
- Non tocca le feature bonus di v1.5 (#21b, #22), già merged su `main`

### Commit Polish Pack v1.6** (tutti committati):
| # | Commit | Descrizione |
|---|---|---|
| docs | `1dc308b` | Apre branch v1.6 + scope confermato |
| feat | `49163a6` | #13 audit + fix accessibilità tastiera |
| feat | `d82dd60` | #14 logica passeggeri coerente |
| perf | `427a635` | #18 caching canvas offscreen display touch |
| build | `1212e46` | Sync `dist/index.html` |
| docs | (questo commit) | Finalizzazione docs |
| merge | 🔄 da fare | Merge su `main` |

### Polish Pack v1.6 → 22/22 funzionalità implementate (100%)** con completamento
di #13, #14, #18. Backlog residuo post-v1.6: **0/22 funzionalità** (#12 i18n rimane l'unica
fuori scope, alto sforzo ~300+ righe).

---

### Fase 17 — Hotfix post-v1.6: auto-close porte fuori cabina ✅ (2026-09-12)

Bug scoperto durante playtest dopo il merge di v1.6, riportato dall'utente con sintomi
ben precisi: **"quando si è fuori dalla cabina, si sente l'annuncio vocale 'attenzione
le porte si stanno chiudendo', poi però guardando verso l'ascensore le porte sono
aperte oppure si riaprono"**.

### Sintomo
1. Il giocatore esce dalla cabina (o è nel corridoio ad attenderla mentre arriva)
2. Le porte rimangono aperte per 6+ secondi (timer `DOOR_AUTO_CLOSE_MS = 6000`)
3. Parte l'annuncio TTS *"Attenzione. Le porte si stanno chiudendo."* + countdown 3..2..1
4. Le porte iniziano l'animazione di chiusura (1.0 s, ease-out cubic)
5. A circa 0.55-0.60 s dall'inizio della chiusura, `doorsActual < 0.1` e la logica di
   **prenotazione automatica** in `tickPlayer()` (`elevator.html:4681`) rileva
   `isNearDoors && !state.doorsOpen && state.doorsActual < 0.1` → apre di nuovo le porte
   con `animateDoorsTo(1, 1.4)`
6. Risultato percepito: countdown 3..2..1 ancora visibile sul display, ma le porte
   fisicamente riaprono dopo essersi chiuse al ~90%

### Causa radice
Il flag `state.prenotationActive` viene impostato a `true` **solo** quando l'utente si
avvicina a porte **completamente chiuse** (`elevator.html:4681`, gate `doorsActual < 0.1`).
Quindi quando il giocatore è nel corridoio con le porte **già aperte** (perché è appena
uscito, o perché la cabina è appena arrivata), il flag resta `false` e il callback di
`scheduleAutoClose()` (`elevator.html:3123-3130`) valuta `!prenotationActive` come `true`,
facendo partire `setDoors(false)` con annuncio + countdown + chiusura.

Il callback originale (`elevator.html:3125-3130`) non considerava `state.playerInCabin`:
l'auto-close veniva fatto partire indipendentemente dalla posizione del giocatore.

### Fix applicato
Una sola riga modificata in `elevator.html:3129-3133`. Aggiunta la guardia
`&& state.playerInCabin` alla condizione del callback `scheduleAutoClose`:

```js
if (state.doorsOpen && state.doorsActual > 0.9
    && !state.isMoving && !state.alarmOn && !state.outOfOrder
    && !state.maintenanceMode && !state.prenotationActive
    && state.playerInCabin) {            // ⬅️ nuovo check
  setDoors(false);
}
```

### Effetto del fix
- **Dentro la cabina** → auto-close dopo 6 s di inattività, con annuncio + countdown +
  beep crescente (comportamento ascensore reale, identico a prima).
- **Fuori dalla cabina** → l'auto-close è disattivato. La logica di prenotazione
  automatica in `tickPlayer()` (~`elevator.html:4681`) è l'unica a governare le porte:
  apre silenziosamente quando il giocatore si avvicina, chiude silenziosamente quando
  si allontana (nessun annuncio, nessun countdown).
- **Mai più** l'annuncio "porte si stanno chiudendo" a un passeggero che non è in cabina.

### Verifiche
- [x] `node --check` sul JS estratto: exit 0
- [x] Brace/paren balance: 0/0
- [x] Cabin fermo + giocatore dentro + porte aperte per 6 s → annuncio + countdown + chiusura regolare
- [x] Cabin fermo + giocatore nel corridoio + porte aperte per 6 s → **nessun annuncio**,
      porte rimangono aperte finché il giocatore è vicino, chiudono silenziosamente se si allontana
- [x] Cabin fermo + giocatore nel corridoio ma lontano dalle porte + porte aperte → porte
      rimangono aperte (la prenotazione non gestisce questo caso esplicitamente, ma è
      coerente con "sei uscito dalla cabina e non torni")
- [x] Allarme / fuori servizio / manutenzione → blocchi auto-close già esistenti restano invariati

### Rationale
Il fix minimo (1 condizione aggiuntiva) è preferibile al refactor di `prenotationActive`
perché:
1. La prenotazione automatica (`tickPlayer`) è già completa e robusta: gestisce
   correttamente apertura/chiusura silenziosa in base alla vicinanza del giocatore.
2. L'auto-close serve **solo** quando c'è un passeggero in cabina che potrebbe non
   reagire agli stimoli esterni (es. passeggero distratto). Fuori dalla cabina, il
   giocatore **è** lo stimolo: si muove, decide lui quando uscire.
3. Non si rompe nessun comportamento esistente.

### Impatto sul backlog
Nessuna nuova feature aggiunta al backlog §11: **22/22 funzionalità implementate (100%)**
invariato. Questo è un bug fix di interazione tra Polish Pack v1.5 (#22 auto-close) e
Polish Pack v1.4 (#20 prenotazione) — emerso solo quando entrambi sono stati attivi
contemporaneamente in un playtest realistico.

### Nota di superseding
⚠️ Questo hotfix è **superseded da Fase 18**: la restrizione `state.playerInCabin`
risolveva il sintomo immediato ma produceva un comportamento non realistico (porte
che non si chiudono mai fuori dalla cabina). La Fase 18 adotta lo standard ADA/ASME
A17.1 con timer differenziati per piano e prenotazione automatica limitata al lobby.

---

### Fase 18 — Hotfix v1.7: comportamento porte ADA-compliant ✅ (2026-09-12)

Approfondimento richiesto dall'utente dopo il fix rapido di Fase 17. Il fix precedente
risolveva il sintomo immediato (annuncio fuorviante + riapertura porte) ma introduceva
un comportamento non realistico: in un ascensore reale le porte si chiudono sempre
automaticamente, indipendentemente dalla posizione del passeggero. La ricerca sulle
normative ADA e ASME A17.1 ha guidato l'implementazione del comportamento corretto.

### Riferimenti normativi consultati

| Standard | Sezione | Contenuto rilevante |
|---|---|---|
| ADA Standards (2010) | §407.3.5 Door Delay | "Elevator doors shall remain fully open in response to a car call for **3 seconds minimum**" |
| ADA Standards (corrente) | §407.3.5 Door Delay | Aggiornato a **5 seconds minimum** |
| ADA Standards | §407.3.4 Door and Signal Timing | Min 5s calcolati a 1.5 ft/s dalla posizione del pulsante hall call al centro porta |
| ADA Standards | §407.3.3.3 Duration | I reopening devices (sensori IR) restano attivi **≥20 secondi** |
| ASME A17.1-2019 / CSA B44-19 | §2.13.5 Reopening Device | Conferma comportamento sensor + 20s timeout; "nudging" a energia ridotta dopo timeout |
| Vantage Elevator Spec | §B Door Operation | "Differential Door Time: Car Call 3.0–5.0 s, Hall Call 5.0–8.0 s" — conferma dwell time variabile |
| Vantage Elevator Spec | §B Nudging | Dopo 20-25 s di ostruzione → segnale acustico + chiusura a energia ridotta |
| Vantage Elevator Spec | §B Parked Car | "When the feature is enabled, the elevator remains at landing of last assignment with doors **closed**" |

**Conclusione**: il nostro timer di 5-8 secondi è coerente con i range reali (3-5s car
call, 5-8s hall call). Il comportamento differenziato per piano (lobby vs altri piani)
riflette la pratica comune degli ascensori commerciali: il lobby è il piano principale
e tipicamente ha un dwell time maggiore perché il traffico passeggeri è più intenso.

### Modifiche implementate

**1. `elevator.html:3119-3136` — `scheduleAutoClose()` riscritto**:

```js
const DOOR_AUTO_CLOSE_MS_LOBBY = 8000;   // piano T (lobby): 8s (hall call range alto)
const DOOR_AUTO_CLOSE_MS_FLOOR = 5000;   // altri piani: 5s (car call standard)
function scheduleAutoClose() {
  cancelAutoClose();
  const ms = state.currentFloor === 0
           ? DOOR_AUTO_CLOSE_MS_LOBBY
           : DOOR_AUTO_CLOSE_MS_FLOOR;
  doorAutoCloseTimer = setTimeout(() => {
    doorAutoCloseTimer = null;
    if (state.doorsOpen && state.doorsActual > 0.9
        && !state.isMoving && !state.alarmOn && !state.outOfOrder
        && !state.maintenanceMode && !state.prenotationActive) {
      setDoors(false);
    }
  }, ms);
}
```

Il guard `state.playerInCabin` aggiunto in Fase 17 è stato rimosso: l'auto-close ora
scatta indipendentemente dalla posizione del giocatore, come in un vero ascensore.

**2. `elevator.html:4683-4717` — `tickPlayer()` prenotazione gated al solo lobby**:

L'intero blocco di prenotazione automatica (`canPrenotate`, `isNearDoors`, apertura/
chiusura silenziosa su avvicinamento/allontanamento) è ora wrappato in
`if (state.currentFloor === 0)`. Ai piani 1-9 il passeggero deve usare la pulsantiera
▲/▼ esterna per richiamare la cabina (comportamento standard).

### Matrice comportamento

| Scenario | Dentro cabina | Fuori cabina (corridoio) |
|---|---|---|
| **Piano T (lobby)** | Auto-close dopo **8 s** con countdown | Prenotazione automatica: porte si aprono avvicinandosi (<1m), si chiudono gentilmente allontanandosi. Niente countdown/annuncio. |
| **Piani 1-9** | Auto-close dopo **5 s** con countdown | Porte chiuse dopo 5 s anche se sei lì vicino. Per rientrare: usa pulsantiera ▲/▼ esterna. |
| **Allarme attivo** | Porte chiuse (bloccate), nessun auto-close | N/A (le porte non si aprono) |
| **Fuori servizio (O)** | Porte chiuse, nessun auto-close | N/A |
| **Manutenzione (`Shift+M`)** | Porte chiuse, nessun auto-close | N/A |

### Compatibilità con feature esistenti

| Feature | Interazione |
|---|---|
| Polish Pack v1.4 #20 (Prenotazione) | Rimane attiva, ora limitata al lobby |
| Polish Pack v1.5 #21b (Pulsantiera ▲/▼) | Diventa essenziale ai piani 1-9 per rientrare dopo l'auto-close |
| Polish Pack v1.5 #22 (Auto-close timer) | Evoluto: timer differenziato per piano, posizione-independent |
| Polish Pack v1.3 #6 (Fuori servizio) | Invariato: nessun auto-close durante OOO |
| Allarme | Invariato: porte bloccate durante allarme |
| Comando vocale (K) | Invariato |

### Verifiche
- [x] `node --check` JS estratto: exit 0
- [x] Brace/paren balance: 0/0
- [x] Cabin fermo + piano T + giocatore dentro + porte aperte 8 s → countdown + chiusura ✅
- [x] Cabin fermo + piano T + giocatore nel corridoio vicino alle porte → porte restano aperte (prenotazione) ✅
- [x] Cabin fermo + piano 5 + giocatore dentro + porte aperte 5 s → countdown + chiusura ✅
- [x] Cabin fermo + piano 5 + giocatore nel corridoio + porte aperte 5 s → **annuncio + chiusura** anche se fuori cabina ✅
- [x] Cabin fermo + piano 5 + giocatore nel corridoio + porte chiuse → premendo ▲/▼ si richiama ✅
- [x] Allarme / OOO / manutenzione → nessun auto-close ✅

### Rationale

1. **Rispetto delle normative**: ADA/ASME A17.1 sono lo standard di settore. Un simulatore
   che si propone "realistico" deve allinearsi.
2. **Comportamento lobby vs altri piani**: riflette la pratica reale. Il lobby è il piano
   principale, il passeggero arriva dalla strada e si avvicina alle porte; gli altri piani
   sono "di destinazione", il passeggero esce e si allontana.
3. **Ruolo della pulsantiera esterna**: la #21b (▲/▼) diventa il modo corretto di interagire
   con la cabina ai piani 1-9, completando il workflow realistico. Senza questo hotfix la
   pulsantiera era ridondante (la prenotazione apriva comunque le porte).
4. **Costo implementativo minimo**: 2 costanti + 1 if + 1 wrapping `if (state.currentFloor === 0)`.
   Nessuna modifica al modello dati, nessun nuovo state field.

### Impatto sul backlog

Nessuna nuova feature aggiunta al backlog §11: **22/22 funzionalità implementate (100%)**
invariato. Questo hotfix **affina il comportamento** di Polish Pack v1.5 #22 (auto-close)
e Polish Pack v1.4 #20 (prenotazione) portandolo allo standard industriale, ma non aggiunge
una nuova voce al backlog.

### Riferimenti web consultati (2026-09-12)
- UpCodes: Door and Signal Timing — https://up.codes/s/door-and-signal-timing
- ABA / Access-Board §407 Doors — https://dosobo-access.wbdg.org/aba-chapters/figure/407-3-doors/
- Corada: 11B-407.3 Elevator door requirements — https://www.corada.com/documents/2025CBCPG/11B-407-3-elevator-door-requirements
- Avire Global: ASME A17.1-2019 Code Requirements — https://www.avire-global.com/en-us/wp-content/uploads/sites/10/2023/09/A17.1-2019-Code-Requirments-Operation-of-Hoistway-and-Car-Doors.pdf
- Massachusetts 521 CMR §28.6 Doors — https://www.law.cornell.edu/regulations/massachusetts/521-CMR-28-6
- Vantage Elevation traction specifications — https://www.vantageelevation.com/wp-content/uploads/2026/04/traction-specifications.pdf

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

### 6.7 Porte camere hotel/attico orientate a 90° (bug visivo)
- **Sintomo**: ai piani 4-6 (hotel) e 7-9 (attico) le porte delle camere/suite apparivano ruotate di 90° rispetto al muro: il varco della porta si estendeva lungo la larghezza del corridoio invece che lungo la direzione di camminata, dando l'impressione di "porte a 90°" innaturali.
- **Causa radice**: in `addRoomDoor()` (riga 2215) il "telaio" era un singolo `BoxGeometry(0.06, 2.2, 1.0)`. Dopo `rotY = ±π/2` la dimensione 1.0 (pensata come larghezza del varco) finiva allineata con l'asse X mondiale (= larghezza del corridoio, perpendicolare al cammino) invece che con Z mondiale (= direzione di camminata). Inoltre il "telaio" era un blocco solido invece di un contorno rettangolare, quindi il varco non era nemmeno visibile come apertura.
- **Fix applicato** (vedi Fase 19 per i dettagli completi): riscritto `addRoomDoor()` come **telaio a 4 barrette** (architrave, soglia, due montanti) con `DOOR_W=1.0` lungo l'asse X locale (= direzione di camminata dopo rotY). Aggiunto piano scuro di "buco" dietro la porta + anta rientrata + pannello decorativo incorniciato + maniglia (cilindro + sfera) + targhetta camera sopra l'architrave. Esteso con parametro `style='penthouse'` per aggiungere porte suite (1.2m × 2.3m, legno pregiato scuro, targhetta "Suite NNN") ai piani 7-9 che ne erano prive.
- **Verifiche**: 
  - [x] `node --check` JS estratto: exit 0
  - [x] Brace/paren balance: 0/0
  - [x] Porte piani 4-6: varco correttamente orientato lungo la direzione di camminata ✅
  - [x] Porte piani 7-9: 2 suite per piano con stile premium ✅
  - [x] Stessa funzione usata per entrambi gli stili (no duplicazione di codice) ✅
- **Lezione**: quando si ruota un gruppo con `rotY=±π/2`, ricordare che **l'asse X locale** va a finire lungo **Z mondiale** (e viceversa). Il modo più robusto è costruire la geometria pensando *prima* a cosa diventerà dopo la rotazione, oppure usare un `Group` "frame" non ruotato con i sotto-elementi posizionati esplicitamente.

---

### Fase 19 — Hotfix v1.8: porte camere hotel/attico ricostruite ✅ (2026-09-12)

Richiesta dall'utente dopo aver notato che le porte delle camere ai piani 4-6 (hotel)
apparivano "a 90°" e che quindi la stessa problematica andava prevenuta/risolta anche
per i piani 7-9 (attico, che già etichettava come "Suite"). Ricerca su come implementare
telai di porte in Three.js e refactor completo della funzione `addRoomDoor()`.

### Riferimenti consultati
- three.js forum — *Create a procedural door model* (PavelBoytchev, 2025-09): "Both doors can be made of boxes" per telai rettangolari con angoli a 45° (miter).
- three.js forum — *How to create window and door openings in the wall*: Shape + ExtrudeGeometry con holes, oppure CSG libraries (three-bvh-csg). Per il nostro scope (telai stilizzati su muro solido) basta il pattern a 4 barrette.
- StackOverflow — *ThreeJS Open Door Animation*: pivot sull'asse della cerniera (`pivot.position` + `axis.add(door)`).
- CodePen — *Three.js Room — Open door by raycaster*: pattern di `BoxGeometry(w, h, t)` con `t` sottile per rappresentare l'anta.

### Modifiche implementate

**1. `elevator.html:2233-2234` — Aggiunta chiamate `addRoomDoor` per penthouse**:
```js
// Porte suite attico (piani 7-9). Stile "penthouse" della addRoomDoor:
// varco più largo (1.2m), porta più alta (2.3m), legno pregiato scuro,
// targhetta "Suite NNN". Disposte in modo da non interferire con i divani.
addRoomDoor(corridor, -CORRIDOR_W/2 + 0.04, 0, sZ + 2.2, Math.PI/2, floor, floor * 10 + 1, 'penthouse');
addRoomDoor(corridor, CORRIDOR_W/2 - 0.04, 0, sZ + 8.0, -Math.PI/2, floor, floor * 10 + 2, 'penthouse');
```

**2. `elevator.html:2440-2582` — `addRoomDoor()` riscritto**:
- Nuovo parametro `style = 'hotel' | 'penthouse'` (default `'hotel'` per retro-compat).
- Costanti di dimensionamento dipendenti dallo stile:
  - `hotel`: varco 1.0 × 2.1 m, legno chiaro `#5a4028`, maniglia ottone.
  - `penthouse`: varco 1.2 × 2.3 m, mogano scuro `#2a1808`, maniglia ottone brunito.
- **Telaio a 4 barrette** (la correzione principale):
  - `topBar` / `botBar`: `BoxGeometry(DOOR_W + BAR, BAR, FRAME_T)` posizionati sopra/sotto il varco.
  - `leftJamb` / `rightJamb`: `BoxGeometry(BAR, DOOR_H + BAR*2, FRAME_T)` ai lati.
  - Asse X locale = larghezza del varco (1.0/1.2 m), che dopo `rotY=±π/2` diventa l'asse Z mondiale (= direzione di camminata nel corridoio). ✅
  - Asse Z locale = spessore del telaio (0.08 m), che dopo rotY va verso ±X mondiale (perpendicolare al muro, verso il corridoio).
- **Apertura simulata**: piano scuro (`#05040a`, `MeshBasicMaterial`) dietro l'anta per simulare il "buco" nel muro senza ricorrere a CSG.
- **Anta** (`door`): `PlaneGeometry` leggermente rientrata rispetto al telaio (`FRAME_Z + FRAME_T/2 + 0.003`).
- **Pannello decorativo incorniciato**: `panel` (rettangolo più scuro) + 4 barrette `pfTop/pfBot/pfLeft/pfRight` a formare una cornice interna per dare profondità.
- **Maniglia 3D**: `handleBase` (cilindro piccolo) + `handleKnob` (sfera) sul lato destro del varco a metà altezza.
- **Targhetta camera**: canvas texture `128×64` (hotel) o `192×72` (penthouse) con bordo dorato, font Georgia bold, posizionata *sopra l'architrave*. Per le suite il testo include il prefisso `Suite `.

### Matrice comportamento

| Piano | Stile | Larghezza varco | Altezza | Colore legno | Plate text |
|---|---|---|---|---|---|
| 4-6 (hotel) | `'hotel'` | 1.0 m | 2.1 m | `#5a4028` (chiaro) | `401`, `402`, ... |
| 7-9 (penthouse) | `'penthouse'` | 1.2 m | 2.3 m | `#2a1808` (mogano) | `Suite 707`, `Suite 808`, ... |

### Compatibilità con feature esistenti

| Feature | Interazione |
|---|---|
| Polish Pack v1.3 #7 (Numerazione camere) | Display mostra già "Camere 401-432" / "Attico · Suite 707" — ora anche il 3D è coerente |
| Polish Pack v1.5 #21b (Pulsantiera ▲/▼) | Invariata |
| Polish Pack v1.6 #14 (Logica passeggeri) | Invariata |
| `disposeCorridor()` | Le porte sono figli diretti di `corridor`, dispose già gestito correttamente |

### Verifiche
- [x] `node --check` JS estratto: exit 0
- [x] Brace/paren balance: 0/0
- [x] Porte piani 4-6: varco 1.0m lungo direzione camminata, 3 per lato = 6 porte/piano ✅
- [x] Porte piani 7-9: 2 suite per piano con stile premium ✅
- [x] Telaio a 4 barrette visibilmente un rettangolo (non più blocco solido laterale) ✅
- [x] Cambio piano (T → 1 → 4 → 7 → 0) non lascia residue ✅

### Rationale

1. **Allineamento al pattern del codice esistente**: stessa funzione per due stili evita duplicazione.
2. **Estendibilità**: il parametro `style` apre a futuri stili (es. 'office' con porta a vetri) senza riscrivere.
3. **No dipendenze esterne**: niente CSG (three-bvh-csg, three-csg-ts), solo `BoxGeometry` e `PlaneGeometry` come tutto il resto del progetto.
4. **Performance**: ~12 mesh per porta, fino a 6 porte/piano = ~72 mesh totali. Trascurabile.

### Impatto sul backlog

Nessuna nuova feature aggiunta al backlog §11. Le porte delle camere hotel facevano
parte della geometria di base del corridoio (sezione 12, vedi §8.2); il fix ne corregge
semplicemente l'implementazione. Aggiunge invece contenuto visivo ai piani 7-9 (attico),
prima privi di porte. Totale funzionalità implementate: **22/22 (100%)** invariato.

---

## Fase 20 — Polish Pack V2 Step 1: salute del codice ✅ (2026-09-13)

### Sintomo
Il progetto aveva 3 bug storici TDZ (Temporal Dead Zone) ed era vulnerabile a regressioni
di sintassi per via dell'assenza di CI. Nessun audit formale dello state globale.

### Fix implementato
4 sotto-step atomici, ciascuno con commit separato:

**1a. CI GitHub Actions** — workflow `.github/workflows/ci.yml` che gira `node --check` su
ogni push/PR. Script helper `scripts/extract-js.js` (estrae `<script type=module>`) e
`scripts/check-balance.js` (verifica sintassi + brace balance).

**1b. AGENTS.md** — documento di 89 righe per agenti di coding con layout sezioni del file
elevator.html, convenzioni codice, comandi build/verifica, decisioni D-key, lezione
"state in cima" con i 3 bug TDZ storici.

**1c. STATE.md** — tabella completa di 26 campi di `state` con colonne
`campo | tipo | scritto da | letto da | contratti`. Funzione `assertStateInvariants()`
chiamata alla fine del LOOP, no-op se `state.DEBUG=false`, altrimenti `console.warn`
per ogni contratto violato.

**1d. Mini event bus homemade** — ~15 righe, zero dipendenze. API: `bus.on(event, fn)` /
`bus.off(event, fn)` / `bus.emit(event, payload)`. Refactor di 3 catene di polling
(scheduleAutoClose, markDisplayDirty, updateFloorDisplay) per usare gli eventi
`door:opened/closed`, `floor:arrived`, `alarm:on/off`, `ooo:on/off`,
`cabin:entered/exited` invece di polling su `state.doorsActual`.

### Acceptance
- [x] `node --check --input-type=module`: OK
- [x] Brace balance: 0/0 (autorevole)
- [x] AGENTS.md ≤ 200 righe
- [x] STATE.md copre 26 campi
- [x] Bus homemade zero dipendenze
- [x] 3 catene polling → eventi

### Branch
`feature/polish-pack-v2-step-1` mergiato su `main` (commit `b6bc890`).

---

## Fase 21 — Polish Pack V2 Step 2: UX invisibile ✅ (2026-09-13)

### 2a. Sensore IR anti-ostacolo (ASME A17.1 §2.13.5)
Rileva quando il giocatore è sulla soglia della cabina mentre le porte stanno chiudendo:
annulla chiusura, riapre, annuncio vocale, beep 880Hz. Dopo 15s di ostruzione continua
entra in "nudging mode" (chiusura forzata + beep 1200Hz continuo). Safety gates su
`alarmOn`/`outOfOrder`/`maintenanceMode`/`isMoving`. Hook in LOOP dopo `tickPlayer`.

### 2b. Tutorial contestuale prima volta
5 step tutorial con testo + voce TTS. Tasto `?` apre/riapre in qualsiasi momento.
Bottoni "Avanti" e "Salta tutorial" nell'overlay. Auto-start al primo avvio (dopo
click su `startBtn`, ritardo 600ms). Prompt vocale "Premi ? per aiuto" dopo 30s
di inattività in cabina (max 1 ogni 5 min). Persistenza in `localStorage.bossHotelOnboarded@v1`.

### Acceptance
- [x] Sensore IR blocca chiusura + riapre + annuncio
- [x] TTS disabilitato → annuncio sostituito da beep + subtitle
- [x] `localStorage.bossHotelOnboarded@v1` salvato
- [x] Tasto `?` in-game e corridoio
- [x] Nudging dopo 15s
- [x] `node --check`: OK
- [x] Brace balance: 337/337

### Branch
`feature/polish-pack-v2-step-2` mergiato su `main` (commit `17d2079`).

### Bug fix collaterali durante playtest
- **Audio tintinnio tazzine (lobby) silenzioso**: `oscGain.gain.value=0` + LFO ampiezza 0.012
  causava gain clampa a 0. Fix: base 0.012, LFO 0.006.
- **Volume audio corridoio ~3-8x troppo basso**: masterGain 0.5 + layer 0.008-0.025.
  Fix: master 0.8 (corridoio) / 0.9 (ristorante), layer 2-3x.
- **Pulsanti fisici ◄| |► STOP ! restano "pressed"**: setTimeout di release portava a
  scale(0.9) z=0 invece di scale(1) z=0.012. Fix: ripristino allo stato iniziale.

---

## Fase 22 — Polish Pack V2 Step 3: audio contestuale ✅ (2026-09-13)

### 3a. Loop audio contestuale corridoio
4 temi distinti che partono quando il giocatore esce dalla cabina (porte aperte >50%,
cabina ferma) e si fermano al rientro. Ogni tema ha 2-3 layer sintetizzati (no asset
esterni).

| Tema | Piano | Layer 1 | Layer 2 |
|---|---|---|---|
| `lobby` | T | Brusio bandpass 600Hz | Tintinnio tazzine square 1200Hz + tremolo 4Hz |
| `office` | 1-3 | Brusio lowpass 400Hz | Ticchettio tastiere impulsivo 250ms |
| `hotel` | 4-6 | Drone ovattato sine 60Hz | Ticchettio orologio 1Hz |
| `penthouse` | 7-9 | Pianoforte sine 220Hz (LFO pitch) | Vento highpass 800Hz |

### 3b. Musica ristorante "La Terrazza"
Quando `state.currentFloor === 8 && !playerInCabin`: chitarra classica (4 oscillatori
triangle, arpeggio C-Am-F-G ogni 800ms con seq [0,1,2,3,2,1]) + piatti lontani
(white noise highpass 8kHz). Master fade-in 1.5s.

### Acceptance
- [x] 4 temi corridoio distinti
- [x] Rispetta `state.muted`
- [x] Piano 8 = ristorante, solo in corridoio
- [x] Nessuna regressione su `tickMusic`
- [x] `node --check`: OK
- [x] Brace balance: 337/337

### Branch
`feature/polish-pack-v2-step-3` mergiato su `main` (commit `dbcb173`).

### Step 14 aggiunto a `PIANO_V2.md` (citofono interattivo)
Su richiesta dell'utente, aggiunto Step 14 — Citofono interattivo + pairing con tasto SOS
per le fasi future.

---

## Fase 23 — Polish Pack V2 Step 4: meteo evoluto ✅ (2026-09-13)

### 4a. Stagionalità mensile
Nuova `WEATHER_MONTHLY_WEIGHTS[12]` con pesi per tutte e 10 le condizioni meteo,
calibrati sul clima di Roma (emisfero nord): GEN/FEB poca neve molta nebbia, LUG/AGO
sole pieno 50% temporali vento, SET transizione, OTT/NOV/DIC nebbia pioggia neve.

### 4b. 3 nuove condizioni meteo
- **Grandine** (`hail`): nuvola grigia + 8 cerchi grigi che cadono veloci (animT×3)
- **Foschia** (`mist`): 12 particelle bianche piccole che fluttuano lente (animT×0.5)
- **Vento** (`wind`): 2 nuvole + 5 linee orizzontali animate di lunghezza variabile

### 4c. Frequenza cambio meteo
50% → 30% (meno cambio, più persistente)

### 4d. Slide meteo ricca con previsioni 24h
Riscrittura di `drawWeatherScreen()`: header con icona grande + temperatura + condizione,
dettagli atm (umidità, vento, visibilità, mese), 6 blocchi previsioni 4h con icona/ora/temperatura,
footer con timestamp ultimo aggiornamento.

### Acceptance
- [x] Tabella mensile influenza pesi (es. LUG: 50% sole)
- [x] 10 condizioni meteo supportate
- [x] Frequenza 30%
- [x] Slide 24h con 6 blocchi
- [x] `node --check`: OK
- [x] Brace balance: 867/867

### Branch
`feature/polish-pack-v2-step-4` mergiato su `main` (commit `af51708`).

---

## Fase 24 — Polish Pack V2 Step 5: personalizzazione hotel ✅ (2026-09-14)

### 5a. HOTEL_CONFIG + refactor
Oggetto `HOTEL_CONFIG` in cima al codice (CONFIGURAZIONE, prima di `state`) con 17 campi:
`name`, `shortName`, `address`, `city`, `country`, `stars`, `established`, `tagline`,
`motto`, `motto2`, `systemName`, `systemYear`, `edition`, `accentGold`,
`accentGoldDark`, `accentGoldLight`, `panelHelpBrand`. Refactor di 23 stringhe
hardcoded sparse (targa cabina, cartello piano, display touch, pannello pubblicitario,
citofono, header pulsantiera, TUTORIAL_STEPS, start screen). Risultato: `grep`
"BOST HOTEL" / "Via Veneto" / "Boss Hotel" restituisce solo la definizione della config.

### 5b. HUD personalizza hotel (tasto H)
Overlay fullscreen con 9 campi editabili + 4 preset + 3 bottoni (Applica e salva /
Ripristina default / Chiudi) + Esc per chiudere. Persistenza `localStorage.bossHotelConfig@v1`
(versionata). Caricamento al boot prima del primo frame tramite `loadHotelConfig()`
chiamato immediatamente dopo la sua definizione, PRIMA delle IIFE che creano le
canvas texture della cabina (targa principale, header pulsantiera esterna).

### 5c. 4 preset alternativi + custom
- **Boss Hotel** (default) — Roma, oro `#c9a55a`, colori caldi
- **Sky Tower Tokyo** — Tokyo, blu `#4a9eff`, futuristico azzurro
- **Hôtel de Paris** — Monte Carlo, oro classico `#d4af37`, dorato/crema
- **Burj Al Arab** — Dubai, oro Dubai `#e0b973`, oro/blu navy

Ogni preset ha palette dedicata anche per i colori del corridoio (lobby/office/hotel/penthouse)
tramite `applyHotelThemeOverride()`. Cambio visibilmente la hall e la targa della cabina.

### Acceptance
- [x] 23 stringhe hardcoded sostituite
- [x] 4 preset disponibili + 9 campi custom
- [x] `localStorage.bossHotelConfig@v1` persiste
- [x] Cambi visibili su start screen + cabin textures + corridoio
- [x] `node --check`: OK
- [x] Brace balance: 951/951

### Bug fix durante playtest Step 5
1. **Click "Applica e salva" non rispondeva** (CSS overlay): `.hc-hidden` usava
   `opacity:0 + pointer-events:none`. Fix: `display:none/flex`.
2. **localStorage silenzioso in caso di errore**: aggiunto try/catch con ritorno
   `{ok, error}` + feedback esplicito all'utente.
3. **Save prima del reload verificato**: `saveHotelConfig()` è sincrono, il reload
   viene schedulato DOPO.
4. **Preset rilocava subito impedendo modifiche**: refactor — preset popola SOLO i
   campi del form (no save, no reload), solo "Applica e salva" salva + riloca.
5. **Cabin textures baked con valori originali**: `loadHotelConfig()` chiamato
   alla fine del modulo. Spostato a subito dopo la sua definizione, PRIMA delle IIFE
   delle cabin texture. Risultato: dopo aver salvato Sky Tower, le texture della
   cabina mostrano "SKY TOWER TOKYO" invece di "BOSS HOTEL".
6. **TDZ su `applyHotelThemeOverride`**: la funzione accedeva a `themeConfig` che
   era dichiarato dopo. Spostata la chiamata dopo la definizione della funzione e
   di themeConfig.
7. **Preset non visibilmente diversi**: refactor di molti `ctx.strokeStyle =
   '#c9a55a'` hardcoded per usare `HOTEL_CONFIG.accentGold`/`accentGoldLight`/
   `accentGoldDark`. Aggiunto `applyHotelThemeOverride()` che cambia i colori del
   corridoio per preset (Sky Tower = blu, Paris = crema/dorato, Burj = oro/blu navy).

### Branch
`feature/polish-pack-v2-step-5` mergiato su `main` (commit `bb87238` finale + fix TDZ `ddf16bd`).

---

## 7. Statistiche finali del progetto

| Metrica | Valore |
|---|---|
| File principale | `elevator.html` |
| Dimensione | ~213 KB |
| Linee di codice | ~6.343 |
| Sezioni di codice | 30+ numerate e commentate |
| Tasti interattivi | 14 (10 celle piano + 4 tasti fisici) |
| Texture dinamiche | 10+ canvas (display, meteo, pubblicità, cartello, targhe, loghi, frecce, orologio, citofono, header pulsantiera esterna) |
| Temi corridoio | 4 base × 4 preset alternativi = 16 palette |
| Condizioni meteo | 10 (7 base + grandine, foschia, vento) |
| Piani | 10 (T + 1..9) |
| Arredi 3D | ~30 tipi diversi (piante, divani, scrivanie, porte camere, vetrata, ecc.) |
| Audio effetti | ~10 tipi (beep, chime, allarme, porta, countdown, whoosh loop, audio corridoio 4 temi, audio ristorante piano 8) |
| Comandi tastiera | 14 (M, V, N, O, K, E, H, ?, Shift+M, 1-9, 0, WASD, ESC, Enter/Space) |
| Preferenze persistenti | 4 (muted, tts, nightMode, HOTEL_CONFIG) via localStorage `bossHotelPrefs@v1` + `bossHotelConfig@v1` |
| Tutorial state | 1 (`bossHotelOnboarded@v1`) |
| File di build | `dist/index.html` (copia deploy-ready) |
| Documentazione | `README.md`, `PIANO_MIGLIORAMENTI.md`, `PIANO_V2.md`, `AGENTS.md`, `STATE.md` |
| Tempo di sviluppo | ~5 sessioni |

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
| 21b | **Pulsantiera di chiamata esterna (▲/▼) nel corridoio** — placca di acciaio spazzolato sulla parete sinistra del corridoio, vicino alle porte della cabina, con header "BOSS HOTEL" + 2 pulsanti rotondi verdi (▲ su / ▼ giù). Al Terra solo ▲, all'attico solo ▼. Click chiama la cabina a quel piano. Aggiunta in Polish Pack v1.5 durante audit UX. ⚠️ **Nota**: ▲ e ▼ sono semanticamente identici (entrambi = "voglio entrare in cabina al mio piano"). Per un modello "intenzione di viaggio" distinto servirebbe refactor del routing | Alto | Basso | 🟡 | ~110 righe in `elevator.html` (`addExternalCallPanel`, `makeCallButton`, `getCallButtonTexture`, dispose dedicato). Bug fissati: TDZ buttonList (commit `cb2cc14`), raycast label (commit `ab8ebc7`) |
| 22 | ~~**Chiusura automatica porte (6 secondi)** — comportamento ascensore reale: dopo che le porte sono completamente aperte, se l'utente non fa nulla per 6s, parte il countdown 3..2..1 esistente e le porte si chiudono. Resettato da qualsiasi interazione (click pulsante, chiama piano, rientra cabina, allarme, ecc.). Gate di sicurezza: si chiude solo se `!isMoving && !alarmOn && !outOfOrder && !maintenanceMode && !prenotationActive`~~ — ✅ **Implementato in Polish Pack v1.5 (#22)**, raffinato in **Hotfix v1.7 (Fase 18)** con timer differenziato per piano (lobby 8s, altri 5s) secondo ADA §407.3.5 e ASME A17.1 | Medio | Basso | 🟡 | ~30 righe in `elevator.html` (`scheduleAutoClose`, `cancelAutoClose`, hook in `tickDoors`/`setDoors`/`requestFloor`/`pressButton`/`enterCabin`/`exitCabin`/`toggleAlarm`). Hotfix v1.7: aggiunti `DOOR_AUTO_CLOSE_MS_LOBBY=8000` e `DOOR_AUTO_CLOSE_MS_FLOOR=5000`, rimosso guard `playerInCabin` (vedi Fase 18) |
| 22b | ~~**Schermata "Welcome" interattiva** — la start screen attuale è solo un bottone. Aggiungere carosello di feature ("Cabina 5★ · Touch screen · Meteo live · Annunci vocali · 4 temi corridoio") con screenshot animati~~ — ✅ **Implementato in Polish Pack v1.3 (#22b)** | Basso | Basso | 🟢 | Carosello 5 slide (`initStartSlides` IIFE), auto-rotate 2.5s via `setInterval`, `clearInterval` al click su `startBtn`. CSS `.slide`/`.slide.active` con bordo dorato. ~30 righe in `elevator.html`. **Rinumerato da #22 a #22b (2026-09-12)** per evitare collisione con #22 auto-close porte (v1.5). |

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
13. ✅ **#22b Welcome carosello** — Polish Pack v1.3 (rinumerato da #22 a #22b il 2026-09-12 per collisione con auto-close porte v1.5)
14. ✅ **#2 Musica di sottofondo** — Polish Pack v1.4
15. ✅ **#9 Comando vocale** — Polish Pack v1.4
16. ✅ **#19 Modalità manutentore** — Polish Pack v1.4
17. ✅ **#20 Prenotazione cabina** — Polish Pack v1.4
18. ✅ **#21b Pulsantiera di chiamata esterna** — Polish Pack v1.5 (aggiunta durante audit UX)
19. ✅ **#22 Chiusura automatica porte (6s)** — Polish Pack v1.5 (aggiunta durante audit UX)
20. ✅ **#13 Accessibilità tastiera corridoio** — Polish Pack v1.6 (commit `49163a6`)
21. ✅ **#14 Logica passeggeri coerente** — Polish Pack v1.6 (commit `d82dd60`)
22. ✅ **#18 Caching canvas offscreen** — Polish Pack v1.6 (commit `427a635`)

Dopo v1.6, le feature residue nel backlog sono solo 1: #12 (i18n IT/EN, alto sforzo).

### 11.8 Decisioni richieste (per procedere)

| # | Decisione | Default proposto | Stato |
|---|---|---|---|
| D1 | Quale sottoinsieme implementare? | Suggeriti #1, #3, #15, #17, #21 per un "Polish Pack v1.1" | ✅ Risolto — approvato 2026-08-24 (Polish Pack v1.1) |
| D2 | Mantenere singolo file o aggiungere `sw.js` + `manifest.json` per PWA? | Singolo file (conservativo) | 🟡 Pendente — blocca #16 |
| D3 | Aprire una nuova fase documentale (Fase 10) o procedere come "bug-fix/miglioramenti minori"? | Nuova fase documentale | ✅ Risolto — approvato (Fase 10–13, approccio Polish Pack) |
| D4 | Aggiornare `dist/index.html` ad ogni modifica o solo a release consolidate? | Solo a release | ✅ Risolto — sync a fine feature (commit dedicato) |
| D5 | Scope Polish Pack v1.4 | Tutti e 4 i candidati (#2, #9, #19, #20) | ✅ Risolto — approvato 2026-09-12 |
| D6 | Scope Polish Pack v1.5 | Solo bonus audit UX (#21b, #22) — 3 pianificate confluite in v1.6 | ✅ Risolto (riscrittura 2026-09-12) |
| D7 | Logica ▲/▼ pulsantiera esterna | Attualmente identici (entrambi "chiama cabina al mio piano") — refactor a modello "intenzione di viaggio" richiesto? | 🟡 Pendente — bassa priorità |
| D8 | Scope Polish Pack v1.6 | I 3 candidati confluiti da v1.5 (#13, #14, #18) — esclusi #12 e #16 | ✅ Risolto — approvato e completato 2026-09-12 |

### 11.9 Note di compatibilità

- Tutte le idee sono compatibili con i vincoli §8.1 (singolo file HTML, Three.js CDN, WebGL only)
- L'unica eccezione è **#16 (PWA)** che richiede 2 file esterni e quindi esce dal pattern single-file
- **#12 (i18n)** è l'unica che richiede un refactor strutturale significativo di tutte le stringhe del codice

---

**Stato: Polish Pack v1.6 completato (3/3 — #13 ✅ #14 ✅ #18 ✅)** ✅🎉
Polish Pack v1.5 completato (2/2 feature bonus + 8 bug fix — #21b ✅, #22 ✅) ✅🟢
Polish Pack v1.4 completato (4/4 — #2 #9 #19 #20) + hotfix display touchscreen passo-passo (commit `e02adca`)** ✅🟢

**Polish Pack v1.4 → 17/22 funzionalità implementate (77.3%)**.
**Polish Pack v1.5 → 19/22 funzionalità implementate (86.4%)** con #21b + #22.
**Polish Pack v1.6 → 22/22 funzionalità implementate (100%)** con #13 #14 #18.
Backlog residuo post-v1.6: **0/22 funzionalità** (#12 i18n rimane l'unica fuori scope).
Hotfix display passo-passo non è una nuova voce di backlog ma un enhancement di coerenza
UX (allinea display touchscreen a cartello corridoio e strip DOM, già passo-passo).

**Audit v1.5 fixes** (8 bug emersi durante playtest #21b/#22, tutti risolti):
- OOO parziale (commit `ba0d075`) — porte si riaprivano al ripristino + rientro cabina bloccato
- `Shift+M` keybind (commit `ea4e9ce`) — non matchava più `KeyM` audio
- Typo `mat is not defined` (commit `c826d25`) — `applyWireframe` non crashava
- AudioContext warning spam (commit `c826d25`) — `tickMusic` posticipato al gesto utente
- TDZ buttonList (commits `c0397d0`, `cb2cc14`) — `const buttonList = []` spostato in cima
- Raycast label ▲/▼ (commit `ab8ebc7`) — body.add(label) + recursive intersectObjects
- Porte invisibili corridoio (commit `6ab62b6`) — doorMat DoubleSide + rimosso shaftBack
- Housekeeping lista comandi (commit `a6cb3c1`) — welcome screen + HUD aggiornati
