/* ============================================================
   RUTINA FACIAL — datos (aparte de la Rutina y de Ejercicio)
   ------------------------------------------------------------
   Fuente: «Rehabilitación facial en casa», PDF del 13 nov 2026.
   Todo es la PROPUESTA del PDF: todavía no está confirmado qué
   ejercicios te enseñaron ni qué dosis te indicaron.

   Cada ejercicio tiene:
     breve → pasos cortos, siempre a la vista
     alto  → señal específica para parar, siempre a la vista
     cond  → condición del PDF, a la vista
     det   → explicación larga, dentro de «Ver detalle»
   ============================================================ */

const FACIAL_EJ = {
  masaje: {
    n: 'Masaje suave de preparación',
    dosis: [['90 s', 'una vez'], ['Sin dolor', 'presión suave']],
    desc: 'Ninguno: pasa directo al siguiente',
    breve: [
      'Círculos lentos con las yemas: mejillas, alrededor de los labios y barbilla.',
      'Suave y sin dolor.'
    ],
    alto: ['Si duele, para: el masaje tiene que ser sin dolor.'],
    cond: 'El PDF indica que las zonas y la presión se enseñan en persona.',
    det: {
      para: 'Soltar mejillas y labios antes de moverlos.'
    }
  },

  sello: {
    n: 'Sello suave sostenido',
    desc: '10 s entre cierres · 60 s entre series',
    breve: [
      'Dientes apenas separados, lengua en el paladar.',
      'Junta los labios en 2 s con el mínimo esfuerzo.',
      'Sostén 3 s respirando por la nariz.',
      'Suelta en 2 s, descansa 10 s y haz el segundo cierre.',
      'Descansa 60 s antes de la siguiente serie.'
    ],
    alto: [
      'La serie termina en 2 cierres: no fuerces la tercera.',
      'Si necesitas más de 5 de 10 de esfuerzo, esa repetición no cuenta.',
      'Si tras el descanso el primer cierre ya falla, el ejercicio terminó en este bloque.'
    ],
    cond: 'El PDF pide revisar la técnica en persona: dientes, mentón y ojo.',
    det: {
      para: 'Que la boca pueda quedar cerrada en reposo y entre palabras. Es la base del inflado y del beso.',
      pasos: [
        'Mira tu ojo derecho y tus comisuras en reposo, como referencia.',
        'Junta los labios en unos 2 s, con el mínimo esfuerzo que logre contacto de lado a lado.',
        'Sostén 3 s respirando por la nariz.',
        'Suelta en 2 s y deja la boca descansar 10 s.',
        'Haz el segundo cierre y termina la serie. Descansa 60 s.'
      ],
      ver: 'Contacto parejo de izquierda a derecha, el ojo igual de abierto que en reposo, la barbilla lisa y los dientes sin apretar. Si la barbilla se arruga o aprietas los dientes, el mentón o la mandíbula están haciendo el trabajo.',
      mas: [
        'Si la segunda repetición ya pasó de 5 de 10 de esfuerzo, alarga el descanso a 90 s.',
        'Si el primer cierre falla dos bloques seguidos, quita una serie al día siguiente.'
      ]
    }
  },

  vocales: {
    n: 'Vocales «i-u» lentas',
    dosis: [['5', 'repeticiones'], ['2 s + 2 s', '«i» y luego «u»']],
    desc: '5 s entre repeticiones',
    breve: [
      'Di «i» en voz baja 2 s, con la boca estirada.',
      'Pasa despacio a «u» 2 s, sin forzar el redondeo.',
      'Descansa 5 s.'
    ],
    suspender: 'Si el ojo derecho se cierra, incluso con la «u» suave: suspende este ejercicio. Aquí no hay reintento. El PDF indica quitarlo hasta una valoración en persona.',
    alto: [],
    det: {
      para: 'Preparar la U con la «u» del habla, sin intentos máximos ni reforzar el cierre del ojo.',
      ver: 'El ojo derecho igual que en reposo. Busca cualquier mínimo avance o estrechamiento de la boca, aunque sea de un milímetro. Que todavía no aparezca es lo esperado.',
      nota: 'El PDF permite esta parte sin la enseñanza presencial que pide para el beso asistido con los dedos.'
    }
  },

  habla: {
    n: 'Frases y habla libre',
    dosis: [['6 × 2', 'frases × vueltas'], ['1 min', 'habla libre']],
    desc: '30 s entre rondas',
    breve: [
      'Lee cada frase a velocidad normal y, al terminarla, cierra los labios suave 2 s.',
      'Repite la lista una segunda vez.',
      'Habla 1 minuto libre frente al espejo.'
    ],
    frases: ['Papá puso la mesa', 'Mi mamá me ama', 'Un vaso con hielo', 'Pon un poco más', 'Compré pan y queso', 'Me tomo un mango'],
    alto: ['Si tienes que forzar, baja la velocidad: no subas la fuerza.'],
    det: {
      para: 'Usar el cierre dentro de frases y cerrar la boca en las pausas.',
      ver: 'Contacto en cada p, m y b/v inicial, y la boca cerrada en las pausas.',
      nota: 'El PDF no pide enseñanza presencial para este ejercicio.'
    }
  },

  reposo: {
    n: 'Revisión de reposo',
    dosis: [['5', 'veces al día'], ['5 s', 'cada una']],
    desc: 'Repartidas en el día',
    breve: [
      'En 5 momentos fijos (después de comer, en descansos de la tarea), fíjate si tus labios están separados.',
      'Si lo están, ciérralos suave 5 s y suéltalos.'
    ],
    alto: ['Que los labios se vuelvan a abrir es normal por ahora: no cuenta como falla.'],
    det: {
      para: 'Notar cuando la boca queda abierta.',
      nota: 'El PDF no pide enseñanza presencial para este ejercicio.'
    }
  }
};

