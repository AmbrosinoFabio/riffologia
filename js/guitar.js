/* RIFFOLOGIA — chitarra laterale: 8 modelli storici + frantumazione a impatto
 *
 * Tecniche ispirate a progetti open source (codice riscritto da zero, nessuna dipendenza):
 *  - aaronbeall/fracture  -> crepe radiali dal punto d'impatto che si ramificano; schegge fini vicino
 *                            al colpo e lastre grandi lontano; impulso + rotazione per ogni pezzo
 *  - three-pinata (MIT)   -> frattura concentrata sull'impatto e "doppio materiale": le facce interne
 *                            dei frammenti mostrano il legno grezzo (spessore)
 *  - Delaunay Triangle Shatter (CodePen) -> i frammenti tornano al loro posto ("fit back")
 *  - verlet-js            -> corde come catene Verlet che si spezzano, frustano e si arricciano
 *
 * Funzionamento: la chitarra è disegnata su un canvas (sprite). Il piano viene diviso in celle
 * (anelli a raggio crescente x raggi angolari, vertici condivisi con jitter = tassellatura perfetta).
 * Scorrendo, le crepe si propagano dall'impatto (lunghezza ∝ scroll), poi si staccano le prime schegge;
 * a fine pagina tutto esplode con fisica (gravità, rimbalzo sul fondo, attrito, finta rotazione 3D).
 * Tornando su, ogni pezzo e ogni corda tornano al loro posto.
 */
