# Piano V3 — Roadmap Polish Qualitativo
**Documento di design e implementazione iterativa per BOSS HOTEL Elevator 3D**

> Versione 0.1 — Aperto 2026-09-17 (chiusura V2)
>
> V3 sposta il focus da **aggiungere feature** a **migliorare la qualità**
> di quelle esistenti. Niente nuove funzionalità grosse (rimandate a V4+):
> solo polish qualitativo incrementale mirato a rendere il simulatore
> più solido, accessibile, performante e piacevole da usare.
>
> Stato: **scope da finalizzare** — vedi §Step 1 (Scope discovery).
> Vedi `PIANO_V2.md` §Stato finale V2 per lessons learned che informano V3.
>
> Workflow: stesso pattern di V2 — file `PIANO_V3.md` con step numerati,
> Decision Questions via `question` tool, branch dedicati per step,
> commit separati per sotto-step, merge `--no-ff`.

---

## 0. Indice degli step (provvisorio)

| # | Step | Sforzo | Impatto | Tipo | Stato |
|---|---|---|---|---|---|
| 1 | Scope discovery: decidere i 4-6 step V3 | 1 sessione | 🟡 | Pianificazione | ⏳ |
| 2+ | TBD (scope da definire allo Step 1) | TBD | TBD | TBD | ⏳ |

**Legenda stato**: ⏳ pending · 🔄 in corso · ✅ done · ❌ scartato

---

## Tier di scope V3 (candidati)

V3 attinge da 3 tier di scope qualitativi. Lo Step 1 (scope discovery)
seleziona 4-6 step da questo menu:

### Tier 1 — Alto valore, effort medio-basso

- **T1a · Accessibility**: sottotitoli garantiti per TTS, rispetto `prefers-reduced-motion`,
  focus visibile su bottoni HUD, contrasto migliorato su display touch
- **T1b · Bug fix UX sistematico**: audit corner case (porte a metà, click durante
  movimento, allarme + OOO, citofono + SOS, language switch durante annuncio)
- **T1c · Settings QoL**: volume audio suddiviso (effetti/musica/TTS), luminosità
  display touch, snapshot stato per debug

### Tier 2 — Valore medio, effort medio

- **T2a · Micro-animazioni**: tasti display touch "respiro", cartello con effetto
  "lampeggio gentile" su chiamata accettata, maniglione che vibra in modo più
  credibile, fade gentile per cambi stato
- **T2b · Performance**: profiling FPS in vari scenari, riduzione draw call,
  ottimizzazione shader, lazy load texture
- **T2c · Quality of life manutenzione**: log eventi più ricco, export stato
  corrente come JSON per debug, history ultimi N allarmi/interphonate

### Tier 3 — Lungo termine, alto effort

- **T3a · Documentazione completa**: commentare il codice "core" ancora scarsamente
  documentato, diagrammi ASCII delle dipendenze tra moduli
- **T3b · Test coverage estesa**: salire da 53 a 100+ test, coprire casi limite
  routing, edge cases passegeri, integrazione (non solo unit)

---

## Contratti V3 (ereditati da V2)

Vedi `AGENTS.md` per i contratti di progetto completi (D1-D10). V3 aggiunge
i seguenti constraint:

- **C-V3-1**: nessuna feature additiva grossa (no nuovi pulsanti, no nuove schermate).
  Solo miglioramenti di feature esistenti.
- **C-V3-2**: ogni step deve aggiungere almeno 1 test in `tests.html` (se ha logica
  testabile) o 1 smoke test visivo (se puramente visivo).
- **C-V3-3**: ogni step segue il workflow "Decision Questions via `question` tool" prima
  di scrivere codice. Manteniamo il contratto utente.
- **C-V3-4**: ogni step ha acceptance criteria espliciti in `PIANO_V3.md`.
- **C-V3-5**: smoke test screenshot prima del merge (lezione V2: verifica visiva
  occasionale, da rendere sistematica).

---

## Decisioni globali (cross-step)

### DG-V3.1 — Branch strategy

- **A. Ogni step in branch dedicato** (`feature/v3-step-N`) + merge dopo validazione *(Recommended, coerente con V2)*
- **B. Tutti gli step in un unico branch** `feature/polish-pack-v3`
- **C. Step a basso rischio diretti su `main`**

### DG-V3.2 — Commit strategy

- **A. Commit separati per sotto-step** *(Recommended, pattern V2)*
- **B. Commit unico per step**
- **C. Commit unico per branch + squash al merge**

### DG-V3.3 — Aggiornamento documentazione

- **A. `PIANO_V3.md` come roadmap + `PIANO_MIGLIORAMENTI.md` come log** *(Recommended, stesso pattern V2)*
- **B. Solo `PIANO_V3.md`**
- **C. Tutto in un nuovo `CHANGELOG.md`**

### DG-V3.4 — Versetti e branching del repo

- **A. Continuare su `main`** (V3 chiuso su main, versioni in README)
- **B. Branch dedicato `v3`** con merge finale su main
- **C. Tag `v3.0` finale** al merge dell'ultimo step

---

# STEP 1 · Scope discovery: decidere i 4-6 step V3

## Scope proposto

V3 parte da uno step "meta" che seleziona i candidati effettivi dai Tier 1/2/3.
Questo step dura ~1 sessione e produce la tabella "Indice degli step" definitiva.

## Decision Questions

### Q1.1 — Quanti step totali per V3?

- **A. 4 step** (focus mirato, ~3-5 ore totali) *(Recommended)*
- **B. 6 step** (bilanciato, ~6-10 ore totali)
- **C. 8 step** (ambizioso, ~10-15 ore totali)

### Q1.2 — Quanti Tier 1 (alto valore, basso effort)?

- **A. Tutti e 3 (T1a, T1b, T1c)** *(Recommended per completeness)*
- **B. Solo 2 su 3** (scegliere in seguito)
- **C. Nessuno** (focus solo Tier 2-3)

### Q1.3 — Quanti Tier 2 (qualitativo)?

- **A. Tutti e 3 (T2a, T2b, T2c)**
- **B. Solo T2a (micro-animazioni)** *(Recommended per 'feel')*
- **C. Nessuno** (focus solo Tier 1+3)

### Q1.4 — Tier 3 (lento, alto effort)?

- **A. Solo T3a (documentazione)** *(Recommended per completezza post-V2)*
- **B. Solo T3b (test coverage estesa)**
- **C. Entrambi T3a + T3b**
- **D. Nessuno** (rimandare a V4)

### Q1.5 — Step "bonus" non in lista?

- **A. No, restare nel menu Tier** *(Recommended)*
- **B. Aggiungi specifico step** (es. "ottimizzazione mobile", "tema dark mode", ecc.)

## Acceptance criteria

- [ ] Tabella "Indice degli step" definitiva con scope confermato
- [ ] Ogni step ha scope proposto + Decision Questions abbozzate (anche minime)
- [ ] Effort stimato totale = 4-15 ore a seconda delle scelte

## Effort

1 sessione (~1-2 ore).

---

# Come procedere ora

Questo è il primo step di V3. Rispondi alle Decision Questions (Q1.1-Q1.5)
per definire il backlog definitivo. Poi iteriamo sui singoli step come in V2.

Workflow:

1. Tu rispondi alle Decision Questions via `question` tool, una alla volta.
2. Implemento solo le opzioni approvate.
3. Aggiorno `PIANO_V3.md` segnando lo step come ✅.
4. `node scripts/check-balance.js elevator.html` dopo ogni modifica.
5. Commit separati per sotto-step.
6. Aggiorno `PIANO_MIGLIORAMENTI.md` con la fase implementata al merge finale.
