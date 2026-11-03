/**
 * Léxico del generador de oraciones: verbos con sus formas en inglés y español, complementos con sentido,
 * sujetos y expresiones de tiempo. Todo combina en oraciones correctas y naturales.
 */

export interface Comp {
  en: string;
  es: string;
  /** Verbo español distinto para este complemento (play the guitar → tocar). */
  esVerb?: string;
}

export interface Verb {
  id: string;
  base: string;
  past: string;
  pp: string;
  /** Forma -ing si no sigue la regla. */
  ing?: string;
  /** Verbo en español (infinitivo). */
  es: string;
  comps: Comp[];
  /** Verbos de estado: no van en continuo. */
  stative?: boolean;
  /** Acciones instantáneas: no van con duración (for two hours). */
  punctual?: boolean;
  /** Accidentes o hechos únicos: no se usan como hábito (every day). */
  rare?: boolean;
}

const v = (id: string, base: string, past: string, pp: string, es: string, comps: [string, string, string?][], extra: Partial<Verb> = {}): Verb => ({
  id,
  base,
  past,
  pp,
  es,
  comps: comps.map(([en, es2, esVerb]) => ({ en, es: es2, esVerb })),
  ...extra,
});

export const VERBS: Verb[] = [
  v('work', 'work', 'worked', 'worked', 'trabajar', [['in a bank', 'en un banco'], ['from home', 'desde casa'], ['at the hospital', 'en el hospital']]),
  v('live', 'live', 'lived', 'lived', 'vivir', [['in Montevideo', 'en Montevideo'], ['near the beach', 'cerca de la playa'], ['with my parents', 'con mis padres']], { stative: true }),
  v('study', 'study', 'studied', 'studied', 'estudiar', [['English', 'inglés'], ['medicine', 'medicina'], ['for the exam', 'para el examen']]),
  v('play-sport', 'play', 'played', 'played', 'jugar', [['football', 'al fútbol'], ['tennis', 'al tenis'], ['cards', 'a las cartas']]),
  v('play-music', 'play', 'played', 'played', 'tocar', [['the guitar', 'la guitarra'], ['the piano', 'el piano']]),
  v('watch', 'watch', 'watched', 'watched', 'mirar', [['TV', 'la tele'], ['a movie', 'una película'], ['the news', 'las noticias']]),
  v('cook', 'cook', 'cooked', 'cooked', 'cocinar', [['dinner', 'la cena'], ['pasta', 'pasta'], ['for my family', 'para mi familia']]),
  v('travel', 'travel', 'travelled', 'travelled', 'viajar', [['to Brazil', 'a Brasil'], ['by bus', 'en ómnibus'], ['around Europe', 'por Europa']], { ing: 'travelling' }),
  v('call', 'call', 'called', 'called', 'llamar', [['my mother', 'a mi madre'], ['the doctor', 'al médico']], { punctual: true }),
  v('clean', 'clean', 'cleaned', 'cleaned', 'limpiar', [['the house', 'la casa'], ['the kitchen', 'la cocina']]),
  v('help', 'help', 'helped', 'helped', 'ayudar', [['my brother', 'a mi hermano'], ['the kids', 'a los niños']]),
  v('wait', 'wait', 'waited', 'waited', 'esperar', [['for the bus', 'el ómnibus'], ['for my friends', 'a mis amigos']]),
  v('walk', 'walk', 'walked', 'walked', 'caminar', [['to work', 'al trabajo'], ['in the park', 'en el parque']]),
  v('learn', 'learn', 'learned', 'learned', 'aprender', [['Italian', 'italiano'], ['a lot', 'mucho']]),
  v('drink', 'drink', 'drank', 'drunk', 'tomar', [['coffee', 'café'], ['mate', 'mate'], ['water', 'agua']]),
  v('eat', 'eat', 'ate', 'eaten', 'comer', [['fish', 'pescado'], ['a sandwich', 'un sándwich'], ['vegetables', 'verduras']]),
  v('read', 'read', 'read', 'read', 'leer', [['the newspaper', 'el diario'], ['a book', 'un libro'], ['the report', 'el informe']]),
  v('write', 'write', 'wrote', 'written', 'escribir', [['an email', 'un correo'], ['a letter', 'una carta'], ['a report', 'un informe']], { ing: 'writing' }),
  v('buy', 'buy', 'bought', 'bought', 'comprar', [['a car', 'un auto'], ['bread', 'pan'], ['new shoes', 'zapatos nuevos']]),
  v('sell', 'sell', 'sold', 'sold', 'vender', [['the house', 'la casa'], ['old books', 'libros viejos']]),
  v('see', 'see', 'saw', 'seen', 'ver', [['the match', 'el partido'], ['that movie', 'esa película']], { stative: true, rare: true }),
  v('go', 'go', 'went', 'gone', 'ir', [['to the beach', 'a la playa'], ['to the gym', 'al gimnasio'], ['to work', 'al trabajo']]),
  v('make', 'make', 'made', 'made', 'hacer', [['a cake', 'una torta'], ['dinner', 'la cena'], ['a plan', 'un plan']], { ing: 'making' }),
  v('do', 'do', 'did', 'done', 'hacer', [['the homework', 'la tarea'], ['exercise', 'ejercicio'], ['the shopping', 'las compras']]),
  v('have', 'have', 'had', 'had', 'tener', [['a dog', 'un perro'], ['a new job', 'un trabajo nuevo']], { stative: true }),
  v('take-bus', 'take', 'took', 'taken', 'tomar', [['the bus', 'el ómnibus'], ['a taxi', 'un taxi']], { ing: 'taking' }),
  v('take-photo', 'take', 'took', 'taken', 'sacar', [['photos', 'fotos'], ['a photo', 'una foto']], { ing: 'taking' }),
  v('speak', 'speak', 'spoke', 'spoken', 'hablar', [['English', 'inglés'], ['with the manager', 'con el gerente']]),
  v('drive', 'drive', 'drove', 'driven', 'manejar', [['to work', 'al trabajo'], ['to the coast', 'a la costa']], { ing: 'driving' }),
  v('swim', 'swim', 'swam', 'swum', 'nadar', [['in the sea', 'en el mar'], ['at the club', 'en el club']], { ing: 'swimming' }),
  v('run', 'run', 'ran', 'run', 'correr', [['in the park', 'en el parque'], ['by the river', 'junto al río']], { ing: 'running' }),
  v('sleep', 'sleep', 'slept', 'slept', 'dormir', [['in the car', 'en el auto'], ['at my aunt\'s house', 'en la casa de mi tía']]),
  v('lose', 'lose', 'lost', 'lost', 'perder', [['the keys', 'las llaves'], ['my wallet', 'mi billetera']], { punctual: true, rare: true, ing: 'losing' }),
  v('find', 'find', 'found', 'found', 'encontrar', [['a job', 'un trabajo'], ['the keys', 'las llaves']], { punctual: true, rare: true }),
  v('send', 'send', 'sent', 'sent', 'mandar', [['a message', 'un mensaje'], ['the documents', 'los documentos']], { punctual: true }),
  v('open', 'open', 'opened', 'opened', 'abrir', [['the window', 'la ventana'], ['a bank account', 'una cuenta en el banco']], { punctual: true }),
  v('close', 'close', 'closed', 'closed', 'cerrar', [['the door', 'la puerta'], ['the shop', 'el local']], { punctual: true, ing: 'closing' }),
  v('break', 'break', 'broke', 'broken', 'romper', [['the glass', 'el vaso'], ['my phone', 'mi celular']], { punctual: true, rare: true }),
  v('win', 'win', 'won', 'won', 'ganar', [['the match', 'el partido'], ['the lottery', 'la lotería']], { punctual: true, rare: true, ing: 'winning' }),
  v('pay', 'pay', 'paid', 'paid', 'pagar', [['the bill', 'la cuenta'], ['the rent', 'el alquiler']], { punctual: true }),
  v('listen', 'listen', 'listened', 'listened', 'escuchar', [['to music', 'música'], ['to the radio', 'la radio']]),
  v('visit', 'visit', 'visited', 'visited', 'visitar', [['my grandparents', 'a mis abuelos'], ['the museum', 'el museo']]),
  v('forget', 'forget', 'forgot', 'forgotten', 'olvidar', [['the keys', 'las llaves'], ['his birthday', 'su cumpleaños']], { punctual: true, rare: true, ing: 'forgetting' }),
  v('finish', 'finish', 'finished', 'finished', 'terminar', [['the report', 'el informe'], ['the course', 'el curso']], { punctual: true }),
  v('start', 'start', 'started', 'started', 'empezar', [['a new course', 'un curso nuevo'], ['the project', 'el proyecto']], { punctual: true }),
  v('understand', 'understand', 'understood', 'understood', 'entender', [['the question', 'la pregunta'], ['the problem', 'el problema']], { stative: true }),
  v('know', 'know', 'knew', 'known', 'saber', [['the answer', 'la respuesta'], ['the truth', 'la verdad']], { stative: true }),
  v('pass', 'pass', 'passed', 'passed', 'aprobar', [['the exam', 'el examen'], ['the test', 'la prueba']], { punctual: true, rare: true }),
  v('pick', 'pick up', 'picked up', 'picked up', 'pasar a buscar', [['the kids', 'a los niños'], ['my sister', 'a mi hermana']], { punctual: true, ing: 'picking up' }),
];

export interface Subject {
  en: string;
  /** Persona española: 0 yo · 1 vos · 2 él/ella/usted · 3 nosotros · 4 ellos */
  p: 0 | 1 | 2 | 3 | 4;
  /** Sujeto explícito en español ('' = se omite: "Trabajo…"). */
  es: string;
  /** Tercera persona singular en inglés (works, has, is). */
  third: boolean;
  /** Plural o I/you (were vs was). */
  were: boolean;
}

export const SUBJECTS: Subject[] = [
  { en: 'I', p: 0, es: '', third: false, were: false },
  { en: 'you', p: 1, es: '', third: false, were: true },
  { en: 'he', p: 2, es: 'él', third: true, were: false },
  { en: 'she', p: 2, es: 'ella', third: true, were: false },
  { en: 'we', p: 3, es: '', third: false, were: true },
  { en: 'they', p: 4, es: 'ellos', third: false, were: true },
  { en: 'Ana', p: 2, es: 'Ana', third: true, were: false },
  { en: 'my parents', p: 4, es: 'mis padres', third: false, were: true },
  { en: 'my brother', p: 2, es: 'mi hermano', third: true, were: false },
];
