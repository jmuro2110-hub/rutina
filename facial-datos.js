/* ============================================================
   RUTINA FACIAL — datos (aparte de la Rutina y de Ejercicio)
   ------------------------------------------------------------
   Fuente: «Rehabilitación facial en casa», PDF del 13 nov 2026.
   Todo es la PROPUESTA del PDF: todavía no está confirmado qué
   ejercicios te enseñaron ni qué dosis te indicaron.

   tipo: 'propuesta'  → propuesta del PDF para casa
         'referencia' → el PDF pide enseñanza presencial antes de
                        practicarlo; solo se muestra como consulta
   ============================================================ */

const FACIAL_EJ = {
  masaje: {
    num: 'M', n: 'Masaje suave de preparación', tipo: 'propuesta',
    para: 'Soltar mejillas y labios antes de moverlos.',
    dosis: [['90 s', 'una vez'], ['Sin dolor', 'presión suave']],
    desc: 'Sin descanso: pasa directo al siguiente ejercicio.',
    pasos: [
      'Círculos lentos con las yemas en las mejillas.',
      'Sigue alrededor de los labios.',
      'Termina en la barbilla.'
    ],
    ver: 'Debe sentirse suave y sin dolor.',
    parar: ['Si duele, para: el masaje tiene que ser sin dolor.'],
    cond: 'El PDF indica que las zonas y la presión se enseñan en persona.'
  },

  sello: {
    num: '1', n: 'Sello suave sostenido', tipo: 'propuesta',
    para: 'Que la boca pueda quedar cerrada en reposo y entre palabras.',
    pos: 'Dientes apenas separados y lengua descansando arriba, en el paladar.',
    desc: '10 s entre cierres · 60 s entre series',
    pasos: [
      'Mira tu ojo derecho y tus comisuras en reposo, como referencia.',
      'Junta los labios en unos 2 s, con el mínimo esfuerzo que logre contacto de lado a lado.',
      'Sostén 3 s respirando por la nariz.',
      'Suelta en 2 s y deja la boca descansar 10 s.',
      'Haz el segundo cierre y termina la serie. Descansa 60 s.'
    ],
    ver: 'Contacto parejo de izquierda a derecha, el ojo igual de abierto que en reposo, la barbilla lisa y los dientes sin apretar. Si la barbilla se arruga o aprietas los dientes, el mentón o la mandíbula están haciendo el trabajo.',
    parar: [
      'Esfuerzo: el mínimo que logre el contacto. Si necesitas más de 5 de 10, esa repetición no cuenta.',
      'No fuerces la tercera: la serie termina en 2 cierres.',
      'Si la segunda ya pasó de 5 de 10 de esfuerzo, alarga el descanso a 90 s.',
      'Si tras el descanso el primer cierre ya falla, el ejercicio terminó en este bloque.',
      'Si eso pasa dos bloques seguidos, quita una serie al día siguiente.'
    ],
    cond: 'El PDF pide revisar la técnica en persona: dientes, mentón y ojo.'
  },

  inflar: {
    num: '2', n: 'Inflar con ayuda y poco aire', tipo: 'referencia',
    aviso: 'El PDF pide que te enseñen en persona dónde va el dedo y que la prueba de la nariz se haga con alguien. Aquí queda solo como referencia.',
    para: 'Sostener aire en las mejillas; el paso previo a inflar 10 s sin mano.',
    dosis: [['3 × 3', 'series × repeticiones'], ['2 s', 'sostener · ayuda nivel 3']],
    desc: '15 s entre repeticiones · 60 s entre series',
    previo: {
      t: 'Prueba de la nariz, antes de la primera vez',
      p: 'Infla con ayuda de la mano dos veces, una normal y otra tapándote la nariz. Si con la nariz tapada aguantas claramente más, parte del aire se va por la nariz y no sigues con este ejercicio.'
    },
    escalera: [
      ['3', 'Pulgar e índice juntan suavemente los labios en todo su ancho.'],
      ['2', 'Un dedo solo sobre el punto por donde se escapa.'],
      ['1', 'El dedo apenas toca, como guía.'],
      ['0', 'Sin mano.']
    ],
    pasos: [
      'Junta los labios como en el ejercicio 1.',
      'Pon la ayuda del nivel que te toca (se empieza en el 3).',
      'Mete poco aire, como un 30 % de lo que inflarías normalmente.',
      'Sostén 2 s.',
      'Suelta el aire despacio por la boca y descansa 15 s.'
    ],
    ver: 'Se inflan las dos mejillas, no sale aire por la nariz ni por las comisuras y el ojo no se cierra.',
    parar: [
      'Si el aire se escapa de inmediato: menos aire, nivel 3 de ayuda, dedo justo en el punto de fuga y sostén solo 1 s.',
      'Si se escapa aun con nivel 3 y poco aire, quita este ejercicio.',
      'Si el aire sale por la nariz, no lo practiques: no es un problema de labios.'
    ]
  },

  besoA: {
    num: '3a', n: 'Beso asistido con los dedos', tipo: 'referencia',
    aviso: 'El PDF lo marca como indispensable de aprender en persona: la dirección y la presión de los dedos se aprenden viendo. Mientras tanto indica hacer solo la parte 3b.',
    para: 'Preparar la U y el beso con movimiento asistido, sin reforzar el cierre del ojo.',
    dosis: [['5', 'repeticiones'], ['2 s', 'sostener']],
    desc: '10 s entre repeticiones',
    pasos: [
      'Pon las yemas de los índices justo afuera de cada comisura.',
      'Con los dedos, lleva las comisuras hacia el centro y un poco hacia adelante, como si hicieras la boca más chiquita.',
      'Al mismo tiempo piensa en una «u» suave y deja que los labios acompañen. Los dedos hacen casi todo.',
      'Sostén 2 s, suelta y descansa 10 s.'
    ],
    ver: 'El ojo derecho igual que en reposo.',
    parar: [
      'Si se cierra el ojo derecho: suelta, respira 3 veces y repite una sola vez con la mitad del esfuerzo, más lento.',
      'Dos intentos con cierre del ojo terminan el ejercicio en ese bloque.'
    ]
  },

  besoB: {
    num: '3b', n: 'Vocales «i-u» lentas', tipo: 'propuesta',
    para: 'Preparar la U con la «u» del habla, sin intentos máximos.',
    dosis: [['5', 'repeticiones'], ['2 s + 2 s', '«i» y luego «u»']],
    desc: '5 s entre repeticiones',
    pasos: [
      'Di «i» en voz baja durante 2 s, con la boca estirada.',
      'Pasa despacio a «u» durante 2 s, sin forzar el redondeo.',
      'Descansa 5 s.'
    ],
    ver: 'El ojo derecho igual que en reposo. Busca cualquier mínimo avance o estrechamiento de la boca, aunque sea de un milímetro. Que todavía no aparezca es lo esperado.',
    parar: [
      'Si se cierra el ojo derecho: suelta, respira 3 veces y repite una sola vez, más suave y más lento.',
      'Dos intentos con cierre del ojo terminan el ejercicio en ese bloque.',
      'Si el ojo se cierra incluso con la «u» en voz baja, el PDF indica quitar este ejercicio hasta tener una valoración en persona.'
    ],
    cond: 'El PDF permite esta parte sin la enseñanza presencial que pide para la 3a.'
  },

  habla: {
    num: '4', n: 'Frases y habla libre', tipo: 'propuesta',
    para: 'Usar el cierre dentro de frases y cerrar la boca en las pausas.',
    dosis: [['6 × 2', 'frases × vueltas'], ['1 min', 'habla libre']],
    desc: '30 s entre rondas',
    frases: ['Papá puso la mesa', 'Mi mamá me ama', 'Un vaso con hielo', 'Pon un poco más', 'Compré pan y queso', 'Me tomo un mango'],
    pasos: [
      'Lee cada frase a velocidad normal, sin exagerar el apretón.',
      'Al terminar cada frase, cierra los labios suave 2 s y respira por la nariz.',
      'Repite la lista una segunda vez.',
      'Habla 1 minuto libre frente al espejo; por ejemplo, qué hiciste hoy.'
    ],
    ver: 'Contacto en cada p, m y b/v inicial, y la boca cerrada en las pausas.',
    parar: [
      'Si para lograrlo tienes que forzar, baja la velocidad en lugar de subir la fuerza.',
      'Aquí no aplica la regla de las dos fallas: si no sale, más lento, no más fuerte.'
    ],
    cond: 'El PDF no pide enseñanza presencial para este ejercicio.'
  },

  reposo: {
    num: '5', n: 'Revisión de reposo', tipo: 'propuesta',
    para: 'Notar cuando la boca queda abierta.',
    dosis: [['5', 'veces al día'], ['5 s', 'cada una']],
    desc: 'Repartidas en el día',
    pasos: [
      'Elige 5 momentos fijos del día; por ejemplo, después de cada comida y en los descansos de la tarea.',
      'Fíjate si tus labios están separados.',
      'Si lo están, ciérralos suave 5 s y suéltalos.'
    ],
    ver: 'Que se vuelvan a abrir es normal por ahora.',
    parar: ['El PDF no le da una señal propia: que los labios se vuelvan a abrir no cuenta como falla.'],
    cond: 'El PDF no pide enseñanza presencial para este ejercicio.'
  }
};

