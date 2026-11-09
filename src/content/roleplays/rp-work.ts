import { FX, rp } from './build';


/** 8. Primer día y vida en el trabajo */
export const WORK = [
  rp('96', {
    p: 'Tu primer día en un depósito', w: ['Kylie', 'compañera que te recibe'],
    s: 'Llegás el primer día y una compañera te muestra el lugar.',
    g: 'Presentarte, preguntar dónde están las cosas y qué tenés que hacer primero.',
    v: [['first day', 'primer día', 'ferst dei', "It's my first day."], ['break room', 'sala de descanso', 'breik rum', 'Where is the break room?'], ['to show around', 'mostrar el lugar', 'tu shou aráund', "I'll show you around."]],
    c: ['Welcome to the team!', 'You’ll be right, mate.'],
  }, {
    start: { s: 'Hi! You must be the new guy.', h: "Yes, hi! I'm Juan. It's my first day.", a: 'Presentate.', o: [["i'm|i am|name|first day|new|hi|hello|yes", 'where', "Welcome! I'm Kylie. I'll show you around."]], f: ['where', "I'm Kylie, I'll show you around."] },
    where: { s: 'Anything you want to know?', h: 'Where can I leave my bag?', o: [['bag|leave|locker|put|where|toilet|break room|kitchen', 'first', "In the lockers, next to the break room."]], f: ['first'] },
    first: { s: 'Ready to start?', h: 'Yes. What should I do first?', o: [['first|start|do|what|ready|yes', 'end', "First you'll help me unload the truck."]], f: ['end', "You'll help me with the truck."] },
  }),
  rp('97', {
    p: 'La oficina del supervisor', w: ['Greg', 'tu supervisor'],
    s: 'Conocés a tu supervisor. Te cuenta cómo funciona el equipo.',
    g: 'Saludar con respeto, contar tu experiencia y preguntar qué espera de vos.',
    v: [['supervisor', 'supervisor', 'súpervaisor', 'Greg is my supervisor.'], ['to expect', 'esperar (de alguien)', 'tu ekspékt', 'What do you expect from me?'], ['to report to', 'responder a, reportar a', 'tu ripórt tu', 'You report to me.']],
    c: ['Good to have you here.', 'Welcome aboard.'],
  }, {
    start: { s: "G'day, I'm Greg, your supervisor.", h: 'Nice to meet you, Greg. Thanks for the opportunity.', a: 'Saludá con respeto.', o: [['nice|meet|thanks|thank|hi|hello|pleasure', 'exp', 'No worries.']], f: ['exp', 'Good.'] },
    exp: { s: 'Have you done this kind of work before?', h: "Yes, a little. I worked in a store back home.", o: [['no|never|first', 'expect', "That's fine, we'll train you."], ['yes|worked|little|before|years|months', 'expect', 'Good.']], f: ['expect'] },
    expect: { s: 'Any questions for me?', h: 'What do you expect from me in the first week?', o: [['expect|first week|what|need|should', 'end', 'Just be on time, listen and ask if you are not sure.'], ["no|that's all|that is all", 'end', 'Easy. Ask me anytime.']], f: ['end', 'Just ask if you are not sure.'] },
  }),
  rp('98', {
    p: 'La cocina de un restaurante', w: ['Chef Tony', 'jefe de cocina'],
    s: 'El chef te da varias instrucciones seguidas.',
    g: 'Confirmar cada instrucción repitiéndola con tus palabras.',
    v: [['first… then…', 'primero… después…', 'ferst… den', 'First wash, then chop.'], ['to confirm', 'confirmar', 'tu konférm', 'So, just to confirm…'], ['tray', 'bandeja', 'trei', 'Put them on a tray.']],
    c: ['Good, get to it.', 'Perfect, thanks.'],
  }, {
    start: { s: 'First wash the potatoes, then cut them into chips.', h: 'OK, so first I wash the potatoes and then I cut them.', a: 'Repetí la instrucción para confirmar.', o: [['wash|cut|chop|potatoes|first|then|so', 'next', 'Exactly.'], ['sorry|again|repeat', 'next', 'Wash the potatoes, then cut them.']], f: ['next', 'Wash, then cut.'] },
    next: { s: 'Then put them on a tray in the fridge.', h: 'On a tray in the fridge. Got it.', o: [['tray|fridge|got it|ok|okay', 'end', 'Good on ya.']], f: ['end', 'Tray, fridge.'] },
  }),
  rp('99', {
    p: 'Una obra con ruido', w: ['Mick', 'capataz'],
    s: 'Hay ruido y hablaron muy rápido. No entendiste.',
    g: 'Pedir que repita, que hable más despacio y confirmar lo que entendiste.',
    v: [['Sorry, could you repeat that?', 'perdón, ¿podés repetir?', 'sóri, kud iu ripít dat', 'Sorry, could you repeat that?'], ['a bit slower', 'un poco más despacio', 'a bit slóuer', 'Could you speak a bit slower?'], ['Do you mean…?', '¿Querés decir…?', 'du iu min', 'Do you mean the red one?']],
    c: ['No dramas.', 'Good, you got it.'],
  }, {
    start: { s: 'Grab the ladder from the ute and take it round the back, yeah?', h: 'Sorry, could you repeat that a bit slower?', a: 'Pedí que repita más despacio.', o: [['sorry|repeat|again|slower|slowly|pardon', 'slow', 'Sure.'], ['ok|okay|yes|got it', 'slow', 'Wait, did you get that?']], f: ['slow'] },
    slow: { s: 'Take the ladder… from the ute… to the back.', h: 'Do you mean the ladder in the white ute?', o: [['mean|ladder|white|ute|which|this|that', 'end', "Yep, that one. Cheers."]], f: ['end', 'The white ute, yeah.'] },
  }),
  rp('100', {
    p: 'Una tienda', w: ['Jess', 'compañera'],
    s: 'Tenés que hacer algo que no sabés y le pedís ayuda a una compañera.',
    g: 'Pedir ayuda con educación, explicar qué no sabés y agradecer.',
    v: [['Could you give me a hand?', '¿Me das una mano?', 'kud iu giv mi a jand', 'Could you give me a hand?'], ['I am not sure how to…', 'no sé bien cómo…', 'aim not shur jau tu', "I'm not sure how to do a refund."], ['to show', 'mostrar', 'tu shou', 'Can you show me?']],
    c: ['Any time!', 'No worries, happy to help.'],
  }, {
    start: { s: 'You OK?', h: "Could you give me a hand? I'm not sure how to do a refund.", a: 'Pedí ayuda y explicá qué no sabés.', o: [['hand|help|not sure|how|show|refund|do not know', 'show', 'Sure.']], f: ['show', 'What do you need?'], x: [FX.explainMe] },
    show: { s: 'Press refund, scan the item and give them the money back. Want me to show you?', h: 'Yes, please. Thanks so much.', o: [['yes|please|show|thanks|thank', 'end', 'Easy, watch this.'], ['no|got it|ok|okay', 'end', "Cool, call me if you need me."]], f: ['end', 'Watch.'] },
  }),
  rp('101', {
    p: 'Un depósito', w: ['Greg', 'supervisor'],
    s: 'La máquina de envolver pallets no funciona.',
    g: 'Avisar el problema, explicar qué pasa y preguntar qué hacés mientras.',
    v: [['to not work / to be broken', 'no funcionar / estar roto', 'tu bi bróuken', "The machine isn't working."], ['it keeps…', 'sigue…, no para de…', 'it kips', 'It keeps stopping.'], ['in the meantime', 'mientras tanto', 'in de míntaim', 'What should I do in the meantime?']],
    c: ['Thanks for letting me know.', 'Good call reporting it.'],
  }, {
    start: { s: "What's up?", h: "The wrapping machine isn't working. It keeps stopping.", a: 'Explicá el problema.', o: [['not working|broken|stops|stopping|problem|machine|does not', 'check', 'Again? OK.']], f: ['check', 'Which machine?'] },
    check: { s: 'Did you turn it off and on?', h: 'Yes, I did, but it still stops.', o: [['yes|did|tried|still|no', 'meantime', "OK, I'll call the technician."]], f: ['meantime'] },
    meantime: { s: 'Anything else?', h: 'What should I do in the meantime?', o: [['meantime|meanwhile|what|should|do', 'end', 'Wrap them by hand for now.'], ["no|that's all|that is all", 'end', 'Wrap them by hand for now.']], f: ['end', 'Do it by hand for now.'] },
  }),
  rp('102', {
    p: 'Un café', w: ['Ben', 'encargado'],
    s: 'Le diste a un cliente el café equivocado y el encargado te pregunta qué pasó.',
    g: 'Admitir el error, explicar qué pasó y decir qué vas a hacer distinto.',
    v: [['my mistake', 'mi error', 'mai mistéik', 'Sorry, my mistake.'], ['to mix up', 'confundir', 'tu miks ap', 'I mixed up the orders.'], ["It won't happen again", 'no va a volver a pasar', 'it uóunt jápen aguén', "It won't happen again."]],
    c: ['All good, it happens.', 'Thanks for owning it.'],
  }, {
    start: { s: 'That customer said she got the wrong coffee. What happened?', h: 'Sorry, my mistake. I mixed up the orders.', a: 'Admití el error.', o: [['sorry|mistake|mixed|wrong|my fault|confused', 'fix', 'OK.']], f: ['fix', 'Was it a mix-up?'] },
    fix: { s: 'How can we stop it next time?', h: "I'll check the name on the cup before I give it. It won't happen again.", o: [['check|name|cup|read|careful|again|next time|will', 'end', "Good. Make her a new one, on the house."]], f: ['end', 'Just check the cups.'] },
  }),
  rp('103', {
    p: 'Hablando con tu encargada', w: ['Mia', 'encargada'],
    s: 'Necesitás un día libre el viernes que viene.',
    g: 'Pedir el día con anticipación, dar el motivo y ofrecer una solución.',
    v: [['day off', 'día libre', 'dei of', 'Could I have Friday off?'], ['in advance', 'con anticipación', 'in adváns', "I'm asking in advance."], ['to cover', 'cubrir (un turno)', 'tu káver', 'Can someone cover me?']],
    c: ['Thanks for asking early.', 'All sorted.'],
  }, {
    start: { s: 'Hey, what can I do for you?', h: 'Could I have next Friday off, please?', a: 'Pedí el día.', o: [['off|day|friday|free|could|leave', 'why', 'Hmm, why?']], f: ['why', 'What do you need?'] },
    why: { s: "What's it for?", h: 'I have an appointment at immigration. I can work Saturday instead.', o: [['appointment|immigration|bank|doctor|family|friend|visa|have to|need', 'end', "OK, that's fine. Thanks for telling me early."]], f: ['end', 'OK, that should be fine.'] },
  }),
  rp('104', {
    p: 'Llamada temprano a la mañana', w: ['Mia', 'encargada'],
    s: 'Te despertaste con fiebre y no podés ir a trabajar.',
    g: 'Avisar que estás enfermo, decir qué tenés y si tenés certificado.',
    v: [['to call in sick', 'avisar que estás enfermo', 'tu kol in sik', "I'm calling in sick."], ['a fever / a temperature', 'fiebre', 'a fíver', 'I have a fever.'], ['medical certificate', 'certificado médico', 'médikol sertífikeit', "I'll get a medical certificate."]],
    c: ['Feel better soon.', 'Rest up!'],
  }, {
    start: { s: 'Hello, Mia speaking.', h: "Hi Mia, it's Juan. Sorry, I'm sick and I can't come in today.", a: 'Avisá que estás enfermo.', o: [['sick|unwell|ill|can not|cannot|come|today|fever', 'what', "Oh no."]], f: ['what', 'Are you OK?'] },
    what: { s: "What's wrong?", h: 'I have a fever and a sore throat.', o: [['fever|temperature|throat|headache|flu|cold|stomach|sick', 'cert', 'Poor thing.']], f: ['cert'] },
    cert: { s: 'Can you get a medical certificate?', h: "Yes, I'll see a doctor and send it to you.", o: [['yes|will|doctor|send|get|certificate', 'end', 'Thanks. Take care.']], f: ['end', 'Send it when you can.'] },
  }),
  rp('105', {
    p: 'El cartel con los turnos (roster)', w: ['Kylie', 'compañera'],
    s: 'Salió el roster y no lo entendés bien.',
    g: 'Preguntar qué días y horas trabajás y si hay cambios.',
    v: [['roster', 'cronograma de turnos', 'róster', "Is the roster out?"], ['to be on', 'estar de turno', 'tu bi on', 'Am I on Saturday?'], ['early / late shift', 'turno temprano / tarde', 'érli / leit shift', "I'm on the late shift."]],
    c: ['Easy!', 'See you on the shift!'],
  }, {
    start: { s: 'The new roster is up.', h: 'Can you help me? Which days am I on this week?', a: 'Preguntá qué días trabajás.', o: [['which|days|on|when|help|roster|week', 'times', "You're on Monday, Wednesday and Saturday."]], f: ['times'] },
    times: { s: 'Anything else?', h: 'What time does my Saturday shift start?', o: [['time|start|saturday|what|finish|hours', 'end', 'Saturday is the early one, from six.'], ["no|that's all|that is all", 'end', 'Easy.']], f: ['end', "It's the early one."] },
  }),
  rp('106', {
    p: 'El descanso en el trabajo', w: ['Sam', 'compañero'],
    s: 'Querés cambiar tu turno del sábado con un compañero.',
    g: 'Pedir el cambio, ofrecer tu turno a cambio y acordar avisar al encargado.',
    v: [['to swap shifts', 'cambiar turnos', 'tu suóp shifts', 'Can we swap shifts?'], ['in return', 'a cambio', 'in ritérn', "I can do your Sunday in return."], ['to let the manager know', 'avisar al encargado', 'tu let de mánayer nou', "I'll let the manager know."]],
    c: ['Legend, thanks!', 'Sorted.'],
  }, {
    start: { s: "What's up, mate?", h: 'Could we swap shifts? I need Saturday off.', a: 'Pedí el cambio.', o: [['swap|change|shift|saturday|off|could', 'return', 'Maybe.']], f: ['return', 'You want to swap?'] },
    return: { s: "What would I get?", h: 'I can do your Sunday shift in return.', o: [['sunday|return|instead|do your|can', 'boss', "Deal."]], f: ['boss'] },
    boss: { s: 'Who tells the boss?', h: "I'll let the manager know today.", o: [['will|tell|let|manager|boss|today|i can|me', 'end', 'Sweet, thanks.']], f: ['end', 'OK.'] },
  }),
  rp('107', {
    p: 'Hablando con tu supervisor', w: ['Greg', 'supervisor'],
    s: 'Te preguntan si podés quedarte más horas.',
    g: 'Preguntar cómo se paga la hora extra y aceptar o rechazar con claridad.',
    v: [['overtime', 'horas extra', 'óvertaim', 'Is there overtime?'], ['time and a half', 'una vez y media la hora', 'taim and a jaf', 'Overtime is time and a half.'], ['to stay back', 'quedarse más tarde', 'tu stei bak', 'Can you stay back tonight?']],
    c: ['Thanks, appreciate it.', 'No worries.'],
  }, {
    start: { s: 'We are busy. Can you stay back two hours tonight?', h: 'Maybe. Is it paid as overtime?', a: 'Preguntá cómo se paga.', o: [['overtime|paid|pay|extra|rate|how much', 'rate', 'Yes.'], ['yes|sure|ok|okay', 'rate', 'Great.']], f: ['rate'] },
    rate: { s: "It's time and a half after eight hours.", h: 'OK, then I can stay two hours.', o: [['can not|cannot|no|sorry|tonight', 'end', 'No worries, maybe next time.'], ['ok|okay|yes|can|stay|sure|fine', 'end', 'Legend, thanks.']], f: ['end', 'OK.'] },
  }),
  rp('108', {
    p: 'Una fábrica', w: ['Linda', 'encargada de seguridad'],
    s: 'Te explican las normas de seguridad de tu sector.',
    g: 'Confirmar las reglas y preguntar lo que no entendiste.',
    v: [['PPE', 'equipo de protección personal', 'pi pi i', 'Always wear your PPE.'], ['hi-vis', 'chaleco reflectivo', 'jai vis', 'Wear a hi-vis vest.'], ['earmuffs', 'protectores auditivos', 'írmafs', 'Wear earmuffs near the machines.']],
    c: ['Stay safe out there.', 'Good, you are all set.'],
  }, {
    start: { s: 'In this area you must always wear hi-vis, safety glasses and earmuffs.', h: 'OK. Do I need the earmuffs all the time?', a: 'Confirmá y preguntá algo.', o: [['earmuffs|glasses|hi vis|always|time|need|ok|okay', 'lines', 'Only near the machines.']], f: ['lines'] },
    lines: { s: 'And never walk outside the yellow lines.', h: 'Got it. Only inside the yellow lines.', o: [['yellow|lines|got it|inside|ok|okay|never', 'end', 'Perfect.']], f: ['end', 'Yellow lines, always.'] },
  }),
  rp('109', {
    p: 'Una sala de inducción', w: ['Paul', 'instructor'],
    s: 'Es la inducción de seguridad antes de empezar a trabajar.',
    g: 'Responder las preguntas del instructor y preguntar qué hacer en una emergencia.',
    v: [['induction', 'inducción', 'indákshon', 'The induction is at eight.'], ['assembly point', 'punto de reunión', 'asémbli point', 'Go to the assembly point.'], ['first aid', 'primeros auxilios', 'ferst eid', 'Where is the first aid kit?']],
    c: ['You’ve passed the induction.', 'Good, you are ready to start.'],
  }, {
    start: { s: 'If you hear the alarm, where do you go?', h: 'I go to the assembly point in the car park.', a: 'Respondé con lo que te explicaron.', o: [['assembly|point|car park|outside|go|exit', 'aid', 'Correct.']], f: ['aid', 'The assembly point, in the car park.'] },
    aid: { s: 'Any questions?', h: 'Where is the first aid kit?', o: [['first aid|kit|where|fire|extinguisher|emergency', 'end', "It's in the office, next to the door."], ["no|that's all|that is all", 'end', 'Good.']], f: ['end', "It's in the office."] },
  }),
  rp('110', {
    p: 'Un depósito', w: ['Greg', 'supervisor'],
    s: 'Un compañero se cortó la mano con un cúter. Vas a avisar.',
    g: 'Explicar qué pasó, cómo está y qué hiciste.',
    v: [['to cut', 'cortar(se)', 'tu kat', 'He cut his hand.'], ['bleeding', 'sangrando', 'blíding', "He's bleeding a bit."], ['incident report', 'informe de incidente', 'ínsident ripórt', 'We need to do an incident report.']],
    c: ['Thanks for acting fast.', 'Good job.'],
  }, {
    start: { s: "What's going on?", h: 'Sam cut his hand with a box cutter.', a: 'Explicá qué pasó.', o: [['cut|hurt|hand|accident|injured|bleeding|sam', 'how', 'Is he OK?']], f: ['how', 'Is someone hurt?'] },
    how: { s: 'How bad is it?', h: "It's bleeding a bit, but it's not too bad. I put a bandage on.", o: [['bleeding|bad|not|small|bandage|first aid|ok|okay', 'report', 'Good.']], f: ['report'] },
    report: { s: 'Can you help me with the incident report?', h: 'Yes, of course. It happened ten minutes ago, at the packing area.', o: [['yes|of course|sure|happened|ago|area|minutes', 'end', 'Thanks, good job.']], f: ['end', 'Thanks.'] },
  }),
  rp('111', {
    p: 'Un restaurante lleno', w: ['Rob', 'gerente enojado'],
    s: 'Tu jefe está enojado porque una mesa esperó mucho.',
    g: 'Mantener la calma, explicar qué pasó sin echar culpas y proponer una solución.',
    v: [['I understand', 'entiendo', 'ai anderstánd', 'I understand, sorry.'], ['to fall behind', 'atrasarse', 'tu fol bijáind', 'We fell behind.'], ['from now on', 'de ahora en más', 'from nau on', 'From now on I will check.']],
    c: ['OK, let’s move on.', 'Fine, back to work.'],
  }, {
    start: { s: 'Table six waited forty minutes! What happened?', h: 'I understand, sorry. The kitchen was very busy and I fell behind.', a: 'Calma y explicá.', o: [['sorry|understand|busy|behind|kitchen|late|mistake', 'fix', 'Hmm.']], f: ['fix', 'That is not good enough.'] },
    fix: { s: "So what are you going to do about it?", h: "I'll offer them a free dessert, and from now on I'll check tables every ten minutes.", o: [['offer|free|dessert|drink|check|from now|will|apologise|apologize', 'end', 'OK, good. Do that.']], f: ['end', 'Just keep an eye on it.'] },
  }),
  rp('112', {
    p: 'El descanso (smoko)', w: ['Davo', 'compañero'],
    s: 'Charlás con compañeros durante el descanso.',
    g: 'Seguir una charla relajada sobre el fin de semana y el trabajo.',
    v: [['How was your weekend?', '¿Qué tal el finde?', 'jau uós ior uíkend', 'How was your weekend?'], ['not bad', 'nada mal', 'not bad', 'Not bad, mate.'], ['flat out', 'a full, muy ocupado', 'flat aut', "We've been flat out."]],
    c: ['Back to it!', 'Right, smoko’s over.'],
  }, {
    start: { s: 'How was your weekend, mate?', h: 'Not bad! I went to the beach on Sunday. And yours?', a: 'Contá algo y preguntá.', o: [['went|beach|good|not bad|great|quiet|rest|nothing|and yours|you', 'work', 'Watched the footy. Good game.']], f: ['work'] },
    work: { s: "We've been flat out this week, eh?", h: 'Yes, heaps of work. I am tired.', o: [['yes|heaps|busy|flat out|tired|lot|crazy', 'end', 'Friday soon, mate.']], f: ['end', 'Nearly Friday.'] },
  }),
  rp('113', {
    p: 'Reunión con tu jefe', w: ['Rob', 'gerente'],
    s: 'Hace un año que trabajás ahí y querés pedir un aumento.',
    g: 'Pedir el aumento con argumentos (tiempo, tareas nuevas) y negociar.',
    v: [['pay rise', 'aumento de sueldo', 'pei ráis', "I'd like to ask for a pay rise."], ['responsibilities', 'responsabilidades', 'risponsibílitis', 'I have more responsibilities now.'], ['to review', 'revisar', 'tu riviú', 'Can we review my pay?']],
    c: ['Thanks for bringing it up.', 'Good chat.'],
  }, {
    start: { s: 'You wanted to talk?', h: "Yes. I'd like to ask for a pay rise.", a: 'Pedí el aumento.', o: [['pay rise|raise|rise|pay|more money|salary|review', 'why', 'OK, tell me why.']], f: ['why', 'What is it about?'] },
    why: { s: 'Why do you think you deserve it?', h: "I've been here a year and now I train the new staff.", o: [['year|train|new|more|responsibilities|reliable|hard|work|been here', 'offer', 'Fair point.']], f: ['offer'], x: [FX.since] },
    offer: { s: 'I can give you one more dollar an hour.', h: 'Could we make it two dollars? I do a lot more now.', o: [['two|more|could|make it|counter', 'end', "Let's meet in the middle, a dollar fifty."], ['ok|okay|yes|thanks|accept|deal', 'end', 'Great, it starts next pay.']], f: ['end', "I'll think about it."] },
  }),
];

