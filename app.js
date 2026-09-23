/* ============================================================
   Rutina de JP — lógica de la app
   Zona horaria fija: America/Mexico_City
   ============================================================ */

const TZ = 'America/Mexico_City';
const $ = s => document.querySelector(s);

/* ---------- hora y fecha en hora de Ciudad de México ---------- */
let FMT_HORA = null, FMT_DIA = null, FMT_MES = null;
try {
  FMT_HORA = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  FMT_DIA = new Intl.DateTimeFormat('es-MX', { timeZone: TZ, weekday: 'long' });
  FMT_MES = new Intl.DateTimeFormat('es-MX', { timeZone: TZ, day: 'numeric', month: 'long' });
} catch (e) { /* navegador viejo: se usa la hora local como respaldo */ }

function ahoraMX() {
  if (FMT_HORA) {
    try {
      const p = {};
      FMT_HORA.formatToParts(new Date()).forEach(x => { p[x.type] = x.value; });
      let h = parseInt(p.hour, 10); if (h === 24) h = 0;
      const m = parseInt(p.minute, 10), s = parseInt(p.second, 10);
      const fecha = p.year + '-' + p.month + '-' + p.day;
      const wd = new Date(fecha + 'T12:00:00Z').getUTCDay();
      return { fecha: fecha, h: h, m: m, min: h * 60 + m + s / 60, wd: wd };
    } catch (e) { /* cae al respaldo */ }
  }
  const d = new Date();
  const p2 = n => String(n).padStart(2, '0');
  return {
    fecha: d.getFullYear() + '-' + p2(d.getMonth() + 1) + '-' + p2(d.getDate()),
    h: d.getHours(), m: d.getMinutes(),
    min: d.getHours() * 60 + d.getMinutes() + d.getSeconds() / 60,
    wd: d.getDay()
  };
}

const diaDeHoy = () => POR_WD[ahoraMX().wd] || 'lunes';

/* ---------- estado guardado ---------- */
const CLAVE = 'rutina_v2';

function cargar(fecha) {
  try {
    const o = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (o && o.fecha === fecha && o.hechas) return o;
  } catch (e) { /* ignora */ }
  return { fecha: fecha, hechas: {} };
}
function guardar() { try { localStorage.setItem(CLAVE, JSON.stringify(estado)); } catch (e) { } }

let hoy = ahoraMX();
let estado = cargar(hoy.fecha);
let diaActivo = diaDeHoy();
let ultimoIndice = -2, ultimaFecha = hoy.fecha;
let ultimoDiaPintado = null, recienMarcado = null, ultimaVentana = '';

/* ---------- iconos (trazos de 24×24) ---------- */
const ICONOS = {
  sol:     '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4L6 18M18 6l1.4-1.4"/>',
  gota:    '<path d="M12 3.5s6 6.3 6 10.8a6 6 0 0 1-12 0C6 9.8 12 3.5 12 3.5z"/>',
  luna:    '<path d="M19.5 14.6A8 8 0 1 1 9.4 4.5a6.4 6.4 0 0 0 10.1 10.1z"/>',
  plato:   '<path d="M7 3v7.5M4.5 3v5a2.5 2.5 0 0 0 5 0V3M7 10.5V21M17.5 3c-2 1.2-3.5 3.6-3.5 6.8V13h3.5v8"/>',
  foco:    '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>',
  lapiz:   '<path d="M4 20l1-4.2L16.2 4.6a2 2 0 0 1 2.9 0l.3.3a2 2 0 0 1 0 2.9L8.2 19 4 20z"/><path d="M14.5 6.3l3.2 3.2"/>',
  birrete: '<path d="M2.5 9L12 4.5 21.5 9 12 13.5 2.5 9z"/><path d="M6.5 11v4.6c1.6 1.3 3.5 2 5.5 2s3.9-.7 5.5-2V11"/>',
  pasos:   '<circle cx="13.5" cy="4.5" r="1.8"/><path d="M8.5 21l2.3-6.2 3.2 2.7V21M10.8 14.8l1.2-5.3 3 2.8h3.2M12 9.5l-3.3 1.2L7 13.5"/>',
  pulso:   '<path d="M3 12h4l2.2-5.5 4.3 11 2.3-5.5H21"/>',
  pesa:    '<path d="M6.5 7v10M3.5 9.5v5M17.5 7v10M20.5 9.5v5M6.5 12h11"/>',
  casa:    '<path d="M3.5 11L12 4l8.5 7"/><path d="M6 9.5V20h12V9.5"/><path d="M10 20v-5h4v5"/>',
  taza:    '<path d="M4 9.5h12V14a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9.5z"/><path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16M8 3.5v2.5M12 3.5v2.5"/>',
  pausa:   '<path d="M9.5 7v10M14.5 7v10"/>',
  hoja:    '<path d="M5 19.5C5 11 10 5 20 4.5c0 10-6 15-14 15"/><path d="M5 19.5l7.5-7.5"/>',
  bolsa:   '<path d="M5 8h14l-1.2 12H6.2L5 8z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  check:   '<path d="M5 12.5l4.5 4.5L19 7.5" stroke-width="2.6"/>',
  flecha:  '<path d="M5 12h14M13 6l6 6-6 6"/>'
};
const icono = n => '<svg viewBox="0 0 24 24" aria-hidden="true">' + (ICONOS[n] || ICONOS.sol) + '</svg>';
const catDe = b => CAT[b.c] || CAT.rutina;
const iconoDe = b => icono(b.i || catDe(b).i);

