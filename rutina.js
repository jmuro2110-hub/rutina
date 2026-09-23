/* ============================================================
   RUTINA DE JP — DATOS
   ------------------------------------------------------------
   Horas base (despertar, dormido, ventana de la fisio) en CONFIG.
   Cada día es una lista de pasos: duración (d) y, si es fijo,
   una hora ancla (at). Los pasos marcados flex (márgenes y
   tiempo libre) absorben el desfase: todo lo demás se acomoda solo.
   ============================================================ */

const CONFIG = {
  despertar: '6:55',
  dormido:   '23:00',
  cena:      '20:00',

  // ---- FISIOTERAPIA (lunes a viernes, en casa) ----
  // Una sola cita cuya hora exacta cambia cada día dentro de esta ventana.
  fisio: {
    ventana: ['11:30', '13:30']
  }
};

/* ---------- utilidades de tiempo ---------- */
const toMin = t => { const p = String(t).split(':'); return (+p[0]) * 60 + (+p[1]); };
const fmt = m => {
  m = ((Math.round(m) % 1440) + 1440) % 1440;
  return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
};

// derivadas del horario de sueño (misma distancia que antes)
const LENTES  = fmt(toMin(CONFIG.dormido) - 120);   // lentes rojos
const CELULAR = fmt(toMin(CONFIG.dormido) - 30);    // celular lejos
const SUENO   = 1440 - (toMin(CONFIG.dormido) - toMin(CONFIG.despertar));
const VENTANA_FISIO = fmt(toMin(CONFIG.fisio.ventana[0])) + '–' + fmt(toMin(CONFIG.fisio.ventana[1]));

/* ---------- categorías (c: color, l: etiqueta, i: icono) ---------- */
const CAT = {
  rutina:     { c: '#9B9A96', l: 'Rutina',       i: 'sol'      },
  higiene:    { c: '#6FB6D9', l: 'Higiene',      i: 'gota'     },
  transicion: { c: '#9B9A96', l: 'Transición',   i: 'luna'     },
  comida:     { c: '#F0A33A', l: 'Comida',       i: 'plato'    },
  habilidad:  { c: '#4F8BFF', l: 'Habilidad',    i: 'foco'     },
  tareas:     { c: '#F25C6E', l: 'Tareas',       i: 'lapiz'    },
  escuela:    { c: '#9C7BFF', l: 'Clase',        i: 'birrete'  },
  fisica:     { c: '#2EC4B6', l: 'Físico',       i: 'pasos'    },
  fisio:      { c: '#3DD68C', l: 'Fisio',        i: 'pulso'    },
  entreno:    { c: '#FF7A2F', l: 'Entreno',      i: 'pesa'     },
  casa:       { c: '#D4A373', l: 'Casa',         i: 'casa'     },
  libre:      { c: '#8E8C87', l: 'Tiempo libre', i: 'taza'     },
  margen:     { c: '#6B6A66', l: 'Margen',       i: 'pausa'    },
  sueno:      { c: '#7C83DB', l: 'Sueño',        i: 'luna'     }
};
const LEYENDA = ['escuela', 'tareas', 'habilidad', 'fisio', 'entreno', 'comida', 'casa', 'libre', 'rutina', 'sueno'];

/* ---------- piezas reutilizables ---------- */
const MARGEN = (d, a, min) => ({ d: d, a: a || 'Margen', c: 'margen', flex: true, min: min == null ? 0 : min });
const LIBRE  = (d, sub, min) => ({ d: d, a: 'Tiempo libre', c: 'libre', flex: true, min: min == null ? 10 : min, sub: sub });

const DUCHA_CLASE = () => ({ d: 25, a: 'Ducha + vestirte', c: 'higiene', sub: 'Antes de clase · dientes y listo' });

// Días con clase a las 8:00: ducha y desayuno rápido antes de entrar.
const MANANA_TEMPRANA = () => ([
  { d: 10, a: 'Arranque', c: 'rutina', sub: 'Agua, pastilla, gotas, baño' },
  DUCHA_CLASE(),
  { d: 25, a: 'Preparar + desayunar', c: 'comida', sub: 'Creatina · algo rápido, platos al fregadero' },
  MARGEN(5, 'Margen · listo para clase')
]);

