# Support

## Dove chiedere aiuto

### Per domande sull'uso del progetto

- **README.md** — quick start, comandi, struttura, deploy
- **ARCHITECTURE.md** — diagrammi architetturali e flussi dati
- **CONTRIBUTING.md** — guida contributor

### Per bug report

- Apri una **GitHub Issue** con:
  - Descrizione del problema (incluso cosa stavi facendo quando si e
    verificato)
  - Browser/OS/three.js version
  - Steps per riprodurre
  - Screenshot se visivo
  - Output del maintenance overlay (Shift+M): FPS, draw calls, log eventi
    (clicca "Esporta stato JSON" e allega il file)

### Per richieste di feature

- Apri una **GitHub Issue** con label "enhancement"
- Prima verifica che non sia gia nel backlog attivo (`PIANO_V4.md` sezione
  "Roadmap possibile post-V4")

### Per domande di design / architettura

- Vedi `AGENTS.md` sezione "Contratti D-key" (D1-D26) per i pattern di
  progetto
- Vedi `PIANO_MIGLIORAMENTI.md` per il log implementativo storico

### Per vulnerabilita di sicurezza

**NON aprire una Issue pubblica.** Vedi `SECURITY.md` per la procedura
di responsible disclosure.

## Tempi di risposta

Questo e un progetto open source single-maintainer. Tempi di risposta
tipici:

- **Bug critici** (crash, perdita dati): entro 7 giorni
- **Bug normali**: entro 30 giorni
- **Feature request**: valutazione entro 30 giorni, implementazione
  best-effort (la priorita e data da impatto vs sforzo)
- **Domande**: entro 7 giorni

## Community

Il progetto non ha (ancora) canali di community dedicati (Discord/Slack).
Per ora usa:

- **GitHub Discussions** (se attive) per Q&A aperte
- **GitHub Issues** per bug e feature
- **Pull Request** per contributi diretti al codice

## Se sei nuovo al 3D / Three.js

Risorse utili:

- [Three.js docs](https://threejs.org/docs/) — documentazione ufficiale
- [Three.js examples](https://threejs.org/examples/) — codice di esempio
  runnabile
- [MDN Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)
  — per capire il TTS annunci
- [MDN Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
  — per capire l'audio contestuale

Il progetto usa WebGL 2 + ES2020 modules; serve un browser moderno
(Chrome/Edge/Firefox/Safari degli ultimi 12 mesi).

---

**Happy hacking!**
