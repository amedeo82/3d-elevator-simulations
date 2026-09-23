# STATE.md — Audit dell'oggetto `state` di BOSS HOTEL Elevator 3D

Documento di riferimento per l'oggetto globale `state` dichiarato in
`elevator.html` alla riga **484** (sezione **CONFIGURAZIONE**, in cima al file
per evitare TDZ — vedi `AGENTS.md` § "Lezione state in cima").

> Generato durante Polish Pack V2 Step 1c. Mantenere in sync con modifiche al file.

---

## Convenzioni lettura tabella

- **Tipo**: tipo runtime, non vincolante (JS è dinamico).
- **Scritto da**: funzioni / sezioni che assegnano il campo (`=`, `add`, `delete`, ecc.).
- **Letto da**: funzioni / sezioni che leggono il campo.
- **Contratti**: invarianti che devono essere SEMPRE veri (controllati in DEBUG mode).

---

## Tabella campi `state`

| Campo | Tipo | Scritto da | Letto da | Contratti |
|---|---|---|---|---|
| `currentFloor` | int 0..9 | `teleportToFloor`, `tickMove` arrival, OOO toggle, build start | `tickMove`, `tickPlayer`, `drawModernDisplay`, `drawMovingSign`, `updateFloorDisplay`, `refreshHudButtons`, `tickMaintenance`, `floorRoomRange`, `scheduleAutoClose` | `0 <= currentFloor <= 9`. Sincronizzato con `floorShown` a riposo. |
| `targetFloor` | int 0..9 | `requestFloor`, `actuallyStartMove`, `teleportToFloor` | `tickMove`, `updateFloorDisplay`, `tickMaintenance`, statusText | `0 <= targetFloor <= 9`. Quando `isMoving`, `targetFloor !== currentFloor`. |
| `isMoving` | bool | `actuallyStartMove`, `tickMove` arrival, `toggleAlarm`, OOO toggle | `tickMove`, `tickPlayer`, `tickDisplay`, `tickMusic`, `tickDoors`, `scheduleAutoClose`, `tickMaintenance` | Se `true`, `doorsActual < 0.1` (porte chiuse durante movimento). |
| `doorsOpen` | bool | `setDoors`, `tickPlayer` (prenotazione) | `setDoors`, `tickDoors`, `tickPlayer`, `scheduleAutoClose`, `updateFloorDisplay`, `refreshHudButtons`, `requestFloor` | Rappresenta la destinazione, non lo stato animato. Per lo stato animato usa `doorsActual`. |
| `doorsTarget` | 0 \| 1 | `setDoors`, `tickPlayer` (prenotazione) | `tickDoors` | `=== doorsOpen ? 1 : 0`. |
| `doorsActual` | float 0..1 | `tickDoors` (animazione), `setDoors` (init) | `tickDoors`, `tickPlayer` (prenotazione), `scheduleAutoClose`, `drawFloorSign` | Quando `>= 0.99` e `doorsOpen`, `scheduleAutoClose` parte. |
| `alarmOn` | bool | `toggleAlarm` | `setDoors` (rifiuta open), `requestFloor` (rifiuta), `tickMove`, `tickMusic`, `scheduleAutoClose`, `tickDisplay`, overlay debug | Se `true`, `doorsOpen === false` e cabina ferma. |
| `requestedFloors` | `Array<{floor, direction}>` | `requestFloor` (push), OOO toggle (clear), `tickMove` arrival (splice), `queueNextSmart` (gestione routing) | `drawModernDisplay` (queue size), `tickMove` (estrazione prossimo piano), `tickMaintenance` | Array con elementi `{floor: 0..9, direction: 'up'\|'down'\|null}`. FIFO con dedup per piano (ultimo input vince). Vuoto quando `!isMoving` e cabin ferma da >1s. |
| `muted` | bool | toggle M, `loadPrefs` | `playDoorSound`, `playChime`, `playAlarm`, `tickMusic`, `speak` | Persiste in `localStorage.bossHotelPrefs@v1`. |
| `playerInCabin` | bool | `exitCabin`, `enterCabin` | `tickPlayer` (gate FPS movement), `scheduleAutoClose` (hotfix v1.7), `tickMaintenance` (HUD) | Quando `false`, `passengers === 0` (l'utente è l'unico passeggero). |
| `nightMode` | bool | toggle N, `loadPrefs` | `tickDisplay` (illumination), overlay debug | Persiste in `localStorage.bossHotelPrefs@v1`. |
| `passengers` | int 0..8 | `adjustPassengersForFloor`, `exitCabin` (=0), `enterCabin` (=1) | `tickDisplay` (header "👤 X/8") | `0 <= passengers <= 8`. Se `!playerInCabin`, `passengers === 0`. |
| `vibration` | float 0..1 | click cabina handler (=1), loop decay | cabin transform Y | Decay esponenziale, `state.vibration -= dt*4`. |
| `vibrationX`, `vibrationZ`, `vibrationRoll`, `vibrationPitch` | float | `tickMove` (envelope sin(π·moveT)) | cabin transform | Tutti decadono a 0 dopo `moveT = 1`. |
| `_movePhase` | float 0..1 | `tickMove` (=moveT) | `tickMove` (shake), `tickMusic` (envelope) | `0 <= _movePhase <= 1` durante movimento. |
| `_camLed`, `_camLedSphere`, `_alarmId`, `_lastPassengerChange`, `_lastShownFloor`, `_eventLog`, `_fpsBuf`, `_wireframeSnapshot` | mixed | vari init/handler | overlay manutentore (`Shift+M`) | Interni, no contratti pubblici. |
| `outOfOrder` | bool | toggle O | `requestFloor`, `tickMove`, `tickMusic`, `scheduleAutoClose`, `tickPlayer`, `drawModernDisplay`, `tickDisplay` | Se `true`, cabina ferma, coda vuota, porte chiuse, display mostra "FUORI SERVIZIO". |
| `prenotationActive` | bool | `tickPlayer` (set/clear), `enterCabin`, OOO toggle | `tickPlayer`, `scheduleAutoClose`, `drawModernDisplay` | `true` ⇒ `!playerInCabin && currentFloor === 0` (lobby) per ADA compliance. |
| `voiceEnabled` | bool | toggle K, `loadPrefs` (futuro), OOO toggle | `processVoiceCommand`, `recognition.onend` | `true` ⇒ `recognition` attivo (speech-to-text). |
| `maintenanceMode` | bool | toggle `Shift+M` | `tickMaintenance`, overlay debug, `scheduleAutoClose`, `tickMusic` | Quando `true`, `1-9` teletrasportano (no animazione movimento). |
| `floorShown` | int 0..9 | `tickMove` (=Math.round(currentDisplay)), `teleportToFloor`, arrival handler | `drawModernDisplay`, `drawMovingSign` | A riposo `=== currentFloor`. Durante movimento passa per tutti i piani intermedi. |
| `DEBUG` | bool | hardcoded in CONFIGURAZIONE (default `false`) | `assertStateInvariants()` | Se `true`, abilita warning contratti runtime. Vedi `AGENTS.md` §1c. |
| `irObstacleActive` | bool | `tickIRSensor` | `tickIRSensor`, `setDoors` (skip countdown) | True quando il giocatore è sulla soglia della cabina con porte in chiusura (Polish Pack V2 Step 2a, ASME A17.1 §2.13.5). |
| `irObstacleStart` | float (ms) | `tickIRSensor` (=performance.now()) | `tickIRSensor` (calcola elapsed → nudging 15s) | `performance.now()` al primo rilevamento ostacolo corrente. Reset quando l'ostacolo è rimosso. |
| `irNudgingActive` | bool | `tickIRSensor` | `tickIRSensor` | True dopo 15s di ostruzione continua (fase nudging). Forza chiusura ignorando l'ostacolo con beep acuto continuo. |
| `onboarded` | bool | `loadOnboarded()` (default false) | `startTutorial` (gate auto-start) | Persiste in `localStorage.bossHotelOnboarded@v1`. True dopo aver completato o saltato il tutorial. |
| `tutorialActive` | bool | `startTutorial` / `endTutorial` | keydown handler (`Enter/Space/Esc` durante tutorial) | True quando overlay tutorial è visibile. Blocca altri handler di tasto. |
| `tutorialStep` | int 0..4 | `nextTip` (++) / `endTutorial` (=0) | `renderTutorialStep` | Indice step corrente del tutorial (0..4, totale 5 step). |
| `lastInteractionTs` | float (ms) | `noteInteraction()` su keydown | `tickInactivityPrompt` | Timestamp ultima interazione. Trigger prompt vocale "Premi ? per aiuto" dopo 30s. |
| `lang` | `'it' \| 'en'` | toggle L, `loadLang()` (default auto-detect) | `t(key)`, `applyLangToDOM()`, `speak()` (selezione voce TTS) | Lingua corrente UI. Persiste in `localStorage.bossHotelLang@v1`. Step 8 V2. |
| `dayPhase` | `'day' \| 'evening' \| 'night'` | `tickDayNight()` ogni 60s in base a `new Date().getHours()` | `tickDisplay` (illuminazione cabina) | day: 6-18, evening: 18-22, night: 22-6. Step 10c V2. |
| `interphoneCalling` | bool | `triggerInterphone()` (=true), tick citofono (auto-reset a 5s) | `toggleAlarm`, `tickPlayer`, `tickDisplay` (lampeggio pulsante), overlay manutentore | True durante chiamata citofono (5s). Persiste in `localStorage.bossHotelPrefs@v1`. Indipendente da `alarmOn`. Step 14 V2. |
| `_interphoneStart` | float (ms) | `triggerInterphone()` (=performance.now()) | tick citofono (calcola elapsed) | Timestamp inizio chiamata corrente. Step 14 V2. |
| `_interphoneReceptionAnnounced` | bool | tick citofono (set dopo 2s) | tick citofono | Evita di annunciare la voce reception più volte. Step 14 V2. |
| `_interphoneButton` | `THREE.Mesh` | lazy init dopo costruzione cabina | tick citofono (lampeggio emissiveIntensity) | Reference al mesh del pulsante verde per animazione flash. Step 14 V2. |
| `reducedMotion` | bool | `initReducedMotion()` (legge `matchMedia('(prefers-reduced-motion: reduce)')`) | `shouldDisableMotion(state)` → respiro tasti, lampeggio gentile, bounce-out | True se l'utente ha richiesto motion ridotto OS-level. Animazioni essenziali (porte, vibrazione, allarme) restano attive. Step 1b V3. |
| `audio` | `{effects: float 0..1, music: float 0..1, tts: float 0..1}` | slider UI H (input), `loadAudioSettings()` (init) | `playBeep`, `playChime`, `playAlarm`, `playDoorSound`, `playWhoosh`, `speak`, musica cabin/corridoio/ristorante | Default: effects=1.0, music=0.5, tts=0.85. Persiste in `localStorage.bossHotelAudio@v1`. Step 3 V3 (D14). |
| `display` | `{brightness: float 0.5..1.5}` | slider UI H (input), `loadDisplaySettings()` (init) | `drawModernDisplay()` via `ctx.filter = 'brightness(X)'` (skip quando X===1.0, no-op costoso) | Default 1.0. Persiste in `localStorage.bossHotelDisplay@v1`. Step 3 V3 (D14). |
| `_exportLog` | `Array<{ts, msg}>` | `logEvent()` separato dal log UI (50 entry) | overlay manutentore (Shift+M), bottone "Esporta stato JSON" | Log esteso per issue reporting, separato da `_eventLog` (10 entry UI). Step 3 V3. |
| `_arrivalPhase` | `'normal' \| 'blinking'` | `tickMove` (settato a 'blinking' quando `moveElapsed > moveDuration - 1.0`) | `drawMovingSign` (overlay gold lampeggiante) | Macchina a 2 stati per il cartello "lampeggio gentile" pre-arrivo. Reset a 'normal' all'arrivo. Step 4 V3 (D15). |
| `_fadeAlarm` | `{target: float, from: float, startMs: float}` | `toggleAlarm`/`tickAlarm` (set target) | `tickFadeStates()` (lerp 200ms `alarmLight.intensity`) | Transizione smooth invece di snap immediato. Step 4 V3 (D15). |
| `_fadeOOO` | `{target, from, startMs}` | toggle O (set target) | `tickFadeStates()` (lerp 200ms) | Idem per fuori-servizio. Step 4 V3 (D15). |
| `_fadeInterphone` | `{target, from, startMs}` | `triggerInterphone()`/tick citofono (set target) | `tickFadeStates()` (lerp 200ms `emissiveIntensity` pulsante) | Idem per citofono. Step 4 V3 (D15). |