// Días con la primera clase más tarde: mañana con calma.
const MANANA_CALMADA = (nota, extra) => ([
  { d: 10, a: 'Bloque 1 mañana', c: 'rutina', sub: nota || 'Agua, pastilla, gotas' },
  ...(extra || []),
  { d: 10, a: 'Baño', c: 'rutina', sub: 'Dientes, necesidades' },
  { d: 40, a: 'Preparar + desayunar', c: 'comida', sub: 'Creatina · cocinas, desayunas y dejas la cocina lista' },
  DUCHA_CLASE()
]);

const RECOGER = d => MARGEN(d, 'Pausa · recoge el desayuno', 5);

// Fisio: UNA cita cuya hora exacta cambia cada día dentro de la ventana.
// Es una "ventana": aparece como una sola actividad pero no ocupa tiempo en
// la línea del día, así que las clases de esa franja siguen en su lugar.
const FISIO = () => ({
  at: CONFIG.fisio.ventana[0],
  d: toMin(CONFIG.fisio.ventana[1]) - toMin(CONFIG.fisio.ventana[0]),
  a: 'Fisioterapia', c: 'fisio', ventana: true, variable: true,
  sub: 'Una sola cita · la hora exacta cambia cada día dentro de esta franja'
});
// huecos libres dentro de la ventana: margen donde puede caer la cita
const MARGEN_FISIO = (d, desdeInicio) => {
  const b = MARGEN(d, 'Margen · ventana de fisio');
  b.sub = 'Tu cita de fisio puede caer aquí';
  if (desdeInicio) b.at = CONFIG.fisio.ventana[0];
  return b;
};

const COMER = () => ({ d: 60, a: 'Preparar + comer', c: 'comida', sub: 'Cocinas, comes y dejas la cocina lista' });
const COLACION_1 = d => ({ d: d, a: 'Colación 1', c: 'comida', sub: '3 panes + crema de cacahuate' });
const TAREAS = (d, sub) => ({
  d: d, a: 'Tareas escolares', c: 'tareas',
  sub: sub || 'Solo escuela · lo que no quepa pasa al siguiente bloque de tareas, nunca a habilidad'
});
const HABILIDAD_2 = () => ({ d: 60, a: 'Habilidad — bloque 2', c: 'habilidad', sub: 'Solo habilidad · aquí no entran tareas' });
const ENTRENO = () => ([
  { d: 80, a: 'Entreno (pesas)', c: 'entreno' },
  { d: 20, a: 'Ducha post-entreno', c: 'higiene' },
  { d: 15, a: 'Colación 2', c: 'comida', sub: 'Post-entreno' }
]);

const NOCHE = notaCena => ([
  { at: CONFIG.cena, d: 60, a: 'Preparar + cenar', c: 'comida',
    sub: (notaCena ? notaCena + ' · ' : 'Cocinas, cenas y dejas la cocina lista · ') + 'lentes rojos ~' + LENTES },
  { d: 20, a: 'Reset de casa', c: 'casa', sub: 'Platos, recoger, ropa, basura si toca · deja todo listo para mañana' },
  LIBRE(70),
  { at: CELULAR, d: 10, a: 'Celular lejos + cierre', c: 'transicion' },
  { d: 20, a: 'Rutina de noche + película', c: 'rutina' },
  { at: CONFIG.dormido, d: SUENO, a: 'Sueño', c: 'sueno',
    sub: 'Dormido a las ' + fmt(toMin(CONFIG.dormido)) + ' · despiertas ' + fmt(toMin(CONFIG.despertar)) }
]);

