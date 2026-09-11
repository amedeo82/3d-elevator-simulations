# BOSS HOTEL — Simulatore Ascensore 3D

Una simulazione 3D realistica e interattiva di un ascensore d'hotel a 5 stelle, in prima persona, costruita interamente con Three.js in un singolo file HTML.

![BOSS HOTEL](https://img.shields.io/badge/Three.js-r160-black?logo=three.js) ![Status](https://img.shields.io/badge/Status-Stable-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue)

🔗 **Demo live**: https://hve0n8mdm4ixk.space.minimax.io

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

Il tutto in **un singolo file HTML** di ~120KB, deployato staticamente, senza dipendenze npm.

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
- Sezione meteo con icona animata (sole, nuvole, pioggia, neve, temporale, nebbia)
- **Mappa edificio stilizzata** con 10 quadratini (cabina evidenziata in movimento)
- **Griglia touch 3×4** con celle per i piani 9..1 + T (Terra)
- Hover visivo (cella si "sporge in avanti" + evidenziata sul display)
- **4 tasti fisici** conservati: ◄| (apri), |► (chiudi), STOP, ! (allarme)
- Tasto ↗ Esci dalla cabina (visibile solo a porte aperte)

### 🚪 Porte scorrevoli
- Due ante che scorrono verso l'esterno
- Animazione realistica con easing
- Countdown 3..2..1 prima della chiusura con beep a tono crescente
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
├── elevator.html          # File principale (~120 KB) — tutta la simulazione
├── dist/
│   └── index.html         # Build per il deploy (copia di elevator.html)
├── README.md              # Questo file
└── PIANO_MIGLIORAMENTI.md # Documento di design (fasi implementate)
```

Il progetto è **monolitico per design**: tutto il codice (HTML, CSS, JS) sta in un unico file per massima portabilità e facilità di deploy. Il file è organizzato internamente in sezioni numerate e commentate.

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

### Modello dati principale

```js
const state = {
  currentFloor: 0,        // piano attuale (0 = Terra)
  targetFloor: 0,         // piano di destinazione durante il movimento
  isMoving: false,        // cabina in movimento
  doorsOpen: false,       // porte aperte
  doorsActual: 0,         // 0 = chiuso, 1 = aperto (per animazione fluida)
  alarmOn: false,         // allarme attivo
  requestedFloors: Set,   // coda piani richiesti
  playerInCabin: true,    // true = prima persona nella cabina
  nightMode: false,       // Fase 8
  passengers: 1,          // indicatore carico
  vibration: 0,           // offset vibrazione cabina
  muted: false            // mute effetti audio
};
```

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

Possibili miglioramenti futuri (non implementati):

- [ ] Più di 10 piani (parametrico)
- [ ] Multi-cabina (ascensori A/B)
- [ ] Musica di sottofondo (rilassante jazz nella lobby)
- [ ] Effetto "shake" durante il movimento per dare più "peso"
- [ ] Modalità multiplayer (più utenti nella stessa cabina)
- [ ] Personalizzazione hotel (nome, indirizzo, tema)
- [ ] Visualizzazione "dietro le quinte" del vano ascensore (shaft)
- [ ] Supporto VR (WebXR)
- [ ] Texture HD per gli arredi (al momento sono procedurali per performance)

---

## 🤝 Contribuire

Il progetto è open source. Per contribuire:

1. Fai una fork
2. Crea un branch per la tua feature (`git checkout -b feature/AmazingFeature`)
3. Committa le modifiche (`git commit -m 'Add some AmazingFeature'`)
4. Pusha il branch (`git push origin feature/AmazingFeature`)
5. Apri una Pull Request

### Linee guida
- Mantieni il pattern "single file HTML" se possibile
- Commenta le sezioni nuove in modo simile a quelle esistenti
- Testa le performance (FPS) prima di aggiungere feature pesanti
- Aggiorna il `PIANO_MIGLIORAMENTI.md` se cambi il design

---

## 📝 License

MIT License

Copyright (c) 2026 BOSS HOTEL Simulator

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

- **Three.js** — https://threejs.org (MIT)
- **Web Speech API** — Browser native
- **Web Audio API** — Browser native
- **Design & implementazione** — BOSS HOTEL team
- **Documentazione di design** — `PIANO_MIGLIORAMENTI.md`

---

**Buon viaggio in ascensore!** 🛗✨
