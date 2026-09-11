# Piano di Miglioramento — Simulatore Ascensore 3D
**Hotel Royal Edition → Hotel Royal Premium Edition**

Documento di proposta da approvare **prima** di iniziare la codifica.
Versione 0.1 — 2026-08-24

---

## 1. Sintesi esecutiva

L'obiettivo è trasformare l'attuale simulazione in una **cabina ascensore di un hotel di lusso**, mantenendo l'interazione in prima persona e aggiungendo:

1. Interni cabina con dettagli realistici di grado "AAA" (giunture, profili, ventilazione, telecamera, ecc.).
2. Una **pulsantiera digitale moderna** con display LCD principale che sostituisce i tasti numerici meccanici, mostrando:
   - Selezione piani
   - Direzione di viaggio
   - Mappa dell'edificio con posizione cabina
   - **Meteo casuale** (icona + temperatura + condizioni)
   - **Informazioni sull'edificio** (nome, indirizzo, orario, piani)
3. Tasti fisici solo per le funzioni "hard" (emergenza, stop, porte).
4. Miglioramenti accessori (annunci vocali, illuminazione dinamica, pubblicità, sicurezza).

Il tutto in modo che la simulazione resti **un singolo file HTML deployabile** e che le prestazioni restino fluide (60 FPS target).

---

## 2. Analisi dello stato attuale

### 2.1 Cosa c'è oggi
| Area | Stato | Note |
|---|---|---|
| Cabina base (muri, pavimento, soffitto) | ✅ Funzionante | Doppio lato sui plane, corretto dopo fix camera |
| Pannello pulsanti meccanico (1..9, T, ◄\|, \|►, !, STOP) | ✅ Funzionante | Tasti fisici 3D cliccabili |
| Display LCD verde secondario | ✅ Funzionante | Solo "piano" + stato testuale |
| Indicatore direzione sopra porte | ✅ Funzionante | Texture canvas "▲/▼/·" |
| Cartello piano lato corridoio | ✅ Funzionante | Texture canvas, doppia faccia |
| Corridoio tematico per piano | ✅ Funzionante | 4 temi (lobby/uffici/hotel/attico) |
| Uscita/rientro cabina | ✅ Funzionante | Tasto ↗ + tasto E |
| Movimento FPS nel corridoio | ✅ Funzionante | WASD, collisioni semplici |
| Audio sintetizzato | ✅ Funzionante | Beep, chime, allarme |
| Allarme + luci rosse | ✅ Funzionante | Pulsante + sirena |
| Audio annunci vocali | ❌ Assente | |
| Telecamera di sicurezza | ❌ Assente | |
| Meteo | ❌ Assente | |
| Info edificio | ❌ Assente | Solo nome hotel sul cartello |
| Pubblicità / display secondari | ❌ Assente | |
| Illuminazione dinamica | ❌ Assente | Solo statica |

### 2.2 Limitazioni note
- **Pannello meccanico "datato"**: la pulsantiera attuale è anni '90; in hotel di lusso moderni si usa un touch screen + tasti fisici solo per emergenza.
- **Display principale troppo piccolo**: il LCD attuale è 8×3 cm nel pannello, illeggibile dalla camera.
- **Nessuna informazione contestuale**: l'utente non sa che ore sono, che tempo fa, dove si trova nell'edificio.
- **Mancanza di annunci vocali**: in un vero hotel c'è una voce che annuncia "Piano tre, prego".
- **Pochi dettagli "premium"**: niente griglie di ventilazione, niente profili in alluminio agli spigoli, niente telecamera interna.

---

## 3. Proposte di dettaglio interni cabina

Ogni elemento è valutato con priorità e complessità.

### 3.1 Giunture e profili (alta priorità, bassa complessità)
- **Battiscopa** in alluminio spazzolato lungo tutto il perimetro (h = 8 cm).
- **Profili verticali** agli spigoli delle pareti (tipo "L" in alluminio), spessore 2 cm.
- **Giunzioni orizzontali** tra pannelli di rivestimento pareti (linee sottili ogni 60 cm) per dare l'effetto "pannelli in acciaio inox".
- **Profilo a T sul soffitto** che incornicia il pannello LED.

### 3.2 Pavimento (media priorità, bassa complessità)
- Aggiungere una **soglia di ottone** tra cabina e corridoio (sotto le porte, visibile quando sono aperte).
- **Tappetino di ingresso** con gomma antiscivolo (zona davanti alle porte).
- Texture marmo più dettagliata con venature multiple.