const FINDE = semanal => ([
  { d: 100, a: 'Rutina mañana + desayuno', c: 'rutina', sub: 'Preparas y desayunas con calma · cocina lista' },
  { d: 90,  a: 'Habilidad — bloque profundo', c: 'habilidad' },
  LIBRE(60),
  COLACION_1(15),
  semanal,
  LIBRE(60),
  COMER(),
  { d: 50,  a: 'Digestión · pausa', c: 'margen' },
  { d: 80,  a: 'Entreno (pesas)', c: 'entreno' },
  { d: 20,  a: 'Ducha', c: 'higiene' },
  { d: 15,  a: 'Colación 2', c: 'comida', sub: 'Post-entreno' },
  { d: 60,  a: 'Habilidad — bloque 2', c: 'habilidad' },
  LIBRE(115, null, 20),
  ...NOCHE('Uno de los dos días: capricho a domicilio (esa noche no cocinas)')
]);

/* ============================================================
   LOS DÍAS
   ============================================================ */
const PLANTILLAS = {

  lunes: {
    nombre: 'Lunes', corto: 'L', foco: 'Plantas + tareas', wd: [1],
    pasos: () => [
      ...MANANA_CALMADA('Pesaje en ayunas ANTES del agua → Excel · luego agua, pastilla, gotas', [
        { d: 5, a: 'Regar plantas', c: 'casa', i: 'hoja', sub: 'Las 2 plantas, justo después de tu agua' }
      ]),
      MARGEN(5),
      { d: 60, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'Tu mejor hora mental' },
      MARGEN(10, 'Margen · listo para clase'),
      { at: '9:40',  d: 30, a: 'Matemáticas', c: 'escuela' },
      { d: 40, a: 'Caminadora + agua · respiro', c: 'fisica', flex: true, min: 15 },
      { at: '10:50', d: 30, a: 'Lógica', c: 'escuela' },
      COLACION_1(10),
      FISIO(),
      MARGEN_FISIO(30, true),
      { at: '12:00', d: 30, a: 'Orientación', c: 'escuela' },
      MARGEN_FISIO(60),
      { at: CONFIG.fisio.ventana[1], ...COMER() },
      TAREAS(90),
      MARGEN(20, 'Pausa', 5),
      HABILIDAD_2(),
      { d: 15, a: 'Colación 2', c: 'comida' },
      LIBRE(145),
      ...NOCHE()
    ]
  },

  martes: {
    nombre: 'Martes', corto: 'M', foco: 'Entreno', wd: [2],
    pasos: () => [
      ...MANANA_TEMPRANA(),
      { at: '8:00', d: 30, a: 'Religión', c: 'escuela', sub: 'Aprox. 8:10, dentro de este bloque' },
      RECOGER(10),
      { d: 90, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'El bloque más largo de la semana' },
      LIBRE(40),
      { at: '10:50', d: 30, a: 'Inglés', c: 'escuela' },
      COLACION_1(10),
      FISIO(),
      MARGEN_FISIO(80, true),
      { at: '12:50', d: 30, a: 'Dibujo II', c: 'escuela' },
      COMER(),
      TAREAS(75, 'Solo escuela · de paso haces la digestión antes del entreno'),
      MARGEN(10, 'Pausa · cámbiate', 5),
      ...ENTRENO(),
      HABILIDAD_2(),
      LIBRE(80),
      ...NOCHE()
    ]
  },

  miercoles: {
    nombre: 'Miércoles', corto: 'X', foco: 'Robótica', wd: [3],
    pasos: () => [
      ...MANANA_TEMPRANA(),
      { at: '8:00', d: 30, a: 'Robótica', c: 'escuela' },
      RECOGER(5),
      { d: 60, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'Tu mejor hora mental' },
      MARGEN(5, 'Margen · listo para clase'),
      { at: '9:40', d: 30, a: 'Historia', c: 'escuela' },
      { d: 20, a: 'Caminadora + agua', c: 'fisica', flex: true, min: 10 },
      COLACION_1(15),
      LIBRE(45),
      FISIO(),
      MARGEN_FISIO(30, true),
      { at: '12:00', d: 30, a: 'Física III', c: 'escuela' },
      MARGEN_FISIO(20),
      { at: '12:50', d: 30, a: 'Francés', c: 'escuela' },
      COMER(),
      TAREAS(90),
      MARGEN(20, 'Pausa', 5),
      HABILIDAD_2(),
      { d: 15, a: 'Colación 2', c: 'comida' },
      LIBRE(155),
      ...NOCHE()
    ]
  },

  jueves: {
    nombre: 'Jueves', corto: 'J', foco: 'Teatro + entreno', wd: [4],
    pasos: () => [
      ...MANANA_CALMADA(),
      LIBRE(25, null, 0),
      MARGEN(5, 'Margen · listo para Teatro'),
      { at: '8:50', d: 30, a: 'Teatro', c: 'escuela' },
      MARGEN(5, 'Pausa', 5),
      { d: 60, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'Tu mejor hora mental' },
      MARGEN(5, 'Margen · listo para clase'),
      { at: '10:30', d: 30, a: 'Computación', c: 'escuela' },
      COLACION_1(15),
      LIBRE(15, null, 0),
      FISIO(),
      MARGEN_FISIO(120, true),
      { at: CONFIG.fisio.ventana[1], ...COMER() },
      TAREAS(75, 'Solo escuela · de paso haces la digestión antes del entreno'),
      MARGEN(10, 'Pausa · cámbiate', 5),
      ...ENTRENO(),
      HABILIDAD_2(),
      LIBRE(70),
      ...NOCHE()
    ]
  },

  viernes: {
    nombre: 'Viernes', corto: 'V', foco: 'Cierre de semana', wd: [5],
    pasos: () => [
      ...MANANA_TEMPRANA(),
      { at: '8:00', d: 30, a: 'Lengua Española', c: 'escuela' },
      RECOGER(10),
      { d: 80, a: 'Habilidad — bloque profundo', c: 'habilidad', sub: 'Tu mejor hora mental' },
      { d: 25, a: 'Caminadora + agua', c: 'fisica', flex: true, min: 10 },
      MARGEN(5, 'Margen · listo para clase'),
      { at: '10:30', d: 30, a: 'Geografía', c: 'escuela' },
      COLACION_1(15),
      LIBRE(15, null, 0),
      FISIO(),
      MARGEN_FISIO(80, true),
      { at: '12:50', d: 30, a: 'Deportes', c: 'escuela' },
      COMER(),
      TAREAS(60, 'Solo escuela · cierra pendientes de la semana'),
      MARGEN(20, 'Pausa', 5),
      HABILIDAD_2(),
      { d: 15, a: 'Colación 2', c: 'comida' },
      LIBRE(185),
      ...NOCHE()
    ]
  },

  sabado: {
    nombre: 'Sábado', corto: 'S', foco: 'Entreno + limpieza', wd: [6], nota: true,
    pasos: () => FINDE({ d: 60, a: 'Limpieza + lavandería', c: 'casa',
                         sub: 'Semanal: baño, pisos, sábanas y una carga de ropa' })
  },
  domingo: {
    nombre: 'Domingo', corto: 'D', foco: 'Entreno + súper', wd: [0], nota: true,
    pasos: () => FINDE({ d: 60, a: 'Súper + plan de comidas', c: 'casa', i: 'bolsa',
                         sub: 'Semanal: compras y qué vas a cocinar de lunes a viernes' })
  }
};

/* ============================================================
   CONSTRUCTOR: convierte pasos (duraciones + anclas) en horarios.
   Las anclas (at) mandan. Los bloques marcados flex absorben el
   desfase, para que mover una clase no rompa el resto del día.
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
      if (p.ventana) continue;   // las ventanas no ocupan tiempo en la línea
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
    if (p.ventana) {
      // actividad de hora variable: se muestra con su franja completa,
      // sin desplazar ni encimarse con lo que pasa dentro de ella
      const v = {};
      for (const k in p) v[k] = p[k];
      v.s = toMin(p.at); v.e = v.s + dur[i];
      bloques.push(v);
      return;
    }
    if (p.at != null) {
      const objetivo = toMin(p.at);
      if (objetivo > t) bloques.push({ s: t, e: objetivo, a: 'Tiempo libre', c: 'libre' });
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

// clave con la que se guarda un bloque como hecho: su hora de inicio
const claveDe = b => (b.k != null ? b.k : b.s);

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CONFIG, CAT, LEYENDA, DIAS, ORDEN, POR_WD, toMin, fmt, construirDia, PLANTILLAS, claveDe };
}
