/* ============================================================
   Rutina de JP — lógica de la app
   Zona horaria fija: America/Mexico_City
   ============================================================ */

const TZ = 'America/Mexico_City';
const $ = s => document.querySelector(s);

/* ---------- hora y fecha en hora de Ciudad de México ---------- */
let FMT_HORA = null, FMT_FECHA = null;
try {
  FMT_HORA = new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
  FMT_FECHA = new Intl.DateTimeFormat('es-MX', {
    timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long'
  });
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

/* ---------- utilidades ---------- */
function indiceActual(bloques, min) {
  for (let i = 0; i < bloques.length; i++) {
    const b = bloques[i];
    if (b.e <= b.s) continue;
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

// bloques que cuentan para el progreso (dormir no se "hace")
const cuentan = d => d.bloques.filter(b => b.c !== 'sueno' && b.e > b.s);

function hechasDe(clave) {
  return (estado.hechas && estado.hechas[clave]) ? estado.hechas[clave] : [];
}
// se guarda la hora de inicio del bloque (no su posición), así cambiar
// el horario de la fisio no desplaza lo que ya marcaste
function alternar(inicio) {
  if (!esHoy()) return;
  const k = diaActivo;
  if (!estado.hechas[k]) estado.hechas[k] = [];
  const arr = estado.hechas[k], p = arr.indexOf(inicio);
  if (p > -1) arr.splice(p, 1); else arr.push(inicio);
  guardar();
  pintar();
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
  b.innerHTML = '<span class="l">' + d.corto + '</span><span class="dot"></span>';
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
  const A = CONFIG.acupuntura, F = CONFIG.fisio;
  const salida = fmt(toMin(A.hora) - A.ida);
  const vuelta = fmt(toMin(A.hora) + A.duracion + A.regreso);
  const finFisio = fmt(toMin(F.inicio) + F.duracion);
  const el = $('#anclas');
  const li = html => { const l = document.createElement('li'); l.innerHTML = html; el.appendChild(l); };
  li('Despertar <b>' + fmt(toMin(CONFIG.despertar)) + '</b> · dormido <b>' + fmt(toMin(CONFIG.dormido)) + '</b>');
  li('Fisio lunes a viernes <b>' + fmt(toMin(F.inicio)) + '–' + finFisio + '</b>' +
     (F.confirmado ? '' : ' <span style="color:var(--warn)">(por confirmar, ventana ' + F.ventana[0] + '–' + F.ventana[1] + ')</span>'));
  li('Acupuntura L·X·V <b>' + fmt(toMin(A.hora)) + '–' + fmt(toMin(A.hora) + A.duracion) +
     '</b> · salir ' + salida + ' · en casa ' + vuelta);
  li('<b>Lunes al despertar:</b> pesaje en ayunas antes del agua → Excel');
  li('Lentes rojos <b>~20:40</b> · celular lejos <b>22:10</b>');
})();

/* ---------- pintar ---------- */
function pintar() {
  hoy = ahoraMX();
  const d = DIAS[diaActivo];
  const propio = esHoy();
  const idx = propio ? indiceActual(d.bloques, hoy.min) : -1;
  ultimoIndice = idx;

  $('#focoDia').textContent = propio ? '' : '· ' + d.nombre;

  document.querySelectorAll('.day').forEach(b => {
    b.setAttribute('aria-selected', b.dataset.k === diaActivo ? 'true' : 'false');
    b.classList.toggle('hoy', b.dataset.k === diaDeHoy());
  });
  $('#volver').classList.toggle('on', !propio);

  // avisos de configuración imposible
  const av = $('#aviso');
  if (d.avisos && d.avisos.length) {
    av.innerHTML = '<b>Ojo, este día no cuadra.</b><ul>' +
      d.avisos.map(a => '<li>' + a + '</li>').join('') +
      '</ul>Ajusta la hora de la fisio o de la acupuntura en <b>rutina.js</b>.';
    av.classList.add('on');
  } else {
    av.classList.remove('on');
  }

  pintarAhora(d, idx, propio);
  pintarProgreso(d, propio);
  pintarLinea(d, idx, propio);
}

function pintarAhora(d, idx, propio) {
  if (idx > -1) {
    const b = d.bloques[idx];
    let ahora = hoy.min; if (ahora < b.s) ahora += 1440;
    const total = b.e - b.s, falta = b.e - ahora;
    $('#nAct').textContent = b.a;
    $('#nSub').textContent = b.sub || CAT[b.c].l;
    $('#nRng').textContent = fmt(b.s) + ' – ' + fmt(b.e);
    $('#nLeft').innerHTML = 'Faltan <b>' + textoDur(falta) + '</b>';
    $('#nBar').style.width = Math.min(100, Math.max(0, (ahora - b.s) / total * 100)) + '%';
    const sig = d.bloques[idx + 1] || d.bloques[0];
    $('#nNext').innerHTML = 'Sigue: <b>' + sig.a + '</b>';
    $('#nNextHr').textContent = fmt(sig.s);
  } else {
    $('#nAct').textContent = d.nombre;
    $('#nSub').textContent = 'Estás viendo otro día';
    $('#nRng').textContent = '';
    $('#nLeft').textContent = '';
    $('#nBar').style.width = '0%';
    $('#nNext').innerHTML = 'Toca <b>Volver a hoy</b> para ver tu día';
    $('#nNextHr').textContent = '';
  }
}

function pintarProgreso(d, propio) {
  const lista = cuentan(d);
  const total = lista.length;
  const hechas = propio ? hechasDe(diaActivo).length : 0;
  const pct = total ? Math.round(hechas / total * 100) : 0;

  $('#prog').style.display = propio ? 'flex' : 'none';
  $('#conteo').textContent = propio ? hechas + '/' + total : '';
  $('#tituloLinea').textContent = propio ? 'Línea del día' : d.nombre;
  if (!propio) return;

  $('#ring').style.setProperty('--p', pct);
  $('#ringPct').textContent = pct + '%';
  $('#progT').textContent = hechas + ' de ' + total + ' actividades hechas';

  const desp = toMin(CONFIG.despertar), dorm = toMin(CONFIG.dormido);
  let transcurrido;
  if (hoy.min < desp) transcurrido = 0;
  else if (hoy.min >= dorm) transcurrido = 100;
  else transcurrido = Math.round((hoy.min - desp) / (dorm - desp) * 100);
  $('#progS').textContent = 'Llevas ' + transcurrido + '% del día despierto';
}

function pintarLinea(d, idx, propio) {
  const cont = $('#linea');
  cont.innerHTML = '';
  const hechas = propio ? hechasDe(diaActivo) : [];

  d.bloques.forEach((b, i) => {
    if (b.e <= b.s) return;
    const row = document.createElement('div');
    const clases = ['row'];
    if (idx === i) clases.push('now-row');
    if (idx > -1 && i < idx) clases.push('past');
    if (propio && hechas.indexOf(b.s) > -1) clases.push('done');
    row.className = clases.join(' ');

    const color = (CAT[b.c] || CAT.rutina).c;
    const etiqueta = (CAT[b.c] || CAT.rutina).l;

    let html = '';
    if (idx === i) html += '<span class="chip-now">AHORA</span>';
    html += '<div class="hr num">' + fmt(b.s) + '</div>';
    html += '<div class="item" style="--cat:' + color + '">';
    html += '<div class="txt">';
    html += '<div class="name">' + b.a + '</div>';
    html += '<div class="tags"><span class="cat">' + etiqueta + '</span>';
    html += '<span class="dur">' + fmt(b.s) + '–' + fmt(b.e) + ' · ' + textoDur(b.e - b.s) + '</span>';
    if (b.flexible) html += '<span class="flexchip">Flexible</span>';
    html += '</div>';
    if (b.sub) html += '<div class="note">' + b.sub + '</div>';
    html += '</div>';
    if (propio && b.c !== 'sueno') {
      html += '<button class="tick" type="button" data-s="' + b.s + '" aria-label="Marcar ' + b.a + '">' +
              '<i><svg viewBox="0 0 24 24"><polyline points="4 12 10 18 20 6"/></svg></i></button>';
    }
    html += '</div>';
    row.innerHTML = html;
    cont.appendChild(row);
  });

  cont.querySelectorAll('.tick').forEach(btn => {
    btn.addEventListener('click', () => alternar(parseInt(btn.dataset.s, 10)));
  });
}

/* ---------- reloj y refresco ---------- */
function latido() {
  const t = ahoraMX();

  $('#reloj').textContent = String(t.h).padStart(2, '0') + ':' + String(t.m).padStart(2, '0');
  if (FMT_FECHA) {
    try { $('#fecha').textContent = mayus(FMT_FECHA.format(new Date())); } catch (e) { }
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
  if (idx !== ultimoIndice) { pintar(); return; }
  pintarAhora(d, idx, true);
  pintarProgreso(d, true);
}

pintar();
latido();
setInterval(latido, 15000);
setTimeout(irAlActual, 400);

/* ---------- funciona sin internet ---------- */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
}
