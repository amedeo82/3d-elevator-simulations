# Piano §11.2 — Funzionalità hotel "premium"

**Riferimento**: `PIANO_MIGLIORAMENTI.md` §11.2 · **Funzionalità**: 4 · **File**: `elevator.html`

Micro-aggiunte che sfruttano l'estetica "hotel 5★" del progetto. Interventi su audio, HUD, display touch e pannello pubblicitario.

---

## #5 — Suono "ding" differenziato all'arrivo 🟡

**Obiettivo**: 1 ding per fermata intermedia, 2 ding ravvicinati per arrivo finale a un piano richiesto dall'utente.

**Approccio**: estendere `playChime()` esistente (~riga 2816) con parametro `finale: boolean`. Aggiungere un nuovo flag `state.finalStop` settato quando il movimento termina senza altri piani in coda.

**Posizione codice**:
- Sezione `AUDIO` (~riga 2796)
- Sezione `MOVIMENTO CABINA`, `tickMove()` (~riga 2964)

**Modifiche**:

```js
// in state:
finalStop: true, // NEW: true se l'arrivo conclude la corsa (no coda)
```

```js
// nuova firma playChime(finale = true):
function playChime(finale = true) {
  if (state.muted || !audioCtx) return;
  if (finale) {
    playBeep(660, 0.12, 'sine', 0.12);
    setTimeout(() => playBeep(880, 0.18, 'sine', 0.12), 90);
    setTimeout(() => playBeep(1320, 0.25, 'sine', 0.10), 200);
  } else {
    // fermata intermedia: 1 solo ding morbido
    playBeep(880, 0.10, 'sine', 0.08);
  }
}
```

```js
// in tickMove(), sezione "arrivato" (~riga 2958):
state.finalStop = state.requestedFloors.size === 0;
playChime(state.finalStop);
```

**Acceptance**:
- [ ] Salita Terra→3 senza fermate intermedie: 3 ding in sequenza (accordo ascendente)
- [ ] Salita Terra→3 con richiesta di 5 in coda (passando per 3): 1 ding morbido al 3, poi 3 ding al 5
- [ ] Discesa con fermata a ogni piano della coda: sempre 1 ding morbido tranne l'ultimo

**Effort**: ~15 righe · **Rischio**: basso

---

## #6 — Modalità "Fuori servizio" 🟡

**Obiettivo**: tasto `O` mette l'ascensore in stato "fuori servizio": display mostra "FUORI SERVIZIO", display laterale mostra cartello manutenzione, tutti i tasti disabilitati tranne STOP/allarme.

**Approccio**: aggiungere `state.outOfOrder: boolean`. Intercettare in `requestFloor()` e in `drawModernDisplay()`. Il corridoio mostra un cartello "ASCENSORE FUORI SERVIZIO" tramite `buildCorridor()` modificato.

**Posizione codice**:
- Sezione `STATO GLOBALE` (~riga 308)
- Sezione `MOVIMENTO CABINA`, `requestFloor()` (~riga 2900)
- Sezione `RENDER DEL DISPLAY TOUCH`, `drawModernDisplay()` (~riga 2456)
- Sezione `LISTENERS TASTIERA` (~riga 3278)

**Modifiche**:

```js
// in state:
outOfOrder: false, // NEW
```

```js
// in requestFloor(), in cima:
if (state.outOfOrder && floor !== state.currentFloor) {
  playBeep(220, 0.2, 'square', 0.1); // tono basso di rifiuto
  return;
}
```

```js
// in drawModernDisplay(), sezione "piano corrente gigante":
if (state.outOfOrder) {
  ctx.fillStyle = '#a00';
  ctx.font = 'bold 64px sans-serif';
  ctx.fillText('FUORI SERVIZIO', cx, 180);
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#fa0';
  ctx.fillText('Premere N per ripristinare', cx, 220);
  return; // skip rendering normale
}
```

```js
// in buildCorridor(), quando outOfOrder:
if (state.outOfOrder) {
  // aggiungere un plane "OUT OF ORDER" davanti alle porte
  const oooTex = makeOOOTexture();
  // ...
}
```

```js
// nuovo listener tastiera:
window.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'o') {
    state.outOfOrder = !state.outOfOrder;
    markDisplayDirty();
    if (state.outOfOrder) speak('Ascensore fuori servizio.');
    else speak('Ascensore ripristinato.');
    buildCorridor(state.currentFloor); // ricostruisci con cartello
  }
});
```

**Acceptance**:
- [ ] Tasto `O` toggle stato
- [ ] Display mostra messaggio rosso "FUORI SERVIZIO"
- [ ] Click su celle piano non fa nulla (suona rifiuto)
- [ ] Tasto `N` (notte) e `M` (mute) restano funzionanti
- [ ] Cartello "OUT OF ORDER" visibile dal corridoio
- [ ] Annuncio vocale italiano all'attivazione/disattivazione

