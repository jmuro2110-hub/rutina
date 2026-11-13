/* ============================================================
   EJERCICIO — guía de entreno
   ------------------------------------------------------------
   Independiente de la Rutina: no usa sus variables, no toca su
   guardado (localStorage) y no cambia su día seleccionado.
   Las pestañas (mostrar/ocultar cada sección) están en vistas.js.
   ============================================================ */

(function () {
  'use strict';

  const DIAS = EJERCICIO_DIAS;
  const vista = document.getElementById('ejercicio');
  if (!vista) return;

  /* ---------- día de la semana (hora de Ciudad de México) ---------- */
  function wdHoy() {
    try {
      const s = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Mexico_City', weekday: 'short' }).format(new Date());
      const i = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(s);
      if (i > -1) return i;
    } catch (e) { /* respaldo: hora local */ }
    return new Date().getDay();
  }
  // hoy si es día de entreno; si no, el siguiente
  function diaInicial() {
    const w = wdHoy();
    for (let i = 0; i < 7; i++) {
      const d = DIAS.find(x => x.wd === (w + i) % 7);
      if (d) return d.k;
    }
    return DIAS[0].k;
  }

  // el día elegido aquí vive solo en memoria y solo en Ejercicio
  let elegido = diaInicial();

  /* ---------- plantilla ---------- */
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const RELOJ = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2M9.5 2.5h5"/></svg>';
  const SUBIR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';

  vista.innerHTML =
    '<nav class="ej-dias" id="ejDias" role="tablist" aria-label="Día de entrenamiento">' +
      DIAS.map(d =>
        '<button class="ej-dia" type="button" role="tab" data-k="' + d.k + '" aria-controls="ejLista" aria-label="' + esc(d.nombre + ' · ' + d.foco) + '">' +
          '<span class="l">' + esc(d.corto) + '</span><span class="f">' + esc(d.fc || d.foco) + '</span><span class="dot"></span>' +
        '</button>'
      ).join('') +
    '</nav>' +
    '<div class="ej-main">' +
      '<div class="ej-head">' +
        '<div><h2 id="ejTitulo"></h2><div class="ej-foco" id="ejFoco"></div></div>' +
        '<span class="ej-c num" id="ejConteo"></span>' +
      '</div>' +
      '<ol class="ej-lista" id="ejLista" aria-labelledby="ejTitulo"></ol>' +
    '</div>';

  const botones = Array.prototype.slice.call(vista.querySelectorAll('.ej-dia'));

  function tarjeta(e, i) {
    return '<li class="ej-it">' +
      '<span class="ej-num num" aria-hidden="true">' + (i + 1) + '</span>' +
      '<div class="ej-body">' +
        '<h3 class="ej-n">' + esc(e.n) + '</h3>' +
        '<div class="ej-stats">' +
          '<div class="ej-st"><b class="num">' + e.s + '</b><span>series</span></div>' +
          '<div class="ej-st"><b class="num">' + esc(e.r) + '</b><span>reps' + (e.lado ? ' por ' + esc(e.lado) : '') + '</span></div>' +
        '</div>' +
        '<div class="ej-desc">' + RELOJ + '<span>Descanso <b>' + esc(e.d) + '</b></span></div>' +
        '<div class="ej-tope">' +
          '<div class="lab">' + SUBIR + 'Progresión</div>' +
          '<p>' + esc(e.p) + '</p>' +
        '</div>' +
      '</div>' +
    '</li>';
  }

  function pintar() {
    const d = DIAS.find(x => x.k === elegido) || DIAS[0];
    const hoy = wdHoy();
    botones.forEach(b => {
      const k = b.dataset.k;
      b.setAttribute('aria-selected', k === d.k ? 'true' : 'false');
      b.tabIndex = k === d.k ? 0 : -1;
      b.classList.toggle('hoy', DIAS.find(x => x.k === k).wd === hoy);
    });
    document.getElementById('ejTitulo').textContent = d.nombre;
    document.getElementById('ejFoco').textContent = d.foco;
    document.getElementById('ejConteo').textContent = d.lista.length + ' ejercicios';
    document.getElementById('ejLista').innerHTML = d.lista.map(tarjeta).join('');
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

  /* al abrir la pestaña (vistas.js), refresca el punto de "hoy" */
  document.addEventListener('vista:mostrar', e => { if (e.detail === 'ejercicio') pintar(); });

  pintar();
})();
