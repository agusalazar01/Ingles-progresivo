import { FX, rp } from './build';

const ALL = "no|that's all|that is all|nothing|all good";

/** 10. Autos y transporte */
export const TRANSPORT = [
  rp('114', {
    p: 'La casa de un vendedor particular', w: ['Craig', 'vendedor del auto'], s: 'Viste un auto usado en Marketplace y vas a verlo.', g: 'Preguntar kilómetros, servicio, rego y por qué lo vende.',
    v: [['kilometres / ks', 'kilómetros', 'keis', 'How many ks has it done?'], ['rego', 'registro del auto (patente y seguro obligatorio)', 'réyou', 'How long is left on the rego?'], ['service history', 'historial de servicio', 'sérvis jístori', 'Does it have a service history?'], ['roadworthy', 'certificado de estado del auto', 'róud uérzi', 'Does it have a roadworthy?']],
    a: [['Rego', 'registro del auto', 'Siempre preguntá cuánto rego le queda.']],
    c: ['Have a think and let me know.', 'No rush, mate.'],
  }, {
    start: { s: "G'day, here she is.", h: 'Hi! How many ks has it done?', a: 'Preguntá los kilómetros.', o: [['ks|kilometres|kilometers|km|how many|done', 'rego', 'About a hundred and eighty thousand.']], f: ['rego', 'One eighty thousand.'] },
    rego: { s: 'Anything else?', h: 'How long is left on the rego?', o: [['rego|registration|left|months', 'serv', 'Five months.'], ['service|history|book', 'serv', 'Yeah, all in the book.']], f: ['serv'] },
    serv: { s: 'Any other questions?', h: 'Does it have a service history? And why are you selling it?', o: [['service|history|why|selling|sell|book', 'end', "Full history. I'm moving overseas."], [ALL, 'end', 'No worries.']], f: ['end', "I'm moving overseas."] },
  }),
  rp('115', {
    p: 'Viendo un auto usado', w: ['Craig', 'vendedor'], s: 'Revisás el auto antes de comprar.', g: 'Pedir prenderlo, probarlo y preguntar por problemas.',
    v: [['test drive', 'prueba de manejo', 'test draiv', 'Can I take it for a test drive?'], ['to start it', 'prenderlo', 'tu start it', 'Can you start it?'], ['dent / scratch', 'abolladura / rayón', 'dent / skrach', "There's a dent here."]],
    c: ['Let me know what you think.', 'Take your time.'],
  }, {
    start: { s: 'Have a look around.', h: "There's a dent on the door. What happened?", a: 'Señalá algo que ves.', o: [['dent|scratch|door|what happened|rust|damage', 'eng', 'Someone hit it in a car park.']], f: ['eng'] },
    eng: { s: 'Want me to start it?', h: 'Yes, please. Can I take it for a test drive?', o: [['yes|start|test drive|drive|can', 'probs', 'Sure.']], f: ['probs'] },
    probs: { s: 'Drives well, eh?', h: 'Yes. Are there any problems I should know about?', o: [['problems|issues|anything|wrong|should know|yes|good', 'end', 'The air con is a bit weak, that’s all.']], f: ['end', 'Nothing major.'] },
  }),
  rp('116', {
    p: 'Viendo un auto usado', w: ['Craig', 'vendedor'], s: 'El auto te gusta pero el precio es alto.', g: 'Hacer una oferta más baja con un motivo y cerrar un precio.',
    v: [['to offer', 'ofrecer', 'tu ófer', 'I can offer six thousand.'], ['lowest price', 'precio más bajo', 'lóuest prais', "What's your lowest price?"], ['meet in the middle', 'quedar a mitad de camino', 'mit in de mídol', "Let's meet in the middle."]],
    c: ["It's a deal.", 'Pleasure doing business.'],
  }, {
    start: { s: "I'm asking seven thousand.", h: "That's a bit high. What's your lowest price?", a: 'Pedí un precio menor.', o: [['lowest|high|less|lower|price|discount|best', 'offer', "Maybe six eight."]], f: ['offer'] },
    offer: { s: 'Six thousand eight hundred.', h: 'The tyres need changing. I can offer six thousand.', o: [['offer|six|thousand|tyres|tires|can|give', 'mid', 'Hmm, too low.']], f: ['mid'] },
    mid: { s: 'Too low, mate.', h: "Let's meet in the middle. Six thousand four?", o: [['middle|four|six|deal|ok|okay', 'end', 'Done.']], f: ['end', 'OK, deal.'] },
  }),
  rp('117', {
    p: 'Mostrador de alquiler de autos', w: ['Nicole', 'empleada de la agencia'], s: 'Tenés una reserva para alquilar un auto.', g: 'Dar la reserva, preguntar por el seguro y el combustible.',
    v: [['booking', 'reserva', 'búking', 'I have a booking.'], ['excess', 'franquicia del seguro', 'éxes', "What's the excess?"], ['full to full', 'entregarlo lleno', 'ful tu ful', "It's full to full."]],
    c: ['Here are your keys. Drive safe!', 'Enjoy the trip!'],
  }, {
    start: { s: 'Hi, how can I help?', h: 'Hi, I have a booking under Pérez.', a: 'Decí que tenés reserva.', o: [['booking|reservation|under|name|have', 'ins', 'Found it.']], f: ['ins'] },
    ins: { s: 'Would you like extra insurance?', h: "What's the excess without it?", o: [['excess|how much|cost|without|what', 'fuel', "It's four thousand dollars."], ['no|yes|thanks', 'fuel', 'OK.']], f: ['fuel'] },
    fuel: { s: 'Any other questions?', h: 'Do I return it with a full tank?', o: [['full|tank|fuel|petrol|return', 'end', "Yes, it's full to full."], [ALL, 'end', 'Easy.']], f: ['end', 'Full to full.'] },
  }),
  rp('118', {
    p: 'Una estación de servicio', w: ['Raj', 'cajero'], s: 'Cargaste nafta y vas a pagar.', g: 'Decir el número de surtidor, pagar y pedir algo más.',
    v: [['pump', 'surtidor', 'pamp', 'Pump number four.'], ['unleaded / diesel', 'nafta / gasoil', 'anléded / dísel', 'I put in unleaded.'], ['servo', 'estación de servicio', 'sérvou', "Let's stop at the servo."]],
    c: ['Have a good one.', 'Drive safe.'],
  }, {
    start: { s: 'Hi there.', h: 'Hi, pump number four, please.', a: 'Decí tu surtidor.', o: [['pump|number|[0-9]|four|two|three', 'else', "That's sixty-two dollars."]], f: ['else'] },
    else: { s: 'Anything else?', h: 'And a bottle of water, please.', o: [['water|coffee|chips|and|yes', 'end', 'Sixty-five then.'], [ALL, 'end', 'Sixty-two then.']], f: ['end', 'OK.'] },
  }),
  rp('119', {
    p: 'Un taller mecánico', w: ['Bruce', 'mecánico'], s: 'Tu auto hace un ruido raro.', g: 'Describir el problema, cuándo pasa y preguntar el costo.',
    v: [['noise', 'ruido', 'nois', "It's making a noise."], ['when I brake', 'cuando freno', 'uen ai breik', 'It squeaks when I brake.'], ['quote', 'presupuesto', 'kuout', 'Can you give me a quote?']],
    c: ["I'll call you when it's ready.", 'Leave it with me.'],
  }, {
    start: { s: 'What seems to be the problem?', h: "It's making a strange noise when I brake.", a: 'Describí el problema.', o: [['noise|sound|brake|braking|squeak|strange|when', 'since', 'Hmm.']], f: ['since'] },
    since: { s: 'How long has it been doing that?', h: 'For about a week.', o: [['week|days|since|for|month|yesterday', 'quote', 'Probably the brake pads.']], f: ['quote'], x: [FX.since] },
    quote: { s: "Probably the brake pads.", h: 'Can you give me a quote first?', o: [['quote|how much|cost|price|first', 'end', 'About two hundred and fifty.']], f: ['end', 'Around two fifty.'] },
  }),
  rp('120', {
    p: 'Llamada a asistencia en ruta', w: ['Operador', 'asistencia RAC'], s: 'Pinchaste una goma en la ruta.', g: 'Explicar el problema y dar tu ubicación.',
    v: [['flat tyre', 'goma pinchada', 'flat táier', 'I have a flat tyre.'], ['spare tyre', 'rueda de auxilio', 'sper táier', "I don't have a spare."], ['roadside assistance', 'asistencia en ruta', 'róudsaid asístans', "I'm calling roadside assistance."]],
    c: ['Help is on the way.', 'Stay safe until we arrive.'],
  }, {
    start: { s: 'Roadside assistance, how can I help?', h: 'Hi, I have a flat tyre and no spare.', a: 'Explicá el problema.', o: [['flat|tyre|tire|spare|puncture|wheel', 'where', 'OK.']], f: ['where'] },
    where: { s: 'Where are you?', h: "I'm on the Princes Highway, near the Kiama exit.", o: [['highway|road|near|exit|on|kilometre|km|street', 'safe', 'Got it.']], f: ['safe'] },
    safe: { s: 'Are you in a safe spot?', h: 'Yes, I am off the road with my hazard lights on.', o: [['yes|safe|off|lights|hazard|no', 'end', 'Someone will be there in forty minutes.']], f: ['end', 'We are coming.'] },
  }),
  rp('121', {
    p: 'La calle', w: ['Peatón', 'una señora'], s: 'Estás perdido buscando la estación.', g: 'Pedir indicaciones, entenderlas y repetirlas.',
    v: [['Excuse me, how do I get to…?', 'disculpe, ¿cómo llego a…?', 'ekskiús mi, jau du ai get tu', 'How do I get to the station?'], ['turn left / right', 'doblar a la izquierda / derecha', 'tern left / rait', 'Turn left at the lights.'], ['go straight', 'seguir derecho', 'gou streit', 'Go straight ahead.']],
    c: ["You can't miss it.", 'Good luck!'],
  }, {
    start: { s: '…', h: 'Excuse me, how do I get to the train station?', a: 'Pedí indicaciones.', o: [['excuse|how|get|station|where|way', 'dir', 'Go straight and turn left at the lights.']], f: ['dir'] },
    dir: { s: 'Go straight and turn left at the lights.', h: 'Straight, then left at the lights. Is it far?', o: [['straight|left|lights|far|ok|okay|thanks', 'end', 'Five minutes walking.']], f: ['end', 'Not far.'] },
  }),
  rp('122', {
    p: 'Un control policial en la ruta', w: ['Oficial', 'policía'], s: 'Te para la policía para un control de alcohol.', g: 'Responder con calma, mostrar tu licencia y seguir instrucciones.',
    v: [['licence', 'licencia', 'láisens', 'Here is my licence.'], ['breath test', 'test de alcohol', 'brez test', 'This is a random breath test.'], ['international driving permit', 'permiso internacional', 'internáshonal dráiving pérmit', 'I have an international permit.']],
    c: ['Thanks, drive safe.', 'All good, you can go.'],
  }, {
    start: { s: 'Good afternoon. Random breath test. Licence, please.', h: 'Good afternoon. Here is my licence and my international permit.', a: 'Saludá y mostrá tu licencia.', o: [['here|licence|license|permit|good afternoon|sure', 'test', 'Thank you.']], f: ['test'], x: [FX.hereYouHave] },
    test: { s: 'Count to ten into this, please.', h: 'One, two, three, four, five, six, seven, eight, nine, ten.', o: [['one|two|ten|count', 'q', 'That’s fine.']], f: ['q'] },
    q: { s: 'Where are you headed today?', h: "I'm going to Byron Bay.", o: [['going|byron|to|home|work|heading', 'end', 'OK, thanks.']], f: ['end', 'OK.'] },
  }),
  rp('123', {
    p: 'Planeando con un amigo', w: ['Tom', 'amigo'], s: 'Organizan un viaje en auto por la costa.', g: 'Proponer ruta, días y cómo dividen los gastos.',
    v: [['road trip', 'viaje en auto', 'roud trip', "Let's do a road trip."], ['to split', 'dividir', 'tu split', "Let's split the petrol."], ['stop', 'parada', 'stop', 'Our first stop is…']],
    c: ['This is going to be epic!', 'Can’t wait!'],
  }, {
    start: { s: 'So where do you want to go?', h: "Let's drive the Great Ocean Road.", a: 'Proponé un destino.', o: [['let us|lets|go|drive|road|coast|north|south|beach|great ocean', 'long', 'Yes!']], f: ['long'] },
    long: { s: 'How many days?', h: 'Four days. Our first stop can be Lorne.', o: [['[0-9]|days|week|three|four|five|stop|first', 'money', 'Nice.']], f: ['money'] },
    money: { s: 'How do we pay for everything?', h: "Let's split the petrol and the accommodation.", o: [['split|half|share|each|pay', 'end', 'Deal.']], f: ['end', 'Fair.'] },
  }),
  rp('124', {
    p: 'Una boletería de trenes', w: ['Agente', 'empleada de boletería'], s: 'Querés un pasaje de tren o bus.', g: 'Decir destino, fecha, ida o ida y vuelta, y preguntar horarios.',
    v: [['one-way / return', 'ida / ida y vuelta', 'uan uei / ritérn', 'A return ticket, please.'], ['concession', 'tarifa reducida', 'konséshon', 'Is there a concession?'], ['platform', 'andén', 'plátform', 'Which platform?']],
    c: ['Have a good trip.', 'Enjoy your trip!'],
  }, {
    start: { s: 'Where to?', h: 'A return ticket to Newcastle, please.', a: 'Pedí el pasaje.', o: [['return|one way|ticket|to|please', 'when', 'When are you travelling?']], f: ['when'] },
    when: { s: 'When are you travelling?', h: 'Tomorrow morning, and back on Sunday.', o: [['tomorrow|morning|today|sunday|monday|back|next', 'plat', "Thirty-four dollars."]], f: ['plat'] },
    plat: { s: 'Anything else?', h: 'Which platform does it leave from?', o: [['platform|where|leave|time|which', 'end', 'Platform three.'], [ALL, 'end', 'Have a good trip.']], f: ['end', 'Platform three.'] },
  }),
];