/* ---------- utilidades ---------- */
function indiceActual(bloques, min) {
  for (let i = 0; i < bloques.length; i++) {
    const b = bloques[i];
    if (b.e <= b.s || b.ventana) continue;   // la ventana de fisio no es "lo que pasa ahora"
    if ((min >= b.s && min < b.e) || (min + 1440 >= b.s && min + 1440 < b.e)) return i;
  }
  return -1;
}
function textoDur(min) {
  min = Math.max(0, Math.round(min));
  const h = Math.floor(min / 60), m = min % 60;
  if (h > 0 && m > 0) return h + ' h ' + m + ' min';
  if (h > 0) return h + (h === 1 ? ' hora' : ' horas');
  return m + ' min';
}
const mayus = s => s.charAt(0).toUpperCase() + s.slice(1);
const esHoy = () => diaActivo === diaDeHoy();

// bloques que cuentan para el progreso: dormir no se "hace" y los márgenes
// son transiciones
const seMarca = b => b.c !== 'sueno' && b.c !== 'margen' && b.e > b.s;
const cuentan = d => d.bloques.filter(b => seMarca(b) && claveDe(b) === b.s);

function hechasDe(clave) {
  return (estado.hechas && estado.hechas[clave]) ? estado.hechas[clave] : [];
}
// se guarda la hora de inicio del bloque (no su posición), así cambiar
// un horario no desplaza lo que ya marcaste
function alternar(inicio) {
  if (!esHoy()) return;
  const k = diaActivo;
  if (!estado.hechas[k]) estado.hechas[k] = [];
  const arr = estado.hechas[k], p = arr.indexOf(inicio);
  if (p > -1) arr.splice(p, 1); else { arr.push(inicio); recienMarcado = inicio; }
  guardar();
  pintar();
  recienMarcado = null;
  if (window.Avisos) window.Avisos.cambio();
}

// avance (0–100) del bloque en curso
function avance(b, min) {
  let ahora = min; if (ahora < b.s) ahora += 1440;
  return Math.min(100, Math.max(0, (ahora - b.s) / (b.e - b.s) * 100));
}

// siguiente actividad real (los márgenes no cuentan como actividad)
function siguiente(d, idx) {
  const L = d.bloques.length;
  for (let j = idx + 1; j < L; j++) {
    const b = d.bloques[j];
    if (b.e > b.s && b.c !== 'margen') return b;
  }
  // después de dormir: lo primero del día siguiente (o de hoy, pasada la medianoche)
  const actual = d.bloques[idx];
  const manana = (actual && hoy.min >= actual.s) ? DIAS[POR_WD[(hoy.wd + 1) % 7]] : d;
  return (manana || d).bloques[0];
}

// número de día del mes de cada día de esta semana (lunes a domingo)
function numeroDelDia(k) {
  const base = new Date(hoy.fecha + 'T12:00:00Z');
  const desdeLunes = (hoy.wd + 6) % 7;
  const objetivo = (DIAS[k].wd[0] + 6) % 7;
  base.setUTCDate(base.getUTCDate() + objetivo - desdeLunes);
  return base.getUTCDate();
}

