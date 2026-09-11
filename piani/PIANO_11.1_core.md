# Piano §11.1 — Funzionalità "core" mancanti

**Riferimento**: `PIANO_MIGLIORAMENTI.md` §11.1 · **Funzionalità**: 4 · **File**: `elevator.html`

Riguardano la "fisicità" percepita dell'ascensore (shake, whoosh) e informazioni dinamiche durante la corsa. Sono interventi su `tickMove()`, audio e cartelli.

---

## #1 — Effetto shake/movimento cabina durante il viaggio 🔴

**Obiettivo**: dare "peso" alla cabina durante la corsa con micro-oscillazioni casuali X/Z + leggero roll/pitch.

**Approccio**: estendere `state.vibration` (oggi attiva solo on-click) per sommarci un contributo continuo durante `tickMove`. Usare Perlin semplificato (seno + rumore) modulato in ampiezza dalla velocità (alta al centro, bassa ai capi).

**Posizione codice**:
- Sezione `MOVIMENTO CABINA` (~riga 2890), `state` (~riga 308)
- Sezione `LOOP` (~riga 3378)

**Modifiche**:

```js
// in state (riga ~313):
vibration: 0,           // offset Y cumulato (già esistente)
vibrationX: 0,          // NEW: offset X
vibrationZ: 0,          // NEW: offset Z
vibrationRoll: 0,       // NEW: rollio (rad)
vibrationPitch: 0,      // NEW: beccheggio (rad)
_movePhase: 0,          // NEW: fase per oscillazione deterministica
```

```js
// in tickMove(), dentro al calcolo della y:
state._movePhase += dt * 4; // velocità oscillazione
const speed = Math.abs(moveTo - moveFrom) / moveDuration; // 0..1
const amp = 0.0035 * Math.sin(Math.PI * moveT); // envelope a campana
state.vibrationX = (Math.sin(state._movePhase * 7.3) + Math.sin(state._movePhase * 11.1)) * amp;
state.vibrationZ = (Math.cos(state._movePhase * 8.7) + Math.sin(state._movePhase * 13.3)) * amp;
state.vibrationRoll  = Math.sin(state._movePhase * 5.1) * amp * 0.6;
state.vibrationPitch = Math.cos(state._movePhase * 6.7) * amp * 0.6;
```

```js
// nel LOOP, dove cabin.position.y viene applicato (~riga 3380):
cabin.position.x = state.vibrationX;
cabin.position.z = state.vibrationZ;
cabin.rotation.z = state.vibrationRoll;
cabin.rotation.x = state.vibrationPitch;
```

**Reset**: in `setDoors(true)` o quando si arriva al piano, azzerare i 4 offset (transizione graduale: `* 0.9` per 20 frame).

**Acceptance**:
- [ ] Shake visibile ma non fastidioso (ampiezza max 3–4mm)
- [ ] Envelope a campana: più shake al centro, nullo a inizio/fine
- [ ] Combinato correttamente con `state.vibration` esistente (click)
- [ ] Nessun jitter quando si guarda il display touch (la vibrazione del cabin group muove anche la camera che è child)

**Effort**: ~20 righe + test · **Rischio**: basso (modifica solo offset posizione/rotazione)

---

## #2 — Musica di sottofondo contestuale 🔴

**Obiettivo**: tracce musicali sintetiche che cambiano per piano, si silenziano durante allarme e movimento cabina.

**Approccio**: WebAudio con `OscillatorNode` × `BiquadFilterNode` × `GainNode`. Pattern armonici semplici (loop di 8 battute) generati proceduralmente.

**Posizione codice**:
- Sezione `AUDIO` (~riga 2796) — nuove funzioni `startMusic()`, `stopMusic()`, `setMusicFloor(floor)`
- Sezione `LOOP` (~riga 3378) — variazione intensità

**Modifiche**:

```js
// nuove variabili globali nella sezione AUDIO:
let musicGain = null;
let musicNodes = []; // array di {osc, gain, filter}
let musicPlaying = false;

function startMusic() {
  if (musicPlaying || state.muted) return;
  ensureAudio();
  if (!audioCtx) return;
  musicGain = audioCtx.createGain();
  musicGain.gain.value = 0.04; // basso per non sovrastare TTS
  musicGain.connect(audioCtx.destination);
  // base accordo: cambiato per piano
  const chords = {
    0: [130.81, 196.00, 261.63], // C-E-G (lobby jazz)
    4: [146.83, 220.00, 293.66], // D-F#-A (hotel soft)
    7: [174.61, 261.63, 349.23], // F-C-F (attico classica)
  };
  const f = state.currentFloor;
  const chord = chords[f >= 7 ? 7 : f >= 4 ? 4 : 0];
  chord.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    const filt = audioCtx.createBiquadFilter();
    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.value = freq;
    filt.type = 'lowpass';
    filt.frequency.value = 800;
    g.gain.value = 0.33;
    osc.connect(filt); filt.connect(g); g.connect(musicGain);
    osc.start();
    musicNodes.push({ osc, gain: g, filter: filt, baseFreq: freq });
  });
  musicPlaying = true;
}
function stopMusic() {
  musicNodes.forEach(n => { try { n.osc.stop(); } catch(e) {} });
  musicNodes = [];
  musicPlaying = false;
  musicGain = null;
}
// in tickMove() all'inizio del movimento:
if (state.isMoving && musicPlaying) musicGain.gain.value = 0.02; // più basso
// all'arrivo:
if (!state.isMoving && musicPlaying) musicGain.gain.value = 0.04;
// in playAlarm() e toggleAlarm(true):
stopMusic();
// riprendi musica dopo disattivazione allarme:
setTimeout(() => { if (!state.alarmOn) startMusic(); }, 2000);
```

**Toggle utente**: aggiungere binding tasto `B` (background music) che chiama `startMusic()/stopMusic()`. Aggiungere a `panel-help` HUD.

**Acceptance**:
- [ ] Musica udibile ma non invasiva (gain 0.04)
- [ ] Cambia accordo al cambio piano (callback in `buildCorridor(floor)` → `setMusicFloor(floor)`)
- [ ] Silenziata durante allarme
- [ ] Abbassata durante movimento (effetto "ascensore")
- [ ] Toggle `B` funzionante

**Effort**: ~80 righe (con gestione start/stop/cleanup) · **Rischio**: medio (WebAudio scheduling)

---

## #3 — Effetto sonoro di movimento cabina ("whoosh") 🔴

**Obiettivo**: rumore continuo di aria/movimento che segue la cabina, pitch modulato dalla velocità.

**Approccio**: WebAudio con `BufferSource` di white noise (1 secondo) in loop, attraverso `BiquadFilter` bandpass la cui frequenza varia con la velocità della cabina.

**Posizione codice**: sezione `AUDIO` (~riga 2796).

**Modifiche**:

```js
// helper: genera 1 secondo di white noise in un AudioBuffer
function makeNoiseBuffer(ctx, dur = 1.0) {
  const len = ctx.sampleRate * dur;
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * 0.5;
  return buf;
}
let whooshNode = null, whooshGain = null, whooshFilter = null;
function startWhoosh() {
  if (whooshNode || state.muted) return;
  ensureAudio();
  if (!audioCtx) return;
  const noise = makeNoiseBuffer(audioCtx, 1.0);
  whooshNode = audioCtx.createBufferSource();
  whooshNode.buffer = noise;
  whooshNode.loop = true;
  whooshFilter = audioCtx.createBiquadFilter();
  whooshFilter.type = 'bandpass';
  whooshFilter.frequency.value = 400;
  whooshFilter.Q.value = 1.2;
  whooshGain = audioCtx.createGain();
  whooshGain.gain.value = 0.0; // parte silente
  whooshNode.connect(whooshFilter);
  whooshFilter.connect(whooshGain);
  whooshGain.connect(audioCtx.destination);
  whooshNode.start();
}
function stopWhoosh() {
  if (whooshGain) whooshGain.gain.value = 0;
  if (whooshNode) { try { whooshNode.stop(); } catch(e) {} }
  whooshNode = whooshGain = whooshFilter = null;
}
```