/** 11. Salud y emergencias */
export const HEALTH = [
  rp('125', {
    p: 'Consultorio de un GP', w: ['Dr Chen', 'médica general'], s: 'Vas al médico de cabecera por primera vez.', g: 'Explicar por qué venís y responder preguntas.',
    v: [['GP', 'médico general', 'yi pi', 'I need to see a GP.'], ['to have a check-up', 'hacerse un chequeo', 'tu jav a chek ap', "I'd like a check-up."], ['allergic to', 'alérgico a', 'alérchik tu', "I'm allergic to penicillin."]],
    c: ['Take care.', 'Come back if it gets worse.'],
  }, {
    start: { s: 'Hi, what brings you in today?', h: "I've had a bad cough for a week.", a: 'Explicá por qué venís.', o: [['cough|pain|fever|sick|week|check|headache|have|had', 'allergy', 'Any other symptoms?']], f: ['allergy'], x: [FX.since] },
    allergy: { s: 'Are you allergic to any medicine?', h: "No, I'm not allergic to anything.", o: [['no|not|yes|allergic|penicillin|none', 'end', "OK, I'll give you something for the cough."]], f: ['end', 'OK.'] },
  }),
  rp('126', {
    p: 'Consultorio médico', w: ['Dr Chen', 'médica'], s: 'Te duele el estómago desde ayer.', g: 'Describir los síntomas: dónde, desde cuándo, cuánto.',
    v: [['it hurts here', 'me duele acá', 'it jerts jíer', 'It hurts here.'], ['since yesterday', 'desde ayer', 'sins iésterdei', 'Since yesterday.'], ['out of ten', 'del uno al diez', 'aut ov ten', 'About seven out of ten.']],
    c: ['Rest and drink water.', 'You should feel better soon.'],
  }, {
    start: { s: 'Where does it hurt?', h: 'It hurts here, in my stomach.', a: 'Mostrá dónde.', o: [['here|stomach|hurt|pain|head|back|chest', 'when', 'Since when?']], f: ['when'] },
    when: { s: 'Since when?', h: 'Since yesterday afternoon.', o: [['since|yesterday|days|morning|night|ago|week', 'scale', 'OK.']], f: ['scale'], x: [FX.since] },
    scale: { s: 'How bad is it, from one to ten?', h: 'About seven out of ten.', o: [['[0-9]|seven|six|eight|five|out of', 'end', "I think it's a virus."]], f: ['end', 'Let me check.'] },
  }),
  rp('127', {
    p: 'Una farmacia (chemist)', w: ['Anna', 'farmacéutica'], s: 'Necesitás algo para el resfrío.', g: 'Explicar qué tenés, pedir algo y preguntar cómo tomarlo.',
    v: [['chemist', 'farmacia', 'kémist', "I'm going to the chemist."], ['over the counter', 'de venta libre', 'óuver de káunter', 'Is it over the counter?'], ['twice a day', 'dos veces por día', 'tuáis a dei', 'Take it twice a day.']],
    c: ['Feel better!', 'Get well soon.'],
  }, {
    start: { s: 'Hi, what can I help you with?', h: 'Hi, I have a cold. Do you have something for it?', a: 'Explicá qué tenés.', o: [['cold|flu|throat|cough|headache|something|have', 'take', 'Try these.']], f: ['take'] },
    take: { s: 'These work well.', h: 'How often do I take them?', o: [['how often|how many|take|when|day', 'end', 'Two tablets, three times a day.']], f: ['end', 'It says on the box.'] },
  }),
  rp('128', {
    p: 'Llamada al 000', w: ['Operadora', 'servicio de emergencias'], s: 'Tu amigo se cayó y no se puede mover.', g: 'Pedir ambulancia, dar dirección y explicar qué pasó.',
    v: [['Triple zero', 'número de emergencia (000)', 'trípol zírou', 'Call triple zero.'], ['ambulance', 'ambulancia', 'ámbiulans', 'I need an ambulance.'], ['conscious', 'consciente', 'kónshus', "He's conscious."]],
    c: ['Help is on the way. Stay with him.', 'The ambulance is coming.'],
  }, {
    start: { s: 'Emergency. Police, fire or ambulance?', h: 'Ambulance, please.', a: 'Pedí lo que necesitás.', o: [['ambulance', 'where', 'Connecting you.'], ['police|fire', 'where', 'Connecting you.']], f: ['where'] },
    where: { s: "What's the address?", h: '25 Beach Road, Bondi.', o: [['[0-9]|road|street|avenue|bondi|address', 'what', 'OK.']], f: ['what'] },
    what: { s: 'What happened?', h: "My friend fell and he can't move his leg. He is conscious.", o: [['fell|leg|can not|cannot|move|hurt|conscious|breathing|bleeding', 'end', 'An ambulance is on the way.']], f: ['end', 'An ambulance is coming.'] },
  }),
  rp('129', {
    p: 'Una comisaría', w: ['Oficial', 'policía'], s: 'Perdiste la billetera y querés hacer la denuncia.', g: 'Explicar qué perdiste, dónde y cuándo.',
    v: [['to lose / lost', 'perder / perdí', 'tu lus / lost', 'I lost my wallet.'], ['police report', 'denuncia', 'polís ripórt', 'I need a police report.'], ['reference number', 'número de referencia', 'réferens námber', "Here's your reference number."]],
    c: ["Here's your reference number.", 'We’ll call if it turns up.'],
  }, {
    start: { s: 'How can I help?', h: 'I lost my wallet and I need a police report.', a: 'Explicá qué pasó.', o: [['lost|wallet|report|missing|purse', 'where', 'OK.']], f: ['where'] },
    where: { s: 'Where and when did you lose it?', h: 'On the bus, yesterday afternoon.', o: [['bus|train|yesterday|today|afternoon|street|beach|on|at', 'inside', 'What was in it?']], f: ['inside'] },
    inside: { s: 'What was in it?', h: 'My licence, my bank card and about fifty dollars.', o: [['licence|license|card|cash|money|dollars|id', 'end', 'OK, I will write the report.']], f: ['end', 'OK.'] },
  }),
  rp('130', {
    p: 'Llamada al consulado', w: ['Funcionaria', 'del consulado'], s: 'Perdiste el pasaporte.', g: 'Explicar la situación y preguntar qué documentos necesitás.',
    v: [['consulate', 'consulado', 'kónsulet', "I'm calling the consulate."], ['emergency passport', 'pasaporte de emergencia', 'imérchensi páspor', 'Can I get an emergency passport?'], ['appointment', 'cita', 'apóintment', 'I need an appointment.']],
    c: ['See you at your appointment.', 'We will help you.'],
  }, {
    start: { s: 'Consulate, good morning.', h: 'Good morning. I lost my passport and I fly home next month.', a: 'Explicá la situación.', o: [['lost|passport|stolen|fly|travel', 'report', 'I see.']], f: ['report'] },
    report: { s: 'Did you report it to the police?', h: 'Yes, I have a police report.', o: [['yes|report|police|no|not yet', 'docs', 'Good.']], f: ['docs'] },
    docs: { s: 'Any questions?', h: 'What documents do I need to bring?', o: [['documents|bring|need|what|photos|papers', 'end', 'The report, two photos and any ID.']], f: ['end', 'We will email you the list.'] },
  }),
  rp('131', {
    p: 'Llamada al 000', w: ['Operador', 'emergencias'], s: 'Ves humo saliendo de una casa.', g: 'Pedir bomberos, decir dónde y si hay gente.',
    v: [['fire brigade', 'bomberos', 'fáier brigéid', 'Call the fire brigade.'], ['smoke', 'humo', 'smouk', "There's smoke coming out."], ['trapped', 'atrapado', 'trapt', 'Is anyone trapped?']],
    c: ['The fire brigade is on the way.', 'Stay back and stay safe.'],
  }, {
    start: { s: 'Emergency, which service?', h: "Fire, please. There's smoke coming from a house.", a: 'Pedí el servicio.', o: [['fire|smoke|house|burning', 'where', 'Where?']], f: ['where'] },
    where: { s: "What's the address?", h: "12 Ocean Street, Manly.", o: [['[0-9]|street|road|manly|address|corner', 'people', 'OK.']], f: ['people'] },
    people: { s: 'Is anyone inside?', h: "I don't know. I can't see anyone.", o: [['do not know|not sure|no|yes|can not|cannot|someone|anyone', 'end', 'Stay back, they are coming.']], f: ['end', 'They are coming.'] },
  }),
  rp('132', {
    p: 'Una comisaría', w: ['Oficial', 'policía'], s: 'Te robaron el celular en un bar.', g: 'Denunciar el robo, describir el teléfono y pedir el número de reporte.',
    v: [['stolen', 'robado', 'stóulen', 'My phone was stolen.'], ['to describe', 'describir', 'tu diskráib', 'Can you describe it?'], ['case number', 'número de caso', 'keis námber', 'Can I have the case number?']],
    c: ["Here's your case number.", 'Good luck, we will be in touch.'],
  }, {
    start: { s: 'What can I do for you?', h: 'My phone was stolen in a bar last night.', a: 'Contá qué pasó.', o: [['stolen|phone|stole|took|robbed|bar', 'desc', 'Sorry to hear.']], f: ['desc'] },
    desc: { s: 'Can you describe it?', h: "It's a black iPhone with a blue case.", o: [['black|white|iphone|samsung|case|blue|phone', 'num', 'OK.']], f: ['num'] },
    num: { s: 'Anything else?', h: 'Can I have the case number for my insurance?', o: [['case|number|insurance|report|can', 'end', 'Sure, here it is.']], f: ['end', 'Here.'] },
  }),
  rp('133', {
    p: 'Llamada con la compañía de seguros', w: ['Mark', 'agente de seguros'], s: 'Querés saber qué cubre tu seguro de viaje.', g: 'Preguntar qué cubre, cuánto pagás y cómo reclamar.',
    v: [['to cover', 'cubrir', 'tu káver', 'Does it cover dental?'], ['claim', 'reclamo', 'kleim', 'How do I make a claim?'], ['policy', 'póliza', 'pólisi', "What's your policy number?"]],
    c: ['Anything else, just call.', 'Thanks for calling.'],
  }, {
    start: { s: 'How can I help today?', h: 'Does my policy cover a visit to the doctor?', a: 'Preguntá qué cubre.', o: [['cover|doctor|policy|does|hospital|dental', 'pay', 'Yes, it does.']], f: ['pay'] },
    pay: { s: 'Yes, GP visits are covered.', h: 'Do I pay first and then get the money back?', o: [['pay|first|back|refund|money', 'claim', 'Yes.']], f: ['claim'] },
    claim: { s: 'Any other questions?', h: 'How do I make a claim?', o: [['claim|how|online|form', 'end', 'Online, with the receipt.'], [ALL, 'end', 'No worries.']], f: ['end', 'Online.'] },
  }),
  rp('134', {
    p: 'La calle', w: ['Peatón', 'un señor'], s: 'Alguien se desmayó y necesitás ayuda.', g: 'Pedir ayuda clara y directa a otra persona.',
    v: [['Can you help me?', '¿me puede ayudar?', 'kan iu jelp mi', 'Can you help me, please?'], ['to faint', 'desmayarse', 'tu feint', 'She fainted.'], ['Call an ambulance!', '¡llame a una ambulancia!', 'kol an ámbiulans', 'Please call an ambulance!']],
    c: ['They are on their way.', 'Good, stay with her.'],
  }, {
    start: { s: "What's wrong?", h: 'Please help! This woman fainted.', a: 'Pedí ayuda.', o: [['help|fainted|fell|woman|man|please', 'call', 'Oh no!']], f: ['call'] },
    call: { s: 'What should I do?', h: 'Please call an ambulance. I will stay with her.', o: [['call|ambulance|zero|000|stay|phone', 'end', 'Calling now.']], f: ['end', 'Calling.'] },
  }),
];