const FACIAL_BLOQUES = [
  {
    k: 'A', corto: 'Mañana', nombre: 'Bloque A · mañana',
    tiempo: '≈ 11 min', activo: '≈ 1.5 min de movimiento activo',
    nota: 'El día que grabes tu video semanal, el PDF indica saltarte este bloque y hacer solo el B.',
    lista: [
      { e: 'masaje' },
      { e: 'sello', dosis: [['4 × 2', 'series × cierres'], ['3 s', 'sostener']] },
      { e: 'inflar' }
    ]
  },
  {
    k: 'B', corto: 'Tarde', nombre: 'Bloque B · tarde o noche',
    tiempo: '≈ 11 min', activo: '≈ 3.5 min de movimiento activo',
    nota: 'Unas 4 h después del A; el PDF aclara que esas 4 h son una propuesta, no un dato probado. El día de grabación, graba primero, en fresco.',
    lista: [
      { e: 'masaje' },
      { e: 'besoA' },
      { e: 'besoB' },
      { e: 'sello', dosis: [['3 × 2', 'series × cierres'], ['3 s', 'sostener']] },
      { e: 'habla' }
    ]
  },
  {
    k: 'D', corto: 'En el día', nombre: 'Durante el día',
    tiempo: '≈ 1 min', activo: '≈ 0.5 min de movimiento activo',
    nota: 'Revisiones cortas repartidas en tu día, fuera de los bloques.',
    lista: [{ e: 'reposo' }]
  }
];

const FACIAL_GUIA = {
  comun: 'Frente a un espejo o la cámara frontal a la altura de los ojos, sentado, con hombros sueltos y respirando por la nariz. Muévete lento, con poco esfuerzo y mirando tu ojo derecho.',
  esfuerzo: 'En el sello, el mínimo que logre el contacto (más de 5 de 10 no cuenta). En todo lo demás, 2 o 3 de 10.',
  suficiente: 'Ya hiciste suficiente cuando terminas las series del bloque, o cuando un ejercicio activa dos veces la regla de parar. Lo que pase primero. Hacer más no suma.',
  falla: {
    que: 'Fallar es: el ojo se cierra, el sello se abre o el aire se escapa. Vale para los ejercicios 1, 2 y 3.',
    pasos: [
      'Suelta y respira 3 veces.',
      'Repite una sola vez, más suave: mitad de esfuerzo o más ayuda.',
      '¿Sale limpia? Sigue con la serie.',
      '¿No sale? Ese ejercicio terminó por este bloque, sin forzar más.',
      'Anota qué falló y en qué repetición.'
    ]
  },
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

if (typeof module !== 'undefined') module.exports = { FACIAL_EJ, FACIAL_BLOQUES, FACIAL_GUIA };
