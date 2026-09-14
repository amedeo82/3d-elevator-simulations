# Piano V2 — Roadmap Interattiva
**Documento di design e implementazione iterativa per BOSS HOTEL Elevator 3D**

> Versione 1.0 — Aperto 2026-09-12
>
> Questo documento raccoglie i suggerimenti emersi dall'analisi post-v1.8 e li
> organizza in **step implementativi** da eseguire **uno alla volta** in sessioni
> di coding interattive. Per ogni step il documento elenca le **domande di
> decisione** che porrò all'utente (via `question` tool) prima di scrivere codice,
> così che ogni intervento sia approvato esplicitamente.
>
> Stato backlog §11: **22/22 (100%)** — V2 è completamente additivo, non sostituisce
> feature esistenti. Stato v1.8 hotfix porte camere: merged.

---

## 0. Indice degli step

| # | Step | Sforzo | Impatto | Tipo | Stato |
|---|---|---|---|---|---|
| 1 | Salute del codice: CI, AGENTS.md, audit `state`, event bus | 1 sessione | 🟡 | Refactor | ✅ |
| 2 | UX invisibile: sensore IR ostacolo + tutorial prima volta | 1 sessione | 🔴 | Polish | ✅ |
| 3 | Audio contestuale corridoi + musica ristorante piano 8 | 1 sessione | 🟡 | Feature | ✅ |
| 4 | Meteo evoluto: stagionalità + nuove condizioni | 1 sessione | 🟡 | Feature | ✅ |
| 5 | Personalizzazione hotel (`HOTEL_CONFIG`) | 1 sessione | 🔴 | Refactor+Feature | ✅ |
| 6 | D2 — PWA installabile (manifest inline) | 1 sessione | 🟢 | Feature | ⏳ |
| 7 | D7 — Pulsantiera ▲/▼ semantica (intenzione viaggio) | 1 sessione | 🟡 | Feature | ✅ |
| 8 | i18n IT/EN (backlog #12) | 1-2 sessioni | 🔴 | Refactor+Feature | ⏳ |
| 9 | Shaft "dietro le quinte" + animazione micro porte | 1-2 sessioni | 🟢 | Feature | ⏳ |
| 10 | Eventi speciali hotel (matrimonio, conferenza) | 1 sessione | 🟢 | Feature | ⏳ |
| 11 | L-block: più piani parametrico + texture HD arredi | 1-2 sessioni | 🟡 | Feature | ⏳ |
| 12 | Test framework leggero (unit test funzioni pure) | 1 sessione | 🟡 | DX | ⏳ |
| 13 | Long-term: WebXR, multi-cabina, multiplayer | future | 🟢 | Vision | ⏳ |
| 14 | Citofono interattivo + pairing con tasto SOS | 1 sessione | 🟡 | Polish | ⏳ |

**Legenda stato**: ⏳ pending · 🔄 in corso · ✅ done · ❌ scartato

---

## Come funziona la sessione interattiva

Per ogni step:
1. Apro la sezione dello step e leggo le **Decision Questions**.
2. Uso il tool `question` per fare 1 domanda alla volta, con 2-5 opzioni + "Recommended" dove opportuno.
3. Implemento **solo** le opzioni approvate, nello scope approvato.
4. Aggiorno questo documento segnando lo step come ✅.
5. Faccio `node --check` sul JS estratto + brace balance + (se disponibile) `tests.html`.

---

# STEP 1 · Salute del codice: CI + AGENTS.md + audit `state`

## Scope proposto
- **1a**. Creare `.github/workflows/ci.yml` minimale (2 step: `node --check` + brace balance). Previene la classe di bug "riferimento orfano" già vista 3 volte (`eZ`, `mat`, `drawDisplay`).
- **1b**. Creare `AGENTS.md` con: layout sezioni + convenzioni codice (no emoji, italiano, niente commenti superflui) + comandi build/test + decisioni D-key aperte + lezione "state in cima".
- **1c**. Audit `state` object: produrre una **tabella** (in `AGENTS.md` o file separato `STATE.md`) con tutti i 25+ campi, chi li legge, chi li scrive, e contratti (es. "X è true solo se Y").
- **1d**. Introdurre un **mini event bus** (`bus.emit/on`) per disaccoppiare: `door:opened`, `door:closed`, `door:obstacle`, `floor:arrived`, `floor:passed`, `alarm:on`, `alarm:off`, `ooo:on`, `ooo:off`, `cabin:entered`, `cabin:exited`. Refactor minimo di `scheduleAutoClose` ↔ `tickPlayer` ↔ `drawModernDisplay` per usare gli eventi invece di polling su `state.doorsActual`. **Probabilmente previene il bug di Fase 17.**

## Decision Questions

### Q1.1 — Scope di questo step
Cosa vuoi includere in Step 1?

- **A. Tutto (1a + 1b + 1c + 1d)** — refactor ampio, alto valore strutturale *(Recommended)*
- **B. Solo CI + AGENTS.md (1a + 1b)** — solo fondazione, niente refactor codice
- **C. Solo event bus (1d)** — focus su disaccoppiamento, CI in step separato
- **D. Altro** — dimmi tu cosa combinare

### Q1.2 — Approccio event bus
Se scegli 1d, come vuoi realizzarlo?

- **A. Mini bus homemade** (`const bus = { _h:{}, on(e,fn){...}, emit(e,p){...} }`) — ~20 righe, zero dipendenze *(Recommended)*
- **B. Pattern callback diretto** (funzioni `onDoorOpened(cb)`) — più verboso ma type-safe
- **C. Stato globale + observer pattern** — overengineering per la scala del progetto

### Q1.3 — Profondità audit `state`
Per 1c, quanto dettaglio?

- **A. Tabella markdown** in `AGENTS.md` con colonne: campo | tipo | scritto da | letto da | contratti *(Recommended)*
- **B. Tabella + assert runtime** in dev mode (`if (DEBUG && invariant_violated) console.warn(...)`)
- **C. Solo README tabellare**, niente assert

### Q1.4 — Decisioni D-key da includere in `AGENTS.md`
Quali decisioni documentare come "contratti di progetto"?

- **A. Singolo file HTML sempre** (blocco D2 PWA)
- **B. Stato in cima al file** (lezione §10.1)
- **C. No emoji nel codice** (solo README/HUD)
- **D. Commenti in italiano + sezioni numerate**
- **E. Tutte le precedenti** *(Recommended)*

### Q1.5 — Branch / merge strategy
Come vuoi gestire il branch?

- **A. Branch dedicato** `feature/polish-pack-v2-step-1`, merge su `main` dopo validazione *(Recommended)*
- **B. Commit diretti su `main`** (continua il pattern bug-fix)
- **C. Più commit separati sul branch** (uno per 1a/1b/1c/1d)

## Acceptance criteria
- [ ] `node --check` su JS estratto: exit 0
- [ ] Brace/paren balance: 0/0
- [ ] (se 1a) workflow CI visibile in `.github/workflows/`
- [ ] (se 1b) `AGENTS.md` ≤ 200 righe con tutte le sezioni richieste
- [ ] (se 1c) tabella `state` ha tutti i campi
- [ ] (se 1d) refactor di almeno 3 catene di polling sostituite da eventi; nessuna regressione funzionale (le feature esistenti funzionano identiche)

## Effort
1 sessione (~2-4 ore di lavoro effettivo).

---

# STEP 2 · UX invisibile: sensore IR ostacolo + tutorial prima volta

## Scope proposto
- **2a**. **Sensore IR anti-ostacolo**: quando il giocatore è sulla soglia della cabina (player distance to doorway < threshold) e le porte stanno chiudendosi, blocca chiusura + riapre + beep + annuncio vocale "Le porte rilevano un ostacolo". Implementa realmente ASME A17.1 §2.13.5 (reopening device). Oggi non c'è e il giocatore può essere "schiacciato" dalle porte se ci si mette davanti.
- **2b**. **Tutorial contestuale prima volta**: al primo avvio (flag `localStorage.bossHotelOnboarded@v1`), tooltip animati su: `E` per uscire, `M` muto, `1-9` per piani, `O` fuori servizio, `K` vocale. Tasto `?` per rivederlo in-game. Si integra con la start screen carosello esistente.

## Decision Questions

### Q2.1 — Scope di questo step

- **A. Solo sensore IR (2a)** — qualità tecnica, alta priorità ADA *(Recommended)*
- **B. Solo tutorial (2b)** — onboarding, qualità UX
- **C. Entrambi (2a + 2b)** — UX completa
- **D. Altro**

### Q2.2 — Sensore IR: comportamento vocale

Quale annuncio quando l'ostacolo blocca le porte?

- **A. "Attenzione. Le porte rilevano un ostacolo."** — simile allo stile italiano esistente *(Recommended)*
- **B. Beep + lampeggio LED rosso sopra porte**, niente TTS (minimo impatto audio)
- **C. Solo beep IR** (stile ascensore reale: nessuna parola)

### Q2.3 — Sensore IR: timeout

Le porte reali dopo 20-25s forzano la chiusura a "energia ridotta" (nudging). Cosa fare?

- **A. Nessun timeout** — le porte restano aperte finché c'è ostacolo *(Recommended per semplicità, simulazione non ha passeggeri veri)*
- **B. Timeout 15s con beep acuto + chiusura forzata** — fedele ASME A17.1 §2.13.5
- **C. Timeout configurabile** via stato

### Q2.4 — Tutorial: riassumibile?

- **A. Tasto `?` apre schermata con elenco comandi + riassunto** *(Recommended)*
- **B. Solo al primo avvio**, mai più
- **C. Tasto `?` + voce "Premi H per aiuto" se inattivo 30s in-game

### Q2.5 — Tutorial: HUD overlay vs pannello separato

- **A. Overlay semi-trasparente con cards scorrevoli** (stile slide esistenti) *(Recommended)*
- **B. Pannello laterale retrattile** con tutti i comandi elencati
- **C. Tooltip contestuale** che appare vicino all'elemento quando serve

## Acceptance criteria
- [ ] (se 2a) posizionandosi sulla soglia mentre le porte chiudono → blocco + riapertura + annuncio
- [ ] (se 2a) TTS disabilitato → annuncio sostituito da beep + sottotitolo HUD
- [ ] (se 2b) `localStorage.bossHotelOnboarded@v1` salvato dopo prima chiusura
- [ ] (se 2b) tasto `?` funziona anche in-game e in corridoio
- [ ] `node --check` + brace balance

## Effort
1 sessione.

---

# STEP 3 · Audio contestuale corridoi + musica ristorante piano 8

## Scope proposto
- **3a**. **Loop audio contestuale corridoio**: ogni tema ha un sottofondo audio unico che parte quando il giocatore è nel corridoio (e si spegne in cabina).
  - Lobby: brusio + tintinnio tazzine
  - Uffici: ticchettio tastiere lontano
  - Hotel: silenzio ovattato con ticchettio orologio
  - Attico: pianoforte lontano + vento
- **3b**. **Musica ristorante "La Terrazza"**: quando la cabina è ferma al piano 8 (il "piano ristorante" implicito nel menù pubblicitario), un loop audio sottile di sottofondo cena (chitarra classica + piatti lontani) udibile sia in cabina che nel corridoio.

## Decision Questions

### Q3.1 — Scope

- **A. Solo loop contestuali corridoio (3a)** — completa il pattern audio esistente *(Recommended)*
- **B. Solo musica ristorante (3b)** — feature di nicchia
- **C. Entrambi (3a + 3b)** — espansione audio completa
- **D. Solo 3a ma anche ristorante udibile dal corridoio del piano 8**

### Q3.2 — Loop corridoi: complessità

- **A. 1 layer per tema** (1 oscillator + filter) — minimale, costo zero
- **B. 2-3 layer per tema** (es. brusio = noise + tintinnio = square a 1200Hz modulato) *(Recommended)*
- **C. Sample audio registrati** (esclusi per vincolo single-file, no asset esterni)

### Q3.3 — Musica ristorante: trigger

- **A. Sempre quando cabina ferma al piano 8**, anche se in cabina
- **B. Solo in corridoio del piano 8** *(Recommended — più realistico)*
- **C. Solo quando la cabina è al piano 8 E l'utente ha cliccato sulla slide "menù ristorante" del pannello pubblicitario**

### Q3.4 — Rispetto delle preferenze esistenti

- **A. Rispetta `state.muted` come la musica contestuale esistente** *(Recommended)*
- **B. Rispetta `state.muted` + slider volume separato** (es. `state.corridorAudioVolume`)
- **C. Toggle dedicato `L`** per "audio ambientale corridoio" indipendente da mute globale

### Q3.5 — Interazione con musica cabin (Fase 13 #2)

La musica contestuale della cabina (jazz/classica) già esiste. Se il giocatore è al piano 8 e in cabina, suona sia cabin che ristorante?

- **A. Solo cabin** (ristorante si sente solo fuori cabina) *(Recommended)*
- **B. Mix** con crossfade dolce
- **C. Cabin prioritaria** (ristorante off quando si entra in cabina)

## Acceptance criteria
- [ ] (se 3a) ogni piano ha un audio unico udibile, distinguibile
- [ ] (se 3a) rispetta `state.muted`
- [ ] (se 3b) piano 8 riconosciuto come "ristorante", trigger corretto
- [ ] Nessuna regressione su `tickMusic` esistente
- [ ] `node --check` + brace balance

## Effort
1 sessione.

---

# STEP 4 · Meteo evoluto: stagionalità + nuove condizioni

## Scope proposto
- **4a**. **Stagionalità meteo**: pesi condizioni dipendono dal mese corrente (`new Date().getMonth()`). Es. novembre-marzo: +neve, +nebbia, –temporale; aprile-settembre: +sole, +caldo. Hook già pronto (`maybeRegenerateWeather`).
- **4b**. **3 nuove condizioni meteo**: grandine (cerchi grigi veloci), foschia (particelle lente bianche), vento (linee orizzontali animate). Si aggiungono alle 7 esistenti.

## Decision Questions

### Q4.1 — Scope

- **A. Solo stagionalità (4a)** — impatto narrativo immediato *(Recommended)*
- **B. Solo nuove condizioni (4b)** — varietà visiva
- **C. Entrambi (4a + 4b)** — meteo completo

### Q4.2 — Stagionalità: tabella pesi

- **A. Uso una tabella sensata che ti propongo** (2 stagioni: estate/inverno) *(Recommended)*
- **B. Tabella mensile** (12 variazioni) più realistica ma più codice
- **C. Solo effetto temperatura** (non condizioni)

### Q4.3 — Nuove condizioni: priorità visiva

Quali 3 (o meno) aggiungere?

- **A. Grandine, foschia, vento** *(Recommended)*
- **B. Solo grandine + foschia**
- **C. Solo grandine + vento**
- **D. Altro set** (es. aurora boreale, tempesta di sabbia,彩虹 arcobaleno)

### Q4.4 — Frequenza cambio meteo

Oggi: 50% ad ogni arrivo al piano. Confermi o modifichi?

- **A. 50% invariato** *(Recommended)*
- **B. 30%** (più "stabile", il giocatore nota il meteo persistente)
- **C. 70%** (più "vivo", quasi random)

### Q4.5 — Visualizzazione meteo sui display

Il pannello pubblicitario laterale mostra "meteo esteso con previsioni". Aggiornare con le nuove condizioni?

- **A. Sì, automaticamente** (hook in `drawAdScreen`) *(Recommended)*
- **B. Solo display touch cabina** + pannello pubblicitario resta con 5 condizioni base
- **C. Slide "meteo" rimossa** e sostituita con "meteo + previsioni 24h" più ricca

## Acceptance criteria
- [ ] (se 4a) a seconda del mese corrente, neve/foschia più probabili in inverno
- [ ] (se 4b) 3 nuove icone renderizzate correttamente
- [ ] Display touch + pannello pubblicitario aggiornati
- [ ] `node --check` + brace balance

## Effort
1 sessione.

---

# STEP 5 · Personalizzazione hotel (`HOTEL_CONFIG`)

## Scope proposto
- **5a**. **Centralizzare la config hotel**: oggetto `HOTEL_CONFIG = { name, address, stars, establishedYear, theme, manager, motto, ... }` in cima al codice, in sostituzione dei ~40 punti hardcoded "BOSS HOTEL" sparsi. Refactor meccanico delle stringhe in template literal: `${HOTEL_CONFIG.name}`.
- **5b**. **HUD interattivo "personalizza hotel"**: tasto `H` apre un pannello (overlay) dove modificare `name`, `address`, `theme` (4 preset corridoi). Salva in `localStorage.bossHotelConfig@v1`. La simulazione riparte con i nuovi valori.
- **5c**. Easter egg: 3 preset alternativi già precaricati ("Sky Tower Tokyo", "Hôtel de Paris Monaco", "Burj Al Arab Dubai") + custom.

## Decision Questions

### Q5.1 — Scope

- **A. Solo refactor centralizzazione (5a)** — nessuna feature visibile, ma abilita i18n e personalizzazione *(Recommended)*
- **B. Refactor + HUD personalizza (5a + 5b)** — feature completa
- **C. Refactor + HUD + preset (5a + 5b + 5c)** — massimo

### Q5.2 — Profondità HUD personalizza

Se scegli 5b, quali campi esporre?

- **A. Solo `name` + `address`** *(Recommended, essenziale)*
- **B. `name`, `address`, `stars`, `motto`, tema corridoio default
- **C. Tutto configurabile** (anche colori display, dimensioni, ecc.) — esplosione scope

### Q5.3 — Tema corridoio per piano

Ora il tema è legato al piano (T=lobby, 1-3=uffici, 4-6=hotel, 7-9=attico). Vuoi slegarlo?

- **A. Resta legato al piano** *(Recommended, default sensato)*
- **B. Configurabile per piano** (es. "al piano 3 voglio il tema hotel")
- **C. Tutto un tema solo** (scelta globale)

### Q5.4 — Preset alternativi (se scegli 5c)

Quali preset oltre BOSS HOTEL?

- **A. 3 preset miei proposti: Sky Tower Tokyo, Hôtel de Paris, Burj Al Arab** *(Recommended)*
- **B. Tu mi suggerisci i nomi** e io li implemento
- **C. Solo 1 preset "BOSS HOTEL" + custom** (no preset alternativi)

### Q5.5 — Refactor 5a: rischio rottura

Il refactor tocca ~40 punti. Confermi che vuoi procedere in step separato?

- **A. Sì, 5a in step a sé** *(Recommended)*
- **B. 5a + 5b + 5c nello stesso step** (più rischioso)

## Acceptance criteria
- [ ] (se 5a) `grep -n "BOSS HOTEL" elevator.html` restituisce solo le occorrenze dentro `HOTEL_CONFIG`
- [ ] (se 5a) visualmente identico al precedente
- [ ] (se 5b) overlay `H` funzionante, salvataggio persistente
- [ ] (se 5c) preset alternativi producono simulazione coerente
- [ ] `node --check` + brace balance

## Effort
1 sessione (5a) + 1 sessione (5b/5c) se li fai in 2 step.

---

# STEP 6 · D2 — PWA installabile (manifest inline)

## Scope proposto
- **6a**. **Manifest inline** via `<link rel="manifest" href="blob:...">`: oggetto JSON creato con `URL.createObjectURL(new Blob([...]))` iniettato all'avvio. Include `name`, `short_name`, `start_url`, `display: standalone`, `theme_color`, `background_color`, `icons` (SVG inline già esistente come favicon).
- **6b**. **Service Worker inline** via `URL.createObjectURL(new Blob([workerCode]))` con `type: 'application/javascript'`. Cache dell'HTML per offline-first.

## Decision Questions

### Q6.1 — Scope

- **A. Solo manifest (6a)** — installabilità minima, basso rischio *(Recommended)*
- **B. Solo service worker (6b)** — offline-first
- **C. Entrambi (6a + 6b)** — PWA completa

### Q6.2 — Service Worker: strategia cache

- **A. Cache-first con fallback network** (il file è già statico, perfetto per cache-first) *(Recommended)*
- **B. Network-first con fallback cache** (più "moderno" ma per statico è overkill)
- **C. Cache + versionamento** (`bossHotelCache@v1`) con auto-invalidation su update

### Q6.3 — Theme color

Quale colore tema usare?

- **A. Nero notte `#0a0e1a`** (già il tono del display touch) *(Recommended)*
- **B. Oro dorato `#c9a449`** (brand BOSS HOTEL)
- **C. Blu profondo `#0f1e3d`** (hotel 5★ notte)

### Q6.4 — Icone PWA

- **A. Solo SVG inline** (quello già usato come favicon)
- **B. SVG inline + 2 varianti PNG generate runtime** (canvas → blob per 192×192 e 512×512)
- **C. Solo icona SVG, niente PNG** *(Recommended, minimo sforzo)*

### Q6.5 — Conferma vincolo single-file

Il pattern blob URL è single-file ma richiede `URL.createObjectURL` — sei OK a confermare che resta single-file?

- **A. Sì, è ancora single-file** *(Recommended)*
- **B. Voglio aggiungere `manifest.json` e `sw.js` come file separati** (rompe vincolo ma standard)

## Acceptance criteria
- [ ] (se 6a) browser mostra prompt "Installa BOSS HOTEL" su Chrome/Edge
- [ ] (se 6b) offline mode funziona (DevTools → Network → Offline)
- [ ] Nessun file aggiunto alla repo (eccetto `.github/` per CI)
- [ ] `node --check` + brace balance

## Effort
1 sessione.

---

# STEP 7 · D7 — Pulsantiera ▲/▼ semantica (intenzione di viaggio)

## Scope proposto
- **7a**. Refactor `requestFloor` per accettare `directionHint` (`'up' | 'down' | null`).
- **7b**. Pulsantiera esterna `▲/▼` aggiunge il piano corrente alla coda **con direzione esplicita**: `requestFloor(currentFloor, directionHint)`.
- **7c**. Visualizzazione "intenzione": sul cartello del corridoio e sul display touch, quando la cabina è vuota, freccia direzione diventa verde se la coda è coerente con direzione chiamante.
- **7d**. Routing: se ▲ al piano 3 e la cabina è al piano 7, la cabina scende al 3; se ▼ al piano 7 e la cabina è al 3, la cabina sale al 7. Se ▲ al piano 7 (il più alto), beep rifiuto + messaggio "Sei già al piano più alto".

## Decision Questions

### Q7.1 — Scope

- **A. Refactor minimo (7a + 7b + 7d)** — la pulsantiera mantiene promessa UX *(Recommended)*
- **B. Refactor + visualizzazione (7a + 7b + 7c + 7d)** — completo
- **C. Solo 7d (routing intelligente)** senza espandere semantica

### Q7.2 — Comportamento al piano più alto/basso

Cosa succede se l'utente preme ▲ al piano 9?

- **A. Beep rifiuto (220Hz) + messaggio HUD "Sei già al piano più alto"** *(Recommended)*
- **B. Beep + annuncio vocale "Sei al piano più alto, prego"**
- **C. Disabilitazione visiva del tasto** (▲ grigio al piano 9, ▼ grigio al piano T)

### Q7.3 — Visualizzazione "intenzione" (se scegli 7c)

- **A. Freccia ▲/▼ sul cartello corridoio cambia colore** (verde/ambra/rossa) in base a coerenza
- **B. Aggiunta icona "↻" sulla pulsantiera esterna** se cabina sta arrivando
- **C. Entrambe**

### Q7.4 — Coda: modello attuale vs nuovo

Oggi la coda è un `Set<number>`. Con direzione diventa `Map<floor, direction>` o array di `{floor, dir}`. Cosa preferisci?

- **A. `Map<floor, 'up'|'down'>`** — preserva compat *(Recommended)*
- **B. Array di oggetti `{floor, direction}`** — più esplicito
- **C. Due Set separati** (`requestedUp`, `requestedDown`)

### Q7.5 — Test di regressione

- **A. Aggiungere scenario di test nel piano** (sezione "Verifiche") *(Recommended)*
- **B. Solo test manuale**

## Acceptance criteria
- [ ] ▲ al piano 3 con cabina al 7 → cabina scende a 3 (test manuale)
- [ ] ▼ al piano 9 con cabina al 3 → cabina sale a 9 (test manuale)
- [ ] ▲ al piano 9 → beep rifiuto + messaggio
- [ ] Comportamento esistente (coda semplice) preservato
- [ ] `node --check` + brace balance

## Verifiche (Q7.5=A: scenario test)

| # | Scenario | Setup | Azione | Atteso |
|---|---|---|---|---|
| V1 | Disabilitazione ▲ al top | Cabin al piano 9, apri customizer ▲/▼ in corridoio | Osserva pulsantiera | Solo tasto ▼ visibile (▲ non esiste) |
| V2 | Disabilitazione ▼ al bottom | Cabin al piano 0, apri customizer ▲/▼ in corridoio | Osserva pulsantiera | Solo tasto ▲ visibile (▼ non esiste) |
| V3 | Routing intelligente ▲ | Cabin al 7, esci, vai al piano 3 | Premi ▲ | Cabina scende al 3 (intenzione 'up' registrata nella coda) |
| V4 | Routing intelligente ▼ | Cabin al 3, esci, vai al piano 9 | Premi ▼ | Cabina sale al 9 (intenzione 'down' registrata) |
| V5 | Routing mixed direction | Cabin al 5, utente al 3 ▼ e al 8 ▲ | Entrambi premuti | Smart routing: prima il 3 (down), poi inversione al 8 (up) |
| V6 | Coda FIFO con direction | Cabin al 0, request piano 5 (1-9 tastiera) poi esci al piano 3 e premi ▲ | Osserva coda | cabin sale al 5, poi torna al 3 (FIFO) |
| V7 | Visualizzazione cartello | Cabin al 0, ▲ premuto al piano 5 | Osserva cartello corridoio dopo click | Freccia ▲ verde + label 'IN SALITA' in basso a destra |
| V8 | Visualizzazione pulsantiera | Cabin al 5 in movimento verso piano 3 | Osserva pulsantiera al piano 3 | Icona ↻ verde in alto a destra del display |
| V9 | Compat legacy | Cabin fermo, request piano 5 (tasto tastiera, no direction) | Osserva coda | direction = null, funziona come prima |
| V10 | Defensive check | Cabin al 9, programmaticamente requestFloor(9, 'up') | Osserva | Beep 220Hz + subtitle "Sei al piano piu' alto" |

## Effort
1 sessione.

---

# STEP 8 · i18n IT/EN (backlog #12)

## Scope proposto
- **8a**. **Refactor stringhe**: tutte le stringhe UI (start screen, HUD, status, tutorial, annunci) in `STRINGS[lang]`. Display touch e cartelli del corridoio.
- **8b**. **Toggle lingua**: tasto `L` (o bandierina in HUD) per switchare IT ↔ EN. Persistenza in `localStorage.bossHotelLang@v1`.
- **8c**. **Annunci TTS multilingua**: `speak(text, { lang: 'en-US' })` per annunci inglesi con voce inglese del browser.
- **8d**. **Display touch bilingue**: il display mostra `Lingua: IT | EN` in header, con switch on-click.

## Decision Questions

### Q8.1 — Scope

- **A. Solo UI (8a + 8b)** — stringhe + toggle, niente TTS multilingua *(Recommended, fase 1)*
- **B. UI + TTS multilingua (8a + 8b + 8c)** — completo
- **C. UI + TTS + display bilingue (8a + 8b + 8c + 8d)** — massimo

### Q8.2 — Quale inglese

- **A. Inglese americano (en-US)** — il più supportato da voci TTS browser
- **B. Inglese britannico (en-GB)** — più "hotel 5★"
- **C. Configurabile** (default en-US)

### Q8.3 — Approccio refactor stringhe

- **A. `STRINGS[lang]` flat object** `STRINGS.it.startBtn`, `STRINGS.en.startBtn` *(Recommended)*
- **B. File JSON esterno** (`strings.json`) via fetch — rompe single-file
- **C. Template literals con placeholder** `STRINGS[LANG].welcome({name})`

### Q8.4 — Copertura iniziale

Quali sezioni tradurre per prime?

- **A. Solo HUD + start screen + annunci TTS** (essenziale) *(Recommended)*
- **B. + display touch** (pulsanti, label stato)
- **C. + cartelli corridoio + display pubblicitario**
- **D. Tutto** (esplosione scope)

### Q8.5 — Lingua di default

- **A. Italiano** (pubblico primario) *(Recommended)*
- **B. Inglese**
- **C. Auto-detect** da `navigator.language`

## Acceptance criteria
- [ ] (se 8a) `grep -c "STRINGS.it" elevator.html` > 30 occorrenze
- [ ] (se 8b) toggle `L` cambia lingua live
- [ ] (se 8c) annunci TTS inglesi pronunciati correttamente
- [ ] Persistenza lingua funziona
- [ ] `node --check` + brace balance

## Effort
1-2 sessioni (refactor è meccanico ma vasto: ~300+ stringhe).

---

# STEP 9 · Shaft "dietro le quinte" + animazione micro porte

## Scope proposto
- **9a**. **Shaft visibile**: quando le porte della cabina sono aperte, vedi il vano ascensore che scorre. Pannello di fondo con luci di piano che si accendono al passaggio, indicatori meccanici (guide, cavi, contrappeso).
- **9b**. **Animazione micro porte**: crossfade 200ms + scale-in dell'indicatore direzione sopra porte (oggi cambia istantaneamente).
- **9c**. **Shaft all'attico**: la vetrata panoramica (esistente) rivela anche il shaft visto dal lato opposto, con la cabina che passa silenziosa all'esterno.

## Decision Questions

### Q9.1 — Scope

- **A. Solo shaft (9a)** — feature "wow" pura *(Recommended)*
- **B. Solo animazione micro porte (9b)** — polish visivo
- **C. Shaft + micro (9a + 9b)**
- **D. Tutto (9a + 9b + 9c)** — esperienza completa

### Q9.2 — Complessità shaft

- **A. Minimalista**: solo 2-3 pannelli di fondo + luci di piano *(Recommended)*
- **B. Realistico**: cavi, contrappeso, guide, illuminazione vano
- **C. Iperrealista**: meccanica in movimento (cavi che si muovono, contrappeso che scende)

### Q9.3 — Performance: il shaft è renderizzato anche quando non visibile?

- **A. `shaft.visible = state.doorsActual > 0.5`**, sempre in scena ma nascosto
- **B. Shaft creato on-demand** quando porte aprono, dispose quando chiudono *(Recommended per memoria)*
- **C. Sempre renderizzato** (spreco)

### Q9.4 — Animazione micro porte

- **A. Crossfade 200ms** (semplice) *(Recommended)*
- **B. Slide orizzontale 300ms** (più "fisico")
- **C. Pulse + fade** (più "digitale")

### Q9.5 — Coerenza con specchio riflettente

Lo specchio già riflette l'interno. Il shaft dovrebbe essere riflesso?

- **A. No** (shaft è dietro le porte, lo specchio è sulla parete opposta — non si riflette) *(Recommended)*
- **B. Sì, estende la riflessione**

## Acceptance criteria
- [ ] (se 9a) con porte aperte, si vede il shaft che scorre
- [ ] (se 9b) freccia direzione non cambia istantaneamente
- [ ] (se 9c) dall'attico, la cabina passa visibile oltre la vetrata
- [ ] Nessuna regressione FPS significativa (target ≥45)
- [ ] `node --check` + brace balance

## Effort
1-2 sessioni.

---

# STEP 10 · Eventi speciali hotel (matrimonio, conferenza)

## Scope proposto
- **10a**. **Stati evento**: 4 preset evento (no evento, matrimonio, conferenza, gala) configurabili via `HOTEL_CONFIG.event` (vedi Step 5). Cambiano aspetto corridoio + annunci + audio contestuale.
- **10b**. **Matrimonio**: corridoio addobbato (archi di fiori, tappeto rosso, "WELCOME MR. SMITH" su cartello), annuncio vocale "Benvenuti al matrimonio di Rossi & Bianchi, piano 6", musica "Wedding March" sottile.
- **10c**. **Conferenza**: corridoio sobrio con striscione "BOSS HOTEL CONFERENCE 2026", display touch mostra agenda, audio sobrio.
- **10d**. **Gala**: luci soffuse, sfondo nero, champagne (icona drink sul display), musica jazz più presente.

## Decision Questions

### Q10.1 — Scope

- **A. Solo struttura evento + 1 preset (matrimonio)** — validare pattern *(Recommended)*
- **B. Struttura + tutti i preset** — completo
- **C. Solo annunci/eventi senza cambi visivi** — leggero

### Q10.2 — Configurazione eventi

- **A. Hardcoded in `HOTEL_CONFIG.event`** (impostato in fase di init)
- **B. UI per cambiare evento in-game** (tasto dedicato, es. `Shift+E`)
- **C. Randomico** (5% probabilità ad ogni arrivo al piano)

### Q10.3 — Persistenza eventi

- **A. Persiste in localStorage** come `HOTEL_CONFIG` *(Recommended)*
- **B. Solo sessione corrente** (refresh = reset)
- **C. Schedulato** (es. "matrimonio ogni domenica")

### Q10.4 — Impatto gameplay

- **A. Solo estetico** (no cambi a logica cabina)
- **B. Estetico + annunci passeggeri** (es. "Matrimonio al piano 6, prego")
- **C. Estetico + logica passeggeri** (es. +3 passeggeri con abito da sposa)

### Q10.5 — Easter egg

- **A. Combinazione segreta** (es. `Shift+M` + `Shift+E` + click display 3 volte) attiva "modalità Capodanno"
- **B. Nessun easter egg**

## Acceptance criteria
- [ ] Corridoio cambia aspetto in base all'evento
- [ ] Annuncio vocale coerente con evento
- [ ] Persistenza funzionante
- [ ] Nessuna regressione feature esistenti
- [ ] `node --check` + brace balance

## Effort
1 sessione.

---

# STEP 11 · L-block: più piani parametrico + texture HD arredi

## Scope proposto
- **11a**. **`NUM_FLOORS` parametrico**: oggetto `HOTEL_CONFIG.numFloors` (default 10). Celle display touch renderizzate dinamicamente, corridoio tematico per piano configurabile.
- **11b**. **Texture HD per arredi**: aggiungere noise + variazione di pattern alle texture procedurali (oggi pattern ripetitivo visibile a zoom). Es. marmi con venature, legni con nodi, tessuti con trama visibile.
- **11c**. **Piani configurabili per tema**: ogni piano può avere un tema scelto da preset (oggi tema determinato da range fisso T=0, 1-3, 4-6, 7-9).

## Decision Questions

### Q11.1 — Scope

- **A. Solo piani parametrici (11a)** — abilita edifici custom *(Recommended)*
- **B. Solo texture HD (11b)** — qualità visiva
- **C. Piani + texture (11a + 11b)**
- **D. Tutto (11a + 11b + 11c)**

### Q11.2 — Limite piani

- **A. Default 10, range 2-50** *(Recommended)*
- **B. Default 10, range 2-20** (più conservativo)
- **C. Default 10, nessun limite** (rischio performance)

### Q11.3 — Texture HD: tecnica

- **A. Aggiunta noise + variazione alle texture procedurali esistenti** *(Recommended)*
- **B. Generazione runtime di texture HD** (canvas 2× o 4× risoluzione + mipmap)
- **C. Texture caricate da URL** (asset esterni, rompe vincolo)

### Q11.4 — Display touch con molti piani

Con 20+ piani, il display 3×4 è insufficiente. Cosa fare?

- **A. Paginazione**: 12 piani per pagina, swipe/scroll per cambiare *(Recommended)*
- **B. Griglia 4×N** dinamica in base a numFloors
- **C. Mantieni 3×4 + scroll verticale**

### Q11.5 — Performance test

- **A. Misurare FPS con 50 piani** prima di procedere *(Recommended)*
- **B. Nessun test specifico**

## Acceptance criteria
- [ ] `HOTEL_CONFIG.numFloors = 20` funziona senza bug
- [ ] (se 11b) pattern ripetitivi non più visibili a zoom vicino
- [ ] (se 11c) temi configurati per piano funzionano
- [ ] FPS ≥45 con config di default
- [ ] `node --check` + brace balance

## Effort
1-2 sessioni.

---

# STEP 12 · Test framework leggero (unit test funzioni pure)

## Scope proposto
- **12a**. **Estrazione funzioni pure**: identificare e marcare `pure:` (in commento) le funzioni senza side-effect: `easing(t)`, `floorRoomRange(f)`, `adjustPassengersForFloor(f)`, `playChime` (se isolabile), `tickDisplay` helpers, ecc.
- **12b**. **`tests.html`** apribile nel browser: carica `elevator.html` come modulo (via script type="module"), importa le funzioni pure, esegue assert, mostra report pass/fail.
- **12c**. **Test iniziali (~15)**: easing, floorRoomRange (per ogni piano), adjustPassengersForFloor (clamp 0-8), almeno 1 test di routing.

## Decision Questions

### Q12.1 — Scope

- **A. Solo estrazione + 10-15 test iniziali (12a + 12c)** *(Recommended)*
- **B. Solo struttura + zero test** (preparazione)
- **C. Struttura + test + CI integration** (test in `.github/workflows/ci.yml`)

### Q12.2 — Approccio test framework

- **A. Assert vanilla** (`assert(x === y, msg)`) — zero dipendenze *(Recommended)*
- **B. Tiny test library inline** (~50 righe: describe/it/expect)
- **C. Import di una library via CDN** (es. uvu)

### Q12.3 — Dove mettere i test

- **A. `tests.html` separato** (apribile in browser via `python -m http.server`) *(Recommended)*
- **B. Sezione nascosta in `elevator.html` attivabile con `?test=1`
- **C. Entrambi**

### Q12.4 — Copertura minima

- **A. 15 test** su funzioni pure principali
- **B. 30 test** comprensivi di casi limite
- **C. 50+ test** (più tempo ma più solidità)

### Q12.5 — Esecuzione automatica

- **A. Manuale** (apertura `tests.html`)
- **B. In CI** (via headless puppeteer/playwright) — alto effort
- **C. Manuale + export JSON risultati** per possibile CI futura

## Acceptance criteria
- [ ] `tests.html` apribile e funzionante
- [ ] Almeno 10 test passano
- [ ] Nessuna regressione funzionale in `elevator.html`
- [ ] (se 12b) framework visibile e riusabile

## Effort
1 sessione.

---

# STEP 13 · Long-term (placeholder)

Step visionari per il futuro, **non** da implementare in V2 ma da tenere come riferimento:

- **13a**. WebXR / VR: `renderer.xr.enabled = true`, due camere stereo, riprogettare pointer lock.
- **13b**. Multi-cabina: ascensori A/B interconnessi con routing collettivo.
- **13c**. Multiplayer: più utenti nella stessa cabina via WebSocket.
- **13d**. Personalizzazione completa: colori display, dimensioni, layout pulsantiera.
- **13e**. Internazionalizzazione oltre IT/EN (es. giapponese, arabo).
- **13f**. Mobile-first redesign (oggi è desktop-only).

## Decision Questions

### Q13.1 — Quale di questi ti interessa di più per futuro lontano?

- **A. WebXR** — più "wow"
- **B. Multi-cabina** — più "simulazione"
- **C. Multiplayer** — più "social"
- **D. Personalizzazione completa** — più "creatività"
- **E. Mobile redesign** — più "reach"
- **F. Altro**

---

# STEP 14 · Citofono interattivo + pairing con tasto SOS

## Contesto
Il citofono (interphone) è presente nella cabina come **dettaglio decorativo dalla Fase 1**
(vedi `elevator.html:1591-1639`): frame scuro, griglia altoparlante, pulsante verde,
etichetta "INTERFONO". Non è attualmente cliccabile (non in `buttonList`,
no `userData.isButton`). Realisticamente rappresenta un dispositivo di
emergenza EN 81-28 che permette al passeggero di chiamare la reception.

Il tasto **SOS** nella pulsantiera moderna è il pulsante `!` rosso (vedi
`elevator.html:3085`, `userData.action = 'alarm'`) che chiama
`toggleAlarm()` (vedi `elevator.html:4906`). Sono due sistemi di emergenza
distinti nel mondo reale: SOS = allarme immediato (soccorsi),
citofono = comunicazione vocale con la reception.

## Scope proposto
- **14a**. **Citofono interattivo**: aggiungere click handler, userData.isButton,
  entry in buttonList. Click → animazione pulsante verde che lampeggia per
  3 secondi + beep + annuncio vocale "Chiamata in corso. Attendere prego."
  + subtitle HUD. Stato `state.interphoneCalling` (true durante la chiamata).
- **14b**. **Pairing con SOS**: definire la relazione tra citofono e tasto
  SOS. Opzioni (vedi Decision Questions):
  - Citofono + SOS = stesso effetto (chiamata soccorsi): semplice ma perde
    la sfumatura realistica (citofono = reception, SOS = soccorsi).
  - Citofono = chiamata "soft" (reception), SOS = chiamata "hard" (soccorsi):
    realistico, due stati separati, due annunci diversi.
  - Citofono + SOS insieme = escalation: citofono premuto mentre SOS è
    attivo aggiunge "soccorsi aggiuntivi allertati".
- **14c**. **Persistenza stato**: salvataggio di `interphoneCalling` in
  localStorage insieme alle altre preferenze (mute/tts/night).
- **14d**. **HUD manutentore**: aggiungere riga "Citofono: ON/OFF"
  nell'overlay `Shift+M` per coerenza con gli altri stati.

## Decision Questions

### Q14.1 — Scope di questo step

- **A. Solo citofono interattivo (14a)** — solo il citofono diventa cliccabile,
  nessun pairing con SOS
- **B. Citofono + pairing soft/hard (14a + 14b opzione B)** — citofono
  chiama reception, SOS chiama soccorsi, due sistemi distinti *(Recommended)*
- **C. Tutto (14a + 14b + 14c + 14d)** — completo con persistenza e HUD
- **D. Altro**

### Q14.2 — Pairing citofono ↔ SOS

- **A. Stesso effetto** — citofono + SOS = `toggleAlarm()` identico
- **B. Due sistemi distinti** — citofono chiama reception (annuncio vocale
  + lampeggio), SOS = allarme soccorsi (luci rosse + annuncio "soccorsi")
  *(Recommended, più realistico)*
- **C. Escalation** — citofono + SOS insieme = chiamata soccorsi + reception
  in simultanea
- **D. Citofono delega a SOS** — citofono è solo UI, click delega a `toggleAlarm()`

### Q14.3 — Comportamento chiamata citofono

Cosa succede durante i 3 secondi di "chiamata in corso"?

- **A. Solo annuncio + lampeggio** — niente altro, il passeggero aspetta
  *(Recommended, simula la realtà)*
- **B. Voce reception simulata** — TTS che dice "Centralino, buongiorno.
  Come posso aiutarla?" dopo 2 secondi
- **C. Beep periodico** — come un telefono che squilla, ogni 500ms

### Q14.4 — Posizione nel codice

Dove inserire la logica del citofono?

- **A. Inline nella sezione esistente del citofono (riga ~1591)** —
  modifica del blocco esistente
- **B. Nuova sezione dedicata dopo `toggleAlarm` (~riga 4925)** —
  funzioni `handleInterphoneCall()`, `stopInterphoneCall()`,
  `tickInterphoneCall()` raggruppate
- **C. Modulo separato** — refactor che estrae la logica in un modulo ES
  (rompe vincolo single-file)

### Q14.5 — Sub-commit

- **A. Un commit unico per tutto lo step**
- **B. Commit separati per 14a / 14b / 14c / 14d** *(Recommended)*
- **C. Un commit per citofono + uno per pairing**

## Acceptance criteria

- [ ] Citofono cliccabile: pulsante verde lampeggia per 3s + beep + TTS
- [ ] Stato `state.interphoneCalling` distinto da `state.alarmOn`
- [ ] Tasto SOS mantiene comportamento esistente (toggleAlarm)
- [ ] (se 14b opzione B) Citofono e SOS hanno annunci TTS diversi
- [ ] (se 14c) Stato persiste dopo refresh
- [ ] (se 14d) HUD manutentore mostra citofono ON/OFF
- [ ] `node --check` + brace balance
- [ ] Nessuna regressione su feature esistenti

## Effort
1 sessione (mezza sessione se si fa solo 14a).

---

---

# Decisioni globali (cross-step)

### DG.1 — Branch strategy
- **A. Ogni step in branch dedicato** (`feature/v2-step-N`) + merge dopo validazione *(Recommended)*
- **B. Tutti gli step in un unico branch `feature/polish-pack-v2`**
- **C. Step a basso rischio direttamente su `main`**

### DG.2 — Versioning
- **A. Polish Pack v2.0** al merge finale di tutti gli step approvati *(Recommended)*
- **B. Polish Pack v2.0 + sub-versioning per step** (v2.1, v2.2, ...)
- **C. Release notes cumulative senza versione dedicata**

### DG.3 — Aggiornamento documentazione
- **A. Aggiorno `PIANO_MIGLIORAMENTI.md` come log, `PIANO_V2.md` come roadmap** *(Recommended)*
- **B. Solo `PIANO_V2.md` + README changelog inline
- **C. Tutto in un nuovo `CHANGELOG.md` dedicato

### DG.4 — Demo live
- **A. Re-deploy dopo ogni step** *(Recommended, continuità con la practice attuale)*
- **B. Re-deploy solo a fine Polish Pack v2.0
- **C. Re-deploy su richiesta esplicita

---

# Come procedere ora

Quando sei pronto per iniziare, dimmi:
1. **Quale step vuoi affrontare per primo** (numero, es. "Step 1")
2. Rispondo alle **Decision Questions** di quello step tramite `question` tool, una alla volta
3. Implemento solo le opzioni che confermi
4. Aggiorno questo documento segnando lo step ✅

Posso anche partire da Step 0 (meta-decisioni DG.\*) se vuoi prima fissare la strategia globale, o partire direttamente da uno step specifico se hai già le idee chiare.
