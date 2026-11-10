# Riffologia 🤘

Enciclopedia interattiva di **rock, hard rock e metal** (aggiornata a novembre 2026).

## Pagine
| Pagina | Contenuto | Interattività |
|---|---|---|
| `index.html` | Home, ultime notizie 2025-26 | marquee, contatori |
| `storia.html` | Le 9 ere + linea del tempo 1950-2026 | filtri per decennio e tema |
| `generi.html` | 56 sottogeneri in 6 famiglie | manopole d'ampli (pesantezza/velocità), ricerca, ordinamento, schede dettaglio, genere a caso |
| `band.html` | 355 band (300 storiche, 55 emergenti), Italia, 96 cambi di formazione, In memoriam | preferiti, ricerca, filtri per genere/paese/stato/lettera, ordinamento, "carica altre" |
| `hall-of-fame.html` | Chitarristi, cantanti, batteristi, bassisti | voti (3 per categoria), band dei sogni, copia formazione |
| `strumenti.html` | Chitarre, bassi, batterie, piatti e pedali | wizard "scegli il tuo strumento", catalogo filtrabile, confronto fino a 3 modelli |
| `quiz.html` | 24 domande, 10 a partita | punteggio, record personale |

L'analisi completa (storia, generi, lutti/sostituzioni, strumenti, scelte di design) è in [ANALISI.md](ANALISI.md).

## Design
- Font: **Anton** (titoli da manifesto), **UnifrakturMaguntia** (accenti blackletter), **Archivo** (testo), **JetBrains Mono** (dati).
- Palette: nero carbone, "bone", rosso amplificatore, oro per la Hall of Fame. Tema chiaro opzionale.

## Avvio
Sito statico, nessuna build: apri `index.html` nel browser, oppure
```bash
npx serve .
```
Dati in `js/data.js`. Voti/preferiti salvati in `localStorage` (solo nel browser dell'utente).
