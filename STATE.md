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
| `requestedFloors` | `Set<int>` | `requestFloor` (add), OOO toggle (clear), `tickMove` arrival (delete next) | `drawModernDisplay` (queue size), `tickMove`, `tickMaintenance` | Sempre subset di `0..9`. Vuoto quando `!isMoving` e cabin ferma da >1s. |
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