/* orden relativo del PDF, sin las técnicas que solo quedan de referencia */
const FACIAL_BLOQUES = [
  {
    k: 'A', corto: 'Mañana', nombre: 'Bloque A · mañana',
    meta: '2 ejercicios',
    nota: 'El día que grabes tu video semanal, el PDF indica saltarte este bloque y hacer solo el B.',
    intro: true,
    lista: [
      { e: 'masaje' },
      { e: 'sello', dosis: [['4 × 2', 'series × cierres'], ['3 s', 'sostener cada cierre']] }
    ]
  },
  {
    k: 'B', corto: 'Tarde', nombre: 'Bloque B · tarde o noche',
    meta: '4 ejercicios',
    nota: 'Unas 4 h después del A (una propuesta del PDF, no un dato probado). El día de grabación, graba primero, en fresco.',
    intro: true,
    lista: [
      { e: 'masaje' },
      { e: 'vocales' },
      { e: 'sello', dosis: [['3 × 2', 'series × cierres'], ['3 s', 'sostener cada cierre']] },
      { e: 'habla' }
    ]
  },
  {
    k: 'D', corto: 'En el día', nombre: 'Durante el día',
    meta: '≈ 1 min en total según el PDF',
    nota: 'Revisiones cortas repartidas en tu día, fuera de los bloques.',
    intro: false,
    lista: [{ e: 'reposo' }]
  }
];

