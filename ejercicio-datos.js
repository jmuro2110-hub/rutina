/* ============================================================
   EJERCICIO — DATOS
   ------------------------------------------------------------
   Guía de consulta de los 4 días de entreno. Independiente de
   la Rutina: no lee ni escribe nada de rutina.js ni de app.js.

   Cada ejercicio:
     n: nombre            s: series         r: rango de repeticiones
     lado: 'brazo' | 'pierna' (las repeticiones son por lado)
     d: descanso          p: progresión (al agotar peso y rango)
   fc (por día): etiqueta corta del botón; foco es el título completo
   ============================================================ */

const EJERCICIO_DIAS = [
  {
    k: 'martes', nombre: 'Martes', corto: 'Mar', foco: 'Torso', fc: 'Torso', wd: 2,
    lista: [
      { n: 'Dominadas pronas', s: 3, r: '5–12', d: '2–3 min',
        p: 'Añadir polainas bien sujetas. Al agotar esa opción, pausa de 1 s arriba.' },
      { n: 'Lagartijas', s: 3, r: '8–15', d: '2–3 min',
        p: 'Elevar los pies sobre un banco estable. Después, aumentar el recorrido apoyando las manos en mancuernas hexagonales firmes, únicamente si no ruedan ni resbalan.' },
      { n: 'Remo a un brazo con apoyo en banco', s: 3, r: '10–20', lado: 'brazo', d: '90 s–3 min tras ambos brazos',
        p: 'Con 11 kg, pausa de 2 s arriba sin girar el torso. Si 20 siguen siendo fáciles, revisar ligas y anclajes disponibles antes de sustituirlo.' },
      { n: 'Elevaciones laterales de pie', s: 3, r: '10–20', d: '90 s–3 min',
        p: 'Pausa de 1 s arriba. Después, variante acostado de lado en banco inclinado.' },
      { n: 'Reverse fly con pecho apoyado', s: 2, r: '12–20', d: '90 s–3 min',
        p: 'Pausa de 1 s arriba, conservando el apoyo del pecho.' },
      { n: 'Extensión de tríceps sobre la cabeza a una mano', s: 3, r: '8–15', lado: 'brazo', d: '90 s–3 min tras ambos brazos',
        p: 'Pausa de 1 s abajo.' },
      { n: 'Curl inclinado con mancuernas', s: 3, r: '8–15', d: '90 s–3 min',
        p: 'Pausa de 1 s abajo con el brazo extendido.' },
      { n: 'Rueda abdominal de rodillas', s: 3, r: '5–12', d: '90 s–3 min',
        p: 'Empezar con una pared que limite el recorrido. Alejarse poco a poco mientras pueda controlar la espalda. Al dominar el recorrido completo, pausa de 1 s al frente.' }
    ]
  },
  {
    k: 'jueves', nombre: 'Jueves', corto: 'Jue', foco: 'Pierna, brazos y abdomen', fc: 'Pierna', wd: 4,
    lista: [
      { n: 'Sentadilla búlgara', s: 3, r: '8–15', lado: 'pierna', d: '30–60 s entre piernas y 2–3 min tras ambas',
        p: 'Elevar el pie delantero sobre un escalón firme para ampliar el recorrido controlado. Después, pausa de 1 s abajo.' },
      { n: 'Elevación de pantorrilla unilateral', s: 3, r: '10–20', lado: 'pierna', d: '90 s–3 min tras ambas piernas',
        p: 'Pausa de 2 s abajo en un escalón firme, con apoyo para el equilibrio.' },
      { n: 'Curl martillo', s: 3, r: '8–15', d: '90 s–3 min',
        p: 'Pausa de 1 s abajo con el brazo extendido.' },
      { n: 'Extensión de tríceps sobre la cabeza a dos manos', s: 3, r: '10–20', d: '90 s–3 min',
        p: 'Pasar a la variante a una mano con el peso que ya controlo en esa variante el martes.' },
      { n: 'Elevaciones laterales sentado', s: 3, r: '10–20', d: '90 s–3 min',
        p: 'Pausa de 1 s arriba.' },
      { n: 'Crunch inverso', s: 3, r: '8–15', d: '90 s–3 min',
        p: 'Añadir polainas bien sujetas. Después, extender un poco más las piernas manteniendo el control.' }
    ]
  },
  {
    k: 'sabado', nombre: 'Sábado', corto: 'Sáb', foco: 'Torso', fc: 'Torso', wd: 6,
    lista: [
      { n: 'Dominadas supinas', s: 3, r: '5–12', d: '2–3 min',
        p: 'Añadir polainas bien sujetas. Después, pausa de 1 s arriba.' },
      { n: 'Lagartijas en V', s: 3, r: '6–12', d: '2–3 min',
        p: 'Elevar los pies sobre un banco estable. Después, pausa de 1 s abajo.' },
      { n: 'Press inclinado con mancuernas', s: 2, r: '10–20', d: '2–3 min',
        p: 'La variante inicial ya lleva una pausa de 1 s abajo. Con 11 kg por mano, ampliarla a 2 s. Si 20 repeticiones siguen siendo fáciles, sustituir esas dos series por lagartijas con los pies sobre el banco.' },
      { n: 'Remo a un brazo con apoyo en banco', s: 2, r: '10–20', lado: 'brazo', d: '90 s–3 min tras ambos brazos',
        p: 'Misma progresión del martes: pausa de 2 s arriba y después revisión de ligas y anclajes.' },
      { n: 'Reverse fly con pecho apoyado', s: 3, r: '12–20', d: '90 s–3 min',
        p: 'Pausa de 1 s arriba.' },
      { n: 'Elevaciones laterales de pie', s: 3, r: '10–20', d: '90 s–3 min',
        p: 'Pausa de 1 s arriba. Después, variante acostado de lado en banco inclinado.' },
      { n: 'Curl de bíceps de pie', s: 2, r: '8–15', d: '90 s–3 min',
        p: 'Pausa de 1 s abajo. Después, probar curl inclinado como el martes.' },
      { n: 'Extensión de tríceps acostado con dos mancuernas', s: 3, r: '8–15', d: '90 s–3 min',
        p: 'Pausa de 1 s abajo. Después, variante acostado en banco inclinado.' }
    ]
  },
  {
    k: 'domingo', nombre: 'Domingo', corto: 'Dom', foco: 'Pierna y abdomen', fc: 'Pierna', wd: 0,
    lista: [
      { n: 'Zancada hacia atrás', s: 3, r: '8–15', lado: 'pierna', d: '30–60 s entre piernas y 2–3 min tras ambas',
        p: 'Elevar el pie delantero sobre un escalón firme. Después, pausa de 1 s abajo.' },
      { n: 'Hip thrust a una pierna', s: 3, r: '8–15', lado: 'pierna', d: '30–60 s entre piernas y 90 s–3 min tras ambas',
        p: 'Empezar con peso corporal y añadir una mancuerna sobre la cadera cuando corresponda. Al llegar a 11 kg y agotar el rango, pausa de 2 s arriba.' },
      { n: 'Extensión de pierna unilateral', s: 3, r: '10–20', lado: 'pierna', d: '90 s–3 min tras ambas piernas',
        p: 'Pausa de 1–2 s arriba. La variante unilateral requiere que el aparato y el rodillo se mantengan estables. Si se ladean, usar ambas piernas con pausa de 1 s arriba.' },
      { n: 'Elevación de pantorrilla unilateral', s: 3, r: '10–20', lado: 'pierna', d: '90 s–3 min tras ambas piernas',
        p: 'Pausa de 2 s abajo con apoyo estable.' },
      { n: 'Crunch con mancuerna', s: 3, r: '8–15', d: '90 s–3 min',
        p: 'Empezar con la mancuerna sobre el pecho. Una vez agotados el peso y el rango, aumentar gradualmente la palanca llevando los brazos más atrás, dentro de un recorrido que pueda controlar.' }
    ]
  }
];

if (typeof module !== 'undefined') module.exports = { EJERCICIO_DIAS };
