/* ============================================================
   RUTINA FACIAL — guía de consulta para casa
   ------------------------------------------------------------
   Independiente de la Rutina y de Ejercicio: no usa sus
   variables ni su guardado. El bloque elegido vive solo en
   memoria. Mostrar/ocultar la pestaña lo hace vistas.js.
   ============================================================ */

(function () {
  'use strict';

  const vista = document.getElementById('facial');
  if (!vista || typeof FACIAL_BLOQUES === 'undefined') return;

  const EJ = FACIAL_EJ, BLOQUES = FACIAL_BLOQUES, G = FACIAL_GUIA;

  /* bloque inicial según la hora de Ciudad de México: mañana → A, después → B */
  function horaMx() {
    try {
      const h = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', hour: 'numeric', hourCycle: 'h23' }).format(new Date());
      const n = parseInt(h, 10);
      if (!isNaN(n)) return n;
    } catch (e) { /* respaldo: hora local */ }
    return new Date().getHours();
  }
  let elegido = horaMx() < 14 ? 'A' : 'B';

  /* ---------- plantilla ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const RELOJ = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>';
  const ALTO  = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 3h7L21 8.5v7L15.5 21h-7L3 15.5v-7z"/><path d="M12 8v5M12 16.5v.01"/></svg>';
  const MANO  = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/></svg>';
  const OJO   = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/></svg>';

  const TAG = {
    propuesta:  '<span class="fa-tag">Propuesta del PDF</span>',
    referencia: '<span class="fa-tag ref">Solo referencia</span>'
  };

  function lista(arr, ordenada) {
    const t = ordenada ? 'ol' : 'ul';
    return '<' + t + '>' + arr.map(x => '<li>' + esc(x) + '</li>').join('') + '</' + t + '>';
  }

  function tarjeta(item) {
    const e = EJ[item.e];
    const ref = e.tipo === 'referencia';
    const dosis = item.dosis || e.dosis;

    const detalle =
      '<p class="fa-para">' + esc(e.para) + '</p>' +
      '<div class="fa-stats">' + dosis.map(d =>
        '<div class="fa-st"><b class="num">' + esc(d[0]) + '</b><span>' + esc(d[1]) + '</span></div>'
      ).join('') + '</div>' +
      '<div class="fa-desc">' + RELOJ + '<span>Descanso: <b>' + esc(e.desc) + '</b></span></div>' +
      (e.pos ? '<p class="fa-pos"><b>Posición.</b> ' + esc(e.pos) + '</p>' : '') +
      (e.previo ? '<div class="fa-previo"><div class="lab">' + esc(e.previo.t) + '</div><p>' + esc(e.previo.p) + '</p></div>' : '') +
      (e.escalera ? '<div class="fa-sub">Escalera de ayuda</div><ul class="fa-esc">' +
        e.escalera.map(n => '<li><span class="num">' + n[0] + '</span><p>' + esc(n[1]) + '</p></li>').join('') + '</ul>' : '') +
      '<div class="fa-sub">Pasos</div>' + '<div class="fa-pasos">' + lista(e.pasos, true) + '</div>' +
      (e.frases ? '<div class="fa-sub">Frases</div><ul class="fa-frases">' + e.frases.map(f => '<li>«' + esc(f) + '»</li>').join('') + '</ul>' : '') +
      '<div class="fa-ver">' + OJO + '<p>' + esc(e.ver) + '</p></div>';

    return '<li class="fa-it' + (ref ? ' ref' : '') + '">' +
      '<div class="fa-top">' +
        '<span class="fa-num num" aria-hidden="true">' + esc(e.num) + '</span>' +
        '<div class="fa-tt"><h3 class="fa-n">' + esc(e.n) + '</h3>' + TAG[e.tipo] + '</div>' +
      '</div>' +
      (ref
        ? '<div class="fa-aviso">' + MANO + '<p>' + esc(e.aviso) + '</p></div>' +
          '<details class="fa-det"><summary>Ver cómo lo describe el PDF</summary>' + detalle + '</details>'
        : detalle) +
      '<div class="fa-parar">' +
        '<div class="lab">' + ALTO + 'Señales para parar</div>' + lista(e.parar) +
      '</div>' +
      (e.cond ? '<p class="fa-cond">' + esc(e.cond) + '</p>' : '') +
    '</li>';
  }

  vista.innerHTML =
    '<div class="fa-lado">' +
      '<section class="fa-intro" aria-labelledby="faTit">' +
        '<span class="fa-estado">Rutina propuesta en el PDF</span>' +
        '<h2 id="faTit">Rutina facial</h2>' +
        '<p>Todavía no está confirmado qué ejercicios te enseñaron ni qué dosis te indicaron. Esto es lo que propone el documento, tal cual.</p>' +
        '<div class="fa-cifras">' +
          '<div><b class="num">≈ 24 min</b><span>plan completo, estimación del PDF</span></div>' +
          '<div><b class="num">5–6 min</b><span>de movimiento activo</span></div>' +
        '</div>' +
        '<p class="fa-nota">No es una meta diaria: si terminas las series o un ejercicio te pide parar, terminaste. No hace falta rellenar el tiempo.</p>' +
        '<div class="fa-ley">' + TAG.propuesta + '<span>para hacer en casa según el PDF</span></div>' +
        '<div class="fa-ley">' + TAG.referencia + '<span>el PDF pide enseñanza presencial</span></div>' +
      '</section>' +
      '<nav class="fa-bloques" role="tablist" aria-label="Bloque">' +
        BLOQUES.map(b =>
          '<button class="fa-bl" type="button" role="tab" data-k="' + b.k + '" aria-controls="faLista">' +
            '<span class="l">' + esc(b.corto) + '</span><span class="f">' + (b.k === 'D' ? 'Revisiones' : 'Bloque ' + b.k) + '</span>' +
          '</button>'
        ).join('') +
      '</nav>' +
    '</div>' +
    '<div class="fa-main">' +
      '<div class="fa-head">' +
        '<h2 id="faBloque"></h2>' +
        '<div class="fa-meta num" id="faMeta"></div>' +
        '<p class="fa-bnota" id="faNota"></p>' +
      '</div>' +
      '<ol class="fa-lista" id="faLista" aria-labelledby="faBloque"></ol>' +
      '<section class="fa-reglas" aria-labelledby="faReglas">' +
        '<h2 id="faReglas">Para todos los ejercicios</h2>' +
        '<div class="fa-card"><h3>Antes de empezar</h3><p>' + esc(G.comun) + '</p><p><b>Esfuerzo.</b> ' + esc(G.esfuerzo) + '</p></div>' +
        '<div class="fa-card alto"><h3>' + ALTO + 'Si una repetición falla</h3><p>' + esc(G.falla.que) + '</p>' + lista(G.falla.pasos, true) + '</div>' +
        '<div class="fa-card"><h3>Ya hiciste suficiente</h3><p>' + esc(G.suficiente) + '</p></div>' +
        '<div class="fa-card"><h3>Cuándo bajar</h3><p>' + esc(G.bajar) + '</p></div>' +
        '<div class="fa-card"><h3>Qué no hacer</h3>' + lista(G.noHacer) + '</div>' +
        '<div class="fa-card alto"><h3>' + ALTO + 'Para y consulta a tu médico si aparece algo nuevo</h3>' + lista(G.medico) + '</div>' +
      '</section>' +
    '</div>';

  const botones = Array.prototype.slice.call(vista.querySelectorAll('.fa-bl'));

  function pintar() {
    const b = BLOQUES.find(x => x.k === elegido) || BLOQUES[0];
    botones.forEach(x => {
      const sel = x.dataset.k === b.k;
      x.setAttribute('aria-selected', sel ? 'true' : 'false');
      x.tabIndex = sel ? 0 : -1;
    });
    document.getElementById('faBloque').textContent = b.nombre;
    document.getElementById('faMeta').textContent = b.tiempo + ' estimado · ' + b.activo;
    document.getElementById('faNota').textContent = b.nota;
    document.getElementById('faLista').innerHTML = b.lista.map(tarjeta).join('');
  }

  botones.forEach((b, i) => {
    b.addEventListener('click', () => { elegido = b.dataset.k; pintar(); });
    b.addEventListener('keydown', e => {
      const paso = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!paso) return;
      e.preventDefault();
      const sig = botones[(i + paso + botones.length) % botones.length];
      sig.focus(); sig.click();
    });
  });

  pintar();
})();
