# Funzionalità

Catalogo completo delle funzionalità della simulazione, raggruppate per area.
Ogni voce elenca i tasti o gli attivatori corrispondenti.

[← Torna al README](../README.md)

### 🛗 Cabina ascensore
- Cabina 2.4 × 3.0 × 2.6 m con pareti in acciaio spazzolato, pavimento in marmo
- Profili in alluminio ai 4 spigoli, battiscopa, giunti tra pannelli
- Striscia LED ambientale lungo il soffitto
- **Griglia di ventilazione** con lamelle + 2 bocchette rotonde
- **Soglia in ottone** sotto le porte + tappetino di ingresso con righe antiscivolo
- **Telecamera dome** con LED rosso lampeggiante + targhetta "CCTV — REC"
- **Altoparlante** circolare sul soffitto sopra le porte
- **Citofono** con tasto verde illuminato "INTERFONO"
- Specchio sulla parete sinistra con cornice e maniglione
- Targa dorata "BOSS HOTEL ★★★★★ Via Veneto 142 Roma"
- Certificazioni "MAX 8 PERSONE · 630 kg · CE EN 81-20" e "ULTIMA MANUTENZIONE AGO 2026"

### 📱 Pulsantiera moderna digitale
- **Display touch 540×1100 px** in vetro nero con cornice in alluminio
- Header: nome hotel + orologio digitale in tempo reale + data italiana
- Sezione centrale: **piano corrente gigante (130 px)** + freccia direzione animata + stato
- Durante il movimento: il piano mostrato è quello **attualmente attraversato** (passo-passo), non fisso sul piano di partenza. Sotto al numero appare l'indicatore "X → Y" (es. "5 → 2"). Allineato al cartello del corridoio.
- Sezione meteo con icona animata (sole, nuvole, pioggia, neve, temporale, nebbia)
- **Mappa edificio stilizzata** con 10 quadratini (cabina evidenziata in movimento)
- **Griglia touch 3×4** con celle per i piani 9..1 + T (Terra)
- Hover visivo (cella si "sporge in avanti" + evidenziata sul display)
- **4 tasti fisici** conservati: ◄| (apri), |► (chiudi), STOP, ! (allarme)
- Tasto ↗ Esci dalla cabina (visibile solo a porte aperte)

### 🚪 Porte scorrevoli
- Due ante che scorrono verso l'esterno
- Animazione realistica con easing
- **Visibili da entrambi i lati** (interno cabina + corridoio) — fix audit v1.5
- **Chiusura automatica con timer differenziato per piano** (allineato ADA/ASME A17.1):
  - **Piano T (lobby)**: 8 secondi di dwell time
  - **Piani 1-9**: 5 secondi di dwell time (standard car call)
- Countdown 3..2..1 prima della chiusura con beep a tono crescente
- **La chiusura automatica avviene indipendentemente dalla posizione del giocatore**
  (dentro o fuori dalla cabina) come in un vero ascensore
- Si bloccano se allarme attivo

### 🚶 Corridoio del piano
- **4 temi automatici** in base al piano:
  - **Piano T**: lobby con bancone reception, campanella d'oro, divani, piante, quadri
  - **Piani 1–3**: uffici open-space con scrivanie, monitor, sedie, erogatore acqua
  - **Piani 4–6**: camere hotel con porte numerate, targhette, lampade a parete, quadri
  - **Piani 7–9**: attico con **vetrata panoramica** al tramonto, divani di design, lampada da terra

### 🛣️ Cartello stile hotel
- Sopra le porte (lato esterno) con cornice dorata e angoli decorati
- Doppia faccia (visibile anche dal fondo del corridoio)
- Testo "PIANO TERRA" / "PIANO 3°" + "— BOSS HOTEL ELEVATOR —"

