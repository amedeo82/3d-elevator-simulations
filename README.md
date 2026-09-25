# BOSS HOTEL — Simulatore Ascensore 3D

Una simulazione 3D realistica e interattiva di un ascensore d'hotel a 5 stelle, in prima persona, costruita interamente con Three.js in un singolo file HTML.

![Three.js](https://img.shields.io/badge/Three.js-r160-black?logo=three.js) ![Status](https://img.shields.io/badge/Status-Stable-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Tests](https://img.shields.io/badge/Tests-232%2F232-brightgreen) ![Single--file](https://img.shields.io/badge/Single--file-HTML-orange) ![Italian](https://img.shields.io/badge/i18n-IT%20%2F%20EN-green)

🔗 **Demo live**: https://hve0n8mdm4ixk.space.minimax.io

> **🎉 Polish Pack V4 COMPLETO (2026-09-25)** — 6/6 step (100%). D-key contracts
> aggiunti: D22 (routing look algorithm asimmetrico), D23 (a11y ARIA + i18n),
> D24 (funzioni <150 + commenti narrativi), D25 (helper `mergePlanes` DRY),
> D26 (open source boilerplate: LICENSE + CHANGELOG + CONTRIBUTING).
> Totale **232 test / 396 assert / 26 contratti D-key**.
>
> **🎉 Polish Pack V3 COMPLETO (2026-09-23)** — 9/9 step (100%). Accessibility,
> bug fix UX, settings QoL, micro-animazioni, performance, QoL manutenzione,
> documentazione completa, test coverage estesa, mobile responsive (bonus).
>
> **🎉 Polish Pack V2 COMPLETO (2026-09-17)** — 10/13 step (77%). Salute codice,
> UX invisibile, audio contestuale, meteo evoluto, personalizzazione hotel,
> pulsantiera semantica, i18n IT/EN, sensazioni realistiche, vita hotel,
> test framework, citofono EN 81-28.

> **🚪 Hotfix v1.8 (2026-09-12)** — porte camere hotel/attico ricostruite. Il telaio era un
> singolo blocco `BoxGeometry` ruotato di 90° dalla `rotY=±π/2`, quindi il varco finiva
> lungo la larghezza del corridoio invece che lungo la direzione di camminata ("porte a
> 90°"). Ora `addRoomDoor()` costruisce un **telaio a 4 barrette** (architrave + soglia +
> 2 montanti) con il varco correttamente orientato, più anta rientrata, pannello decorativo
> incorniciato, maniglia 3D e targhetta. Aggiunto anche stile `'penthouse'` per dotare i
> piani 7-9 (prima privi di porte) di 2 suite per piano con legno pregiato e targhetta
> "Suite NNN". Dettaglio: `PIANO_MIGLIORAMENTI.md` §Fase 19.
>
> **⚡ Polish Pack V3 Step 5 (2026-09-23)** — Performance (T2b). `textureCache`
> LRU capacity 10 cacha la base di `drawMovingSign` (hit ratio ~90% durante il
> flash gentile pre-arrivo); `mergeGeometries` riduce ~8 draw call per rebuild
> corridoio (3 pareti + 4 LED + 4 frame); `ctx.filter = brightness(X)` skippato
> quando `X===1.0` (no-op costoso). Nuovi helper puri `aggregateFpsStats`,
> `formatFpsDelta`, `createLruCache`. Bottone "Esegui benchmark (5s idle +
> 5s moving)" nel maintenance overlay (Shift+M). Nuovi state `_benchPhase`,
> `_benchIdle`, `_benchMoving`, `_benchStartMs`. 134 test / ~228 assert
> (era 138 / ~209). Branch `feature/v3-step-5-performance`. Dettaglio:
> `PIANO_MIGLIORAMENTI.md` §Fase 22 e `PIANO_V3.md` §Stato V3.
>
> **🎬 Polish Pack V3 Step 4 (2026-09-23)** — Micro-animazioni (T2a). "Respiro"
> pulsazione ±2% periodo 4s su tutti i tasti del display (canvas + mesh 3D);
> cartello corridoio lampeggia 3× in ultimo secondo pre-arrivo (gold tint
> overlay); fade-in/out 200ms su `alarmLight.intensity` e pulsante citofono
> via `tickFadeStates()`; easing `easeOutBounce` su vibrazione residua post-
> arrivo (oscilla damped ~1.5s invece di decay esponenziale puro). Tutte le
> micro-animazioni rispettano `state.reducedMotion`. Nuovi helper puri
> `breathScale`, `arrivalFlashAlpha`, `easeOutBounce`, `stateFadeDurationMs`,
> `easeOutLinear`. Nuovi state `_arrivalPhase`, `_fadeAlarm`, `_fadeOOO`,
> `_fadeInterphone`. `movePaused` spostato in CONFIGURATION (TDZ safety).
> Branch `feature/v3-step-4-micro-animations`. Dettaglio: `PIANO_MIGLIORAMENTI.md`
> §Fase 21 e `PIANO_V3.md` §Stato V3.
>
> **🎛️ Polish Pack V3 Step 3 (2026-09-22)** — Settings QoL (T1c). 4 slider nel
> pannello "Personalizza hotel" (H): effetti (100%), musica (50%), TTS (85%),
> luminosità display (100%). Persistenza in `localStorage` con due chiavi
> separate `bossHotelAudio@v1` + `bossHotelDisplay@v1` (v=1 forward-
> compatible). Luminosità via `ctx.filter = brightness(X)`. Nuovo bottone
> "Esporta stato JSON" nel maintenance overlay (Shift+M) per issue reporting.
> Nuovi helper puri `clampAudio`, `clampBrightness`, `formatVolumePercent`,
> `stateShapeForExport`. ~20 nuovi assert. Branch `feature/v3-step-3-settings-qol`.
> Dettaglio: `PIANO_MIGLIORAMENTI.md` §Fase 20 e `PIANO_V3.md` §Stato V3.
>
> **🐛 Polish Pack V3 Step 2 (2026-09-18)** — Bug fix UX sistematico (T1b).
> Audit di 5 corner case + 4 bug latenti aggiuntivi (A/B/C/D), con 4 fix
> (Q2.6 A/B/C + promise-chaining Q2.3) e 1 "leave alone" documentato (D).
> Feedback audio+visivo su `requestFloor()` in coda (440Hz+subtitle 1.5s),
> `setDoors(true)` con allarme/OOO, niente spam annuncio chiusura ripetuta.
> Allarme SOS forza OOO OFF (TTS notifica). Nuovi helper puri `canOpenDoors`,
> `shouldAnnounceDoorClose`, `sosCancelsOOO`, `currentMovementDirection`.
> 4 nuovi describe block in `tests.html`. Branch `feature/v3-step-2-bugfix-ux`.
> Dettaglio: `PIANO_MIGLIORAMENTI.md` §Fase 19 e `PIANO_V3.md` §Stato V3.
>
> **♿ Polish Pack V3 Step 1 (2026-09-18)** — Accessibility (T1a). Sottotitoli
> TTS automatici via `speakWithSubtitle()` (D11); `prefers-reduced-motion`
> OS-level → `state.reducedMotion` (D12, animazioni essenziali invariate);
> focus ring dorato brand su tutti i bottoni HUD (`.hud-action`, `.tt-btn`,
> `.hc-btn`, `.start-btn`); contrasto display touch WCAG AA verificato e
> corretto (gold #c9a449, bianco su blu #4a90e2). Nuovi helper puri
> `computeSubtitleDuration`, `shouldDisableMotion`, `relativeLuminance`,
> `contrastRatio`. Branch `feature/v3-step-1-accessibility`. Dettaglio:
> `PIANO_MIGLIORAMENTI.md` §Fase 18 e `PIANO_V3.md` §Stato V3.
>
> **🧪 Polish Pack V2 Step 12 (2026-09-17)** — Test framework leggero. `elevator.html`
> espone `window.BossHotelPure` (13 funzioni pure: `clamp`, `lerp`, `smoothstep`,
> `clampFloor`, `floorLabel`, `computePassengerDelta`, `pickNextFloor`,
> `floorRoomRange`, `getThemeForFloor`, `parseHexColor`, `getDayPhase`,
> `easeInOutCubic` + costante `NUM_FLOORS`). `tests.html` (47 assert vanilla,
> 12 sezioni) lo consuma via iframe sandbox e mostra reporter DOM con export
> JSON. CI GitHub Actions estesa con secondo job `tests` per validazione
> statica (presenza namespace + conteggio test ≥ 30). Esecuzione browser
> resta manuale. Branch `feature/v2-step-12-tests`. Dettaglio:
> `PIANO_MIGLIORAMENTI.md` §Fase 16 e `PIANO_V2.md` §Step 12.

> **📞 Polish Pack V2 Step 14 (2026-09-17)** — Citofono interattivo (EN 81-28).
> Il citofono sulla parete destra della cabina (pulsante verde, prima
> solo decorativo dalla Fase 1) diventa cliccabile. Click → lampeggio
> verde 4Hz per 5s + TTS "Chiamata in corso. Attendere prego." + voce
> reception simulata "Centralino. Buongiorno. Come posso aiutarla?"
> dopo 2s + subtitle HUD. Pairing soft/hard: citofono (reception) e SOS
> (soccorsi via `toggleAlarm`) sono due sistemi distinti e indipendenti.
> Stato persistito in `localStorage.bossHotelPrefs@v1`. Nuova riga
> "Citofono: ON/OFF" nel maintenance overlay (Shift+M). 53 test totali
> (+6 nuovi per helper citofono). Branch `feature/v2-step-14-interphone`.
> Dettaglio: `PIANO_MIGLIORAMENTI.md` §Fase 17 e `PIANO_V2.md` §Step 14.

> **🛗 Hotfix v1.7 (2026-09-12)** — comportamento porte allineato allo standard ADA/ASME
> A17.1 per ascensori reali: timer differenziato per piano (lobby 8s, altri piani 5s) e
> prenotazione automatica dal corridoio limitata al solo piano T (lobby). Ai piani 1-9 le
> porte si chiudono automaticamente dopo il dwell time standard indipendentemente dalla
> posizione del giocatore; per rientrare serve la pulsantiera ▲/▼ esterna. Dettaglio:
> `PIANO_MIGLIORAMENTI.md` §Fase 18 (supera il fix precedente §Fase 17).

> **🔧 Hotfix post-v1.6 (2026-09-12)** — auto-close porte (6s) non scatta più quando il
> giocatore è fuori dalla cabina. Corretto bug "annuncio vocale 'porte si chiudono'
> ma porte che restano aperte / riaprono" (la prenotazione automatica del corridoio
> riapriva le porte durante la fase di chiusura). Dettaglio: `PIANO_MIGLIORAMENTI.md`
> §Fase 17. **Superseded da v1.7** che adotta un comportamento più realistico.
> Totale funzionalità backlog: **22/22 (100%)** invariato.

