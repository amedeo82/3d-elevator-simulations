# Sviluppo e deploy

[← Torna al README](../README.md)

## Dove trovare cosa

La documentazione tecnica è frammentata su file dedicati. Non duplichiamo
qui nulla: ogni file è la fonte autorevole del suo argomento.

| Argomento | File autorevole |
|---|---|
| Diagrammi architetturali, flussi dati | [`ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Mappa delle sezioni di `elevator.html` | [`AGENTS.md`](../AGENTS.md) § "Layout del file" |
| Audit campo per campo di `state` | [`STATE.md`](../STATE.md) |
| Mappatura chiavi i18n IT/EN | [`STRINGS_REFERENCE.md`](../STRINGS_REFERENCE.md) |
| Regole e contratti D-key | [`AGENTS.md`](../AGENTS.md) |
| Storico implementativo | [`PIANO_MIGLIORAMENTI.md`](../PIANO_MIGLIORAMENTI.md) |

> **Nota**: la sezione "Modello dati" che era nel vecchio README conteneva
> uno snapshot inline di `state` e `HOTEL_CONFIG`. È stata rimossa perché
> era già superato: [`STATE.md`](../STATE.md) è il riferimento dichiarato e
> copre ogni campo con contratto, writer e reader.

## 📁 Struttura del progetto

```
.
├── elevator.html          # File principale (~500 KB, ~11.400 righe) — tutta la simulazione
├── tests.html             # Test framework (285 test su window.BossHotelPure)
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

Il progetto include un mini test framework vanilla in `tests.html`. Esegue **285 test** su funzioni pure esposte in `window.BossHotelPure`.

```bash
# Opzione A — runner headless, identico a quello della CI
npm install --no-save --no-audit --no-fund playwright@1.56.0
npx playwright install chromium
node scripts/run-tests.js     # stampa "OK: 285/285 test passati", exit 1 se uno fallisce

# Opzione B — ispezione manuale nel browser
python3 -m http.server 8000
# apri http://localhost:8000/tests.html
# Risultato atteso: banner verde "TUTTI PASS". Esporta JSON con il bottone.
```

> Serve un server HTTP, mai `file://`: `tests.html` carica `elevator.html` in
> un iframe sandbox e `elevator.html` è un ES module con importmap, che su
> `file://` non si carica per CORS.

### Verifica sintassi + brace balance

Prima di committare, esegui il check sintattico autorevole:

```bash
node scripts/check-balance.js elevator.html
```

Output atteso: `Tutti i check autorevolativi passati.`


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


## 🚀 Deploy

Il progetto è un singolo file statico, quindi può essere deployato ovunque:

### Opzione 1: GitHub Pages (consigliata per repo pubblici)
1. Metti il progetto in un repo GitHub pubblico
2. Settings → Pages → Source: `main` branch, `/ (root)` → Save
3. Apri `https://<user>.github.io/<repo>/` (oppure `https://<user>.github.io/<repo>/elevator.html`
   se preferisci non rinominare). Il file `dist/index.html` è una copia identica
   di `elevator.html` e può essere servito direttamente come `<root>/index.html`.

### Opzione 2: Netlify / Vercel / Cloudflare Pages
1. Connetti il repo o trascina la cartella del progetto sulla dashboard
2. Il sito sarà live in pochi secondi (nessuna build, nessuna env var)

### Opzione 3: Server proprio (S3, nginx, Apache, …)
Copia `elevator.html` (rinominato in `index.html`) sul web server. Non servono
header particolari: è un singolo file statico con dipendenza CDN (three.js via
importmap).

