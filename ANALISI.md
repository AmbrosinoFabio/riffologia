# RIFFOLOGIA — Analisi preliminare e scelte di design

> Aggiornata al 10 novembre 2026. Le notizie 2025–2026 sono state verificate su fonti di settore (Blabbermouth, Loudwire, Louder/Metal Hammer, The Guardian, Britannica, Wikipedia "2026 in heavy metal music").

---

## 1. Analisi storica: dal blues al metal moderno

| Era | Cosa succede | Svolta chiave |
|---|---|---|
| **1950–1964** | Il rock'n'roll nasce da blues, R&B e country. La chitarra elettrica (Telecaster 1950, Les Paul 1952, Stratocaster 1954) diventa protagonista. | Chuck Berry, Elvis, Little Richard |
| **1964–1969** | British Invasion, blues rock, psichedelia. Nasce la distorsione come *scelta estetica* (Kinks, Hendrix, Cream). | "You Really Got Me" (1964), *Are You Experienced* (1967) |
| **1968–1975** | Nasce l'**hard rock** (Led Zeppelin, Deep Purple) e, il 13 febbraio 1970, l'**heavy metal** con *Black Sabbath*. Prog rock e glam in parallelo. | Il tritono di Iommi, accordature basse, temi oscuri |
| **1975–1984** | Judas Priest definiscono look (pelle e borchie) e twin guitars. Il punk accelera tutto. **NWOBHM** (Iron Maiden, Saxon, Motörhead, Venom). Van Halen rivoluziona la tecnica col tapping. | *British Steel* (1980), *The Number of the Beast* (1982) |
| **1983–1991** | Esplosione: **thrash** (Big Four), **glam/hair metal** (Mötley Crüe, Bon Jovi), **power** (Helloween), **speed**, primi semi di **death** e **black**. | *Master of Puppets* (1986), *Appetite for Destruction* (1987) |
| **1990–1999** | **Grunge** spazza via il glam. Il metal si frammenta: groove (Pantera), death floridiano, black norvegese, doom/gothic, industrial (Rammstein), **nu metal** (Korn, Slipknot). | *Nevermind* (1991), *Black Album* (1991) |
| **2000–2012** | **Metalcore** e melodic death, prog metal moderno, folk/viking e symphonic metal in Europa, stoner/sludge (Mastodon). Rinascita del rock "classico" (Foo Fighters, Ghost dal 2010). | *Leviathan* (2004), Wacken diventa globale |
| **2012–2020** | **Djent** e prog chitarristico (Periphery, Animals as Leaders, Polyphia), deathcore maturo, blackgaze (Deafheaven), metal "pop" (Babymetal, Sleep Token). | Streaming, YouTube playthrough, TikTok |
| **2020–2026** | Generazione "senza confini": deathcore sinfonico (Lorna Shore), hardcore mainstream (Turnstile, Knocked Loose), alt-metal R&B (Sleep Token, Bad Omens), nu-metal revival. Le leggende vanno in pensione o scompaiono. | Back to the Beginning (5/7/2025), *Even in Arcadia* n.1 Billboard (2025) |

### Tendenze trasversali emerse dall'analisi
1. **Dicotomia luce/buio**: tutto il genere vive di contrasto estremo (silenzio → muro di suono, clean → growl). → *Design ad altissimo contrasto*.
2. **Cultura del logo e del poster**: ogni band è un marchio grafico (blackletter, loghi illeggibili del black metal, gig poster, toppe sul giubbotto). → *Tipografia come protagonista*.
3. **Feticismo dell'attrezzatura**: manopole dell'ampli, pedali, specifiche tecniche, setlist. → *Elementi UI ispirati agli amplificatori, dati in carattere monospaziato*.
4. **Genealogia**: i sottogeneri sono un albero genealogico, i fan discutono di "chi ha influenzato chi". → *Esplorazione interattiva e filtrabile*.
5. **Comunità e classifiche**: il metal ama le liste, i "best of", i dibattiti. → *Votazioni, band dei sogni, quiz*.

---

## 2. Sottogeneri mappati (56)

Suddivisi in 6 famiglie: **Radici** (rock'n'roll, blues rock, hard rock, psichedelia, prog, glam, punk, southern, stoner rock…), **Heavy classico** (heavy, NWOBHM, speed, power, glam metal, epic, neoclassico), **Estremo** (thrash, crossover, death, melodeath, tech death, brutal death, black, atmospheric black, blackgaze, war metal, grindcore, deathcore), **Lento & pesante** (doom, funeral doom, stoner metal, sludge, drone, gothic, post-metal), **Moderno & alternativo** (grunge, alt metal, groove, industrial, nu metal, metalcore, post-hardcore, mathcore, djent, prog metal, avant-garde, kawaii metal, trap metal, nu-metalcore, hardcore moderno, alt-metal "atmosferico", alternative rock/post-grunge), **Epico & folk** (symphonic, folk, viking, pagan, celtic, pirate, Oriental).

