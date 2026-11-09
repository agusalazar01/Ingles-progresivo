import type { RoleplayScript } from './types';

/**
 * Guiones de roleplay. Cada uno se engancha al catálogo por su id (número + título en inglés).
 * Para agregar un guion: copiar uno de estos, cambiar el id y escribir los nodos. Nada más.
 */
export const SCRIPTS: Record<string, RoleplayScript> = {
  '33-ordering-coffee': {
    id: '33-ordering-coffee',
    place: 'Un café en Melbourne, a la mañana',
    partner: { name: 'Mia', role: 'barista' },
    situation: 'Entrás a un café antes de ir a trabajar. Hay un poco de fila y la barista te atiende.',
    goal: 'Pedir un café a tu gusto (tamaño, leche, para llevar) y pagar.',
    vocab: [
      { en: 'flat white', es: 'café con leche cremoso, el más pedido en Australia', say: 'flat uáit', example: 'Can I have a flat white, please?' },
      { en: 'regular', es: 'mediano (el tamaño del medio)', say: 'régiular', example: 'A regular flat white, please.' },
      { en: 'full cream / skim / oat milk', es: 'leche entera / descremada / de avena', say: 'ful crim / skim / out milk', example: 'With oat milk, please.' },
      { en: 'takeaway', es: 'para llevar', say: 'téik-auei', example: "It's takeaway, thanks." },
      { en: 'to have here', es: 'para tomar acá', say: 'tu jav jíer', example: "I'll have it here." },
      { en: 'tap', es: 'pagar apoyando la tarjeta o el celular', say: 'tap', example: 'Can I tap my card?' },
      { en: 'Anything else?', es: '¿Algo más?', say: 'éni-zing els', example: "No, that's all, thanks." },
    ],
    aussie: [
      { en: "G'day", es: 'hola', when: 'Saludo informal, a cualquier hora.' },
      { en: 'No worries', es: 'no hay problema / de nada', when: 'Para responder a un gracias o a un pedido.' },
      { en: 'Too easy', es: 'fácil, dale', when: 'Cuando algo no es ningún problema.' },
      { en: 'Have a good one', es: 'que tengas buen día', when: 'Para despedirse de alguien que atendés o que te atiende.' },
    ],
    start: 'order',
    nodes: {
      order: {
        say: ['Hi! What can I get for you?', "G'day! What can I get you?", 'Morning! What would you like?'],
        hint: 'Can I have a flat white, please?',
        aim: 'Pedí un café.',
        options: [{ match: ['flat white|latte|cappuccino|long black|coffee|espresso|tea|hot chocolate|mocha|chai'], reply: ['Sure thing.', 'No worries.'], next: 'size', praise: 'Bien: pediste lo que querías.' }],
        fallback: { reply: "Sorry? We've got flat whites, lattes, cappuccinos… I'll make you a flat white.", next: 'size' },
        fixes: [
          { wrong: '\\bi want\\b', right: 'Can I have a flat white, please?', why: '«I want…» suena brusco al pedir. En un café se dice «Can I have…, please?» o «I’d like…».' },
          { wrong: '\\bgive me\\b', right: 'Can I have…, please?', why: '«Give me» es una orden: con alguien que no conocés suena mal.' },
          { wrong: '\\bone coffee\\b', right: 'a coffee', why: 'Para «un» se usa a / an. One solo si estás contando (one coffee and two teas).' },
        ],
      },
      size: {
        say: ['What size? Small, regular or large?', 'Regular or large?'],
        hint: 'Regular, please.',
        options: [{ match: ['small|regular|medium|large|big'], reply: 'Lovely.', next: 'milk', praise: 'Bien.' }],
        fallback: { reply: "I'll do you a regular.", next: 'milk' },
        fixes: [{ wrong: '\\bmedium\\b', right: 'regular', why: 'Se entiende, pero en Australia el tamaño del medio se dice «regular».' }],
      },
      milk: {
        say: ['Full cream, skim or oat milk?', 'Any particular milk? We have full cream, skim, soy and oat.'],
        hint: 'Oat milk, please.',
        options: [{ match: ['full cream|normal|regular|skim|soy|oat|almond|lactose|no milk|whatever|any|whole'], reply: 'Too easy.', next: 'name', praise: 'Bien.' }],
        fallback: { reply: "I'll just use full cream.", next: 'name' },
        fixes: [{ wrong: '\\bwhole milk\\b', right: 'full cream', why: 'En Australia la leche entera se dice «full cream».' }],
      },
      name: {
        say: ['Can I get a name for the order?', "And what's your name?"],
        hint: "It's Juan.",
        options: [{ match: ['*'], reply: 'Thanks!', next: 'here' }],
        fallback: { reply: 'Thanks!', next: 'here' },
        fixes: [{ wrong: "\\bmy name's is\\b", right: "My name's Juan.", why: '«Name’s» ya incluye is: decí «My name’s…» o «My name is…».' }],
      },
      here: {
        say: ['Is that for here or takeaway?', 'Having it here or takeaway?'],
        hint: 'Takeaway, please.',
        options: [
          { match: ['take away|takeaway|to go|take it'], reply: 'No worries.', next: 'pay', praise: 'Bien.' },
          { match: ['here|eat in|stay|sit'], reply: "Grab a seat, I'll bring it over.", next: 'pay', praise: 'Bien.' },
        ],
        fallback: { reply: "I'll make it takeaway.", next: 'pay' },
        fixes: [{ wrong: '\\bto go\\b', right: 'takeaway', why: '«To go» se entiende (es de Estados Unidos), pero en Australia se dice «takeaway».' }],
      },
      pay: {
        say: ["That's five fifty. Card or cash?", 'Five fifty, thanks. Tap or cash?'],
        hint: 'Card, please.',
        options: [{ match: ['card|tap|eftpos|cash|phone|apple pay|google pay'], reply: 'Perfect, all done.', next: 'extra', praise: 'Bien.' }],
        fallback: { reply: 'You can just tap your card here.', next: 'extra' },
        fixes: [{ wrong: '\\bwith card\\b', right: 'By card, please. / Card, please.', why: 'Se dice «by card» o solo «card», no «with card».' }],
      },
      extra: {
        say: ['Anything else?', "Can I get you anything else? We've got banana bread today."],
        hint: "No, that's all, thanks.",
        options: [
          { match: ['banana bread|muffin|croissant|cake|something to eat|toastie|sandwich'], reply: "Good choice, I'll heat it up for you.", next: 'end', praise: 'Bien.' },
          { match: ["no|that's all|that is all|nothing|i'm good|i am good|all good|that's it|that is it"], reply: 'No worries.', next: 'end', praise: 'Bien.' },
        ],
        fallback: { reply: 'No worries.', next: 'end' },
        fixes: [{ wrong: "\\bnothing more\\b", right: "No, that's all, thanks.", why: 'Más natural: «That’s all, thanks» o «I’m good, thanks».' }],
      },
    },
    closing: ["It'll be ready in a couple of minutes. Have a good one!", "Won't be long. Enjoy your day!"],
  },

  '23-opening-a-bank-account': {
    id: '23-opening-a-bank-account',
    place: 'Una sucursal de banco en Sídney',
    partner: { name: 'David', role: 'empleado del banco' },
    situation: 'Llegaste hace pocos días y necesitás una cuenta para que te paguen el sueldo. Te atiende un empleado en el mostrador.',
    goal: 'Abrir una cuenta: elegir el tipo, mostrar el pasaporte, decir tu visa y tu dirección, y preguntar algo (comisiones, transferencias o el TFN).',
    vocab: [
      { en: 'account', es: 'cuenta', say: 'akáunt', example: "I'd like to open an account." },
      { en: 'everyday account', es: 'cuenta para el día a día (sueldo y gastos)', say: 'évri-dei akáunt', example: 'An everyday account, please.' },
      { en: 'savings account', es: 'caja de ahorro', say: 'séivings akáunt', example: 'I also want a savings account.' },
      { en: 'ID', es: 'documento de identidad', say: 'ai-dí', example: 'Here is my ID.' },
      { en: 'debit card', es: 'tarjeta de débito', say: 'débit card', example: 'When will my debit card arrive?' },
      { en: 'fee', es: 'comisión, cargo', say: 'fi', example: 'Are there any monthly fees?' },
      { en: 'by post', es: 'por correo', say: 'bai poust', example: 'The card comes by post.' },
      { en: 'Tax File Number (TFN)', es: 'número de contribuyente para trabajar', say: 'tax fail námber', example: 'I need to apply for my TFN.' },
      { en: 'wages', es: 'sueldo', say: 'uéiyes', example: 'My wages go into this account.' },
    ],
    aussie: [
      { en: 'What are you after?', es: '¿Qué estás buscando?', when: 'Lo dicen en tiendas y bancos para preguntar qué necesitás.' },
      { en: "You're all set", es: 'ya está todo listo', when: 'Al terminar un trámite.' },
    ],
    start: 'start',
    nodes: {
      start: {
        say: ['Good morning, how can I help you today?', 'Hi there, what can I do for you?'],
        hint: "I'd like to open a bank account, please.",
        aim: 'Decí que querés abrir una cuenta.',
        options: [
          { match: ['open|new|start', 'account'], reply: 'Sure, I can help with that.', next: 'type', praise: 'Bien: dijiste qué querías hacer.' },
          { match: ['account'], reply: 'Sure. You want to open an account?', next: 'type', praise: 'Bien.' },
        ],
        fallback: { reply: 'Are you here to open an account? No worries, I can help.', next: 'type' },
        fixes: [
          { wrong: '\\bi want (to )?open\\b', right: "I'd like to open an account, please.", why: '«I want» suena brusco. En un banco queda mejor «I’d like to…».' },
          { wrong: '\\b(a|one) count\\b', right: 'an account', why: 'Cuenta de banco = account (no «count»). Y como empieza con vocal: an account.' },
          { wrong: '\\ba account\\b', right: 'an account', why: 'Account empieza con sonido de vocal: an account.' },
        ],
      },
      type: {
        say: ['What kind of account are you after? An everyday account or a savings account?'],
        hint: 'An everyday account, please.',
        options: [
          { match: ['everyday|normal|transaction|debit|regular|basic'], reply: "Good choice, that's the one for your wages.", next: 'id', praise: 'Bien.' },
          { match: ['saving|savings'], reply: "No worries. You'll also need an everyday account for your wages, so I'll set up both.", next: 'id', praise: 'Bien.' },
          { match: ["don't know|not sure|which|difference|recommend|what is"], reply: 'An everyday account is for daily spending and your pay. Most people start with that one.', next: 'id', praise: 'Bien: preguntaste para entender.' },
        ],
        fallback: { reply: "I'll set you up with an everyday account. That's the most common one.", next: 'id' },
      },
      id: {
        say: ['Great. Can I see some ID, please? A passport is fine.'],
        hint: 'Sure, here is my passport.',
        options: [{ match: ['passport|here|sure|yes|of course|id'], reply: 'Thank you.', next: 'visa', praise: 'Bien.' }],
        fallback: { reply: 'Your passport is fine, thanks.', next: 'visa' },
        fixes: [{ wrong: '\\bhere you have\\b', right: 'Here you are. / Here you go.', why: '«Here you have» es traducción literal. Se dice «Here you are» o «Here you go».' }],
      },
      visa: {
        say: ['And what visa are you on?', 'Are you here on a working holiday visa?'],
        hint: "I'm on a working holiday visa.",
        options: [{ match: ['working holiday|work and holiday|holiday|student|visa|417|462|yes'], reply: 'Lovely.', next: 'address', praise: 'Bien.' }],
        fallback: { reply: 'No worries, I can see it here on your passport.', next: 'address' },
        fixes: [{ wrong: '\\b(have|with) a visa of\\b', right: "I'm on a working holiday visa.", why: 'Para la visa se usa «be on»: I’m on a … visa.' }],
      },
      address: {
        say: ["What's your address in Australia?", 'Do you have an Australian address?'],
        hint: "I'm staying at a hostel in Bondi for now.",
        options: [
          { match: ["don't have|no address|not yet|haven't got|do not have"], reply: 'No problem, you can use your hostel address and change it later.', next: 'card', praise: 'Bien: explicaste tu situación.' },
          { match: ['hostel|street|road|address|staying|live|living|[0-9]|yes'], reply: "That's fine. You can update it later in the app.", next: 'card', praise: 'Bien.' },
        ],
        fallback: { reply: 'You can use your hostel address for now.', next: 'card' },
        fixes: [{ wrong: '\\bi (am|m) (living|staying) (in|at) .* since\\b', right: "I've been staying at a hostel since…", why: 'Desde un momento hasta ahora se usa el present perfect: I’ve been staying… since / for…' }],
      },
      card: {
        say: ['Your debit card will arrive by post in about a week. Is that OK?'],
        hint: "Yes, that's fine. Can I use the app before that?",
        options: [
          { match: ['app|online|phone|before|meanwhile'], reply: 'Yes, you can use the app straight away and add the card to your phone.', next: 'fees', praise: 'Bien: hiciste una pregunta útil.' },
          { match: ['week|long|faster|sooner|today'], reply: 'Sorry, a week is the fastest. But you can use the app today.', next: 'fees', praise: 'Bien.' },
          { match: ['yes|ok|okay|fine|great|perfect|good|sure'], reply: 'Great.', next: 'fees', praise: 'Bien.' },
        ],
        fallback: { reply: 'You can also use the app straight away.', next: 'fees' },
      },
      fees: {
        say: ['Do you have any questions?'],
        hint: 'Are there any monthly fees?',
        aim: 'Preguntá algo: comisiones, mandar plata al exterior o el TFN.',
        options: [
          { match: ['fee|fees|charge|cost|pay'], reply: "There are no monthly fees if you deposit two thousand dollars a month. Otherwise it's five dollars.", next: 'tfn', praise: 'Bien: preguntaste por las comisiones.' },
          { match: ['transfer|send|overseas|uruguay|abroad|another country'], reply: 'Yes, you can send money overseas in the app. There is a small fee.', next: 'tfn', praise: 'Bien.' },
          { match: ['tfn|tax'], reply: 'Good question. Apply for your Tax File Number online and then add it in the app.', next: 'end', praise: 'Bien.' },
          { match: ["no|that's all|that is all|nothing|all good"], reply: 'No worries.', next: 'tfn', praise: 'Bien.' },
        ],
        fallback: { reply: 'If you have questions later, just call us or use the app.', next: 'tfn' },
        fixes: [{ wrong: '\\bcommissions?\\b', right: 'Are there any fees?', why: 'Para las comisiones del banco se dice «fees». Commission es lo que cobra un vendedor.' }],
      },
      tfn: {
        say: ['One more thing: once you have your Tax File Number, add it to the account, OK?'],
        hint: "OK, I will. Thanks for your help!",
        options: [{ match: ['ok|okay|will|sure|thanks|thank you|cheers|no worries|yes'], reply: 'My pleasure.', next: 'end', praise: 'Bien.' }],
        fallback: { next: 'end' },
      },
    },
    closing: ["You're all set. Welcome to Australia!", 'All done. Have a great day!'],
  },

  '70-barista-job-interview': {
    id: '70-barista-job-interview',
    place: 'Un café en Brisbane, después del horario de cierre',
    partner: { name: 'Sarah', role: 'encargada del café' },
    situation: 'Mandaste tu CV a un café y te llamaron para una entrevista. La encargada te recibe en una mesa.',
    goal: 'Presentarte, contar tu experiencia, explicar cómo hacés un café, decir tu disponibilidad, hacer una pregunta y acordar un turno de prueba.',
    vocab: [
      { en: 'trial shift', es: 'turno de prueba (a veces pago, a veces no)', say: 'tráial shift', example: 'Can you come in for a trial shift?' },
      { en: 'roster', es: 'planilla de turnos', say: 'róster', example: "I'll put you on the roster." },
      { en: 'morning rush', es: 'la hora pico de la mañana', say: 'mórning rash', example: 'The morning rush is crazy.' },
      { en: 'hospitality', es: 'el rubro de gastronomía y hotelería', say: 'hospitáliti', example: 'I have experience in hospitality.' },
      { en: 'available', es: 'disponible', say: 'avéilabol', example: "I'm available on weekends." },
      { en: 'hourly rate', es: 'pago por hora', say: 'áuerli reit', example: "What's the hourly rate?" },
      { en: 'to steam the milk', es: 'espumar la leche', say: 'stim de milk', example: 'Then I steam the milk.' },
      { en: 'a shot', es: 'una dosis de espresso', say: 'a shot', example: 'A double shot, please.' },
    ],
    aussie: [
      { en: 'Have a seat', es: 'tomá asiento', when: 'Para invitar a alguien a sentarse.' },
      { en: 'Good on ya', es: '¡bien ahí!', when: 'Para felicitar o aprobar algo que hizo alguien.' },
    ],
    start: 'start',
    nodes: {
      start: {
        say: ['Hi, thanks for coming in. Have a seat. So, tell me a bit about yourself.'],
        hint: "I'm from Uruguay. I've been in Australia for a month and I'm looking for work as a barista.",
        aim: 'Presentate: de dónde sos, desde cuándo estás acá y qué trabajo buscás.',
        options: [{ match: ["from|i'm|i am|my name|years"], reply: 'Nice to meet you.', next: 'exp', praise: 'Bien: te presentaste.' }],
        fallback: { reply: 'Nice to meet you.', next: 'exp' },
        fixes: [
          { wrong: '\\bi have \\d+ years\\b', right: "I'm 27 (years old).", why: 'La edad va con be: I’m 27.' },
          { wrong: "\\bi('m| am) here (since|for)\\b", right: "I've been here for a month.", why: 'Desde un momento hasta ahora se usa el present perfect: I’ve been here for… / since…' },
        ],
      },
      exp: {
        say: ['Have you worked as a barista before?', 'Do you have any barista experience?'],
        hint: 'Yes, I worked in a café in Montevideo for two years.',
        options: [
          { match: ["no|never|haven't|have not|not really"], reply: "That's OK, we can train you. Have you worked with customers at all?", next: 'hosp', praise: 'Bien: fuiste sincero.' },
          { match: ['yes|worked|experience|year|years|months'], reply: 'Great.', next: 'coffee', praise: 'Bien: contaste tu experiencia.' },
        ],
        fallback: { reply: 'OK, we can talk about that later.', next: 'coffee' },
        fixes: [
          { wrong: '\\bi have worked .*\\b(in 20\\d\\d|last year|ago)\\b', right: 'I worked there in 2022.', why: 'Si decís cuándo fue (in 2022, last year, two years ago), va pasado simple: I worked.' },
          { wrong: '\\b(work|worked|working) like (a )?barista\\b', right: 'I worked as a barista.', why: 'Para hablar de un trabajo se usa «as»: as a barista.' },
        ],
      },
      hosp: {
        say: ['Any job with customers? Restaurants, shops, that kind of thing?'],
        hint: 'Yes, I worked as a waiter for a year.',
        options: [
          { match: ['no|never'], reply: 'No worries, everyone starts somewhere.', next: 'coffee', praise: 'Bien.' },
          { match: ['yes|worked|waiter|shop|restaurant|customers|bar|hotel'], reply: 'Perfect, that helps a lot.', next: 'coffee', praise: 'Bien.' },
        ],
        fallback: { reply: 'OK.', next: 'coffee' },
      },
      coffee: {
        say: ['How would you make a flat white?', 'Can you tell me how you make a good latte?'],
        hint: 'First I grind the coffee, then I pull the shot and after that I steam the milk.',
        aim: 'Explicá los pasos con first, then, after that.',
        options: [{ match: ['first|then|after|grind|shot|steam|milk|espresso|coffee'], reply: "Sounds like you know what you're doing.", next: 'busy', praise: 'Bien: explicaste los pasos.' }],
        fallback: { reply: "OK, we'll see on the trial shift.", next: 'busy' },
        fixes: [{ wrong: '\\bfirstly\\b', right: 'First, …', why: 'Al hablar suena más natural «First, …».' }],
      },
      busy: {
        say: ['It gets really busy in the morning rush. How do you work under pressure?'],
        hint: 'I stay calm and I focus on one order at a time.',
        options: [{ match: ['calm|focus|fast|quick|team|organised|organized|pressure|busy|priorit|relax'], reply: "Good, that's exactly what we need.", next: 'avail', praise: 'Bien.' }],
        fallback: { reply: 'OK.', next: 'avail' },
      },
      avail: {
        say: ['What days are you available?', 'When can you work?'],
        hint: "I'm available Monday to Friday, and Saturdays too.",
        options: [{ match: ['monday|tuesday|wednesday|thursday|friday|saturday|sunday|weekend|weekdays|any|every|morning|afternoon|anytime'], reply: 'Great.', next: 'questions', praise: 'Bien.' }],
        fallback: { reply: "Let's talk about the roster later.", next: 'questions' },
        fixes: [
          { wrong: '\\bdisponible\\b', right: "I'm available…", why: 'Disponible = available.' },
          { wrong: '\\bin (monday|tuesday|wednesday|thursday|friday|saturday|sunday)s?\\b', right: 'on Mondays', why: 'Con los días de la semana va on.' },
        ],
      },
      questions: {
        say: ['Do you have any questions for me?'],
        hint: "What's the hourly rate?",
        aim: 'Hacé una pregunta: sueldo, horario o cuándo empezar.',
        options: [
          { match: ['pay|per hour|rate|salary|money|wage'], reply: "It's thirty dollars an hour, a bit more on weekends.", next: 'trial', praise: 'Bien: preguntaste por el sueldo.' },
          { match: ['start|when'], reply: 'We could start you next week.', next: 'trial', praise: 'Bien.' },
          { match: ['hour|hours|roster|shift|time'], reply: 'Shifts are usually six to two.', next: 'trial', praise: 'Bien.' },
          { match: ["no|that's all|that is all|nothing"], reply: 'No worries.', next: 'trial', praise: 'Bien.' },
        ],
        fallback: { reply: 'If you think of anything, just send me a message.', next: 'trial' },
        fixes: [{ wrong: '\\bhow much (you|do you) pay\\b', right: "How much is the pay? / What's the hourly rate?", why: 'Más natural: «How much is the pay?» o «What’s the hourly rate?».' }],
      },
      trial: {
        say: ['Could you come in for a trial shift on Thursday at seven?'],
        hint: "Yes, of course. I'll be there at seven.",
        options: [
          { match: ["can't|cannot|can not|busy|another day|different day|friday"], reply: "No worries, let's do Friday then.", next: 'end', praise: 'Bien: propusiste otro día.' },
          { match: ['yes|sure|of course|definitely|be there|can|ok|okay'], reply: 'Excellent.', next: 'end', praise: 'Bien.' },
        ],
        fallback: { reply: "Let's say Thursday at seven.", next: 'end' },
        fixes: [{ wrong: '\\bin thursday\\b', right: "I'll be there on Thursday at seven.", why: 'El día va con on y la hora con at.' }],
      },
    },
    closing: ['Great to meet you. See you on Thursday!', 'Thanks for coming in. See you soon!'],
  },
};
