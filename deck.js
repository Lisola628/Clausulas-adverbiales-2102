/* Cláusulas adverbiales — deck behavior.
   Answers autosave in THIS browser only (localStorage). Nothing is sent anywhere. */
(function(){
  "use strict";
  var PAGE = document.body.dataset.page || location.pathname;
  var KEY = "clausulas:" + PAGE, POS = "clausulas-pos:" + PAGE;
  var slides = [], fields = [], dots = [], cur = 0, statusEl, saveTimer;

  function $(s, r){ return (r || document).querySelector(s); }
  function $$(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function store(){ try{ return window.localStorage; }catch(e){ return null; } }
  function say(m){ if(statusEl) statusEl.textContent = m; }
  function norm(s){ return (s||"").trim().toLowerCase().replace(/\s+/g," ").replace(/[.!?¡¿]+$/g,""); }
  function plain(s){ return norm(s).normalize("NFD").replace(/[̀-ͯ]/g,""); }

  /* ---------- navegación ---------- */
  function buildNav(){
    var wrap = $(".dots");
    slides.forEach(function(s, i){
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Diapositiva " + (i+1) + ": " + (s.getAttribute("aria-label") || ""));
      b.title = s.getAttribute("aria-label") || ("Diapositiva " + (i+1));
      b.addEventListener("click", function(){ show(i); });
      wrap.appendChild(b); dots.push(b);
    });
    $(".nav.prev").addEventListener("click", function(){ show(cur - 1); });
    $(".nav.next").addEventListener("click", function(){ show(cur + 1); });
    document.addEventListener("keydown", function(e){
      var t = e.target && e.target.tagName;
      if(t === "INPUT" || t === "TEXTAREA" || t === "SELECT") return;
      if(e.key === "ArrowRight" || e.key === "PageDown"){ show(cur + 1); e.preventDefault(); }
      else if(e.key === "ArrowLeft" || e.key === "PageUp"){ show(cur - 1); e.preventDefault(); }
    });
  }

  function show(i){
    i = Math.max(0, Math.min(slides.length - 1, i));
    cur = i;
    slides.forEach(function(s, k){ s.classList.toggle("cur", k === i); });
    dots.forEach(function(d, k){ d.setAttribute("aria-current", k === i ? "true" : "false"); });
    slides[i].scrollTop = 0;
    $(".count").textContent = (i + 1) + " / " + slides.length;
    $(".nav.prev").disabled = (i === 0);
    var nx = $(".nav.next");
    if(i === slides.length - 1){ nx.textContent = "Índice"; nx.disabled = false; nx.onclick = function(){ location.href = "index.html"; }; }
    else { nx.textContent = "Siguiente →"; nx.disabled = false; nx.onclick = null; }
    var s = store(); if(s){ try{ s.setItem(POS, String(i)); }catch(e){} }
  }

  /* ---------- guardar / restaurar ---------- */
  function onEdit(e){ clearFb(e.target); clearTimeout(saveTimer); saveTimer = setTimeout(save, 400); }
  function save(){
    var s = store();
    if(!s){ say("Este navegador no guarda; use Descargar o Imprimir."); return; }
    var data = {};
    fields.forEach(function(el){ if(el.value) data[el.dataset.k] = el.value; });
    try{
      s.setItem(KEY, JSON.stringify(data));
      var t = new Date();
      say("Guardado a las " + t.toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"}));
    }catch(e){ say("No se pudo guardar. Descargue sus respuestas."); }
  }
  function restore(){
    var s = store();
    if(!s){ say("Este navegador no guarda automáticamente."); return; }
    var raw; try{ raw = s.getItem(KEY); }catch(e){ raw = null; }
    if(!raw) return;
    try{
      var data = JSON.parse(raw);
      fields.forEach(function(el){ if(data[el.dataset.k] !== undefined) el.value = data[el.dataset.k]; });
      say("Recuperamos lo que escribió antes.");
    }catch(e){}
  }
  function clearAll(){
    if(!window.confirm("¿Borrar todas sus respuestas de este tema?")) return;
    fields.forEach(function(el){ el.value = ""; clearFb(el); });
    $$(".qk").forEach(resetQk);
    $$(".qscore").forEach(function(q){ q.textContent = ""; });
    var s = store(); if(s){ try{ s.removeItem(KEY); }catch(e){} }
    say("Todo borrado.");
  }

  /* ---------- revisar (por diapositiva) ---------- */
  function fbFor(el){
    var n = el.nextElementSibling;
    if(n && n.classList && n.classList.contains("fb")) return n;
    n = document.createElement("span"); n.className = "fb"; n.setAttribute("aria-live","polite");
    el.parentNode.insertBefore(n, el.nextSibling); return n;
  }
  function clearFb(el){
    if(!el.classList) return;
    el.classList.remove("is-ok","is-bad","is-near");
    var n = el.nextElementSibling;
    if(n && n.classList && n.classList.contains("fb")) n.parentNode.removeChild(n);
  }
  function mark(el, kind, text){
    clearFb(el);
    var n = fbFor(el); n.className = "fb " + kind; n.textContent = text;
    if(kind !== "empty") el.classList.add("is-" + kind);
  }
  function check(slide){
    var items = $$("[data-a]", slide), total = 0, right = 0, empty = 0;
    items.forEach(function(el){
      total++;
      var answers = el.dataset.a.split("|"), v = el.value;
      if(!v.trim()){ empty++; mark(el, "empty", "(sin responder)"); return; }
      if(answers.some(function(a){ return norm(a) === norm(v); })){ right++; mark(el, "ok", "✓ Correcto"); return; }
      if(answers.some(function(a){ return plain(a) === plain(v); })){ mark(el, "near", "Casi: revise los acentos. Respuesta: " + answers[0]); return; }
      mark(el, "bad", "✗ Respuesta: " + answers.join(" / "));
    });
    var sc = $(".score", slide);
    if(sc) sc.textContent = right + " de " + total + " correctas" + (empty ? " · " + empty + " sin responder" : "");
  }

  /* ---------- diagnóstico rápido ---------- */
  function resetQk(q){
    $$("button", q).forEach(function(b){ b.disabled = false; b.classList.remove("right","wrong"); });
    var w = $(".why", q); if(w){ w.hidden = true; w.className = "why"; }
    q.dataset.done = "";
  }
  function qkScore(box){
    var all = $$(".qk", box), done = all.filter(function(q){ return q.dataset.done === "1"; }).length;
    var good = all.filter(function(q){ return q.dataset.done === "1" && q.dataset.first === "1"; }).length;
    var sc = $(".qscore", box);
    if(sc) sc.textContent = done ? (good + " de " + all.length + " al primer intento · " + done + " resueltas") : "";
  }
  function initQuick(){
    $$(".quick").forEach(function(box){
      $$(".qk", box).forEach(function(q){
        $$(".opts button", q).forEach(function(b){
          b.addEventListener("click", function(){
            if(q.dataset.done === "1") return;
            var why = $(".why", q); why.hidden = false;
            if(b.dataset.v === q.dataset.ans){
              b.classList.add("right"); why.className = "why ok";
              if(!q.dataset.tried) q.dataset.first = "1";
              q.dataset.done = "1";
              $$(".opts button", q).forEach(function(x){ x.disabled = true; });
            }else{
              b.classList.add("wrong"); why.className = "why no"; q.dataset.tried = "1"; b.disabled = true;
            }
            qkScore(box);
          });
        });
      });
    });
  }

  /* ---------- interruptor ---------- */
  function initSwitch(){
    $$(".switch").forEach(function(sw){
      var exs = $$(".sw-ex", sw), idx = 0;
      sw.dataset.state = "a"; exs[0].classList.add("cur");
      function flip(){ var s = $(".sw-ex.cur .sw-sent", sw); if(s){ s.classList.remove("flip"); void s.offsetWidth; s.classList.add("flip"); } }
      $$("[data-set]", sw).forEach(function(b){
        b.addEventListener("click", function(){ sw.dataset.state = b.dataset.set; flip(); });
      });
      var nx = $(".sw-next", sw);
      if(nx) nx.addEventListener("click", function(){
        exs[idx].classList.remove("cur"); idx = (idx + 1) % exs.length; exs[idx].classList.add("cur"); flip();
      });
    });
  }

  /* ---------- cronómetro ---------- */
  function fmt(s){ return Math.floor(s/60) + ":" + ("0" + (s % 60)).slice(-2); }
  function initTimers(){
    $$(".timer").forEach(function(t){
      var total = parseInt(t.dataset.sec, 10) || 240, left = total, iv = null;
      t.textContent = "⏱ " + fmt(left);
      t.setAttribute("aria-label", "Cronómetro de " + fmt(total) + ". Pulse para empezar o pausar.");
      t.addEventListener("click", function(){
        if(iv){ clearInterval(iv); iv = null; t.classList.remove("run"); return; }
        if(left <= 0){ left = total; t.classList.remove("done"); }
        t.classList.add("run");
        iv = setInterval(function(){
          left--; t.textContent = "⏱ " + fmt(Math.max(0, left));
          if(left <= 0){ clearInterval(iv); iv = null; t.classList.remove("run"); t.classList.add("done"); t.textContent = "¡Tiempo!"; }
        }, 1000);
      });
    });
  }

  /* ---------- imprimir / descargar ---------- */
  function mirrorForPrint(){
    $$("textarea.f").forEach(function(ta){
      var box = ta.nextElementSibling;
      if(box && box.classList.contains("fb")) box = box.nextElementSibling;
      if(!box || !box.classList || !box.classList.contains("answer-print")){
        box = document.createElement("div"); box.className = "answer-print";
        ta.parentNode.insertBefore(box, ta.nextSibling);
      }
      box.textContent = ta.value;
    });
  }
  function download(){
    var name = ($("#student-name") || {}).value || "";
    var lines = [document.title];
    if(name) lines.push("Nombre: " + name);
    lines.push("Fecha de descarga: " + new Date().toLocaleString(), "");
    $$(".slide h2, .slide h1, .slide .f").forEach(function(el){
      if(el.tagName === "H2" || el.tagName === "H1"){ lines.push("", "== " + el.textContent.trim() + " =="); }
      else if(el.value && el.id !== "student-name"){ lines.push("  " + (el.dataset.q || el.dataset.k) + ": " + el.value); }
    });
    var blob = new Blob([lines.join("\n")], {type:"text/plain;charset=utf-8"});
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = (name ? name.replace(/[^\w\-]+/g,"_") + "-" : "") + (document.body.dataset.page || "respuestas") + ".txt";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 1000);
    say("Archivo descargado.");
  }

  function init(){
    statusEl = $(".status");
    slides = $$(".slide");
    if(!slides.length) return;
    fields = $$(".f");
    fields.forEach(function(el, i){
      if(!el.dataset.k) el.dataset.k = "q" + i;
      if(!el.getAttribute("aria-label")) el.setAttribute("aria-label", "Respuesta " + (el.dataset.q || (i + 1)));
      el.addEventListener("input", onEdit); el.addEventListener("change", onEdit);
    });
    restore();
    buildNav(); initQuick(); initSwitch(); initTimers();
    $$(".js-check").forEach(function(b){ b.addEventListener("click", function(){ check(b.closest(".slide")); }); });
    var st = $(".start"); if(st) st.addEventListener("click", function(){ show(1); });
    $("#btn-print").addEventListener("click", function(){ window.print(); });
    $("#btn-download").addEventListener("click", download);
    $("#btn-clear").addEventListener("click", clearAll);
    window.addEventListener("beforeprint", mirrorForPrint);
    var s = store(), p = 0;
    if(s){ try{ p = parseInt(s.getItem(POS), 10) || 0; }catch(e){} }
    show(p);
  }
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
})();
