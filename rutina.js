/* ============================================================
   RUTINA DE JP — DATOS
   ------------------------------------------------------------
   PARA CAMBIAR LA HORA DE LA FISIOTERAPIA:
       edita CONFIG.fisio.inicio  (una sola línea, aquí abajo)
   PARA MOVER LA ACUPUNTURA:
       edita CONFIG.acupuntura.hora
   Todo lo demás se reacomoda solo.
   ============================================================ */

const CONFIG = {
  despertar: '7:00',
  dormido:   '22:40',

  // ---- FISIOTERAPIA (lunes a viernes, en casa, sin traslado) ----
  fisio: {
    inicio:     '14:30',            // <<< CAMBIA SOLO ESTO cuando confirmen el horario
    duracion:   60,
    ventana:    ['14:00', '16:00'], // rango en el que puede caer
    confirmado: false               // ponlo en true cuando ya sea definitivo
  },

  // ---- ACUPUNTURA (lunes, miércoles y viernes) ----
  acupuntura: {
    hora:     '17:30',  // hora de la sesión
    duracion: 60,       // sesión
    ida:      60,       // traslado de ida
    regreso:  60,       // traslado de regreso
    prep:     20        // buffer de preparación antes de salir
  }
};

/* ---------- utilidades de tiempo ---------- */
const toMin = t => { const p = String(t).split(':'); return (+p[0]) * 60 + (+p[1]); };
const fmt = m => {
  m = ((Math.round(m) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};

/* ---------- categorías ---------- */
const CAT = {
  rutina:     { c: '#7B8089', l: 'Rutina'     },
  higiene:    { c: '#7B8089', l: 'Higiene'    },
  transicion: { c: '#7B8089', l: 'Transición' },
  comida:     { c: '#A8823F', l: 'Comida'     },
  habilidad:  { c: '#4A7BB5', l: 'Habilidad'  },
  fisica:     { c: '#5B8C79', l: 'Físico'     },
  fisio:      { c: '#5B8C79', l: 'Fisio'      },
  salud:      { c: '#5B8C79', l: 'Salud'      },
  traslado:   { c: '#667181', l: 'Traslado'   },
  entreno:    { c: '#A45D3C', l: 'Entreno'    },
  ocio:       { c: '#6A6F79', l: 'Ocio'       },
  buffer:     { c: '#4B5058', l: 'Buffer'     },
  escuela:    { c: '#8A4F4A', l: 'Escuela'    },
  sueno:      { c: '#4F5A78', l: 'Sueño'      }
};
const LEYENDA = ['habilidad', 'escuela', 'entreno', 'fisio', 'comida', 'ocio', 'rutina', 'sueno'];

/* ---------- piezas reutilizables ---------- */
const MANANA = nota => ([
  { d: 10, a: 'Bloque 1 mañana',     c: 'rutina', sub: nota || 'Ropa, agua, pastilla, gotas' },
  { d: 10, a: 'Baño',                c: 'rutina', sub: 'Dientes, necesidades' },
  { d: 40, a: 'Creatina + desayuno', c: 'comida' }
]);

const DUCHA = () => ([
  { d: 30, a: 'Ducha + aseo',        c: 'higiene' },
  { d: 10, a: 'Buffer de arranque',  c: 'buffer', flex: true, min: 5 }
]);

const PREP_FISIO = () => ({ d: 15, a: 'Buffer / prep fisio', c: 'buffer', flex: true, min: 5 });

const FISIO = () => ({
  at: CONFIG.fisio.inicio,
  d:  CONFIG.fisio.duracion,
  a:  'Fisioterapia',
  c:  'fisio',
  flexible: !CONFIG.fisio.confirmado,
  sub: CONFIG.fisio.confirmado
    ? 'En casa'
    : 'Horario por confirmar · ventana ' + CONFIG.fisio.ventana[0] + '–' + CONFIG.fisio.ventana[1]
});

// Cadena completa de acupuntura: prep -> ida -> sesión -> regreso
const ACUPUNTURA = () => {
  const A = CONFIG.acupuntura;
  const salida = fmt(toMin(A.hora) - A.ida);
  return [
    { d: A.prep,    a: 'Buffer / prep salida', c: 'buffer', flex: true, min: 5 },
    { at: salida,   d: A.ida,      a: 'Traslado ida',    c: 'traslado' },
    { at: A.hora,   d: A.duracion, a: 'Acupuntura',      c: 'salud'    },
    { d: A.regreso, a: 'Traslado regreso', c: 'traslado' }
  ];
};

const NOCHE = () => ([
  { d: 55, a: 'Ocio / descanso', c: 'ocio', flex: true, min: 10 },
  { at: '20:40', d: 40, a: 'Cena', c: 'comida', sub: 'Lentes rojos ~20:40' },
  { d: 50,  a: 'Ocio / descanso', c: 'ocio' },
  { d: 10,  a: 'Celular lejos + cierre', c: 'transicion' },
  { d: 20,  a: 'Rutina de noche + película', c: 'rutina' },
  { d: 500, a: 'Sueño', c: 'sueno', sub: 'Dormido a las 22:40' }
]);

const FINDE = () => ([
  { d: 100, a: 'Rutina mañana + desayuno', c: 'rutina', sub: 'Lo preparas tú' },
  { d: 90,  a: 'Habilidad — bloque profundo', c: 'habilidad' },
  { d: 60,  a: 'Ocio / descanso', c: 'ocio', flex: true, min: 10 },
  { d: 15,  a: 'Colación 1', c: 'comida', sub: '3 panes + crema de cacahuate' },
  { d: 120, a: 'Ocio / descanso', c: 'ocio', flex: true, min: 10 },
  { d: 45,  a: 'Comida', c: 'comida' },
  { d: 50,  a: 'Buffer / digestión', c: 'buffer' },
  { d: 80,  a: 'ENTRENO (pesas)', c: 'entreno' },
  { d: 20,  a: 'Ducha', c: 'higiene' },
  { d: 15,  a: 'Colación 2', c: 'comida', sub: 'Post-entreno' },
  { d: 60,  a: 'Habilidad — bloque 2', c: 'habilidad' },
  { d: 165, a: 'Ocio / descanso', c: 'ocio', sub: 'Capricho a domicilio · lentes rojos ~20:40', flex: true, min: 20 },
  { at: '20:40', d: 40, a: 'Cena', c: 'comida' },
  { d: 50,  a: 'Ocio / descanso', c: 'ocio' },
  { d: 10,  a: 'Celular lejos + cierre', c: 'transicion' },
  { d: 20,  a: 'Rutina de noche + película', c: 'rutina' },
  { d: 500, a: 'Sueño', c: 'sueno', sub: 'Dormido a las 22:40' }
]);

/* ============================================================
   LOS DÍAS
   ============================================================ */
const PLANTILLAS = {

  lunes: {
    nombre: 'Lunes', corto: 'L', foco: 'Acupuntura', wd: [1],
    pasos: () => [
      ...MANANA('Pesaje en ayunas ANTES del agua → Excel'),
      ...DUCHA(),
      { d: 60, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'Tu mejor hora mental' },
      { at: '9:40',  d: 30, a: 'Matemáticas', c: 'escuela' },
      { d: 40, a: 'Caminadora + agua · respiro', c: 'fisica', flex: true, min: 15 },
      { at: '10:50', d: 30, a: 'Lógica', c: 'escuela' },
      { d: 40, a: 'Colación 1 + descanso', c: 'comida', sub: '3 panes + crema de cacahuate', flex: true, min: 15 },
      { at: '12:00', d: 30, a: 'Orientación', c: 'escuela' },
      { d: 60, a: 'Habilidad — bloque 2', c: 'habilidad' },
      { d: 45, a: 'Ocio / descanso', c: 'ocio', flex: true, min: 10 },
      PREP_FISIO(),
      FISIO(),
      { d: 40, a: 'Comida principal', c: 'comida', sub: 'Antes de salir' },
      ...ACUPUNTURA(),
      { d: 15, a: 'Colación 2', c: 'comida', sub: 'Post-acupuntura' },
      ...NOCHE()
    ]
  },

  martes: {
    nombre: 'Martes', corto: 'M', foco: 'Entreno', wd: [2],
    pasos: () => [
      ...MANANA(),
      { at: '8:00', d: 30, a: 'Religión', c: 'escuela', sub: 'Aprox. 8:10, dentro de este bloque' },
      ...DUCHA(),
      { d: 90, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'El bloque más largo de la semana' },
      { d: 10, a: 'Respiro / agua', c: 'buffer', flex: true, min: 5 },
      { at: '10:50', d: 30, a: 'Inglés', c: 'escuela' },
      { d: 20, a: 'Colación 1', c: 'comida', sub: '3 panes + crema de cacahuate' },
      { d: 70, a: 'Ocio / descanso', c: 'ocio', flex: true, min: 10 },
      { at: '12:50', d: 30, a: 'Dibujo II', c: 'escuela' },
      { d: 55, a: 'Ocio / descanso', c: 'ocio', flex: true, min: 10 },
      PREP_FISIO(),
      FISIO(),
      { d: 40, a: 'Comida principal', c: 'comida' },
      { d: 40, a: 'Buffer / digestión', c: 'buffer', sub: 'Gap pre-entreno' },
      { d: 80, a: 'ENTRENO (pesas)', c: 'entreno' },
      { d: 20, a: 'Ducha post-entreno', c: 'higiene' },
      { d: 15, a: 'Colación 2', c: 'comida', sub: 'Post-entreno' },
      { d: 60, a: 'Habilidad — bloque 2', c: 'habilidad' },
      ...NOCHE()
    ]
  },

  miercoles: {
    nombre: 'Miércoles', corto: 'X', foco: 'Acupuntura', wd: [3],
    pasos: () => [
      ...MANANA(),
      ...DUCHA(),
      { d: 60, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'Tu mejor hora mental' },
      { at: '9:40', d: 30, a: 'Historia', c: 'escuela' },
      { d: 20, a: 'Caminadora + agua', c: 'fisica', flex: true, min: 10 },
      { d: 60, a: 'Habilidad — bloque 2', c: 'habilidad' },
      { d: 30, a: 'Colación 1 + descanso', c: 'comida', sub: '3 panes + crema de cacahuate', flex: true, min: 15 },
      { at: '12:00', d: 30, a: 'Física III', c: 'escuela' },
      { d: 20, a: 'Respiro entre clases', c: 'buffer', flex: true, min: 5 },
      { at: '12:50', d: 30, a: 'Francés', c: 'escuela' },
      { d: 55, a: 'Ocio / descanso', c: 'ocio', flex: true, min: 10 },
      PREP_FISIO(),
      FISIO(),
      { d: 40, a: 'Comida principal', c: 'comida', sub: 'Antes de salir' },
      ...ACUPUNTURA(),
      { d: 15, a: 'Colación 2', c: 'comida', sub: 'Post-acupuntura' },
      ...NOCHE()
    ]
  },

  jueves: {
    nombre: 'Jueves', corto: 'J', foco: 'Entreno', wd: [4],
    pasos: () => [
      ...MANANA(),
      ...DUCHA(),
      { d: 60, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'Tu mejor hora mental' },
      { at: '9:40', d: 30, a: 'Teatro', c: 'escuela' },
      { d: 20, a: 'Respiro / agua', c: 'buffer', flex: true, min: 5 },
      { at: '10:30', d: 30, a: 'Computación', c: 'escuela' },
      { d: 30, a: 'Colación 1 + descanso', c: 'comida', sub: '3 panes + crema de cacahuate' },
      { d: 165, a: 'Ocio / descanso', c: 'ocio', sub: 'Tu bloque más libre de la semana', flex: true, min: 20 },
      PREP_FISIO(),
      FISIO(),
      { d: 40, a: 'Comida principal', c: 'comida' },
      { d: 40, a: 'Buffer / digestión', c: 'buffer', sub: 'Gap pre-entreno' },
      { d: 80, a: 'ENTRENO (pesas)', c: 'entreno' },
      { d: 20, a: 'Ducha post-entreno', c: 'higiene' },
      { d: 15, a: 'Colación 2', c: 'comida', sub: 'Post-entreno' },
      { d: 60, a: 'Habilidad — bloque 2', c: 'habilidad' },
      ...NOCHE()
    ]
  },

  viernes: {
    nombre: 'Viernes', corto: 'V', foco: 'Acupuntura', wd: [5],
    pasos: () => [
      ...MANANA(),
      { at: '8:00', d: 30, a: 'Lengua Española', c: 'escuela' },
      ...DUCHA(),
      { d: 80, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'Tu mejor hora mental' },
      { at: '10:30', d: 30, a: 'Geografía', c: 'escuela' },
      { d: 15, a: 'Caminadora + agua', c: 'fisica', flex: true, min: 10 },
      { d: 15, a: 'Colación 1', c: 'comida', sub: '3 panes + crema de cacahuate' },
      { d: 60, a: 'Habilidad — bloque 2', c: 'habilidad' },
      { d: 20, a: 'Respiro entre clases', c: 'buffer', flex: true, min: 5 },
      { at: '12:50', d: 30, a: 'Deportes', c: 'escuela' },
      { d: 55, a: 'Ocio / descanso', c: 'ocio', flex: true, min: 10 },
      PREP_FISIO(),
      FISIO(),
      { d: 40, a: 'Comida principal', c: 'comida', sub: 'Antes de salir' },
      ...ACUPUNTURA(),
      { d: 15, a: 'Colación 2', c: 'comida', sub: 'Post-acupuntura' },
      ...NOCHE()
    ]
  },

  sabado:  { nombre: 'Sábado',  corto: 'S', foco: 'Entreno', wd: [6], nota: true, pasos: FINDE },
  domingo: { nombre: 'Domingo', corto: 'D', foco: 'Entreno', wd: [0], nota: true, pasos: FINDE }
};

/* ============================================================
   CONSTRUCTOR: convierte pasos (duraciones + anclas) en horarios.
   Las anclas (at) mandan. Los bloques marcados flex absorben el
   desfase, para que mover la fisio no rompa el resto del día.
   ============================================================ */
function construirDia(pasos, inicio) {
  const dur = pasos.map(p => p.d);
  const minimo = i => (pasos[i].min == null ? 5 : pasos[i].min);

  // Resuelve las anclas repartiendo el desfase entre los bloques flex
  // que haya desde el ancla anterior, empezando por el más cercano.
  for (let intento = 0; intento < pasos.length * 2 + 4; intento++) {
    let t = toMin(inicio), flex = [], ajustado = false;
    for (let i = 0; i < pasos.length; i++) {
      const p = pasos[i];
      if (p.at != null) {
        let delta = toMin(p.at) - t;
        for (let j = flex.length - 1; j >= 0 && delta !== 0; j--) {
          const k = flex[j];
          // al expandir cabe todo en el más cercano; al encoger, hasta su mínimo
          const cambio = delta > 0 ? delta : Math.max(delta, minimo(k) - dur[k]);
          if (cambio !== 0) { dur[k] += cambio; delta -= cambio; ajustado = true; }
        }
        if (ajustado) break;
        t = toMin(p.at);
        flex = [];
      }
      t += dur[i];
      if (p.flex) flex.push(i);
    }
    if (!ajustado) break;
  }

  const bloques = [], avisos = [];
  let t = toMin(inicio);
  pasos.forEach((p, i) => {
    if (p.at != null) {
      const objetivo = toMin(p.at);
      if (objetivo > t) bloques.push({ s: t, e: objetivo, a: 'Tiempo libre', c: 'ocio' });
      else if (objetivo < t) {
        const anterior = bloques.length ? bloques[bloques.length - 1].a : 'el bloque anterior';
        avisos.push('No cabe «' + anterior + '» antes de «' + p.a +
                    '»: faltan ' + (t - objetivo) + ' min.');
        // recorta hacia atrás para que la línea del día no se encime
        let limite = objetivo;
        for (let j = bloques.length - 1; j >= 0; j--) {
          const b = bloques[j];
          if (b.e <= limite) break;
          b.e = limite;
          if (b.s > b.e) b.s = b.e;
          limite = b.s;
        }
      }
      t = objetivo;
    }
    const b = {};
    for (const k in p) b[k] = p[k];
    b.s = t; b.e = t + dur[i];
    bloques.push(b);
    t += dur[i];
  });
  return { bloques: bloques, avisos: avisos };
}

/* Días ya calculados, listos para la app */
const DIAS = {};
Object.keys(PLANTILLAS).forEach(k => {
  const p = PLANTILLAS[k];
  const r = construirDia(p.pasos(), CONFIG.despertar);
  DIAS[k] = {
    clave: k, nombre: p.nombre, corto: p.corto, foco: p.foco,
    wd: p.wd, nota: !!p.nota, bloques: r.bloques, avisos: r.avisos
  };
});

const ORDEN = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
const POR_WD = {};
ORDEN.forEach(k => DIAS[k].wd.forEach(w => { POR_WD[w] = k; }));

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, CAT, LEYENDA, DIAS, ORDEN, POR_WD, toMin, fmt, construirDia, PLANTILLAS };
}
