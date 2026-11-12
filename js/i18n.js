/* RIFFOLOGIA — traduzione dell'interfaccia (EN · IT · DE · FR · ES, altre lingue via Google Translate)
 *
 * Lingua predefinita: inglese. Scelta: ?lang= nell'URL -> localStorage -> lingua del browser -> inglese.
 * Il testo sorgente è in italiano. Per le altre lingue questo modulo traduce il testo mostrato
 * nella pagina usando un dizionario "frase italiana -> traduzione" (js/i18n/<lingua>.js).
 * I dati (data.js) restano in italiano, quindi voti, preferiti e filtri continuano a funzionare.
 *
 * - Va caricato come PRIMO script in fondo al <body>: il dizionario arriva in modo sincrono
 *   e il testo statico viene tradotto prima che girino gli script della pagina.
 * - I numeri diventano segnaposto: "Nasce il 13 febbraio 1970" -> chiave "Nasce il {0} febbraio {1}".
 * - I testi generati dagli script vengono tradotti al volo con un MutationObserver.
 * - Si modifica solo il contenuto dei nodi di testo (mai innerHTML), così gli elementi
 *   e i riferimenti che gli script tengono in memoria restano validi.
 */
(function(){
  // Lingue tradotte a mano (dizionari in js/i18n/). L'inglese è la lingua predefinita.
  const LANGS = { en:"English", it:"Italiano", de:"Deutsch", fr:"Français", es:"Español" };
  // Altre lingue: la pagina viene mostrata in inglese e poi tradotta da Google Translate.
  const GT = { pt:"Português", nl:"Nederlands", pl:"Polski", ro:"Română", sv:"Svenska", da:"Dansk", no:"Norsk",
    fi:"Suomi", cs:"Čeština", hu:"Magyar", el:"Ελληνικά", tr:"Türkçe", ru:"Русский", uk:"Українська",
    ar:"العربية", he:"עברית", hi:"हिन्दी", id:"Bahasa Indonesia", vi:"Tiếng Việt", th:"ไทย",
    ja:"日本語", ko:"한국어", "zh-CN":"中文 (简体)", "zh-TW":"中文 (繁體)" };
  const KEY = "riff_lang", DEFAULT = "en";
  const valid = l => !!(l && (LANGS[l] || GT[l]));
  const read = () => { try{ return JSON.parse(localStorage.getItem(KEY)); }catch(e){ return null; } };
  const save = l => { try{ localStorage.setItem(KEY, JSON.stringify(l)); }catch(e){} };
  // lingue del browser che sappiamo mostrare, in ordine di preferenza ("pt-BR" -> "pt", "zh-TW" -> "zh-TW", "nb" -> "no")
  function fromBrowser(){
    const out = [];
    for(const raw of (navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || ""])){
      const l = String(raw).toLowerCase(), base = l.split("-")[0];
      const c = base === "zh" ? (/tw|hk|mo|hant/.test(l) ? "zh-TW" : "zh-CN") : base === "nb" || base === "nn" ? "no" : base === "iw" ? "he" : base;
      if(valid(c) && !out.includes(c)) out.push(c);
    }
    return out;
  }
  // ordine: ?lang= nell'URL (così la lingua segue i link anche senza localStorage) -> scelta salvata -> browser -> inglese
  const fromUrl = new URLSearchParams(location.search).get("lang");
  // Google Translate non parte mai da solo (invierebbe a Google l'IP del visitatore): se il browser è in una
  // lingua senza dizionario si mostra l'inglese e si propone la traduzione con un clic (vedi offerGoogle).
  // Es. browser ["pt-BR","it"]: si mostra l'italiano e si propone il portoghese via Google.
  const prefs = fromBrowser(), offer = GT[prefs[0]] ? prefs[0] : null;
  const choice = valid(fromUrl) ? fromUrl : valid(read()) ? read() : (prefs.find(l => LANGS[l]) || DEFAULT);
  if(valid(fromUrl) && read() !== fromUrl) save(fromUrl);
  const gt = GT[choice] ? choice : null;          // lingua affidata a Google Translate
  const lang = gt ? DEFAULT : choice;             // lingua del dizionario usato

  const INLINE = new Set(["A","B","STRONG","EM","I","SPAN","BR","SMALL","CODE","SUP","SUB","ABBR","MARK","U","S","TIME","KBD"]);
  const SKIP = new Set(["SCRIPT","STYLE","SVG","CANVAS","NOSCRIPT","TEXTAREA","svg"]);
  const ATTRS = ["title","aria-label","placeholder","alt"];
  const norm = s => s.replace(/\s+/g," ").trim();
  const hasWords = s => /[A-Za-zÀ-ÿ]{2,}/.test(s);

  let DICT = null, TPL = [];
  const written = new WeakMap();          // nodo -> valore scritto da noi (per ignorare le nostre mutazioni)

  function fillNums(str, nums){ return str.replace(/\{(\d+)\}/g, (m,i) => nums[+i] !== undefined ? nums[+i] : m); }

  // Traduce una stringa "piatta". Restituisce null se non c'è traduzione.
  function t(text, depth=0){
    if(!DICT || !text || !hasWords(text)) return null;
    const s = norm(text);
    const nums = s.match(/\d+/g) || [];
    let i = 0; const key = s.replace(/\d+/g, () => "{"+(i++)+"}");
    if(DICT[key] !== undefined) return fillNums(DICT[key], nums);
    if(depth > 2) return null;
    for(const [re, tr] of TPL){
      const m = s.match(re);
      if(m){ let k = 0; const g = m.slice(1).map(x => t(x, depth+1) ?? x);
        return tr.replace(/\{s(\d*)\}/g, (_,n) => g[n === "" ? k++ : +n] ?? ""); }
    }
    for(const sep of [" · ", " / "]){         // "Germania · 1965–oggi", "Solista / Whitesnake"
      if(s.includes(sep)){
        const parts = s.split(sep), out = parts.map(p => t(p, depth+1) ?? p);
        if(out.some((p,j) => p !== parts[j])) return out.join(sep);
      }
    }
    return null;
  }

  function setText(node, value){ written.set(node, value); node.data = value; }
  function translateTextNode(node){
    if(written.get(node) === node.data) return;
    const tr = t(node.data); if(tr === null) return;
    const lead = node.data.match(/^\s*/)[0], trail = node.data.match(/\s*$/)[0];
    setText(node, lead + tr + trail);
  }
  function translateAttrs(el){
    for(const a of ATTRS){
      if(!el.hasAttribute(a)) continue;
      const v = el.getAttribute(a); if(written.get(el) && written.get(el)[a] === v) continue;
      const tr = t(v); if(tr === null) continue;
      const w = written.get(el) || {}; w[a] = tr; written.set(el, w); el.setAttribute(a, tr);
    }
  }
  const textNodes = root => { const out = [], w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    while(w.nextNode()) if(w.currentNode.data.trim()) out.push(w.currentNode); return out; };
  const isLeafBlock = el => el.children.length > 0 && [...el.children].every(c => INLINE.has(c.tagName) &&
    (c.children.length === 0 || [...c.children].every(g => INLINE.has(g.tagName) && g.children.length === 0)));

  // Blocco con markup interno (es. "Scegli il tuo <span>percorso</span>"): si traduce la frase intera
  // e si copiano i testi nodo per nodo, senza ricreare gli elementi.
  function translateBlock(el){
    const s = norm(el.innerHTML), nums = s.match(/\d+/g) || [];
    let i = 0; const key = s.replace(/\d+/g, () => "{"+(i++)+"}");
    const tr = DICT[key]; if(tr === undefined) return false;
    const tpl = document.createElement("template"); tpl.innerHTML = fillNums(tr, nums);
    const src = textNodes(tpl.content), dst = textNodes(el);
    if(src.length !== dst.length) return false;
    dst.forEach((n,j) => { if(n.data !== src[j].data) setText(n, src[j].data); });
    el.querySelectorAll("*").forEach(translateAttrs);
    return true;
  }

  function walk(el){
    if(el.nodeType !== 1 || SKIP.has(el.tagName) || el.closest("[data-noi18n]")) return;
    translateAttrs(el);
    if(!INLINE.has(el.tagName) && isLeafBlock(el) && hasWords(el.textContent) && translateBlock(el)) return;
    for(const n of [...el.childNodes]){
      if(n.nodeType === 3) translateTextNode(n);
      else if(n.nodeType === 1) walk(n);
    }
  }

  function translateNode(n){
    const parent = n.nodeType === 3 ? n.parentElement : n;
    if(!parent || parent.closest("[data-noi18n]") || SKIP.has(parent.tagName)) return;
    // se il nodo fa parte di un blocco con markup interno, prova prima la frase intera
    const block = n.nodeType === 3 ? parent : n.parentElement;
    if(block && !INLINE.has(block.tagName) && isLeafBlock(block) && translateBlock(block)) return;
    if(n.nodeType === 3) translateTextNode(n); else walk(n);
  }

  function start(){
    document.documentElement.lang = lang;
    const title = document.querySelector("title"); if(title) title.childNodes.forEach(translateTextNode);
    const md = document.querySelector('meta[name="description"]');
    if(md){ const tr = t(md.content); if(tr) md.content = tr; }
    walk(document.body);
    new MutationObserver(recs => {
      for(const r of recs){
        if(r.type === "childList") r.addedNodes.forEach(n => (n.nodeType === 1 || n.nodeType === 3) && translateNode(n));
        else if(r.type === "characterData") translateNode(r.target);
        else if(r.type === "attributes" && r.target.nodeType === 1) translateAttrs(r.target);
      }
    }).observe(document.body, { childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS });
  }

  // --- la lingua segue i link interni: ?lang=xx viene aggiunto all'indirizzo al momento del clic ---
  const dir = location.pathname.replace(/[^/]*$/, "");
  function tagLink(e){
    const a = e.target && e.target.closest ? e.target.closest("a[href]") : null; if(!a) return;
    let u; try{ u = new URL(a.getAttribute("href"), location.href); }catch(err){ return; }
    if(u.origin !== location.origin || !u.pathname.startsWith(dir) || !/(\.html|\/)$/.test(u.pathname)) return;
    if(u.searchParams.get("lang") === choice) return;
    u.searchParams.set("lang", choice); a.href = u.href;
  }
  ["click","auxclick","contextmenu"].forEach(ev => document.addEventListener(ev, tagLink, true));

  // --- Google Translate (solo per le lingue senza dizionario) ---
  function clearGoogleCookie(){
    const host = location.hostname, dead = "=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    for(const path of ["/", dir]) for(const dom of ["", "; domain=" + host, "; domain=." + host])
      document.cookie = "googtrans" + dead + "; path=" + path + dom;
  }
  function loadGoogle(){
    clearGoogleCookie();
    document.cookie = "googtrans=/" + DEFAULT + "/" + gt + "; path=/";
    const css = document.createElement("style");
    css.textContent = "body{top:0!important;position:static!important}body>.skiptranslate,iframe.skiptranslate,.goog-te-banner-frame,#goog-gt-tt,.goog-te-balloon-frame,.goog-tooltip{display:none!important}" +
      ".goog-text-highlight{background:none!important;box-shadow:none!important}#google_translate_element{display:none}";
    document.head.appendChild(css);
    const box = document.createElement("div"); box.id = "google_translate_element"; document.body.appendChild(box);
    window.__riffGT = () => {
      try{ new google.translate.TranslateElement({ pageLanguage: DEFAULT, autoDisplay: false }, "google_translate_element"); }catch(e){ return; }
      // il cookie non sempre basta: se dopo l'avvio la pagina non è tradotta, si sceglie la lingua nel selettore nascosto
      let tries = 0;
      const kick = () => {
        const html = document.documentElement;
        if(/translated-(ltr|rtl)/.test(html.className)) return;
        const combo = document.querySelector(".goog-te-combo");
        if(combo && [...combo.options].some(o => o.value === gt)){
          combo.value = gt; combo.dispatchEvent(new Event("change"));
          if(++tries < 3) setTimeout(kick, 1500);
        } else if(++tries < 40) setTimeout(kick, 250);
      };
      setTimeout(kick, 800);
    };
    const sc = document.createElement("script");
    sc.src = "https://translate.google.com/translate_a/element.js?cb=__riffGT"; sc.async = true;
    document.head.appendChild(sc);
  }
  function offerGoogle(){
    try{ if(localStorage.getItem("riff_gt_offer") === offer) return; }catch(e){}
    const bar = document.createElement("div");
    bar.className = "gt-offer notranslate"; bar.setAttribute("translate", "no"); bar.setAttribute("data-noi18n", ""); bar.setAttribute("role", "region");
    bar.setAttribute("aria-label", "Translation");
    bar.innerHTML = '<span lang="' + offer + '">🌐 ' + GT[offer] + '?</span> <span class="muted">Translate this page with Google Translate</span>' +
      '<button class="btn" type="button" data-gt-yes>Translate</button><button class="icon-btn" type="button" data-gt-no aria-label="Close">×</button>';
    bar.querySelector("[data-gt-yes]").onclick = () => window.I18N.set(offer);
    bar.querySelector("[data-gt-no]").onclick = () => { try{ localStorage.setItem("riff_gt_offer", offer); }catch(e){} bar.remove(); };
    document.body.appendChild(bar);
  }
  if(gt) document.addEventListener("DOMContentLoaded", loadGoogle);
  else {
    if(/googtrans=/.test(document.cookie)) clearGoogleCookie();
    if(offer && !valid(fromUrl) && !valid(read())) document.addEventListener("DOMContentLoaded", offerGoogle);
  }

  window.I18N = {
    lang, choice, gt, LANGS, GT,
    t: s => (lang === "it" ? s : (t(s) ?? s)),
    set(l){
      if(!valid(l)) return; save(l); clearGoogleCookie();
      const u = new URL(location.href); u.searchParams.set("lang", l); location.href = u.href;
    },
    load(dict, tpl){
      DICT = dict;
      TPL = tpl.map(([it, tr]) => [new RegExp("^" + it.split("{s}").map(x => x.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("(.+?)") + "$"), tr]);
      start();
    }
  };

  document.documentElement.lang = gt || lang;
  if(lang !== "it") document.write('<script src="js/i18n/' + lang + '.js"><\/script>');
})();