/** 12. Trámites, reclamos y situaciones formales */
export const FORMAL = [
  rp('135', {
    p: 'Una oficina de Service NSW', w: ['Funcionaria', 'empleada'], s: 'Querés cambiar tu licencia extranjera por una australiana.', g: 'Explicar el trámite y preguntar requisitos.',
    v: [['to convert / transfer', 'convertir, canjear', 'tu konvért', 'I want to convert my licence.'], ['proof of address', 'comprobante de domicilio', 'pruf ov ádres', 'Bring proof of address.'], ['eyesight test', 'examen de la vista', 'áisait test', 'You need an eyesight test.']],
    c: ['Take a number and wait to be called.', 'See you soon.'],
  }, {
    start: { s: 'Next, please. How can I help?', h: "I'd like to convert my overseas licence.", a: 'Explicá el trámite.', o: [['convert|licence|license|change|transfer|overseas', 'docs', 'OK.']], f: ['docs'] },
    docs: { s: 'Do you have your documents?', h: 'What documents do I need?', o: [['documents|what|need|bring', 'test', 'Passport, licence and proof of address.'], ['yes|have|here', 'test', 'Great.']], f: ['test'] },
    test: { s: 'Any other questions?', h: 'Do I need to do a test?', o: [['test|exam|eye|eyesight|drive', 'end', 'Only an eyesight test.'], [ALL, 'end', 'OK.']], f: ['end', 'Just an eyesight test.'] },
  }),
  rp('136', {
    p: 'Una oficina', w: ['Funcionaria', 'empleada'], s: 'Recibiste una carta oficial y no entendés una parte.', g: 'Pedir que te expliquen qué significa y qué tenés que hacer.',
    v: [['due date', 'fecha de vencimiento', 'diu deit', "What's the due date?"], ['What does this mean?', '¿qué significa esto?', 'uót das dis min', 'What does this mean?'], ['to lodge', 'presentar (un trámite)', 'tu loch', 'Lodge the form online.']],
    c: ['Hope that helps.', 'Call us if you need more help.'],
  }, {
    start: { s: 'How can I help?', h: "I got this letter. What does 'lodge by the due date' mean?", a: 'Preguntá qué significa.', o: [['what|mean|letter|lodge|due|understand', 'do', 'It means you must send the form before that date.']], f: ['do'], x: [FX.explainMe] },
    do: { s: 'Anything else?', h: 'Can I lodge it online?', o: [['online|lodge|can|how|where', 'end', 'Yes, on the website.'], [ALL, 'end', 'Good.']], f: ['end', 'Yes.'] },
  }),
  rp('137', {
    p: 'Llamada a una clínica', w: ['Recepcionista', 'de la clínica'], s: 'Llamás para sacar un turno.', g: 'Pedir el turno, elegir día y hora y confirmar.',
    v: [['to book an appointment', 'sacar turno', 'tu buk an apóintment', "I'd like to book an appointment."], ['the earliest', 'el más pronto', 'de érliest', "What's the earliest?"], ['to confirm', 'confirmar', 'tu konférm', 'Can you confirm the time?']],
    c: ['See you then.', 'Thanks for calling.'],
  }, {
    start: { s: 'Good morning, City Clinic.', h: "Hi, I'd like to book an appointment with a GP.", a: 'Pedí un turno.', o: [['book|appointment|see|doctor|gp', 'when', 'Sure.']], f: ['when'] },
    when: { s: 'When would you like to come?', h: "What's the earliest you have?", o: [['earliest|soon|today|tomorrow|morning|when|afternoon', 'ok', 'Tomorrow at nine fifteen.']], f: ['ok'] },
    ok: { s: 'Tomorrow at nine fifteen. Does that work?', h: 'Yes, that works. Thank you.', o: [['no|can not|cannot|later|another', 'end', 'OK, how about eleven thirty?'], ['yes|works|good|fine|ok|okay|perfect', 'end', 'Great, you are booked in.']], f: ['end', 'OK.'] },
  }),
  rp('138', {
    p: 'Llamada a la compañía de luz', w: ['Agente', 'atención al cliente'], s: 'Tu factura es el doble de lo normal.', g: 'Explicar el problema, pedir que la revisen y obtener un número de reclamo.',
    v: [['bill', 'factura', 'bil', 'My bill is too high.'], ['to overcharge', 'cobrar de más', 'tu óuvercharch', 'I think I was overcharged.'], ['to look into it', 'revisarlo', 'tu luk íntu it', 'Can you look into it?']],
    c: ['We will be in touch within five days.', 'Thanks for your patience.'],
  }, {
    start: { s: 'Thanks for calling, how can I help?', h: 'Hi, my last bill is double the normal amount. I think I was overcharged.', a: 'Explicá el problema.', o: [['bill|double|high|overcharged|wrong|charged|amount', 'check', 'Let me see.']], f: ['check'] },
    check: { s: 'It says you used more power this quarter.', h: 'That is not right. We were away for a month. Can you look into it?', o: [['not right|wrong|away|look into|check|review|can', 'ref', 'Sure.']], f: ['ref'] },
    ref: { s: "I'll send it for review.", h: 'Can I have a reference number, please?', o: [['reference|number|ref|can', 'end', "It's 4471."]], f: ['end', 'Sure.'] },
  }),
  rp('139', {
    p: 'Llamada con un gimnasio', w: ['Agente', 'del gimnasio'], s: 'Querés cancelar tu membresía.', g: 'Cancelar con claridad aunque te ofrezcan descuentos.',
    v: [['to cancel', 'cancelar', 'tu kánsel', 'I want to cancel my membership.'], ['notice period', 'plazo de aviso', 'nóutis píriod', 'Is there a notice period?'], ['in writing', 'por escrito', 'in ráiting', 'Can you confirm it in writing?']],
    c: ['It’s been cancelled.', 'Sorry to see you go.'],
  }, {
    start: { s: 'How can I help?', h: "I'd like to cancel my membership, please.", a: 'Pedí la baja.', o: [['cancel|stop|end|membership|quit', 'offer', 'Oh no.']], f: ['offer'] },
    offer: { s: 'We can give you two months half price.', h: "Thanks, but I'm moving cities. I still want to cancel.", o: [['no|still|cancel|moving|thanks but|not interested', 'write', 'OK, understood.'], ['yes|ok|okay|sure', 'end', 'Great, enjoy the discount.']], f: ['write'] },
    write: { s: 'Done.', h: 'Can you confirm it by email?', o: [['email|writing|confirm|send', 'end', "Yes, you'll get an email today."]], f: ['end', 'Sure.'] },
  }),
  rp('140', {
    p: 'Llamada con el banco', w: ['Agente', 'del banco'], s: 'Te mudaste y tenés que actualizar la dirección.', g: 'Dar la nueva dirección y deletrearla.',
    v: [['to update', 'actualizar', 'tu apdéit', 'I need to update my address.'], ['to spell', 'deletrear', 'tu spel', 'Can you spell that?'], ['postcode', 'código postal', 'póustkoud', "What's the postcode?"]],
    c: ['All updated.', 'Done, thanks for calling.'],
  }, {
    start: { s: 'How can I help today?', h: 'I moved house and I need to update my address.', a: 'Explicá qué querés.', o: [['moved|update|address|change|new', 'new', 'Sure.']], f: ['new'] },
    new: { s: "What's the new address?", h: "It's 8 Wattle Street, Fremantle.", o: [['[0-9]|street|road|avenue|fremantle', 'spell', 'Can you spell the street?']], f: ['spell'] },
    spell: { s: 'Can you spell the street name?', h: 'W, A, double T, L, E. Postcode six one six zero.', o: [['w|double|t|l|e|postcode|six', 'end', 'Thanks, done.']], f: ['end', 'Done.'] },
  }),
  rp('141', {
    p: 'Llamada al proveedor de internet', w: ['Técnico', 'soporte'], s: 'El internet anda muy lento desde hace días.', g: 'Explicar el problema, decir qué probaste y pedir un técnico.',
    v: [['modem', 'módem', 'móudem', "I've restarted the modem."], ['slow / drops out', 'lento / se corta', 'slou / drops aut', 'It keeps dropping out.'], ['technician', 'técnico', 'tekníshan', 'Can you send a technician?']],
    c: ['We will sort it out.', 'Thanks for your patience.'],
  }, {
    start: { s: "Tech support, what's the issue?", h: 'My internet is very slow and it keeps dropping out.', a: 'Explicá el problema.', o: [['slow|dropping|internet|wifi|not working|cuts|drops', 'tried', 'Sorry.']], f: ['tried'] },
    tried: { s: 'Have you restarted the modem?', h: 'Yes, I restarted it twice.', o: [['yes|restarted|twice|did|no|tried', 'tech', 'Hmm.']], f: ['tech'] },
    tech: { s: 'The line looks OK from here.', h: 'Can you send a technician, please?', o: [['technician|send|someone|come|check', 'end', 'Yes, on Wednesday morning.']], f: ['end', 'We will book one.'] },
  }),
  rp('142', {
    p: 'La cocina de la casa compartida', w: ['Liam', 'compañero de casa'], s: 'Tu compañero nunca lava los platos.', g: 'Plantear el problema con respeto y proponer una solución.',
    v: [['to bring up', 'sacar un tema', 'tu bring ap', 'Can I bring something up?'], ['to take turns', 'turnarse', 'tu teik terns', "Let's take turns."], ['fair', 'justo', 'fer', "It's not fair."]],
    c: ['Thanks for being cool about it.', 'Glad we sorted it out.'],
  }, {
    start: { s: "What's up?", h: 'Can I bring something up? The dishes are always left in the sink.', a: 'Planteá el problema con respeto.', o: [['bring up|dishes|sink|clean|always|left|talk', 'sorry', 'Oh, yeah.']], f: ['sorry'] },
    sorry: { s: "Sorry, I've been really busy.", h: "I understand. How about we take turns? You on weekdays, me on weekends?", o: [['turns|how about|weekdays|weekends|roster|each|we can', 'end', 'Yeah, fair enough.']], f: ['end', 'OK.'] },
  }),
  rp('143', {
    p: 'Una reunión de trabajo', w: ['Megan', 'compañera'], s: 'Una compañera entendió mal lo que dijiste en un mail.', g: 'Aclarar qué quisiste decir sin echarle la culpa.',
    v: [['What I meant was', 'lo que quise decir fue', 'uót ai ment uós', 'What I meant was Tuesday.'], ['to clear up', 'aclarar', 'tu klir ap', "Let's clear that up."], ['my bad', 'culpa mía', 'mai bad', 'My bad, I wasn’t clear.']],
    c: ['Thanks for clearing that up.', 'All good now.'],
  }, {
    start: { s: 'I thought you said you would do the report.', h: "Sorry, I wasn't clear. What I meant was I would help with it.", a: 'Aclará qué quisiste decir.', o: [['meant|clear|sorry|help|mean|misunderstanding', 'plan', 'Oh, OK.']], f: ['plan'] },
    plan: { s: 'So who does what?', h: 'You write it, and I can do the charts.', o: [['you|i|charts|write|can|split|do', 'end', 'Sounds good.']], f: ['end', 'OK.'] },
  }),
  rp('144', {
    p: 'La recepción de un hotel', w: ['Gerente', 'gerente del hotel'], s: 'La habitación estaba sucia y nadie lo arregló.', g: 'Hacer un reclamo formal, dar detalles y pedir una solución.',
    v: [['to make a complaint', 'hacer un reclamo', 'tu meik a kompléint', "I'd like to make a complaint."], ['refund', 'reembolso', 'rífand', "I'd like a partial refund."], ['unacceptable', 'inaceptable', 'anakséptabol', "That's unacceptable."]],
    c: ['We apologise again.', 'Thank you for telling us.'],
  }, {
    start: { s: 'Good evening, how can I help?', h: "I'd like to make a complaint. Our room was dirty and nobody fixed it.", a: 'Hacé el reclamo.', o: [['complaint|dirty|room|nobody|problem|not clean', 'detail', 'I’m sorry.']], f: ['detail'] },
    detail: { s: 'When did you report it?', h: 'Yesterday morning, and again last night.', o: [['yesterday|morning|night|twice|again|today', 'fix', 'That should not happen.']], f: ['fix'] },
    fix: { s: 'What can we do for you?', h: "I'd like a partial refund for one night.", o: [['refund|discount|night|money|another room|change', 'end', 'Of course, I will arrange that.']], f: ['end', 'We will sort it out.'] },
  }),
  rp('145', {
    p: 'Tu último día de trabajo', w: ['Greg', 'tu supervisor'], s: 'Te despedís de tus compañeros porque te vas de la ciudad.', g: 'Agradecer, contar qué te llevás y dejar contacto.',
    v: [['to miss', 'extrañar', 'tu mis', "I'll miss you guys."], ["I've learned a lot", 'aprendí mucho', 'aiv lernd a lot', "I've learned a lot here."], ['to keep in touch', 'seguir en contacto', 'tu kip in tach', "Let's keep in touch."]],
    c: ['All the best, mate.', 'Good luck with everything!'],
  }, {
    start: { s: "So it's your last day, eh?", h: "Yes. Thanks for everything. I've learned a lot here.", a: 'Agradecé.', o: [['thanks|thank|learned|learnt|everything|last|miss', 'miss', 'We will miss you.']], f: ['miss'] },
    miss: { s: "We'll miss you around here.", h: "I'll miss you guys too. Let's keep in touch.", o: [['miss|keep in touch|touch|instagram|number|email|too', 'end', 'For sure.']], f: ['end', 'For sure.'] },
  }),
];