> **🎉 Polish Pack v1.6 completato (2026-09-12)** — 3 feature: **#13 audit + fix accessibilità
> tastiera corridoio**, **#14 logica passeggeri coerente con il piano tematico**,
> **#18 caching canvas offscreen per il display touch** (3 layer: statico /
> semi-statico / dinamico). Branch `feature/polish-pack-v1.6`. Totale:
> **22/22 funzionalità backlog implementate (100%)**. Vedi `PIANO_MIGLIORAMENTI.md`
> §Fase 16 e `piani/README.md`.
>
> **✅ Polish Pack v1.5 completato (2026-09-12)** — 2 feature bonus da audit UX:
> **#21b pulsantiera di chiamata esterna (▲/▼) nel corridoio** + **timer di chiusura
> automatica porte (6s)**. Inoltre: porte ora visibili dal corridoio (era un muro
> nero a causa di PlaneGeometry FrontSide + shaftBack nero). Branch
> `feature/polish-pack-v1.5` mergiato su `main` (commit `5ec79b1`). Totale:
> **19/22 funzionalità backlog implementate (86.4%)**. Vedi `PIANO_MIGLIORAMENTI.md`
> §Fase 15 e `piani/README.md`.
>
> **✅ Polish Pack v1.4 completato (2026-09-12)** — 4 feature: musica contestuale,
> comando vocale, modalità manutentore, prenotazione cabina. Totale: **17/22 funzionalità
> backlog implementate (77%)**. Vedi `PIANO_MIGLIORAMENTI.md` §Fase 13 e `piani/README.md`.
>
> **🔧 Hotfix post-v1.4 (2026-09-12)** — display touchscreen mostra i piani
> attraversati durante il movimento (passo-passo) + indicatore "X → Y". Allinea il
> display touchscreen al cartello del corridoio e alla strip HUD. Vedi §Fase 14.

