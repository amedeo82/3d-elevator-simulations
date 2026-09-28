# Comandi

[← Torna al README](../README.md)

## Desktop — mouse e tastiera

| Azione | Tasto |
|---|---|
| Entra / attiva mouse-look | Click iniziale |
| Ruota visuale | Mouse |
| Esci dal mouse-look | `ESC` |
| Premi pulsanti del pannello | Click |
| **Esci / rientra cabina** | `E` (o ↗ sul pannello, o ↙ HUD vicino alle porte) |
| Movimento nel corridoio | `W` `A` `S` `D` |
| Toggle audio effetti | `M` |
| Toggle annunci vocali | `V` |
| Toggle modalità notte | `N` |
| **Chiama un piano** | `1`–`9` / `0` (anche tastierino numerico) |
| **Fuori servizio** | `O` (toggle manutenzione) |
| **Comando vocale** | `K` (toggle speech-to-text) |
| **Apri / rivedi tutorial** | `?` (5 step contestuali al primo avvio) |
| **Modalità manutentore** | `Shift+M` (debug + wireframe + teletrasporto) |
| **Personalizza hotel** | `H` (9 campi editabili + 4 preset, salvataggio in `localStorage`) |
| **Lingua IT / EN** | `L` (toggle live, persistenza in `localStorage.bossHotelLang@v1`) |

## Flusso tipico

1. Click su "Entra nell'ascensore" → il mouse viene "catturato" (pointer lock)
2. Sei al piano Terra, vedi l'interno della cabina, le porte sono aperte
3. Gira la testa verso sinistra → vedi il pannello con il display touch
4. Clicca su una cella della griglia (es. "5") → la cabina parte
5. Il display mostra "▲ IN SALITA", senti "Piano quinto, prego"
6. All'arrivo: countdown chiusura porte → porte si chiudono
7. Vuoi scendere? Click su un altro piano
8. Vuoi uscire? Click sul tasto ↗ (verde) in alto a destra del pannello, oppure premi `E`
9. Nel corridoio, usa WASD per esplorare, premi `E` vicino alle porte per rientrare

## Mobile — touch

Nessun pointer lock: il look è col dito, il movimento col joystick virtuale.

| Azione | Controllo |
|---|---|
| Ruota la visuale | Trascina il dito ovunque sulla scena |
| Movimento nel corridoio | Joystick virtuale in basso a sinistra |
| Chiama un piano | `▲` / `▼` a destra (stessa semantica: "voglio il mio piano") |
| Esci / rientra cabina | Tap sul badge HUD in alto |
| Azioni senza tastiera | Menu `☰` in alto a sinistra (audio, vocali, notte, fuori servizio, tutorial, personalizza, manutenzione, lingua) |

Su iPhone l'orizzontale è consigliato ma non più obbligatorio: se resti in
portrait compare un avviso dismissabile in alto, non un blocco a schermo
intero.

