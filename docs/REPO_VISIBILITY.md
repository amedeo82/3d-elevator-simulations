# Visibilità del repository GitHub

Setup della pagina del repo su GitHub per chi atterra da mobile, dalla lista
repo del profilo o dai risultati di ricerca. Segue la checklist "Test dei 10
secondi" di `AGENTS.md` § "Visibilità dei repository": chi arriva capisce
subito il valore del progetto e può provarlo senza clonare il codice.

Le regole **manuali** (campo Website, Topics, descrizione About) vivono nelle
impostazioni GitHub del repo e non sono verificabili da una CI: vanno
controllate e fatte a mano. Quelle **automatiche** (link demo nel README,
screenshot aggiornati, GIF hero) sono versionate in questo repository.

---

## 1. Demo Live

**Stato attuale**: il link demo nel README punta a
`https://amedeo82.github.io/3d-elevator-simulations/` e un pulsante "Live
Demo" campeggia subito sotto la GIF hero. La `dist/index.html` è mantenuta
identica a `elevator.html` (parità SHA-256 verificata in CI, vedi
`AGENTS.md` § "Sequenza di verifica obbligatoria") quindi la demo pubblicata
coincide sempre con il sorgente verificato.

**Da fare a mano** (una volta sola, lato UI GitHub):

1. Apri la pagina del repo su GitHub → clicca la ⚙️ accanto a "About" (sidebar destra).
2. Campo **Website**: incolla `https://amedeo82.github.io/3d-elevator-simulations/`
   (o il dominio custom se in futuro migri a Vercel/Netlify).
3. **Description** (una riga): una frase che spieghi il progetto e inviti a
   provare la demo. Esempio:
   > Simulatore 3D in prima persona di un ascensore di hotel di lusso,
   > giocabile nel browser. Un singolo file HTML, zero dipendenze.
4. Conferma con **Save changes**.

