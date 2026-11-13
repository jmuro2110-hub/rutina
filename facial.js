/* ============================================================
   RUTINA FACIAL — guía de consulta, una tarjeta a la vez
   ------------------------------------------------------------
   Independiente de la Rutina y de Ejercicio: no usa sus
   variables ni su guardado. Guarda SOLO el punto de lectura
   (bloque y tarjeta) en su propia clave de localStorage.
   Avanzar de tarjeta solo cambia la vista: no marca nada como
   hecho. Mostrar/ocultar la pestaña lo hace vistas.js.
   ============================================================ */

(function () {
  'use strict';

  const vista = document.getElementById('facial');
  if (!vista || typeof FACIAL_BLOQUES === 'undefined') return;

  const EJ = FACIAL_EJ, BLOQUES = FACIAL_BLOQUES, REF = FACIAL_REF, G = FACIAL_GUIA;
  const CLAVE = 'rutina_facial_v1';

  /* ---------- punto de lectura (guardado propio) ---------- */
  function horaMx() {
    try {
      const h = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', hour: 'numeric', hourCycle: 'h23' }).format(new Date());
      const n = parseInt(h, 10);
      if (!isNaN(n)) return n;
    } catch (e) { /* respaldo: hora local */ }
    return new Date().getHours();
  }
  const estado = { b: horaMx() < 14 ? 'A' : 'B', i: { A: 0, B: 0, D: 0 } };
  try {
    const g = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (g && BLOQUES.some(x => x.k === g.b)) estado.b = g.b;
    if (g && g.i) BLOQUES.forEach(x => { if (Number.isInteger(g.i[x.k])) estado.i[x.k] = g.i[x.k]; });
  } catch (e) { /* sin guardado: valores por defecto */ }
  function guardar() {
    try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { /* sin almacenamiento */ }
  }

  /* cada bloque es una secuencia: «Antes de empezar» (si aplica) + ejercicios */
  function pasosDe(b) {
    return (b.intro ? [{ intro: true }] : []).concat(b.lista);
  }

  /* ---------- plantilla ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const RELOJ = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>';
  const ALTO  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7z"/><path d="M12 8v5M12 16.5v.01"/></svg>';
  const INFO  = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/></svg>';
  const IZQ   = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg>';
  const DER   = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';

  const lista = (arr, ord) => {
    const t = ord ? 'ol' : 'ul';
    return '<' + t + '>' + arr.map(x => '<li>' + esc(x) + '</li>').join('') + '</' + t + '>';
  };
  const stats = d => '<div class="fa-stats">' + d.map(x =>
    '<div class="fa-st"><b class="num">' + esc(x[0]) + '</b><span>' + esc(x[1]) + '</span></div>').join('') + '</div>';
  const descanso = t => '<div class="fa-desc">' + RELOJ + '<span>Descanso: <b>' + esc(t) + '</b></span></div>';
  const sub = t => '<div class="fa-sub">' + esc(t) + '</div>';
  const cajaAlto = (titulo, items, fuerte) => '<div class="fa-parar' + (fuerte ? ' fuerte' : '') + '">' +
    '<div class="lab">' + ALTO + esc(titulo) + '</div>' +
    (Array.isArray(items) ? lista(items) : '<p>' + esc(items) + '</p>') + '</div>';

  function tarjetaIntro(b) {
    return '<article class="fa-it">' +
      '<h3 class="fa-n">Antes de empezar</h3>' +
      sub('Posición') + '<p class="fa-txt">' + esc(G.posicion) + '</p>' +
      sub('Esfuerzo') + '<p class="fa-txt">' + esc(G.esfuerzo) + '</p>' +
      cajaAlto('Si una repetición falla', [G.falla, G.excepcion]) +
      sub('Cuándo terminaste') + '<p class="fa-txt">' + esc(G.suficiente) + '</p>' +
      (b.nota ? '<p class="fa-cond">' + esc(b.nota) + '</p>' : '') +
      '<details class="fa-det"><summary>Ver detalle</summary>' +
        sub('Cuándo bajar') + '<p class="fa-txt">' + esc(G.bajar) + '</p>' +
        sub('Qué no hacer') + '<div class="fa-ul">' + lista(G.noHacer) + '</div>' +
        cajaAlto('Para y consulta a tu médico si aparece algo nuevo', G.medico) +
      '</details>' +
    '</article>';
  }

  function tarjetaEj(item) {
    const e = EJ[item.e], d = e.det || {};
    const detalle =
      (d.para ? sub('Para qué') + '<p class="fa-txt">' + esc(d.para) + '</p>' : '') +
      (d.pasos ? sub('Pasos completos') + '<div class="fa-pasos">' + lista(d.pasos, true) + '</div>' : '') +
      (d.ver ? sub('Qué deberías ver') + '<p class="fa-txt">' + esc(d.ver) + '</p>' : '') +
      (d.mas ? sub('Otras señales del PDF') + '<div class="fa-ul">' + lista(d.mas) + '</div>' : '') +
      (d.nota ? '<p class="fa-cond">' + esc(d.nota) + '</p>' : '');

    return '<article class="fa-it">' +
      '<h3 class="fa-n">' + esc(e.n) + '</h3>' +
      '<span class="fa-tag">Propuesta del PDF · dosis sin confirmar</span>' +
      stats(item.dosis || e.dosis) +
      descanso(e.desc) +
      sub('Pasos') + '<div class="fa-pasos">' + lista(e.breve, true) + '</div>' +
      (e.frases ? '<ul class="fa-frases">' + e.frases.map(f => '<li>«' + esc(f) + '»</li>').join('') + '</ul>' : '') +
      (e.suspender ? cajaAlto('Suspende este ejercicio', e.suspender, true) : '') +
      (e.alto && e.alto.length ? cajaAlto('Señal para parar', e.alto) : '') +
      (e.cond ? '<p class="fa-cond">' + INFO + '<span>' + esc(e.cond) + '</span></p>' : '') +
      (detalle ? '<details class="fa-det"><summary>Ver detalle</summary>' + detalle + '</details>' : '') +
    '</article>';
  }

  function tarjetaRef(r) {
    return '<article class="fa-it ref">' +
      '<h3 class="fa-n">' + esc(r.n) + '</h3>' +
      '<span class="fa-tag ref">Solo referencia</span>' +
      '<div class="fa-aviso">' + INFO + '<p>' + esc(r.aviso) + '</p></div>' +
      '<p class="fa-cond">' + esc(r.donde) + '</p>' +
      '<details class="fa-det"><summary>Ver cómo lo describe el PDF</summary>' +
        stats(r.dosis) + descanso(r.desc) +
        (r.previo ? '<p class="fa-txt fa-previo">' + esc(r.previo) + '</p>' : '') +
        (r.escalera ? sub('Escalera de ayuda') + '<ul class="fa-esc">' +
          r.escalera.map(n => '<li><span class="num">' + n[0] + '</span><p>' + esc(n[1]) + '</p></li>').join('') + '</ul>' : '') +
        sub('Pasos') + '<div class="fa-pasos">' + lista(r.pasos, true) + '</div>' +
        sub('Qué deberías ver') + '<p class="fa-txt">' + esc(r.ver) + '</p>' +
        cajaAlto('Señales para parar', r.alto) +
      '</details>' +
    '</article>';
  }

  vista.innerHTML =
    '<nav class="fa-bloques" role="tablist" aria-label="Bloque">' +
      BLOQUES.map(b => '<button class="fa-bl" type="button" role="tab" data-k="' + b.k + '" aria-controls="faPaso">' + esc(b.corto) + '</button>').join('') +
    '</nav>' +
    '<div class="fa-ctx">' +
      '<span class="fa-tag">Propuesta del PDF · dosis sin confirmar</span>' +
      '<p>Los ≈ 24 min son el plan completo del documento, no una meta; el bloque de 30 min de tu calendario no añade otra sesión.</p>' +
    '</div>' +
    '<section class="fa-paso" id="faPaso" aria-live="polite">' +
      '<div class="fa-head">' +
        '<h2 id="faBloque"></h2>' +
        '<div class="fa-meta" id="faMeta"></div>' +
      '</div>' +
      '<div class="fa-cont">' +
        '<span class="fa-cuenta" id="faCuenta"></span>' +
        '<span class="fa-puntos" id="faPuntos" aria-hidden="true"></span>' +
      '</div>' +
      '<div id="faTarjeta"></div>' +
      '<div class="fa-nav">' +
        '<button class="fa-btn" id="faAnt" type="button">' + IZQ + '<span>Anterior</span></button>' +
        '<button class="fa-btn sig" id="faSig" type="button"><span>Siguiente</span>' + DER + '</button>' +
      '</div>' +
    '</section>' +
    '<details class="fa-refs">' +
      '<summary><span class="fa-tag ref">Solo referencia</span><span>' + REF.length + ' técnicas que el PDF pide aprender en persona</span></summary>' +
      '<div class="fa-refs-in">' + REF.map(tarjetaRef).join('') + '</div>' +
    '</details>';

  const botones = Array.prototype.slice.call(vista.querySelectorAll('.fa-bl'));
  const $ = id => document.getElementById(id);
  const paso = $('faPaso'), ant = $('faAnt'), sig = $('faSig');

  function pintar() {
    const b = BLOQUES.find(x => x.k === estado.b) || BLOQUES[0];
    const pasos = pasosDe(b);
    let i = Math.min(Math.max(estado.i[b.k] || 0, 0), pasos.length - 1);
    estado.i[b.k] = i;

    botones.forEach(x => {
      const sel = x.dataset.k === b.k;
      x.setAttribute('aria-selected', sel ? 'true' : 'false');
      x.tabIndex = sel ? 0 : -1;
    });
    $('faBloque').textContent = b.nombre;
    $('faMeta').textContent = b.meta;

    const p = pasos[i];
    const nEj = b.lista.length;
    const offset = b.intro ? 1 : 0;
    $('faCuenta').textContent = p.intro
      ? 'Antes de los ' + nEj + ' ejercicios'
      : 'Ejercicio ' + (i - offset + 1) + ' de ' + nEj;
    $('faPuntos').innerHTML = pasos.map((x, j) =>
      '<i class="' + (x.intro ? 'in ' : '') + (j === i ? 'on' : j < i ? 'ya' : '') + '"></i>').join('');
    $('faTarjeta').innerHTML = p.intro ? tarjetaIntro(b) : tarjetaEj(p);

    ant.disabled = i === 0;
    const ult = i === pasos.length - 1;
    sig.disabled = ult;
    sig.querySelector('span').textContent = ult ? 'Fin del bloque' : 'Siguiente';
  }

  /* al cambiar de tarjeta, lleva la vista al inicio de la tarjeta */
  function alInicio() {
    const top = document.querySelector('header.top');
    const alto = top ? top.getBoundingClientRect().height : 0;
    const y = paso.getBoundingClientRect().top + window.scrollY - alto - 8;
    if (window.scrollY > y) window.scrollTo(0, Math.max(0, y));
  }

  function mover(d) {
    const b = BLOQUES.find(x => x.k === estado.b);
    const n = pasosDe(b).length;
    const nuevo = Math.min(Math.max(estado.i[b.k] + d, 0), n - 1);
    if (nuevo === estado.i[b.k]) return;
    estado.i[b.k] = nuevo;
    guardar(); pintar(); alInicio();
  }
  ant.addEventListener('click', () => mover(-1));
  sig.addEventListener('click', () => mover(1));

  botones.forEach((b, i) => {
    b.addEventListener('click', () => {
      if (estado.b === b.dataset.k) return;
      estado.b = b.dataset.k; guardar(); pintar(); alInicio();
    });
    b.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      e.preventDefault();
      const s = botones[(i + d + botones.length) % botones.length];
      s.focus(); s.click();
    });
  });

  pintar();
})();