/** 9. Por rubro: vocabulario del trabajo concreto */
export const TRADES = [
  // Restaurantes y cafeterías
  rp('R1', {
    p: 'Un café', w: ['Cliente', 'una clienta'], s: 'Sos el mozo. Una clienta se sienta.', g: 'Saludar, tomar el pedido y repetirlo para confirmar.',
    v: [['Are you ready to order?', '¿Ya decidieron?', 'ar iu rédi tu órder', 'Are you ready to order?'], ['anything else?', '¿algo más?', 'énizing els', 'Anything else?'], ['coming right up', 'ya sale', 'káming rait ap', 'Coming right up.']],
    c: ["I'll bring it out shortly.", 'Enjoy!'],
  }, {
    start: { s: '…', h: 'Hi, are you ready to order?', a: 'Empezá vos.', o: [['ready|order|hi|hello|what|get', 'order', "Yes, a flat white and a ham toastie."]], f: ['order', "A flat white and a ham toastie."] },
    order: { s: '…', h: 'Anything else?', a: 'Preguntá si quiere algo más.', o: [['else|anything|more', 'confirm', "No, that's it."]], f: ['confirm', "That's it."] },
    confirm: { s: '…', h: 'So, one flat white and one ham toastie.', a: 'Repetí el pedido.', o: [['flat white|toastie|so|one', 'end', "Perfect, thanks."]], f: ['end', 'Yes.'] },
  }),
  rp('R2', {
    p: 'Un restaurante', w: ['Cliente', 'un cliente'], s: 'Llevás los platos a la mesa.', g: 'Anunciar los platos, preguntar quién pidió qué y si necesitan algo.',
    v: [['Who had the…?', '¿Quién pidió el…?', 'ju jad de', 'Who had the steak?'], ['Enjoy your meal', 'buen provecho', 'enyói ior mil', 'Enjoy your meal.'], ['Can I get you anything else?', '¿les traigo algo más?', 'kan ai get iu énizing els', 'Can I get you anything else?']],
    c: ['Enjoy your meal!', "Just call me if you need anything."],
  }, {
    start: { s: '…', h: 'Here we are. Who had the steak?', a: 'Llegás con los platos.', o: [['who|had|steak|here|fish|pasta', 'more', 'That’s me.']], f: ['more', 'Me, thanks.'] },
    more: { s: 'Thanks, looks great.', h: 'Can I get you anything else?', o: [['anything|else|get|need|drinks', 'end', 'Some more water, please.']], f: ['end', "We're fine."] },
  }),
  rp('R3', {
    p: 'Un restaurante', w: ['Cliente', 'una clienta'], s: 'Una clienta pregunta por un plato.', g: 'Explicar el plato (qué tiene, cómo viene) y recomendar.',
    v: [['It comes with', 'viene con', 'it kams uiz', 'It comes with chips and salad.'], ['grilled', 'a la plancha / parrilla', 'grild', "It's grilled fish."], ['I recommend', 'te recomiendo', 'ai rekoménd', 'I recommend the lamb.'], ['gluten-free', 'sin gluten', 'glúten fri', 'Is it gluten-free?']],
    c: ['Great choice.', "I'll put that in for you."],
  }, {
    start: { s: "What's the barramundi like?", h: "It's grilled fish, and it comes with chips and salad.", a: 'Explicá el plato.', o: [['fish|grilled|comes with|chips|salad|served', 'gf', 'Sounds nice.']], f: ['gf'] },
    gf: { s: 'Is it gluten-free?', h: 'Yes, it is, but the chips are not. We can change them for salad.', o: [['yes|no|gluten|change|salad|not|can', 'rec', 'Good.']], f: ['rec'] },
    rec: { s: 'What do you recommend?', h: 'I recommend the lamb. It is really popular.', o: [['recommend|lamb|popular|best|fish|steak|try', 'end', "OK, I'll have that."]], f: ['end', "I'll take it."] },
  }),
  rp('R4', {
    p: 'Un restaurante', w: ['Cliente', 'un cliente molesto'], s: 'El cliente dice que su comida está fría.', g: 'Disculparte, ofrecer una solución y avisar en cocina.',
    v: [['I do apologise', 'le pido disculpas', 'ai du apóloyais', 'I do apologise.'], ['to replace', 'reemplazar', 'tu ripléis', "I'll replace it."], ['on the house', 'invita la casa', 'on de jaus', 'The drink is on the house.']],
    c: ['Sorry again, enjoy.', "Thanks for your patience."],
  }, {
    start: { s: "Excuse me, my food is cold.", h: "I'm so sorry. I'll get you a new one right away.", a: 'Disculpate y ofrecé algo.', o: [['sorry|apologise|apologize|new|replace|change|right away|heat', 'wait', 'OK, thanks.']], f: ['wait', 'Can you fix it?'] },
    wait: { s: 'How long will it take?', h: 'About ten minutes. Can I get you a drink on the house?', o: [['minutes|soon|quick|drink|house|free', 'end', "That's nice, thanks."]], f: ['end', 'OK.'] },
  }),
  rp('R5', {
    p: 'La cocina al cierre', w: ['Chef Tony', 'jefe de cocina'], s: 'Es la hora de cerrar y te dicen qué limpiar.', g: 'Confirmar tareas y preguntar dónde están las cosas.',
    v: [['to wipe down', 'pasar un trapo', 'tu uáip daun', 'Wipe down the benches.'], ['sanitiser', 'desinfectante', 'sánitaiser', 'Where is the sanitiser?'], ['grill', 'plancha', 'gril', 'Scrub the grill.']],
    c: ['Good work tonight.', 'See you tomorrow.'],
  }, {
    start: { s: 'Wipe down the benches and scrub the grill.', h: 'OK. Where is the sanitiser?', a: 'Confirmá y preguntá.', o: [['where|sanitiser|sanitizer|spray|cloth|ok|okay', 'floor', 'Under the sink.']], f: ['floor'] },
    floor: { s: 'Then mop the floor.', h: 'Benches, grill, then the floor. Got it.', o: [['benches|grill|floor|mop|got it|ok|okay', 'end', 'Good on ya.']], f: ['end', 'Good.'] },
  }),
  rp('R6', {
    p: 'El pase de la cocina', w: ['Chef Tony', 'jefe de cocina'], s: 'Sos mozo y le pasás pedidos y cambios al chef.', g: 'Pasar el pedido, aclarar un cambio y preguntar cuánto falta.',
    v: [['Order in!', '¡entra pedido!', 'órder in', 'Order in, table four!'], ['no onion', 'sin cebolla', 'nou ónion', 'One burger, no onion.'], ['How long?', '¿cuánto falta?', 'jau long', 'How long for table four?']],
    c: ['Service!', 'Go, go!'],
  }, {
    start: { s: 'Yep?', h: 'Order in, table four: two burgers, one with no onion.', a: 'Pasá el pedido.', o: [['order|table|burger|no onion|two|one', 'time', 'Got it.']], f: ['time'] },
    time: { s: 'Anything else?', h: 'How long for table four?', o: [['how long|time|when|ready|minutes', 'end', 'Five minutes.']], f: ['end', 'Coming.'] },
  }),
  // Construcción
  rp('R7', {
    p: 'Una obra', w: ['Steve', 'capataz'], s: 'El capataz te da instrucciones para hoy.', g: 'Repetir para confirmar y preguntar lo que no quedó claro.',
    v: [['to dig', 'cavar', 'tu dig', 'Dig a hole here.'], ['trench', 'zanja', 'trench', 'Dig a trench.'], ['deep', 'profundo', 'dip', 'How deep?']],
    c: ['Good, crack on.', 'Right, get to it.'],
  }, {
    start: { s: 'Today you dig a trench along the fence.', h: 'OK, along the fence. How deep?', a: 'Confirmá y preguntá algo.', o: [['how|deep|long|wide|fence|ok|okay|where', 'tools', 'Half a metre.']], f: ['tools'] },
    tools: { s: 'Shovels are in the container.', h: 'Got it. Half a metre deep, shovels in the container.', o: [['got it|ok|okay|container|shovel|half', 'end', 'Good.']], f: ['end', 'Good.'] },
  }),
  rp('R8', {
    p: 'Una obra', w: ['Jake', 'compañero'], s: 'Necesitás herramientas y materiales.', g: 'Pedir lo que necesitás y preguntar dónde está.',
    v: [['drill', 'taladro', 'dril', 'Can I borrow the drill?'], ['screws', 'tornillos', 'skrus', 'I need more screws.'], ['to pass', 'alcanzar', 'tu pas', 'Can you pass me the hammer?']],
    c: ['There you go.', 'All good.'],
  }, {
    start: { s: 'What do you need?', h: 'Can you pass me the drill, please?', a: 'Pedí una herramienta.', o: [['pass|drill|hammer|need|can|borrow|give', 'more', 'Here.']], f: ['more'], x: [FX.giveMe] },
    more: { s: 'Anything else?', h: 'Yes, where are the screws?', o: [['screws|where|nails|more|yes', 'end', 'In the blue box in the ute.'], ["no|that's all|that is all", 'end', 'Sweet.']], f: ['end', 'In the ute.'] },
  }),
  rp('R9', {
    p: 'Una obra con máquinas', w: ['Mick', 'operador de máquina'], s: 'Tenés que pasar cerca de una excavadora.', g: 'Hacer contacto con el operador y esperar su señal.',
    v: [['excavator', 'excavadora', 'ékskaveiter', 'Watch the excavator.'], ['blind spot', 'punto ciego', 'blaind spot', "Don't stand in the blind spot."], ['to wait for the signal', 'esperar la señal', 'tu ueit for de sígnal', 'Wait for my signal.']],
    c: ['Good, stay safe.', 'Nice and safe.'],
  }, {
    start: { s: '…', h: 'Hey Mick! Can I walk past?', a: 'Avisale al operador antes de pasar.', o: [['walk|past|pass|can|hey|cross', 'wait', 'Wait for my signal.']], f: ['wait'] },
    wait: { s: 'Hold on… OK, go now.', h: 'Thanks, going now.', o: [['thanks|going|ok|okay|now', 'end', 'Good.']], f: ['end', 'Good.'] },
  }),
  rp('R10', {
    p: 'Una obra', w: ['Steve', 'capataz'], s: 'Te piden cortar madera a una medida.', g: 'Confirmar medidas en metros/milímetros.',
    v: [['millimetres', 'milímetros', 'milimíters', 'Cut it at 450 millimetres.'], ['to measure twice', 'medir dos veces', 'tu méyer tuáis', 'Measure twice, cut once.'], ['tape measure', 'cinta métrica', 'teip méyer', 'Where is the tape measure?']],
    c: ['Spot on.', 'Good, nice work.'],
  }, {
    start: { s: 'Cut these boards at one point two metres.', h: 'One point two metres. How many?', a: 'Repetí la medida y preguntá cuántas.', o: [['one point two|metres|meters|how many|1 2|ok|okay', 'many', 'Six.']], f: ['many'] },
    many: { s: 'Six boards.', h: 'OK, six boards at one point two metres.', o: [['six|6|ok|okay|boards|got it', 'end', 'Spot on.']], f: ['end', 'Good.'] },
  }),
  rp('R11', {
    p: 'Una obra', w: ['Linda', 'responsable de seguridad'], s: 'Revisión de seguridad antes de subir a un andamio.', g: 'Confirmar el equipo de seguridad y las reglas.',
    v: [['scaffold', 'andamio', 'skáfold', 'Climb the scaffold.'], ['harness', 'arnés', 'járnes', 'Wear your harness.'], ['to clip on', 'enganchar(se)', 'tu klip on', 'Clip on at all times.']],
    c: ['You are good to go.', 'Stay safe up there.'],
  }, {
    start: { s: 'Before you go up, what do you need?', h: 'I need my harness, hard hat and boots.', a: 'Decí el equipo.', o: [['harness|hat|helmet|boots|gloves|need', 'clip', 'Good.']], f: ['clip'] },
    clip: { s: 'And when do you clip on?', h: 'I clip on all the time when I am up there.', o: [['always|all the time|clip|every|whole', 'end', 'Correct.']], f: ['end', 'Always.'] },
  }),
  rp('R12', {
    p: 'Una obra', w: ['Steve', 'capataz'], s: 'La amoladora tiene el cable roto.', g: 'Informar la herramienta dañada y decir qué hiciste.',
    v: [['grinder', 'amoladora', 'gráinder', 'The grinder is broken.'], ['cord / lead', 'cable', 'kord / lid', 'The lead is damaged.'], ['to tag out', 'poner etiqueta de fuera de servicio', 'tu tag aut', 'I tagged it out.']],
    c: ['Good catch.', 'Thanks for reporting it.'],
  }, {
    start: { s: 'Yeah?', h: 'The grinder lead is damaged. I stopped using it.', a: 'Informá el problema.', o: [['grinder|lead|cord|cable|damaged|broken|stopped', 'tag', 'Good.']], f: ['tag'] },
    tag: { s: 'Did you tag it out?', h: 'Yes, I put a danger tag on it.', o: [['yes|tag|tagged|put|no', 'end', 'Great, use the spare one.']], f: ['end', 'Use the spare.'] },
  }),
  // Viñedos y cosechas
  rp('R13', {
    p: 'Un viñedo en la vendimia', w: ['Ruth', 'encargada de la cosecha'], s: 'Te enseñan a cosechar uvas.', g: 'Seguir la explicación, confirmar y preguntar.',
    v: [['bunch', 'racimo', 'banch', 'Cut the whole bunch.'], ['stem', 'tallo', 'stem', 'Cut at the stem.'], ['rotten', 'podrido', 'róten', "Don't pick rotten ones."]],
    c: ['You are a natural!', 'Good, off you go.'],
  }, {
    start: { s: 'Hold the bunch and cut at the stem.', h: 'OK, I cut at the stem. What about the rotten ones?', a: 'Confirmá y preguntá.', o: [['stem|cut|rotten|bad|ok|okay|what about', 'drop', "Drop them on the ground."]], f: ['drop'] },
    drop: { s: 'Drop rotten ones on the ground.', h: 'Got it. Good ones in the bucket, rotten ones on the ground.', o: [['got it|bucket|ground|ok|okay|good', 'end', 'Perfect.']], f: ['end', 'Perfect.'] },
  }),
  rp('R14', {
    p: 'Un viñedo', w: ['Ruth', 'encargada'], s: 'Te indica qué fila hacer y dónde dejar los baldes.', g: 'Confirmar la fila, el lugar del bin y la hora del descanso.',
    v: [['row', 'fila', 'rou', 'Start on row twelve.'], ['bucket', 'balde', 'báket', 'Empty your bucket in the bin.'], ['smoko', 'descanso', 'smóuko', 'Smoko is at ten.']],
    c: ['Off you go!', 'Good luck out there.'],
  }, {
    start: { s: 'Start on row twelve, both sides.', h: 'Row twelve, both sides. Where is the bin?', a: 'Confirmá y preguntá.', o: [['row|twelve|12|both|where|bin', 'smoko', 'At the end of the row.']], f: ['smoko'] },
    smoko: { s: 'Anything else?', h: 'What time is smoko?', o: [['smoko|break|time|lunch', 'end', 'Ten o’clock.'], ["no|that's all|that is all", 'end', 'Good.']], f: ['end', 'Ten.'] },
  }),
  rp('R15', {
    p: 'Un viñedo', w: ['Ruth', 'encargada'], s: 'Te preguntan cómo vas con el objetivo diario.', g: 'Decir cuántos bins hiciste y cuántos te faltan.',
    v: [['target', 'objetivo', 'tárget', 'The target is eight bins.'], ['so far', 'hasta ahora', 'sou far', 'Five bins so far.'], ['to be behind', 'estar atrasado', 'tu bi bijáind', "I'm a bit behind."]],
    c: ['Keep it up!', 'Good effort.'],
  }, {
    start: { s: 'How many bins so far?', h: "Five so far. I'm a bit behind.", a: 'Decí cuántos llevás.', o: [['[0-9]|five|six|four|three|so far|bins|behind', 'help', 'OK.']], f: ['help'] },
    help: { s: 'The target is eight. Can you make it?', h: 'Yes, I think I can finish three more before four.', o: [['yes|think|can|more|try|no|maybe', 'end', 'Good, keep going.']], f: ['end', 'Keep going.'] },
  }),
  rp('R16', {
    p: 'La oficina del viñedo', w: ['Ruth', 'encargada'], s: 'Querés entender cómo te pagan.', g: 'Preguntar si es por bin o por hora y cuándo cobrás.',
    v: [['per bin', 'por contenedor', 'per bin', 'Is it per bin?'], ['hourly rate', 'pago por hora', 'áuerli reit', "What's the hourly rate?"], ['payday', 'día de pago', 'péidei', 'When is payday?']],
    c: ['Any other questions, just ask.', 'All clear?'],
  }, {
    start: { s: 'Any questions about pay?', h: 'Yes. Is it per bin or hourly?', a: 'Preguntá cómo te pagan.', o: [['per bin|hourly|hour|bin|how|paid', 'day', "It's per bin, sixty dollars a bin."]], f: ['day'] },
    day: { s: 'Anything else?', h: 'When is payday?', o: [['payday|when|paid|weekly|friday|day', 'end', 'Every Thursday into your account.'], ["no|that's all|that is all", 'end', 'Good.']], f: ['end', 'Every week.'] },
  }),
  rp('R17', {
    p: 'Un viñedo', w: ['Ruth', 'encargada'], s: 'Se te rompió la tijera.', g: 'Avisar, explicar y pedir una nueva.',
    v: [['snips', 'tijera', 'snips', 'My snips are broken.'], ['spring', 'resorte', 'spring', 'The spring broke.'], ['spare', 'de repuesto', 'sper', 'Do you have spare snips?']],
    c: ['Here you go.', 'No dramas.'],
  }, {
    start: { s: "What's wrong?", h: 'My snips are broken. The spring came off.', a: 'Explicá qué pasó.', o: [['snips|broken|spring|scissors|not working|came off', 'spare', 'Oh.']], f: ['spare'] },
    spare: { s: 'Need new ones?', h: 'Yes please. Do you have spare snips?', o: [['yes|please|spare|new|another', 'end', 'In the ute. Grab a pair.']], f: ['end', 'In the ute.'] },
  }),
  rp('R18', {
    p: 'Un viñedo a la mañana', w: ['Ruth', 'encargada'], s: 'Va a hacer mucho calor o va a llover.', g: 'Hablar del clima y preguntar si cambia el horario.',
    v: [['forecast', 'pronóstico', 'fórkast', 'The forecast says forty degrees.'], ['to knock off early', 'terminar temprano', 'tu nok of érli', 'We knock off early.'], ['sunscreen', 'protector solar', 'sánskrin', 'Wear sunscreen.']],
    c: ['Stay cool out there.', 'Drink heaps of water.'],
  }, {
    start: { s: "It's going to be thirty-nine today.", h: 'Wow, that is hot. Are we starting earlier?', a: 'Comentá y preguntá.', o: [['hot|wow|earlier|early|start|time|change', 'stop', 'Yes, six a.m.']], f: ['stop'] },
    stop: { s: 'We will knock off at midday.', h: 'Good. I will bring heaps of water and sunscreen.', o: [['water|sunscreen|hat|good|ok|okay|bring', 'end', 'Smart.']], f: ['end', 'Good.'] },
  }),
  // Minería y FIFO
  rp('R19', {
    p: 'Una inducción en la mina', w: ['Karen', 'instructora'], s: 'Primera inducción en el sitio minero.', g: 'Responder preguntas y entender las reglas básicas.',
    v: [['fit for work', 'apto para trabajar', 'fit for uérk', 'Are you fit for work?'], ['zero tolerance', 'tolerancia cero', 'zírou tólerans', 'Zero tolerance for alcohol.'], ['to sign in', 'registrarse', 'tu sain in', 'Sign in at the gate.']],
    c: ['Welcome to site.', 'Induction complete.'],
  }, {
    start: { s: 'What do you do when you arrive on site?', h: 'I sign in at the gate.', a: 'Respondé.', o: [['sign in|gate|register|badge|card', 'alc', 'Correct.']], f: ['alc'] },
    alc: { s: 'What is our alcohol rule?', h: 'Zero tolerance. I must be fit for work.', o: [['zero|tolerance|no alcohol|fit|never', 'end', 'Good.']], f: ['end', 'Zero tolerance.'] },
  }),
  rp('R20', {
    p: 'La reunión de seguridad (pre-start)', w: ['Craig', 'supervisor'], s: 'Reunión de seguridad antes del turno.', g: 'Contestar si estás bien y mencionar un riesgo que ves.',
    v: [['pre-start meeting', 'reunión antes del turno', 'pri start míting', 'The pre-start is at six.'], ['hazard', 'peligro, riesgo', 'jásard', "There's a hazard near the pit."], ['take five', 'chequeo rápido de riesgos', 'teik faiv', 'Do your take five.']],
    c: ['Safe shift, everyone.', 'Let’s go.'],
  }, {
    start: { s: 'Everyone fit for work today?', h: "Yes, I'm good to go.", a: 'Respondé.', o: [['yes|good|fit|fine|ready|ok|okay', 'haz', 'Good.']], f: ['haz'] },
    haz: { s: 'Any hazards to report?', h: 'Yes, the road near pit two is very slippery.', o: [['yes|road|slippery|wet|dust|pit|no|none', 'end', 'Thanks, we will put signs up.']], f: ['end', 'Thanks.'] },
  }),
  rp('R21', {
    p: 'La mina, por radio', w: ['Base', 'operador de radio'], s: 'Usás la radio para pedir permiso para entrar a una zona.', g: 'Hablar por radio con el formato: a quién, quién sos, qué querés, «over».',
    v: [['over', 'cambio (terminé de hablar)', 'óuver', 'Light vehicle two, over.'], ['copy', 'recibido', 'kópi', 'Copy that.'], ['to request', 'solicitar', 'tu rikuést', 'Requesting access to the pit.']],
    c: ['Copy, out.', 'Roger, out.'],
  }, {
    start: { s: '…', h: 'Base, this is light vehicle two. Requesting access to pit one, over.', a: 'Llamá a la base.', o: [['base|this is|vehicle|request|requesting|access|over', 'ok', 'Light vehicle two, wait at the gate, over.']], f: ['ok'] },
    ok: { s: 'Wait at the gate, over.', h: 'Copy, waiting at the gate, over.', o: [['copy|waiting|wait|roger|gate|over', 'end', 'Access granted. Go ahead.']], f: ['end', 'Go ahead.'] },
  }),
  rp('R22', {
    p: 'La mina', w: ['Craig', 'supervisor'], s: 'Viste una pérdida de aceite cerca de una máquina.', g: 'Informar el riesgo con claridad: qué, dónde, qué hiciste.',
    v: [['oil leak', 'pérdida de aceite', 'oil lik', "There's an oil leak."], ['to cone off', 'señalizar con conos', 'tu koun of', 'I coned it off.'], ['hazard report', 'reporte de riesgo', 'jásard ripórt', 'Fill out a hazard report.']],
    c: ['Good catch.', 'That is how we stay safe.'],
  }, {
    start: { s: 'Yeah, mate?', h: "There's an oil leak under the loader near workshop B.", a: 'Informá el riesgo.', o: [['oil|leak|loader|workshop|spill|under|near', 'did', 'Right.']], f: ['did'] },
    did: { s: 'What did you do?', h: 'I coned it off and told the workshop.', o: [['cone|coned|told|stopped|sign|nothing|called', 'end', 'Good, fill out a hazard report.']], f: ['end', 'Good job.'] },
  }),
  rp('R23', {
    p: 'El depósito de herramientas', w: ['Shane', 'encargado del depósito'], s: 'Necesitás equipo para tu turno.', g: 'Pedir el equipo, preguntar talles y si hay que firmar.',
    v: [['gloves', 'guantes', 'glavs', 'Can I get new gloves?'], ['size', 'talle', 'sais', 'What size?'], ['to sign out', 'firmar la salida', 'tu sain aut', 'Sign it out here.']],
    c: ['There you go.', 'Bring it back at the end of the swing.'],
  }, {
    start: { s: 'What do you need?', h: 'Can I get new gloves and safety glasses?', a: 'Pedí el equipo.', o: [['gloves|glasses|need|can|get|boots|hat', 'size', 'Sure.']], f: ['size'] },
    size: { s: 'What size gloves?', h: 'Large, please. Do I need to sign anything?', o: [['large|medium|small|size|sign', 'end', 'Just sign here.']], f: ['end', 'Sign here.'] },
  }),
  rp('R24', {
    p: 'La recepción del campamento', w: ['Jodie', 'recepción del campamento'], s: 'Llegás al campamento minero.', g: 'Hacer el check-in, preguntar por el comedor y la lavandería.',
    v: [['camp', 'campamento', 'kamp', 'Welcome to camp.'], ['mess / wet mess', 'comedor / bar del campamento', 'mes / uet mes', 'The mess is open at five.'], ['laundry', 'lavandería', 'lóndri', 'Where is the laundry?']],
    c: ['Enjoy your swing.', 'Have a good rest.'],
  }, {
    start: { s: 'Hi, name and company?', h: 'Juan Pérez, from Pilbara Mining.', a: 'Decí tu nombre y empresa.', o: [['name|juan|from|mining|company|i am', 'q', "You're in room 214."]], f: ['q'] },
    q: { s: 'Any questions?', h: 'What time is dinner at the mess?', o: [['dinner|mess|food|time|laundry|gym|breakfast', 'end', 'From five to eight.'], ["no|that's all|that is all", 'end', 'All good.']], f: ['end', 'Five to eight.'] },
  }),
  rp('R25', {
    p: 'Simulacro de emergencia', w: ['Craig', 'supervisor'], s: 'Suena la alarma de evacuación.', g: 'Decir qué hacés y reportarte en el punto de reunión.',
    v: [['evacuate', 'evacuar', 'ivákiueit', 'Evacuate now.'], ['muster point', 'punto de reunión', 'máster point', 'Go to the muster point.'], ['headcount', 'conteo de personas', 'jédkaunt', 'We do a headcount.']],
    c: ['All accounted for.', 'Good drill.'],
  }, {
    start: { s: 'Alarm! What do you do?', h: 'Stop work, leave everything and go to the muster point.', a: 'Decí qué hacés.', o: [['muster|stop|leave|go|evacuate|exit|walk', 'count', 'Good.']], f: ['count'] },
    count: { s: 'Name for the headcount?', h: 'Juan Pérez, from the maintenance crew.', o: [['juan|name|crew|maintenance|i am|here', 'end', 'Got you.']], f: ['end', 'Got you.'] },
  }),
  // Depósitos y logística
  rp('R26', {
    p: 'El muelle de carga', w: ['Dean', 'chofer del camión'], s: 'Llega un camión con mercadería.', g: 'Recibir la entrega, chequear la cantidad y firmar.',
    v: [['delivery', 'entrega', 'delíveri', 'Delivery for you.'], ['pallet', 'pallet', 'pálet', 'Three pallets.'], ['to sign for', 'firmar la recepción', 'tu sain for', 'Can you sign for it?']],
    c: ['Cheers, see you next week.', 'Thanks mate.'],
  }, {
    start: { s: 'Delivery for Coastal Foods.', h: "Great. How many pallets?", a: 'Preguntá cuántos.', o: [['how many|pallets|boxes|what', 'check', 'Four pallets.']], f: ['check'] },
    check: { s: 'Sign here, please.', h: 'Let me check them first. OK, four pallets, all good.', o: [['check|four|4|ok|okay|good|sign|damaged|missing', 'end', 'Cheers.']], f: ['end', 'Cheers.'] },
  }),
  rp('R27', {
    p: 'El depósito', w: ['Kylie', 'compañera'], s: 'Te enseñan a preparar pedidos.', g: 'Confirmar el proceso y preguntar qué hacer si falta algo.',
    v: [['order sheet / picking slip', 'hoja del pedido', 'píking slip', 'Follow the picking slip.'], ['aisle', 'pasillo', 'ail', 'Aisle five.'], ['out of stock', 'sin stock', 'aut ov stok', "It's out of stock."]],
    c: ['You got it.', 'Easy, right?'],
  }, {
    start: { s: 'Read the slip, pick the items, pack them and put the label on.', h: 'Slip, pick, pack and label. OK.', a: 'Repetí los pasos.', o: [['slip|pick|pack|label|ok|okay', 'miss', 'Yep.']], f: ['miss'] },
    miss: { s: 'Questions?', h: 'What do I do if something is out of stock?', o: [['out of stock|missing|not there|what if|none', 'end', 'Write it on the slip and tell me.'], ["no|that's all|that is all", 'end', 'Easy.']], f: ['end', 'Tell me.'] },
  }),
  rp('R28', {
    p: 'El depósito', w: ['Kylie', 'compañera'], s: 'El escáner no lee un código.', g: 'Explicar el problema y preguntar qué hacer.',
    v: [['scanner', 'escáner', 'skáner', 'The scanner is not reading it.'], ['barcode', 'código de barras', 'bárkoud', 'The barcode is damaged.'], ['to type in', 'ingresar a mano', 'tu taip in', 'Type it in.']],
    c: ['Easy fix.', 'All good.'],
  }, {
    start: { s: 'You right?', h: "The scanner isn't reading this barcode.", a: 'Explicá el problema.', o: [['scanner|barcode|not|reading|work|does not', 'fix', 'Is it damaged?']], f: ['fix'] },
    fix: { s: 'Just type the number in.', h: 'OK, I will type the number in.', o: [['ok|okay|type|number|will', 'end', 'Good.']], f: ['end', 'Good.'] },
  }),
  rp('R29', {
    p: 'El depósito', w: ['Greg', 'supervisor'], s: 'Estás contando inventario y algo no coincide.', g: 'Decir cuánto contaste, cuánto dice el sistema y la diferencia.',
    v: [['stocktake', 'inventario', 'stókteik', "We're doing a stocktake."], ['the system says', 'el sistema dice', 'de sístem ses', 'The system says fifty.'], ['short', 'faltan', 'short', "We're two boxes short."]],
    c: ['Thanks, I will check it.', 'Good work.'],
  }, {
    start: { s: 'How did the count go?', h: 'I counted forty-eight, but the system says fifty.', a: 'Informá el conteo.', o: [['counted|[0-9]|forty|fifty|system|says', 'short', 'So two short.']], f: ['short'] },
    short: { s: 'Did you check twice?', h: 'Yes, I counted twice. We are two boxes short.', o: [['yes|twice|short|two|again|no', 'end', 'OK, I will check the records.']], f: ['end', 'OK.'] },
  }),
  rp('R30', {
    p: 'Llamada con un cliente', w: ['Sophie', 'clienta'], s: 'A un pedido le falta un producto.', g: 'Explicar qué falta, pedir disculpas y decir cuándo llega.',
    v: [['missing', 'faltante', 'mísing', 'One item is missing.'], ['to send separately', 'enviar por separado', 'tu send séparetli', "We'll send it separately."], ['back order', 'pedido pendiente', 'bak órder', "It's on back order."]],
    c: ['Thanks for your patience.', 'Sorry again.'],
  }, {
    start: { s: 'Hello, Sophie speaking.', h: 'Hi, I am calling from the warehouse. One item from your order is missing.', a: 'Explicá por qué llamás.', o: [['missing|item|order|calling|warehouse|sorry', 'when', 'Oh no.']], f: ['when'] },
    when: { s: 'When will I get it?', h: "Sorry about that. We'll send it separately on Thursday.", o: [['send|separately|thursday|monday|tomorrow|week|sorry|days', 'end', 'OK, thanks for letting me know.']], f: ['end', 'OK.'] },
  }),
  rp('R31', {
    p: 'El depósito', w: ['Linda', 'responsable de seguridad'], s: 'Te explican las reglas de seguridad con autoelevadores.', g: 'Confirmar las reglas y preguntar dónde caminar.',
    v: [['forklift', 'autoelevador', 'fórklift', 'Watch out for forklifts.'], ['walkway', 'pasillo peatonal', 'uókuei', 'Stay on the walkway.'], ['to make eye contact', 'hacer contacto visual', 'tu meik ai kóntakt', 'Make eye contact with the driver.']],
    c: ['Good, stay safe.', 'Nice one.'],
  }, {
    start: { s: 'Forklifts have right of way. Where do you walk?', h: 'Only on the green walkways.', a: 'Respondé.', o: [['walkway|walkways|green|lines|only', 'eye', 'Correct.']], f: ['eye'] },
    eye: { s: 'And before crossing?', h: 'I stop and make eye contact with the driver.', o: [['eye|contact|stop|look|wait|driver', 'end', 'Perfect.']], f: ['end', 'Good.'] },
  }),
  // Hoteles y limpieza
  rp('R32', {
    p: 'Un hotel', w: ['Linda', 'jefa de housekeeping'], s: 'Te asignan habitaciones para limpiar.', g: 'Confirmar cuáles son y preguntar por los check-outs.',
    v: [['check-out', 'salida del huésped', 'chek aut', "Room 12 is a check-out."], ['stayover', 'huésped que se queda', 'stéiouver', "It's a stayover."], ['Do not disturb', 'no molestar', 'du not distérb', "There's a Do not disturb sign."]],
    c: ['Thanks, go for it.', 'Have a good shift.'],
  }, {
    start: { s: 'You have rooms ten to eighteen today.', h: 'Ten to eighteen. Which ones are check-outs?', a: 'Confirmá y preguntá.', o: [['ten|eighteen|which|check out|checkout|stayover', 'dnd', 'Ten, twelve and fifteen.']], f: ['dnd'] },
    dnd: { s: 'Anything else?', h: 'What do I do if there is a Do not disturb sign?', o: [['disturb|sign|do not|what if', 'end', 'Skip it and try again after two.'], ["no|that's all|that is all", 'end', 'Good luck.']], f: ['end', 'Skip it.'] },
  }),
  rp('R33', {
    p: 'Un hotel', w: ['Linda', 'jefa de housekeeping'], s: 'Revisan tu habitación con la checklist.', g: 'Decir qué hiciste y corregir lo que faltó.',
    v: [['to restock', 'reponer', 'tu ristók', 'Restock the minibar.'], ['towels', 'toallas', 'táuels', 'Change the towels.'], ['I missed', 'se me pasó', 'ai mist', 'Sorry, I missed that.']],
    c: ['Much better.', 'Good, next room.'],
  }, {
    start: { s: 'Did you do everything on the checklist?', h: 'Yes, I made the beds, cleaned the bathroom and changed the towels.', a: 'Contá lo que hiciste.', o: [['made|cleaned|changed|beds|bathroom|towels|yes|did', 'miss', 'Hmm.']], f: ['miss'] },
    miss: { s: 'The coffee pods were not restocked.', h: 'Sorry, I missed that. I will restock them now.', o: [['sorry|missed|restock|will|now', 'end', 'Thanks.']], f: ['end', 'Thanks.'] },
  }),
  rp('R34', {
    p: 'Un hotel', w: ['Tom', 'encargado de mantenimiento'], s: 'En una habitación gotea la ducha.', g: 'Informar el problema, la habitación y si es urgente.',
    v: [['leaking', 'gotea', 'líking', 'The shower is leaking.'], ['maintenance', 'mantenimiento', 'méintenans', 'I called maintenance.'], ['urgent', 'urgente', 'érchent', "It's not urgent."]],
    c: ["I'll get onto it.", 'Thanks for letting me know.'],
  }, {
    start: { s: 'Maintenance, Tom speaking.', h: 'Hi Tom, the shower in room 15 is leaking.', a: 'Informá el problema.', o: [['shower|leaking|room|broken|not working|tap|light', 'urg', 'OK.']], f: ['urg'] },
    urg: { s: 'Is there a guest in there?', h: 'Yes, a guest arrives at three. It is quite urgent.', o: [['yes|no|guest|urgent|soon|arrive', 'end', "I'll be there in ten."]], f: ['end', "I'm coming."] },
  }),
  rp('R35', {
    p: 'El depósito de limpieza', w: ['Linda', 'jefa de housekeeping'], s: 'Se te terminaron los productos.', g: 'Pedir lo que falta con cantidades.',
    v: [['to run out of', 'quedarse sin', 'tu ran aut ov', "I've run out of bin bags."], ['toilet paper', 'papel higiénico', 'tóilet péiper', 'I need more toilet paper.'], ['spray bottle', 'rociador', 'sprei bótol', 'Can I have a new spray bottle?']],
    c: ['There you go.', 'All restocked.'],
  }, {
    start: { s: 'What do you need?', h: "I've run out of bin bags and toilet paper.", a: 'Pedí lo que falta.', o: [['run out|bin bags|toilet paper|need|more|bags', 'many', 'How many?']], f: ['many'] },
    many: { s: 'How many rolls?', h: 'Ten rolls, please, and one box of bin bags.', o: [['[0-9]|ten|five|rolls|box|please', 'end', 'Here you go.']], f: ['end', 'Here.'] },
  }),
  rp('R36', {
    p: 'El pasillo de un hotel', w: ['Huésped', 'un huésped'], s: 'Un huésped te pregunta cosas mientras limpiás.', g: 'Responder con amabilidad y derivar lo que no sabés.',
    v: [['reception', 'recepción', 'risépshon', 'Ask at reception.'], ['fresh towels', 'toallas limpias', 'fresh táuels', "I'll bring fresh towels."], ['Is there anything else?', '¿algo más?', 'is der énizing els', 'Is there anything else?']],
    c: ['Enjoy your stay!', 'Have a lovely day.'],
  }, {
    start: { s: 'Excuse me, could I get some fresh towels?', h: "Of course. I'll bring them in five minutes.", a: 'Respondé con amabilidad.', o: [['of course|sure|bring|towels|minutes|yes', 'wifi', 'Thanks.']], f: ['wifi'] },
    wifi: { s: "And what's the wifi password?", h: "I'm not sure, but reception can help you.", o: [['not sure|reception|desk|ask|password|do not know', 'end', 'OK, thanks.']], f: ['end', 'OK.'] },
  }),
  rp('R37', {
    p: 'Un hotel', w: ['Linda', 'jefa de housekeeping'], s: 'Encontraste una billetera en una habitación.', g: 'Informar qué encontraste, dónde y qué hiciste.',
    v: [['lost property', 'objetos perdidos', 'lost próperti', 'Take it to lost property.'], ['to find / found', 'encontrar / encontré', 'tu faind / faund', 'I found a wallet.'], ['to log', 'registrar', 'tu log', 'Log it in the book.']],
    c: ['Thanks for being honest.', 'Good job.'],
  }, {
    start: { s: 'Yes?', h: 'I found a wallet in room 12, under the bed.', a: 'Contá qué encontraste.', o: [['found|wallet|phone|room|bed|left', 'do', 'Oh good.']], f: ['do'] },
    do: { s: 'What did you do with it?', h: 'I brought it here. Should I log it in the book?', o: [['brought|here|log|book|should|reception', 'end', 'Yes please, and I will call the guest.']], f: ['end', 'Log it, please.'] },
  }),
];
