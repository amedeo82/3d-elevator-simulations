# Piano §11.3 — UX / accessibilità

**Riferimento**: `PIANO_MIGLIORAMENTI.md` §11.3 · **Funzionalità**: 4 · **File**: `elevator.html`

Migliorano l'esperienza utente per casi non-standard (senza mouse, senza audio, lingua straniera) e per power-user.

---

## #9 — Comando vocale (speech-to-text) 🟡

**Obiettivo**: l'utente può dire "Piano cinque" / "Terra" / "Apri porte" e la cabina esegue.

**Approccio**: `webkitSpeechRecognition` (Chrome/Edge) o `SpeechRecognition` (standard). Solo italiano. Attivazione con tasto `K` (keep talking) o click su icona microfono nel HUD.

**Posizione codice**:
- Sezione `AUDIO` (~riga 2796) — vicino a TTS
- Sezione `LISTENERS TASTIERA` (~riga 3278)
- Sezione `HUD HTML` (inizio file) — icona microfono

**Modifiche**:

```js
// nuove variabili:
let recognition = null;
let voiceControlOn = false;

function initVoiceRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return false;
  recognition = new SR();
  recognition.lang = 'it-IT';
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onresult = (e) => {
    const text = e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
    handleVoiceCommand(text);
  };
  recognition.onerror = (e) => {
    if (e.error === 'no-speech') return; // ignora silenzio
    console.warn('Speech recognition error:', e.error);
  };
  recognition.onend = () => {
    if (voiceControlOn) try { recognition.start(); } catch(e) {}
  };
  return true;
}

function handleVoiceCommand(text) {
  // normalizza
  const numWords = { 'zero': 0, 'uno': 1, 'un': 1, 'due': 2, 'tre': 3, 'quattro': 4,
                     'cinque': 5, 'sei': 6, 'sette': 7, 'otto': 8, 'nove': 9, 'terra': 0, 'piano terra': 0 };
  // cerca numeri
  for (const [word, n] of Object.entries(numWords)) {
    if (text.includes(word)) {
      if (n >= 0 && n < NUM_FLOORS) { requestFloor(n); return; }
    }
  }
  // cerca numero scritto "5°" "5"
  const m = text.match(/piano\s+(\d)|^\s*(\d)\s*$/);
  if (m) {
    const n = parseInt(m[1] || m[2]);
    if (n >= 0 && n < NUM_FLOORS) { requestFloor(n); return; }
  }
  // comandi porte/allarme
  if (text.includes('apri')) { setDoors(true); return; }
  if (text.includes('chiudi')) { setDoors(false); return; }
  if (text.includes('allarme')) { toggleAlarm(); return; }
  if (text.includes('stop') || text.includes('ferma')) { /* ... */ return; }
}
```

```js
// in AVVIO (riga ~3454):
if (initVoiceRecognition()) {
  // aggiungi icona microfono al HUD
  document.getElementById('voiceToggle').style.display = 'inline';
}
// listener K:
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'k') {
    voiceControlOn = !voiceControlOn;
    if (voiceControlOn) { try { recognition.start(); } catch(e) {} }
    else { try { recognition.stop(); } catch(e) {} }
  }
});
```

**Acceptance**:
- [ ] "Piano cinque" chiama il piano 5
- [ ] "Terra" / "Piano terra" chiama il 0
- [ ] "Apri porte" apre le porte
- [ ] "Chiudi porte" / "Chiudi" chiude le porte
- [ ] "Allarme" attiva/disattiva allarme
- [ ] Tasto `K` toggle on/off
- [ ] Fallback se browser non supporta (Chrome/Edge ok, Firefox no)

**Effort**: ~50 righe + HTML per icona · **Rischio**: medio (permessi microfono richiedono HTTPS)

---

## #10 — Scorciatoie tastiera 1–9 per piani 🟡

**Obiettivo**: premere un numero sulla tastiera chiama quel piano, senza dover cliccare sul display.

**Approccio**: listener tastiera che intercetta i tasti `1`–`9` e `0` (per Terra). Solo se non si sta digitando in un input.

**Posizione codice**:
- Sezione `LISTENERS TASTIERA` (~riga 3278)

**Modifiche**:

```js
// nuovo listener (da aggiungere accanto agli altri keydown):
window.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (state.alarmOn || state.outOfOrder) return;
  const k = e.key;
  let floor = null;
  if (k >= '1' && k <= '9') floor = parseInt(k);
  else if (k === '0') floor = 0;
  if (floor !== null && !state.playerInCabin) {
    // dal corridoio, equivale a prenotazione: apri le porte + richiedi piano
    setDoors(true);
    setTimeout(() => requestFloor(floor), 600);
    return;
  }
  if (floor !== null) {
    requestFloor(floor);
  }
});
```

