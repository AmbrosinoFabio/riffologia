/* RIFFOLOGIA — effetti: audio, chitarra che si distrugge allo scroll, corde suonabili, scintille, tilt */
(function(){
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FINE = matchMedia("(pointer:fine)").matches;
  const NS = "http://www.w3.org/2000/svg";

  /* =================== AUDIO (motore in js/audio.js) =================== */
  let actx = null, amp = null, sound = store.get("sound", false);
  function audio(){
    if(!sound || !window.RiffAudio) return null;
    if(!amp){
      const AC = window.AudioContext || window.webkitAudioContext; if(!AC) return null;
      actx = new AC({ latencyHint:"interactive" });
      amp = RiffAudio.build(actx, actx.destination);
      // scheda in background: sospende l'audio per non consumare CPU
      document.addEventListener("visibilitychange", () => { if(document.hidden) actx.suspend(); else if(sound) actx.resume(); });
    }
    if(actx.state === "suspended") actx.resume();
    return amp;
  }
  const crash = () => audio()?.crash();

  /* pulsante audio nell'header */
  const sb = document.createElement("button");
  sb.className = "icon-btn"; sb.id = "soundBtn";
  $(".site-head .wrap").insertBefore(sb, $("#themeBtn"));
  function setSB(){
    sb.textContent = sound ? "🔊" : "🔇"; sb.classList.toggle("on", sound);
    sb.setAttribute("aria-pressed", sound); sb.setAttribute("aria-label", sound ? "Disattiva audio" : "Attiva audio");
    sb.title = sound ? "Audio attivo" : "Attiva l'audio: corde e distorsione";
  }
  sb.onclick = () => {
    sound = !sound; store.set("sound", sound); setSB();
    if(sound) audio()?.power(1, 0, { vel:.85 }); else if(actx) actx.suspend();
  };
  setSB();

  /* =================== SCINTILLE + ONOMATOPEE AL CLICK =================== */
  const WORDS = ["RIFF!","DJENT","CHUG!","BRUTAL!","🤘","SHRED!","HEADBANG","BLAST!"];
  document.addEventListener("pointerdown", e => {
    if(e.target.closest(".strings")) return;
    if(!RM){
      for(let i = 0; i < 10; i++){
        const s = document.createElement("i"); s.className = "spark";
        s.style.left = e.clientX + "px"; s.style.top = e.clientY + "px"; document.body.appendChild(s);
        const a = Math.random()*Math.PI*2, d = 30 + Math.random()*70;
        s.animate([{transform:"translate(-50%,-50%) scale(1)", opacity:1},
                   {transform:`translate(calc(-50% + ${Math.cos(a)*d}px), calc(-50% + ${Math.sin(a)*d + 20}px)) scale(.2)`, opacity:0}],
                  {duration:450 + Math.random()*350, easing:"cubic-bezier(.2,.8,.3,1)"}).onfinish = () => s.remove();
      }
      if(Math.random() < .3){
        const w = document.createElement("span"); w.className = "boomword";
        w.textContent = WORDS[Math.random()*WORDS.length|0];
        w.style.left = e.clientX + "px"; w.style.top = e.clientY + "px"; document.body.appendChild(w);
        const r = Math.random()*30 - 15;
        w.animate([{transform:`translate(-50%,-50%) rotate(${r}deg) scale(.4)`, opacity:0},
                   {transform:`translate(-50%,-120%) rotate(${r}deg) scale(1.15)`, opacity:1, offset:.25},
                   {transform:`translate(-50%,-260%) rotate(${r*1.5}deg) scale(1)`, opacity:0}],
                  {duration:900, easing:"ease-out"}).onfinish = () => w.remove();
      }
    }
    if(e.target.closest(".btn,.chip,.opt,.tabs button,.vote button,.quiz-ans button,.cmp-btn")) audio()?.chug();
  });

  /* =================== TILT DELLE SCHEDE =================== */
  if(FINE && !RM){
    let tiltEl = null;
    document.addEventListener("pointermove", e => {
      const el = e.target.closest(".tile,.opt,.card.link,.hof-row");
      if(tiltEl && tiltEl !== el) tiltEl.style.transform = "";
      tiltEl = el; if(!el) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left)/r.width - .5, y = (e.clientY - r.top)/r.height - .5;
      el.style.transform = `perspective(800px) rotateY(${x*7}deg) rotateX(${-y*7}deg) scale(1.01)`;
    });
  }

  /* =================== CHITARRA LATERALE CHE SI DISTRUGGE =================== */
  const sg = document.createElement("div");
  sg.className = "sg"; sg.setAttribute("aria-hidden", "true");
  const STR = "<i class='str'></i>".repeat(6);
  sg.innerHTML = `
    <div class="sg-part sg-head"><svg viewBox="0 0 46 70">
      <path d="M16 70 L16 54 L8 8 C7 3 11 0 16 1 L33 4 C38 5 39 9 36 13 L30 54 L30 70 Z" fill="#161616" stroke="#d4a24c" stroke-width="1.2"/>
      <text x="22" y="34" font-family="UnifrakturMaguntia,serif" font-size="11" fill="#d4a24c" text-anchor="middle">R</text>
      <g fill="#d4a24c" stroke="#000" stroke-width=".8"><circle cx="5" cy="14" r="3"/><circle cx="6" cy="28" r="3"/><circle cx="7" cy="42" r="3"/><circle cx="40" cy="14" r="3"/><circle cx="39" cy="28" r="3"/><circle cx="38" cy="42" r="3"/></g>
      <rect x="15.5" y="66" width="15" height="2.5" fill="#e8e2d6"/>
    </svg></div>
    <div class="sg-part sg-neck sg-n1">${STR}</div>
    <div class="sg-part sg-neck sg-n2">${STR}</div>
    <div class="sg-part sg-body"><svg viewBox="0 0 46 110">
      <path d="M16 0 L30 0 L30 14 C41 9 47 22 43 36 C41 44 45 50 45.5 62 C46.5 88 35 108 23 108 C11 108 -0.5 88 .5 62 C1 50 5 44 3 36 C-1 22 5 9 16 14 Z" fill="#e1251b" stroke="#000" stroke-width="1.4"/>
      <path d="M30 18 C36 18 40 26 37 34 L30 40 Z" fill="#0b0b0c" opacity=".55"/>
      <rect x="14" y="38" width="18" height="7" rx="1" fill="#111" stroke="#d4a24c" stroke-width=".6"/>
      <rect x="14" y="56" width="18" height="7" rx="1" fill="#111" stroke="#d4a24c" stroke-width=".6"/>
      <rect x="13" y="78" width="20" height="4" fill="#c9c0b0"/>
      <g fill="#d4a24c"><circle cx="36" cy="80" r="2.2"/><circle cx="38" cy="90" r="2.2"/><circle cx="33" cy="97" r="2.2"/></g>
      <g stroke="#ddd" stroke-width=".6"><line x1="17.5" y1="0" x2="17.5" y2="80"/><line x1="19.7" y1="0" x2="19.7" y2="80"/><line x1="21.9" y1="0" x2="21.9" y2="80"/><line x1="24.1" y1="0" x2="24.1" y2="80"/><line x1="26.3" y1="0" x2="26.3" y2="80"/><line x1="28.5" y1="0" x2="28.5" y2="80"/></g>
      <path class="crack" pathLength="1" d="M23 22 L18 36 L26 50 L19 66 L27 84 L22 104" stroke="#000" stroke-width="1.6" fill="none"/>
    </svg></div>
    <div class="sg-shards">${"<i></i>".repeat(12)}</div>
    <div class="sg-pick"><svg viewBox="0 0 24 26"><path d="M12 25 C6 18 2 12 3 7 C4 3 8 1 12 1 C16 1 20 3 21 7 C22 12 18 18 12 25Z" fill="#d4a24c" stroke="#000" stroke-width="1.5"/></svg></div>
    <div class="sg-pct"></div>`;
  document.body.appendChild(sg);
  const mini = document.createElement("div"); mini.className = "sg-mini"; mini.innerHTML = "<i></i>"; document.body.appendChild(mini);

  const P = { head:$(".sg-head", sg), n1:$(".sg-n1", sg), n2:$(".sg-n2", sg), body:$(".sg-body", sg) };
  const pick = $(".sg-pick", sg), pct = $(".sg-pct", sg), crack = $(".crack", sg);
  $$(".sg-shards i", sg).forEach(s => {
    s.style.setProperty("--dx", (Math.random()*170 - 130) + "px");
    s.style.setProperty("--dy", (Math.random()*240 - 160) + "px");
    s.style.setProperty("--r", (Math.random()*900 - 450) + "deg");
  });

  let boom = false, scrolling = false;
  function stamp(){
    const s = document.createElement("div"); s.className = "smash"; s.textContent = "SMASH!";
    document.body.appendChild(s); setTimeout(() => s.remove(), 1400);
  }
  function frame(){
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0;
    const top = P.n1.offsetTop, bottom = P.n2.offsetTop + P.n2.offsetHeight;
    pick.style.top = (top + p*(bottom - top)) + "px";
    pct.textContent = Math.round(p*100) + "%";
    mini.style.setProperty("--p", p);

    if(p >= .985 && max > 300 && !boom){
      boom = true; sg.classList.add("boom"); crash();
      if(!RM){ const m = $("main"); if(m){ m.classList.remove("shake"); void m.offsetWidth; m.classList.add("shake"); } stamp(); }
    }
    if(p < .9 && boom){ boom = false; sg.classList.remove("boom"); }

    const k = RM ? 0 : Math.pow(Math.max(0, (p - .35) / .62), 2);
    const K = boom ? 2.6 : k;
    const j = () => scrolling ? (Math.random() - .5) * k * 4 : 0;
    P.head.style.transform = `translate(${-K*16 + j()}px,${-K*14}px) rotate(${-K*40}deg)`;
    P.n1.style.transform   = `translate(${-K*9 + j()}px,${-K*5}px) rotate(${-K*12}deg)`;
    P.n2.style.transform   = `translate(${K*11 + j()}px,${K*7}px) rotate(${K*16}deg)`;
    P.body.style.transform = `translate(${K*7 + j()}px,${K*26}px) rotate(${K*24}deg)`;
    crack.style.strokeDashoffset = 1 - Math.min(1, k*1.3);
  }
  let ticking = false, vibT;
  addEventListener("scroll", () => {
    scrolling = true; sg.classList.add("vibe");
    clearTimeout(vibT); vibT = setTimeout(() => { scrolling = false; sg.classList.remove("vibe"); frame(); }, 160);
    if(!ticking){ ticking = true; requestAnimationFrame(() => { ticking = false; frame(); }); }
  }, { passive:true });
  addEventListener("resize", frame);
  addEventListener("load", frame);
  frame();

  /* =================== TASTIERA CON CORDE SUONABILI =================== */
  (function strings(){
    const anchor = $(".page-hero") || $(".hero"); if(!anchor) return;
    const box = document.createElement("div"); box.className = "strings";
    box.setAttribute("aria-label", "Tastiera di chitarra interattiva: passa il mouse o tocca le corde per suonarle");
    box.setAttribute("role", "img");
    const dots = [3,5,7,9].map(f => `<i style="left:${(f-.5)/12*100}%"></i>`).join("") +
                 `<i class="dbl" style="left:${11.5/12*100}%"></i><i class="dbl2" style="left:${11.5/12*100}%"></i>`;
    box.innerHTML = `<div class="dots">${dots}</div><span class="strings-hint">↕ Passa il mouse sulle corde · audio con 🔇/🔊 in alto</span>`;
    anchor.after(box);

    const svg = document.createElementNS(NS, "svg");
    svg.innerHTML = `<defs><linearGradient id="strGrad" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#f4efe6"/><stop offset="1" stop-color="#8e8a82"/></linearGradient></defs>`;
    box.appendChild(svg);
    const H = 124, NAMES = ["E","A","D","G","B","e"];
    const S = NAMES.map((n, i) => {
      const y = 20 + i*17, el = document.createElementNS(NS, "path");
      el.setAttribute("stroke-width", (3.2 - i*.45).toFixed(2)); svg.appendChild(el);
      const l = document.createElement("span"); l.className = "lbl"; l.textContent = n; l.style.top = y + "px"; box.appendChild(l);
      return { y, d:0, v:0, cx:0, el };
    });
    let W = 0, running = false, prev = null;
    function draw(){ S.forEach(s => s.el.setAttribute("d", `M0 ${s.y} Q ${s.cx || W/2} ${s.y + s.d*2} ${W} ${s.y}`)); }
    function size(){ W = box.clientWidth; svg.setAttribute("viewBox", `0 0 ${W} ${H}`); svg.setAttribute("width", W); svg.setAttribute("height", H); draw(); }
    function loop(){
      let any = false;
      S.forEach(s => { s.v += -.32*s.d; s.v *= .93; s.d += s.v; if(Math.abs(s.d) > .05 || Math.abs(s.v) > .05) any = true; else { s.d = 0; s.v = 0; } });
      draw(); if(any) requestAnimationFrame(loop); else running = false;
    }
    /* vel = intensità (dalla velocità del puntatore), when = ritardo per la pennata */
    function pluck(i, x, dir, vel = .75, when = 0){
      const s = S[i]; s.cx = x; s.d = dir * (RM ? 3 : 4 + vel*7); s.v = 0;
      const fret = Math.min(11, Math.max(0, Math.floor(x / W * 12)));
      audio()?.pluck(i, fret, { vel, when });
      s.el.classList.add("hit"); clearTimeout(s.t); s.t = setTimeout(() => s.el.classList.remove("hit"), 280);
      if(!running){ running = true; requestAnimationFrame(loop); }
    }
    const pos = e => { const r = box.getBoundingClientRect(); return { x:e.clientX - r.left, y:e.clientY - r.top, t:e.timeStamp }; };
    box.addEventListener("pointermove", e => {
      const c = pos(e);
      if(prev){
        // corde attraversate in questo movimento, nell'ordine in cui il plettro le incontra
        const dir = c.y > prev.y ? 1 : -1;
        const hit = S.map((s, i) => i).filter(i => (prev.y - S[i].y) * (c.y - S[i].y) < 0);
        if(dir < 0) hit.reverse();
        const speed = Math.abs(c.y - prev.y) / Math.max(4, c.t - prev.t);      // px/ms
        const vel = Math.min(1, .45 + speed * .35);
        hit.forEach((i, k) => pluck(i, c.x, dir, vel, k * .007));           // 7 ms tra una corda e l'altra
      }
      prev = c;
    });
    box.addEventListener("pointerleave", () => prev = null);
    box.addEventListener("pointerdown", e => {
      const c = pos(e); let bi = 0;
      S.forEach((s, i) => { if(Math.abs(s.y - c.y) < Math.abs(S[bi].y - c.y)) bi = i; });
      pluck(bi, c.x, 1);
    });
    addEventListener("resize", size); size();
  })();
})();
