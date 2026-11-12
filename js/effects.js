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
  window.RiffFX = { audio };   // usato da js/guitar.js

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
      const l = document.createElement("span"); l.className = "lbl"; l.translate = false; l.textContent = n; l.style.top = y + "px"; box.appendChild(l);
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