---

## 📋 Indice

- [Panoramica](#-panoramica)
- [Features](#-features)
- [Demo](#-demo)
- [Come si usa](#-come-si-usa)
- [Stack tecnico](#-stack-tecnico)
- [Struttura del progetto](#-struttura-del-progetto)
- [Architettura](#-architettura)
- [Sviluppo locale](#-sviluppo-locale)
- [Deploy](#-deploy)
- [Roadmap](#-roadmap)
- [Documentazione](#-documentazione)
- [Contribuire](#-contribuire)
- [License](#-license)

---

## 🎯 Panoramica

**BOSS HOTEL Elevator 3D** è un simulatore in prima persona dell'interno di un ascensore di lusso. L'utente può:
- Muoversi con la visuale come in un gioco FPS (mouse-look con pointer lock)
- Interagire con una **pulsantiera digitale moderna** (display touch) per selezionare il piano
- Attivare l'**allarme di emergenza** con luci rosse e sirena
- Aprire/chiudere le **porte scorrevoli**
- **Uscire dalla cabina** ed esplorare il corridoio del piano raggiunto
- Sperimentare **4 temi di corridoio diversi** in base al piano (lobby, uffici, camere hotel, attico)
- Ricevere **annunci vocali** in italiano all'arrivo al piano
- Vedere **meteo casuale**, **orologio in tempo reale**, **mappa edificio** sul display

Il tutto in **un singolo file HTML** di ~390KB (~9250 righe), deployato staticamente, senza dipendenze npm.

---

## ✨ Features

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
- **232 test / 396 assert** passing (era 134/228 in V3, 206/343 in V4 Step 1)
- ~10 sezioni organizzate: matematica pura, routing pickNextFloor, citofono,
  accessibility, contrasto WCAG, bug corner cases, QoL settings, micro-animazioni,
  performance, a11y ARIA, merge geometry helper
- Esporta risultati JSON con un bottone (`Esporta risultati JSON`)
- CI GitHub Actions con 2 job paralleli: `check` (sintassi + brace balance) +
  `tests` (validazione statica presenza namespace + conteggio test)
- **`window.BossHotelPure`** — namespace esposto alla fine di `elevator.html` con 30+ funzioni pure (V2 Step 12 + V3/V4 Steps). Nessun side-effect, nessuna dipendenza da `state`/`scene`/`THREE`. Include helper `applyLangToDOM`/`setLang`/`applyAriaLabels` (V4 Step 3 test cross-iframe) e `mergePlanes` (V4 Step 5 helper geometry)
- **`tests.html`** — file standalone che carica `elevator.html` in iframe sandbox (`allow-same-origin allow-scripts`) ed esegue **232 test (396 assert vanilla)** su `iframe.contentWindow.BossHotelPure`. Organizzati in ~50 sezioni (`describe` block): helper matematici, routing, configur, citofono, accessibility, corner case UX, settings QoL, micro-animazioni, performance, **a11y ARIA attributes** (V4), **mergePlanes helper** (V4)

---

## 🎮 Demo

Il progetto è deployato come sito statico pubblico:

🔗 **https://hve0n8mdm4ixk.space.minimax.io**

Apri il link → click su "Entra nell'ascensore" → muovi il mouse per guardare intorno → clicca sui numeri del pannello touch per selezionare un piano.

---

## 🕹️ Come si usa

### Comandi mouse + tastiera

| Azione | Tasto |
|---|---|
| Entra / attiva mouse-look | Click iniziale |
| Ruota visuale | Mouse |
| Esci dal mouse-look | `ESC` |
| Premi pulsanti del pannello | Click |
| **Esci / rientra cabina** | `E` (o ↗ sul pannello, o ↙ HUD vicino alle porte) |
| Movimento nel corridoio | `W` `A` `S` `D` |
| Toggle audio effetti | `M` |
| Toggle annunci vocali | `V` |
| Toggle modalità notte | `N` |
| **Chiama un piano** | `1`–`9` / `0` (anche tastierino numerico) |
| **Fuori servizio** | `O` (toggle manutenzione) |
| **Comando vocale** | `K` (toggle speech-to-text) |
| **Apri / rivedi tutorial** | `?` (5 step contestuali al primo avvio) |
| **Modalità manutentore** | `Shift+M` (debug + wireframe + teletrasporto) |
| **Personalizza hotel** | `H` (9 campi editabili + 4 preset, salvataggio in `localStorage`) |
| **Lingua IT / EN** | `L` (toggle live, persistenza in `localStorage.bossHotelLang@v1`) |

### Flusso tipico
1. Click su "Entra nell'ascensore" → il mouse viene "catturato" (pointer lock)
2. Sei al piano Terra, vedi l'interno della cabina, le porte sono aperte
3. Gira la testa verso sinistra → vedi il pannello con il display touch
4. Clicca su una cella della griglia (es. "5") → la cabina parte
5. Il display mostra "▲ IN SALITA", senti "Piano quinto, prego"
6. All'arrivo: countdown chiusura porte → porte si chiudono
7. Vuoi scendere? Click su un altro piano
8. Vuoi uscire? Click sul tasto ↗ (verde) in alto a destra del pannello, oppure premi `E`
9. Nel corridoio, usa WASD per esplorare, premi `E` vicino alle porte per rientrare

---

## 🛠️ Stack tecnico

- **Three.js r160** (via CDN con importmap)
- **WebGL** per il rendering 3D
- **Canvas 2D API** per le texture dinamiche (display touch, pannello pubblicitario, cartelli)
- **Web Audio API** per effetti sonori sintetizzati (beep, chime, allarme)
- **Web Speech API** per gli annunci vocali TTS
- **Pointer Lock API** per il mouse-look FPS
- **HTML5 + CSS3** per l'HUD overlay

**Nessuna build step, nessun bundler, nessuna dipendenza npm.** È un singolo file HTML statico.

---

## 📁 Struttura del progetto

```
.
├── elevator.html          # File principale (~390 KB, ~10.500 righe) — tutta la simulazione
├── tests.html             # Test framework (232 test / 396 assert vanilla su window.BossHotelPure)
├── scripts/
│   ├── check-balance.js   # Verifica sintassi JS + brace balance (autorevole)
│   ├── find-long-fns.js   # Helper per audit D24 (funzioni >=150 righe)
│   ├── generate-changelog.js  # Auto-genera CHANGELOG.md dalla history git (D26)
│   ├── extract-strings.js # Estrae chiavi STRINGS per audit i18n
│   └── extract-js.js      # Estrae funzioni JS per analisi esterna
├── dist/
│   └── index.html         # Build per il deploy (copia di elevator.html)
├── .github/
│   └── workflows/
│       └── ci.yml         # CI: 2 job paralleli (check sintassi + tests)
├── README.md              # Questo file
└── PIANO_MIGLIORAMENTI.md # Documento di design (fasi implementate)
```

Il progetto è **monolitico per design**: tutto il codice (HTML, CSS, JS) sta in un unico file per massima portabilità e facilità di deploy. Il file è organizzato internamente in sezioni numerate e commentate. `tests.html` e `.github/workflows/` sono gli unici file accessori (rispettivamente DX e CI).

---

## 🏗️ Architettura

### Sezioni del codice (in ordine)

1. **HTML head** — meta, favicon, CSS per HUD overlay
2. **HTML body** — struttura HUD (topbar, crosshair, status, mode badge, bottoni azione)
3. **Importmap** — alias per `three` da CDN
4. **CONFIGURAZIONE** — costanti (CABIN, NUM_FLOORS, FLOOR_HEIGHT, ecc.)
5. **STATO GLOBALE** — oggetto `state` + `hoveredBtn` (dichiarati in cima per evitare TDZ)
6. **SCENA, RENDERER, CAMERA** — setup Three.js
7. **ILLUMINAZIONE** — ambient + ceiling + fill + alarm lights
8. **TEXTURE PROCEDURALI** — brushed metal, marble, ceiling (generate via canvas 2D)
9. **CABINA** — geometria base (pavimento, soffitto, pareti, specchio, maniglione)
10. **DETTAGLI PREMIUM CABINA** — Fase 1: profili, battiscopa, giunti, telecamera, citofono, targhe
11. **PANNELLO PUBBLICITARIO** — Fase 2: display laterale con 5 schermate rotanti
12. **CORRIDOIO + ARREDI TEMATICI** — corridoio del piano + costruzione arredi
13. **PULSANTIERA MODERNA DIGITALE** — Fase 3: display touch + 4 tasti fisici
14. **RENDER DEL DISPLAY TOUCH** — funzione `drawModernDisplay()` + logica meteo
15. **FUNZIONI DI STATO** — `updateFloorDisplay`, `lightButton`, `lightFloorButton`
16. **AUDIO** — Web Audio per beep/chime/allarme/door
17. **ANNUNCI VOCALI TTS** — Web Speech API, `speak`, `announceArrival`, ecc.
18. **MOVIMENTO CABINA** — animazione fluida tra piani con easing
19. **ANIMAZIONE PORTE** — coroutines per apertura/chiusura
20. **ALLARME** — toggle, luci rosse, sirena
21. **ESCI/RIENTRA** — gestione stato `playerInCabin`
22. **RAYCASTING & CLICK PULSANTI** — logica di interazione con celle touch + tasti fisici
23. **POINTER LOCK** — mouse-look first-person
24. **MOVIMENTO FPS** — WASD + collisioni nel corridoio
25. **LOOP** — render loop con tutti i tick (display, ads, luci, vibrazione, ecc.)
26. **AVVIO** — inizializzazione + start screen
27. **BOSS HOTEL PURE** — namespace `window.BossHotelPure` con 30+ funzioni pure testabili (Polish Pack V2 Step 12 + V3 Step 1–5)

### Modello dati principale

```js
const state = {
  currentFloor: 0,        // piano attuale (0 = Terra)
  targetFloor: 0,         // piano di destinazione durante il movimento
  isMoving: false,        // cabina in movimento
  doorsOpen: false,       // porte aperte
  doorsActual: 0,         // 0 = chiuso, 1 = aperto (per animazione fluida)
  alarmOn: false,         // allarme attivo
  outOfOrder: false,      // fuori servizio (toggle O)
  requestedFloors: Set,   // coda piani richiesti
  playerInCabin: true,    // true = prima persona nella cabina
  nightMode: false,       // Fase 8
  passengers: 1,          // indicatore carico
  vibration: 0,           // offset vibrazione cabina
  muted: false,           // mute effetti audio
  // Polish Pack V2 Step 1c/2a/2b/3: nuovi state fields
  DEBUG: false,           // assert runtime contratti state (dev only)
  irObstacleActive: false,// sensore IR anti-ostacolo (ASME A17.1 §2.13.5)
  irObstacleStart: 0,     // performance.now() inizio ostacolo
  irNudgingActive: false, // true dopo 15s di ostruzione (nudging mode)
  onboarded: false,       // true dopo tutorial contestuale prima volta
  tutorialActive: false,  // true durante overlay tutorial
  tutorialStep: 0,        // step corrente del tutorial
  lastInteractionTs: 0,   // timestamp ultima interazione (per prompt 30s)
  lang: 'it',             // lingua corrente UI ('it'|'en'), persistita
  dayPhase: 'day',        // fase giorno ('day'|'evening'|'night'), auto-update
  interphoneCalling: false, // citofono attivo (V2 Step 14, separato da SOS)
  reducedMotion: false,   // OS prefers-reduced-motion (V3 Step 1b)
  audio: { effects: 1.0, music: 0.5, tts: 0.85 },   // V3 Step 3
  display: { brightness: 1.0 },                      // V3 Step 3
  _arrivalPhase: 'normal',                           // V3 Step 4
  _fadeAlarm: { target: 0, from: 0, startMs: 0 },    // V3 Step 4
  _fadeOOO: { target: 0, from: 0, startMs: 0 },      // V3 Step 4
  _fadeInterphone: { target: 0, from: 0, startMs: 0 } // V3 Step 4
};

const HOTEL_CONFIG = {
  name: 'BOSS HOTEL', shortName: 'Boss Hotel',
  address: 'Via Veneto 142 \u00b7 Roma', city: 'Roma', country: 'Italia',
  stars: 5, established: 1898, tagline: 'Luxury since 1898',
  motto: 'Dal 1898, eleganza senza tempo.',
  systemName: 'BOSS HOTEL ELEVATOR SYSTEM', systemYear: '2026',
  edition: 'Boss Hotel Edition',
  accentGold: '#c9a55a', accentGoldDark: '#7a5a20', accentGoldLight: '#f6c945',
  panelHelpBrand: 'BOSS HOTEL'
};
```

Per il dettaglio completo di tutti i 40+ campi di `state` con `scritto da` / `letto da` / contratti, vedi `STATE.md`.

---

## 💻 Sviluppo locale

### Prerequisiti
- Un browser moderno (Chrome, Firefox, Edge aggiornati)
- Un server HTTP locale (per il modulo ES6 + importmap)

### Avvio rapido

```bash
# Con Python 3
cd /path/to/progetto
python3 -m http.server 8000
# Apri http://localhost:8000/elevator.html
```

```bash
# Con Node.js (http-server)
npx http-server -p 8000
# Apri http://localhost:8000/elevator.html
```

```bash
# Con PHP
php -S localhost:8000
```

### Modifica e test
1. Apri `elevator.html` con un editor (VS Code, Sublime, ecc.)
2. Modifica la sezione che ti interessa
3. Salva e ricarica la pagina nel browser (F5 o Cmd+R)
4. Apri la **DevTools Console** (F12) per vedere eventuali errori

> ⚠️ Il Pointer Lock e la Web Speech API funzionano solo su `http://localhost` o `https://`. Aprire il file direttamente con `file://` può dare warning.

### Test (Polish Pack V2 Step 12 + V3/V4 Steps)

Il progetto include un mini test framework vanilla in `tests.html`. Esegue **232 test (396 assert interni)** su funzioni pure esposte in `window.BossHotelPure`.

```bash
# Avvia un server locale
python3 -m http.server 8000

# Apri nel browser
# http://localhost:8000/tests.html

# I test girano automaticamente al caricamento dell'iframe.
# Risultato: banner "TUTTI I TEST PASSATI (134/134)" verde.
# Esporta JSON con il bottone "Esporta risultati JSON".
```

### Verifica sintassi + brace balance

Prima di committare, esegui il check sintattico autorevole:

```bash
node scripts/check-balance.js elevator.html
```

Output atteso: `Tutti i check autorevolativi passati.`

---

## 📤 Push su GitHub

```bash
# 1. Crea un nuovo repo vuoto su https://github.com/new (non aggiungere README/LICENSE/.gitignore)

# 2. Scarica lo zip del progetto ed estrailo
unzip boss-hotel-elevator.zip
cd boss-hotel-elevator

# 3. Inizializza git e fai il primo commit
git init
git add .
git commit -m "Initial commit: BOSS HOTEL elevator 3D simulator"

# 4. Collega il repo remoto (sostituisci <user> e <repo>)
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git

# 5. Push
git push -u origin main
```

### GitHub Pages (deploy automatico)

Dopo il push:

1. Vai su **Settings → Pages**
2. Source: **Deploy from a branch**
3. Branch: `main` / `(root)`
4. Save

Il sito sarà live in pochi minuti su `https://<user>.github.io/<repo>/`.

> Nota: il file `dist/index.html` è una copia identica di `elevator.html`. Per il deploy con GitHub Pages puoi semplicemente rinominare `elevator.html` in `index.html`, oppure creare un symlink, oppure usare direttamente `elevator.html` come entry point configurando Pages.

---

## 🚀 Deploy

Il progetto è un singolo file statico, quindi può essere deployato ovunque:

### Opzione 1: Spazio statico (consigliato)
Il deploy corrente usa `website_deploy` che pubblica su un URL pubblico. Il file `dist/index.html` è la copia deployata.

### Opzione 2: GitHub Pages
1. Metti `elevator.html` in un repo, rinominato in `index.html`
2. Settings → Pages → Source: `main` branch → Save
3. Apri `https://<user>.github.io/<repo>/`

### Opzione 3: Netlify / Vercel
1. Trascina la cartella del progetto sulla dashboard
2. Il sito sarà live in pochi secondi

### Opzione 4: Server proprio
Copia `elevator.html` (rinominato in `index.html`) sul web server.

---

## 🗺️ Roadmap

### 🛗 Hotfix v1.7 — 2026-09-12 (comportamento porte ADA-compliant)
- [x] **Timer differenziato per piano** — `scheduleAutoClose()` ora sceglie tra
      `DOOR_AUTO_CLOSE_MS_LOBBY = 8000` (piano T) e `DOOR_AUTO_CLOSE_MS_FLOOR = 5000`
      (piani 1-9) in base a `state.currentFloor`. Allineato alle normative ADA §407.3.5
      (car call 3-5s min) e specifiche tipiche differential door time.
- [x] **Auto-close indipendente dalla posizione del giocatore** — rimosso il guard
      `state.playerInCabin` aggiunto nel fix precedente (commit `8bbfeac`). Le porte
      si chiudono automaticamente dopo il dwell time sia dentro che fuori dalla cabina,
      come in un vero ascensore.
- [x] **Prenotazione automatica limitata al lobby** — `tickPlayer()` ora gate
      l'apertura/chiusura automatica su `state.currentFloor === 0`. Ai piani 1-9 il
      passeggero deve usare la pulsantiera ▲/▼ esterna per richiamare la cabina
      (comportamento standard).

### 🔧 Hotfix post-v1.6 — 2026-09-12 (superseded da v1.7)
- [x] ~~**Auto-close porte rispettato solo dentro la cabina** — aggiunta guardia
      `state.playerInCabin` al callback di `scheduleAutoClose()` (`elevator.html:3132`).
      Risolve il bug "annuncio vocale 'porte si stanno chiudendo' ma porte che restano
      aperte / riaprono" quando il giocatore era nel corridoio. La prenotazione
      automatica in `tickPlayer()` (~`elevator.html:4681`) è ora l'unica a gestire
      le porte fuori dalla cabina.~~ **Sostituito dal comportamento più realistico
      di v1.7** (auto-close + prenotazione lobby-only).

### 🎉 Polish Pack V2 — **CHIUSO 2026-09-17** (10/13 step, 77%)
- [x] **Step 1** Salute del codice — CI GitHub Actions + `AGENTS.md` + audit `state` (STATE.md, 26+ campi) + mini event bus homemade
- [x] **Step 2** UX invisibile — sensore IR anti-ostacolo (ASME A17.1 §2.13.5) + tutorial contestuale prima volta (5 step, tasto `?`, prompt inattività 30s)
- [x] **Step 3** Audio contestuale corridoi + musica ristorante — 4 temi corridoio (3 layer ciascuno) + chitarra classica + piatti al piano 8
- [x] **Step 4** Meteo evoluto — stagionalità mensile (clima Roma) + 3 nuove condizioni (grandine, foschia, vento) + slide 24h con previsioni
- [x] **Step 5** Personalizzazione hotel — `HOTEL_CONFIG` (17 campi, refactor 23 stringhe hardcoded) + HUD overlay tasto `H` + 4 preset (Boss Hotel / Sky Tower Tokyo / Hôtel de Paris / Burj Al Arab) + persistenza `localStorage.bossHotelConfig@v1`
- [ ] **Step 6** PWA installabile (saltato) — vedi `PIANO_V2.md` per razionale
- [x] **Step 7** Pulsantiera ▲/▼ semantica — coda `{floor, direction}` invece di Set + helper queueNextSmart (serve stessa direzione, poi inversione automatica) + visualizzazione intenzione su cartello + icona ↻ su pulsantiera esterna
- [x] **Step 8** i18n IT/EN — `STRINGS[lang]` dictionary (~120 chiavi) + Tasto L toggle + bottone UI IT/EN + auto-detect navigator.language + persistenza `localStorage.bossHotelLang@v1` + TTS en-GB prioritaria + helper `t(key)` + `applyLangToDOM()` consolidata + refactor HTML statico → generazione dinamica (panel-help, start screen, customizer, tutorial, maintenance overlay) + tutti gli annunci/subtitle/status italiani tradotti
- [x] **Step 9** Sensazioni realistiche cabina (vibrazione multi-band + crossfade freccia 200ms + frenata/acc progressiva easeInOutCubic + weesh sincronizzato) — originariamente era "Shaft dietro le quinte" ma ripensato perché non visibile in prima persona. Sostituito con feature percepibili dal giocatore.
- [x] **Step 10** Vita dell'hotel (NPC passeggeri + suoni contestuali corridoio + ciclo giorno/notte + log manutenzione realistica) — originariamente era "Eventi speciali hotel" (matrimonio/conferenza) ma ripensato per dare game value al simulatore first-person (decorazioni corridoio visibili solo uscendo dalla cabina, narrative debole). Sostituito con 4 feature coordinabili che danno vita al simulatore.
- [ ] **Step 11** L-block parametrico (rinviato a V3+)
- [x] **Step 12** Test framework leggero — `window.BossHotelPure` namespace (13 funzioni pure) + `tests.html` (47 assert vanilla, 12 sezioni, iframe sandbox + reporter DOM + export JSON) + secondo job CI `tests` per validazione statica. Branch `feature/v2-step-12-tests`. Decisioni: Q12.1=C, Q12.2=A, Q12.3=A, Q12.4=B (47 > 30), Q12.5=C.
- [ ] **Step 13** WebXR / multi-cabina (rinviato long-term)
- [x] **Step 14** Citofono interattivo (EN 81-28) + pairing SOS — `phoneBtn` cliccabile (click → lampeggio verde 4Hz 5s + TTS "Chiamata in corso. Attendere prego." + voce reception simulata a 2s). Stato `state.interphoneCalling` separato da `state.alarmOn`. Persistenza `bossHotelPrefs@v1`. Nuova riga HUD manutentore. 6 test in `tests.html` (totale 53). Branch `feature/v2-step-14-interphone`. Decisioni: Q14.1=C, Q14.2=B, Q14.3=B, Q14.4=B, Q14.5=B.

**Decisioni D-key** (10 contratti di progetto, vedi `AGENTS.md`):
D1 single-file · D2 stato in cima · D3 no emoji · D4 italiano+sezioni · D5 HOTEL_CONFIG · D6 config prime texture · D7 coda `{floor,direction}` · D8 STRINGS[lang] · D9 BossHotelPure · D10 citofono/SOS distinti.

**Lessons learned V2** (input per V3): 10 insegnamenti in `PIANO_V2.md` §Stato finale. Punti chiave: decisioni via `question` funzionano, test framework cross-step, commit separati, D-key emergono organicamente, scope creep elevato (accettare riscritture).

### 🎨 Polish Pack V3 — **CHIUSO 2026-09-23** (9/9 step, 100%) — vedi `PIANO_V3.md`
- [x] **Step 1** Accessibility (T1a) — `speakWithSubtitle()` + `prefers-reduced-motion` + focus ring dorato + contrasto WCAG AA. Branch `feature/v3-step-1-accessibility`.
- [x] **Step 2** Bug fix UX sistematico (T1b) — 5 corner case + 4 bug latenti (4 fix, 1 "leave alone"). Branch `feature/v3-step-2-bugfix-ux`.
- [x] **Step 3** Settings QoL (T1c) — 4 slider (volume effetti/musica/TTS + luminosità display) + export JSON. 2 chiavi localStorage @v1. Branch `feature/v3-step-3-settings-qol`.
- [x] **Step 4** Micro-animazioni (T2a) — respiro pulsantiera, cartello lampeggio gentile pre-arrivo, fade stati 200ms, bounce-out vibrazione. Branch `feature/v3-step-4-micro-animations`.
- [x] **Step 5** Performance (T2b) — `textureCache` LRU capacity 10 + `mergeGeometries` (8 draw call saved) + skip no-op costosi + bottone benchmark in maintenance overlay. Branch `feature/v3-step-5-performance`.
- [x] **Step 6** QoL manutenzione (T2c) — log eventi categorizzato + contatori allarmi/interphonate. Branch `feature/v3-step-6-qol-maintenance`.
- [x] **Step 7** Documentazione completa (T3a) — commenti narrativi su `tickMove`/`tickDoors`/`tickPlayer`/`buildCorridor`/`getThemeForFloor` + diagrammi ASCII dipendenze + `STRINGS[lang]` reference. Branch `feature/v3-step-7-documentation`.
- [x] **Step 8** Test coverage estesa (T3b) — 134 → 206 test (casi limite routing, edge cases passeggeri, integrazione, helper citofono, stress test, state invariant check). Branch `feature/v3-step-8-test-coverage`.
- [x] **Step 9** Mobile responsive layout (Bonus) — touch controls, HUD scalato, landscape forzato, pulsantiera touch adattata. Branch `feature/v3-step-9-mobile`.

### 🎉 Polish Pack V4 — **CHIUSO 2026-09-25** (6/6 step, 100%) — vedi `PIANO_V4.md`
- [x] **Step 1** Test exposure gap (T1a) — chiuso senza modifiche al codice (audit obsoleto): tutte le 32 funzioni `pure:` erano già esportate da V2/V3. Decisione via `question`: chiudere come ✅ fatto.
- [x] **Step 2** Routing bug fix (T1b) — `pickNextFloor`/`queueNextSmart` con inversione asimmetrica look algorithm: `lastDir='up'`+invert → MAX della coda down; `lastDir='down'`+invert → MIN della coda up. 4 test esistenti aggiornati + 6 nuovi. D22 introdotto. Branch `feature/v4-step-2-routing-bug`.
- [x] **Step 3** A11y aria attributes (T1c) — 19 `aria-label` localizzati IT/EN su bottoni HUD + 4 `aria-hidden` su decorativi + 2 live region con `role="status" aria-live="polite"` (`#subtitle`, `#mode-badge`) + 2 role specializzati (`alertdialog` su rotate-overlay, `application` su virtual-joystick). Nuovo helper `applyAriaLabels()` chiamato da `applyLangToDOM()` su init + cambio lingua. 15 nuovi assert. D23 introdotto. Branch `feature/v4-step-3-a11y-aria`.
- [x] **Step 4** Funzioni lunghe + commenti (T2a) — 2 split minimi (`buildCorridor` 178→76, `startCorridorAudio` 156→50) + 16 commenti narrativi stile V3 Step 7 sulle funzioni ≥80 righe. Target "nessuna funzione ≥150" raggiunto. Nuovo helper `scripts/find-long-fns.js` con brace-counting corretto. D24 introdotto. Branch `feature/v4-step-4-fn-comments`.
- [x] **Step 5** Helper `mergePlanes` DRY (T2b) — nuovo helper `mergePlanes(transforms, material, useGroups=false)` che clona geometries (non muta input) e applica `applyMatrix4`+`mergeGeometries`. 3 callsites refactorati (3 pareti + 4 LED + 4 frame). 6 nuovi assert (espone in `BossHotelPure`). D25 introdotto. Branch `feature/v4-step-5-merge-planes`.
- [x] **Step 6** Open source boilerplate (T3a) — `LICENSE` MIT aggiornato (copyright Amedeo Vecchi 2026), `CHANGELOG.md` auto-generato da `scripts/generate-changelog.js` (~85 righe parser `git log` con regex euristiche V1..V4), `CONTRIBUTING.md` comprehensive (~110 righe con D-key contracts D1-D26 + workflow Polish Pack + code style). D26 introdotto. Branch `feature/v4-step-6-os-boilerplate`.

**Decisioni D-key** (26 contratti totali, vedi `AGENTS.md` per dettagli):
- V1 (D1-D6): single-file · stato in cima · no emoji · italiano+sezioni · HOTEL_CONFIG · config prime texture
- V2 (D7-D11): coda `{floor,direction}` · STRINGS[lang] · BossHotelPure · citofono/SOS distinti · speakWithSubtitle
- V3 (D12-D16): prefers-reduced-motion · bug latenti documentati · settings QoL 2 chiavi @v1 · micro-animazioni + movePaused · textureCache LRU + mergeGeometries
- V4 (D22-D26): routing inversione asimmetrico · A11y ARIA · funzioni <150 + commenti · mergePlanes helper · open source boilerplate

### 🎉 Polish Pack v1.6 — completato 2026-09-12 (branch `feature/polish-pack-v1.6`)
- [x] **#13** Verifica accessibilità tastiera nel corridoio (audit `WASD` + tasti 1-9, reset `keys` in exit/enter cabina)
- [x] **#14** Logica passeggeri coerente (sostituisce random 8s con `adjustPassengersForFloor` tematico)
- [x] **#18** Caching canvas offscreen per il display touch (3 layer: statico/semi-statico/dinamico)

### ✅ Polish Pack v1.5 — completato 2026-09-12 (branch `feature/polish-pack-v1.5`)
- [x] **#21b** Pulsantiera di chiamata esterna ▲/▼ nel corridoio (aggiunta durante audit UX)
- [x] **#22** Chiusura automatica porte dopo 6s di inattività (comportamento ascensore reale)
- [x] 8 bug fix emersi durante il playtest di #21b/#22 (vedi `piani/README.md`)

### ✅ Polish Pack v1.4 — completato (2026-09-12)
- [x] **#2** Musica di sottofondo contestuale (jazz lobby T-3, classica 4-9, silenzia su allarme/OOO)
- [x] **#9** Comando vocale "piano N" / "cinque" → `SpeechRecognition` it-IT (tasto `K`)
- [x] **#19** Modalità manutentore `Shift+M` (wireframe cabina + FPS/drawcalls + teletrasporto)
- [x] **#20** Prenotazione cabina automatica quando ti avvicini (<1m), display "PRENOTATA"

### Backlog residuo post-v1.6
- [x] **#12** Lingua selezionabile (IT/EN) — ✅ completato in Polish Pack V2 **Step 8** (sett 2026). `STRINGS[lang]` dictionary, TTS en-GB, tasto L toggle, persistenza `localStorage.bossHotelLang@v1`, refactor HTML statico → generazione dinamica via helper `t(key)` + `applyLangToDOM()`. ~120 chiavi tradotte, copertura 100% di tutti i testi UI (HUD, tutorial, customizer, display touch, manutentore, annunci TTS, subtitle).

> Polish Pack v1.5 ha consegnato solo il sottoinsieme "bonus audit UX" (#21b, #22) + 8 bug fix.
> Le 3 feature pianificate originali (#13, #14, #18) sono confluite nel **Polish Pack v1.6**
> (branch `feature/polish-pack-v1.6`) e completate. **22/22 funzionalità implementate (100%)**;
> backlog residuo = 1 sola feature (#12 i18n, alto sforzo, fuori scope).

### 🔧 Hotfix post-v1.4 (2026-09-12)
- [x] **Display touchscreen passo-passo** — durante il movimento il grande numero (130 px)
      mostra il piano **attualmente attraversato** (non fisso sul piano di partenza),
      con indicatore "X → Y" sotto. Allinea display touchscreen a cartello corridoio
      e strip HUD. Commit `e02adca`.

### Backlog originale §9 (long-term)
- [ ] Più di 10 piani (parametrico)
- [ ] Multi-cabina (ascensori A/B)
- [ ] Modalità multiplayer (più utenti nella stessa cabina)
- [ ] Personalizzazione hotel (nome, indirizzo, tema)
- [ ] Visualizzazione "dietro le quinte" del vano ascensore (shaft)
- [ ] Supporto VR (WebXR)
- [ ] Texture HD per gli arredi (al momento sono procedurali per performance)

Dettaglio completo in `PIANO_MIGLIORAMENTI.md` §11 e `piani/README.md`.

---

## 🤝 Contribuire

Il progetto è open source (MIT). Vedi [`CONTRIBUTING.md`](./CONTRIBUTING.md) per la guida
contributor completa (quick start, contratti D-key 1-26, workflow Polish Pack, code style).

In sintesi:

1. Fai una fork
2. Crea un branch dedicato (`git checkout -b feature/vN-step-M-descrizione`)
3. Committa le modifiche con messaggi strutturati (`type(scope): descrizione`)
4. Pusha il branch e apri una Pull Request

### Linee guida
- Mantieni il pattern "single file HTML" (D1) — vincolo architetturale
- Commenta le sezioni nuove in modo simile a quelle esistenti (D4: italiano + sezioni `// =====`)
- Testa le performance (FPS) prima di aggiungere feature pesanti
- Aggiungi nuovi helper puri a `window.BossHotelPure` + test in `tests.html` (D9)
- Aggiorna `AGENTS.md` se introduci un nuovo D-key
- Aggiorna `PIANO_MIGLIORAMENTI.md` se cambi il design

---

## 📚 Documentazione

Documenti di progetto (in ordine di importanza):

| File | Contenuto |
|---|---|
| `README.md` | Overview, features, demo, comandi, deploy, roadmap |
| `LICENSE` | MIT + copyright Amedeo Vecchi 2026 |
| `CHANGELOG.md` | Storico versioni auto-generato da `git log` (191 commit V1..V4) |
| `CONTRIBUTING.md` | Guida contributor + D-key contracts D1-D26 + workflow Polish Pack |
| `AGENTS.md` | Regole progetto + 26 contratti D-key + layout codice |
| `ARCHITECTURE.md` | Diagrammi architetturali e flussi dati |
| `STATE.md` | Audit completo dello `state` globale (26+ campi) |
| `STRINGS_REFERENCE.md` | Mappatura completa i18n IT/EN (~120 chiavi) |
| `STRINGS_TABLE.md` | Tabella compatta chiavi i18n |
| `PIANO_MIGLIORAMENTI.md` | Log implementativo dettagliato fasi 1-27 (160 KB) |
| `PIANO_V2.md` / `PIANO_V3.md` / `PIANO_V4.md` | Roadmap Polish Pack V2/V3/V4 |
| `piani/README.md` | Indice storico piani di implementazione originali |

Documenti di community:

| File | Contenuto |
|---|---|
| `SECURITY.md` | Politica di sicurezza (responsible disclosure) |
| `CODE_OF_CONDUCT.md` | Standard community (Contributor Covenant v2.1) |
| `SUPPORT.md` | Dove chiedere aiuto / segnalare bug |

---

## 📝 License

MIT License — vedi [`LICENSE`](./LICENSE).

Copyright (c) 2026 Amedeo Vecchi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

---

## 🎓 Crediti

- **Three.js r160** — [https://threejs.org](https://threejs.org) (MIT)
- **Web Speech API** — Browser native (TTS annunci)
- **Web Audio API** — Browser native (audio contestuale)
- **BufferGeometryUtils** — three.js addons (merge geometries)
- **Design & implementazione** — Amedeo Vecchi
- **Documentazione di design** — `PIANO_MIGLIORAMENTI.md`

---

**Buon viaggio in ascensore!** 🛗✨