```js
// in tickMove(), dopo calcolo moveT:
if (state.isMoving && !whooshNode) startWhoosh();
if (!state.isMoving && whooshNode) stopWhoosh();
if (whooshGain && state.isMoving) {
  const speed = Math.sin(Math.PI * moveT); // 0..1..0
  whooshFilter.frequency.value = 300 + speed * 800; // 300-1100 Hz
  whooshGain.gain.value = 0.025 * speed;
}
```

**Acceptance**:
- [ ] Whoosh percepibile durante la corsa, nullo a fermo
- [ ] Pitch sale al centro, scende ai capi (modulazione sinusoidale)
- [ ] Si interrompe subito a `STOP` (in handler tasto STOP)
- [ ] Non va in conflitto con allarme (interrompere se `state.alarmOn`)

**Effort**: ~40 righe · **Rischio**: basso

---

## #4 — Indicatore direzione "passo passo" sul cartello corridoio 🟡

**Obiettivo**: durante la corsa, il cartello lato corridoio mostra i piani che la cabina sta attraversando (es. "▲ 2·3·4·5").

**Approccio**: il cartello è già una texture canvas ridisegnata in `buildCorridor()` (~riga 1427). Aggiungere un "modalità movimento" che viene ridisegnata ogni frame in `tickMove()`.

**Posizione codice**:
- Sezione `CORRIDOIO` (~riga 1411) — variabile `signTex`, `signMat`
- Sezione `MOVIMENTO CABINA` (~riga 2890), `tickMove()`

**Modifiche**:

```js
// in state:
_corridorSignTex: null,  // NEW: riferimento alla texture canvas del cartello
_corridorSignMat: null,  // NEW: riferimento al materiale
```

```js
// in buildCorridor(), dopo aver creato signTex e signMat:
state._corridorSignTex = signTex;
state._corridorSignMat = signMat;
```

```js
// nuova funzione drawMovingSign(floorShown):
function drawMovingSign(floorShown) {
  if (!state._corridorSignTex) return;
  const c = state._corridorSignTex.image;
  const ctx = c.getContext('2d');
  // sfondo dorato (stesso stile del cartello statico)
  ctx.fillStyle = '#1a1410'; ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#d4af37'; ctx.font = 'bold 28px Georgia';
  // freccia
  const dir = state.targetFloor > state.currentFloor ? '▲' : '▼';
  ctx.fillText(dir, 30, 50);
  // numeri piani attraversati (da currentFloor a targetFloor)
  const lo = Math.min(state.currentFloor, state.targetFloor);
  const hi = Math.max(state.currentFloor, state.targetFloor);
  const list = [];
  for (let i = lo; i <= hi; i++) list.push(i === 0 ? 'T' : String(i));
  ctx.fillText(list.join(' · '), 70, 50);
  ctx.font = '14px Georgia';
  ctx.fillText('BOSS HOTEL ELEVATOR', 30, 75);
  state._corridorSignTex.needsUpdate = true;
}
```

```js
// in tickMove(), dopo aggiornamento floorNum:
if (typeof drawMovingSign === 'function') drawMovingSign(floorShown);
// all'arrivo: ridisegna il cartello statico
if (moveT >= 1) buildCorridor(moveTo); // già presente
```

**Acceptance**:
- [ ] Cartello mostra "▲ T·1·2·3" durante una salita dal Terra al 3
- [ ] Cambia in tempo reale durante la corsa
- [ ] Ritorna al formato "PIANO 3°" all'arrivo (via `buildCorridor`)
- [ ] Non crea flicker (no `needsUpdate` ridondanti)

**Effort**: ~30 righe · **Rischio**: basso

---

## Checklist comune

- [ ] Aggiornare `README.md` "Features" con i 4 nuovi punti
- [ ] Aggiornare `PIANO_MIGLIORAMENTI.md` §4 con "Fase 10" o bug-fix log
- [ ] Sincronizzare `dist/index.html`
- [ ] Test FPS (target ≥50 su hardware medio)
- [ ] Test audio (spegni cuffie / prova diversi browser)
