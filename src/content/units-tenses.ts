import type { Unit } from './types';

/**
 * Unidades que completan los 12 tiempos verbales del camino (presente, pasado y futuro × simple,
 * continuo, perfecto y perfecto continuo): futuro continuo, pasado perfecto continuo y futuro
 * perfecto continuo. Las demás ya estaban en units.ts.
 */
export const TENSE_UNITS: Unit[] = [
  {
    id: 'future-cont',
    level: 'B1',
    axis: 'Verbos',
    title: 'Futuro continuo',
    prereqs: ['future', 'pres-cont'],
    explanation: [
      'will be + verbo con -ing: algo que va a estar en curso en un momento del futuro. This time tomorrow I’ll be flying to Sydney.',
      'También suena amable para preguntar por planes: Will you be using the car tonight?',
      'Negativa: won’t be + -ing. Pregunta: Will + sujeto + be + -ing?',
      'Los verbos de estado (know, like, want) no van en continuo: I’ll know tomorrow (no «I’ll be knowing»).',
    ],
    examples: [
      ["This time tomorrow I'll be flying to Sydney.", 'Mañana a esta hora voy a estar volando a Sídney.'],
      ["Don't call at nine. I'll be having dinner.", 'No llames a las nueve. Voy a estar cenando.'],
      ['Will you be using the car tonight?', '¿Vas a usar el auto esta noche?'],
    ],
    trap: '«Voy a estar trabajando» no es «I will working» ni «I will be work». Siempre will + be + -ing: I will be working.',
    exercises: [
      { kind: 'type', prompt: 'This time tomorrow, I ___ (fly) to Sydney.', answers: ['will be flying', "'ll be flying"], why: 'This time tomorrow = en curso en ese momento del futuro: will be + -ing.' },
      { kind: 'choice', prompt: "Don't call me at nine. I ___ dinner.", options: ['will have', 'will be having', 'have'], answer: 1, why: 'A las nueve la cena va a estar en curso: will be having.' },
      { kind: 'fix', prompt: 'At ten I will be work.', answers: ['At ten I will be working.', "At ten I'll be working."], why: 'Después de will be el verbo lleva -ing: will be working.' },
      { kind: 'type', prompt: '___ (you / use) the car tonight?', answers: ['Will you be using'], why: 'Pregunta amable por un plan: Will + sujeto + be + -ing.' },
      { kind: 'choice', prompt: 'At midnight she ___.', options: ['will be sleeping', 'will sleeping', 'will be sleep'], answer: 0, why: 'will + be + verbo con -ing: will be sleeping.' },
      { kind: 'type', prompt: "I can't come at six. I ___ (work).", answers: ['will be working', "'ll be working"], why: 'A las seis voy a estar en medio del trabajo: will be working.' },
      { kind: 'fix', prompt: 'Tomorrow at this time we will travelling.', answers: ['Tomorrow at this time we will be travelling.', "Tomorrow at this time we'll be travelling.", 'Tomorrow at this time we will be traveling.'], why: 'Falta be: will be travelling.' },
      { kind: 'translate', prompt: 'Mañana a las ocho voy a estar trabajando.', answers: ['Tomorrow at eight I will be working.', "Tomorrow at eight I'll be working.", 'I will be working tomorrow at eight.', "I'll be working tomorrow at eight.", 'Tomorrow at 8 I will be working.'], why: 'En curso en un momento del futuro: will be working.' },
      { kind: 'translate', prompt: 'No van a estar esperando.', answers: ["They won't be waiting.", 'They will not be waiting.'], why: 'Negativa: won’t be + -ing.' },
    ],
  },
  {
    id: 'past-perf-cont',
    level: 'B2',
    axis: 'Verbos',
    title: 'Pasado perfecto continuo',
    prereqs: ['past-perfect', 'pres-perf-cont'],
    explanation: [
      'had been + verbo con -ing: algo que venía durando hasta un momento del pasado. I had been waiting for an hour when he arrived.',
      'Explica la causa de algo en el pasado: She was tired because she had been working all night.',
      'Es el presente perfecto continuo llevado al pasado: I’ve been waiting (hasta ahora) → I had been waiting (hasta ese momento).',
      'Para contar cantidades terminadas va el pasado perfecto simple: I had read three books (no «had been reading three books»).',
    ],
    examples: [
      ['I had been waiting for an hour when he arrived.', 'Hacía una hora que esperaba cuando él llegó.'],
      ['She was tired because she had been working all night.', 'Estaba cansada porque había estado trabajando toda la noche.'],
      ['How long had you been living there?', '¿Cuánto hacía que vivías ahí?'],
    ],
    trap: '«Hacía una hora que esperaba» no es «I was waiting since one hour». Va: I had been waiting for an hour.',
    exercises: [
      { kind: 'type', prompt: 'I ___ (wait) for an hour when he finally arrived.', answers: ['had been waiting', "'d been waiting"], why: 'La espera venía durando hasta ese momento del pasado: had been waiting.' },
      { kind: 'choice', prompt: 'She was tired because she ___ all night.', options: ['has been working', 'had been working', 'was worked'], answer: 1, why: 'La causa es anterior a otro pasado (was tired) y duró un tiempo: had been working.' },
      { kind: 'fix', prompt: 'I was waiting since two hours when the bus came.', answers: ['I had been waiting for two hours when the bus came.', "I'd been waiting for two hours when the bus came."], why: 'Duración hasta un momento del pasado: had been waiting + for.' },
      { kind: 'type', prompt: 'How long ___ (you / live) there before you moved?', answers: ['had you been living'], why: 'Pregunta: had + sujeto + been + -ing.' },
      { kind: 'choice', prompt: 'The ground was wet. It ___.', options: ['had been raining', 'has been raining', 'is raining'], answer: 0, why: 'La lluvia fue antes de ese momento del pasado y dejó un resultado: had been raining.' },
      { kind: 'type', prompt: 'We ___ (drive) for six hours before we stopped.', answers: ['had been driving', "'d been driving"], why: 'Veníamos manejando hasta que paramos: had been driving.' },
      { kind: 'choice', prompt: 'By then I ___ three coffees.', options: ['had been drinking', 'had drunk', 'have drunk'], answer: 1, why: 'Cantidad terminada (three coffees): pasado perfecto simple, had drunk.' },
      { kind: 'translate', prompt: 'Hacía dos años que trabajaba ahí cuando me fui.', answers: ['I had been working there for two years when I left.', "I'd been working there for two years when I left.", 'I had worked there for two years when I left.'], why: 'Duración hasta un momento del pasado: had been working … for two years.' },
      { kind: 'translate', prompt: 'Estaba cansado porque había estado corriendo.', answers: ['I was tired because I had been running.', "I was tired because I'd been running."], why: 'La causa venía de antes: had been running.' },
    ],
  },
  {
    id: 'future-perf-cont',
    level: 'C1',
    axis: 'Verbos',
    title: 'Futuro perfecto continuo',
    prereqs: ['future-perf', 'future-cont', 'pres-perf-cont'],
    explanation: [
      'will have been + verbo con -ing: cuánto tiempo va a llevar algo en curso cuando llegue un momento del futuro. In June I’ll have been working here for a year.',
      'Casi siempre lleva dos pistas: by / in + momento futuro, y for + duración.',
      'Se diferencia del futuro perfecto simple en que mira la duración, no el resultado: I’ll have written three reports (resultado) / I’ll have been writing for hours (duración).',
      'Los verbos de estado van en futuro perfecto simple: I’ll have known her for ten years.',
    ],
    examples: [
      ["In June I'll have been working here for a year.", 'En junio voy a llevar un año trabajando acá.'],
      ["By six we'll have been driving for eight hours.", 'A las seis vamos a llevar ocho horas manejando.'],
      ['How long will you have been studying by then?', '¿Cuánto vas a llevar estudiando para entonces?'],
    ],
    trap: '«Voy a llevar un año trabajando» no es «I will be working since a year». Va: I will have been working for a year.',
    exercises: [
      { kind: 'type', prompt: 'In June I ___ (work) here for a year.', answers: ['will have been working', "'ll have been working"], why: 'Duración hasta un momento del futuro: will have been working.' },
      { kind: 'choice', prompt: 'By six we ___ for eight hours.', options: ['will be driving', 'will have been driving', 'have been driving'], answer: 1, why: 'By six + for eight hours: cuánto va a llevar en ese momento, will have been driving.' },
      { kind: 'fix', prompt: 'Next month I will have been live here for two years.', answers: ['Next month I will have been living here for two years.', "Next month I'll have been living here for two years."], why: 'Después de will have been el verbo lleva -ing: living.' },
      { kind: 'type', prompt: 'By the time you arrive, I ___ (wait) for two hours.', answers: ['will have been waiting', "'ll have been waiting"], why: 'La espera va a llevar dos horas cuando llegues: will have been waiting.' },
      { kind: 'choice', prompt: 'By Friday I ___ three reports.', options: ['will have been writing', 'will have written', 'will be writing'], answer: 1, why: 'Cantidad terminada (three reports): futuro perfecto simple, will have written.' },
      { kind: 'type', prompt: 'How long ___ (you / study) English by December?', answers: ['will you have been studying'], why: 'Pregunta: will + sujeto + have been + -ing.' },
      { kind: 'choice', prompt: 'Next year they ___ together for ten years.', options: ['will have been living', 'will living', 'have lived'], answer: 0, why: 'Duración hasta un momento del futuro: will have been living.' },
      { kind: 'translate', prompt: 'En diciembre voy a llevar tres años estudiando inglés.', answers: ['In December I will have been studying English for three years.', "In December I'll have been studying English for three years.", 'By December I will have been studying English for three years.', "By December I'll have been studying English for three years."], why: 'Duración hasta un momento del futuro: will have been studying … for three years.' },
    ],
  },
];