/* técnicas que el PDF pide aprender en persona: solo consulta */
const FACIAL_REF = [
  {
    n: 'Inflar con ayuda y poco aire', donde: 'En el PDF iba en el bloque A, después del sello.',
    aviso: 'El PDF pide que te enseñen en persona dónde va el dedo y que la prueba de la nariz se haga con alguien.',
    dosis: [['3 × 3', 'series × repeticiones'], ['2 s', 'sostener · ayuda nivel 3']],
    desc: '15 s entre repeticiones · 60 s entre series',
    previo: 'Prueba de la nariz, antes de la primera vez: infla con ayuda de la mano dos veces, una normal y otra tapándote la nariz. Si con la nariz tapada aguantas claramente más, parte del aire se va por la nariz y no sigues con este ejercicio.',
    escalera: [
      ['3', 'Pulgar e índice juntan suavemente los labios en todo su ancho.'],
      ['2', 'Un dedo solo sobre el punto por donde se escapa.'],
      ['1', 'El dedo apenas toca, como guía.'],
      ['0', 'Sin mano.']
    ],
    pasos: [
      'Junta los labios como en el sello.',
      'Pon la ayuda del nivel que te toca (se empieza en el 3).',
      'Mete poco aire, como un 30 % de lo que inflarías normalmente.',
      'Sostén 2 s.',
      'Suelta el aire despacio por la boca y descansa 15 s.'
    ],
    ver: 'Se inflan las dos mejillas, no sale aire por la nariz ni por las comisuras y el ojo no se cierra.',
    alto: [
      'Si el aire se escapa de inmediato: menos aire, nivel 3 de ayuda, dedo justo en el punto de fuga y sostén solo 1 s.',
      'Si se escapa aun con nivel 3 y poco aire, quita este ejercicio.',
      'Si el aire sale por la nariz, no lo practiques: no es un problema de labios.'
    ]
  },
  {
    n: 'Beso asistido con los dedos', donde: 'En el PDF iba en el bloque B, antes de las vocales «i-u».',
    aviso: 'El PDF lo marca como indispensable de aprender en persona: la dirección y la presión de los dedos se aprenden viendo. Mientras tanto indica hacer solo las vocales «i-u».',
    dosis: [['5', 'repeticiones'], ['2 s', 'sostener']],
    desc: '10 s entre repeticiones',
    pasos: [
      'Pon las yemas de los índices justo afuera de cada comisura.',
      'Con los dedos, lleva las comisuras hacia el centro y un poco hacia adelante, como si hicieras la boca más chiquita.',
      'Al mismo tiempo piensa en una «u» suave y deja que los labios acompañen. Los dedos hacen casi todo.',
      'Sostén 2 s, suelta y descansa 10 s.'
    ],
    ver: 'El ojo derecho igual que en reposo.',
    alto: [
      'Si se cierra el ojo derecho: suelta, respira 3 veces y repite una sola vez con la mitad del esfuerzo, más lento.',
      'Dos intentos con cierre del ojo terminan el ejercicio en ese bloque.'
    ]
  }
];

const FACIAL_GUIA = {
  posicion: 'Frente a un espejo o la cámara frontal a la altura de los ojos, sentado, hombros sueltos, respirando por la nariz. Lento, con poco esfuerzo y mirando tu ojo derecho.',
  esfuerzo: 'En el sello, el mínimo que logre el contacto. En todo lo demás, 2 o 3 de 10.',
  falla: 'Si falla una repetición del sello (el ojo se cierra o el sello se abre): suelta, respira 3 veces y repite una sola vez, más suave. Si vuelve a fallar, ese ejercicio terminó por este bloque.',
  excepcion: 'Vocales «i-u»: sin reintento. Si el ojo se cierra incluso con la «u» suave, suspende ese ejercicio. En las frases: más lento, no más fuerte.',
  suficiente: 'Terminaste cuando acabas las series del bloque o cuando un ejercicio te pide parar. Hacer más no suma.',
  bajar: 'Si pierdes calidad antes de lo normal dos bloques seguidos, el ojo se cierra más en el video, la cara amanece cansada o tensa, o hay dolor: quita una serie por ejercicio o vuelve al nivel anterior durante 3 días.',
  noHacer: [
    'Masticar chicle.',
    'Gestos grandes o ejercicios genéricos de «fuerza facial».',
    'Series de intentos máximos de U o de beso.',
    'Electroestimulación por tu cuenta.',
    'Apretar los ojos con fuerza como ejercicio.'
  ],
  medico: [
    'Debilidad nueva en la cara o en el cuerpo.',
    'Dolor que no se va, o espasmos o tics que no se quitan.',
    'El ojo deja de cerrar bien o se irrita.',
    'Te atragantas o te cuesta tragar.',
    'Fiebre con dolor de cabeza.'
  ]
};

if (typeof module !== 'undefined') module.exports = { FACIAL_EJ, FACIAL_BLOQUES, FACIAL_REF, FACIAL_GUIA };
