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
  const io = new IntersectionObserver(es => es.forEach(e => { if(e.isIntersecting){ const t = e.target; t.classList.add("in"); io.unobserve(t); setTimeout(() => t.style.transitionDelay = "", 1200); } }), {threshold:.08});
  els.forEach((e, i) => { e.style.transitionDelay = (i % 6) * 60 + "ms"; io.observe(e); });
}

(function layout(){
  const here = location.pathname.split("/").pop() || "index.html";
  const theme = store.get("theme", null);
  if(theme) document.documentElement.dataset.theme = theme;

  const I = window.I18N || { choice:"it", LANGS:{ it:"Italiano" }, GT:{}, set(){} }, cur = I.choice;
  const head = document.createElement("header");
  head.className = "site-head";
  head.innerHTML = `<div class="wrap">
    <a class="logo" translate="no" href="index.html" aria-label="Riffologia, home">Riff<span>o</span>logia</a>
    <nav class="nav" id="nav">${PAGES.map(([h,l]) => `<a href="${h}" class="${h===here?"active":""}"${/^(Home|Hall of Fame)$/.test(l) ? ' translate="no"' : ""}>${l}</a>`).join("")}</nav>
    <div class="lang notranslate" id="lang" data-noi18n translate="no">
      <button class="icon-btn lang-btn" id="langBtn" aria-haspopup="true" aria-expanded="false" aria-controls="langMenu" title="Language · Lingua">${cur.split("-")[0].toUpperCase()}</button>
      <div class="lang-menu" id="langMenu" role="menu" aria-label="Language · Lingua">${Object.entries(I.LANGS).map(([c,n]) =>
        `<button role="menuitemradio" aria-checked="${c === cur}" lang="${c}" data-lang="${c}"><span class="mono">${c.toUpperCase()}</span> ${n}</button>`).join("")}
        <label class="lang-more"><span class="mono">More languages · Google Translate</span>
          <select id="langMore"><option value="">${I.gt ? "" : "…"}</option>${Object.entries(I.GT).map(([c,n]) =>
            `<option value="${c}" lang="${c}"${c === cur ? " selected" : ""}>${n}</option>`).join("")}</select></label>
      </div>
    </div>
    <button class="icon-btn" id="themeBtn" title="Tema chiaro/scuro" aria-label="Cambia tema">◐</button>
    <button class="icon-btn burger" id="burger" aria-label="Menu" aria-controls="nav" aria-expanded="false">☰</button>
  </div>`;
  document.body.prepend(head);

  const langBox = $("#lang"), langBtn = $("#langBtn");
  const closeLang = () => { langBox.classList.remove("open"); langBtn.setAttribute("aria-expanded", "false"); };
  langBtn.onclick = e => { e.stopPropagation(); const open = langBox.classList.toggle("open"); langBtn.setAttribute("aria-expanded", open); if(open) $("#langMenu [aria-checked=true]")?.focus(); };
  $("#langMenu").onclick = e => { const b = e.target.closest("[data-lang]"); if(b) I.set(b.dataset.lang); };
  $("#langMore").onchange = e => { if(e.target.value) I.set(e.target.value); };
  document.addEventListener("click", e => { if(!langBox.contains(e.target)) closeLang(); });
  document.addEventListener("keydown", e => { if(e.key === "Escape" && langBox.classList.contains("open")){ closeLang(); langBtn.focus(); } });

  const foot = document.createElement("footer");
  foot.className = "site-foot";
  foot.innerHTML = `<div class="wrap">
    <div><a class="logo" translate="no" href="index.html">Riff<span>o</span>logia</a>
      <p class="mono muted" style="margin-top:8px">Enciclopedia interattiva di rock, hard rock e metal · aggiornata a novembre 2026</p></div>
    <p class="mono muted">Voti e preferenze sono salvati solo nel tuo browser.<br>Prezzi indicativi, in euro, a nuovo.</p>
  </div>
  <div class="wrap foot-legal"><p class="mono muted" style="font-size:.75rem;margin-top:16px">
    Progetto amatoriale e indipendente, non affiliato a band, etichette o produttori. Nomi di band, album e strumenti (Fender, Gibson, Jackson…) sono marchi dei rispettivi titolari, citati a scopo descrittivo; le chitarre disegnate sono illustrazioni stilizzate ispirate ai modelli storici.<br>
    Codice <a href="https://github.com/AmbrosinoFabio/riffologia/blob/main/LICENSE">MIT</a> · Testi <a href="https://creativecommons.org/licenses/by/4.0/deed.it" rel="license">CC BY 4.0</a> · © 2026 Fabio Ambrosino · <a href="https://github.com/AmbrosinoFabio/riffologia">Sorgente su GitHub</a></p>
    <p class="mono muted" style="font-size:.75rem;margin-top:8px">Le lingue diverse da italiano, inglese, tedesco, francese e spagnolo sono tradotte da Google Translate solo se lo scegli: in quel caso la pagina contatta i server di Google.</p>
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