### 🎬 Uscita e movimento nel corridoio
- Tasto ↗ sul pannello + tasto **E** per uscire
- Movimento **FPS** con **WASD**
- Mouse-look continuo (pointer lock)
- Collisioni semplici (resti dentro il corridoio, non sfondi le pareti)
- Bottone "Rientra" che lampeggia quando ti avvicini alle porte
- Tasto **E** vicino alle porte per rientrare in cabina

### 🗣️ Annunci vocali (TTS)
- Web Speech API con voce italiana
- All'arrivo al piano: *"Piano terzo, prego"*
- Allarme: *"Allarme. Chiamata di soccorsi in corso. Restate calmi."*
- Chiusura porte: *"Attenzione. Le porte si stanno chiudendo."*
- **Inizio movimento**: *"In salita verso piano quinto"* / *"In discesa verso piano terra"*
- **Sottotitoli su HUD** — ogni annuncio mostra anche il testo in una pillola gialla sopra lo status (accessibilità per chi non sente o ha TTS rotto)
- **Ding differenziato** — 1 tono per fermata intermedia, 2 toni per arrivo finale
- Toggle con tasto **V**

### 🌤️ Meteo casuale
- 7 condizioni con pesi: sereno 35%, poco nuvoloso 25%, nuvoloso 15%, pioggia 12%, temporale 5%, neve 3%, nebbia 5%
- Icone disegnate su canvas con animazioni (raggi che ruotano, gocce che cadono, fiocchi, fulmini)
- Temperatura coerente con la condizione, leggermente più freddo ai piani alti
- Cambia al 50% di probabilità ad ogni arrivo al piano

### 🪞 Specchio riflettente
- Lo specchio sulla parete sinistra usa `Reflector` di Three.js: riflette in tempo reale l'interno cabina, inclusi display touch, striscia LED soffitto, passeggeri e display laterale

### 📺 Pannello pubblicitario laterale
- Display 16:9 sopra lo specchio
- **6 schermate** a rotazione ogni 12 secondi:
  1. **Orologio analogico animato** in tempo reale
  2. Meteo esteso con previsioni
  3. "BENVENUTI al Boss Hotel" (storia)
  4. Menù del giorno del Ristorante "La Terrazza"
  5. Offerte Boss Spa & Wellness
  6. **Orologio mondiale** — orari live di Roma, New York, Tokyo, Londra, Sydney

### 🌙 Modalità notte
- Tasto **N** per luci soffuse e atmosfera più intima

### 💾 Preferenze persistenti
- **Mute**, **annunci vocali** e **modalità notte** vengono salvati in `localStorage` e ripristinati al refresh della pagina (chiave `bossHotelPrefs@v1`)

### 👤 Indicatore carico
- "👤 X/8" sul display, varia casualmente ogni 8 secondi quando la cabina è ferma

### 📳 Vibrazione cabina
- **One-shot al click**: oscillazione Y di pochi mm per 200ms dopo ogni click sui tasti
- **Continua durante il viaggio**: micro-oscillazioni X/Z (±3.5mm) + roll/pitch, con envelope a campana (max al centro della corsa, nullo ai capi). Decay graduale all'arrivo.

### 🌬️ Whoosh loop
- White noise modulato in pitch (300→1100Hz) che segue la velocità della cabina: più acuto al centro della corsa, più grave ai capi. Si interrompe su STOP, allarme e arrivo al piano.

### 🚨 Sistema di emergenza
- Tasto ! rosso (fisico) per attivare
- Luci rosse pulsanti, sirena alternata a due toni
- Cabina bloccata, porte chiuse, annuncio vocale
- Tasto STOP (giallo) per fermare immediatamente la cabina

