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
- Chitarra laterale (`js/guitar.js`, canvas): 8 modelli storici disegnati a mano, cambiabili cliccando l'etichetta verticale — Stratocaster '54, Flying V '58, Explorer '58, Les Paul Standard '59 (sunburst), SG '61, Red Special '64, "Frankenstrat" '79, Concorde '81. Tasti in posizione reale (formula del temperamento equabile), segnatasti fedeli al modello (punti, trapezi, pinne di squalo), paletta del tipo giusto.
- Frantumazione: scorrendo le crepe si propagano dal punto d'impatto, poi si staccano le prime schegge; a fine pagina la chitarra esplode con fisica (gravità, rimbalzi, attrito, rotazione 3D simulata), le corde si spezzano e frustano (Verlet), polvere di legno, "SMASH!". Tornando su ogni pezzo torna al suo posto. Su mobile: barra rossa con chitarrina.
- Tastiera con 6 corde suonabili sotto il titolo di ogni pagina (mouse o tocco); 12 tasti = 12 note diverse.
- Audio (`js/audio.js`): corde pizzicate Karplus-Strong + catena "ampli" (una sola distorsione sul bus, cassa simulata, limiter). Corde monofoniche, anti-raffica 35 ms, max 12 voci, pennata con 7 ms tra le corde e intensità legata alla velocità del mouse. Spento di default: pulsante 🔇/🔊 nell'header.
- Scintille e onomatopee al click, schede che si inclinano col mouse, titoli che si accendono come un ampli, comparsa "headbang" delle schede.
- Rispetta "riduci movimento" del sistema operativo.

## Crediti e ispirazioni (tecniche, codice riscritto da zero, nessuna dipendenza)
- [aaronbeall/fracture](https://github.com/aaronbeall/fracture) — crepe radiali dal punto d'impatto, schegge fini vicino al colpo e lastre grandi lontano, impulso e rotazione per pezzo.
- [dgreenheck/three-pinata](https://github.com/dgreenheck/three-pinata) (MIT) — frattura concentrata sull'impatto e "doppio materiale" per le facce interne (qui: legno grezzo come spessore dei frammenti).
- [Delaunay Triangle Shatter (CodePen)](https://codepen.io/coolfrans/pen/wBGrwNV) — frammenti che tornano al loro posto.
- verlet-js (integrazione di Verlet) — corde come catene di punti con vincoli di distanza.

## Licenza
- **Codice** (HTML, CSS, JS): [MIT](LICENSE).
- **Testi originali**: [CC BY 4.0](LICENSE-CONTENT.md), citando "Riffologia — Fabio Ambrosino".
- **Font**: Google Fonts, SIL Open Font License 1.1.

## Marchi
Riffologia è un progetto amatoriale e indipendente, senza scopo di lucro, non affiliato né approvato da alcuna band, etichetta o produttore di strumenti.
Fender, Stratocaster, Gibson, Les Paul, SG, Flying V, Explorer, Jackson, Concorde e gli altri nomi di band, album e strumenti citati sono marchi dei rispettivi titolari e sono usati solo per identificare i prodotti di cui si parla.
Le chitarre disegnate sul canvas sono illustrazioni stilizzate *ispirate a* modelli storici, non riproduzioni ufficiali. Il sito non contiene loghi né immagini di terzi.