**Verifica post-deploy**: apri il link in **finestra di navigazione in
incognito** e controlla che:
- la demo si carichi senza errori nella console del browser;
- lo start screen sia raggiungibile e il bottone "Entra nell'ascensore"
  risponda al click (i test UI di D29/D31 coprono questo solo in locale;
  l'incognito è il test reale lato visitatore).

---

## 2. GitHub Topics

I Topics sono il canale di scoperta via `github.com/topics/<tag>` e pesano
nella ricerca interna. **Da fare a mano** (pagina repo → ⚙️ About → Topics):

Per questo progetto, in ordine di importanza:

```
threejs
webgl
3d
simulator
elevator
javascript
html5
game
first-person
single-file
```

Limite GitHub: 20 topic. I primi quattro sono quelli che contano di più per
la scoperta.

---

## 3. README visivo

Stato corrente del README (vedi `README.md`):

1. **GIF hero** in cima (`docs/images/demo.gif`, ~3 MB, 10-15s a 8 fps):
   avvio → cabina → chiamata piano → arrivo → corridoio. Autoplay su GitHub.
2. **Pulsante "Live Demo"** ben visibile sotto la GIF (badge
   `for-the-badge` giallo con icona ▶), link alla GitHub Page.
3. **Indice** subito dopo.
4. **Galleria** con 6 screenshot di alta qualità in `docs/images/*.webp`,
   generati dallo script di cattura (sezione 5 sotto).

Quando la UI cambia in modo visibile (nuovo Polish Pack, restyle importante,
nuovo overlay) **rigenera** la galleria + la GIF con lo script, vedi
sezione 5.

---

## 4. Riferimenti nel codice

I link alla demo devono essere **allineati** in più punti (sono tre posti
diversi, vedi `AGENTS.md` § "Regole di aggiornamento della documentazione"):

| Punto | File | Cosa |
|---|---|---|
| Badge "Live" nel README | `README.md` riga 3 | `https://img.shields.io/.../GitHub%20Pages-Live-blue` con link |
| GIF hero | `README.md` riga 12 | `<a href="..."><img src="docs/images/demo.gif"></a>` |
| Pulsante "Live Demo" | `README.md` riga 16 | badge `for-the-badge` linkato |
| Demo URL esplicito | `README.md` riga 20 | link testuale diretto |

Cambio URL demo (es. migrazione Pages → Vercel, o rename del repo che cambia
il path GitHub Pages) → aggiorna **tutti e quattro** nello stesso commit, più
il campo Website della sezione About (manuale).

---

## 5. Come rigenerare le immagini della galleria e la GIF

Lo script `scripts/capture-visuals.js` produce, in una singola esecuzione:

- `docs/images/demo.gif` — la GIF hero (10-15s, 8 fps, ≤ 4 MB);
- `docs/images/start-screen.webp` — schermata di avvio;
- `docs/images/cabina.webp` — vista dalla cabina verso le porte aperte;
- `docs/images/pulsantiera.webp` — primo piano del pannello touch (parete
  destra della cabina, inquadrato via pointer-lock mouse-look);
- `docs/images/corridoio.webp` — corridoio del piano 9 (attico) con
  arredi, dopo l'uscita dalla cabina;
- `docs/images/manutenzione.webp` — overlay manutenzione (Shift+M);
- `docs/images/mobile.webp` — corridoio su iPhone 15 Pro landscape
  (852×393, deviceScaleFactor 3) con HUD compatto D35.

### Prerequisiti

Stesse dipendenze dei runner di test, più `ffmpeg` nel `PATH`:

```bash
npm install --no-save --no-audit --no-fund playwright@1.56.0
npx playwright install chromium
# ffmpeg: scaricarlo da https://www.gyan.dev/ffmpeg/builds/ o via package manager
```

### Esecuzione

```bash
node scripts/capture-visuals.js
```

Lo script avvia un server statico su una porta effimera, lancia Chromium
headless con WebGL via SwiftShader (gli stessi arg dei test UI), e cattura
tutte le immagini in circa 60-90 secondi. Le catture passano per CDP
`Page.startScreencast` (più rapido di `Page.captureScreenshot` in ambiente
SwiftShader, vedi `D31` in `AGENTS.md`). La GIF viene assemblata con
`ffmpeg` (palettegen + paletteuse con dithering Bayer).

### Note implementative (per chi mette mano allo script)

- `D31`: mai `page.screenshot()` su questa app (timeout sul loop RAF
  continuo). Si usa `Page.captureScreenshot` (per la galleria) o
  `Page.startScreencast` (per la GIF) tramite CDP.
- `D26est` / `D20`: il viewport GIF deve restare **desktop** — la soglia
  `isViewportMobile()` è `width ≤ 900 || height ≤ 500`, quella
  `isMobileDevice()` è `Math.min(...) ≤ 768`. Lo script usa 1024×800 per
  restare sopra entrambe, altrimenti i tasti 1-9 vengono short-circuitati
  (D26est) e la chiamata del piano non parte.
- `dt` clamp a 0.05s nel loop: le attese fisse non funzionano a fps bassi
  (SwiftShader). Lo script **polla lo stato DOM** (`#statusText` per
  arrivo, `body.corridor-mode` per l'uscita) invece di usare tempi
  arbitrari. Vedi `waitForArrival` e `waitForCorridorMode` nel sorgente.
- `exitCabin` richiede `state.doorsOpen && !state.isMoving`: a volte lo
  status passa a "In attesa" prima che le porte siano completamente aperte
  (buildCorridor è pesante su SwiftShader). Lo script ritenta il click di
  uscita in loop finché `body.corridor-mode` non viene impostata.
- La rotazione della camera (per inquadrare il pannello) usa un cursore
  mouse **monotono**: con il pointer lock attivo, ricentrare il mouse
  produrrebbe un delta negativo che annulla la rotazione. Vedi
  `makeRotator` nel sorgente.
- Contratto 7 (`AGENTS.md`): nessun processo Chrome dell'utente viene
  toccato. Lo script lancia e chiude solo il Chromium di Playwright con
  `browser.close()` esplicito.
- Su mobile si evita il viaggio completo: si esce al piano 0 (Terra)
  dove le porte sono già aperte e l'uscita è istantanea, senza dipendere
  dal `dt` clamp a fps bassi su display `852×393 @3x`.

### Quando rigenerare

La regola operativa è in `AGENTS.md` § "Regole di aggiornamento della
documentazione": ogni PR che cambia l'aspetto visibile della UI aggiorna
anche screenshot e hero del README. In pratica:

- chiusura di un Polish Pack;
- nuovo overlay UI (es. manutenzione, customizer, tutorial);
- restyle dell'HUD (es. D35 compatto landscape);
- cambio nel tema di un corridoio.

Per fix interni o modifiche di logica che non cambiano l'aspetto esterno
(aggiunta di un helper puro, fix TDZ, ecc.) la galleria resta invariata.

---

## 6. Limiti strutturali noti

- Il campo **Website** di About, i **Topics** e la **descrizione** vivono
  nelle impostazioni GitHub, non nei file del repo: nessuna CI può
  verificarli. Vanno controllati a mano quando cambiano. L'unica verifica
  reale è l'apertura in incognito della pagina del repo: la demo parte, lo
  start screen è raggiungibile, la GIF si autoplay, il pulsante "Live
  Demo" rimanda alla GitHub Page.
- La GIF è di 3 MB: GitHub la accetta senza problemi (limite pratica ~10
  MB), ma se in futuro si supera conviene passare al pattern video
  `<a href="demo.mp4"><img src="thumbnail.webp"></a>` documentato in
  `AGENTS.md` § "Visibilità dei repository".
- Lo script di cattura è vincolato a un Chromium con WebGL via SwiftShader
  (l'unica opzione in headless). Se Three.js o three.js addons rompessero la
  compatibilità con SwiftShader, la cattura si rompe e va aggiornato il
  viewer (passare a `chrome` con `--headless=new` se WebGL nativo torna
  supportato in futuro).