### 📞 Citofono interattivo (EN 81-28, Step 14)
- **Click sul pulsante verde** del citofono (parete destra cabina) per chiamare la reception
- **Lampeggio pulsante verde 4Hz** per 5 secondi + TTS "Chiamata in corso. Attendere prego."
- **Voce reception simulata** dopo 2s: "Centralino. Buongiorno. Come posso aiutarla?" (IT) / "Reception. Good morning. How may I help you?" (EN)
- **Pairing soft/hard**: citofono = chiamata SOFT alla reception, SOS (tasto !) = allarme HARD soccorsi. I due sistemi sono indipendenti (nessuna escalation, nessun blocco cabina per citofono)
- **Persistenza**: stato `interphoneCalling` salvato in `localStorage.bossHotelPrefs@v1`; al refresh, mostra subtitle "Chiamata citofono interrotta dal refresh della pagina"
- **HUD manutentore**: nuova riga "Citofono: ATTIVO|NON ATTIVO" / "Interphone: ON|OFF" nel maintenance overlay (Shift+M)
- **Blocca se fuori servizio**: con tasto `O` attivo, citofono rifiuta la chiamata con beep 220Hz + subtitle

### 🛑 Modalità "Fuori servizio"
- Tasto **O** per mettere l'ascensore in stato di manutenzione
- Display touch: overlay rosso "FUORI SERVIZIO" + "Premere O per ripristinare"
- Cartello corridoio: warning rosso con "MANUTENZIONE IN CORSO"
- Tutti i tasti piani disabilitati (selezione rifiutata con tono basso 220Hz)
- Movimento bloccato, porte chiuse, coda svuotata
- Annuncio vocale italiano all'attivazione/disattivazione
- Tasto `O` di nuovo per ripristinare (beep ascendente 660Hz)

### 🚏 Indicatore direzione "passo passo"
- Durante la corsa, il cartello lato corridoio mostra i piani che la cabina sta attraversando (es. "▲ T · 1 · 2 · 3")
- Freccia verde in salita / ambra in discesa + piano corrente evidenziato
- All'arrivo, torna al formato statico "PIANO N°"

### 🏨 Numerazione camere contestuale
- Quando la cabina è ferma ai piani 4–6, il display touch mostra "Camere 401–432", "Camere 501–532", "Camere 601–632"
- Al piano T mostra "Lobby · Reception", ai piani 1–3 "Uffici N° piano", ai piani 7–9 "Attico · Suite N0N"

### 👋 Schermata Welcome interattiva
- Carosello di 5 slide che ruota ogni 2.5 secondi sulla start screen
- Evidenzia le feature principali: Cabina 5★, Touch screen, Meteo live, Annunci vocali, 4 temi corridoio
- Slide attiva con bordo dorato e leggero sollevamento
- Si ferma automaticamente al click su "Entra nell'ascensore"

