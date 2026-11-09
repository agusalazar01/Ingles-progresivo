import { FX, rp } from './build';

const ALL = "no|that's all|that is all|nothing|all good";

/** 6. Vida social y conversaciones informales */
export const SOCIAL = [
  rp('56', {
    p: 'Un asado (barbie) en el patio de un amigo', w: ['Josh', 'amigo de un amigo'],
    s: 'No conocés a casi nadie en el asado. Alguien se acerca a saludarte.',
    g: 'Presentarte, decir de dónde sos y qué hacés, y preguntarle algo a él.',
    v: [['nice to meet you', 'un gusto', 'nais tu mít iu', 'Nice to meet you, Josh.'], ['How do you know…?', '¿De dónde conocés a…?', 'jau du iu nou', 'How do you know Sam?'], ['mate', 'amigo', 'meit', "He's my mate from work."]],
    c: ['Good to meet you, mate!', 'Enjoy the barbie!'],
  }, {
    start: { s: "G'day! I don't think we've met. I'm Josh.", h: "Hi Josh, nice to meet you. I'm Juan.", a: 'Presentate.', o: [["i'm|i am|my name|nice|hi|hello", 'from', 'Nice to meet you too.']], f: ['from', 'Nice to meet you.'] },
    from: { s: 'Where are you from?', h: "I'm from Uruguay. I've been here for three months.", o: [['from|uruguay|south america|montevideo|here', 'know', "Awesome, never met anyone from Uruguay!"]], f: ['know'], x: [FX.since, FX.age] },
    know: { s: 'So how do you know Sam?', h: 'We work together at the café. How do you know him?', a: 'Contá de dónde lo conocés y preguntale a él.', o: [['work|together|friend|met|house|live|school|gym|know', 'end', "We play footy together. He's a top bloke."]], f: ['end', 'Ah, nice.'] },
  }),
  rp('57', {
    p: 'La cocina de un hostel', w: ['Mateo', 'viajero italiano'],
    s: 'Estás cocinando y alguien está cocinando al lado. Querés empezar una charla.',
    g: 'Empezar la charla, encontrar algo en común y proponer algo.',
    v: [['smells good', 'huele bien', 'smels gud', 'That smells good!'], ['travelling', 'viajando', 'trávelin', 'How long have you been travelling?'], ['to hang out', 'salir, juntarse', 'tu jang aut', 'Do you want to hang out later?']],
    c: ['See you later!', 'Catch you later, mate!'],
  }, {
    start: { s: '…', h: 'Hey, that smells good! What are you cooking?', a: 'Empezá la charla con algo de lo que está pasando.', o: [['smell|smells|cooking|what|good|looks|hi|hey|hello', 'travel', "Thanks! It's just pasta. I'm Mateo."]], f: ['travel', "Hi, I'm Mateo."] },
    travel: { s: 'Are you travelling around?', h: "Yes, I've been travelling for a month. And you?", o: [['yes|travelling|traveling|month|weeks|working|here|and you', 'plan', "I've been here two months. I love it."]], f: ['plan'] },
    plan: { s: "Some of us are going to the pub later. Want to come?", h: "Sure, I'd love to. What time?", o: [['no|tired|maybe|next time', 'end', 'No worries, next time.'], ['yes|sure|love|great|what time|ok|okay', 'end', 'Around eight. Meet in the lobby.']], f: ['end', 'We meet in the lobby at eight.'] },
  }),
  rp('58', {
    p: 'Una charla en el descanso del trabajo', w: ['Megan', 'compañera de trabajo'],
    s: 'Una compañera te pregunta por Uruguay. Nunca escuchó mucho de tu país.',
    g: 'Describir tu país: dónde queda, cómo es y algo típico.',
    v: [['between', 'entre', 'bituín', "It's between Argentina and Brazil."], ['population', 'población', 'popiuléishon', 'The population is about three and a half million.'], ['famous for', 'famoso por', 'féimos for', "It's famous for beef and football."]],
    c: ["I'd love to visit one day!", 'Sounds amazing!'],
  }, {
    start: { s: "So where's Uruguay exactly?", h: "It's in South America, between Argentina and Brazil.", a: 'Explicá dónde queda.', o: [['south america|between|argentina|brazil|next to|near', 'like', 'Oh, nice!']], f: ['like', "Oh, near Argentina, right?"] },
    like: { s: "What's it like?", h: "It's small and quiet, with beautiful beaches.", o: [['small|quiet|beach|beaches|beautiful|people|friendly|calm|nice|big', 'famous', 'Sounds lovely.']], f: ['famous'], x: [FX.people] },
    famous: { s: 'What is it famous for?', h: "It's famous for asado, football and mate.", o: [['famous|asado|beef|meat|football|soccer|mate|wine|beach', 'end', "I've heard about mate! You have to show me."]], f: ['end', 'Cool.'] },
  }),
  rp('59', {
    p: 'Un pub después del trabajo', w: ['Ben', 'un australiano que conociste'],
    s: 'Te preguntan a qué te dedicás en Uruguay y qué hacés acá.',
    g: 'Explicar tu trabajo de antes y el de ahora.',
    v: [['back home', 'en mi país', 'bak jóum', 'Back home I was a photographer.'], ['at the moment', 'por ahora, en este momento', 'at de móument', 'At the moment I work in a café.'], ['what do you do?', '¿a qué te dedicás?', 'uót du iu du', 'What do you do?']],
    c: ['Good chatting with you!', 'Cheers, mate!'],
  }, {
    start: { s: 'So what do you do?', h: 'At the moment I work in a café.', a: 'Contá a qué te dedicás ahora.', o: [['work|working|café|cafe|job|study|moment|looking', 'home', 'Nice, which one?']], f: ['home', 'Cool.'], x: [FX.actual] },
    home: { s: 'And what did you do back home?', h: 'Back home I was a photographer.', o: [['was|worked|did|home|before|used to', 'like', 'Oh, nice.']], f: ['like'] },
    like: { s: 'Do you like the café job?', h: "It's OK. The people are nice, but I want to find something in photography.", o: [['like|love|ok|okay|good|nice|hard|tired|but|want', 'end', "Good on ya. I hope you find something."]], f: ['end', 'Fair enough.'] },
  }),
  rp('60', {
    p: 'Una cena con amigos', w: ['Sarah', 'amiga'],
    s: 'Te preguntan qué planes tenés en Australia.',
    g: 'Contar tus planes con going to, want to e if.',
    v: [["I'm going to", 'voy a (plan)', 'aim góing tu', "I'm going to travel up the coast."], ['I want to', 'quiero', 'ai uónt tu', 'I want to save money.'], ['if', 'si', 'if', "If I find a job, I'll stay."]],
    c: ['Sounds like a great plan!', 'Good luck with everything!'],
  }, {
    start: { s: 'So what are your plans here?', h: "I'm going to work for six months and then travel.", a: 'Contá tus planes.', o: [['going to|want|plan|work|travel|save|stay|study', 'where', 'Love that.']], f: ['where', 'Nice.'] },
    where: { s: 'Where do you want to go?', h: 'I want to go up the coast to Cairns.', o: [['want|go|coast|cairns|north|west|melbourne|perth|tasmania|everywhere|road trip', 'stay', 'That trip is amazing.']], f: ['stay'] },
    stay: { s: 'Would you stay longer?', h: "If I find a good job, I'll stay another year.", o: [['if|maybe|probably|stay|year|depends|back|home|go back', 'end', "Fingers crossed then!"]], f: ['end', 'We will see!'], x: [['\\bif i will\\b', "If I find a job, I'll stay.", 'Después de if va presente, no will.'], FX.depends] },
  }),
  rp('61', {
    p: 'Mensajes de voz con una amiga', w: ['Chloe', 'amiga'],
    s: 'Están organizando qué hacer el fin de semana.',
    g: 'Proponer un plan, acordar día y hora y quién lleva qué.',
    v: [['to be keen', 'tener ganas', 'tu bi kin', 'Are you keen for the beach?'], ['how about…?', '¿qué tal si…?', 'jau abáut', 'How about Saturday?'], ['to meet up', 'encontrarse', 'tu mit ap', "Let's meet up at ten."]],
    c: ['Sounds like a plan!', 'Perfect, see you then!'],
  }, {
    start: { s: "Hey! What are you up to this weekend?", h: "Not much. Are you keen for the beach on Saturday?", a: 'Proponé un plan.', o: [['beach|keen|how about|let us|lets|want|go|saturday|sunday|movie|park|plan', 'time', "Yes! I'm keen."]], f: ['time', 'We should do something!'] },
    time: { s: 'What time?', h: 'How about ten in the morning?', o: [['[0-9]|ten|nine|eleven|morning|afternoon|how about|early', 'bring', 'Ten is good.']], f: ['bring'], x: [FX.inDay] },
    bring: { s: 'What should I bring?', h: "Bring some snacks, and I'll bring the drinks.", o: [['bring|snacks|drinks|food|towel|umbrella|nothing', 'end', 'Easy. See you at the beach!']], f: ['end', "I'll bring snacks."] },
  }),
  rp('62', {
    p: 'Después de una clase de surf', w: ['Emily', 'compañera de la clase'],
    s: 'Te cae bien una compañera de la clase de surf y querés invitarla a tomar algo.',
    g: 'Invitar con naturalidad, proponer lugar y hora, y aceptar si dice que no.',
    v: [['Do you fancy…?', '¿Te pinta…?', 'du iu fánsi', 'Do you fancy a drink?'], ['to grab a drink', 'tomar algo', 'tu grab a drink', "Let's grab a drink."], ['some other time', 'otro día', 'sam áder taim', 'Maybe some other time.']],
    c: ['See you at the next class!', 'Have a good one!'],
  }, {
    start: { s: 'That was fun! Same time next week?', h: 'Yes! Do you fancy a drink after class?', a: 'Invitala a tomar algo.', o: [['drink|coffee|beer|fancy|want|grab|join', 'when', 'Sure, why not!']], f: ['when', 'Oh, what did you say?'] },
    when: { s: 'When were you thinking?', h: 'How about now, at the bar on the beach?', o: [['now|today|tomorrow|after|bar|café|cafe|how about|beach', 'end', "Sounds good, let's go."]], f: ['end', "Let's go now."] },
  }),
  rp('63', {
    p: 'Barra de un pub', w: ['Darren', 'barman'],
    s: 'Es viernes a la noche y querés pedir algo en la barra.',
    g: 'Pedir bebidas, preguntar qué cerveza tienen y pagar.',
    v: [['pint / schooner', 'pinta / vaso mediano de cerveza', 'paint / skúner', 'A schooner of pale ale, please.'], ['on tap', 'tirada', 'on tap', 'What beers do you have on tap?'], ['my shout', 'invito yo', 'mai shaut', "It's my shout."], ['round', 'ronda', 'raund', "It's your round."]],
    a: [['My shout', 'yo invito', 'En Australia, en grupo se paga por rondas.']],
    c: ['Enjoy!', 'Cheers!'],
  }, {
    start: { s: 'What can I get you, mate?', h: 'What beers do you have on tap?', a: 'Preguntá qué cerveza tienen.', o: [['beer|beers|tap|what|have|pint|schooner|wine|cider', 'order', 'We have lager, pale ale and a cider.']], f: ['order', 'We have lager, pale ale and cider.'] },
    order: { s: 'What will it be?', h: 'Two schooners of pale ale, please.', o: [['[0-9]|one|two|three|schooner|pint|pale|lager|cider|glass', 'pay', 'Coming up.']], f: ['pay', "I'll get you two pale ales."], x: [FX.want, FX.giveMe] },
    pay: { s: "That's eighteen dollars.", h: "Here you go. It's my shout tonight!", o: [['here|card|cash|tap|shout|pay', 'end', 'Good man. Enjoy!']], f: ['end', 'Thanks.'], x: [FX.hereYouHave] },
  }),
  rp('64', {
    p: 'Una fiesta en una casa', w: ['Tara', 'una invitada'],
    s: 'Te ponés a charlar de hobbies con alguien que acabás de conocer.',
    g: 'Contar tus hobbies, preguntar los de ella y encontrar algo en común.',
    v: [['to be into', 'estar metido en, gustarte mucho', 'tu bi íntu', "I'm really into photography."], ['in my free time', 'en mi tiempo libre', 'in mai fri taim', 'In my free time I play guitar.'], ['me too', 'yo también', 'mi tu', 'Me too!']],
    c: ['Great chatting with you!', 'Nice to meet you!'],
  }, {
    start: { s: 'So what do you do for fun?', h: "I'm really into photography, and I play the guitar.", a: 'Contá tus hobbies.', o: [['into|like|love|play|enjoy|photography|guitar|surf|football|music|read|cook|hobby|free time', 'you', 'Oh, nice!']], f: ['you', 'Cool.'] },
    you: { s: 'What kind of music do you play?', h: 'Mostly rock and some folk. What about you?', o: [['rock|folk|pop|jazz|music|songs|what about you|and you|everything', 'common', 'I play the drums, actually!']], f: ['common'] },
    common: { s: 'We should jam sometime!', h: "Yes, that would be great! Let's do it.", o: [['yes|great|sure|love|let us|lets|would', 'end', "Awesome, give me your number."], ['maybe|not sure|busy', 'end', 'No worries, maybe one day.']], f: ['end', "Let's swap numbers."] },
  }),
  rp('65', {
    p: 'El descanso en el trabajo (smoko)', w: ['Davo', 'compañero australiano'],
    s: 'Tu compañero habla con mucho slang y le querés preguntar qué significan algunas palabras.',
    g: 'Preguntar qué significan expresiones australianas y usarlas.',
    v: [['arvo', 'la tarde', 'árvo', 'See you this arvo.'], ['heaps', 'mucho, pila', 'jíps', "There's heaps of work."], ['fair dinkum', 'en serio, de verdad', 'fer dínkum', 'Fair dinkum?'], ["What does … mean?", '¿Qué significa…?', 'uót das … min', "What does 'arvo' mean?"]],
    a: [['Fair dinkum', 'en serio, de verdad', 'Para preguntar si algo es verdad o decir que lo es.'], ['Arvo', 'la tarde', 'Muy común: this arvo = esta tarde.']],
    c: ["You'll be talking like a local in no time!", 'Good on ya, mate!'],
  }, {
    start: { s: "Reckon we'll finish early this arvo, mate.", h: "Sorry, what does 'arvo' mean?", a: 'Preguntá qué significa una palabra.', o: [['what|mean|means|arvo|reckon|sorry', 'heaps', "Ha! Arvo means afternoon."]], f: ['heaps', 'Arvo means afternoon, mate.'] },
    heaps: { s: "We've got heaps of time then. Fair dinkum.", h: "What does 'fair dinkum' mean?", o: [['what|mean|means|fair dinkum|dinkum|heaps', 'use', "It means 'really' or 'honestly'."]], f: ['use'] },
    use: { s: "Go on, try using one!", h: "OK. See you this arvo, mate!", o: [['arvo|heaps|mate|reckon|no worries|dinkum|good on ya|cheers', 'end', 'Ha! Perfect, mate.']], f: ['end', 'Not bad!'] },
  }),
  rp('66', {
    p: 'Una fila en el súper', w: ['Margaret', 'una señora mayor'],
    s: 'La fila es larga y la señora de adelante empieza a charlar.',
    g: 'Seguir una charla corta y amable (el clima, la fila, el fin de semana).',
    v: [['lovely day', 'día hermoso', 'lávli dei', "It's a lovely day, isn't it?"], ['isn’t it?', '¿no?', 'ísent it', 'Hot today, isn’t it?'], ['to queue', 'hacer fila', 'tu kiu', 'The queue is so long.']],
    c: ['Have a lovely day, dear!', 'Take care!'],
  }, {
    start: { s: "Busy today, isn't it?", h: "Yes, it is. It's always busy on Saturdays.", a: 'Respondé de forma amable.', o: [['yes|it is|busy|always|saturday|long|very', 'weather', 'At least the weather is nice.']], f: ['weather', 'At least the weather is nice.'] },
    weather: { s: 'Beautiful weather, though. Are you going to the beach?', h: "Maybe this afternoon. It's a lovely day.", o: [['maybe|yes|no|beach|afternoon|lovely|beautiful|work|later', 'from', "Oh, lovely. You have an accent, where are you from?"]], f: ['from'] },
    from: { s: 'Where are you from, dear?', h: "I'm from Uruguay, in South America.", o: [['from|uruguay|south america', 'end', "How lovely! Welcome to Australia."]], f: ['end', 'How nice.'] },
  }),
  rp('67', {
    p: 'Una charla en el trabajo', w: ['Ash', 'compañero'],
    s: 'No entendiste lo que te dijo tu compañero y contestaste otra cosa.',
    g: 'Darte cuenta del malentendido, pedir que lo repita y aclararlo.',
    v: [['I misunderstood', 'entendí mal', 'ai misanderstúd', 'Sorry, I misunderstood.'], ['Do you mean…?', '¿Querés decir…?', 'du iu min', 'Do you mean the blue box?'], ['to clarify', 'aclarar', 'tu klárifai', 'Can you clarify?']],
    c: ['No worries, all good.', 'Easy mistake, mate.'],
  }, {
    start: { s: "Nah mate, I said the BLUE ones, not the black ones.", h: "Oh, sorry, I misunderstood. Do you mean these blue boxes?", a: 'Reconocé el error y aclará.', o: [['sorry|misunderstood|mean|blue|these|understand|oh', 'where', "Yeah, those ones."]], f: ['where', "The blue ones, mate."] },
    where: { s: 'They go next to the door.', h: 'Sorry, could you say that again? Next to which door?', o: [['again|repeat|which|door|where|sorry', 'end', 'The back door, near the fridge.'], ['ok|okay|got it|sure|understood', 'end', 'Good.']], f: ['end', 'The back door.'] },
  }),
];

