/* RIFFOLOGIA — layout condiviso e utility */
const PAGES = [
  ["index.html","Home"],["storia.html","Storia"],["generi.html","Generi"],["band.html","Band"],
  ["hall-of-fame.html","Hall of Fame"],["strumenti.html","Scegli lo strumento"],["quiz.html","Quiz"]
];

const store = {
  get(k, d){ try{ const v = localStorage.getItem("riff_"+k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem("riff_"+k, JSON.stringify(v)); }catch(e){} }
};
const esc = s => String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const $ = (s, r=document) => r.querySelector(s);
const $$ = (s, r=document) => [...r.querySelectorAll(s)];

function toast(msg){
  let t = $(".toast"); if(!t){ t = document.createElement("div"); t.className="toast"; t.setAttribute("role","status"); document.body.appendChild(t); }
  t.textContent = msg; t.classList.add("show"); clearTimeout(t._h); t._h = setTimeout(()=>t.classList.remove("show"), 2200);
}

function reveal(root=document){
  const els = $$(".rv:not(.in)", root);
  if(!("IntersectionObserver" in window)){ els.forEach(e=>e.classList.add("in")); return; }
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } }), {threshold:.08});
  els.forEach(e => io.observe(e));
}

(function layout(){
  const here = location.pathname.split("/").pop() || "index.html";
  const theme = store.get("theme", null);
  if(theme) document.documentElement.dataset.theme = theme;

  const head = document.createElement("header");
  head.className = "site-head";
  head.innerHTML = `<div class="wrap">
    <a class="logo" href="index.html" aria-label="Riffologia, home">Riff<span>o</span>logia</a>
    <nav class="nav" id="nav">${PAGES.map(([h,l]) => `<a href="${h}" class="${h===here?"active":""}">${l}</a>`).join("")}</nav>
    <button class="icon-btn" id="themeBtn" title="Tema chiaro/scuro" aria-label="Cambia tema">◐</button>
    <button class="icon-btn burger" id="burger" aria-label="Menu" aria-controls="nav" aria-expanded="false">☰</button>
  </div>`;
  document.body.prepend(head);

  const foot = document.createElement("footer");
  foot.className = "site-foot";
  foot.innerHTML = `<div class="wrap">
    <div><a class="logo" href="index.html">Riff<span>o</span>logia</a>
      <p class="mono muted" style="margin-top:8px">Enciclopedia interattiva di rock, hard rock e metal · aggiornata a novembre 2026</p></div>
    <p class="mono muted">Voti e preferenze sono salvati solo nel tuo browser.<br>Prezzi indicativi, in euro, a nuovo.</p>
  </div>`;
  document.body.appendChild(foot);

  $("#themeBtn").onclick = () => {
    const cur = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = cur; store.set("theme", cur);
  };
  $("#burger").onclick = e => {
    const open = $("#nav").classList.toggle("open");
    e.currentTarget.setAttribute("aria-expanded", open);
  };
  document.addEventListener("DOMContentLoaded", () => reveal());
})();