---

## Configurazione globale: `HOTEL_CONFIG`

Aggiunto in Polish Pack V2 Step 5 come oggetto separato da `state`. Refactor di 23
stringhe brand hardcoded sparse. Modificabile via HUD tasto `H`, persiste in
`localStorage.bossHotelConfig@v1`.

| Campo | Tipo | Scritto da | Letto da | Contratti |
|---|---|---|---|---|
| `name` | string | HUD form, `applyHotelCustomizerForm()`, `applyHotelPreset()` | targa cabina, cartello piano, display touch header, panelHelpBrand, citofono label | Nome completo (caps per targhe). |
| `shortName` | string | HUD form | start screen, citofono label | Nome friendly (mixed case). |
| `address` | string | HUD form | targa cabina, pannello pubblicitario | Indirizzo completo. |
| `city`, `country` | string | HUD form | pannello pubblicitario | Localizzazione geografica. |
| `stars` | int 1..5 | HUD form | targa cabina (`★`.repeat(stars)) | Clampato a [1, 5]. |
| `established` | int 1800..2100 | HUD form | targa cabina, pannello pubblicitario | Anno fondazione hotel. |
| `tagline` | string | HUD form | targa cabina | Frase breve sotto le stelle. |
| `motto`, `motto2` | string | HUD form | pannello pubblicitario "Welcome" | Motto dell'hotel. |
| `systemName`, `systemYear` | string | HUD form | display touch footer | Identifica il "sistema ascensore". |
| `edition` | string | HUD form | start screen slide | Etichetta "Boss Hotel Edition" / "Sky Tower Edition". |
| `accentGold` | `#rrggbb` | HUD form (color picker) | molti CSS + canvas texture | Accent color primario. Default `#c9a55a` (Boss), `#4a9eff` (Sky), `#d4af37` (Paris), `#e0b973` (Burj). |
| `accentGoldDark`, `accentGoldLight` | `#rrggbb` | hardcoded per preset | canvas texture (bordi, interni) | Varianti accent. |
| `panelHelpBrand` | string | hardcoded per preset | cartello piano, citofono, pannello pubblicitario | Brand name per header UI. |