**Effort**: ~40 righe + texture cartello · **Rischio**: basso

---

## #7 — Numerazione camere hotel contestuale 🟢

**Obiettivo**: quando la cabina è ferma ai piani 4–6 (hotel), il display mostra la numerazione delle camere di quel piano (es. "Camere 401–432").

**Approccio**: calcolare il range di camere in base al piano. Aggiungere sezione nel `drawModernDisplay()` sotto il piano corrente.

**Posizione codice**:
- Sezione `RENDER DEL DISPLAY TOUCH` (~riga 2456)

**Modifiche**:

```js
// helper:
function floorRoomRange(f) {
  // piani 4-6 sono hotel, ogni piano 32 camere
  if (f >= 4 && f <= 6) {
    const start = f * 100 + 1;
    const end = start + 31;
    return `Camere ${start}–${end}`;
  }
  if (f === 0) return 'Lobby · Reception';
  if (f >= 1 && f <= 3) return `Uffici ${f}° piano`;
  if (f >= 7) return `Attico · Suite ${f}0${f}`;
  return '';
}
```

```js
// in drawModernDisplay(), sotto il "piano corrente gigante":
const range = floorRoomRange(state.currentFloor);
if (range && !state.isMoving) {
  ctx.font = '20px sans-serif';
  ctx.fillStyle = '#8af';
  ctx.fillText(range, cx, 230);
}
```

**Acceptance**:
- [ ] Al piano 4 mostra "Camere 401–432"
- [ ] Al piano 0 mostra "Lobby · Reception"
- [ ] Non visibile durante movimento

**Effort**: ~15 righe · **Rischio**: basso

---

## #8 — Orologio mondiale sul pannello pubblicitario 🟢

**Obiettivo**: affiancare all'orologio analogico di Roma una griglia compatta con orari di NY, Tokyo, Londra.

**Approccio**: aggiungere una 6ª schermata al pannello pubblicitario rotante, oppure aggiungere sotto-tabella fissa sempre visibile. Scelta: **schermata aggiuntiva** (mantiene la rotazione a 5->6).

**Posizione codice**:
- Sezione `PANNELLO PUBBLICITARIO LATERALE` (~riga 644), `updateAdScreen(now)` (~riga 934)

**Modifiche**:

```js
// in updateAdScreen(), aggiungere case 5 (6ª schermata):
case 5: drawWorldClocks(ctx, w, h); break;
```

```js
// nuova funzione drawWorldClocks:
function drawWorldClocks(ctx, w, h) {
  // sfondo blu notte
  ctx.fillStyle = '#0a1530'; ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = '#ffd66b';
  ctx.font = 'bold 22px Georgia';
  ctx.fillText('OROLOGIO MONDIALE', 20, 35);
  const now = new Date();
  const cities = [
    { name: 'Roma',     tz: 'Europe/Rome',    flag: '🇮🇹' },
    { name: 'New York', tz: 'America/New_York', flag: '🇺🇸' },
    { name: 'Tokyo',    tz: 'Asia/Tokyo',     flag: '🇯🇵' },
    { name: 'Londra',   tz: 'Europe/London',  flag: '🇬🇧' },
    { name: 'Sydney',   tz: 'Australia/Sydney', flag: '🇦🇺' },
  ];
  ctx.font = '18px sans-serif';
  let y = 70;
  cities.forEach(c => {
    try {
      const t = now.toLocaleTimeString('it-IT', { timeZone: c.tz, hour: '2-digit', minute: '2-digit' });
      ctx.fillStyle = '#fff'; ctx.fillText(`${c.flag} ${c.name}`, 25, y);
      ctx.fillStyle = '#ffd66b'; ctx.fillText(t, w - 110, y);
    } catch(e) {}
    y += 32;
  });
}
```

**Acceptance**:
- [ ] 6ª schermata visibile per 12s nel ciclo
- [ ] Orari corretti (verificare con `toLocaleTimeString`)
- [ ] Fallback graceful se timezone non supportata

**Effort**: ~30 righe · **Rischio**: basso (timezone API è stabile)

---

## Checklist comune

- [ ] Aggiungere `O` e `B` (background music) al `panel-help` HUD
- [ ] Aggiornare `README.md` con le 4 funzionalità
- [ ] Aggiornare `PIANO_MIGLIORAMENTI.md` §4 con nuova fase o bug-fix
- [ ] Testare annuncio vocale per "fuori servizio"
- [ ] Sincronizzare `dist/index.html`
