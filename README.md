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

## Effetti interattivi (`css/effects.css`, `js/effects.js`)
- Cursore a chitarra; su link e pulsanti diventa un plettro.
- Chitarra laterale = indicatore di scorrimento: il plettro scende sul manico, le corde vibrano mentre scorri, la chitarra si crepa e si smonta; a fine pagina si spacca ("SMASH!") e si ricompone tornando su. Su mobile: barra rossa con chitarrina che ruota.
- Tastiera con 6 corde suonabili sotto il titolo di ogni pagina (mouse o tocco); 12 tasti = 12 note diverse.
- Audio (`js/audio.js`): corde pizzicate Karplus-Strong + catena "ampli" (una sola distorsione sul bus, cassa simulata, limiter). Corde monofoniche, anti-raffica 35 ms, max 12 voci, pennata con 7 ms tra le corde e intensità legata alla velocità del mouse. Spento di default: pulsante 🔇/🔊 nell'header.
- Scintille e onomatopee al click, schede che si inclinano col mouse, titoli che si accendono come un ampli, comparsa "headbang" delle schede.
- Rispetta "riduci movimento" del sistema operativo.