/** 7. Buscar trabajo y entrevistas laborales */
const interview = (n: string, job: string, place: string, partner: [string, string], qExp: string, hExp: string, skill: string, hSkill: string, kws: string, vocab: [string, string, string, string][]) =>
  rp(n, {
    p: place, w: partner,
    s: `Tenés una entrevista para trabajar como ${job}. Te reciben en el lugar.`,
    g: 'Presentarte, contar tu experiencia, responder la pregunta del puesto, decir tu disponibilidad y hacer una pregunta.',
    v: vocab,
    c: ['Thanks for coming in. We’ll be in touch.', 'Great to meet you. We’ll let you know soon.'],
  }, {
    start: { s: 'Hi, thanks for coming in. Tell me a bit about yourself.', h: "I'm from Uruguay. I've been in Australia for two months and I'm looking for work.", a: 'Presentate en dos o tres frases.', o: [["from|i'm|i am|my name|looking|years|been", 'exp', 'Nice to meet you.']], f: ['exp', 'Nice to meet you.'], x: [FX.age, FX.since] },
    exp: { s: qExp, h: hExp, o: [["no|never|have not|not really|first time", 'skill', "That's OK, we can train you."], ['yes|worked|experience|years|year|months|before', 'skill', 'Great.']], f: ['skill', "OK, we'll see on a trial."], x: [['\\bi have worked .*\\b(in 20\\d\\d|last year|ago)\\b', 'I worked there in 2022.', 'Si decís cuándo fue, va pasado simple: I worked.']] },
    skill: { s: skill, h: hSkill, o: [[kws, 'avail', 'Good answer.']], f: ['avail', 'OK.'] },
    avail: { s: 'What days are you available?', h: "I'm available Monday to Friday, and weekends too.", o: [['monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|weekends|weekdays|any|every|morning|afternoon|night|anytime|full time', 'q', 'Great.']], f: ['q'], x: [FX.inDay, ['\\bdisponible\\b', "I'm available…", 'Disponible = available.']] },
    q: { s: 'Do you have any questions for me?', h: "What's the hourly rate?", a: 'Hacé una pregunta: sueldo, horario o cuándo empezar.', o: [['pay|rate|hour|salary|money|wage', 'end', "It's around thirty dollars an hour."], ['start|when', 'end', 'We could start you next week.'], ['shift|roster|hours|time', 'end', 'Shifts are about eight hours.'], [ALL, 'end', 'No worries.']], f: ['end', 'Just send me a message if you think of anything.'] },
  });

