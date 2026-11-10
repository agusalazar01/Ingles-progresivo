import type { Level } from './types';

/**
 * «Escribir en inglés»: de oraciones sueltas (A1) a un texto de 200 palabras sobre cualquier tema (B2).
 * Cada lección sigue el ciclo del enfoque por géneros: modelo → armado guiado → texto propio → revisión → reescritura.
 * Los modelos son originales de la app, escritos al largo y con los conectores de cada nivel.
 */
export type Genre = 'describe' | 'story' | 'opinion' | 'email' | 'compare';

export const GENRE_LABEL: Record<Genre, string> = {
  describe: 'Describir',
  story: 'Contar una historia',
  opinion: 'Dar tu opinión',
  email: 'Email o mensaje',
  compare: 'Comparar',
};

/** Función de cada parte del modelo: se pinta con un color y una etiqueta. */
export type PartRole = 'greet' | 'open' | 'body' | 'example' | 'turn' | 'close' | 'sign';

export const ROLE_LABEL: Record<PartRole, string> = {
  greet: 'Saludo',
  open: 'Presentás el tema',
  body: 'Desarrollo',
  example: 'Ejemplo o detalle',
  turn: 'La otra cara',
  close: 'Cierre',
  sign: 'Despedida',
};

export interface WritingLesson {
  id: string;
  level: Level;
  genre: Genre;
  title: string;
  /** Qué vas a aprender a hacer, en español. */
  goal: string;
  /** Largo pedido para tu texto. */
  words: number;
  model: { title: string; es: string; parts: { role: PartRole; text: string }[] };
  /** Cómo está armado el modelo, en español. */
  tip: string;
  /** Unir dos oraciones en una: `parts` = oraciones sueltas, `task` = qué usar, `answers` = respuestas aceptadas. */
  combine: { parts: string; task: string; answers: string[] }[];
  /** Temas para tu texto. */
  prompts: string[];
  /** Comienzos de oración para arrancar. */
  frames: string[];
}

const L = (x: WritingLesson) => x;