/** 13. Situaciones difíciles */
export const HARD = [
  rp('146', {
    p: 'Un taller', w: ['Bazza', 'australiano con acento cerrado'], s: 'No entendés el acento de tu compañero.', g: 'Decir que no entendiste sin vergüenza y pedir otra forma de decirlo.',
    v: [["I didn't catch that", 'no te entendí', 'ai dídent kach dat', "Sorry, I didn't catch that."], ['in other words', 'con otras palabras', 'in áder uerds', 'Can you say it in other words?'], ['accent', 'acento', 'áksent', "I'm still getting used to the accent."]],
    c: ['No worries, mate.', 'You’ll get used to it.'],
  }, {
    start: { s: "Oi, chuck us the spanner from the ute, ay?", h: "Sorry, I didn't catch that. Can you say it in other words?", a: 'Decí que no entendiste.', o: [['sorry|catch|again|other words|repeat|understand|pardon', 'slow', 'Ha, sorry.']], f: ['slow'] },
    slow: { s: 'Can you get me the spanner from the car?', h: 'Ah, the spanner. Sure! I am still getting used to the accent.', o: [['spanner|sure|ok|okay|accent|got it|yes', 'end', 'Ha, no worries, mate.']], f: ['end', 'Cheers.'] },
  }),
  rp('147', {
    p: 'Una charla en la calle', w: ['Jess', 'vecina que habla rapidísimo'], s: 'Tu vecina habla muy rápido.', g: 'Pedir que hable más despacio y confirmar lo que entendiste.',
    v: [['to slow down', 'ir más despacio', 'tu slou daun', 'Could you slow down a bit?'], ['so you mean…', 'o sea que…', 'sou iu min', 'So you mean the bin day changed?'], ['bin day', 'día de basura', 'bin dei', 'Bin day is Tuesday.']],
    c: ['Thanks, catch you later!', 'See ya!'],
  }, {
    start: { s: "Hey-did-you-hear-the-council-changed-bin-day-to-Tuesday-so-put-yours-out-Monday-night!", h: 'Sorry, could you slow down a bit?', a: 'Pedí que hable más despacio.', o: [['slow|slower|again|sorry|repeat|bit', 'conf', 'Ha, sorry!']], f: ['conf'] },
    conf: { s: 'Bin day is now Tuesday. Put the bins out on Monday night.', h: 'Ah, so I put the bins out on Monday night.', o: [['monday|bins|so|night|tuesday|got it', 'end', 'Exactly!']], f: ['end', 'Yes.'] },
  }),
  rp('148', {
    p: 'Un depósito', w: ['Greg', 'supervisor'], s: 'Hiciste algo mal porque malinterpretaste una instrucción.', g: 'Explicar qué entendiste, disculparte y corregirlo.',
    v: [['I thought you said', 'pensé que dijiste', 'ai zot iu sed', 'I thought you said the top shelf.'], ['to fix', 'arreglar', 'tu fiks', "I'll fix it now."], ['to double-check', 'chequear de nuevo', 'tu dábol chek', "Next time I'll double-check."]],
    c: ['All good, it happens.', 'Thanks for fixing it.'],
  }, {
    start: { s: 'Why are these boxes on the top shelf?', h: 'Sorry, I thought you said the top shelf.', a: 'Explicá qué entendiste.', o: [['thought|said|sorry|understood|misunderstood|top', 'fix', 'No, the bottom one.']], f: ['fix'] },
    fix: { s: 'They go on the bottom shelf.', h: "I'll fix it now. Next time I'll double-check.", o: [['fix|now|move|double check|next time|will|sorry', 'end', 'Thanks.']], f: ['end', 'Thanks.'] },
  }),
  rp('149', {
    p: 'Llamada inesperada', w: ['Rob', 'tu jefe'], s: 'Es tu día libre y te llama tu jefe para que vayas.', g: 'Responder con calma, preguntar qué necesita y decidir.',
    v: [['day off', 'día libre', 'dei of', "It's my day off."], ['to fill in', 'cubrir a alguien', 'tu fil in', 'Can you fill in today?'], ['to call back', 'devolver la llamada', 'tu kol bak', 'Can I call you back in five minutes?']],
    c: ['Thanks, I appreciate it.', 'No worries, talk soon.'],
  }, {
    start: { s: "Hi, sorry to call on your day off. Can you fill in today? Someone's sick.", h: 'Oh, OK. What time do you need me?', a: 'Preguntá qué necesita.', o: [['time|when|what|need|how long|hours', 'dec', 'From twelve to six.']], f: ['dec'] },
    dec: { s: 'From twelve to six. Can you do it?', h: 'Yes, I can come at twelve.', o: [["can not|cannot|sorry|plans|busy|not today", 'end', 'No worries, I’ll ask someone else.'], ['yes|can|ok|okay|sure|come', 'end', 'Legend, thank you!']], f: ['end', 'OK.'] },
  }),
  rp('150', {
    p: 'Llegando al trabajo', w: ['Mia', 'encargada'], s: 'Llegaste 30 minutos tarde porque el tren se atrasó.', g: 'Disculparte, explicar el motivo y ofrecer recuperar el tiempo.',
    v: [['to be late', 'llegar tarde', 'tu bi leit', 'Sorry I’m late.'], ['delayed', 'demorado', 'diléid', 'The train was delayed.'], ['to make up the time', 'recuperar el tiempo', 'tu meik ap de taim', "I can make up the time."]],
    c: ['OK, let’s get going.', 'Thanks for letting me know.'],
  }, {
    start: { s: "You're thirty minutes late.", h: "I'm really sorry. The train was delayed.", a: 'Disculpate y explicá.', o: [['sorry|train|delayed|late|bus|traffic', 'call', 'Hmm.']], f: ['call'] },
    call: { s: 'Why didn’t you call me?', h: 'My phone was dead. I can make up the time after my shift.', o: [['phone|dead|battery|make up|stay|later|sorry', 'end', 'OK, thanks.']], f: ['end', 'OK.'] },
  }),
  rp('151', {
    p: 'Una cena', w: ['Tom', 'amigo de un amigo'], s: 'Te hacen una pregunta inesperada sobre tu opinión.', g: 'Ganar tiempo con naturalidad y dar una respuesta.',
    v: [["That's a good question", 'buena pregunta', 'dats a gud kuéschon', "That's a good question."], ['Let me think', 'dejame pensar', 'let mi zink', 'Let me think…'], ['I would say', 'yo diría', 'ai uud sei', "I'd say the people."]],
    c: ['Fair enough!', 'Good answer.'],
  }, {
    start: { s: "So what's the strangest thing about Australia for you?", h: "That's a good question. Let me think… I'd say the spiders!", a: 'Ganá tiempo y respondé.', o: [['good question|think|say|spiders|weather|people|food|strangest|probably', 'why', 'Ha!']], f: ['why'] },
    why: { s: 'Why?', h: 'Because they are huge and they are everywhere.', o: [['because|huge|big|everywhere|scary', 'end', 'Ha, fair enough.']], f: ['end', 'Fair.'] },
  }),
  rp('152', {
    p: 'Un café cerrando, solo', w: ['Cliente', 'un cliente'], s: 'Estás solo en el café y se rompió la máquina de tarjetas.', g: 'Explicar el problema al cliente y ofrecer alternativas.',
    v: [['EFTPOS machine', 'posnet', 'éftpos mashín', 'The EFTPOS machine is down.'], ['cash only', 'solo efectivo', 'kash óunli', "It's cash only today."], ['bank transfer', 'transferencia', 'bank tránsfer', 'You can do a bank transfer.']],
    c: ['Thanks for understanding.', 'Sorry about that, have a good day.'],
  }, {
    start: { s: 'Can I pay by card?', h: "Sorry, the EFTPOS machine is down. It's cash only right now.", a: 'Explicá el problema.', o: [['sorry|eftpos|machine|card|cash|down|not working', 'alt', 'Oh no.']], f: ['alt'] },
    alt: { s: "I don't have cash.", h: "No worries, you can do a bank transfer, or there's an ATM next door.", o: [['transfer|atm|next door|bank|pay later|tomorrow', 'end', "OK, I'll do a transfer."]], f: ['end', 'OK.'] },
  }),
  rp('153', {
    p: 'Un hostel', w: ['Aiko', 'viajera japonesa'], s: 'Conocés a alguien que también aprende inglés.', g: 'Charlar despacio, ayudarse y compartir algo de tu cultura.',
    v: [['to practise', 'practicar', 'tu práktis', "Let's practise together."], ['in my country', 'en mi país', 'in mai kántri', 'In my country we drink mate.'], ['similar / different', 'parecido / distinto', 'símilar / díferent', "It's very different."]],
    c: ['Nice to meet you!', 'Let’s practise again!'],
  }, {
    start: { s: "Hi! I'm Aiko, from Japan. My English is not so good.", h: "Mine too! I'm Juan, from Uruguay. Let's practise together.", a: 'Presentate y proponé practicar.', o: [['practise|practice|together|too|from|i am|my name|hi', 'cult', 'Yes!']], f: ['cult'] },
    cult: { s: 'What is something special in your country?', h: 'In my country we drink mate. It is like a tea.', o: [['in my country|mate|tea|asado|we|drink|eat|football', 'end', 'Oh, in Japan we have green tea!']], f: ['end', 'Interesting!'] },
  }),
  rp('154', {
    p: 'Una oficina', w: ['Rob', 'gerente'], s: 'Tenés que explicar por qué un pedido salió mal (varias causas).', g: 'Explicar ordenado: primero, después, por eso.',
    v: [['first of all', 'primero que nada', 'ferst ov ol', 'First of all, the supplier was late.'], ['on top of that', 'además de eso', 'on top ov dat', 'On top of that, the truck broke down.'], ['as a result', 'como resultado', 'as a risált', 'As a result, the order was late.']],
    c: ['Thanks, that makes sense.', 'OK, clear now.'],
  }, {
    start: { s: 'Why was the order three days late?', h: 'First of all, the supplier sent the boxes late.', a: 'Empezá a explicar.', o: [['first|supplier|late|because|boxes', 'more', 'And?']], f: ['more'] },
    more: { s: 'And?', h: 'On top of that, the truck broke down. As a result, we were three days late.', o: [['on top|truck|broke|result|so|also|then', 'end', 'OK, that makes sense.']], f: ['end', 'I see.'] },
  }),
  rp('155', {
    p: 'Una charla con compañeros', w: ['Davo', 'compañero'], s: 'Tu compañero dice algo con lo que no estás de acuerdo.', g: 'Dar tu opinión con respeto y con un motivo.',
    v: [['I see your point, but…', 'entiendo tu punto, pero…', 'ai si ior point, bat', 'I see your point, but I disagree.'], ['In my opinion', 'en mi opinión', 'in mai opínion', 'In my opinion, it’s better.'], ['to agree to disagree', 'estar de acuerdo en no estar de acuerdo', 'tu agrí tu disagrí', "Let's agree to disagree."]],
    c: ['Fair enough, mate.', 'Good chat.'],
  }, {
    start: { s: "Working weekends is the best, more money!", h: 'I see your point, but in my opinion rest is more important.', a: 'Opiná con respeto.', o: [['see your point|opinion|but|disagree|think|important|rest', 'why', 'Why?']], f: ['why'] },
    why: { s: 'Why do you reckon?', h: 'Because if you are tired, you work worse. Let’s agree to disagree!', o: [['because|tired|health|family|agree|friends', 'end', 'Ha, fair enough.']], f: ['end', 'Fair.'] },
  }),
];
