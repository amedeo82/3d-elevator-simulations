# Roadmap post-pubblicazione (post-V7)

> Documento di pianificazione aperto per la community. Raccoglie idee
> e opportunità emerse dopo la release v7.0 (2026-09-25) ma non
> incluse in Polish Pack V4. Ogni idea può essere affrontata via PR
> dalla community o in future sessioni del maintainer.
>
> Per suggerire nuove entry: apri una issue usando il template
> `.github/ISSUE_TEMPLATE/polish.md`.

## Tier T1 — Quick win ad alto impatto

| Idea | Effort | Note |
|---|---|---|
| Strip Bling Hotel dalla pulsantiera al Lobby (camere 101-109 stilizzate in HUD) | Piccolo | Polish post-V2 Step 5c, demanda per ora disattesa |
| Indicatore di consumo energetico in maintenance overlay (W stimati dalla cabina + carichi corridoio) | Piccolo | Tema "realismo industriale" |
| Suono ambiente differenziato per stagione corrente (inverno silenzioso, estate venti/AC) | Piccolo | Polish V2 Step 4 meteo evoluto |

## Tier T2 — Miglioramenti significativi

| Idea | Effort | Note |
|---|---|---|
| PWA installabile (service worker + manifest, cache offline elevator.html) | Grande | Rinviato da V2 Step 6; abilita uso offline / mobile "installed" |
| Localizzazione IT / EN / DE / FR / ES (estensione di D8) | Grande | `STRINGS[lang]` già predisposto, serve solo aggiungere le 2 lingue |
| Texture HD per arredi (texture procedurali → asset HD con LOD scaling) | Grande | Polish V2 rinviato per performance |
| Backend opzionale per telemetria anonima (pageview + errori con indole aggregata) | Medio | Solo per maintainer; opt-in utente; niente PII |

## Tier T3 — Visione a lungo termine

| Idea | Effort | Note |
|---|---|---|
| WebXR / VR (Polish Pack V5) | Epico | Rinviato da V2 Step 13; richiede redesign camera + input |
| Multi-cabina (ascensori A/B) | Epico | Polish V2 rinviato; richiede state machine multi-cabin + UI minima per indicare "altra cabina più vicina" |
| Supporto > 10 piani parametrico | Medio | Render performance scaling, via CONFIGURAZIONE NUM_FLOORS |
| Modalità multiplayer (più utenti nella stessa cabina) | Epico | Richiede server (WebSocket o WebRTC) |

## Polish maintenance (V4 chiuso, ma sempre attivo)

- Aggiornare `find-long-fns.js` se cambiano pattern di brace-counting.
- Aggiornare `check-balance.js` se si aggiungono nuovi pattern di script module.
- Manutenere `BossHotelPure` come single source of truth per funzioni pure.
- Aggiungere test in `tests.html` ad ogni nuova funzione pura esposta.

## Come contribuire

1. Fork del repo.
2. Branch dedicato: `git checkout -b feature/<branch-name>`.
3. Rispettare i 26 D-key contracts (vedi `AGENTS.md`).
4. PR con descrizione dettagliata + riferimento a issue (se esiste).

Convenzioni aggiuntive:
- Commenti in italiano + sezioni numerate.
- No emoji nel codice JS (solo in HUD / README).
- `node scripts/check-balance.js elevator.html` deve passare.
- `tests.html` deve restare al 100% pass.
- Nessuna funzione >= 150 righe (controllo automatico via CI).