---

## Contratti runtime (controllati in DEBUG mode)

Aggiunti in Polish Pack V2 Step 1c tramite `assertStateInvariants()` chiamato
alla fine del LOOP principale. In dev (`state.DEBUG === true`) emette
`console.warn` se un contratto è violato; in produzione è no-op.

```js
function assertStateInvariants() {
  if (!state.DEBUG) return;
  const warn = (msg) => console.warn('[state invariant]', msg);
  if (state.currentFloor < 0 || state.currentFloor > 9)
    warn(`currentFloor fuori range: ${state.currentFloor}`);
  if (state.targetFloor < 0 || state.targetFloor > 9)
    warn(`targetFloor fuori range: ${state.targetFloor}`);
  if (state.isMoving && state.doorsActual > 0.5)
    warn(`isMoving=true ma porte aperte al ${(state.doorsActual*100).toFixed(0)}%`);
  if (state.alarmOn && state.doorsOpen)
    warn(`alarmOn=true ma doorsOpen=true`);
  if (state.alarmOn && state.isMoving)
    warn(`alarmOn=true ma isMoving=true`);
  if (state.outOfOrder && state.isMoving)
    warn(`outOfOrder=true ma isMoving=true`);
  if (state.outOfOrder && state.requestedFloors.size > 0)
    warn(`outOfOrder=true ma coda non vuota: ${state.requestedFloors.size}`);
  if (!state.playerInCabin && state.passengers !== 0)
    warn(`!playerInCabin ma passengers=${state.passengers}`);
  if (state.passengers < 0 || state.passengers > 8)
    warn(`passengers fuori range [0,8]: ${state.passengers}`);
  if (state.prenotationActive && state.playerInCabin)
    warn(`prenotationActive=true ma playerInCabin=true`);
  if (state.prenotationActive && state.currentFloor !== 0)
    warn(`prenotationActive=true ma non al lobby (currentFloor=${state.currentFloor})`);
  if (state.doorsActual < 0 || state.doorsActual > 1.001)
    warn(`doorsActual fuori [0,1]: ${state.doorsActual}`);
}
```

---

## Come attivare il DEBUG mode

Per abilitare i warning in dev, impostare `state.DEBUG = true` (o aggiungere
`?debug=1` all'URL — hook futuro). In produzione resta `false` (no-op).

Per i test della CI: i contratti runtime non vengono eseguiti (no DOM, no
three.js); sono solo documentazione vivente + check in-browser durante playtest.