export const WRITING: WritingLesson[] = [
  // ───────────────────────────── A1 · unas 30 palabras ─────────────────────────────
  L({
    id: 'a1-me',
    level: 'A1',
    genre: 'describe',
    title: 'Presentarte',
    goal: 'Escribir oraciones cortas sobre vos: nombre, de dónde sos, dónde vivís y algo que tenés.',
    words: 30,
    model: {
      title: 'About me',
      es: 'Lucas se presenta: de dónde es, dónde vive y cómo es su perro.',
      parts: [
        { role: 'open', text: 'My name is Lucas and I am from Uruguay.' },
        { role: 'body', text: 'I live in a small house near the beach.' },
        { role: 'body', text: 'I have a dog called Toby.' },
        { role: 'example', text: 'He is brown and very friendly.' },
      ],
    },
    tip: 'Una idea por oración. Empezá por lo más general (quién sos) y terminá con un detalle. Usá and para unir dos datos.',
    combine: [
      { parts: 'My name is Ana. I am from Chile.', task: 'Unilas con and.', answers: ['My name is Ana and I am from Chile.', 'My name is Ana and I am Chilean.'] },
      { parts: 'I have a cat. She is black.', task: 'Una sola oración, sin and.', answers: ['I have a black cat.'] },
      { parts: 'I live in a flat. It is near the station.', task: 'Una sola oración.', answers: ['I live in a flat near the station.'] },
    ],
    prompts: ['Presentate: nombre, de dónde sos y dónde vivís.', 'Presentá a tu mascota o a un animal que te guste.', 'Presentá a tu mejor amigo o amiga.'],
    frames: ['My name is…', 'I am from…', 'I live in…', 'I have…'],
  }),
  L({
    id: 'a1-weekend',
    level: 'A1',
    genre: 'story',
    title: 'Mi fin de semana',
    goal: 'Contar qué hiciste en pasado simple, en orden.',
    words: 30,
    model: {
      title: 'My Saturday',
      es: 'Lucas cuenta su sábado: el mercado, la película y cómo estuvo el día.',
      parts: [
        { role: 'open', text: 'Last Saturday I went to the market with my sister.' },
        { role: 'body', text: 'We bought fruit and bread.' },
        { role: 'body', text: 'In the afternoon we watched a film at home.' },
        { role: 'close', text: 'It was a good day.' },
      ],
    },
    tip: 'Las historias van en pasado (went, bought, watched). Arrancá diciendo cuándo pasó y cerrá con cómo te sentiste.',
    combine: [
      { parts: 'We bought fruit. We bought bread.', task: 'Unilas con and, sin repetir.', answers: ['We bought fruit and bread.'] },
      { parts: 'I went to the beach. It was cold.', task: 'Unilas con but.', answers: ['I went to the beach but it was cold.', 'I went to the beach, but it was cold.'] },
      { parts: 'I was tired. I went to bed.', task: 'Unilas con and.', answers: ['I was tired and I went to bed.', 'I was tired and went to bed.'] },
    ],
    prompts: ['Contá qué hiciste el sábado pasado.', 'Contá qué hiciste ayer después del trabajo o del estudio.', 'Contá tu último cumpleaños.'],
    frames: ['Last Saturday I…', 'In the morning I…', 'In the afternoon we…', 'It was…'],
  }),
  L({
    id: 'a1-yesterday',
    level: 'A1',
    genre: 'story',
    title: 'Un día normal, en pasado',
    goal: 'Contar tu día de ayer paso a paso, con la hora y el orden.',
    words: 30,
    model: {
      title: 'Yesterday',
      es: 'Un día común: levantarse, ir a trabajar, cocinar y acostarse temprano.',
      parts: [
        { role: 'open', text: 'Yesterday I got up at seven.' },
        { role: 'body', text: 'I had a coffee and went to work by bus.' },
        { role: 'body', text: 'After work I cooked pasta.' },
        { role: 'close', text: 'I was tired, so I went to bed early.' },
      ],
    },
    tip: 'Seguí el orden del día. Palabras de tiempo al principio (Yesterday, After work) ayudan a que se entienda.',
    combine: [
      { parts: 'I had a coffee. I went to work.', task: 'Unilas con and, sin repetir I.', answers: ['I had a coffee and went to work.', 'I had coffee and went to work.'] },
      { parts: 'I was hungry. I made a sandwich.', task: 'Unilas con so.', answers: ['I was hungry, so I made a sandwich.', 'I was hungry so I made a sandwich.'] },
      { parts: 'I got up. It was seven o’clock.', task: 'Una sola oración con at.', answers: ['I got up at seven.', 'I got up at seven o’clock.', 'I got up at 7.'] },
    ],
    prompts: ['Contá tu día de ayer.', 'Contá el primer día en un trabajo o en una clase.', 'Contá un domingo lindo que tuviste.'],
    frames: ['Yesterday I got up at…', 'Then I…', 'After that I…', 'I was…, so I…'],
  }),
  L({
    id: 'a1-likes',
    level: 'A1',
    genre: 'opinion',
    title: 'Lo que me gusta y lo que no',
    goal: 'Decir qué te gusta, qué no y por qué, con because.',
    words: 30,
    model: {
      title: 'Summer and winter',
      es: 'A Lucas le gusta el verano y no le gusta el invierno, y dice por qué.',
      parts: [
        { role: 'open', text: 'I like the summer because the days are long.' },
        { role: 'example', text: 'I go to the beach with my friends.' },
        { role: 'turn', text: 'I don’t like the winter.' },
        { role: 'example', text: 'It is cold and dark.' },
      ],
    },
    tip: 'Una opinión necesita una razón: I like… because… Después, la otra cara: I don’t like…',
    combine: [
      { parts: 'I like dogs. They are friendly.', task: 'Unilas con because.', answers: ['I like dogs because they are friendly.'] },
      { parts: 'I don’t like the city. It is noisy.', task: 'Unilas con because.', answers: ['I don’t like the city because it is noisy.'] },
      { parts: 'I like tea. I don’t like coffee.', task: 'Unilas con but.', answers: ['I like tea but I don’t like coffee.', 'I like tea, but I don’t like coffee.', 'I like tea but not coffee.', 'I like tea, but not coffee.'] },
    ],
    prompts: ['¿Qué estación del año te gusta más y cuál menos?', '¿Te gusta más el mar o la montaña? ¿Por qué?', '¿Qué deporte te gusta y cuál no?'],
    frames: ['I like… because…', 'I don’t like…', 'It is…', 'I love…'],
  }),
  L({
    id: 'a1-food',
    level: 'A1',
    genre: 'opinion',
    title: 'Mi comida favorita',
    goal: 'Dar una opinión simple con I think y una razón.',
    words: 30,
    model: {
      title: 'Pizza',
      es: 'Lucas cuenta que su comida favorita es la pizza, cuándo la come y qué no le gusta.',
      parts: [
        { role: 'open', text: 'My favourite food is pizza.' },
        { role: 'body', text: 'I think it is delicious and cheap.' },
        { role: 'example', text: 'I eat it on Fridays with my family.' },
        { role: 'turn', text: 'I don’t like fish because it smells strong.' },
      ],
    },
    tip: 'I think + tu opinión. Agregá cuándo o con quién (on Fridays, with my family): son los detalles que hacen el texto tuyo.',
    combine: [
      { parts: 'My favourite drink is mate. It is hot and bitter.', task: 'Unilas con and.', answers: ['My favourite drink is mate and it is hot and bitter.'] },
      { parts: 'I eat pasta. I eat it on Sundays.', task: 'Una sola oración.', answers: ['I eat pasta on Sundays.'] },
      { parts: 'I don’t eat meat. I am vegetarian.', task: 'Unilas con because.', answers: ['I don’t eat meat because I am vegetarian.'] },
    ],
    prompts: ['¿Cuál es tu comida favorita y cuándo la comés?', '¿Qué comida no te gusta? ¿Por qué?', '¿Cuál es tu bebida favorita?'],
    frames: ['My favourite food is…', 'I think it is…', 'I eat it…', 'I don’t like…'],
  }),
  L({
    id: 'a1-message',
    level: 'A1',
    genre: 'email',
    title: 'Un mensaje a un amigo',
    goal: 'Escribir un mensaje corto con saludo y despedida.',
    words: 30,
    model: {
      title: 'Message to Sam',
      es: 'Lucas le escribe a Sam desde Sídney: dónde está, cómo es la ciudad y que lo llame.',
      parts: [
        { role: 'greet', text: 'Hi Sam,' },
        { role: 'open', text: 'I’m in Sydney now!' },
        { role: 'body', text: 'The city is big and beautiful. I’m staying in a hostel near the station.' },
        { role: 'close', text: 'Call me this weekend.' },
        { role: 'sign', text: 'Cheers, Lucas' },
      ],
    },
    tip: 'Saludo (Hi + nombre), la noticia, un detalle, qué querés que haga la otra persona y despedida (Cheers, See you, Love).',
    combine: [
      { parts: 'The city is big. The city is beautiful.', task: 'Unilas con and, sin repetir.', answers: ['The city is big and beautiful.'] },
      { parts: 'I’m in a hostel. It is near the beach.', task: 'Una sola oración.', answers: ['I’m in a hostel near the beach.', 'I am in a hostel near the beach.', 'I am staying in a hostel near the beach.'] },
      { parts: 'Call me. Call me on Sunday.', task: 'Una sola oración.', answers: ['Call me on Sunday.'] },
    ],
    prompts: ['Mandale un mensaje a un amigo contándole dónde estás.', 'Escribile a tu familia desde un viaje.', 'Invitá a un amigo a tomar algo el viernes.'],
    frames: ['Hi …,', 'I’m in…', 'It is…', 'Call me… / See you…'],
  }),

  // ───────────────────────────── A2 · unas 80 palabras ─────────────────────────────
  L({
    id: 'a2-town',
    level: 'A2',
    genre: 'describe',
    title: 'Mi ciudad',
    goal: 'Describir un lugar: qué hay, cómo es la gente, qué te gusta y un problema.',
    words: 80,
    model: {
      title: 'My town',
      es: 'Lucas describe su ciudad: el río, las termas, la gente, la comida y el problema del trabajo.',
      parts: [
        { role: 'open', text: 'I live in Salto, a city in the north of Uruguay. It is not very big, but it has everything I need.' },
        { role: 'body', text: 'There is a long river and a nice park next to it. In summer, people go to the hot springs near the city.' },
        { role: 'example', text: 'The streets are quiet and the people are friendly. I also like the food here, especially the asado on Sundays.' },
        { role: 'turn', text: 'The only problem is that there aren’t many jobs, so some young people move to Montevideo.' },
      ],
    },
    tip: 'Dónde está y cómo es en general → qué hay → lo que te gusta (also, especially) → un problema (The only problem is that…).',
    combine: [
      { parts: 'It is not very big. It has everything I need.', task: 'Unilas con but.', answers: ['It is not very big, but it has everything I need.', 'It is not very big but it has everything I need.', 'It isn’t very big, but it has everything I need.'] },
      { parts: 'There aren’t many jobs. Young people move to the capital.', task: 'Unilas con so.', answers: ['There aren’t many jobs, so young people move to the capital.', 'There aren’t many jobs so young people move to the capital.'] },
      { parts: 'There is a park. It is next to the river.', task: 'Una sola oración.', answers: ['There is a park next to the river.'] },
    ],
    prompts: ['Describí la ciudad o el pueblo donde vivís.', 'Describí un barrio que conozcas bien.', 'Describí una ciudad que visitaste.'],
    frames: ['I live in…, a city in…', 'There is / There are…', 'I also like…, especially…', 'The only problem is that…'],
  }),
  L({
    id: 'a2-trip',
    level: 'A2',
    genre: 'story',
    title: 'Un viaje',
    goal: 'Contar una historia en orden con first, then, when y after that.',
    words: 80,
    model: {
      title: 'A summer trip',
      es: 'Un viaje a Florianópolis con amigos: el ómnibus, el apartamento, la playa y una fiesta.',
      parts: [
        { role: 'open', text: 'Last summer I went to Florianópolis with two friends.' },
        { role: 'body', text: 'First, we took a bus from Montevideo. The trip was long, but we played cards and talked a lot.' },
        { role: 'body', text: 'When we arrived, we rented a small flat near the beach. Every morning we swam in the sea, and then we had a big breakfast.' },
        { role: 'example', text: 'One night we went to a party and met some people from Argentina.' },
        { role: 'close', text: 'It was the best holiday of my life, and I want to go back next year.' },
      ],
    },
    tip: 'Cuándo y con quién → los hechos en orden (First, When, then) → un momento especial (One night…) → cierre con cómo fue.',
    combine: [
      { parts: 'We arrived. We rented a flat.', task: 'Unilas con When.', answers: ['When we arrived, we rented a flat.', 'We rented a flat when we arrived.'] },
      { parts: 'The trip was long. We had fun.', task: 'Unilas con but.', answers: ['The trip was long, but we had fun.', 'The trip was long but we had fun.'] },
      { parts: 'We swam in the sea. We had breakfast.', task: 'Unilas con and then.', answers: ['We swam in the sea and then we had breakfast.', 'We swam in the sea, and then we had breakfast.', 'We swam in the sea and then had breakfast.'] },
    ],
    prompts: ['Contá un viaje que hiciste.', 'Contá unas vacaciones de cuando eras chico.', 'Contá una salida con amigos que salió muy bien.'],
    frames: ['Last summer I went to…', 'First, we…', 'When we arrived,…', 'One night…', 'It was the best…'],
  }),
  L({
    id: 'a2-bad-day',
    level: 'A2',
    genre: 'story',
    title: 'Un día que salió todo mal',
    goal: 'Contar una historia propia con un problema tras otro y un final.',
    words: 80,
    model: {
      title: 'A terrible Monday',
      es: 'Un lunes en el que falla el despertador, se va el ómnibus, llueve y el jefe se enoja, pero termina bien.',
      parts: [
        { role: 'open', text: 'Last Monday was a terrible day.' },
        { role: 'body', text: 'First, my alarm didn’t ring, so I woke up late. I ran to the bus stop, but the bus left before I got there.' },
        { role: 'body', text: 'Then it started to rain and I didn’t have an umbrella. When I finally arrived at work, my boss was angry.' },
        { role: 'close', text: 'In the evening, my friend called me and we went out for a pizza. After that, I felt much better.' },
      ],
    },
    tip: 'Anunciá el tipo de día en la primera oración. Cada problema en orden (First, Then, When) y un final que cambie el tono.',
    combine: [
      { parts: 'My alarm didn’t ring. I woke up late.', task: 'Unilas con so.', answers: ['My alarm didn’t ring, so I woke up late.', 'My alarm didn’t ring so I woke up late.'] },
      { parts: 'I ran to the stop. The bus left.', task: 'Unilas con but.', answers: ['I ran to the stop, but the bus left.', 'I ran to the stop but the bus left.'] },
      { parts: 'I arrived at work. My boss was angry.', task: 'Unilas con When.', answers: ['When I arrived at work, my boss was angry.', 'My boss was angry when I arrived at work.'] },
    ],
    prompts: ['Contá un día en el que todo te salió mal.', 'Contá una vez que llegaste tarde a algo importante.', 'Contá un problema en un viaje y cómo lo solucionaste.'],
    frames: ['Last … was a terrible day.', 'First,…, so…', 'Then…', 'When I finally…', 'After that, I felt…'],
  }),
  L({
    id: 'a2-country',
    level: 'A2',
    genre: 'opinion',
    title: '¿Ciudad o campo?',
    goal: 'Dar tu opinión con dos razones y reconocer un problema.',
    words: 80,
    model: {
      title: 'Country life',
      es: 'Lucas opina que vivir en el campo es mejor: aire limpio, vida más barata, gente que se conoce, aunque falten tiendas.',
      parts: [
        { role: 'open', text: 'I think living in the country is better than living in a big city.' },
        { role: 'body', text: 'First, the air is cleaner and there is less noise. Also, life is cheaper, so you can save more money.' },
        { role: 'example', text: 'People in small towns know each other and help each other.' },
        { role: 'turn', text: 'Of course, there are some problems. There aren’t many shops, and you need a car to go everywhere.' },
        { role: 'close', text: 'But for me, a quiet life is more important than shopping.' },
      ],
    },
    tip: 'Opinión clara en la primera oración (I think…) → razones (First, Also) → la otra cara (Of course,…) → volvé a tu opinión (But for me,…).',
    combine: [
      { parts: 'Life is cheaper. You can save money.', task: 'Unilas con so.', answers: ['Life is cheaper, so you can save money.', 'Life is cheaper so you can save money.'] },
      { parts: 'The country is quiet. The city is noisy.', task: 'Unilas con but.', answers: ['The country is quiet, but the city is noisy.', 'The country is quiet but the city is noisy.'] },
      { parts: 'A quiet life is important. Shopping is less important.', task: 'Una oración con more important than.', answers: ['A quiet life is more important than shopping.'] },
    ],
    prompts: ['¿Dónde preferís vivir: ciudad o campo?', '¿Es mejor tener auto o andar en bicicleta?', '¿Es mejor vivir solo o con amigos?'],
    frames: ['I think … is better than…', 'First,…', 'Also,…, so…', 'Of course,…', 'But for me,…'],
  }),
  L({
    id: 'a2-phones',
    level: 'A2',
    genre: 'opinion',
    title: 'El celular y las redes',
    goal: 'Opinar sobre algo de todos los días con un ejemplo propio.',
    words: 80,
    model: {
      title: 'Social media',
      es: 'Las redes son útiles para hablar con la familia lejos, pero Lucas cree que las usamos demasiado.',
      parts: [
        { role: 'open', text: 'Social media is useful, but I think we use it too much.' },
        { role: 'body', text: 'I use Instagram every day to talk to my friends and see their photos. That is good because my family lives far away.' },
        { role: 'turn', text: 'But I often spend two hours on my phone at night, and then I can’t sleep. Some people only show the good parts of their life, so we feel bad about ours.' },
        { role: 'close', text: 'In my opinion, social media is fine for thirty minutes a day, but not more.' },
      ],
    },
    tip: 'Un ejemplo tuyo (I use… every day) vale más que una idea general. Cerrá con In my opinion + una propuesta concreta.',
    combine: [
      { parts: 'Social media is useful. We use it too much.', task: 'Unilas con but.', answers: ['Social media is useful, but we use it too much.', 'Social media is useful but we use it too much.'] },
      { parts: 'I use WhatsApp. My family lives far away.', task: 'Unilas con because.', answers: ['I use WhatsApp because my family lives far away.'] },
      { parts: 'I use my phone at night. I can’t sleep.', task: 'Unilas con and then.', answers: ['I use my phone at night and then I can’t sleep.', 'I use my phone at night, and then I can’t sleep.'] },
    ],
    prompts: ['¿Usamos demasiado el celular?', '¿Es bueno que los chicos tengan celular?', '¿Las series y el streaming son buenos o malos para nosotros?'],
    frames: ['… is useful, but I think…', 'I use … every day to…', 'But I often…', 'In my opinion,…'],
  }),
  L({
    id: 'a2-invite',
    level: 'A2',
    genre: 'email',
    title: 'Email de invitación',
    goal: 'Invitar a alguien: qué, cuándo, dónde, y pedir respuesta.',
    words: 80,
    model: {
      title: 'Birthday party',
      es: 'Lucas invita a Mia a su cumpleaños: un asado, el fútbol, la hora y qué llevar.',
      parts: [
        { role: 'greet', text: 'Hi Mia,' },
        { role: 'open', text: 'How are you? I’m writing because it’s my birthday next Saturday and I’m having a small party at my place.' },
        { role: 'body', text: 'We’re going to have a barbecue in the garden, and then we can watch the football. It starts at 7 pm.' },
        { role: 'example', text: 'You don’t need to bring anything, but if you want, you can bring something to drink.' },
        { role: 'close', text: 'Can you come? Let me know by Thursday, please.' },
        { role: 'sign', text: 'See you soon, Lucas' },
      ],
    },
    tip: 'Saludo → por qué escribís (I’m writing because…) → los datos (qué, cuándo, dónde) → qué traer → pedí respuesta → despedida.',
    combine: [
      { parts: 'It’s my birthday. I’m having a party.', task: 'Unilas con and.', answers: ['It’s my birthday and I’m having a party.', 'It is my birthday and I am having a party.'] },
      { parts: 'We’re going to have a barbecue. We can watch the football.', task: 'Unilas con and then.', answers: ['We’re going to have a barbecue and then we can watch the football.', 'We’re going to have a barbecue, and then we can watch the football.'] },
      { parts: 'You don’t need to bring anything. You can bring a drink.', task: 'Unilas con but.', answers: ['You don’t need to bring anything, but you can bring a drink.', 'You don’t need to bring anything but you can bring a drink.'] },
    ],
    prompts: ['Invitá a un amigo a tu cumpleaños.', 'Invitá a tus compañeros a una salida el fin de semana.', 'Invitá a un amigo de otro país a visitarte.'],
    frames: ['Hi …,', 'I’m writing because…', 'We’re going to…', 'It starts at…', 'Can you come? Let me know…'],
  }),
  L({
    id: 'a2-then-now',
    level: 'A2',
    genre: 'compare',
    title: 'Antes y ahora',
    goal: 'Comparar tu vida de antes con la de ahora (pasado y presente).',
    words: 80,
    model: {
      title: 'Ten years ago',
      es: 'Lucas compara su vida de estudiante con la de ahora: trabajo, plata, deporte y amigos.',
      parts: [
        { role: 'open', text: 'Ten years ago my life was very different.' },
        { role: 'body', text: 'I lived with my parents and I was a student. I didn’t have a job, so I didn’t have much money.' },
        { role: 'body', text: 'Now I live alone and I work at a hotel. I’m busier than before, but I’m also happier.' },
        { role: 'example', text: 'In the past I played football every weekend. Now I prefer walking with my dog.' },
        { role: 'close', text: 'My friends are the same, but we don’t see each other as often as before.' },
      ],
    },
    tip: 'Pasado para el antes (lived, was), presente para el ahora (live, am). Marcá el cambio con Now / In the past y comparativos (busier than).',
    combine: [
      { parts: 'I’m busy now. I was less busy before.', task: 'Una oración con busier than before.', answers: ['I’m busier than before.', 'I am busier than before.', 'Now I’m busier than before.', 'Now I am busier than before.'] },
      { parts: 'I didn’t have a job. I didn’t have much money.', task: 'Unilas con so.', answers: ['I didn’t have a job, so I didn’t have much money.', 'I didn’t have a job so I didn’t have much money.'] },
      { parts: 'In the past I played football. Now I prefer walking.', task: 'Unilas con but.', answers: ['In the past I played football, but now I prefer walking.', 'In the past I played football but now I prefer walking.'] },
    ],
    prompts: ['Compará tu vida de hace diez años con la de ahora.', 'Compará tu ciudad de cuando eras chico con la de hoy.', 'Compará cómo te comunicabas antes y cómo lo hacés ahora.'],
    frames: ['Ten years ago…', 'I lived / I was…', 'Now I…', '…than before', 'In the past…, now…'],
  }),

  // ───────────────────────────── B1 · unas 150 palabras ─────────────────────────────
  L({
    id: 'b1-person',
    level: 'B1',
    genre: 'describe',
    title: 'Una persona importante',
    goal: 'Describir a alguien: cómo es, un recuerdo y qué aprendiste de esa persona.',
    words: 150,
    model: {
      title: 'My grandmother',
      es: 'La abuela de Lucas: el campo, cómo es, las tardes cocinando juntos y lo que él aprendió de ella.',
      parts: [
        { role: 'open', text: 'The most important person in my life is my grandmother, Rosa. She is eighty-two years old and she still lives on the small farm where she was born.' },
        { role: 'body', text: 'Although she has worked hard all her life, she is always calm and patient. She gets up before sunrise, feeds the chickens and listens to the radio while she makes bread. She doesn’t use a mobile phone, but she knows everything that happens in town.' },
        { role: 'example', text: 'When I was a child, I spent every summer with her. I remember the long afternoons in her kitchen, when she taught me to cook and told me stories about my grandfather.' },
        { role: 'close', text: 'From her I learnt that you don’t need much to be happy. Whenever I feel stressed, I call her, and after five minutes I always feel better.' },
      ],
    },
    tip: 'Quién es → cómo es por dentro (con un ejemplo de lo que hace) → un recuerdo concreto → qué te dejó. Although y while dan oraciones más ricas.',
    combine: [
      { parts: 'She has worked hard all her life. She is always calm.', task: 'Unilas con Although.', answers: ['Although she has worked hard all her life, she is always calm.', 'She is always calm although she has worked hard all her life.'] },
      { parts: 'She listens to the radio. She makes bread at the same time.', task: 'Unilas con while.', answers: ['She listens to the radio while she makes bread.', 'She listens to the radio while making bread.', 'While she makes bread, she listens to the radio.'] },
      { parts: 'She lives on a farm. She was born there.', task: 'Una oración con where.', answers: ['She lives on the farm where she was born.', 'She lives on a farm where she was born.'] },
    ],
    prompts: ['Describí a una persona que fue importante en tu vida.', 'Describí a un profesor o jefe del que aprendiste mucho.', 'Describí a un amigo que conocés hace muchos años.'],
    frames: ['The most important person in my life is…', 'Although…, he/she…', 'When I was a child,…', 'From him/her I learnt that…'],
  }),
  L({
    id: 'b1-lost',
    level: 'B1',
    genre: 'story',
    title: 'Una experiencia que no olvido',
    goal: 'Contar una historia con un problema, cómo te sentiste y qué aprendiste.',
    words: 150,
    model: {
      title: 'Lost in São Paulo',
      es: 'Lucas se pierde en São Paulo con el celular sin batería, una señora lo ayuda y aprende algo sobre pedir ayuda.',
      parts: [
        { role: 'open', text: 'A few years ago, I travelled to São Paulo for a job interview. It was my first time in such a huge city, and I was quite nervous.' },
        { role: 'body', text: 'On the second day, I went out to buy a present for my mum. While I was walking around the centre, my phone ran out of battery. Suddenly I realised that I didn’t know the name of my hotel, and I couldn’t speak Portuguese well.' },
        { role: 'example', text: 'I walked for almost an hour, feeling more and more worried. Finally, I went into a small café and explained my problem to the owner. She lent me her charger, gave me a coffee and showed me the way on a map.' },
        { role: 'close', text: 'Since that day, I always write my address on a piece of paper. I also learnt that most people are happy to help if you just ask.' },
      ],
    },
    tip: 'Situación (cuándo, dónde, cómo estabas) → el problema (While I was…, Suddenly…) → cómo se resolvió (Finally…) → lo que aprendiste. Pasado continuo para el fondo, pasado simple para los hechos.',
    combine: [
      { parts: 'I was walking around the centre. My phone ran out of battery.', task: 'Unilas con While.', answers: ['While I was walking around the centre, my phone ran out of battery.', 'My phone ran out of battery while I was walking around the centre.'] },
      { parts: 'I walked for an hour. I felt more and more worried.', task: 'Una oración con feeling.', answers: ['I walked for an hour, feeling more and more worried.', 'I walked for an hour feeling more and more worried.'] },
      { parts: 'She lent me her charger. She gave me a coffee.', task: 'Unilas sin repetir she.', answers: ['She lent me her charger and gave me a coffee.'] },
    ],
    prompts: ['Contá una vez que te perdiste o tuviste un problema en un viaje.', 'Contá una experiencia que te enseñó algo.', 'Contá el día en que conociste a alguien importante para vos.'],
    frames: ['A few years ago,…', 'While I was…,…', 'Suddenly I realised that…', 'Finally,…', 'Since that day,…'],
  }),
  L({
    id: 'b1-thongs',
    level: 'B1',
    genre: 'story',
    title: 'Un malentendido con el idioma',
    goal: 'Contar una anécdota graciosa con diálogo corto y un final.',
    words: 150,
    model: {
      title: 'The wrong word',
      es: 'En Australia, Lucas pide «thongs» sin saber que ahí son ojotas; la confusión termina en risas y una palabra aprendida.',
      parts: [
        { role: 'open', text: 'When I first arrived in Australia, my English was okay, but I didn’t know much slang. One hot afternoon, my flatmate Jess invited me to the beach.' },
        { role: 'body', text: 'Before we left, she asked, “Have you got your thongs?” I was shocked, because in American films a thong is a very small piece of underwear. I went red and said, “I’m not going to wear that in front of everyone!” For a few seconds, neither of us said anything.' },
        { role: 'example', text: 'Jess looked confused for a moment. Then she pointed at her feet and started laughing. In Australia, thongs are just flip-flops, the cheap rubber sandals that everyone wears in summer. She explained that the underwear is called a G-string there, which made me laugh even more.' },
        { role: 'close', text: 'We laughed about it all the way to the beach. Now, whenever someone uses a word I don’t know, I ask before I panic.' },
      ],
    },
    tip: 'Un poco de diálogo con comillas le da vida. Mostrá la reacción (I went red, she started laughing) en vez de solo decir «fue gracioso».',
    combine: [
      { parts: 'I was shocked. A thong is underwear in American films.', task: 'Unilas con because.', answers: ['I was shocked because a thong is underwear in American films.', 'I was shocked, because a thong is underwear in American films.'] },
      { parts: 'Thongs are flip-flops. Everyone wears them in summer.', task: 'Una oración con that.', answers: ['Thongs are flip-flops that everyone wears in summer.', 'Thongs are flip-flops which everyone wears in summer.', 'Thongs are flip-flops everyone wears in summer.'] },
      { parts: 'Someone uses a word I don’t know. I ask.', task: 'Unilas con whenever.', answers: ['Whenever someone uses a word I don’t know, I ask.', 'I ask whenever someone uses a word I don’t know.'] },
    ],
    prompts: ['Contá un malentendido por el idioma (en inglés o en otro idioma).', 'Contá una situación vergonzosa que hoy te da risa.', 'Contá una vez que no entendiste una costumbre de otro lugar.'],
    frames: ['When I first arrived in…,', 'One day,…', 'She/He asked, “…?”', 'Then…', 'Now, whenever…'],
  }),
  L({
    id: 'b1-home-office',
    level: 'B1',
    genre: 'opinion',
    title: '¿Trabajar desde casa?',
    goal: 'Opinar con ventajas, desventajas y tu conclusión, en tres párrafos.',
    words: 150,
    model: {
      title: 'Working from home',
      es: 'Ventajas y desventajas de trabajar desde casa; Lucas propone un sistema mixto.',
      parts: [
        { role: 'open', text: 'Since 2020, many people have started working from home. In my opinion, it has more advantages than disadvantages, but only for some jobs.' },
        { role: 'body', text: 'The biggest advantage is time. People who work from home don’t spend hours on buses or in traffic, so they have more time for their families and for exercise. They can also save money on transport and lunch.' },
        { role: 'turn', text: 'However, working at home can be lonely. It is harder to ask a colleague a quick question, and some people find it difficult to stop working at the end of the day. For example, my brother often answers emails at midnight.' },
        { role: 'close', text: 'To sum up, I think the best option is to mix both: two or three days at home and the rest in the office. That way, workers get the freedom they want without losing contact with their team.' },
      ],
    },
    tip: 'Párrafo 1: tema + tu opinión. Párrafo 2: ventajas. Párrafo 3: desventajas (However,…) con un ejemplo. Párrafo 4: conclusión (To sum up,…) con una propuesta.',
    combine: [
      { parts: 'They don’t travel to work. They have more free time.', task: 'Unilas con so.', answers: ['They don’t travel to work, so they have more free time.', 'They don’t travel to work so they have more free time.'] },
      { parts: 'Working at home is comfortable. It can be lonely.', task: 'Dos oraciones: la segunda con However,', answers: ['Working at home is comfortable. However, it can be lonely.'] },
      { parts: 'People work from home. They save money.', task: 'Una oración con who.', answers: ['People who work from home save money.'] },
    ],
    prompts: ['¿Es mejor trabajar desde casa o en una oficina?', '¿Habría que trabajar cuatro días por semana?', '¿Es mejor estudiar en línea o en persona?'],
    frames: ['In my opinion,…', 'The biggest advantage is…', 'However,…', 'For example,…', 'To sum up,…'],
  }),
  L({
    id: 'b1-languages',
    level: 'B1',
    genre: 'opinion',
    title: '¿Viajar es la mejor forma de aprender un idioma?',
    goal: 'Opinar usando tu propia experiencia como prueba.',
    words: 150,
    model: {
      title: 'Learning by travelling',
      es: 'Lucas cree que viajar ayuda mucho, pero no alcanza sin estudiar antes; usa su experiencia en Brasil.',
      parts: [
        { role: 'open', text: 'Many people believe that travelling is the best way to learn a language. I partly agree, but I don’t think it is enough on its own.' },
        { role: 'body', text: 'It is true that living abroad forces you to speak. You have to order food, ask for directions and make friends, so you practise every day without noticing. You also hear the real accent, not the slow version from textbooks.' },
        { role: 'turn', text: 'On the other hand, if you arrive with no basic grammar, you only learn a few phrases. When I went to Brazil, I spent three months there, but I came back speaking very little Portuguese because I always stayed with other Uruguayans.' },
        { role: 'close', text: 'In my view, the ideal plan is to study the basics at home first and then travel. Travelling makes your language natural, but studying gives it a strong base.' },
      ],
    },
    tip: 'Mostrá que entendés la otra postura (It is true that…) antes de dar la tuya (On the other hand,…). Tu experiencia es el mejor ejemplo.',
    combine: [
      { parts: 'You practise every day. You don’t notice it.', task: 'Una oración con without noticing.', answers: ['You practise every day without noticing.', 'You practise every day without noticing it.'] },
      { parts: 'I spent three months there. I came back speaking very little.', task: 'Unilas con but.', answers: ['I spent three months there, but I came back speaking very little.', 'I spent three months there but I came back speaking very little.'] },
      { parts: 'Study the basics first. Then travel.', task: 'Una oración con before.', answers: ['Study the basics before you travel.', 'Study the basics before travelling.', 'Study the basics before traveling.'] },
    ],
    prompts: ['¿Viajar es la mejor forma de aprender un idioma?', '¿Hace falta ir a la universidad para tener un buen trabajo?', '¿Es mejor aprender de chico o de grande?'],
    frames: ['Many people believe that…', 'I partly agree, but…', 'It is true that…', 'On the other hand,…', 'In my view,…'],
  }),
  L({
    id: 'b1-enquiry',
    level: 'B1',
    genre: 'email',
    title: 'Email para pedir información',
    goal: 'Escribir un email semiformal: presentarte, preguntar y agradecer.',
    words: 150,
    model: {
      title: 'English course enquiry',
      es: 'Lucas escribe a una escuela de inglés de Melbourne para preguntar por horarios, precio y alojamiento.',
      parts: [
        { role: 'greet', text: 'Dear Sir or Madam,' },
        { role: 'open', text: 'I am writing to ask for some information about the evening English courses on your website. I am from Uruguay and I am planning to move to Melbourne next March.' },
        { role: 'body', text: 'My level is intermediate, so I would like to join a B2 class. Could you tell me how many hours a week the course has and how many students there are in each group? I would also like to know the total price, including books.' },
        { role: 'example', text: 'In addition, I am looking for somewhere to live for my first month. Do you help students find accommodation, for example with a host family? If so, I would be grateful if you could send me the prices and tell me how far the families usually live from the school.' },
        { role: 'close', text: 'Thank you in advance for your help. I look forward to hearing from you.' },
        { role: 'sign', text: 'Kind regards, Lucas Pereira' },
      ],
    },
    tip: 'Dear… → por qué escribís (I am writing to…) → quién sos → preguntas indirectas y amables (Could you tell me…?, I would like to know…) → agradecimiento → Kind regards.',
    combine: [
      { parts: 'How many hours does the course have? Could you tell me?', task: 'Una pregunta indirecta con Could you tell me…', answers: ['Could you tell me how many hours the course has?'] },
      { parts: 'What is the total price? I would like to know.', task: 'Una oración con I would like to know…', answers: ['I would like to know the total price.', 'I would like to know what the total price is.'] },
      { parts: 'My level is intermediate. I would like to join a B2 class.', task: 'Unilas con so.', answers: ['My level is intermediate, so I would like to join a B2 class.', 'My level is intermediate so I would like to join a B2 class.'] },
    ],
    prompts: ['Escribí a una escuela para pedir información de un curso.', 'Escribí a un hostel para preguntar por precios y disponibilidad.', 'Escribí a una empresa para preguntar si tienen trabajo de temporada.'],
    frames: ['Dear Sir or Madam,', 'I am writing to ask…', 'Could you tell me…?', 'I would also like to know…', 'I look forward to hearing from you.'],
  }),
  L({
    id: 'b1-flatshare',
    level: 'B1',
    genre: 'compare',
    title: 'Vivir solo o compartir',
    goal: 'Comparar dos opciones punto por punto y decir cuál elegís.',
    words: 150,
    model: {
      title: 'Living alone or sharing',
      es: 'Lucas compara vivir solo con compartir casa: plata, tranquilidad y compañía; elige compartir por ahora.',
      parts: [
        { role: 'open', text: 'I have lived alone and I have also shared a house with three friends, so I know both options quite well.' },
        { role: 'body', text: 'The main difference is money. When you share, the rent and the bills are much cheaper. When I lived alone, more than half of my salary went on rent, while in a shared house I spend less than a third.' },
        { role: 'turn', text: 'Living alone, however, is much more peaceful. Nobody uses your food, the kitchen is always clean and you can sleep whenever you want. In a shared house there is always noise, especially at weekends.' },
        { role: 'close', text: 'Overall, I prefer sharing at this stage of my life. It is cheaper and less lonely, and I have learnt a lot from my flatmates. Maybe in a few years I will want my own place again.' },
      ],
    },
    tip: 'Compará por temas (plata, tranquilidad), no una opción entera y después la otra. While y however marcan el contraste. Cerrá eligiendo (Overall, I prefer…).',
    combine: [
      { parts: 'Alone I spent half my salary on rent. Now I spend a third.', task: 'Unilas con while.', answers: ['Alone I spent half my salary on rent, while now I spend a third.', 'Alone I spent half my salary on rent while now I spend a third.'] },
      { parts: 'Sharing is cheaper. It is less lonely.', task: 'Una oración con and.', answers: ['Sharing is cheaper and less lonely.'] },
      { parts: 'There is always noise. It is worse at weekends.', task: 'Una oración con especially.', answers: ['There is always noise, especially at weekends.', 'There is always noise, especially on weekends.', 'There is always noise, especially on the weekend.', 'There is always noise, especially at the weekend.'] },
    ],
    prompts: ['Compará vivir solo con compartir casa.', 'Compará viajar en avión con viajar en ómnibus o auto.', 'Compará trabajar de día con trabajar de noche.'],
    frames: ['I have … and I have also…', 'The main difference is…', 'When…, while…', '…, however, is…', 'Overall, I prefer…'],
  }),

  // ───────────────────────────── B2 · unas 200 palabras ─────────────────────────────
  L({
    id: 'b2-place',
    level: 'B2',
    genre: 'describe',
    title: 'Un lugar que recomendarías',
    goal: 'Describir un lugar con detalles que se ven y se sienten, y convencer al lector de ir.',
    words: 200,
    model: {
      title: 'Cabo Polonio',
      es: 'Lucas recomienda Cabo Polonio: sin rutas ni luz eléctrica, con lobos marinos y cielo estrellado, y da consejos para ir.',
      parts: [
        { role: 'open', text: 'If you ever visit Uruguay, there is one place you should not miss: Cabo Polonio, a tiny fishing village on the Atlantic coast. What makes it special is not what it has, but what it doesn’t have.' },
        { role: 'body', text: 'There are no roads, so the only way to get there is by crossing the sand dunes in an old four-wheel-drive truck. Most houses have no electricity, which means that at night the whole village is lit only by candles and the lighthouse. As a result, the sky is full of stars, more than I had ever seen before.' },
        { role: 'example', text: 'During the day, you can walk along wide empty beaches or watch hundreds of sea lions resting on the rocks below the lighthouse. In the evening, people gather at the few small restaurants to eat fresh fish and listen to someone playing the guitar.' },
        { role: 'close', text: 'Admittedly, it is not the place for everyone. If you need hot showers and fast wifi, you may hate it. However, if you are looking for silence and a break from your phone, I cannot think of a better place. Go in March, when the crowds have left but the water is still warm.' },
      ],
    },
    tip: 'Arrancá con un gancho (What makes it special is…). Detalles concretos de los sentidos. Reconocé un punto débil (Admittedly,…) y cerrá con un consejo práctico.',
    combine: [
      { parts: 'Most houses have no electricity. At night the village is lit by candles.', task: 'Una oración con which means that.', answers: ['Most houses have no electricity, which means that at night the village is lit by candles.', 'Most houses have no electricity, which means at night the village is lit by candles.'] },
      { parts: 'It is not special because of what it has. It is special because of what it doesn’t have.', task: 'Una oración con not…, but…', answers: ['It is special not because of what it has, but because of what it doesn’t have.', 'It is special not because of what it has but because of what it doesn’t have.'] },
      { parts: 'Go in March. The crowds have left then.', task: 'Una oración con when.', answers: ['Go in March, when the crowds have left.', 'Go in March when the crowds have left.'] },
    ],
    prompts: ['Recomendá un lugar de tu país a un turista.', 'Describí un lugar al que te gustaría volver y por qué.', 'Recomendá un bar, restaurante o café que te guste.'],
    frames: ['If you ever visit…, there is one place…', 'What makes it special is…', '…, which means that…', 'Admittedly,…', 'However, if you are looking for…'],
  }),
  L({
    id: 'b2-decision',
    level: 'B2',
    genre: 'story',
    title: 'Una decisión difícil',
    goal: 'Contar una decisión importante: el antes, la duda, lo que pasó y cómo lo ves hoy.',
    words: 200,
    model: {
      title: 'Leaving my job',
      es: 'Lucas deja un trabajo seguro para viajar; cuenta la duda, la reacción de su familia y lo que ganó.',
      parts: [
        { role: 'open', text: 'Two years ago, I made the hardest decision of my life: I left a safe job at a bank to travel and work abroad. At the time, almost everyone thought I was making a mistake.' },
        { role: 'body', text: 'I had been working there for six years, and on paper my life was perfect. I earned a good salary, I had my own car and I was about to get a promotion. Nevertheless, I felt that every week was exactly the same as the one before. I kept thinking about the trips I had never taken.' },
        { role: 'example', text: 'For months I couldn’t make up my mind. My parents were worried, and my boss even offered me more money to stay. In the end, it was a conversation with my grandmother that changed everything. “You can always find another job,” she told me, “but you can’t get your thirties back.”' },
        { role: 'close', text: 'Looking back, I don’t regret it at all. I have less money than before and my future is less certain. On the other hand, I have learnt a new language, met people from all over the world and, most importantly, I have discovered what I really enjoy doing.' },
      ],
    },
    tip: 'Contá el contexto con pasado perfecto continuo (I had been working…), la duda (couldn’t make up my mind), el punto de quiebre (In the end,…) y una reflexión de hoy (Looking back,…).',
    combine: [
      { parts: 'I had a good salary. I felt every week was the same.', task: 'Dos oraciones: la segunda con Nevertheless,', answers: ['I had a good salary. Nevertheless, I felt every week was the same.', 'I had a good salary. Nevertheless, I felt that every week was the same.'] },
      { parts: 'I started working there six years ago. I still worked there when I left.', task: 'Una oración con I had been working there for…', answers: ['I had been working there for six years.', 'I had been working there for six years when I left.'] },
      { parts: 'A conversation with my grandmother changed everything.', task: 'Empezá con It was… that', answers: ['It was a conversation with my grandmother that changed everything.'] },
    ],
    prompts: ['Contá una decisión difícil que tomaste.', 'Contá un cambio grande en tu vida y cómo lo ves hoy.', 'Contá una vez que hiciste algo aunque otros te dijeran que no.'],
    frames: ['… ago, I made…', 'I had been…ing for…', 'Nevertheless,…', 'In the end,…', 'Looking back,…'],
  }),
  L({
    id: 'b2-challenge',
    level: 'B2',
    genre: 'story',
    title: 'Un desafío que superé',
    goal: 'Contar cómo superaste algo difícil, con causas, emociones y resultado.',
    words: 200,
    model: {
      title: 'My first presentation',
      es: 'Lucas, que le tenía terror a hablar en público, se prepara para una presentación en inglés y termina saliendo bien.',
      parts: [
        { role: 'open', text: 'For most of my life, speaking in public terrified me. At school, I used to pretend to be sick whenever we had to give a talk, so I never really learnt how to do it.' },
        { role: 'body', text: 'Last year, my manager asked me to present our results to some clients from Canada. To make things worse, the presentation had to be in English. My first reaction was to say no, but I realised that if I avoided it again, I would never get over my fear.' },
        { role: 'example', text: 'I prepared for three weeks. Not only did I write every slide carefully, but I also recorded myself every night and listened to the mistakes. A friend who teaches English helped me with the pronunciation of the difficult words. Even so, on the day of the presentation my hands were shaking.' },
        { role: 'close', text: 'Surprisingly, once I started talking, the nerves disappeared. The clients asked lots of questions, which showed they were interested, and my manager congratulated me afterwards. Since then, I have given four more presentations. I still get nervous, but now I know that preparation makes all the difference.' },
      ],
    },
    tip: 'El miedo de antes (used to) → el desafío → lo que hiciste para prepararte (Not only… but also…) → el momento clave (once I started…) → el resultado hoy.',
    combine: [
      { parts: 'I wrote every slide carefully. I recorded myself every night.', task: 'Una oración con Not only did I…, but I also…', answers: ['Not only did I write every slide carefully, but I also recorded myself every night.', 'Not only did I write every slide carefully but I also recorded myself every night.'] },
      { parts: 'If I avoid it again, I will never get over my fear.', task: 'Pasala a pasado: I realised that if I avoided…', answers: ['I realised that if I avoided it again, I would never get over my fear.', 'I realized that if I avoided it again, I would never get over my fear.'] },
      { parts: 'The clients asked lots of questions. This showed they were interested.', task: 'Una oración con which.', answers: ['The clients asked lots of questions, which showed they were interested.', 'The clients asked lots of questions, which showed that they were interested.'] },
    ],
    prompts: ['Contá un miedo o desafío que superaste.', 'Contá algo que te costó mucho aprender.', 'Contá una vez que tuviste que hablar o trabajar en otro idioma.'],
    frames: ['For most of my life,…', 'I used to…', 'My first reaction was…, but…', 'Not only did I…, but I also…', 'Since then,…'],
  }),
  L({
    id: 'b2-four-days',
    level: 'B2',
    genre: 'opinion',
    title: 'Ensayo de opinión: la semana de cuatro días',
    goal: 'Escribir un ensayo de opinión de cuatro párrafos con argumentos, contraargumento y conclusión.',
    words: 200,
    model: {
      title: 'A four-day working week',
      es: 'Lucas defiende la semana de cuatro días: más productividad y descanso, aunque no sirva igual para todos los trabajos.',
      parts: [
        { role: 'open', text: 'In several countries, companies are testing a four-day working week with the same salary. Although the idea sounds too good to be true, I believe it would benefit both workers and employers.' },
        { role: 'body', text: 'Firstly, rested employees tend to be more productive. When people have three days to rest, see their families and deal with personal tasks, they come back to work with more energy and fewer distractions. Furthermore, companies that have tried it report fewer sick days and lower staff turnover, which saves them money in the long run.' },
        { role: 'turn', text: 'Admittedly, this model does not suit every job. Hospitals, restaurants and shops need to be open every day, so they would have to hire more staff or organise complicated shifts. Nevertheless, these problems are not impossible to solve, and the system could be adapted to each sector.' },
        { role: 'close', text: 'In conclusion, while a four-day week may not work everywhere, the evidence suggests that most office jobs could adopt it without losing productivity. If governments and companies introduced it gradually, I am convinced that we would see healthier and happier workers.' },
      ],
    },
    tip: 'Introducción con el tema y tu postura (I believe…) → argumentos (Firstly, Furthermore) → contraargumento y respuesta (Admittedly…, Nevertheless…) → conclusión que resume sin repetir (In conclusion, while…).',
    combine: [
      { parts: 'The idea sounds too good to be true. I believe it would work.', task: 'Una oración con Although.', answers: ['Although the idea sounds too good to be true, I believe it would work.', 'I believe it would work although the idea sounds too good to be true.'] },
      { parts: 'Companies report fewer sick days. This saves them money.', task: 'Una oración con which.', answers: ['Companies report fewer sick days, which saves them money.'] },
      { parts: 'Governments could introduce it gradually. Then we would see happier workers.', task: 'Una condicional: If governments introduced…', answers: ['If governments introduced it gradually, we would see happier workers.', 'We would see happier workers if governments introduced it gradually.'] },
    ],
    prompts: ['¿Deberíamos trabajar cuatro días por semana?', '¿El turismo hace más bien o más mal a las ciudades?', '¿Las ciudades deberían prohibir los autos en el centro?'],
    frames: ['In several countries,…', 'Although…, I believe…', 'Firstly,…', 'Furthermore,…', 'Admittedly,…', 'In conclusion, while…'],
  }),
  L({
    id: 'b2-technology',
    level: 'B2',
    genre: 'opinion',
    title: 'Ensayo: ¿la tecnología nos aísla?',
    goal: 'Discutir los dos lados de un tema y llegar a una postura matizada.',
    words: 200,
    model: {
      title: 'Is technology making us less social?',
      es: 'Lucas analiza si la tecnología nos aísla: une a la gente lejos, pero puede reemplazar los encuentros cara a cara.',
      parts: [
        { role: 'open', text: 'It is often said that smartphones and social media are making us less social. In my view, technology itself is not the problem; the way we use it is.' },
        { role: 'body', text: 'On the one hand, technology has made it easier than ever to stay in touch. Thanks to video calls, I can see my family every week even though we live in different countries. Online groups also allow people with unusual hobbies to find others who share their interests, which was almost impossible thirty years ago.' },
        { role: 'turn', text: 'On the other hand, there is no doubt that screens can replace real contact. It is common to see a group of friends at a restaurant, each of them looking at their own phone. Some studies suggest that young people who spend many hours online feel lonelier, despite having hundreds of contacts.' },
        { role: 'close', text: 'All things considered, I would argue that technology is a tool that can either connect or isolate us. As long as we use it to organise meetings rather than to avoid them, it can make our social lives richer, not poorer.' },
      ],
    },
    tip: 'Postura matizada desde el principio (… is not the problem; … is). On the one hand / On the other hand ordenan los dos lados. As long as… pone la condición en la conclusión.',
    combine: [
      { parts: 'We live in different countries. I can see my family every week.', task: 'Una oración con even though.', answers: ['I can see my family every week even though we live in different countries.', 'Even though we live in different countries, I can see my family every week.'] },
      { parts: 'Young people have hundreds of contacts. They feel lonely.', task: 'Una oración con despite having.', answers: ['Young people feel lonely despite having hundreds of contacts.', 'Despite having hundreds of contacts, young people feel lonely.'] },
      { parts: 'We use it to organise meetings. Then it makes our lives richer.', task: 'Una oración con As long as.', answers: ['As long as we use it to organise meetings, it makes our lives richer.', 'It makes our lives richer as long as we use it to organise meetings.', 'As long as we use it to organize meetings, it makes our lives richer.'] },
    ],
    prompts: ['¿La tecnología nos hace menos sociables?', '¿La inteligencia artificial va a quitar más trabajos de los que crea?', '¿Los chicos deberían usar pantallas en la escuela?'],
    frames: ['It is often said that…', 'In my view,…', 'On the one hand,…', 'On the other hand,…', 'All things considered,…', 'As long as…'],
  }),
  L({
    id: 'b2-complaint',
    level: 'B2',
    genre: 'email',
    title: 'Email formal de reclamo',
    goal: 'Reclamar con firmeza y cortesía: qué pasó, qué esperabas y qué pedís.',
    words: 200,
    model: {
      title: 'Complaint about accommodation',
      es: 'Lucas reclama a una agencia porque el apartamento no era como en la publicidad y pide un reembolso parcial.',
      parts: [
        { role: 'greet', text: 'Dear Ms Taylor,' },
        { role: 'open', text: 'I am writing to complain about the apartment I booked through your agency for the week of 3–10 February (booking number 48213). Unfortunately, it was very different from the description on your website.' },
        { role: 'body', text: 'Firstly, the advertisement promised a sea view, but the only window faced a car park. Secondly, the air conditioning did not work, and despite calling your office three times, nobody came to repair it. As a result, we could hardly sleep during a week of temperatures above 35 degrees.' },
        { role: 'example', text: 'I have attached photos of the window and of the broken air conditioner, as well as screenshots of the original advertisement, so that you can compare them. I have also included the times of my three phone calls to your office, when I was promised that a technician would come the same day.' },
        { role: 'close', text: 'Considering the problems described above, I would like to request a refund of fifty per cent of the total price. I would appreciate it if you could reply within fourteen days. If I do not hear from you, I will have to contact the consumer protection office.' },
        { role: 'sign', text: 'Yours sincerely, Lucas Pereira' },
      ],
    },
    tip: 'Motivo y datos (fecha, número) → los problemas en orden (Firstly, Secondly) y su consecuencia (As a result) → pruebas → qué pedís, con plazo → Yours sincerely. Firme, nunca grosero.',
    combine: [
      { parts: 'I called three times. Nobody came.', task: 'Una oración con despite calling.', answers: ['Despite calling three times, nobody came.', 'Nobody came despite calling three times.', 'Nobody came, despite my calling three times.', 'Despite my calling three times, nobody came.'] },
      { parts: 'Could you reply within fourteen days?', task: 'Más formal: I would appreciate it if…', answers: ['I would appreciate it if you could reply within fourteen days.', 'I would appreciate it if you could reply within 14 days.'] },
      { parts: 'I have attached photos. You can compare them.', task: 'Una oración con so that.', answers: ['I have attached photos so that you can compare them.', 'I have attached photos, so that you can compare them.'] },
    ],
    prompts: ['Reclamá por un alojamiento que no era como en la publicidad.', 'Reclamá por un producto que llegó roto y la tienda no responde.', 'Reclamá a una aerolínea por una valija perdida.'],
    frames: ['Dear Mr/Ms …,', 'I am writing to complain about…', 'Firstly,…  Secondly,…', 'As a result,…', 'I would like to request…', 'Yours sincerely,'],
  }),
  L({
    id: 'b2-abroad',
    level: 'B2',
    genre: 'compare',
    title: 'Vivir en el extranjero: pros y contras',
    goal: 'Comparar ventajas y desventajas y sacar una conclusión equilibrada.',
    words: 200,
    model: {
      title: 'Living abroad',
      es: 'Ventajas (dinero, idioma, independencia) y desventajas (soledad, burocracia) de vivir afuera; Lucas recomienda hacerlo con un plan.',
      parts: [
        { role: 'open', text: 'More and more young South Americans are moving to countries like Australia, Canada or Spain. Living abroad can change your life, but it is far from easy, and it is worth thinking carefully before you go.' },
        { role: 'body', text: 'The advantages are clear. Salaries are often much higher, so many people manage to save money that would take years to earn at home. In addition, you learn a language much faster when you need it every day, and you become more independent, since there is nobody to solve your problems for you.' },
        { role: 'turn', text: 'However, the difficulties are just as real. Most people feel lonely during the first months, especially at times like birthdays or Christmas. Paperwork can be exhausting, and finding a flat without local references is often a nightmare. Whereas at home you have a network of friends and family, abroad you have to build everything from zero.' },
        { role: 'close', text: 'To sum up, living abroad offers opportunities that are hard to find at home, provided that you are prepared for the hard parts. My advice would be to go with a clear plan, some savings and an open mind.' },
      ],
    },
    tip: 'Introducción que plantea las dos caras → ventajas (In addition, since) → desventajas (However, Whereas) → conclusión con condición (provided that) y un consejo.',
    combine: [
      { parts: 'At home you have a network of friends. Abroad you start from zero.', task: 'Una oración con Whereas.', answers: ['Whereas at home you have a network of friends, abroad you start from zero.', 'At home you have a network of friends, whereas abroad you start from zero.'] },
      { parts: 'You become independent. Nobody solves your problems for you.', task: 'Una oración con since.', answers: ['You become independent, since nobody solves your problems for you.', 'You become independent since nobody solves your problems for you.'] },
      { parts: 'It offers great opportunities. You must be prepared for the hard parts.', task: 'Una oración con provided that.', answers: ['It offers great opportunities, provided that you are prepared for the hard parts.', 'It offers great opportunities provided that you are prepared for the hard parts.'] },
    ],
    prompts: ['Ventajas y desventajas de vivir en el extranjero.', 'Ventajas y desventajas de ser tu propio jefe.', 'Ventajas y desventajas de vivir en una ciudad turística.'],
    frames: ['More and more…', 'The advantages are clear.', 'In addition,…', 'However, the difficulties…', 'Whereas…,…', 'To sum up,…, provided that…'],
  }),
];

export const WRITING_LEVELS: Level[] = ['A1', 'A2', 'B1', 'B2'];
export const WRITING_TARGET: Record<string, number> = { A1: 30, A2: 80, B1: 150, B2: 200 };