### 3.3 Soffitto e ventilazione (media priorità, bassa complessità)
- **Griglia di ventilazione** (rettangolare 30×15 cm) sopra la zona posteriore, in metallo forato.
- **Bocchette di areazione** (2 piccole rotonde) ai lati del pannello LED.
- Il pannello LED centrale diventa leggermente più grande e mostra un'animazione "pulse" lenta.

### 3.4 Telecamera di sicurezza (alta priorità, media complessità)
- Mini-telecamera dome nell'angolo posteriore destro del soffitto.
- Modellino realistico: cupola semisferica scura + LED rosso lampeggiante.
- Il LED è un piccolo PointLight rosso intermittente.
- **Dettaglio narrativo**: una piccola targhetta "CCTV — REC" sotto la cupola.

### 3.5 Altoparlante e citofono (media priorità, bassa complessità)
- **Altoparlante circolare** (griglia forata) sul soffitto sopra le porte.
- **Citofono** (griglia + pulsante) accanto al pannello, con etichetta "INTERFONO".

### 3.6 Pannello pubblicitario (media priorità, media complessità)
- Display 16:9 secondario sulla parete sinistra (sopra lo specchio).
- Mostra contenuti ruotati: orologio dell'hotel, meteo, offerte del ristorante, sponsor locali.
- Aggiornamento automatico ogni 10-15 secondi con cross-fade.

### 3.7 Dettagli "atmosferici" (bassa priorità, bassa complessità)
- **Numero civico dell'edificio** inciso su una targa vicino al pannello ("HOTEL ROYAL — 1898").
- **Cartello "MAX 8 PERSONE"** sotto il pannello.
- **Cartello capacità / portata** ("630 kg").
- **Profili LED** lungo il soffitto per luce d'ambiente (striscia indiretta).

### 3.8 Maniglione e specchio
- Il maniglione esistente va rivisto: aggiungere i supporti a parete con viti a vista.
- Lo specchio attuale è un plane grigio: aggiungere una **leggera texture "specchio"** con effetto blur simulato (texture canvas con rumore).

---

## 4. Pulsantiera moderna digitale

### 4.1 Concetto
Sostituzione totale dei 9 tasti numerici meccanici con un **display touch verticale** integrato in una cornice di vetro nero. Rimangono **solo 4 tasti fisici** per le funzioni di sicurezza/obbligo:
1. **!** Allarme (rosso, meccanico, illuminato)
2. **STOP** (giallo, meccanico)
3. **◄| Apri porta** (azzurro, touch)
4. **|► Chiudi porta** (azzurro, touch)

### 4.2 Layout fisico della pulsantiera
```
┌─────────────────────┐  <- cornice alluminio
│  ┌───────────────┐  │
│  │  HOTEL ROYAL  │  │  <- header (nome hotel)
│  │  08:42 · MER  │  │  <- orologio + data
│  ├───────────────┤  │
│  │               │  │
│  │       3°      │  │  <- piano corrente grande
│  │       ▲       │  │  <- freccia direzione animata
│  │               │  │
│  │  ☀ 22°C ROMA  │  │  <- meteo
│  │               │  │
│  ├───────────────┤  │
│  │  T  1  2  3   │  │  <- griglia piani (3 colonne)
│  │  4  5  6  7   │  │     celle interattive
│  │  8  9         │  │
│  └───────────────┘  │
│  ● Allarme          │  <- tasto fisico rosso
│  Apri | Chiudi      │  <- tasti fisici touch
│  STOP               │  <- tasto fisico giallo
└─────────────────────┘
```

### 4.3 Display touch interattivo
- **Dimensioni fisiche**: 30 cm × 18 cm (un rettangolo alto e stretto, stile ascensori Schindler/KONE moderni).
- **Risoluzione texture**: 512×768 px.
- **Interazione**: ogni cella-piano è una `Mesh` cliccabile con raycast (stessa logica dei tasti attuali).
- **Hover**: highlight blu con leggera "spinta" indietro (-0.5mm).
- **Click**: animazione "press" (scala 0.95 per 100ms), suono "tick" + highlight arancio per 300ms.
- **Piano selezionato**: la cella diventa arancione, poi verde quando la cabina parte, poi grigia quando arriva.

### 4.4 Contenuti del display (ciclo di "schermate")
Il display mostra una schermata principale fissa con più sezioni (vedi layout 4.2). Niente carosello, perché lo spazio è limitato.