Tutti i dettagli sono in `js/data.js` (descrizione, origine, anno, intensità, velocità, band chiave).

---

## 3. Lutti e sostituzioni (selezione)

- **AC/DC** – Bon Scott † 1980 → Brian Johnson; Malcolm Young (ritiro 2014, † 2017) → Stevie Young.
- **Black Sabbath** – Ozzy licenziato 1979 → R. J. Dio (†2010). **Ozzy Osbourne † 22/07/2025**, 17 giorni dopo il concerto d'addio *Back to the Beginning*.
- **Iron Maiden** – Di'Anno (†2024) → Bruce Dickinson (1981); Blaze Bayley 1994–99; Nicko McBrain lascia i tour (dic. 2024) → Simon Dawson.
- **Metallica** – Cliff Burton † 1986 → Jason Newsted → Robert Trujillo (2003).
- **Pantera** – Dimebag † 2004, Vinnie Paul † 2018 → reunion 2022 con Zakk Wylde e Charlie Benante.
- **Linkin Park** – Chester Bennington † 2017 → Emily Armstrong (2024).
- **Rush** – Neil Peart † 2020 → Anika Nilles per il reunion tour 2026.
- **Foo Fighters** – Taylor Hawkins † 2022 → Josh Freese → Ilan Rubin (2025).
- **Arch Enemy** – Liiva → Gossow → White-Gluz → **Lauren Hart (2026)**.
- **KISS** – **Ace Frehley † 16/10/2025**. **Mastodon** – Brent Hinds esce a marzo 2025, **† 20/08/2025**. **At the Gates** – **Tomas Lindberg † 16/09/2025**.
- **2026**: Francis Buchholz (ex Scorpions), Ross the Boss (ex Manowar), Mike Browning (Morbid Angel/Nocturnus), Frank Beard (ZZ Top), **Cronos (Venom) † 01/10/2026**. King Diamond sostituisce Andy LaRocque con Gus G.; Megadeth pubblica l'ultimo album e parte il tour d'addio.

Elenco completo (60+ eventi) nella pagina **Band → Cambi di formazione** e **In memoriam**.

---

## 4. Analisi strumenti

**Chitarre** – Quattro "famiglie" di forma dominano: *single-cut* (Les Paul: sustain, calore, hard rock/doom), *double-cut offset/superstrat* (Strat, Ibanez RG, Jackson Soloist: versatilità e shred), *forme aggressive* (Flying V, Explorer, Warlock, Rhoads: heavy/thrash), *moderne headless/multiscala* (Strandberg, Kiesel, .strandberg: djent/prog). Variabili decisive: pickup (single-coil vs humbucker vs attivi), numero di corde (6/7/8), scala (24.75"–27" e fanned fret), ponte (fisso vs Floyd Rose).

**Bassi** – Precision (punch) e Jazz (definizione) sono lo standard; StingRay (attacco moderno), Rickenbacker 4003 (Lemmy, Geddy, Cliff), Thunderbird (rock/metal), Spector e Ibanez SR (moderni, attivi), Dingwall multiscala (djent).

**Batteria** – Legno (acero = rotondo; betulla = aggressivo; mogano = caldo), configurazione (singola cassa vs doppia cassa/doppio pedale), pelli e misure. Piatti: Zildjian, Sabian, Paiste (la scelta "metal" storica), Meinl.

---

## 5. Decisioni di design derivate dall'analisi

| Caratteristica della musica | Traduzione nel design |
|---|---|
| Contrasto estremo | Fondo **nero carbone `#0b0b0c`**, testo **"bone" `#ece6da`**, accento **rosso amplificatore `#e1251b`**, oro **`#d4a24c`** solo per la Hall of Fame |
| Gig poster, toppe, merch | Titoli in **Anton** (condensato da manifesto) enormi, in maiuscolo, con versione *outline* |
| Loghi metal / blackletter | **UnifrakturMaguntia** usata con parsimonia come "firma" (logo, numeri di sezione) |
| Leggibilità di un'enciclopedia | Corpo in **Archivo** (grottesco robusto, ottimo a schermo) |
| Cultura dell'attrezzatura | Specifiche e date in **JetBrains Mono**; filtri a **manopola d'ampli**; voti come **VU-meter** |
| Distorsione / rumore | Grana pellicola (SVG noise), hover "glitch" sui titoli, marquee di nomi di band |
| Genealogia | Esploratore generi con filtri, ricerca e manopole intensità/velocità |
| Comunità | Voti, band dei sogni, quiz, wizard "scegli il tuo strumento", confronto modelli |

Stile complessivo: **"brutalismo editoriale"** — griglia rigida, bordi netti, niente arrotondamenti morbidi, ma spazio generoso e gerarchia pulita: moderno, non nostalgico.

Modalità chiara disponibile ("poster su carta") per chi la preferisce.
