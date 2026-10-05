# Compatibilità Safari iOS — indagine 2026-10-05

> Documento di indagine. Risponde alla domanda: "Safari su iPhone 15 Pro
> è compatibile? La scattosità e i blocchi sono una incompatibilità nota
> del browser o un problema del progetto?"
>
> Indagine avviata il 2026-10-02, completata 2026-10-05 dopo cinque
> passate di misure (vedi "Metodologia" in fondo). Sì, esiste un caso
> noto a monte (three.js issue #22254). Sì, il progetto ne è affetto
> in modo misurabile e riproducibile. La causa NON è la scena pesante
> o il numero di luci, è la **compilazione sincrona di shader al
> cambio piano**.

## TL;DR

- **Nessuna incompatibilità hard**: la pagina parte, WebGL 2.0 si crea,
  i guard di D28 (pixel ratio cap 1.5, antialias off su iOS, context
  recovery) sono già attivi e funzionano. Nessun errore di pagina,
  nessuna fallback, nessun context loss in 15+ secondi di test.
- **La scattosità (jank regolare) è fill-rate bound**: il frame time
  scala linearmente con i pixel del backbuffer, mentre il tempo JS è
  0ms per frame. È un comportamento atteso per una scena con 14 point
  light + ombre morbide (PCFSoft) a 1278×589 pixel.
- **I blocchi (freeze singoli di 0.3-2.4 secondi) sono compilazione
  shader**: ad ogni arrivo a un nuovo piano, three.js compila 1-8
  nuovi programmi shader, in modo sincrono sul main thread. È il caso
  noto three.js #22254, chiuso come "non risolvibile in three.js,
  segnalare a WebKit".
- **La cache dei programmi three.js non sopravvive al `disposeCorridor`
  + rebuild**: anche tornando a un piano già visitato si ricompila 1
  programma, con un freeze di 278-355ms ogni volta. Questo invalida
  il fix "precompila all'avvio" come unica soluzione.

## Risposte puntuali

### Il browser è compatibile?

Sì. I test su Playwright WebKit (engine di Safari) con profilo hardware
iPhone 15 Pro (852×393 landscape, dpr 3) mostrano:

| Metrica | Valore | Verdetto |
|---|---|---|
| Page errors | 0 | OK |
| Console errors | 0 | OK |
| WebGL context type | WebGL 2.0 | OK |
| WebGL fallback mostrata? | No | OK |
| Pixel ratio applicato | 1.5 (capped da 3) | D28 funziona |
| Antialias | disattivato (iOS) | D28 funziona |
| Context loss in 15+ secondi | 0 | OK |
| Canvas backbuffer | 1278×589 (752.742 px) | ragionevole |

La scena si avvia e gira. Non c'è nessuna incompatibilità di engine:
Safari su iPhone esegue WebGL 2.0 e l'app lo usa.

### Esiste un caso noto che spiega i sintomi?

Sì, documentato in due posti:

1. **[three.js issue #22254](https://github.com/mrdoob/three.js/issues/22254)**
   — "Bad performance and stutters on iOS when using lights + shadows".
   Sintomo identico: scena gira a 50+ FPS ma l'utente percepisce
   stutter. La conclusione del maintainer è: *"Sorry, this issue can't
   be fixed in three.js. Please report the issue to Apple instead."*
   Vale a dire: è un bug noto del backend WebKit/Metal, non un
   difetto del codice di three.js o del progetto.

2. **WebKit bug 218949** — "WebGL instanced draw calls are very slow
   on iPhone 12 Pro", regressione specifica su A14 Bionic, risolta
   in iOS 15. Vecchia ma rilevante: A17 Pro (iPhone 15 Pro) potrebbe
   avere regressioni analoghe non ancora pubbliche.

### Cosa causa la scattosità?

Misura diretta al variare della risoluzione del backbuffer, con tutto
il resto costante:

| Backbuffer (CSS × dpr) | Pixel | frame p50 | FPS |
|---|---|---|---|
| 852×393 (full) | 752.742 | 49ms | 21 |
| 426×197 (1/4 pixel) | 188.505 | 24ms | 42 |
| 213×98 (1/16 pixel) | 46.893 | 16ms | 57 |

Interpolazione lineare: `frameMs ≈ 15ms fisso + 0.0443 μs/px`.
Il tempo JS per frame è 0ms (misurato con microtask in RAF callback).
Il frame time scala con i pixel e non con la geometria. È fill-rate
bound.

Verifica incrociata A/B (3 run interleaved, mediana):

| Variante | frame p50 | draw call | Δ vs base |
|---|---|---|---|
| A — sorgente invariata | 47ms | 106 | — |
| B — niente cube shadow della PointLight | 46ms | 73 | −2,1% |
| D — 3 point light cabina (invece di 14) | 46ms | 106 | −2,1% |
| E — niente tone mapping ACES | 45ms | 106 | −4,3% |

**Unica riduzione di draw call certa**: B mostra 106 → 73 disegni
(−31%, deterministico, riproducibile in ogni run) — è il costo della
cube shadow map della PointLight `ceilingLight` con `castShadow=true`
(ogni faccia del cubo è un render pass). Ma **non migliora il frame
time in modo statisticamente significativo** in questo ambiente.

> **Caveat onesto**: Playwright WebKit su desktop Windows non è un
> iPhone 15 Pro. I numeri assoluti di FPS non sono trasferibili; ciò
> che è trasferibile è la *caratterizzazione del lavoro*: 106 draw
> call, 752k pixel, 14 point light, 0ms di JS. Su un iPhone reale con
> GPU Apple, la stessa scena gira più veloce, ma la *forma* del
> collo di bottiglia (fill-rate, non CPU) resta la stessa. La parte
> "JS è 0ms" è la notizia buona: non c'è un'ottimizzazione JS che
> possa salvare un frame.

### Cosa causa i blocchi?

I "blocchi" sono frame singolarmente lunghi. Misurati durante 5 viaggi
ascensore reali (0→1, 1→5, 5→2, 2→7, 7→4), con aggancio diretto
alle primitive WebGL per sapere *cosa* stava succedendo in ogni
frame:

| Fase | Programmi compilati | Frame con compilazione | p50 di quei frame | max |
|---|---|---|---|---|
| Idle (controllo, 6s) | 0 | 0 | — | — |
| 5 viaggi ascensore | 20 | 5 | **414ms** | **2441ms** |

Ogni singolo frame sopra 100ms durante i viaggi contiene almeno una
chiamata a `gl.createProgram`:

| frame | programmi | link | shader |
|---|---|---|---|
| 2441ms | 8 | 8 | 16 |
| 1313ms | 8 | 8 | 16 |
| 414ms | 1 | 1 | 2 |
| 295ms | 1 | 1 | 2 |
| 125ms | 2 | 2 | 4 |

Mentre `buildCorridor` (la costruzione delle mesh) dura **6-17ms** e
`texImage2D` rimane 0 durante i viaggi. La costruzione non è il
problema, **lo è la compilazione shader innescata da essa**.

Perché succede: `buildCorridor` ricostruisce la scena del piano
corrente con materiali che hanno un numero diverso di luci
(4 point light corridoio + luci arredi, variabili per tema).
Three.js decide di compilare un nuovo programma per ogni combinazione
`materiale × numero di luci × ricezione ombra`. Su WebKit la
compilazione è sincrona e blocca il main thread per centinaia di ms
per programma. È esattamente la firma sintomatica del three.js #22254.

### La cache dei programmi funziona?

No, non in questo caso. Test: 0→1, 1→2, 2→1, 1→2, 2→1. Ad ogni
arrivo si ricompila **1 programma** (1 link, 2 shader) e si genera
un freeze di 278-355ms. Anche tornando a un piano già visitato.

Motivo: `disposeCorridor` chiama `material.dispose()` (o equivalente
via `corridor.clear()`), e la cache dei programmi three.js è
keyed sull'istanza del `Material` (il suo `uuid`). Materiale disposto
= programma rilasciato. Materiale ricreato = nuovo `uuid` = nuovo
programma da compilare. Il pre-warm all'avvio non aiuta per le
visite successive.

## Cosa si può fare (proposte, non ancora implementate)

Per ordine di impatto atteso:

1. **Riusare i materiali fra le ricostruzioni** — pool di 4 set di
   materiali (uno per tema), mai disposed, solo assegnati alle nuove
   mesh. La cache dei programmi si attiva e i viaggi successivi non
   ricompilano. Richiede refactor di `buildCorridor`/`disposeCorridor`
   (D36 candidato).

2. **`renderer.compileAsync(scene, camera)`** (three.js r152+) —
   fallback a una riga. Usa `KHR_parallel_shader_compile` per
   scaricare la compilazione su un thread parallelo, evitando il
   blocco del main thread. Non elimina la compilazione, ma la rende
   asincrona. Disponibile in r160 (nostra versione).

3. **Sostituire `ceilingLight` (PointLight con `castShadow=true`) con
   una `DirectionalLight` per le ombre della cabina** — 1 render
   pass per le ombre invece di 6 (cube map). Riduce i draw call
   da 106 a 73 in modo deterministico. Impatto su iPhone reale da
   verificare: in questo ambiente non ha cambiato il frame time, ma
   su iOS la cube map è nota per essere costosa.

4. **Ridurre il numero di PointLight attive** — 14 è un valore
   inusuale per mobile. 8-10 è il tetto suggerito dal forum
   three.js (https://discourse.threejs.org/t/point-lights-and-performance-revisited/49316).
   Spegnere le luci arredi nel corridoio (sconces, quadri, bar) ha
   costo estetico quasi nullo perché sono decorative e a range corto.

5. **Pre-warm all'avvio con `renderer.compileAsync`** per le 4
   scene-tema, durante la start screen (mentre l'utente legge
   "Entra nell'ascensore"). Questo NON elimina i blocchi alle visite
   successive (vedi sopra), ma riduce il numero di programmi che
   devono essere compilati durante il primo giro completo.

## Cosa NON è colpa del codice

Per evitare la trappola "visto che c'è scattosità, ottimizzo X" senza
evidenza:

- **Non è colpa del `requestAnimationFrame` throttling** (misurato
  RAF p50 = 49ms, 20 FPS, non 30 di iOS background).
- **Non è colpa della context loss** (zero eventi in 15+ secondi).
- **Non è colpa del texture re-upload** (`texImage2D = 0` durante
  i viaggi; il display e l'ad screen sono throttled a 1Hz come da
  V1.6 #18).
- **Non è colpa di `preserveDrawingBuffer`** (rimosso in D28).
- **Non è colpa del `backdrop-filter` CSS** (D35 ha rimosso quello
  più costoso, `#topbar`, dal layout landscape).

## Metodologia

Tutte le misure sono state fatte con `playwright@1.56.0` e
`webkit.launch()` su un profilo iPhone 15 Pro landscape (852×393,
dpr 3, UA Safari iOS 17.5). Il modulo è servito via HTTP statico
(importmap richiede HTTP, non `file://`).

Limite principale: Playwright WebKit su Windows NON è Safari su
iPhone. I numeri assoluti di FPS non sono confrontabili con un
iPhone 15 Pro reale. Le *caratterizzazioni* (JS=0, frame time ∝
pixel, compilazione shader al cambio piano) sono confrontabili
perché descrivono la natura del lavoro, non la velocità della
macchina.

Diagnostiche usate (tutte in `scripts/diagnose-*.js`):

- `diagnose-safari-ios.js` — primo profilo (canvas, WebGL, RAF)
- `diagnose-rumore.js` — A/B/C/D/E con 3 ripetizioni interleaved
- `diagnose-freeze.js` — durata `buildCorridor` per arrivo
- `diagnose-shader.js` — correlazione `createProgram` ↔ durata frame
- `diagnose-prewarm.js` — test cache programmi su ritorno allo
  stesso piano
- `diagnose-ab-sombra.js` — A/B/D/E con 1 ripetizione (predecessore
  rumoroso, mantenuto come storico)

Artefatti (in root, gitignored via `safari-ios-*.json`):

- `safari-ios-diagnostic.json`
- `safari-ios-rumore.json`
- `safari-ios-ab.json`
- `safari-ios-freeze.json`
- `safari-ios-shader.json`
- `safari-ios-prewarm.json`

Tutti riproducibili con i comandi in testa a ogni script. Exit code
0 = report scritto; 1 = errore fatale.

## Decisione proposta (per Polish Pack V5 o fix dedicato)

> **D36 (candidato)**: `buildCorridor` non deve invalidare la cache
> dei programmi shader. Materiali condivisi fra ricostruzioni, e
> pre-warm async di tutti i temi all'avvio. Senza questo, ogni
> arrivo a un piano genera 0.3-2.4s di freeze su WebKit/iOS per
> compilazione shader sincrona.

Da formalizzare in `AGENTS.md` (riga D-key) e implementare in una
PR dedicata quando si decide di procedere. Vedi "Cosa si può fare"
sopra per le opzioni di implementazione.