export const JOBS = [
  interview('68', 'empleado en general (entrevista general)', 'Una oficina de una agencia de empleo', ['Paul', 'reclutador'], 'Have you worked in Australia before?', "No, but I worked in Uruguay for five years.", 'What are your strengths?', "I'm hard-working, reliable and I learn fast.", 'hard|working|reliable|fast|learn|team|friendly|punctual|organised|organized|strength|good', [['strengths', 'puntos fuertes', 'strengz', 'What are your strengths?'], ['reliable', 'confiable, responsable', 'riláiabol', "I'm reliable."], ['hard-working', 'trabajador', 'jard uérking', "I'm hard-working."], ['to learn fast', 'aprender rápido', 'tu lern fast', 'I learn fast.']]),
  interview('69', 'empleado de restaurante', 'Un restaurante italiano en Adelaida', ['Luca', 'dueño del restaurante'], 'Have you worked in a restaurant before?', 'Yes, I worked in a restaurant in Montevideo for two years.', 'What would you do if a customer is angry?', "I'd stay calm, listen and try to fix the problem.", 'calm|listen|sorry|fix|help|manager|apologise|apologize|solve|smile', [['customer', 'cliente', 'kástomer', 'I like working with customers.'], ['busy', 'con mucho movimiento', 'bísi', 'It gets busy on Fridays.'], ['to stay calm', 'mantener la calma', 'tu stei kam', 'I stay calm.'], ['shift', 'turno', 'shift', 'Shifts start at five.']]),
  interview('71', 'mozo', 'Un bar de tapas en Sídney', ['Zara', 'encargada de salón'], 'Do you have experience as a waiter?', 'Yes, I worked as a waiter for a year.', 'How many plates can you carry?', 'I can carry three plates.', '[0-9]|two|three|four|plates|carry|can', [['to take orders', 'tomar pedidos', 'tu teik órders', 'I can take orders.'], ['plates', 'platos', 'pleits', 'I can carry three plates.'], ['tips', 'propinas', 'tips', 'Do staff share the tips?'], ['RSA', 'certificado para servir alcohol', 'ar es ei', 'Do you have your RSA?']]),
  interview('72', 'ayudante de cocina (kitchen hand)', 'La cocina de un hotel', ['Chef Tony', 'jefe de cocina'], 'Have you worked in a kitchen?', 'Yes, I washed dishes and prepared food in a restaurant.', 'Are you OK working fast and standing all day?', "Yes, I'm used to working fast and standing all day.", 'yes|used to|fast|standing|ok|okay|fine|no problem|can', [['kitchen hand', 'ayudante de cocina', 'kíchen jand', "I'm applying for the kitchen hand job."], ['to wash dishes', 'lavar platos', 'tu uósh díshis', 'I can wash dishes.'], ['to chop', 'picar, cortar', 'tu chop', 'Chop the onions.'], ["I'm used to", 'estoy acostumbrado a', 'aim iúst tu', "I'm used to working fast."]]),
  interview('73', 'obrero de construcción', 'Una obra en Brisbane', ['Steve', 'capataz'], 'Have you worked in construction before?', 'Yes, I worked on building sites in Uruguay.', 'Do you have a White Card?', "Yes, I have a White Card. I did the course last week.", 'yes|white card|card|course|have|got|no|not yet|doing', [['White Card', 'certificado obligatorio para trabajar en obras', 'uáit card', 'Do you have a White Card?'], ['building site', 'obra', 'bílding sait', 'I worked on a building site.'], ['steel-cap boots', 'botas con puntera de acero', 'stil kap buts', 'You need steel-cap boots.'], ['hard hat', 'casco', 'jard jat', 'Always wear a hard hat.']]),
  interview('74', 'peón (labourer)', 'Una empresa de mudanzas y obras', ['Mick', 'supervisor'], 'Have you done labouring work before?', 'Yes, I did gardening and moving jobs.', 'Can you lift heavy things all day?', "Yes, I'm fit and I can lift heavy things.", 'yes|fit|strong|lift|can|heavy|no problem', [['labourer', 'peón', 'léiborer', "I'm looking for labourer work."], ['to lift', 'levantar', 'tu lift', 'Lift with your legs.'], ['fit', 'en forma', 'fit', "I'm fit."], ['cash in hand', 'pago en negro (evitalo)', 'kash in jand', 'Is it cash in hand?']]),
  interview('75', 'cosechador en un viñedo', 'La oficina de un viñedo en el Barossa', ['Ruth', 'encargada de la cosecha'], 'Have you picked grapes before?', 'No, but I worked on a farm in Uruguay.', 'Are you OK working outside in the heat?', "Yes, I'm used to working outside in the sun.", 'yes|used to|outside|heat|sun|hot|ok|okay|fine|no problem', [['vintage', 'vendimia', 'víntach', 'The vintage starts in February.'], ['picker', 'cosechador', 'píker', "We need pickers."], ['snips', 'tijera de podar', 'snips', 'Use the snips carefully.'], ['bin', 'contenedor (se paga por bin)', 'bin', 'We pay per bin.']]),
  interview('76', 'cosechador de fruta (fruit picker)', 'Una chacra de frutas en Queensland', ['Gav', 'dueño de la chacra'], 'Have you done fruit picking before?', 'Yes, I picked apples for two months.', 'Do you know we pay per bin, not per hour?', 'Yes, I know. How much do you pay per bin?', 'yes|know|bin|per bin|how much|ok|okay|piece rate', [['fruit picking', 'cosecha de fruta', 'frut píking', 'I want to do fruit picking.'], ['piece rate', 'pago por producción', 'pis reit', "It's piece rate."], ['ladder', 'escalera', 'láder', 'You need to use a ladder.'], ['88 days', 'los días de trabajo rural para la segunda visa', 'éiti eit deis', 'I need to do my 88 days.']]),
  interview('77', 'peón de granja (farm hand)', 'Una granja de ovejas en Nueva Gales del Sur', ['Bill', 'dueño de la granja'], 'Have you worked on a farm?', 'Yes, I grew up on a farm in Uruguay.', 'Can you drive a manual car or a quad bike?', 'Yes, I can drive a manual and a quad bike.', 'yes|can|drive|manual|quad|tractor|no|learn', [['farm hand', 'peón de campo', 'farm jand', "I'm a farm hand."], ['sheep / cattle', 'ovejas / ganado', 'ship / kátol', 'We have sheep and cattle.'], ['quad bike', 'cuatriciclo', 'kuod baik', 'Can you ride a quad bike?'], ['fence', 'alambrado', 'fens', 'We need to fix the fences.']]),
  interview('78', 'operario en una mina', 'Una oficina de una empresa minera en Perth', ['Karen', 'responsable de selección'], 'Do you have experience in mining?', 'No, but I have experience operating machinery.', 'Why do you want to work in mining?', 'Because I like working hard and the pay is good.', 'because|pay|money|hard|challenge|team|learn|machinery|work', [['mining', 'minería', 'máining', 'I want to work in mining.'], ['site', 'el lugar de trabajo (la mina)', 'sait', 'You live on site.'], ['drug and alcohol test', 'control de drogas y alcohol', 'drag and álkojol test', "There's a drug and alcohol test."], ['machinery', 'maquinaria', 'mashíneri', 'I can operate machinery.']]),
  interview('79', 'trabajador FIFO (vuela a la mina y vuelve)', 'Videollamada con una empresa minera', ['Craig', 'supervisor de reclutamiento'], 'Have you worked on a fly-in fly-out roster before?', 'No, but I’m ready for long shifts and time away from the city.', 'Our roster is two weeks on, one week off, twelve-hour shifts. Is that OK for you?', 'Yes, that works for me. I can do two weeks on, one week off.', 'yes|ok|okay|fine|works|can|no problem|ready|roster', [['FIFO (fly-in fly-out)', 'volás a la mina, trabajás unas semanas y volvés', 'fáifo', "It's a FIFO job."], ['two weeks on, one week off', 'dos semanas de trabajo, una libre', 'tu uiks on, uán uík of', 'The roster is two on, one off.'], ['camp', 'campamento', 'kamp', 'You live in the camp.'], ['twelve-hour shifts', 'turnos de doce horas', 'tuelv áuer shifts', 'We do twelve-hour shifts.']]),
  interview('80', 'empleado de limpieza', 'Una empresa de limpieza de oficinas', ['Maria', 'supervisora'], 'Have you done cleaning work before?', 'Yes, I cleaned offices for six months.', 'Are you OK working at night, after the offices close?', "Yes, I don't mind working at night.", 'yes|mind|night|ok|okay|fine|no problem|can', [['cleaner', 'limpiador', 'klíner', "I'm applying for the cleaner job."], ['to vacuum', 'pasar la aspiradora', 'tu vákium', 'Vacuum the carpets.'], ['to mop', 'trapear', 'tu mop', 'Mop the floors.'], ["I don't mind", 'no me molesta', 'ai dount maind', "I don't mind working at night."]]),
  interview('81', 'operario de depósito', 'Un depósito grande en las afueras de Melbourne', ['Gary', 'jefe de turno'], 'Have you worked in a warehouse?', 'Yes, I picked and packed orders for a year.', 'Do you have a forklift licence?', "No, I don't, but I'd like to get one.", 'yes|no|licence|license|forklift|get|learn|have', [['warehouse', 'depósito', 'uérjaus', 'I worked in a warehouse.'], ['pick and pack', 'armar y embalar pedidos', 'pik and pak', 'I did pick and pack.'], ['forklift licence', 'licencia de autoelevador', 'fórklift láisens', 'Do you have a forklift licence?'], ['night shift', 'turno noche', 'nait shift', 'Can you do night shift?']]),
  interview('82', 'repartidor', 'Una empresa de repartos', ['Dean', 'encargado'], 'Have you done delivery work before?', 'Yes, I delivered food on a bike for three months.', 'Do you have an Australian driver licence?', "I have an international licence, and I'm getting an Australian one.", 'licence|license|international|yes|no|have|getting|drive', [['delivery driver', 'repartidor', 'delíveri dráiver', "I'm applying for delivery driver."], ['driver licence', 'licencia de conducir', 'dráiver láisens', 'I have a driver licence.'], ['van', 'camioneta de reparto', 'van', 'You drive a van.'], ['route', 'recorrido', 'rut', 'Each driver has a route.']]),
  interview('83', 'vendedor en una tienda', 'Una tienda de ropa en un shopping', ['Kelly', 'encargada de la tienda'], 'Have you worked in retail before?', 'Yes, I worked in a clothes shop in Uruguay.', 'How would you help a customer who is just looking?', "I'd say hi, tell them about the sale and let them look.", 'say|hi|hello|help|tell|let|ask|smile|offer', [['retail', 'venta al público', 'ríteil', 'I have retail experience.'], ['customer service', 'atención al cliente', 'kástomer sérvis', 'I love customer service.'], ['till / register', 'caja', 'til', 'Can you use the till?'], ['stock', 'mercadería', 'stok', 'We restock on Mondays.']]),
  interview('84', 'mucama de hotel (housekeeping)', 'Un hotel en la costa', ['Linda', 'jefa de housekeeping'], 'Have you done housekeeping before?', 'Yes, I cleaned rooms in a hotel for a season.', 'How many rooms can you clean in a shift?', 'I can clean about twelve rooms in a shift.', '[0-9]|rooms|clean|about|ten|twelve|fifteen|can', [['housekeeping', 'limpieza de habitaciones', 'jáuskiping', "I'm applying for housekeeping."], ['to make the bed', 'tender la cama', 'tu meik de bed', 'Make the beds first.'], ['linen', 'ropa de cama', 'línen', 'Change the linen.'], ['checklist', 'lista de control', 'chéklist', 'Follow the checklist.']]),
  rp('85', {
    p: 'Llamada por un aviso de trabajo', w: ['Tina', 'dueña de un café'],
    s: 'Viste un aviso en la vidriera de un café y llamás para preguntar.',
    g: 'Decir por qué llamás, preguntar si sigue disponible y pedir cómo postularte.',
    v: [['job ad / advertisement', 'aviso de trabajo', 'yob ad', "I'm calling about the job ad."], ['still available', 'todavía disponible', 'stil avéilabol', 'Is the job still available?'], ['to apply', 'postularse', 'tu aplái', 'How can I apply?'], ['to drop off', 'dejar (en persona)', 'tu drop of', 'Can I drop off my CV?']],
    c: ['Thanks for calling.', 'Talk soon!'],
  }, {
    start: { s: 'Hi, Bean Café, Tina speaking.', h: "Hi, I'm calling about the job ad in your window.", a: 'Decí por qué llamás.', o: [['job|ad|advert|advertisement|calling|position|work|barista|window', 'still', 'Oh great.']], f: ['still', 'Are you calling about the job?'] },
    still: { s: "What would you like to know?", h: 'Is it still available?', o: [['still|available|open|filled', 'apply', "Yes, it's still available."], ['hours|pay|days', 'apply', "It's about twenty hours a week."]], f: ['apply'] },
    apply: { s: 'Have you got a resume?', h: 'Yes. Can I drop it off today?', o: [['yes|drop|bring|email|send|today|resume|cv', 'end', 'Sure, come in after two and ask for me.']], f: ['end', 'Just come in after two.'] },
  }),
  rp('86', {
    p: 'Mostrador de un café', w: ['Ben', 'encargado'],
    s: 'Vas en persona a dejar tu CV a un café.',
    g: 'Presentarte en pocas palabras, dejar el CV y preguntar por el encargado.',
    v: [['resume / CV', 'currículum', 'résiumei / si-ví', "Here's my resume."], ['manager', 'encargado', 'mánayer', 'Is the manager here?'], ['to hand in', 'entregar', 'tu jand in', 'I want to hand in my CV.'], ['casual', 'trabajo por horas, sin contrato fijo', 'cáyual', "I'm looking for casual work."]],
    c: ['Thanks for coming in.', 'Good luck!'],
  }, {
    start: { s: 'Hi, what can I get you?', h: "Hi, I'm looking for work. Is the manager here?", a: 'Decí que buscás trabajo y preguntá por el encargado.', o: [['manager|work|job|looking|resume|cv|hiring', 'intro', "That's me. I'm Ben."]], f: ['intro', "I'm the manager."] },
    intro: { s: 'Tell me a bit about you.', h: "I'm Juan, I'm from Uruguay and I have two years of barista experience.", o: [["i'm|i am|from|experience|years|barista|worked", 'cv', 'Nice.']], f: ['cv'], x: [FX.age] },
    cv: { s: 'Have you got a resume?', h: "Yes, here's my resume.", o: [['yes|here|resume|cv', 'end', "Thanks. I'll have a look and give you a call."]], f: ['end', "Leave it with me."], x: [FX.hereYouHave] },
  }),
  rp('87', {
    p: 'Llamada a un restaurante', w: ['Sophie', 'encargada'],
    s: 'Mandaste tu CV hace una semana y no te contestaron.',
    g: 'Preguntar con educación por tu postulación y mostrar interés.',
    v: [['to follow up', 'hacer seguimiento', 'tu fólou ap', "I'm following up on my application."], ['application', 'postulación', 'aplikéishon', 'I sent my application last week.'], ['still interested', 'sigo interesado', 'stil íntrested', "I'm still very interested."], ['to get back to', 'responderle a alguien', 'tu get bak tu', "We'll get back to you."]],
    c: ['Thanks for calling.', 'Talk soon.'],
  }, {
    start: { s: 'Hello, Riverside Restaurant.', h: "Hi, I'm calling to follow up on my application for the waiter job.", a: 'Decí por qué llamás.', o: [['follow|application|applied|resume|cv|job|waiter|sent', 'name', 'Sure, what was your name?']], f: ['name', 'Are you calling about a job?'] },
    name: { s: 'What was your name?', h: "My name's Juan Pérez. I sent it last Monday.", o: [["name|i'm|i am|juan|sent|last", 'news', 'Let me check…']], f: ['news'] },
    news: { s: "We're still deciding. Are you still interested?", h: "Yes, I'm still very interested.", o: [['yes|interested|still|very|of course', 'end', "Great, we'll get back to you by Friday."], ['no|found|another', 'end', 'No worries, thanks for letting us know.']], f: ['end', "We'll get back to you soon."] },
  }),
  rp('88', {
    p: 'Una entrevista de trabajo', w: ['Paul', 'entrevistador'],
    s: 'Te piden que cuentes tu experiencia de trabajo con detalle.',
    g: 'Contar dónde trabajaste, qué hacías y qué aprendiste, usando el pasado.',
    v: [['I was in charge of', 'estaba a cargo de', 'ai uós in charch ov', 'I was in charge of the kitchen.'], ['responsibilities', 'tareas, responsabilidades', 'risponsibílitis', 'My responsibilities were…'], ['I learned', 'aprendí', 'ai lernd', 'I learned to work fast.']],
    c: ['Thanks, that’s really helpful.', 'Great, thanks for sharing.'],
  }, {
    start: { s: 'Tell me about your last job.', h: 'I worked in a restaurant in Montevideo for two years.', a: 'Contá dónde trabajaste y cuánto tiempo.', o: [['worked|was|job|restaurant|shop|office|years|months', 'did', 'Interesting.']], f: ['did'], x: [['\\bi work(?:ed)? (in|at) .* during (\\d+|two|three) years\\b', 'for two years', 'Para la duración se usa for: for two years (no «during»).']] },
    did: { s: 'What did you do there?', h: 'I took orders, served tables and helped in the kitchen.', o: [['took|served|helped|did|was|cleaned|made|managed|charge|cooked', 'learn', 'Great.']], f: ['learn'] },
    learn: { s: 'What did you learn in that job?', h: 'I learned to work fast and to stay calm with customers.', o: [['learned|learnt|learn|work|fast|calm|team|customers', 'end', "That's exactly what we need."]], f: ['end', 'Good.'] },
  }),
  rp('89', {
    p: 'Una entrevista de trabajo', w: ['Kelly', 'encargada'],
    s: 'Te preguntan qué días y horarios podés trabajar.',
    g: 'Explicar tu disponibilidad con claridad y aclarar algún día que no puedas.',
    v: [['available', 'disponible', 'avéilabol', "I'm available on weekends."], ['except', 'excepto', 'iksépt', 'Every day except Tuesday.'], ['flexible', 'flexible', 'fléxibol', "I'm flexible."], ['full-time / part-time', 'tiempo completo / medio tiempo', 'ful taim / part taim', "I'm looking for full-time work."]],
    c: ['Great, that works.', 'Thanks, I’ll keep that in mind.'],
  }, {
    start: { s: 'When are you available to work?', h: "I'm available every day except Tuesdays.", a: 'Decí tu disponibilidad.', o: [['available|every|except|monday|tuesday|wednesday|thursday|friday|weekend|weekends|anytime|flexible', 'hours', 'Good.']], f: ['hours'], x: [FX.inDay] },
    hours: { s: 'Are you looking for full-time or part-time?', h: "Full-time, if possible. I'm quite flexible.", o: [['full|part|time|flexible|both|hours|possible', 'night', 'OK.']], f: ['night'] },
    night: { s: 'Can you work late nights, until midnight?', h: "Yes, I can work late, no problem.", o: [["can not|cannot|prefer not|no", 'end', "That's fine, we have day shifts too."], ['yes|can|no problem|sure|ok|okay|fine', 'end', 'Perfect.']], f: ['end', 'OK, noted.'] },
  }),
  rp('90', {
    p: 'Oficina de un empleador', w: ['Rob', 'gerente'],
    s: 'Te ofrecen un trabajo, pero el sueldo es más bajo que lo normal.',
    g: 'Hablar del sueldo con respeto y pedir lo que corresponde.',
    v: [['award rate', 'salario mínimo legal del rubro', 'auórd reit', 'Is that the award rate?'], ['hourly rate', 'pago por hora', 'áuerli reit', "What's the hourly rate?"], ['minimum wage', 'salario mínimo', 'mínimum ueich', "That's below the minimum wage."], ['penalty rates', 'pago extra fines de semana', 'pénalti reits', 'Do you pay penalty rates?']],
    c: ['Thanks for being upfront.', 'Glad we sorted that out.'],
  }, {
    start: { s: "We'd like to offer you the job. The pay is twenty dollars an hour, cash.", h: "Thanks for the offer. Isn't the minimum wage higher than that?", a: 'Mencioná con respeto que el pago es bajo.', o: [['minimum|wage|award|low|higher|legal|less|rate', 'fix', "Hmm, you're right."]], f: ['fix', 'Is there a problem with the pay?'] },
    fix: { s: 'OK, we can pay the award rate, twenty-five an hour, through payroll. Does that work?', h: 'Yes, that works. Do you pay penalty rates on Sundays?', o: [['penalty|sunday|weekend|extra', 'end', 'Yes, Sundays are time and a half.'], ['yes|works|ok|okay|good|fine|deal', 'end', 'Great, welcome to the team.']], f: ['end', 'Great.'] },
  }),
  rp('91', {
    p: 'Una reunión con el encargado', w: ['Mia', 'encargada'],
    s: 'Te ofrecen trabajar de lunes a sábado, pero vos querés tener el sábado libre.',
    g: 'Negociar los horarios proponiendo una alternativa.',
    v: [['to swap', 'cambiar, intercambiar', 'tu suóp', 'Could I swap Saturday for Sunday?'], ['instead', 'en lugar de eso', 'instéd', 'I can work Sunday instead.'], ['day off', 'día libre', 'dei of', 'I need Saturday off.']],
    c: ['Thanks for being flexible.', 'Good, that works for both of us.'],
  }, {
    start: { s: "We need you Monday to Saturday. Is that OK?", h: "I'd prefer to have Saturdays off. Could I work Sunday instead?", a: 'Proponé otra opción.', o: [['prefer|off|instead|could|sunday|swap|change|other', 'deal', 'Hmm, let me think.']], f: ['deal', "Is there a problem with Saturdays?"] },
    deal: { s: 'Sunday is fine, but then we need you until close on Fridays.', h: "That's fine. I can stay until close on Fridays.", o: [["can not|cannot|no|difficult", 'end', "OK, we'll look at the roster again."], ['fine|ok|okay|yes|can|stay|deal|good', 'end', 'Great, deal.']], f: ['end', "Let's try it."] },
  }),
  rp('92', {
    p: 'Llamada de un empleador', w: ['Rob', 'gerente'],
    s: 'Te llaman para ofrecerte el trabajo.',
    g: 'Aceptar con entusiasmo y preguntar cuándo empezás y qué tenés que llevar.',
    v: [['to accept', 'aceptar', 'tu aksépt', "I'm happy to accept."], ['to start', 'empezar', 'tu start', 'When do I start?'], ['uniform', 'uniforme', 'iúniform', 'Do I need a uniform?'], ['paperwork', 'papeles, trámites', 'péiperuork', 'Bring your paperwork.']],
    c: ['Welcome aboard!', 'See you soon!'],
  }, {
    start: { s: "Hi, it's Rob. We'd like to offer you the job!", h: "That's great news, thank you! I'm happy to accept.", a: 'Aceptá con entusiasmo.', o: [['great|thank|thanks|accept|happy|yes|love', 'when', 'Brilliant.']], f: ['when', 'So, are you happy to take it?'] },
    when: { s: 'Can you start next Monday?', h: 'Yes, I can start on Monday. What time?', o: [['yes|can|monday|start|time', 'bring', 'Seven a.m.'], ["can not|cannot|another|tuesday", 'bring', "OK, let's say Tuesday then."]], f: ['bring'] },
    bring: { s: 'Any questions?', h: 'Do I need to bring anything?', o: [['bring|need|uniform|documents|paperwork|clothes|shoes', 'end', 'Just your bank details, your TFN and black shoes.'], ["no|that's all|that is all", 'end', 'Great.']], f: ['end', 'Bring your bank details and TFN.'] },
  }),
  rp('93', {
    p: 'Llamada de un empleador', w: ['Kelly', 'encargada'],
    s: 'Te ofrecen un trabajo, pero ya aceptaste otro. Tenés que decir que no.',
    g: 'Rechazar la oferta con amabilidad y dejar la puerta abierta.',
    v: [['to turn down', 'rechazar', 'tu tern daun', 'I have to turn it down.'], ['unfortunately', 'lamentablemente', 'anfórchunetli', "Unfortunately, I can't."], ['in the future', 'en el futuro', 'in de fiúcher', 'Maybe in the future.'], ['to appreciate', 'agradecer, valorar', 'tu aprishieit', 'I really appreciate it.']],
    c: ['Thanks for letting me know. All the best!', 'Good luck with the new job!'],
  }, {
    start: { s: "Hi! Good news, we'd like to offer you the position.", h: "Thank you so much. Unfortunately, I've already accepted another job.", a: 'Rechazá con amabilidad.', o: [['unfortunately|sorry|already|another|accepted|other|can not|cannot|turn', 'future', "Oh, that's a shame."]], f: ['future', 'Is everything OK?'] },
    future: { s: "That's a shame. Maybe in the future?", h: 'Yes, I would love that. I really appreciate the offer.', o: [['yes|love|appreciate|thanks|thank|future|maybe|sure', 'end', "We'll keep your resume."]], f: ['end', "We'll keep your details."] },
  }),
  rp('94', {
    p: 'Llamada con un empleador del interior', w: ['Bill', 'dueño de una chacra'],
    s: 'El trabajo es lejos de la ciudad y necesitás saber dónde vivirías.',
    g: 'Preguntar si hay alojamiento, cuánto cuesta y qué incluye.',
    v: [['accommodation', 'alojamiento', 'akomodéishon', 'Is accommodation provided?'], ['on site', 'en el mismo lugar', 'on sait', 'Is it on site?'], ['to provide', 'dar, proporcionar', 'tu prováid', 'Do you provide meals?'], ['deducted', 'descontado', 'didákted', "It's deducted from your pay."]],
    c: ['See you out here!', 'Talk soon.'],
  }, {
    start: { s: 'So, any questions about the job?', h: 'Yes. Is accommodation provided?', a: 'Preguntá por el alojamiento.', o: [['accommodation|stay|live|house|room|sleep|provided', 'cost', "Yes, there's a shared house on the farm."]], f: ['cost', 'There is a house on the farm.'] },
    cost: { s: 'Anything else about it?', h: 'How much does it cost?', o: [['how much|cost|price|pay|rent', 'meals', "It's a hundred a week, taken out of your pay."], ["no|that's all|that is all", 'meals', 'OK.']], f: ['meals'] },
    meals: { s: 'Do you have any other questions?', h: 'Are meals included?', o: [['meal|meals|food|cook|kitchen|eat', 'end', 'No, but there is a kitchen and a shop in town.'], ["no|that's all|that is all", 'end', 'No worries.']], f: ['end', "You'll have a kitchen."] },
  }),
  rp('95', {
    p: 'Llamada con un empleador', w: ['Steve', 'capataz'],
    s: 'Te ofrecen un trabajo en una obra lejos y no tenés auto.',
    g: 'Explicar que no tenés auto y preguntar cómo llegar.',
    v: [['to get there', 'llegar', 'tu get der', 'How do I get there?'], ['public transport', 'transporte público', 'páblik tránsport', 'Is there public transport?'], ['to car-pool', 'compartir el auto', 'tu car pul', 'Can I car-pool with someone?'], ['pick-up', 'que te pasen a buscar', 'pik ap', 'Is there a pick-up?']],
    c: ['See you on site!', 'Talk soon, mate.'],
  }, {
    start: { s: "The job starts at six a.m. on site. You right with that?", h: "Yes, but I don't have a car. How do I get there?", a: 'Explicá que no tenés auto y preguntá cómo llegar.', o: [['car|get there|how|transport|bus|drive', 'options', "Right, no car."]], f: ['options', "Do you have a car?"], x: [FX.noHave] },
    options: { s: "There's no bus that early. A few of the boys drive from the city.", h: 'Could I car-pool with one of them? I can pay for petrol.', o: [['car pool|carpool|share|lift|ride|with|petrol|pay|could', 'end', "Good idea. I'll put you in touch with Jake."]], f: ['end', "I'll ask the boys."] },
  }),
];
