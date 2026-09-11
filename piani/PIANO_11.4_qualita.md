# Piano §11.4 — Robustezza e qualità

**Riferimento**: `PIANO_MIGLIORAMENTI.md` §11.4 · **Funzionalità**: 3 · **File**: `elevator.html`

Tre interventi di manutenzione/qualità. Tutti a basso rischio, alto valore.

---

## #13 — Verifica accessibilità tastiera nel corridoio 🟡

**Obiettivo**: verificare che `WASD` non muova la camera quando si è nella cabina, e che i tasti `1`–`9` (vedi #10) non chiamino piani quando si è nel corridoio.

**Approccio**: leggere l'attuale gestione `WASD` (~riga 3278) e verificare i guard. Se assenti, aggiungerli.

**Posizione codice**:
- Sezione `MOVIMENTO FPS` (~riga 3278)

**Verifica**:

```bash
grep -n "keydown\|WASD\|state.playerInCabin" elevator.html
```

**Modifiche attese**:

```js
// nel handler WASD, ipotetico pattern attuale:
if (state.playerInCabin) return; // ← deve essere presente in ogni sotto-handler

// oppure, se manca, aggiungere:
window.addEventListener('keydown', (e) => {
  if (state.playerInCabin) return; // blocca tutto WASD quando in cabina
  // ... W A S D handling
});

// anche per i tasti 1-9 (vedi #10):
if (!state.playerInCabin) { /* prenota + apri */ } else { requestFloor(n); }
```

**Acceptance**:
- [ ] Test manuale: in cabina, premere `W` → la camera NON si muove
- [ ] Test manuale: nel corridoio, premere `5` → la cabina NON chiama il 5 se le porte sono chiuse (deve prima aprirle o stare nel corridoio)
- [ ] Nessun drift posizione dopo 60 secondi di inattività in cabina

**Effort**: ~5 righe (probabilmente già presente, da verificare) · **Rischio**: basso

---

## #14 — Logica passeggeri coerente 🟢

**Obiettivo**: i passeggeri salgono/scendono in modo realistico in base al piano e all'apertura porte. Oggi cambiano randomicamente ogni 8s.

**Approccio**: aggiungere logica condizionata in `buildCorridor()` (all'apertura porte). I passeggeri cambiano in base al tipo di piano:
- Lobby (T): salgono (1–3 nuovi)
- Uffici (1–3): scendono (–2 passeggeri)
- Hotel (4–6): +/– 1
- Attico (7–9): salgono (+1)

**Posizione codice**:
- Sezione `LOOP` (~riga 3378) — `state.passengers` gestione
- Funzione `buildCorridor()` (~riga 2107)

**Modifiche**:

```js
// in state, rimuovi l'autovariazione randomica esistente e aggiungi:
_lastPassengerChange: 0, // già esistente
```

```js
// nuova funzione:
function adjustPassengersForFloor(floor) {
  let delta = 0;
  if (floor === 0) delta = Math.floor(Math.random() * 3); // lobby: 0-2 entrano
  else if (floor >= 1 && floor <= 3) delta = -Math.min(state.passengers, 2); // uffici: escono
  else if (floor >= 4 && floor <= 6) delta = Math.random() < 0.5 ? -1 : 1;
  else if (floor >= 7) delta = 1; // attico: salgono
  state.passengers = Math.max(0, Math.min(8, state.passengers + delta));
}
```

```js
// in buildCorridor() (in cima alla funzione):
adjustPassengersForFloor(floor);
markDisplayDirty(); // aggiorna icona 👤
// Rimuovi il setInterval/setTimeout randomico esistente
```

**Acceptance**:
- [ ] Dopo 5 viaggi random Terra→3→Terra, i passeggeri sono coerenti (saliti in lobby, scesi in uffici)
- [ ] Mai più di 8, mai meno di 0
- [ ] Display si aggiorna immediatamente all'apertura porte

**Effort**: ~25 righe · **Rischio**: basso (rimpiazza logica esistente)

---

## #15 — Persistenza preferenze in localStorage 🟡

**Obiettivo**: `muted`, `ttsEnabled`, `nightMode` (e in futuro `lang`) permangono dopo refresh.

**Approccio**: aggiungere `loadPrefs()` in AVVIO, `savePrefs()` ad ogni cambio stato.

**Posizione codice**:
- Sezione `AVVIO` (~riga 3454)
- Sezione `STATO GLOBALE` (~riga 308) — toggle `M`, `V`, `N`
- Sezione `LISTENERS TASTIERA` (~riga 3278)

**Modifiche**:

```js
// nuove funzioni (in cima al file o dopo CONFIGURAZIONE):
const PREFS_KEY = 'bossPrefs';
function loadPrefs() {
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (typeof p.muted === 'boolean') state.muted = p.muted;
    if (typeof p.ttsEnabled === 'boolean') ttsEnabled = p.ttsEnabled;
    if (typeof p.nightMode === 'boolean') state.nightMode = p.nightMode;
    if (typeof p.lang === 'string' && (p.lang === 'it' || p.lang === 'en')) LANG = p.lang;
  } catch(e) {}
}
function savePrefs() {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify({
      muted: state.muted,
      ttsEnabled: ttsEnabled,
      nightMode: state.nightMode,
      lang: LANG || 'it',
    }));
  } catch(e) {}
}
```

```js
// in AVVIO (riga ~3454), prima di tutto:
loadPrefs();
// applica subito nightMode:
if (state.nightMode) applyNightMode();

// in ogni handler toggle, dopo aver cambiato stato, chiamare:
savePrefs();
// Esempio handler M esistente (~riga 3360):
//   state.muted = !state.muted; savePrefs();
```

**Acceptance**:
- [ ] Premere `M` (mute), refresh → resta muto
- [ ] Premere `N` (night), refresh → resta in night mode
- [ ] Premere `V` (TTS off), refresh → TTS resta off
- [ ] Fallback graceful se localStorage non disponibile (es. iframe)

**Effort**: ~25 righe · **Rischio**: basso

---

## Checklist comune

- [ ] Test keyboard lock per cabina/corridoio
- [ ] Test passeggeri su 10+ viaggi
- [ ] Test localStorage in vari browser (incluso Firefox strict mode)
- [ ] Aggiornare `README.md` con sezione "Preferenze persistenti"
