# STRINGS_REFERENCE — Mappatura completa i18n IT/EN

> Documento di riferimento per la mappatura completa delle stringhe UI
> (Polish Pack V3 Step 7, Q7.4). Complementa `STRINGS_TABLE.md` (tabella
> generata automaticamente) con sezioni raggruppate per dominio + contesto
> d'uso + contratti D-key.

## Indice

1. [Come funziona il sistema i18n](#1-come-funziona-il-sistema-i18n)
2. [Sezioni per dominio](#2-sezioni-per-dominio)
   - [Cabin / stato cabina](#cabin--stato-cabina)
   - [Maintenance overlay](#maintenance-overlay)
   - [Personalizza hotel (H)](#personalizza-hotel-h)
   - [Settings QoL](#settings-qol)
   - [Pulsantiera / display touch](#pulsantiera--display-touch)
   - [Tutorial contestuale](#tutorial-contestuale)
   - [Cartello corridoio](#cartello-corridoio)
   - [Pubblicità / advertising](#pubblicità--advertising)
   - [Slide start screen](#slide-start-screen)
   - [Meteo live](#meteo-live)
   - [Generici HUD / badge](#generici-hud--badge)
3. [Tabella completa auto-generata](#3-tabella-completa-auto-generata)
4. [Convenzioni e contratti D-key](#4-convenzioni-e-contratti-d-key)

---

## 1. Come funziona il sistema i18n

```
   STRINGS = { it: {...}, en: {...} }      <-- single source of truth
        |
        v
   STRINGS[state.lang].<key>             <-- access runtime via lang
        |
        +---> applyLangToDOM()           <-- popola HTML statico (start, panel-help, ecc.)
        +---> refreshSettingsQoLLabels() <-- popola slider Settings QoL
        +---> refreshLangSwitch()        <-- bottone IT/EN toggle
        +---> (inline) speak(txt, {lang}) <-- TTS multilingua
```

- **Default**: `state.lang = 'it'` (pubblico primario del progetto).
- **Auto-detect**: `loadLang()` legge `navigator.language` al primo avvio.
- **Persistenza**: `bossHotelLang` in localStorage (V2 Step 8b).
- **Toggle runtime**: tasto `L` oppure click su `#langSwitch` nel topbar.

---

## 2. Sezioni per dominio

### Cabin / stato cabina

| Chiave | IT | EN | Contesto |
|---|---|---|---|
| `cabinIdle` | Cabina ferma | Cabin idle | Status bar quando state.isMoving=false |
| `cabinMode` | In cabina | In cabin | Maintenance overlay `m-mode` |
| `corridorMode` | Nel corridoio | In corridor | Maintenance overlay `m-mode` |
| `inCabinBadge` | Dentro la cabina | Inside the cabin | `#mode-badge` quando playerInCabin=true |
| `inCorridorBadge` | Nel corridoio | In the corridor | `#mode-badge` quando playerInCabin=false |
| `doorClosing` | Porta in chiusura | Door closing | Subtitle quando le porte si chiudono |
| `floorClosing` | CHIUSURA | CLOSING | Cartello dinamico |
| `floorOpening` | APERTURA | OPENING | Cartello dinamico |
| `floorInQueue` | PIANO IN Coda | FLOOR IN Queue | Cartello con prossima destinazione |
| `moving` | IN VIAGGIO | IN TRANSIT | Cartello generico durante movimento |
| `movingUp` | IN SALITA | GOING UP | Freccia ▲ |
| `movingDown` | IN DISCESA | GOING DOWN | Freccia ▼ |
| `direction` | Direzione | Direction | Label generico direzione |
| `queue` | Coda | Queue | Maintenance overlay `m-queue` |
| `passengers` / `pass` | Passeggeri | Passengers | Maintenance overlay `m-pax` |
| `arrivalIt` | Piano | Floor | Prefix annuncio vocale IT |
| `arrivalPrefix` | Piano | Floor | Prefix annuncio vocale generico |
| `arrivalSuffix` | — | — | Riservato (non usato) |
| `arrivingAtFloor` | Piano | Floor | Annuncio arrival |

### Maintenance overlay

| Chiave | IT | EN | Contesto |
|---|---|---|---|
| `maintTitle` | MANUTENZIONE | MAINTENANCE | Title overlay |
| `maintFps` | FPS | FPS | Row `m-fps` |
| `maintCalls` | Draw calls | Draw calls | Row `m-dc` |
| `maintFloor` | Piano | Floor | Row `m-floor` |
| `maintTarget` | Target | Target | Row `m-target` |
| `maintQueue` | Coda | Queue | Row `m-queue` |
| `maintPax` | Passeggeri | Passengers | Row `m-pax` |
| `maintMode` | In cabina | In cabin | Row `m-mode` |
| `maintOOO` | Out-of-order | Out-of-order | Row `m-ooo` |
| `maintInterphone` | Citofono | Interphone | Row `m-interphone` |
| `maintEvents` | Eventi | Events | Section events |
| `maintHint` | Shift+M esce · 1-9 teletrasporto | Shift+M to exit · 1-9 to teleport | Hint in fondo |
| `maintEventSeeded` / `maintEventReset` / `maintEventLoop` | [seeded] / [reset] / [loop] | (stesso) | Tag eventi log |
| `maintBenchmark` | Benchmark 5s | Benchmark 5s | Bottone benchmark |
| `maintBenchmarkIdle` | Idle | Idle | Risultato benchmark |
| `maintBenchmarkMoving` | In movimento | Moving | Risultato benchmark |
| `maintBenchmarkRunning` | Benchmark... | Benchmarking... | Status durante benchmark |
| `maintBenchmarkDone` | Benchmark completato | Benchmark complete | Status fine benchmark |
| `maintFilter` | Filtro | Filter | Label filter buttons |
| `maintCatCabin` / `maintCatDoor` / `maintCatAudio` / `maintCatState` / `maintCatMaint` | Cabina / Porte / Audio / Stato / Manut. | Cabin / Door / Audio / State / Maint. | Toggle buttons filter (V3 Step 6 D17) |
| `maintAlarmCount` | Allarmi (totale) | Alarms (total) | Counter vita allarmi |
| `maintInterphoneCount` | Citofono (totale) | Interphone (total) | Counter vita citofono |
| `maintSevInfo` / `maintSevWarn` / `maintSevError` | info / warn / err | info / warn / err | Severity icon label |
| `maintHistoryEmpty` | Nessun evento | No events | Fallback history empty |

### Personalizza hotel (H)

| Chiave | IT | EN |
|---|---|---|
| `customizeTitle` | PERSONALIZZA HOTEL | CUSTOMIZE HOTEL |
| `customizeHint` | H per aprire/chiudere · Esc per chiudere · preset per cambiare hotel.<br>Applica e salva riavvia la pagina per aggiornare tutte le texture 3D. | H to open/close · Esc to close · presets to switch hotel.<br>Apply and save reloads the page to update all 3D textures. |
| `customizeApply` | Applica e salva | Apply and save |
| `customizeReset` | Ripristina default | Reset defaults |
| `customizeClose` | Chiudi | Close |
| `customizeLabelName` / `customizeLabelShort` / `customizeLabelAddr` / `customizeLabelCity` / `customizeLabelStars` / `customizeLabelYear` / `customizeLabelTag` / `customizeLabelMotto` / `customizeLabelColor` | Nome hotel / Nome corto / Indirizzo / Città / Stelle (1-5) / Anno fondazione / Tagline / Motivo / Colore accent | Hotel name / Short name / Address / City / Stars (1-5) / Founded year / Tagline / Motto / Accent color |
| `customizeApplied` | Configurazione salvata · Riavvio in corso... | Configuration saved · Reloading... |
| `customizeResetDone` | Default ripristinati nei campi. Premi "Applica e salva" per confermare. | Defaults restored in fields. Press "Apply and save" to confirm. |
| `customizePresetLoaded` | Preset caricato nei campi. Modifica e premi "Applica e salva". | Preset loaded in fields. Edit and press "Apply and save". |
| `customizeSaveError` | ERRORE salvataggio: | Save error: |
| `customizeResetMsg` | Default ripristinati · Riavvio in corso... | Defaults restored · Reloading... |
| `customizePresetBoss` / `customizePresetSky` / `customizePresetParis` / `customizePresetBurj` | Boss Hotel / Sky Tower Tokyo / Hôtel de Paris / Burj Al Arab | Boss Hotel / Sky Tower Tokyo / Hôtel de Paris / Burj Al Arab |

### Settings QoL

| Chiave | IT | EN |
|---|---|---|
| `settingsTitle` | Impostazioni | Settings |
| `audioSection` | Audio | Audio |
| `audioEffects` | Effetti sonori | Sound effects |
| `audioMusic` | Musica cabina | Cabin music |
| `audioTts` | Annunci vocali (TTS) | Voice announcements (TTS) |
| `audioMute` | Muto globale | Global mute |
| `displaySection` | Display | Display |
| `displayBrightness` | Luminosita' display | Display brightness |
| `settingsReset` | Ripristina default | Reset defaults |
| `settingsSaved` | Impostazioni salvate | Settings saved |
| `settingsExportReady` | Esporta stato | Export state |

### Pulsantiera / display touch

| Chiave | IT | EN |
|---|---|---|
| `outOfService` | FUORI SERVIZIO | OUT OF SERVICE |
| `floorStripLabel` | PIANO | FLOOR |
| `operator` | OPERATORE | OPERATOR |
| `doorOpen` | APRI | OPEN |
| `doorClose` | CHIUDI | CLOSE |
| `exit` | ESCI | EXIT |
| `reenter` | RIENTRA | ENTER |
| `stopAlarm` | STOP | STOP |
| `sos` | SOS | SOS |
| `alarm` | ALLARME | ALARM |
| `interphone` | CITOFONO | INTERPHONE |
| `callDisabledTop` | Sei al piano piu' alto | You are on the top floor |
| `callDisabledBottom` | Sei al piano Terra | You are on the ground floor |
| `audioOn` / `audioOff` | Audio: ON / Audio: OFF | Audio: ON / Audio: OFF |
| `voiceOn` / `voiceOff` | Voce: ON / Voce: OFF | Voice: ON / Voice: OFF |
| `nightModeOn` / `nightModeOff` | Notte: ON / Notte: OFF | Night: ON / Night: OFF |
| `oooOn` / `oooOff` | Fuori servizio: ON / Servizio ripristinato | Out of service: ON / Service restored |
| `outOfOrder` | Fuori servizio | Out of order |
| `nightMode` | Modalita' notte | Night mode |
| `audio` / `tts` | Audio / TTS | Audio / TTS |
| `calledFloor` | (template) Chiamato piano X | Floor X called |
| `voiceNotUnderstood` | (template) Voce: non ho capito "X" | Voice: I did not understand "X" |
| `voiceHeardNotInCabin` | (template) Voce: "X" ricevuto (devi essere in cabina) | Voice: "X" received (you must be in cabin) |
| `elevatorRestored` | Ascensore ripristinato | Elevator restored |
| `elevatorOutOfService` | Ascensore in manutenzione | Elevator under maintenance |
| `pressORestore` | Premere O per ripristinare | Press O to restore |
| `queueAck` | Richiesta in coda | Request queued |
| `doorBlockedAlarm` | Porte bloccate per allarme | Doors locked due to alarm |
| `doorBlockedOOO` | Fuori servizio | Out of service |
| `oooCancelledByAlarm` | Allarme attivato. Fuori servizio annullato. | Alarm activated. Out of service cancelled. |
| `prenotationLabel` | PRENOTATA · Tieni premuto E per entrare | BOOKED · Hold E to enter |
| `clickToResume` | Clicca per riprendere | Click to resume |

### Tutorial contestuale

| Chiave | IT | EN |
|---|---|---|
| `tutorialStep1Text` / `tutorialStep1Voice` | Benvenuto al {}. Sei nella cabina al piano Terra. / Benvenuto a {}. Premi uno... nove per chiamare un piano. | Welcome to {}. You are in the cabin at the ground floor. / Welcome to {}. Press one... nine to call a floor. |
| `tutorialStep2Text` / `tutorialStep2Voice` | Premi E per uscire dalla cabina... / Premi E per uscire dalla cabina. | Press E to exit the cabin... / Press E to exit the cabin. |
| `tutorialStep3Text` / `tutorialStep3Voice` | Nel corridoio usa WASD per muoverti... / Nel corridoio usa WASD... | In the corridor use WASD to move... / In the corridor use WASD... |
| `tutorialStep4Text` / `tutorialStep4Voice` | Comandi utili: M audio, V annunci, K vocale, N notte, O fuori servizio. / Comandi utili: M per muto, V per annunci, ... | Useful controls: M audio, V announcements, K voice, N night mode, O out of order. / Useful controls: M for mute, V for announcements, ... |
| `tutorialStep5Text` / `tutorialStep5Voice` | In qualsiasi momento premi ? per rivedere il tutorial. H per personalizzare l'hotel. / Premi punto interrogativo per rivedere il tutorial. | Press ? to review the tutorial. H to customise the hotel. / Press question mark at any time to review the tutorial. |
| `tutorialSkip` / `tooltipSkip` / `skipBtn` | Salta tutorial | Skip tutorial |
| `tutorialNext` / `tooltipNext` / `nextBtn` | Avanti → | Next → |
| `tutorialHelpPrompt` | Premi ? per aiuto. | Press ? for help. |

### Cartello corridoio

| Chiave | IT | EN |
|---|---|---|
| `inViaggio` | IN VIAGGIO · | IN TRANSIT · |
| `inSalitaShort` | IN SALITA | GOING UP |
| `inDiscesaShort` | IN DISCESA | GOING DOWN |
| `fuoriServizio` | FUORI SERVIZIO | OUT OF SERVICE |
| `manutenzione` | — MANUTENZIONE IN CORSO — | — MAINTENANCE IN PROGRESS — |
| `roomInfo` | Camere 401 – 432 | Rooms 401 – 432 |
| `roomFloor` | Piano | Floor |
| `floorLabelTerra` | PIANO TERRA | GROUND FLOOR |
| `elevatorSuffix` | ELEVATOR | ELEVATOR |
| `inSalita` / `inDiscesa` | In salita verso piano / In discesa verso piano | Going up to floor / Going down to floor |

### Pubblicità / advertising

| Chiave | IT | EN |
|---|---|---|
| `restaurantTitle` | Ristorante panoramico | Panoramic restaurant |
| `restaurantMotto1` | Aperto dalle 19:30 alle 23:00 | Open from 7:30 PM to 11:00 PM |
| `restaurantMotto2` | Prenotazioni: concierge al piano 0 | Reservations: concierge at the lobby |
| `restaurantMenu` | — LA TERRAZZA — | — THE TERRACE — |
| `restaurantMenuStarters` / `restaurantMenuMains` / `restaurantMenuDesserts` | ANTIPASTI / SECONDI / DESSERT | STARTERS / MAINS / DESSERTS |
| `spaTitle` | BOSS HOTEL SPA | BOSS HOTEL SPA |
| `spaMotto1` | Benessere a 360 gradi | 360-degree wellness |
| `spaMotto2` | Sauna, bagno turco, trattamenti esclusivi | Sauna, steam room, exclusive treatments |
| `spaService1` / `spaService2` / `spaService3` | MASSAGGI / PISCINA / WELLNESS | MASSAGES / POOL / WELLNESS |
| `obstacleDetected` | Attenzione. Le porte rilevano un ostacolo. | Caution. Doors detecting an obstacle. |
| `obicleDetectedSubtitle` | Ostacolo rilevato | Obstacle detected |
| `nudgingForced` | Chiusura porte forzata. Attenzione. | Door forced close. Caution. |
| `soccorso` | Soccorsi in arrivo | Help is on the way |
| `portaChiusa` | Le porte si stanno chiudendo | Doors are closing |

### Slide start screen

| Chiave | IT | EN |
|---|---|---|
| `slidesLabel` | Caratteristiche | Features |
| `slideCabinTitle` / `slideCabinDesc` | Cabina 5★ / Boss Hotel Edition | 5★ Cabin / Boss Hotel Edition |
| `slideTouchTitle` / `slideTouchDesc` | Touch screen / Display 540×1100 | Touchscreen / Display 540×1100 |
| `slideWeatherTitle` / `slideWeatherDesc` | Meteo live / Roma in tempo reale | Live weather / Rome in real time |
| `slideTTSTitle` / `slideTTSDesc` | Annunci vocali / Web Speech API | Voice announcements / Web Speech API |
| `slideThemesTitle` / `slideThemesDesc` | 4 temi corridoio / Lobby · Uffici · Hotel · Attico | 4 corridor themes / Lobby · Offices · Hotel · Attic |

### Meteo live

| Chiave | IT | EN |
|---|---|---|
| `weatherCard` | METEO + PREVISIONI 24H | WEATHER + 24H FORECAST |
| `cityHeader` | ROMA · | ROME · |
| `weatherUpdated` | Aggiornato: | Updated: |
| `weatherApiKeyRome` | Roma | Rome |

### Generici HUD / badge

| Chiave | IT | EN |
|---|---|---|
| `topbarTitle` | Ascensore | Elevator |
| `topbarSubtitle` | Simulazione 3D | 3D Simulation |
| `cabinTitle` | Cabina 5★ | 5★ Cabin |
| `cabinSubtitle` | Boss Hotel Edition | Boss Hotel Edition |
| `citySubtitle` | Roma in tempo reale | Rome in real time |
| `startBtn` | Entra nell'ascensore | Enter the elevator |
| `startHint` / `startIntro` | Stai per entrare nella cabina di un ascensore di lusso a 5 stelle. | You are about to enter a luxury 5-star elevator cabin. |
| `startHint2` / `startIntro2` | Seleziona un piano dal pannello touch, oppure esci nel corridoio per rientrare in cabina. | Select a floor from the touch panel, or exit into the corridor to re-enter the cabin. |
| `pointerHint` | Clicca per attivare il puntatore | Click to activate the pointer |
| `exitCabinBtn` | ↗ Esci dalla cabina | ↗ Exit the cabin |
| `reenterCabinBtn` | ↙ Rientra in cabina | ↙ Re-enter cabin |
| `langToggleIT` / `langToggleEN` | Lingua: Italiano / Lingua: English | Language: Italian / Language: English |
| `featureCabin` / `featureTouchscreen` / `featureWeather` / `featureTTS` / `featureThemes` | Cabina 5★ Boss Hotel Edition / Touch screen Display 540×1100 / Meteo live Roma in tempo reale / Annunci vocali Web Speech API / 4 temi corridoio (lobby, uffici, hotel, attico) | 5★ Boss Hotel Edition Cabin / Touchscreen Display 540×1100 / Live weather Rome in real time / Voice announcements Web Speech API / 4 corridor themes (lobby, offices, hotel, attic) |
| `welcomeHeadline` / `welcomeAddress` / `welcomeStars` / `welcomeTagline` / `welcomeSubtitle` / `welcomeMotto` | Benvenuto al / Via Veneto 142 · Roma / ★★★★★ / Luxury since 1898 / Cinque stelle lusso / Eleganza senza tempo. Dal 1898. | Welcome to / 420 Park Avenue · New York / ★★★★★ / Luxury redefined / Five star luxury / Timeless elegance. Since 1898. |
| `systemFooter` | ELEVATOR SYSTEM · | ELEVATOR SYSTEM · |
| `helpTitle` | Comandi | Controls |
| `helpLookAround` / `helpPressButton` / `helpReleaseMouse` / `helpExit` / `helpWASD` / `helpCall` / `helpAudio` / `helpVoice` / `helpNight` / `helpOOO` / `helpVoiceCmd` / `helpTutorial` / `helpCustomize` / `helpLang` / `helpMaint` / `helpPlaceholder` | guarda intorno / premi un pulsante / rilascia il mouse / esci / rientra cabina / movimento nel corridoio / chiama un piano / toggle suono / toggle annunci vocali / toggle modalità notte / fuori servizio / comando vocale / apri / rivedi tutorial / personalizza hotel / lingua IT / EN / manutentore / (azione) | look around / press a button / release the mouse / exit / re-enter cabin / corridor movement / call a floor / toggle audio / toggle voice / toggle night mode / out of order / voice command / open / review tutorial / customize hotel / language IT / EN / maintenance / (action) |

---

## 3. Tabella completa auto-generata

Vedi `STRINGS_TABLE.md` (rigenerato automaticamente da `scripts/extract-strings.js`):
225 chiavi uniche totali (1 IT-only, 1 EN-only). Lo script parsa `elevator.html`,
estrae i blocchi STRINGS.it e STRINGS.en con gestione di escape single-quote,
e produce una tabella markdown ordinata alfabeticamente.

Per rigenerare:
```bash
node scripts/extract-strings.js
```

---

## 4. Convenzioni e contratti D-key

| # | Contratto | Impatto i18n |
|---|---|---|
| D3 | No emoji nel codice JS | Solo caratteri unicode (★, ↗, ↙, ·) usati come decorazione |
| D4 | Italiano + sezioni numerate | Commenti in italiano, nomi variabili dove possibile |
| D8 | STRINGS[lang] + refactor HTML → dinamico | `applyLangToDOM()` popola tutti i testi. Event delegation sui parent per sopravvivere ai re-render |

### Convenzioni aggiuntive per nuove stringhe

1. **Naming**: camelCase descrittivo del dominio (es. `maintAlarmCount`, `doorBlockedAlarm`).
2. **Template literals**: usare `${expr}` quando serve interpolazione (es. `calledFloor: (f) => '...'`).
3. **Plurale/singolare**: l'inglese non distingue, italiano spesso sì. Considerare chiavi separate (`audioOn` vs `audioOff`) per evitare ambiguità.
4. **Lunghezza**: tenere le stringhe corte per il maintenance overlay (font monospace 11-12px, larghezza limitata).
5. **Escape**: apici singoli `'` → `\\'` nel source JS (gestito dallo script di estrazione).
6. **Maiuscole**: ALL CAPS solo per label 'button-like' (es. `outOfService`, `doorOpen`, `maintOOO`).

### Aggiungere una nuova stringa

1. Aggiungere la chiave in `STRINGS.it` E `STRINGS.en` con stessa firma.
2. Aggiornare `applyLangToDOM()` (se serve iniettare in DOM statico) o usare direttamente `STRINGS[state.lang].key` nel codice.
3. Aggiungere il test in `tests.html` se la stringa influenza logica (es. `interphoneStatusLabel`).
4. Aggiungere la riga in questo file (sezione 2) + rigenerare `STRINGS_TABLE.md`.

---

Vedi anche:
- `AGENTS.md` §Contratti D-key (D3, D4, D8 specifici per i18n)
- `PIANO_V3.md` Step 7 implementation note
- `ARCHITECTURE.md` §5 Render pipeline (3-layer display caching + brightness filter)