**Conflict resolution**: evitare conflitto con WASD (W, A, S, D sono lettere, non numeri) — nessun conflitto. Solo conflitto potenziale con `1`-`9` se usati per debug overlay (vedi #19), decidere priorità in #19.

**Acceptance**:
- [ ] Tasto `5` chiama il piano 5
- [ ] Tasto `0` chiama il Terra
- [ ] Funziona sia in cabina che nel corridoio
- [ ] Non interferisce con WASD o con la digitazione in eventuali `<input>`
- [ ] Disabilitato durante allarme

**Effort**: ~15 righe · **Rischio**: basso

---

## #11 — Sottotitoli per annunci vocali 🟡

**Obiettivo**: ogni annuncio vocale TTS appare anche come testo in una striscia HUD in basso, per utenti senza audio o con TTS rotto.

**Approccio**: aggiungere un `<div id="caption">` all'HUD e una side-effect in `speak()`.

**Posizione codice**:
- Sezione `HTML body` (inizio file) — aggiungere `<div id="caption">`
- Sezione `ANNUNCI VOCALI TTS`, `speak()` (~riga 2845)

**Modifiche**:

```html
<!-- in HUD overlay -->
<div id="caption" style="position:fixed; left:50%; top:80px; transform:translateX(-50%);
  background:rgba(0,0,0,0.7); border:1px solid rgba(255,255,255,0.15);
  padding:8px 18px; border-radius:999px; font-size:14px; color:#fff;
  display:none; pointer-events:none; z-index:6;"></div>
```

```js
// in speak(), in cima:
function speak(text, opts = {}) {
  // aggiorna sottotitoli
  const cap = document.getElementById('caption');
  if (cap) {
    cap.textContent = '🔊 ' + text;
    cap.style.display = 'block';
    clearTimeout(cap._hideT);
    cap._hideT = setTimeout(() => { cap.style.display = 'none'; }, 4000);
  }
  // ... resto della funzione esistente
}
```

**Acceptance**:
- [ ] Caption appare per 4s con prefisso icona
- [ ] Si nasconde automaticamente
- [ ] Non appare se `ttsEnabled === false` (decidere: opzionale mostrarle comunque? default: sì, anche se TTS off)
- [ ] Si cancella se arriva un nuovo annuncio (no overlap)

**Effort**: ~10 righe + 4 righe HTML · **Rischio**: basso

---

## #12 — Lingua selezionabile (IT/EN) 🟢

**Obiettivo**: utente può scegliere italiano o inglese. Cambia display touch, cartelli, menu ristorante, annunci TTS.

**Approccio**: refactor di tutte le stringhe hardcoded in un oggetto `STRINGS[lang]`. Tasto `L` toggle. Persistenza in localStorage (cfr. #15).

**Posizione codice**: TUTTO il file — è un refactor strutturale.

**Modifiche**:

```js
// nuova sezione dopo CONFIGURAZIONE (~riga 297):
const STRINGS = {
  it: {
    hotelName: 'BOSS HOTEL',
    hotelAddr: 'Via Veneto 142, Roma',
    floorNames: ['Terra', 'Primo', 'Secondo', 'Terzo', 'Quarto', 'Quinto', 'Sesto', 'Settimo', 'Ottavo', 'Nono'],
    days: ['DOM','LUN','MAR','MER','GIO','VEN','SAB'],
    months: ['GEN','FEB','MAR','APR','MAG','GIU','LUG','AGO','SET','OTT','NOV','DIC'],
    weatherNames: { sun: 'Sereno', clouds: 'Nuvoloso', ... },
    arrivalTemplate: (n) => n === 0 ? 'Piano terra, prego' : `Piano ${floorItalian(n)}, prego`,
    alarmMsg: 'Allarme. Chiamata di soccorsi in corso. Restate calmi.',
    doorClosingMsg: 'Attenzione. Le porte si stanno chiudendo.',
    menuRistorante: [...], // 5 piatti
    spaOfferte: [...],
  },
  en: {
    hotelName: 'BOSS HOTEL',
    hotelAddr: '142 Via Veneto, Rome',
    floorNames: ['Ground', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth'],
    days: ['SUN','MON','TUE','WED','THU','FRI','SAT'],
    months: ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'],
    weatherNames: { sun: 'Clear', clouds: 'Cloudy', ... },
    arrivalTemplate: (n) => n === 0 ? 'Ground floor' : `Floor ${floorEnglish(n)}`,
    alarmMsg: 'Alarm. Emergency services have been called. Please remain calm.',
    doorClosingMsg: 'Attention. The doors are closing.',
    menuRistorante: [...], // 5 piatti inglesi
    spaOfferte: [...],
  },
};
let LANG = localStorage.getItem('bossLang') || 'it';
function S(key, ...args) { return STRINGS[LANG][key]; }
```

```js
// tasto L per toggle:
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'l') {
    LANG = LANG === 'it' ? 'en' : 'it';
    localStorage.setItem('bossLang', LANG);
    markDisplayDirty();
    updateAdScreen(performance.now()); // ridisegna subito
    buildCorridor(state.currentFloor);
  }
});
```

**Acceptance**:
- [ ] Tasto `L` switcha IT ↔ EN
- [ ] Display touch mostra nomi piani, giorni, mesi nella lingua scelta
- [ ] Cartello corridoio cambia
- [ ] Pannello pubblicitario cambia (ristorante, spa)
- [ ] Annuncio vocale in lingua corretta
- [ ] Persiste dopo refresh

**Effort**: ~150 righe (refactor distribuito) · **Rischio**: medio (tocca molte funzioni)

---

## Checklist comune

- [ ] Aggiungere `K`, `L` al `panel-help` HUD
- [ ] Aggiungere icona microfono al HUD
- [ ] Aggiornare `README.md` con le 4 funzionalità
- [ ] Test HTTPS per microfono
- [ ] Persistenza preferenza lingua in localStorage (vedi anche #15)