Aggiunte possibili (vedi sezione 7 per proposte mie):
- Notifica "CABINA IN MANUTENZIONE" lampeggiante se allarme attivo.
- Notifica "PORTE BLOCCATE" se c'è un ostacolo (simulato).
- Countdown "Chiusura porte in 3..2..1" quando le porte si stanno chiudendo.

### 4.5 Animazioni del display
- **Transizione piani**: la cifra del piano corrente ha un effetto "flip" o "slide" quando cambia.
- **Freccia direzione**: animata con pulse.
- **Meteo**: l'icona meteo ha micro-animazione (es. gocce che cadono, sole che pulsa).
- **Loading**: in caso di "elaborazione" (es. allarme), una barra di caricamento.
- Effetto "glassmorphism": bordo sottile luminoso attorno al display per dare effetto vetro.

### 4.6 Tema del pannello
- **Cornice**: alluminio anodizzato spazzolato.
- **Vetro frontale**: nero lucido con leggero effetto riflettente.
- **Tasti fisici**: gli stessi cilindri attuali ma rivisti (illuminazione LED attorno).
- **Marchio**: "KONE MonoSpace" o "Schindler 5500" come serigrafia, oppure "ROXELL ELEVATOR" brand fittizio.

---

## 5. Sistema meteo casuale

### 5.1 Logica
Poiché siamo in una simulazione (no API reali), il meteo è **generato casualmente** con un set predefinito di condizioni realistiche per la zona (Roma, latitudine ~42°N):

| Condizione | Icona | Temp range | Probabilità |
|---|---|---|---|
| Sereno | ☀ | 18-32°C | 35% |
| Poco nuvoloso | ⛅ | 16-28°C | 25% |
| Nuvoloso | ☁ | 14-24°C | 15% |
| Pioggia | 🌧 | 10-20°C | 12% |
| Temporale | ⛈ | 12-22°C | 5% |
| Neve (raro, solo piani alti) | ❄ | -2-4°C | 3% |
| Nebbia | 🌫 | 8-16°C | 5% |

### 5.2 Generazione
- All'avvio: genera meteo casuale.
- Ad ogni arrivo al piano: **70% di probabilità di rigenerare** il meteo (per evitare che cambi troppo spesso).
- Il meteo è uguale per tutti i piani (stessa città), ma piani alti possono avere condizioni leggermente diverse (es. più nuvoloso, più vento).

### 5.3 Visualizzazione
- Icona disegnata come canvas texture (non emoji di sistema per compatibilità).
- Effetti animati:
  - ☀ raggio che ruota lentamente
  - ☁ nuvola che si sposta
  - 🌧 gocce che cadono
  - ❄ fiocchi che cadono
- Testo: "ROMA · 22°C · SERENO".