/* ---------- selector de días ---------- */
const contDias = $('#dias');
ORDEN.forEach(k => {
  const d = DIAS[k];
  const b = document.createElement('button');
  b.className = 'day';
  b.type = 'button';
  b.setAttribute('role', 'tab');
  b.dataset.k = k;
  b.setAttribute('aria-label', d.nombre);
  b.innerHTML = '<span class="l">' + d.corto + '</span><span class="n num"></span><span class="dot"></span>';
  b.addEventListener('click', () => { diaActivo = k; pintar(); });
  contDias.appendChild(b);
});

$('#volver').addEventListener('click', () => {
  diaActivo = diaDeHoy();
  pintar();
  irAlActual();
});

$('#ahora').addEventListener('click', irAlActual);
$('#ahora').addEventListener('keydown', e => {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); irAlActual(); }
});

function irAlActual() {
  const el = document.querySelector('.row.now-row');
  if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

$('#linea').addEventListener('click', e => {
  const t = e.target.closest('.tick');
  if (t) alternar(parseInt(t.dataset.s, 10));
});

/* ---------- leyenda y anclas ---------- */
(function leyenda() {
  const el = $('#leyenda');
  LEYENDA.forEach(c => {
    const s = document.createElement('span');
    s.innerHTML = '<i style="background:' + CAT[c].c + '"></i>' + CAT[c].l;
    el.appendChild(s);
  });
})();

(function anclas() {
  const rango = (dia, nombre) => {
    const b = DIAS[dia].bloques.find(x => x.a === nombre);
    return b ? fmt(b.s) + '–' + fmt(b.e) : '';
  };
  const el = $('#anclas');
  const li = html => { const l = document.createElement('li'); l.innerHTML = html; el.appendChild(l); };
  li('Despertar <b>' + fmt(toMin(CONFIG.despertar)) + '</b> · dormido <b>' + fmt(toMin(CONFIG.dormido)) + '</b>');
  li('Lunes a viernes: <b>ducha antes de clase</b>. Fin de semana: ducha después del entreno');
  li('Fisio lunes a viernes · <b>hora variable</b> dentro de <b>' + VENTANA_FISIO + '</b>');
  li('Robótica <b>miércoles ' + rango('miercoles', 'Robótica') + '</b> · Teatro <b>jueves ' + rango('jueves', 'Teatro') + '</b>');
  li('<b>Tareas escolares</b> en su propio bloque; habilidad es solo habilidad');
  li('<b>Lunes al despertar:</b> pesaje en ayunas antes del agua → Excel, y riega las 2 plantas');
  li('Cena <b>' + fmt(toMin(CONFIG.cena)) + '</b> + reset de casa · lentes rojos <b>~' + LENTES + '</b> · celular lejos <b>' + CELULAR + '</b>');
  $('#footFisio').textContent = '(' + VENTANA_FISIO + ')';
})();

/* ---------- pintar ---------- */
function pintar() {
  hoy = ahoraMX();
  const d = DIAS[diaActivo];
  const propio = esHoy();
  const idx = propio ? indiceActual(d.bloques, hoy.min) : -1;
  ultimoIndice = idx;

  $('#focoDia').textContent = propio ? '' : ' · ' + d.nombre;

  document.querySelectorAll('.day').forEach(b => {
    b.setAttribute('aria-selected', b.dataset.k === diaActivo ? 'true' : 'false');
    b.classList.toggle('hoy', b.dataset.k === diaDeHoy());
    b.querySelector('.n').textContent = numeroDelDia(b.dataset.k);
  });
  $('#volver').classList.toggle('on', !propio);

  // avisos de configuración imposible
  const av = $('#aviso');
  if (d.avisos && d.avisos.length) {
    av.innerHTML = '<b>Ojo, este día no cuadra.</b><ul>' +
      d.avisos.map(a => '<li>' + a + '</li>').join('') +
      '</ul>Ajusta los horarios en <b>rutina.js</b>.';
    av.classList.add('on');
  } else {
    av.classList.remove('on');
  }

  pintarAhora(d, idx, propio);
  pintarProgreso(d, propio);
  pintarLinea(d, idx, propio);
}

function pintarAhora(d, idx, propio) {
  const hero = $('#ahora');
  hero.classList.toggle('otro', idx < 0);
  if (idx > -1) {
    const b = d.bloques[idx], cat = catDe(b);
    let ahora = hoy.min; if (ahora < b.s) ahora += 1440;
    const falta = b.e - ahora;
    hero.style.setProperty('--cat', cat.c);
    $('#nLab').textContent = 'Ahora';
    $('#nCat').innerHTML = cat.l === b.a ? '' : iconoDe(b) + '<span>' + cat.l + '</span>';
    $('#nAct').textContent = b.a;
    $('#nSub').textContent = b.sub || '';
    $('#nRng').textContent = fmt(b.s) + ' – ' + fmt(b.e);
    $('#nLeft').innerHTML = 'Quedan <b>' + textoDur(falta) + '</b>';
    $('#nBar').style.width = avance(b, hoy.min) + '%';

    const sig = siguiente(d, idx), sc = catDe(sig);
    let en = sig.s - hoy.min; if (en < 0) en += 1440;
    $('#nNextIc').innerHTML = iconoDe(sig);
    $('#nNextIc').style.setProperty('--nx', sc.c);
    $('#nNextLab').textContent = 'Siguiente';
    $('#nNext').textContent = sig.a;
    $('#nNextHr').innerHTML = sig.ventana
      ? '<b>' + fmt(sig.s) + '–' + fmt(sig.e) + '</b><small>horario variable</small>'
      : '<b>' + fmt(sig.s) + '</b><small>en ' + textoDur(en) + '</small>';
  } else {
    hero.style.removeProperty('--cat');
    $('#nLab').textContent = 'Otro día';
    $('#nCat').innerHTML = '';
    $('#nAct').textContent = d.nombre;
    $('#nSub').textContent = 'Estás viendo otro día' + (d.foco ? ' · foco: ' + d.foco.toLowerCase() : '');
    $('#nRng').textContent = '';
    $('#nLeft').textContent = '';
    $('#nBar').style.width = '0%';
    $('#nNextIc').innerHTML = icono('flecha');
    $('#nNextIc').style.setProperty('--nx', 'var(--accent)');
    $('#nNextLab').textContent = 'Tu día';
    $('#nNext').innerHTML = 'Toca <b>Volver a hoy</b> para ver tu día';
    $('#nNextHr').textContent = '';
  }
}

function pintarProgreso(d, propio) {
  const lista = cuentan(d);
  const total = lista.length;
  const marcadas = propio ? hechasDe(diaActivo) : [];
  const hechas = lista.filter(b => marcadas.indexOf(claveDe(b)) > -1).length;
  const pct = total ? Math.round(hechas / total * 100) : 0;

  $('#prog').style.display = propio ? '' : 'none';
  $('#conteo').textContent = propio ? hechas + '/' + total : '';
  $('#tituloLinea').textContent = propio ? 'Línea del día' : d.nombre;
  $('#focoLinea').textContent = d.foco ? 'Foco: ' + d.foco : '';
  if (!propio) return;

  $('#progBar').style.width = pct + '%';
  $('#ringPct').textContent = pct + '%';
  $('#progT').textContent = hechas + ' de ' + total + ' actividades hechas';

  const desp = toMin(CONFIG.despertar), dorm = toMin(CONFIG.dormido);
  let transcurrido;
  if (hoy.min < desp) transcurrido = 0;
  else if (hoy.min >= dorm) transcurrido = 100;
  else transcurrido = Math.round((hoy.min - desp) / (dorm - desp) * 100);
  $('#progS').textContent = 'Llevas ' + transcurrido + '% del día despierto';
  $('#diaPct').textContent = fmt(desp) + '–' + fmt(dorm);
  $('#diaBar').style.width = transcurrido + '%';
}

function pintarLinea(d, idx, propio) {
  const cont = $('#linea');
  const hechas = propio ? hechasDe(diaActivo) : [];
  let html = '', n = 0;

  d.bloques.forEach((b, i) => {
    if (b.e <= b.s) return;
    const cat = catDe(b), k = claveDe(b);
    const marcable = propio && seMarca(b);
    const hecho = marcable && hechas.indexOf(k) > -1;
    const clases = ['row', 'k-' + b.c];
    if (idx === i) clases.push('now-row');
    if (b.ventana) {
      clases.push('ventana');
      if (propio && hoy.min >= b.e) clases.push('past');
      else if (propio && hoy.min >= b.s) clases.push('abierta');
    } else if (idx > -1 && i < idx) clases.push('past');
    if (hecho) clases.push('done');
    if (hecho && k === recienMarcado) clases.push('pop');

    html += '<li class="' + clases.join(' ') + '" style="--cat:' + cat.c + ';--i:' + Math.min(n++, 14) + '">';
    html += '<div class="hr num">' + fmt(b.s) + '<span class="chip-now">Ahora</span></div>';
    html += '<div class="node"><span class="dot">' + (hecho ? icono('check') : iconoDe(b)) + '</span></div>';
    html += '<div class="item"><div class="txt">';
    html += '<div class="name">' + b.a + '</div>';
    if (b.c === 'margen') {
      html += '<div class="tags"><span class="dur">' + textoDur(b.e - b.s) + '</span></div>';
    } else if (b.ventana) {
      html += '<div class="tags"><span class="cat">' + cat.l + '</span>' +
              '<span class="chip-var">Horario variable · ' + fmt(b.s) + '–' + fmt(b.e) + '</span></div>';
    } else {
      html += '<div class="tags"><span class="cat">' + cat.l + '</span>';
      html += '<span class="dur">' + fmt(b.s) + '–' + fmt(b.e) + ' · ' + textoDur(b.e - b.s) + '</span>';
      if (b.variable) html += '<span class="chip-var">Horario variable</span>';
      html += '</div>';
    }
    if (b.sub) html += '<div class="note">' + b.sub + '</div>';
    if (idx === i) html += '<div class="mini"><i style="width:' + avance(b, hoy.min) + '%"></i></div>';
    html += '</div>';
    if (marcable) {
      html += '<button class="tick" type="button" data-s="' + k + '" aria-pressed="' + hecho + '" ' +
              'aria-label="' + (hecho ? 'Desmarcar ' : 'Marcar hecho: ') + b.a + '">' +
              '<i><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg></i></button>';
    }
    html += '</div></li>';
  });
  cont.innerHTML = html;

  // entrada suave solo al cambiar de día, no en cada refresco
  if (ultimoDiaPintado !== diaActivo) {
    if (ultimoDiaPintado !== null) {
      cont.classList.remove('enter');
      void cont.offsetWidth;
      cont.classList.add('enter');
      clearTimeout(pintarLinea.t);
      pintarLinea.t = setTimeout(() => cont.classList.remove('enter'), 900);
    }
    ultimoDiaPintado = diaActivo;
  }
}

/* ---------- reloj y refresco ---------- */
function latido() {
  const t = ahoraMX();

  $('#reloj').textContent = String(t.h).padStart(2, '0') + ':' + String(t.m).padStart(2, '0');
  if (FMT_DIA && FMT_MES) {
    try {
      // "Miércoles 23 sep" (completa en el tooltip) para que quepa en iPhone
      const ya = new Date(), completa = FMT_MES.format(ya);
      const corta = completa.replace(/ de (\S{3})\S*$/, ' $1');
      $('#fecha').textContent = mayus(FMT_DIA.format(ya)) + ' ' + corta;
      $('#fecha').title = mayus(FMT_DIA.format(ya)) + ' ' + completa;
    } catch (e) { }
  }

  // cambió el día natural: reinicia el progreso y vuelve a hoy
  if (t.fecha !== ultimaFecha) {
    ultimaFecha = t.fecha;
    estado = cargar(t.fecha);
    diaActivo = diaDeHoy();
    pintar();
    return;
  }

  hoy = t;
  if (!esHoy()) return;

  const d = DIAS[diaActivo];
  const idx = indiceActual(d.bloques, t.min);
  // también se repinta cuando se abre o cierra la ventana de fisio
  const ventana = d.bloques.filter(b => b.ventana).map(b => t.min < b.s ? 0 : t.min < b.e ? 1 : 2).join();
  if (idx !== ultimoIndice || ventana !== ultimaVentana) { ultimaVentana = ventana; pintar(); return; }
  pintarAhora(d, idx, true);
  pintarProgreso(d, true);
  const mini = document.querySelector('.row.now-row .mini i');
  if (mini && idx > -1) mini.style.width = avance(d.bloques[idx], t.min) + '%';
}

pintar();
latido();
setInterval(latido, 15000);
setTimeout(irAlActual, 400);

// al volver a la app (iPhone la congela en segundo plano) refresca al instante
document.addEventListener('visibilitychange', () => { if (!document.hidden) latido(); });

/* ---------- funciona sin internet ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
}
