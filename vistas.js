/* ============================================================
   PESTAÑAS — Rutina / Ejercicio / Rutina facial
   ------------------------------------------------------------
   Solo oculta y muestra cada sección; no toca el guardado ni el
   día elegido de ninguna. Cada pestaña recuerda su scroll.
   ============================================================ */

(function () {
  'use strict';

  const SECC = {
    rutina:    { el: document.querySelector('main.wrap') },
    ejercicio: { el: document.getElementById('ejercicio'), clase: 'v-ej' },
    facial:    { el: document.getElementById('facial'),    clase: 'v-fa' }
  };
  const pestanas = Array.prototype.slice.call(document.querySelectorAll('.vistas [data-vista]'))
    .filter(t => SECC[t.dataset.vista] && SECC[t.dataset.vista].el);
  if (!SECC.rutina.el || pestanas.length < 2) return;

  let actual = 'rutina';
  const scroll = {};

  function mostrar(v) {
    if (v === actual || !SECC[v] || !SECC[v].el) return;
    scroll[actual] = window.scrollY || window.pageYOffset || 0;
    actual = v;
    Object.keys(SECC).forEach(k => {
      const s = SECC[k];
      if (!s.el) return;
      s.el.hidden = k !== v;
      if (s.clase) document.documentElement.classList.toggle(s.clase, k === v);
    });
    pestanas.forEach(t => {
      const sel = t.dataset.vista === v;
      t.setAttribute('aria-selected', sel ? 'true' : 'false');
      t.tabIndex = sel ? 0 : -1;
    });
    document.dispatchEvent(new CustomEvent('vista:mostrar', { detail: v }));
    window.scrollTo(0, scroll[v] || 0);
  }

  pestanas.forEach((t, i) => {
    t.addEventListener('click', () => mostrar(t.dataset.vista));
    t.addEventListener('keydown', e => {
      const paso = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!paso) return;
      e.preventDefault();
      const sig = pestanas[(i + paso + pestanas.length) % pestanas.length];
      sig.focus(); mostrar(sig.dataset.vista);
    });
  });
})();