### 5.4 Varianti per piano
- **Piano 0-3**: meteo città (il campione base).
- **Piano 4-6**: leggermente più nuvoloso.
- **Piano 7-9**: spesso nebbia o sereno con vista panoramica (testo "VISTA PANORAMICA" sotto l'icona).

---

## 6. Informazioni sull'edificio

### 6.1 Costanti (in cima al codice)
```js
const HOTEL = {
  name: 'HOTEL ROYAL',
  subtitle: '★★★★★ Luxury since 1898',
  address: 'Via Veneto 142, Roma',
  floors: 10,
  architect: 'Studio Fuksas',
  yearBuilt: 1898,
  renovated: 2019,
  phone: '+39 06 1234567'
};
```

### 6.2 Visualizzazione
- Sul display touch: header fisso in alto con nome + orologio + data.
- Sul cartello esterno (lato corridoio): aggiungere l'indirizzo sotto "PIANO X°".
- Sul **pannello pubblicitario laterale**: slideshow con storia dell'edificio, eventi, sponsor.
- Sul **display touch**, sotto il meteo: una piccola "schermata" che mostra l'edificio stilizzato (le 10 finestre dei piani con la cabina evidenziata).

### 6.3 Mappa edificio (3D stilizzata sul display)
- Sezione piccola in basso al display: una griglia 1×10 di quadratini, uno per piano.
- Il quadratino del piano corrente è colorato (verde/giallo/rosso in base a direzione).
- I piani "in coda" sono arancioni.
- I piani già visitati di recente sono grigi.
- Effetto "ascensore che si muove": il quadratino attivo sale/scende con animazione smooth.

### 6.4 Orologio
- Aggiornato in tempo reale (orologio di sistema).
- Formato 24h "08:42".
- Data in italiano "MER 24 AGO" sotto.
- Sul pannello pubblicitario: orologio analogico stilizzato (con lancette che si muovono).

---

## 7. Proposte aggiuntive dell'agente

Sono miglioramenti che secondo me aggiungono molto "feel" con costo contenuto. Ognuno è opzionale.

### 7.1 Annunci vocali sintetizzati ⭐⭐⭐
- **Cosa**: ad ogni arrivo al piano, una voce sintetizzata (TTS) annuncia "Piano tre" o "Terzo piano".
- **Tecnologia**: Web Speech API (`speechSynthesis.speak()` con voce italiana).
- **Opzionale**: solo se la voce `it-IT` è disponibile; altrimenti fallback a un chime più elaborato.
- **Toggle**: tasto **V** per attivare/disattivare.

### 7.2 Countdown chiusura porte ⭐⭐
- Quando le porte iniziano a chiudersi, un conto alla rovescia 3..2..1 visibile sul display.
- Beep a ogni secondo (bip più acuto verso la fine).
- Cancellabile premendo "Apri porta" di nuovo.

### 7.3 Indicatore di carico (persone) ⭐⭐
- Sul display, in alto a destra, un'icona persona + numero (es. "👤 3/8").
- Simulato: incrementa di 1 ogni volta che l'utente entra/esce.
- Random: cambiamenti casuali quando la cabina è ferma (altre persone che entrano/escono — solo testo, non personaggi 3D per non appesantire).

### 7.4 Illuminazione dinamica ⭐
- Modalità **"notte"** (cambia con tasto N): luci soffuse, display più luminoso, pannello pubblicitario più visibile.
- Modalità **"emergenza"** (cambia automaticamente con allarme): luci rosse pulsanti, display lampeggia.

### 7.5 Microinterazioni UI ⭐
- Quando l'utente preme un piano sul touch, una leggera "vibrazione" della cabina (oscillazione Y di pochi mm per 200ms).
- Quando l'utente passa il mouse su un tasto fisico, il tasto si "solleva" di 1mm.
- Click "rumoroso" con tocco "thock" più secco del beep attuale.

### 7.6 Pannello pubblicitario a rotazione ⭐
- 4-5 schermate che ruotano ogni 12 secondi:
  1. Orologio analogico + data
  2. Meteo esteso (anche previsioni prossime ore)
  3. "BENVENUTI ALL'HOTEL ROYAL" + storia
  4. Ristorante "La Terrazza" — menù del giorno
  5. Spa & Wellness — offerte
- Cross-fade tra le schermate.

### 7.7 Numerazione civica e certificazioni ⭐
- Targhetta "CE · EN 81-20" (norma europea ascensori) sul lato del pannello.
- Targhetta "Ultima manutenzione: AGO 2026" sotto.

### 7.8 Modalità "costruzione" (opzionale) ⭐
- Tasto debug (B): visualizza wireframe, mostra nomi mesh, FPS, ecc.
- Solo per developer/curiosi.

---

## 8. Architettura tecnica

### 8.1 Vincoli
- **Singolo file HTML** deployato (manteniamo la filosofia attuale).
- **No dipendenze npm**: solo Three.js via CDN + importmap (già così).
- **WebGL only**: niente canvas 2D overlay (il display 3D è una texture).
- **Texture dinamiche via Canvas 2D** (già usato).
- **Audio via WebAudio API** (già usato).
- **TTS via Web Speech API** (nuovo, opzionale, con fallback).

### 8.2 Struttura del codice proposta

Il file attuale è già organizzato in sezioni. Aggiungo:

```
Sezione 0: CONFIGURAZIONE (esistente, estesa con HOTEL)
Sezione 1: SCENA, RENDERER, CAMERA (esistente)
Sezione 2: ILLUMINAZIONE (esistente, estesa con illuminazione dinamica)
Sezione 3: TEXTURE PROCEDURALI (esistente, estesa)
Sezione 4: CABINA (esistente, estesa con dettagli)
  4.1 Pavimento + soglia + tappetino
  4.2 Soffitto + griglie ventilazione
  4.3 Pareti + profili + battiscopa
  4.4 Specchio migliorato
  4.5 Maniglione
  4.6 Telecamera
  4.7 Altoparlante + citofono
  4.8 Pannello pubblicitario
  4.9 Targa + certificazioni
Sezione 5: PORTE (esistente, invariata)
Sezione 6: CORRIDOIO (esistente, invariato)
Sezione 7: PULSANTIERA MODERNA (NUOVA, sostituisce sezione 7 attuale)
  7.1 Frame e vetro
  7.2 Display touch (texture, sezioni, interazione)
  7.3 Tasti fisici
  7.4 Display touch: render() function
Sezione 8: STATO (esistente, esteso)
Sezione 9: AUDIO (esistente, esteso con TTS)
Sezione 10: METEO (NUOVA)
Sezione 11: ANNUNCI VOCALI (NUOVA)
Sezione 12: MOVIMENTO CABINA (esistente)
Sezione 13: ANIMAZIONE PORTE (esistente, estesa con countdown)
Sezione 14: ALLARME (esistente)
Sezione 15: ESCI/RIENTRA (esistente)
Sezione 16: RAYCASTING (esistente, esteso per touch)
Sezione 17: POINTER LOCK (esistente)
Sezione 18: LOOP (esistente, esteso)
Sezione 19: AVVIO (esistente)
```

### 8.3 Performance
- **Draw calls**: l'attuale è < 100; il nuovo sarà ~150-200, ancora accettabile.
- **Texture dinamiche**: ogni display usa 1 CanvasTexture ridisegnata quando necessario. Aggiungo `markDirty()` per non ridisegnare ogni frame.
- **Animazioni display**: 5-6 FPS di redraw (non 60), per non saturare la GPU.
- **Meteo animato**: idem, 10 FPS.
- **Pannello pubblicitario**: 1 FPS (cross-fade ogni 12s).
- **Stima dimensione file**: 95-110 KB (vs 74 KB attuali). Ancora ben sotto i limiti di deploy.

### 8.4 Backward compatibility
- Tutti i tasti esistenti (1-9, T, ◄|, |►, !, STOP) restano funzionanti nella pulsantiera fisica ridotta (solo !, STOP, ◄|, |►).
- I tasti 1-9 / T **spariscono** e diventano celle del display touch. Funzionalità identica.
- I tasti E, M, WASD, ESC restano invariati.
- Aggiunti: V (toggle TTS), N (modalità notte), B (debug, opzionale).

---

## 9. Fasi di implementazione

Ogni fase è un deliverable indipendente. L'utente può fermarsi a qualsiasi fase.

### Fase 1 — Dettagli interni cabina (2-3 ore di codice)
- Giunture, profili, battiscopa
- Soglia + tappetino
- Griglie ventilazione + bocchette
- Telecamera dome
- Altoparlante + citofono
- Targa + certificazioni
- Maniglione migliorato
- **Deliverable**: cabina "AAA" senza modifiche a pulsantiera/logica.

### Fase 2 — Pannello pubblicitario (1 ora)
- Display 16:9 sulla parete sinistra
- Render canvas con 4-5 schermate
- Cross-fade automatico
- Orologio analogico stilizzato
- **Deliverable**: display informativo secondario.

### Fase 3 — Pulsantiera moderna digitale (3-4 ore)
- Rimozione tasti meccanici 1-9
- Nuovo display touch con 3 sezioni (header, piano, meteo+mappa)
- Celle piano interattive con hover/click
- Tasti fisici rivisti (4 tasti)
- Animazioni di transizione
- **Deliverable**: pulsantiera moderna funzionante.

### Fase 4 — Sistema meteo (1 ora)
- Generatore casuale con pesi
- Texture icone meteo animate
- Visualizzazione su display + pannello pubblicitario
- **Deliverable**: meteo dinamico visibile.

### Fase 5 — Info edificio + mappa (1 ora)
- Header display touch
- Mappa edificio stilizzata
- Orologio digitale
- Dati hotel (nome, indirizzo, anno)
- **Deliverable**: contesto narrativo completo.

### Fase 6 — Annunci vocali (30 min)
- Integrazione Web Speech API
- Toggle con tasto V
- Annuncio all'arrivo al piano
- **Deliverable**: audio TTS italiano.

### Fase 7 — Countdown chiusura porte (30 min)
- 3..2..1 visibile sul display
- Beep crescente
- **Deliverable**: feedback di chiusura.

### Fase 8 — Illuminazione dinamica + extra (1 ora)
- Modalità notte (tasto N)
- Indicatore carico (simulato)
- Vibrazione cabina al click
- **Deliverable**: extra "feel".

### Fase 9 — Test + bilanciamento (1 ora)
- Verifica FPS
- Verifica interazioni
- Bilanciamento colori/luci
- Fix eventuali bug
- **Deliverable**: versione finale.

**Totale stimato**: 10-12 ore di codice. Posso farlo in 2-3 sessioni di lavoro consecutive.

---

## 10. Rischi e trade-off

| Rischio | Probabilità | Impatto | Mitigazione |
|---|---|---|---|
| File troppo grande per deploy | Bassa | Basso | Stima < 120 KB, ben sotto limiti |
| Performance degradata | Media | Medio | Limite redraw display, disabilitare su macchine lente |
| TTS non disponibile in italiano | Media | Basso | Fallback a chime + display testuale |
| Troppi dettagli visivi, schermata confusa | Media | Medio | Fase 3 con placeholder, poi raffino |
| Touch screen non intuitivo | Bassa | Medio | Celle grandi + hover visibile + cursor pointer |
| Conflitto con utenti che si aspettano tasti fisici | Media | Basso | Tenere 4 tasti fisici per le funzioni critiche |
| Display principale troppo scuro/contrastato | Bassa | Basso | Tema "glass" testato su sfondo scuro cabina |

### Trade-off espliciti

1. **Pulsantiera fisica vs digitale**: scelgo digitale perché più moderna e "wow", ma l'utente perde il "tactile feedback" dei tasti meccanici. Mitigazione: tasti fisici per le 4 funzioni critiche, hover visivo sul touch, vibrazione cabina al click.

2. **Dimensioni display**: un display 30×18 cm è grande, occupa metà parete laterale. Scelgo questo perché è quello che si vede negli ascensori moderni premium e perché dà abbastanza spazio per mostrare meteo + mappa + info.

3. **Meteo finto vs API reale**: scelgo finto per evitare dipendenza da internet e per coerenza con la simulazione. L'utente capisce che è un simulatore.

4. **Personaggi 3D vs indicatori testuali**: scelgo testuali ("👤 3/8") per non appesantire la scena. Le vere persone in cabina sono una complessità non necessaria.

---

## 11. Metriche di successo

Dopo l'implementazione, l'upgrade ha successo se:
- ✅ FPS resta ≥ 50 su hardware medio (testeremo).
- ✅ Tutte le interazioni esistenti (pannello, porte, allarme, piani) continuano a funzionare.
- ✅ Il display touch è leggibile e intuitivo (verifica con playtest rapido).
- ✅ Il meteo cambia in modo credibile e non rompe l'immersione.
- ✅ Gli annunci vocali (se abilitati) si sentono chiari.
- ✅ L'utente impiega < 30 secondi a capire come interagire con il touch screen.
- ✅ Il file resta deployabile e veloce da caricare (< 1s su 3G simulato).

---

## 12. Decisioni richieste

Prima di iniziare il codice, ho bisogno di conferma su:

1. **Approvazione generale del piano**: OK procedere con tutte le 9 fasi, oppure solo alcune?
2. **Fasi prioritarie**: quali fasi sono "must-have" vs "nice-to-have"? (Default: tutte, ma se vuoi velocizzare, le fasi 1-3-4-5 sono quelle "core".)
3. **Display touch**: layout proposto in 4.2 va bene? (Es. vuoi la mappa dell'edificio anche su un display separato, più grande?)
4. **Annunci vocali TTS**: incluso o no? (Alcuni utenti li trovano fastidiosi.)
5. **Meteo**: range di temperature e condizioni in 5.1 vanno bene per "Roma" o preferisci un'altra città?
6. **Brand hotel**: ti va "HOTEL ROYAL" o preferisci un altro nome (es. fittizio italiano, tipo "HOTEL BELLINI", o un tuo nome reale)?
7. **Pannello pubblicitario laterale**: lo facciamo o no? (Fase 2 separata, ~1h)
8. **Modalità notte + extra "feel"**: inclusi o no? (Fase 8)

---

## 13. Note finali

- Ogni fase è **indipendente**: se decidi di fermarti dopo la fase 3, hai già un prodotto utilizzabile.
- Tutte le fasi sono **retrocompatibili**: nessuna fase rompe le funzionalità delle precedenti.
- Se hai idee o variazioni, dimmele **prima** che inizi la codifica della fase 1, così le integro da subito.
- Posso anche procedere fase per fase, fermandomi dopo ognuna per mostrarti il risultato e ricevere feedback.

**Stima di tempo totale per implementazione completa**: 10-12 ore di lavoro mio, frazionabili in 2-3 sessioni.