### 🎵 Musica di sottofondo contestuale
- WebAudio sintetizzato: 4 oscillatori sine filtrati low-pass con LFO lento
- **Track "jazz"** ai piani T–3 (accordo Cmaj7 un'ottavia sotto)
- **Track "classica"** ai piani 4–9 (arpeggio C-E-G-C ogni 900ms)
- Fade-in 1.5s all'apertura porte, fade-out 0.5s su movimento/allarme/OOO
- Si disattiva su `M` (mute globale) e in modalità manutentore

### 🗣️ Comando vocale
- Tasto **K** per attivare la `SpeechRecognition` API in italiano
- Pronuncia "piano cinque", "cinque", "5" per chiamare quel piano
- Mappa i nomi italiani dei numeri (zero, uno, due, ..., nove) più le cifre 0-9
- Funziona solo in cabina e a cabina ferma, fallback silente in Firefox

### 🛠️ Modalità manutentore
- Tasto **`Shift+M`** per entrare/uscire dalla modalità debug
- **Wireframe** su tutti i materiali della cabina
- Overlay verde in alto a sinistra con FPS medio, draw calls, stato (piano, coda, passeggeri, modalità cabina/corridoio, OOO)
- Log degli ultimi 10 eventi
- **Teletrasporto**: in maintenance, i tasti `1`–`9` chiamano direttamente un piano (salta l'animazione)

### 🚏 Prenotazione cabina automatica (solo lobby)
- **Solo al piano T (lobby)**: nel corridoio ti avvicini alle porte della cabina (<1m) e queste **si aprono automaticamente**
- Sul display touch appare un overlay azzurro "PRENOTATA · Tieni premuto E per entrare"
- Se ti allontani dopo aver prenotato, le porte si chiudono gentilmente (no countdown)
- **Ai piani 1-9 la prenotazione automatica è disabilitata** (comportamento ascensore reale): le porte si chiudono automaticamente dopo il dwell time standard; per rientrare in cabina usa la pulsantiera ▲/▼ esterna
- Rispetta allarme e fuori servizio (prenotazione rifiutata)

### 🔔 Pulsantiera di chiamata esterna (corridoio)
- **Placca di acciaio spazzolato** sulla parete sinistra del corridoio, vicino alle porte della cabina
- Header dorato "BOSS HOTEL" + 2 pulsanti rotondi verdi: **▲** (salita) e **▼** (discesa)
- Al piano Terra solo ▲; al piano 9 (attico) solo ▼

### 🏨 Personalizzazione hotel (`HOTEL_CONFIG` + 4 preset)
- **HOTEL_CONFIG**: oggetto centralizzato in cima al codice con 17 campi brand (`name`, `shortName`, `address`, `city`, `stars`, `established`, `tagline`, `motto`, `accentGold`, ecc.). Tutte le stringhe "BOSS HOTEL", "Via Veneto 142 Roma", "★★★★★ Luxury since 1898" sono state refactate per usare questi campi
- **Tasto `H`**: apre overlay fullscreen "PERSONALIZZA HOTEL" con 9 campi editabili (nome, nome corto, indirizzo, città, stelle 1-5, anno fondazione, tagline, motto, color picker) + 4 preset + 3 bottoni (Applica e salva / Ripristina default / Chiudi)
- **4 preset alternativi** con palette e temi corridoio dedicati:
  - **Boss Hotel** (default) — Roma, oro `#c9a55a`, colori caldi marrone/beige
  - **Sky Tower Tokyo** — Oshiage Tokyo, blu `#4a9eff`, futuristico azzurro/luminoso
  - **Hôtel de Paris** — Place du Casino Monte Carlo, oro classico `#d4af37`, stile dorato/crema
  - **Burj Al Arab** — Umm Suqeim Dubai, oro Dubai `#e0b973`, lusso oro/blu navy
- **Persistenza** in `localStorage.bossHotelConfig@v1` (versionata)
- **Reload automatico** dopo "Applica e salva" per aggiornare tutte le canvas texture statiche della cabina (targa principale, citofono, header pulsantiera) che sono baked al boot
- **Live preview**: click su preset popola i campi del form + ricostruisce il corridoio con i nuovi colori senza rilocare

### 🌐 i18n IT/EN (Step 8)
- **STRINGS dictionary**: ~120 chiavi IT/EN per TUTTI i testi UI (`STRINGS[state.lang][key]`)
- **Tasto `L`**: toggle live della lingua (IT ↔ EN) con persistenza `localStorage.bossHotelLang@v1`
- **Bottone UI IT/EN**: nel floor-strip HUD accanto a freccia direzione + numero piano
- **Auto-detect**: prima volta, legge `navigator.language` (se IT → 'it', altrimenti 'en')
- **Tutti i testi visibili tradotti**:
  - HUD pannello comandi (14 righe key+desc), start screen (.keys, slides, intro, topbar)
  - Tutorial contestuale (5 step con placeholder shortName hotel)
  - Customizer overlay (title + presets + labels + bottoni + status)
  - Display touch (PRENOTATA/BOOKED, FUORI SERVIZIO/OUT OF SERVICE, PIANO/FLOOR, mappa CABINA POSITION, OROLOGIO MONDIALE/WORLD CLOCK, ecc.)
  - Manutentore overlay (8 labels + hint + status)
  - Canvas drawRestaurantScreen / drawSpaScreen / drawWorldClock / drawWelcomeScreen
  - Status pill "ALLARME/ALARM", "Diretto al piano/Going to floor", "In attesa/Waiting"
  - TTS announcements (arrival, alarm, door closing, obstacle detected, voice command, prompt 30s inattività)
  - Subtitle HUD (ostacolo rilevato/obstacle detected, lingua/language, tutti i feedback)
- **Refactor HTML statico**: tabelle HTML (#panel-help, #startscreen .keys, slides) sono ora rigenerate via JS da helper `t(key)`, `buildPanelHelpRows()`, `buildStartScreenKeys()`, `buildStartSlides()`
- **Event delegation**: preset buttons configurati via addEventListener sul parent `.hc-presets` (sopravvive ai re-render di applyLangToDOM)
- **`applyLangToDOM()`** consolidata: chiamata all'init e ad ogni `setLang()` per aggiornare tutti gli elementi dinamici
- **TTS en-GB prioritaria**: `speak()` usa `lang === 'en' ? englishVoice : italianVoice`, fallback en-US se en-GB non disponibile

### 📱 Mobile support (V3 Step 9 bonus + V4 Step 7+8)
- **Rilevamento dispositivo robusto** (V4): `isMobileDevice()` valuta `(pointer: coarse)` + dimensioni viewport (`Math.min(innerWidth, innerHeight) <= 500` oppure `screen.width <= 500`) per catturare anche i telefoni landscape con quirk "viewport pinning" di iOS Safari (dove `innerHeight` può essere la dimensione maggiore invece di quella corta). Aggiunti listener `resize` + `orientationchange` come fallback al `matchMedia`.
- **Single source of truth**: `state.inputMode = 'desktop'|'mobile'` (D26 esteso) calcolato al boot da `isMobileDevice()` e ricalcolato a runtime su rotation/resize. Tutte le UI/handler/tutorial/cheatsheet leggono SOLO questo flag.
- **Touch controls** (V3): joystick virtuale 140×140 (bottom-left) per movimento nel corridoio + pulsanti call ▲▼ (bottom-right) che chiamano `requestFloor(currentFloor ± 1, direction)`. Visibili SOLO su `body.mobile-mode`.
- **Cheatsheet mobile dedicata** (V4 Step 7): `PANEL_HELP_KEYS_MOBILE` con 13 voci touch-friendly (Drag dito / Tap / Tap HUD / Joystick / ▲▼ / Menu / IT-EN) che sostituisce completamente la cheatsheet WASD/E/M/V/N/O/K/H/L di `PANEL_HELP_KEYS` quando `state.inputMode === 'mobile'`.
- **Tutorial mobile dedicato** (V4 Step 7): `TUTORIAL_STEPS_MOBILE` con 5 step che descrivono tap su ▲▼, tap Esci dalla cabina, drag dito + joystick, Rientra, IT/EN. Wizard salvato in `bossHotelOnboardedMobile@v1` (separato da `bossHotelOnboarded@v1` desktop).
- **Pointer hint mobile** (V4 Step 7): "Trascina il dito per guardare. Usa il joystick per muoverti." invece di "Click per attivare il puntatore".
- **CSS split** (V4 Step 7): `body.mobile-mode #panel-help { display: none }` + `body.mobile-mode #crosshair { display: none }` + `body:not(.mobile-mode) #touch-controls { display: none }`.
- **Keydown short-circuit** (V4 Step 7): il listener `keydown` ritorna subito su mobile (nessuna tastiera fisica) tranne per tasti tutorial (`?`, Enter, Esc).
- **Hamburger menu ☰** (V4 Step 8, D27): bottone fisso top-left 44×44 px (visibile solo su mobile). Tap → overlay slide-in da destra con 9 voci in 2 sezioni:
  - **Impostazioni rapide** (5 toggle con badge ON/OFF colorato): Audio (M), Annunci vocali (V), Modalità notte (N), Fuori servizio (O), Comando vocale (K)
  - **Altro** (4 link ad altri overlay): Rivedi tutorial (?), Personalizza hotel (H), Manutentore (Shift+M), Lingua IT/EN (L)
- **Sicurezza UX menu**: `openMobileMenu()` rilascia `pointer-lock` (evita mouse-look accidentale) + chiude il tutorial se attivo (evita overlay stacking). 4 azioni link chiudono il menu prima di aprire l'overlay target.
- **i18n menu mobile**: 25 nuove chiavi × IT + EN = **50 stringhe** (`mmTitle`, `mmAudio`, `mmVoiceCmd`, `mmTutorial`, `mmCustomize`, `mmMaint`, `mmLang`, `mmStateOn`, `mmStateOff`, `mmSectionToggles`, `mmSectionActions` + 13 `ariaMm*`).
- **Funzioni pure esposte**: `openMobileMenu`, `closeMobileMenu`, `toggleMobileMenu`, `isMobileMenuOpen`, `handleMobileMenuAction`, `refreshMobileMenuStates` — testate in `tests.html` (describe "V4 Step 8: hamburger menu mobile").

### 🎚️ Sensazioni realistiche cabina (Step 9)
- **9a · Vibrazione realistica multi-band**: 4 frequenze sovrapposte (X 7.3+11.1Hz, Z 8.7+13.3Hz, Roll 5.1Hz, Pitch 6.7Hz) con envelope derivato da `12*moveT*(1-moveT)` (derivata di easeInOutCubic). Alta vibrazione in accel/decel, minima in crociera (CRUISE_AMP=0.0006 per "presenza" del motore vuoto).
- **9b · Crossfade freccia direzione**: `setArrow(direction)` non swap più istantaneamente la texture, ma fade-out 200ms della vecchia + fade-in della nuova tramite due mesh tre.js sovrapposte (`arrowFadeMesh`).
- **9c · Frenata/accelerazione progressiva**: `easeInOutCubic(moveT)` già implementato in `tickMove()`. Si applica a TUTTI i movimenti (digit keys, pulsantiera ▲/▼, prenotazione lobby, manutentore teleporte, coda FIFO) grazie a convergenza su `actuallyStartMove()`.
- **Weesh audio coerente**: la velocità `speed = 12*moveT*(1-moveT)` modula pitch e volume del weesh loop (300-1000Hz), sincronizzato con vibrazione cabina.
- **Coerenza con architettura first-person**: tutte le feature sono visibili e percepibili dal giocatore (shaft "dietro le quinte" scartato perché non visibile in prima persona).

### 🏨 Vita dell'hotel (Step 10)
- **10a · Passeggeri NPC**: alla fermata al piano, 1-3 NPC umanoidi (capsula + testa + braccia) escono dalla cabina e camminano nel corridoio per 4-7s. TTS annuncia l'arrivo ("Ospiti del ristorante" / "Office workers"). Massimo 5 simultanei per performance.
- **10b · Suoni contestuali corridoio**: alla fermata cabina, suoni ambientali 3s coerenti con la zona: lobby (brusio lowpass 1.2kHz), uffici (4-6 tick tastiere square 600-800Hz), hotel (3-4 tick orologio triangle 1800Hz), attico (vento soft bandpass 400Hz). Volume basso 0.025-0.04 per non sovrastare TTS.
- **10c · Ciclo giorno/notte automatico**: `new Date().getHours()` determina `state.dayPhase` (day 6-18 / evening 18-22 / night 22-6) che modula `ceilingLight.intensity`, `fillLight.intensity`, e `scene.fog.color`. Update automatico ogni 60s via `setInterval`. `nightMode` (tasto N) override manuale rispettato.
- **10d · Log manutenzione realistica**: ogni 30s, 12% probabilità di generare un log tecnico credibile (cuscinetto, sensore porta, cavo, freno, HVAC, comunicazione controller) che appare nel maintenance overlay (Shift+M). 8 template IT/EN con placeholder dinamici (floor, side, cable, ms latenza 15-45ms). Probabilità aumentata a 33% in maintenance mode.
  - HUD pannello comandi (14 righe key+desc), start screen (.keys, slides, intro, topbar)
  - Tutorial contestuale (5 step con placeholder shortName hotel)
  - Customizer overlay (title + presets + labels + bottoni + status)
  - Display touch (PRENOTATA/BOOKED, FUORI SERVIZIO/OUT OF SERVICE, PIANO/FLOOR, mappa CABINA POSITION, OROLOGIO MONDIALE/WORLD CLOCK, ecc.)
  - Manutentore overlay (8 labels + hint + status)
  - Canvas drawRestaurantScreen / drawSpaScreen / drawWorldClock / drawWelcomeScreen
  - Status pill "ALLARME/ALARM", "Diretto al piano/Going to floor", "In attesa/Waiting"
  - TTS announcements (arrival, alarm, door closing, obstacle detected, voice command, prompt 30s inattività)
  - Subtitle HUD (ostacolo rilevato/obstacle detected, lingua/language, tutti i feedback)
- **Refactor HTML statico**: tabelle HTML (#panel-help, #startscreen .keys, slides) sono ora rigenerate via JS da helper `t(key)`, `buildPanelHelpRows()`, `buildStartScreenKeys()`, `buildStartSlides()`
- **Event delegation**: preset buttons configurati via addEventListener sul parent `.hc-presets` (sopravvive ai re-render di applyLangToDOM)
- **`applyLangToDOM()`** consolidata: chiamata all'init e ad ogni `setLang()` per aggiornare tutti gli elementi dinamici
- **TTS en-GB prioritaria**: `speak()` usa `lang === 'en' ? englishVoice : italianVoice`, fallback en-US se en-GB non disponibile
- **Click su ▲/▼**: chiama la cabina a quel piano (se è già lì, apre le porte gentilmente)
  - ⚠️ **Nota**: ▲ e ▼ sono semanticamente identici nel gioco attuale (entrambi = "voglio entrare in cabina al mio piano"). Per un modello "intenzione di viaggio" distinto servirebbe refactor del routing.
- Rispetta allarme e fuori servizio (rifiutato con beep 220Hz)

### 🧪 Test framework (V2 Step 12 + V3/V4 Steps)

- `tests.html` esegue automaticamente la suite all'apertura (via iframe sandbox)
- **299 test** passing (era 134/228 in V3, 206/343 in V4 Step 1, 232/396 dopo
  il merge V4)
- 54 sezioni (`describe` block) organizzate: matematica pura, routing pickNextFloor, citofono,
  accessibility, contrasto WCAG, bug corner cases, QoL settings, micro-animazioni,
  performance, a11y ARIA, merge geometry helper
- Esporta risultati JSON con un bottone (`Esporta risultati JSON`)
- CI GitHub Actions con 4 job paralleli: `check` (sintassi + brace balance +
  parità SHA-256 di `dist/index.html`) + `tests` (validazione statica
  presenza namespace + conteggio test) + `tests-run` (**esecuzione reale della
  suite** in Chromium headless via `scripts/run-tests.js`) + `ui-tests`
  (**21 test UI di layout e interazione** in Chromium headless via
  `scripts/run-ui-tests.js`)
- **`window.BossHotelPure`** — namespace esposto alla fine di `elevator.html` con 62 funzioni pure (V2 Step 12 + V3/V4 Steps). Nessun side-effect, nessuna dipendenza da `state`/`scene`/`THREE`. Include helper `applyLangToDOM`/`setLang`/`applyAriaLabels` (V4 Step 3 test cross-iframe) e `mergePlanes` (V4 Step 5 helper geometry)
- **`tests.html`** — file standalone che carica `elevator.html` in iframe sandbox (`allow-same-origin allow-scripts`) ed esegue **299 test** su `iframe.contentWindow.BossHotelPure`. Organizzati in 54 sezioni (`describe` block): helper matematici, routing, configur, citofono, accessibility, corner case UX, settings QoL, micro-animazioni, performance, **a11y ARIA attributes** (V4), **mergePlanes helper** (V4)

