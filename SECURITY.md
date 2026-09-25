# Security Policy

## Versions supported

BOSS HOTEL Elevator 3D e un simulatore 3D client-side single-page.
La versione corrente e l'unica supportata:

| Version | Supported          |
|---------|--------------------|
| 7.0     | :white_check_mark: |

Poiche il progetto e single-file statico (no backend, no server-side code),
non ci sono versioni "vecchie" da patchare in produzione: chiunque puo
aggiornare il proprio file `elevator.html` scaricando l'ultima versione.

## Reporting a vulnerability

Per favore **NON aprire una Issue pubblica** per segnalare vulnerabilita
di sicurezza. Invia invece un report privato.

### Come segnalare

Apri una **GitHub Security Advisory** (tab "Security" → "Advisories" →
"New draft security advisory" sul repository).

Oppure, in alternativa, apri una **Issue privata** contattando direttamente
il maintainer via profilo GitHub.

### Cosa includere nel report

- Descrizione dettagliata della vulnerabilita
- Steps per riprodurre (incluso browser/OS/three.js version)
- Impatto potenziale (XSS? data exfiltration via localStorage? denial of
  service?)
- Suggerimento per il fix (se possibile)

### Tempo di risposta

- **Conferma iniziale**: entro 7 giorni dalla ricezione
- **Patch**: dipende dalla complessita; le vulnerabilita critiche
  (XSS eseguibile da URL) vengono patchate prioritarie

## Tipi di vulnerabilita rilevanti per questo progetto

Trattandosi di un'app client-side che carica script da CDN three.js via
importmap, i rischi principali da considerare sono:

- **XSS via customizzazione hotel** (D5: nome/indirizzo/tagline salvati in
  localStorage) — attenzione se in futuro si aggiungono render HTML dinamici
- **CSP** — il progetto attualmente non include un Content-Security-Policy
  header; servire da GitHub Pages con un header CSP adeguato e' raccomandato
- **localStorage poisoning** — un utente malintenzionato con accesso al
  browser potrebbe modificare i preferenze persistenti
- **Subresource Integrity** — l'importmap di three.js fa riferimento a
  cdn.jsdelivr.net; pinning con hash SRI sarebbe una buona pratica

## Out of scope

- Problemi di performance/fps (non sono vulnerabilita)
- Crash del browser con browser/OS molto vecchi (non supportati)
- Bug che richiedono accesso fisico al device dell'utente

---

Grazie per contribuire a mantenere il progetto sicuro!