(function(){
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const WIDE = matchMedia("(min-width:1000px)");
  const GW = 84, s = GW/100, PADX = 14, G = 2200;

  /* ---------------- MODELLI STORICI (coordinate corpo: larghezza 100, giunto manico y=0) ---------------- */
  const MODELS = [
    { id:"strat54", year:1954, name:"Stratocaster", who:"Fender · il modello di Hendrix, Gilmour, Blackmore",
      body:"M42 8 C40 -6 30 -22 20 -16 C12 -10 14 8 16 22 C18 34 6 44 4 62 C0 90 14 126 50 128 C86 126 100 96 96 66 C94 50 82 44 86 30 C88 18 90 2 82 -2 C74 -6 64 4 58 8 Z",
      fin:"strat2", guard:{ p:"M38 12 C30 8 22 14 20 26 C18 40 26 50 24 64 C22 80 30 92 40 96 L56 96 C60 88 70 86 76 78 C82 70 78 56 70 50 L64 40 C66 28 62 16 58 12 Z", c:"#f4f1e8" },
      pu:[{x:50,y:42,w:22,h:6,t:"sc"},{x:50,y:58,w:22,h:6,t:"sc"},{x:50,y:75,w:22,h:6,t:"sc",a:-.2}],
      bridge:{y:90,w:26,h:7,t:"trem"}, knobs:[[66,88],[72,97],[79,106]], knobC:"#f2efe6",
      head:"fender", headC:"#dcb877", fb:"#e3c389", inlay:"dot", inlayC:"#1a1a1a", hw:"#d8d8d8", fbEnd:30, impact:[50,104] },
    { id:"v58", year:1958, name:"Flying V", who:"Gibson · in korina, poi l'arma di Hendrix, Schenker e K.K. Downing",
      body:"M38 0 L2 120 Q0 128 8 130 L16 130 L50 70 L84 130 L92 130 Q100 128 98 120 L62 0 Z",
      fin:"korina", grain:true, guard:{ p:"M39 4 L61 4 L70 34 C58 40 42 40 30 34 Z", c:"#f4f1e8" },
      pu:[{x:50,y:26,w:24,h:11,t:"hb"},{x:50,y:46,w:24,h:11,t:"hb"}],
      bridge:{y:58,w:24,h:3,t:"tom"}, tail:{p:"M38 64 L62 64 L57 76 L43 76 Z"}, knobs:[[22,98],[15,112],[80,100]], knobC:"#d4a24c",
      head:"v", headC:"#d9b97f", fb:"#3b2416", inlay:"dot", inlayC:"#efe7d6", hw:"#d4a24c", fbEnd:14, impact:[22,112] },
    { id:"exp58", year:1958, name:"Explorer", who:"Gibson · futurista nel '58, poi icona di James Hetfield",
      body:"M42 0 L30 -14 L22 -10 L8 34 L2 120 L58 126 L100 100 L96 86 L70 70 L78 36 L66 20 L58 4 Z",
      fin:"korina", grain:true, guard:{ p:"M41 2 L57 4 L64 22 L70 40 L64 62 L36 66 L30 34 Z", c:"#f4f1e8" },
      pu:[{x:50,y:32,w:24,h:11,t:"hb"},{x:50,y:52,w:24,h:11,t:"hb"}],
      bridge:{y:64,w:24,h:3,t:"tom"}, tail:{y:73,w:26,h:4}, knobs:[[66,96],[76,92],[86,98]], knobC:"#d4a24c",
      head:"hockey", headC:"#d9b97f", fb:"#3b2416", inlay:"dot", inlayC:"#efe7d6", hw:"#d4a24c", fbEnd:16, impact:[30,100] },
    { id:"lp59", year:1959, name:"Les Paul Standard", who:"Gibson · il 'Burst' di Page, Slash, Clapton e Peter Green",
      body:"M42 0 C30 2 12 6 10 24 C8 38 16 46 14 56 C10 66 0 76 2 96 C4 118 26 130 50 130 C74 130 96 118 98 96 C100 76 90 66 86 56 C84 48 92 40 90 28 C89 18 80 14 72 18 C66 22 62 14 62 4 L58 0 Z",
      fin:"lpBurst", binding:"#f1e6c8", guard:{ p:"M62 30 C72 28 81 35 83 47 C85 59 79 70 71 74 C67 63 63 46 62 30 Z", c:"#efe2c0" },
      pu:[{x:50,y:52,w:24,h:11,t:"hb",ring:"#efe2c0",c:"#1a1a1a"},{x:50,y:75,w:24,h:11,t:"hb",ring:"#efe2c0",c:"#1a1a1a"}],
      bridge:{y:88,w:26,h:3,t:"tom"}, tail:{y:97,w:28,h:4}, knobs:[[70,103],[79,91],[77,115],[86,103]], knobC:"#d4a24c", toggle:[22,24],
      head:"gibson", headC:"#111", fb:"#2a170c", fbBind:"#f1e6c8", inlay:"trap", inlayC:"#efe7d6", hw:"#e3c463", fbEnd:34, impact:[50,108] },
    { id:"sg61", year:1961, name:"SG", who:"Gibson · le corna del diavolo di Tony Iommi e Angus Young",
      body:"M42 6 C38 -4 30 -16 22 -20 C22 -10 16 2 12 14 C8 26 14 40 8 56 C0 76 4 116 50 122 C96 116 100 76 92 56 C86 40 92 26 88 14 C84 2 78 -10 78 -20 C70 -16 62 -4 58 6 Z",
      fin:"cherry", guard:{ p:"M34 30 C26 36 22 48 24 60 C26 74 34 84 44 86 L62 86 C70 80 74 70 72 60 C70 48 66 36 60 30 Z", c:"#121212" },
      pu:[{x:50,y:46,w:24,h:11,t:"hb",c:"#111"},{x:50,y:68,w:24,h:11,t:"hb",c:"#111"}],
      bridge:{y:80,w:26,h:3,t:"tom"}, tail:{y:89,w:28,h:4}, knobs:[[68,95],[77,101],[66,107],[75,113]], knobC:"#d4a24c",
      head:"gibson", headC:"#111", fb:"#2a170c", inlay:"trap", inlayC:"#efe7d6", hw:"#d9d9d9", fbEnd:28, impact:[50,104] },
    { id:"red64", year:1964, name:"Red Special", who:"Costruita da Brian May e suo padre con il legno di un camino",
      body:"M42 4 C36 -8 26 -14 18 -10 C8 -4 10 14 12 26 C14 40 2 52 2 74 C2 106 22 128 50 128 C78 128 98 106 98 74 C98 52 86 40 88 26 C90 14 92 -4 82 -10 C74 -14 64 -8 58 4 Z",
      fin:"mahog", grain:true, guard:{ p:"M30 30 C26 44 28 74 36 88 L64 88 C72 74 74 44 70 30 Z", c:"#151515" },
      pu:[{x:50,y:44,w:20,h:7,t:"sc",c:"#cfcfcf"},{x:50,y:58,w:20,h:7,t:"sc",c:"#cfcfcf"},{x:50,y:72,w:20,h:7,t:"sc",c:"#cfcfcf"}],
      bridge:{y:85,w:24,h:4,t:"trem"}, knobs:[[70,98],[77,108]], knobC:"#cfcfcf", switches:true,
      head:"red", headC:"#3b0e06", fb:"#151010", inlay:"dot", inlayC:"#efe7d6", hw:"#d9d9d9", fbEnd:30, impact:[50,106] },
    { id:"frank79", year:1979, name:"“Frankenstrat”", who:"Eddie Van Halen · assemblata a mano, strisce col nastro adesivo",
      body:"M42 8 C40 -6 30 -22 20 -16 C12 -10 14 8 16 22 C18 34 6 44 4 62 C0 90 14 126 50 128 C86 126 100 96 96 66 C94 50 82 44 86 30 C88 18 90 2 82 -2 C74 -6 64 4 58 8 Z",
      fin:"red", stripes:true,
      pu:[{x:50,y:76,w:24,h:11,t:"hb",c:"#efe9d8",a:-.15}],
      bridge:{y:92,w:26,h:7,t:"floyd"}, knobs:[[71,102]], knobC:"#111",
      head:"fender", headC:"#dcb877", fb:"#e3c389", inlay:"dot", inlayC:"#1a1a1a", hw:"#d8d8d8", fbEnd:30, impact:[50,104] },
    { id:"rr81", year:1981, name:"Concorde", who:"Randy Rhoads · il V asimmetrico disegnato con Grover Jackson",
      body:"M42 2 L18 -38 L26 -36 L36 10 L4 112 L12 116 L46 72 L94 130 L100 124 L64 18 L58 2 Z",
      fin:"white", pin:"#111",
      pu:[{x:50,y:24,w:24,h:11,t:"hb",c:"#111"},{x:50,y:44,w:24,h:11,t:"hb",c:"#111"}],
      bridge:{y:56,w:24,h:3,t:"tom"}, tail:{y:64,w:24,h:4}, knobs:[[70,84],[78,96],[85,110]], knobC:"#d4a24c",
      head:"hockey", headC:"#f2efe6", fb:"#101010", inlay:"shark", inlayC:"#efe7d6", hw:"#d4a24c", fbEnd:12, impact:[80,112] }
  ];

  const HEADS = {
    gibson:"M13 70 L12 58 L5 10 C4 3 9 0 20 3 C31 0 36 3 35 10 L28 58 L27 70 Z",
    red:"M13 70 L12 56 L6 10 C6 2 12 0 20 2 C28 0 34 2 34 10 L28 56 L27 70 Z",
    v:"M13 70 L12 56 L2 4 L8 2 L20 16 L32 2 L38 4 L28 56 L27 70 Z",
    fender:"M13 70 L13 48 C10 44 4 42 4 34 L5 8 C5 2 10 0 15 3 L30 16 C35 21 33 28 28 32 L27 70 Z",
    hockey:"M13 70 L13 50 L2 4 L8 0 L28 40 L27 70 Z"
  };

  const FIN = {
    lpBurst:c => grad(c.createRadialGradient(50,84,4,50,80,80), [[0,"#f6cf5f"],[.4,"#e89b2a"],[.7,"#a82a17"],[1,"#3a0b05"]]),
    strat2:c => grad(c.createRadialGradient(50,66,4,50,62,82), [[0,"#f0c868"],[.45,"#c27a2c"],[.72,"#4a2410"],[1,"#0c0604"]]),
    cherry:c => grad(c.createLinearGradient(0,-20,100,130), [[0,"#b42c1d"],[.5,"#8a170e"],[1,"#4e0a05"]]),
    korina:c => grad(c.createLinearGradient(0,0,100,130), [[0,"#efd7a2"],[1,"#c99d5e"]]),
    mahog:c => grad(c.createLinearGradient(0,-14,100,128), [[0,"#8a2d17"],[1,"#3b0e06"]]),
    red:() => "#d3241b",
    white:c => grad(c.createLinearGradient(0,-38,100,130), [[0,"#fbf8f1"],[1,"#d6d1c4"]])
  };
  function grad(g, stops){ stops.forEach(([o,c]) => g.addColorStop(o,c)); return g; }
  function rng(seed){ return () => (seed = (seed*1664525 + 1013904223) % 4294967296) / 4294967296; }
  function rr(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x+r,y); c.arcTo(x+w,y,x+w,y+h,r); c.arcTo(x+w,y+h,x,y+h,r); c.arcTo(x,y+h,x,y,r); c.arcTo(x,y,x+w,y,r); c.closePath(); }

  let model = MODELS.find(m => m.id === store.get("guitar", "lp59")) || MODELS[3];

  /* ---------------- DOM: canvas, etichetta modello, barra mobile ---------------- */
  const cv = document.createElement("canvas"); cv.className = "gtr-canvas"; cv.setAttribute("aria-hidden", "true");
  document.body.appendChild(cv);
  const c = cv.getContext("2d");
  const label = document.createElement("button"); label.className = "gtr-label";
  document.body.appendChild(label);
  const pct = document.createElement("span"); pct.className = "gtr-pct"; pct.setAttribute("aria-hidden","true"); document.body.appendChild(pct);
  const mini = document.createElement("div"); mini.className = "sg-mini"; mini.innerHTML = "<i></i>"; document.body.appendChild(mini);

  /* ---------------- stato ---------------- */
  let DPR = 1, W = 0, H = 0, L = null;           // L = geometria corrente
  let sprite, inner, cracked, damaged, alpha;      // canvas offscreen: originale, legno interno, crepato, mostrato
  let cells = [], edges = [], impact = {x:0,y:0}, maxD = 1;
  let state = "intact", dmg = 0, crackR = -1, chips = 0, shards = [], ropes = [], asm = null;
  let scrolling = false, vib = 0, running = false, lastT = 0, scrollTimer;

  /* ---------------- geometria ---------------- */
  function geometry(){
    const top = 76, bottom = H - 14, cx = W - 10 - GW/2;
    const jointY = bottom - 130*s, headTop = top, nutY = headTop + 68*s;
    const ox = cx - GW/2 - PADX, oy = top - 50;    // origine dello sprite (spazio per corna/tuner)
    return { top, bottom, cx, jointY, headTop, nutY, ox, oy, sw: GW + PADX*2, sh: bottom - oy + 8,
      fbEndY: jointY + model.fbEnd*s,
      bridgeY: jointY + model.bridge.y*s,
      endY: jointY + (model.tail ? (model.tail.y || 70) : model.bridge.y)*s };
  }
  const bx = (L, x) => L.cx - GW/2 + x*s;   // da unità corpo a px schermo
  const by = (L, y) => L.jointY + y*s;

  /* ---------------- disegno dello sprite ---------------- */
  function drawGuitar(g, L){
    g.save(); g.translate(-L.ox, -L.oy);
    // corpo
    g.save(); g.translate(L.cx - GW/2, L.jointY); g.scale(s, s); drawBody(g); g.restore();
    // manico + tastiera
    drawNeck(g, L);
    // paletta
    g.save(); g.translate(L.cx - 20*s, L.headTop); g.scale(s, s); drawHead(g); g.restore();
    g.restore();
  }

  function drawBody(g){
    const m = model, P = new Path2D(m.body);
    g.save(); g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 10; g.shadowOffsetY = 4; g.fillStyle = "#000"; g.fill(P); g.restore();
    g.save(); g.clip(P);
    g.fillStyle = FIN[m.fin](g); g.fillRect(-10, -50, 120, 190);
    if(m.grain){ const r = rng(42); g.strokeStyle = "rgba(60,30,10,.13)"; g.lineWidth = .5;
      for(let i = 0; i < 26; i++){ const x = r()*110 - 5; g.beginPath(); g.moveTo(x, -50); g.bezierCurveTo(x + r()*10 - 5, 20, x + r()*10 - 5, 80, x + r()*8 - 4, 140); g.stroke(); } }
    if(m.stripes){ const r = rng(1979); g.lineCap = "butt";
      [["#111",7],["#f4f1e8",4],["#111",5],["#f4f1e8",3],["#111",6],["#f4f1e8",4],["#111",4]].forEach(([col, w], i) => {
        g.strokeStyle = col; g.lineWidth = w; g.beginPath(); const a = -.9 + r()*1.8, x = r()*100, y = r()*120 - 20;
        g.moveTo(x - Math.cos(a)*160, y - Math.sin(a)*160); g.lineTo(x + Math.cos(a)*160, y + Math.sin(a)*160); g.stroke(); }); }
    const hl = g.createLinearGradient(0, -40, 80, 100);
    hl.addColorStop(0, "rgba(255,255,255,.32)"); hl.addColorStop(.35, "rgba(255,255,255,.04)"); hl.addColorStop(1, "rgba(0,0,0,.25)");
    g.fillStyle = hl; g.fillRect(-10, -50, 120, 190);
    g.restore();
    if(m.binding){ g.lineWidth = 2.4; g.strokeStyle = m.binding; g.stroke(P); }
    if(m.pin){ g.lineWidth = 2.6; g.strokeStyle = m.pin; g.stroke(P); g.lineWidth = 1; g.strokeStyle = "#fff"; g.stroke(P); }
    g.lineWidth = 1; g.strokeStyle = "rgba(0,0,0,.85)"; g.stroke(P);
    if(m.guard){ const GP = new Path2D(m.guard.p); g.fillStyle = m.guard.c; g.fill(GP); g.lineWidth = .7; g.strokeStyle = "rgba(0,0,0,.45)"; g.stroke(GP); }
    m.pu.forEach(p => pickup(g, p));
    const b = m.bridge;
    g.save(); g.translate(50, b.y);
    const mg = g.createLinearGradient(0, -b.h/2, 0, b.h/2); mg.addColorStop(0, "#f2f2f2"); mg.addColorStop(1, b.t === "floyd" ? "#222" : "#8a8a8a");
    rr(g, -b.w/2, -b.h/2, b.w, b.h, 1); g.fillStyle = b.t === "floyd" ? "#1c1c1c" : (m.hw === "#d4a24c" || m.hw === "#e3c463" ? m.hw : mg); g.fill();
    if(b.t !== "tom") for(let i = 0; i < 6; i++){ g.fillStyle = "rgba(0,0,0,.4)"; g.fillRect(-b.w/2 + 2 + i*(b.w - 4)/6, -b.h/2 + 1, (b.w - 4)/6 - 1, b.h - 2); }
    g.restore();
    if(m.tail){ g.fillStyle = m.hw; if(m.tail.p){ g.fill(new Path2D(m.tail.p)); } else { rr(g, 50 - m.tail.w/2, m.tail.y - m.tail.h/2, m.tail.w, m.tail.h, 1.5); g.fill(); } }
    m.knobs.forEach(([x, y]) => { const kg = g.createRadialGradient(x - 1, y - 1, .5, x, y, 3.4); kg.addColorStop(0, "#fff8"); kg.addColorStop(.35, m.knobC); kg.addColorStop(1, "#000");
      g.beginPath(); g.arc(x, y, 3.2, 0, 7); g.fillStyle = kg; g.fill(); });
    if(m.toggle){ g.beginPath(); g.arc(m.toggle[0], m.toggle[1], 2.4, 0, 7); g.fillStyle = "#efe2c0"; g.fill(); }
    if(m.switches) for(let i = 0; i < 6; i++){ g.fillStyle = "#e9e3d3"; g.fillRect(37 + i*4.6, 33, 2.4, 4); }
  }

  function pickup(g, p){
    g.save(); g.translate(p.x, p.y); g.rotate(p.a || 0);
    if(p.ring){ rr(g, -p.w/2 - 2, -p.h/2 - 2, p.w + 4, p.h + 4, 2.5); g.fillStyle = p.ring; g.fill(); }
    rr(g, -p.w/2, -p.h/2, p.w, p.h, p.t === "hb" ? 1.5 : 2.5); g.fillStyle = p.c || "#efe9d8"; g.fill();
    g.lineWidth = .5; g.strokeStyle = "rgba(0,0,0,.6)"; g.stroke();
    g.fillStyle = p.t === "hb" ? "#a8a8a8" : "#6d6d6d";
    for(let i = 0; i < 6; i++){
      const x = -p.w/2 + (i + .5)*p.w/6;
      g.beginPath(); g.arc(x, p.t === "hb" ? -p.h/4 : 0, .8, 0, 7); g.fill();
      if(p.t === "hb"){ g.beginPath(); g.arc(x, p.h/4, .8, 0, 7); g.fill(); }
    }
    g.restore();
  }

  function drawNeck(g, L){
    const m = model, x0 = L.cx, top = L.nutY, bot = L.fbEndY, wTop = 14*s, wBot = 17.5*s;
    // tastiera trapezoidale
    g.beginPath(); g.moveTo(x0 - wTop/2, top); g.lineTo(x0 + wTop/2, top); g.lineTo(x0 + wBot/2, bot); g.lineTo(x0 - wBot/2, bot); g.closePath();
    const fg = g.createLinearGradient(x0 - wBot/2, 0, x0 + wBot/2, 0); fg.addColorStop(0, "rgba(0,0,0,.35)"); fg.addColorStop(.5, "rgba(255,255,255,.06)"); fg.addColorStop(1, "rgba(0,0,0,.35)");
    g.fillStyle = m.fb; g.fill(); g.fillStyle = fg; g.fill();
    if(m.fbBind){ g.strokeStyle = m.fbBind; g.lineWidth = 1; g.stroke(); }
    // tasti alla posizione reale: d = scala * (1 - 2^(-n/12))
    const scale = L.bridgeY - top, wAt = y => wTop + (wBot - wTop)*(y - top)/(bot - top);
    const fy = n => top + scale*(1 - Math.pow(2, -n/12));
    for(let n = 1; n <= 24; n++){
      const y = fy(n); if(y > bot - 1) break;
      const w = wAt(y); g.fillStyle = "#cfcac0"; g.fillRect(x0 - w/2, y - .6, w, 1.2);
    }
    // segnatasti
    g.fillStyle = m.inlayC;
    [3,5,7,9,12,15,17,19,21].forEach(n => {
      const y1 = fy(n - 1), y2 = fy(n); if(y2 > bot) return;
      const y = (y1 + y2)/2, w = wAt(y), h = y2 - y1;
      if(m.inlay === "dot"){
        if(n === 12){ [-w*.22, w*.22].forEach(dx => { g.beginPath(); g.arc(x0 + dx, y, 1.6, 0, 7); g.fill(); }); }
        else { g.beginPath(); g.arc(x0, y, 1.7, 0, 7); g.fill(); }
      } else if(m.inlay === "trap"){
        g.beginPath(); g.moveTo(x0 - w*.36, y - h*.3); g.lineTo(x0 + w*.36, y - h*.36); g.lineTo(x0 + w*.3, y + h*.3); g.lineTo(x0 - w*.3, y + h*.3); g.closePath(); g.fill();
      } else if(m.inlay === "shark"){
        g.beginPath(); g.moveTo(x0 - w*.4, y + h*.32); g.lineTo(x0 + w*.4, y + h*.32); g.lineTo(x0 + w*.4, y - h*.38); g.closePath(); g.fill();
      }
    });
  }

  function drawHead(g){
    const m = model, P = new Path2D(HEADS[m.head]);
    // meccaniche (fuori dalla paletta)
    const tuners = m.head === "fender" ? [8,14.5,21,27.5,34,40.5].map(y => [-2.5, y, "L"])
                 : m.head === "hockey" ? [.12,.26,.4,.54,.68,.82].map(t => [2 + 11*t - 5, 4 + 46*t, "L"])
                 : [16,30,44].flatMap(y => [[-1, y, "L"], [37, y, "R"]]);
    tuners.forEach(([x, y]) => { rr(g, x - 3, y - 2.6, 7, 5.2, 2); g.fillStyle = m.hw; g.fill(); g.lineWidth = .5; g.strokeStyle = "rgba(0,0,0,.6)"; g.stroke(); });
    g.save(); g.shadowColor = "rgba(0,0,0,.6)"; g.shadowBlur = 6; g.shadowOffsetY = 2; g.fillStyle = m.headC; g.fill(P); g.restore();
    g.save(); g.clip(P);
    const hl = g.createLinearGradient(0, 0, 40, 70); hl.addColorStop(0, "rgba(255,255,255,.25)"); hl.addColorStop(1, "rgba(0,0,0,.25)"); g.fillStyle = hl; g.fillRect(-5, -5, 50, 80);
    g.restore();
    g.lineWidth = .8; g.strokeStyle = "rgba(0,0,0,.8)"; g.stroke(P);
    // perni delle meccaniche
    g.fillStyle = "#e8e8e8";
    tuners.forEach(([x, y, side]) => { g.beginPath(); g.arc(side === "L" ? x + 8 : x - 4, y, 1.5, 0, 7); g.fill(); });
    // logo
    g.fillStyle = m.headC === "#111" || m.headC === "#3b0e06" ? "#d4a24c" : "#1a1a1a";
    g.font = "11px UnifrakturMaguntia, serif"; g.textAlign = "center"; g.fillText("R", 20, 26);
    // capotasto
    g.fillStyle = "#efe9d8"; g.fillRect(12.5, 67, 15, 3);
  }

  /* ---------------- frattura (celle a impatto) ---------------- */
  function fracture(){
    const m = model;
    impact = { x: bx(L, m.impact[0]) - L.ox, y: by(L, m.impact[1]) - L.oy };
    maxD = Math.max(...[[0,0],[L.sw,0],[0,L.sh],[L.sw,L.sh]].map(([x, y]) => Math.hypot(x - impact.x, y - impact.y)));
    const NR = 15, base = Math.random()*Math.PI*2, ang = [];
    for(let i = 0; i < NR; i++) ang.push(base + (i + (Math.random() - .5)*.55)*2*Math.PI/NR);
    const radii = []; let r = 5; while(r < maxD){ radii.push(r); r *= 1.42 + Math.random()*.22; } radii.push(maxD*1.08);
    const V = radii.map((rad, k) => ang.map((a, i) => {
      const rj = rad*(1 + (Math.random() - .5)*.26), aj = a + (Math.random() - .5)*(Math.PI*2/NR)*.35;
      return { x: impact.x + Math.cos(aj)*rj, y: impact.y + Math.sin(aj)*rj, id: k*100 + i };
    }));
    const C = { x: impact.x, y: impact.y, id: -1 }, polys = [];
    for(let i = 0; i < NR; i++){
      const j = (i + 1) % NR;
      polys.push({ p:[C, V[0][i], V[0][j]], k:0 });
      for(let k = 0; k < radii.length - 1; k++){
        const q = [V[k][i], V[k][j], V[k+1][j], V[k+1][i]];
        if(k >= 1 && Math.random() < .35){                           // ramificazione: cella tagliata in diagonale
          if(Math.random() < .5){ polys.push({p:[q[0],q[1],q[2]], k:k+1}, {p:[q[0],q[2],q[3]], k:k+1}); }
          else { polys.push({p:[q[0],q[1],q[3]], k:k+1}, {p:[q[1],q[2],q[3]], k:k+1}); }
        } else polys.push({ p:q, k:k+1 });
      }
    }
    // tieni solo le celle che contengono legno (campionamento dell'alfa dello sprite)
    const aw = sprite.width, ah = sprite.height;
    cells = [];
    polys.forEach(({p, k}) => {
      let x0 = Math.max(0, Math.min(...p.map(v => v.x))), x1 = Math.min(L.sw, Math.max(...p.map(v => v.x)));
      let y0 = Math.max(0, Math.min(...p.map(v => v.y))), y1 = Math.min(L.sh, Math.max(...p.map(v => v.y)));
      if(x1 <= x0 || y1 <= y0) return;
      let n = 0, ox0 = 1e9, ox1 = -1e9, oy0 = 1e9, oy1 = -1e9;
      const st = Math.max(2, Math.min(4, Math.sqrt((x1 - x0)*(y1 - y0))/12));
      for(let y = y0 + st/2; y < y1; y += st) for(let x = x0 + st/2; x < x1; x += st){
        if(alpha[(Math.floor(y*DPR)*aw + Math.floor(x*DPR))*4 + 3] < 60 || !inPoly(x, y, p)) continue;
        n++; if(x < ox0) ox0 = x; if(x > ox1) ox1 = x; if(y < oy0) oy0 = y; if(y > oy1) oy1 = y;
      }
      if(n < 2) return;
      ox0 = Math.max(0, ox0 - st); oy0 = Math.max(0, oy0 - st); ox1 = Math.min(L.sw, ox1 + st); oy1 = Math.min(L.sh, oy1 + st);
      const cx = (ox0 + ox1)/2, cy = (oy0 + oy1)/2;
      cells.push({ p, k, n, b:[ox0, oy0, ox1 - ox0, oy1 - oy0], cx, cy, d: Math.hypot(cx - impact.x, cy - impact.y),
        r: Math.max(2, Math.min(ox1 - ox0, oy1 - oy0)*.4), out:false });
    });
    // spigoli = crepe (dedup), ordinati per distanza dall'impatto
    const seen = new Set(); edges = [];
    cells.forEach(cl => cl.p.forEach((a, i) => {
      const b = cl.p[(i + 1) % cl.p.length], key = a.id < b.id ? a.id + ":" + b.id : b.id + ":" + a.id;
      if(seen.has(key)) return; seen.add(key);
      const da = Math.hypot(a.x - impact.x, a.y - impact.y), db = Math.hypot(b.x - impact.x, b.y - impact.y);
      edges.push(da <= db ? { a, b, da, db } : { a:b, b:a, da:db, db:da });
    }));
    // schegge che si staccano per prime: piccole e vicine al colpo
    chipList = cells.filter(cl => cl.k <= 3).sort((a, b) => a.d - b.d).slice(0, 10);
  }
  let chipList = [];
  function inPoly(x, y, p){ let ins = false; for(let i = 0, j = p.length - 1; i < p.length; j = i++){ const a = p[i], b = p[j];
    if((a.y > y) !== (b.y > y) && x < (b.x - a.x)*(y - a.y)/(b.y - a.y) + a.x) ins = !ins; } return ins; }

  /* ---------------- costruzione ---------------- */
  function canvas(w, h){ const k = document.createElement("canvas"); k.width = Math.ceil(w*DPR); k.height = Math.ceil(h*DPR); return k; }
  function build(){
    DPR = Math.min(2, devicePixelRatio || 1); W = document.documentElement.clientWidth; H = innerHeight;
    cv.width = W*DPR; cv.height = H*DPR; cv.style.width = W + "px"; cv.style.height = H + "px"; cv.style.right = "auto";
    L = geometry();
    sprite = canvas(L.sw, L.sh); const g = sprite.getContext("2d"); g.scale(DPR, DPR); drawGuitar(g, L);
    alpha = g.getImageData(0, 0, sprite.width, sprite.height).data;
    // "doppio materiale": silhouette in legno grezzo per lo spessore dei frammenti
    inner = canvas(L.sw, L.sh); const ig = inner.getContext("2d"); ig.drawImage(sprite, 0, 0);
    ig.globalCompositeOperation = "source-in"; ig.fillStyle = "#6b4423"; ig.fillRect(0, 0, inner.width, inner.height);
    cracked = canvas(L.sw, L.sh); damaged = canvas(L.sw, L.sh);
    fracture();
    state = "intact"; shards = []; ropes = []; asm = null; chips = 0; crackR = -1;
    cells.forEach(cl => cl.out = false);
    label.innerHTML = `<span>${model.year}</span> ${model.name} <b aria-hidden="true">↻</b>`;
    label.title = `${model.year} · ${model.name} — ${model.who}. Clicca per cambiare chitarra`;
    label.setAttribute("aria-label", `Chitarra: ${model.year} ${model.name}. Cambia modello`);
    label.style.right = (innerWidth - W + 10 + GW/2 + 14) + "px";
    pct.style.right = (innerWidth - W + 100) + "px";
    update(true);
  }

  function renderDamage(R){
    crackR = R;
    const d = cracked.getContext("2d");
    d.setTransform(1,0,0,1,0,0); d.globalCompositeOperation = "source-over"; d.clearRect(0, 0, cracked.width, cracked.height);
    d.drawImage(sprite, 0, 0);
    d.setTransform(DPR,0,0,DPR,0,0);
    if(R > 0){
      d.globalCompositeOperation = "source-atop";
      const dent = d.createRadialGradient(impact.x, impact.y, 0, impact.x, impact.y, Math.max(1, Math.min(60, R*.25)));
      dent.addColorStop(0, `rgba(0,0,0,${Math.min(.55, R/300)})`); dent.addColorStop(1, "rgba(0,0,0,0)");
      d.fillStyle = dent; d.fillRect(impact.x - 70, impact.y - 70, 140, 140);
      d.lineCap = "round";
      const path = new Path2D();
      edges.forEach(e => { if(e.da >= R) return; const t = e.db <= R ? 1 : (R - e.da)/(e.db - e.da);
        path.moveTo(e.a.x, e.a.y); path.lineTo(e.a.x + (e.b.x - e.a.x)*t, e.a.y + (e.b.y - e.a.y)*t); });
      d.strokeStyle = "rgba(255,236,210,.45)"; d.lineWidth = .7; d.save(); d.translate(.7, .7); d.stroke(path); d.restore();
      d.strokeStyle = "rgba(12,5,2,.92)"; d.lineWidth = 1.3; d.stroke(path);
    }
    d.globalCompositeOperation = "source-over";
    const o = damaged.getContext("2d");
    o.setTransform(1,0,0,1,0,0); o.globalCompositeOperation = "source-over"; o.clearRect(0, 0, damaged.width, damaged.height); o.drawImage(cracked, 0, 0);
    o.setTransform(DPR,0,0,DPR,0,0); o.globalCompositeOperation = "destination-out"; o.fillStyle = "#000";
    cells.forEach(cl => { if(!cl.out) return; o.beginPath(); cl.p.forEach((v, i) => i ? o.lineTo(v.x, v.y) : o.moveTo(v.x, v.y)); o.closePath(); o.fill(); });
    o.globalCompositeOperation = "source-over";
  }

  /* ---------------- frammenti ---------------- */
  function makeShard(cl, power){
    cl.out = true;
    const dx = cl.cx - impact.x, dy = cl.cy - impact.y, dist = Math.hypot(dx, dy) || 1;
    const sp = power*(420 + Math.random()*380)/(1 + dist/160);
    return { cl, x: L.ox + cl.cx, y: L.oy + cl.cy, hx: L.ox + cl.cx, hy: L.oy + cl.cy,
      vx: dx/dist*sp + (Math.random() - .5)*160*power - power*120, vy: dy/dist*sp - (180 + Math.random()*420)*power,
      a: 0, va: (Math.random() - .5)*14*power, t: 0, vt: (Math.random() - .5)*9*power, rest: false };
  }
  function drawShard(sh){
    const cl = sh.cl, [x0, y0, w, h] = cl.b, k = Math.cos(sh.t);
    c.save(); c.translate(sh.x, sh.y); c.rotate(sh.a); c.scale(Math.abs(k) < .08 ? .08*Math.sign(k || 1) : k, 1);
    const clip = () => { c.beginPath(); cl.p.forEach((v, i) => i ? c.lineTo(v.x - cl.cx, v.y - cl.cy) : c.moveTo(v.x - cl.cx, v.y - cl.cy)); c.closePath(); };
    // spessore: faccia interna in legno grezzo, leggermente sfalsata
    c.save(); c.translate(1.6, 1.8); clip(); c.clip();
    c.drawImage(inner, x0*DPR, y0*DPR, w*DPR, h*DPR, x0 - cl.cx, y0 - cl.cy, w, h); c.restore();
    c.save(); clip(); c.clip();
    c.drawImage(cracked, x0*DPR, y0*DPR, w*DPR, h*DPR, x0 - cl.cx, y0 - cl.cy, w, h);
    if(Math.abs(k) < .9){ c.fillStyle = `rgba(0,0,0,${(1 - Math.abs(k))*.55})`; c.fillRect(x0 - cl.cx, y0 - cl.cy, w, h); }
    c.restore();
    c.restore();
  }
  function stepShard(sh, dt){
    if(sh.rest) return false;
    sh.vy += G*dt; sh.x += sh.vx*dt; sh.y += sh.vy*dt; sh.a += sh.va*dt; sh.t += sh.vt*dt;
    const r = sh.cl.r, floor = H - 3;
    if(sh.x < r){ sh.x = r; sh.vx *= -.5; } if(sh.x > W - r){ sh.x = W - r; sh.vx *= -.5; }
    if(sh.y + r > floor){
      sh.y = floor - r;
      if(sh.vy > 90){ sh.vy *= -.3; sh.va *= .55; sh.vt *= .5; } else sh.vy = 0;
      sh.vx *= .7;
      sh.t += (Math.round(sh.t/Math.PI)*Math.PI - sh.t)*.25;            // si adagia piatto
      if(sh.vy === 0 && Math.abs(sh.vx) < 4){ sh.va = 0; sh.vt = 0; sh.rest = true; }
    }
    return true;
  }

  /* ---------------- corde Verlet ---------------- */
  function stringEnds(i){
    const n = { x: L.cx - 5*s + i*2*s, y: L.nutY + 1 }, b = { x: L.cx - 9*s + i*3.6*s, y: L.endY };
    return [n, b];
  }
  function makeRopes(){
    ropes = [];
    for(let i = 0; i < 6; i++){
      const [A, B] = stringEnds(i), N = 30, cut = 6 + Math.floor(Math.random()*18), pts = [];
      for(let k = 0; k <= N; k++){ const t = k/N; pts.push({ x: A.x + (B.x - A.x)*t, y: A.y + (B.y - A.y)*t, home:{ x: A.x + (B.x - A.x)*t, y: A.y + (B.y - A.y)*t } }); }
      const seg = Math.hypot(B.x - A.x, B.y - A.y)/N;
      [pts.slice(0, cut + 1), pts.slice(cut + 1)].forEach((p, half) => {
        const kick = (half ? 1 : -1)*(60 + Math.random()*220), up = -(80 + Math.random()*260);
        p.forEach((q, j) => { const w = half ? (p.length - j)/p.length : j/p.length;   // la punta spezzata frusta di più
          q.px = q.x - (kick*w + (Math.random() - .5)*60)/60; q.py = q.y - (up*w)/60; });
        if(p.length > 1) ropes.push({ p, seg, w: 1.5 - i*.17, wound: i < 4 });
      });
    }
  }
  function stepRopes(dt){
    const g = G*dt*dt*.35, floor = H - 2;
    ropes.forEach(R => {
      R.p.forEach(q => { const vx = (q.x - q.px)*.985, vy = (q.y - q.py)*.985; q.px = q.x; q.py = q.y; q.x += vx; q.y += vy + g;
        if(q.y > floor){ q.y = floor; q.px = q.x - vx*.5; } });
      for(let it = 0; it < 8; it++) for(let j = 0; j < R.p.length - 1; j++){
        const a = R.p[j], b = R.p[j+1], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, diff = (d - R.seg)/d*.5;
        a.x += dx*diff; a.y += dy*diff; b.x -= dx*diff; b.y -= dy*diff;
      }
    });
  }
  function drawRope(R){
    c.beginPath(); R.p.forEach((q, j) => j ? c.lineTo(q.x, q.y) : c.moveTo(q.x, q.y));
    c.strokeStyle = R.wound ? "#b9b2a4" : "#e9e7e1"; c.lineWidth = Math.max(.5, R.w*.8); c.lineCap = "round"; c.stroke();
  }

  /* ---------------- disegno principale ---------------- */
  function frame(now){
    const dt = Math.min(.033, (now - (lastT || now))/1000); lastT = now;
    let busy = scrolling || vib > .05;
    c.setTransform(DPR,0,0,DPR,0,0); c.clearRect(0, 0, W, H);
    if(!WIDE.matches){ running = false; return; }

    if(state !== "shattered" && state !== "assembling"){
      const j = scrolling ? (Math.random() - .5)*dmg*3 : 0;
      c.drawImage(damaged, L.ox + j, L.oy, L.sw, L.sh);
      // corde vive che vibrano
      for(let i = 0; i < 6; i++){
        const [A, B] = stringEnds(i), amp = vib*(1.4 + i*.15), mid = Math.sin(now*.09 + i*1.3)*amp;
        c.beginPath(); c.moveTo(A.x + j, A.y); c.quadraticCurveTo((A.x + B.x)/2 + mid + j, (A.y + B.y)/2, B.x + j, B.y);
        c.strokeStyle = i < 4 ? "rgba(200,192,178,.95)" : "rgba(240,238,232,.95)"; c.lineWidth = .9 - i*.08; c.stroke();
      }
      // plettro = indicatore di lettura
      const py = L.nutY + progress*(L.fbEndY - L.nutY);
      c.save(); c.translate(L.cx + j, py); c.rotate(.15);
      c.shadowColor = "rgba(0,0,0,.6)"; c.shadowBlur = 5; c.shadowOffsetY = 2;
      c.beginPath(); c.moveTo(0, 11); c.bezierCurveTo(-6, 4, -10, -2, -9, -6); c.bezierCurveTo(-8, -10, -4, -11, 0, -11); c.bezierCurveTo(4, -11, 8, -10, 9, -6); c.bezierCurveTo(10, -2, 6, 4, 0, 11); c.closePath();
      c.fillStyle = "#e1251b"; c.fill(); c.shadowColor = "transparent"; c.lineWidth = 1; c.strokeStyle = "#000"; c.stroke();
      c.fillStyle = "#fff"; c.font = "9px UnifrakturMaguntia, serif"; c.textAlign = "center"; c.fillText("R", 0, 2);
      c.restore();
      vib *= .9;
    }
    // frammenti
    if(shards.length){
      shards.forEach(sh => { if(state !== "assembling" && stepShard(sh, dt)) busy = true; drawShard(sh); });
    }
    if(state === "shattered" || state === "assembling"){
      if(state === "shattered"){ stepRopes(dt); busy = true; }
      ropes.forEach(drawRope);
    }
    if(state === "assembling") busy = stepAssemble(now) || busy;
    if(busy) requestAnimationFrame(frame); else running = false;
  }
  function kick(){ if(!running){ running = true; lastT = 0; requestAnimationFrame(frame); } }

  /* ---------------- scroll ---------------- */
  let progress = 0;
  function update(force){
    const max = document.documentElement.scrollHeight - innerHeight;
    progress = max > 0 ? Math.min(1, Math.max(0, scrollY/max)) : 0;
    mini.style.setProperty("--p", progress);
    pct.textContent = Math.round(progress*100) + "%";
    if(!WIDE.matches || !L) return;
    dmg = RM ? Math.min(1, progress) : Math.pow(Math.max(0, (progress - .3)/.67), 1.15);
    if(state === "intact" || state === "chipping"){
      const R = dmg*maxD*.95;
      // schegge che si staccano nell'ultimo tratto
      const want = RM ? 0 : Math.min(chipList.length, Math.floor(Math.max(0, (dmg - .62)/.36)*chipList.length));
      let changed = Math.abs(R - crackR) > 4 || force;
      while(chips < want){ shards.push(makeShard(chipList[chips], .25)); chips++; changed = true; }
      while(chips > want){ chips--; const cl = chipList[chips]; cl.out = false; shards = shards.filter(sh => sh.cl !== cl); changed = true; }
      if(changed) renderDamage(R);
      if(progress >= .985 && max > 300 && !RM) shatter();
    } else if(state === "shattered" && progress < .9) assemble();
    kick();
  }

  function shatter(){
    state = "shattered";
    cells.forEach(cl => { if(!cl.out) shards.push(makeShard(cl, 1)); });
    makeRopes();
    window.RiffFX?.audio()?.crash();
    const m = $("main"); if(m){ m.classList.remove("shake"); void m.offsetWidth; m.classList.add("shake"); }
    const st = document.createElement("div"); st.className = "smash"; st.textContent = "SMASH!"; document.body.appendChild(st); setTimeout(() => st.remove(), 1400);
    // polvere di legno
    for(let i = 0; i < 26; i++){
      const p = document.createElement("i"); p.className = "spark dust"; p.style.left = (L.ox + impact.x) + "px"; p.style.top = (L.oy + impact.y) + "px"; document.body.appendChild(p);
      const a = -Math.PI*Math.random(), d = 40 + Math.random()*160;
      p.animate([{ transform:"translate(-50%,-50%)", opacity:1 }, { transform:`translate(calc(-50% + ${Math.cos(a)*d - 60}px), calc(-50% + ${Math.sin(a)*d + 120}px))`, opacity:0 }],
        { duration: 700 + Math.random()*700, easing:"cubic-bezier(.2,.7,.4,1)" }).onfinish = () => p.remove();
    }
  }

  /* "fit back": ogni pezzo torna a casa con una molla (easeOutBack) */
  function assemble(){
    state = "assembling";
    asm = { t0: performance.now(), dur: 950,
      from: shards.map(sh => ({ x: sh.x, y: sh.y, a: sh.a, t: sh.t })),
      rf: ropes.map(R => R.p.map(q => ({ x: q.x, y: q.y }))) };
  }
  const backOut = t => { const k = 1.70158; t -= 1; return t*t*((k + 1)*t + k) + 1; };
  function stepAssemble(now){
    const t = Math.min(1, (now - asm.t0)/asm.dur), e = backOut(t);
    shards.forEach((sh, i) => { const f = asm.from[i];
      sh.x = f.x + (sh.hx - f.x)*e; sh.y = f.y + (sh.hy - f.y)*e;
      sh.a = f.a*(1 - e); sh.t = (f.t % (Math.PI*2))*(1 - Math.min(1, t*1.4)); });
    ropes.forEach((R, i) => R.p.forEach((q, j) => { const f = asm.rf[i][j]; q.x = f.x + (q.home.x - f.x)*e; q.y = f.y + (q.home.y - f.y)*e; }));
    if(t < 1) return true;
    state = "intact"; shards = []; ropes = []; chips = 0; cells.forEach(cl => cl.out = false); crackR = -1; asm = null;
    update(true);
    return false;
  }

  /* ---------------- eventi ---------------- */
  addEventListener("scroll", () => {
    scrolling = true; vib = Math.min(2.2, vib + .6);
    clearTimeout(scrollTimer); scrollTimer = setTimeout(() => { scrolling = false; kick(); }, 140);
    update();
  }, { passive:true });
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if(WIDE.matches) build(); else update(); }, 150); });
  WIDE.addEventListener?.("change", () => { if(WIDE.matches) build(); else { c.clearRect(0, 0, cv.width, cv.height); update(); } });
  label.addEventListener("click", () => {
    const i = MODELS.indexOf(model); model = MODELS[(i + 1) % MODELS.length]; store.set("guitar", model.id);
    build(); toast(`🎸 ${model.year} · ${model.name}`);
    window.RiffFX?.audio()?.power(0, 0, { vel:.8 });
  });

  if(WIDE.matches) build(); else update();
  (document.fonts?.ready || Promise.resolve()).then(() => { if(WIDE.matches && state === "intact") build(); });
  addEventListener("load", () => update(true));
})();
