import { FX, rp } from './build';

const ALL = "no|that's all|that is all|nothing|all good";

/** 3. Banco, dinero y trámites · 4. Cafés y restaurantes · 5. Compras y vida cotidiana */
export const MONEY_FOOD_SHOPPING = [
  rp('24', {
    p: 'Sucursal de un banco en Perth', w: ['Grace', 'empleada del banco'],
    s: 'Ya tenés cuenta, pero no entendés un movimiento en tu resumen y vas a preguntar.',
    g: 'Explicar qué no entendés de tu cuenta y pedir que te lo aclaren.',
    v: [['statement', 'resumen de cuenta', 'stéitment', 'I have a question about my statement.'], ['transaction', 'movimiento', 'transákshon', "I don't recognise this transaction."], ['charge', 'cobro, cargo', 'charch', 'What is this charge?'], ['to recognise', 'reconocer', 'tu rékognais', "I don't recognise it."]],
    c: ['Anything else, just let us know.', 'Have a good day!'],
  }, {
    start: { s: 'Hi, how can I help you today?', h: 'Hi, I have a question about my account.', a: 'Decí que tenés una duda con tu cuenta.', o: [['account|statement|question|charge|transaction|money', 'which', 'Sure, what is it?']], f: ['which', 'Is it about your account?'] },
    which: { s: 'Which transaction are you asking about?', h: "There's a charge of fifteen dollars that I don't recognise.", o: [['charge|fee|dollars|[0-9]|transaction|payment|recognise|recognize', 'explain', 'Let me have a look.']], f: ['explain', 'Let me check your account.'] },
    explain: { s: "That's an overseas transaction fee, from a payment in another currency. Does that make sense?", h: 'Yes, that makes sense. Thanks for explaining.', o: [['no|still|not|why|how', 'end', "It happens when you pay in another currency. I'll send you the details."], ['yes|makes sense|ok|okay|thanks|understand|i see', 'end', 'No worries.']], f: ['end', "I'll send you an email with the details."], x: [FX.explainMe] },
  }),
  rp('25', {
    p: 'Sucursal de un banco', w: ['David', 'empleado del banco'],
    s: 'Abriste tu cuenta pero todavía no tenés tarjeta de débito.',
    g: 'Pedir la tarjeta, confirmar la dirección y preguntar cuándo llega.',
    v: [['debit card', 'tarjeta de débito', 'débit card', "I'd like a debit card."], ['PIN', 'clave de la tarjeta', 'pin', 'You can set your PIN in the app.'], ['to activate', 'activar', 'tu áktiveit', 'How do I activate it?'], ['business days', 'días hábiles', 'bísnes deis', 'It takes five business days.']],
    c: ["You're all set.", 'All done. Have a good day!'],
  }, {
    start: { s: 'Hi there, what can I do for you?', h: "Hi, I'd like a debit card for my account, please.", a: 'Pedí la tarjeta.', o: [['card|debit', 'address', 'Sure, I can order one for you.']], f: ['address', 'Do you need a card?'], x: [FX.want] },
    address: { s: 'Is your address still the hostel in Coogee?', h: "No, I moved. My new address is 12 Smith Street.", o: [['no|moved|new|street|road|[0-9]', 'when', "Thanks, I've updated it."], ['yes|same|still', 'when', 'Great.']], f: ['when'] },
    when: { s: 'Anything else?', h: 'When will it arrive?', o: [['when|arrive|how long|days|week', 'end', 'In about five business days. You can use the app until then.'], ['activate|pin|use', 'end', 'You can activate it and set your PIN in the app.'], [ALL, 'end', 'No worries.']], f: ['end', 'It takes about five business days.'] },
  }),
  rp('26', {
    p: 'Un cajero automático en la calle', w: ['Mia', 'una persona que espera detrás tuyo'],
    s: 'El cajero te cobra una comisión y no entendés el mensaje. Le preguntás a la persona de atrás.',
    g: 'Pedir ayuda con educación, entender el mensaje y agradecer.',
    v: [['ATM', 'cajero automático', 'ei-ti-ém', 'Is there another ATM nearby?'], ['to withdraw', 'retirar (plata)', 'tu uizdró', 'I want to withdraw some cash.'], ['balance', 'saldo', 'bálans', 'I want to check my balance.'], ['fee', 'comisión', 'fi', 'Is there a fee?']],
    c: ['No worries, good luck!', 'Have a good one!'],
  }, {
    start: { s: 'Everything OK there?', h: 'Sorry, can you help me? I don’t understand this message.', a: 'Pedí ayuda.', o: [['help|understand|message|sorry|excuse|question', 'fee', 'Sure, let me see.']], f: ['fee', 'Need a hand?'] },
    fee: { s: "It says there's a three-dollar fee because it's not your bank's ATM.", h: 'Oh, is there another ATM without a fee nearby?', o: [['another|other|free|near|nearby|without|bank', 'end', 'Yeah, there is one inside the supermarket.'], ['ok|okay|fine|pay|accept', 'end', 'Just press yes then.']], f: ['end', 'You can just press yes or cancel.'] },
  }),
  rp('27', {
    p: 'App del banco y llamada al banco', w: ['Ben', 'atención al cliente del banco'],
    s: 'Querés mandar plata a tu familia en Uruguay y no sabés cómo.',
    g: 'Preguntar cómo hacer una transferencia al exterior, cuánto cuesta y cuánto tarda.',
    v: [['international transfer', 'transferencia al exterior', 'internáshonal tránsfer', 'I want to make an international transfer.'], ['exchange rate', 'tipo de cambio', 'ixchéinch reit', "What's the exchange rate?"], ['to send money', 'mandar plata', 'tu send máni', 'I need to send money home.'], ['account number', 'número de cuenta', 'akáunt námber', 'I have the account number.']],
    c: ['Thanks for calling.', 'Have a good day!'],
  }, {
    start: { s: 'Thanks for calling. How can I help?', h: 'Hi, I want to send money to my family in Uruguay.', a: 'Decí qué querés hacer.', o: [['send|transfer|money|overseas|uruguay|family|abroad', 'how', 'Sure, you can do that in the app.']], f: ['how', 'Are you trying to send money overseas?'] },
    how: { s: 'You just need their bank details. Do you have them?', h: 'Yes, I have the account number. How much does it cost?', o: [['cost|fee|how much|charge', 'time', "It's a six-dollar fee, plus the exchange rate."], ['yes|have|number|details', 'time', 'Great.'], ['no|not', 'time', 'You’ll need their account number and the bank name.']], f: ['time'] },
    time: { s: 'Any other questions?', h: 'How long does it take?', o: [['how long|time|days|when|arrive', 'end', 'Usually two to three business days.'], ['rate|exchange', 'end', 'The rate is shown in the app before you confirm.'], [ALL, 'end', 'No worries.']], f: ['end', 'You can see all the details in the app.'] },
  }),
  rp('28', {
    p: 'Llamada al banco', w: ['Ben', 'atención al cliente del banco'],
    s: 'Tu tarjeta fue rechazada en el súper y no sabés por qué.',
    g: 'Explicar qué pasó, confirmar tus datos y resolverlo.',
    v: [['declined', 'rechazada', 'dikláind', 'My card was declined.'], ['to block / unblock', 'bloquear / desbloquear', 'tu blok / anblók', 'Can you unblock it?'], ['suspicious', 'sospechoso', 'saspíshos', 'It looked suspicious.'], ['date of birth', 'fecha de nacimiento', 'deit ov berz', 'My date of birth is…']],
    c: ['Thanks for your patience.', 'Sorry for the trouble. Have a good day!'],
  }, {
    start: { s: 'Thanks for calling. What can I help you with?', h: 'Hi, my card was declined at the supermarket.', a: 'Contá el problema.', o: [['declined|rejected|card|work|working|problem', 'id', 'Sorry about that, let me check.']], f: ['id', 'Is there a problem with your card?'] },
    id: { s: 'Can you confirm your date of birth, please?', h: 'Sure. It’s the twenty-sixth of December, nineteen ninety-eight.', o: [['[0-9]|january|february|march|april|may|june|july|august|september|october|november|december|sure', 'why', 'Thank you.']], f: ['why'] },
    why: { s: 'We blocked it because of a payment in another country. Was that you?', h: 'Yes, that was me. I paid for a hotel online.', o: [['no|not me|wasn’t|was not|never', 'end', "OK, I'll cancel that card and send you a new one."], ['yes|me|hotel|online|paid', 'end', "Great, I've unblocked your card. You can use it now."]], f: ['end', "I'll unblock it for you."] },
  }),
  rp('29', {
    p: 'Sucursal de un banco', w: ['Grace', 'empleada del banco'],
    s: 'Te cobran comisiones todos los meses y querés entender por qué.',
    g: 'Preguntar por las comisiones y cómo evitarlas.',
    v: [['monthly fee', 'costo mensual', 'mánzli fi', 'Why do I pay a monthly fee?'], ['to waive', 'no cobrar, eximir', 'tu ueiv', 'The fee is waived if…'], ['to deposit', 'depositar', 'tu dipósit', 'Deposit two thousand a month.'], ['to avoid', 'evitar', 'tu avóid', 'How can I avoid it?']],
    c: ['Happy to help.', 'Have a good day!'],
  }, {
    start: { s: 'Hi, what can I do for you?', h: 'Hi. Why am I paying a monthly fee?', a: 'Preguntá por la comisión.', o: [['fee|fees|charge|pay|paying|monthly|why', 'avoid', "It's five dollars a month on that account."]], f: ['avoid', "That account has a five-dollar monthly fee."] },
    avoid: { s: 'Do you want to know how to avoid it?', h: 'Yes, please. How can I avoid it?', o: [['yes|how|avoid|please|stop', 'switch', 'If you deposit two thousand dollars a month, the fee is waived.'], ['no', 'end', 'No worries.']], f: ['switch'] },
    switch: { s: "Or you can switch to our no-fee account. Would you like that?", h: 'Yes, I would like to switch to the no-fee account.', o: [['no|stay|keep|think', 'end', 'No problem.'], ['yes|switch|change|please', 'end', "Done. You won't pay any more fees."]], f: ['end', 'You can also change it in the app.'] },
  }),
  rp('30', {
    p: 'Llamada a la oficina de impuestos (ATO)', w: ['Karen', 'empleada de la ATO'],
    s: 'Para trabajar necesitás un Tax File Number (TFN). Llamás para preguntar cómo sacarlo.',
    g: 'Preguntar cómo pedir el TFN, cuánto tarda y qué pasa si empezás a trabajar antes.',
    v: [['Tax File Number', 'número de contribuyente', 'tax fail námber', 'I need a Tax File Number.'], ['to apply', 'solicitar', 'tu aplái', 'How do I apply?'], ['employer', 'empleador', 'emplóier', 'Give it to your employer.'], ['online', 'por internet', 'onláin', 'You can apply online.']],
    c: ['Thanks for calling the ATO.', 'Good luck with the new job!'],
  }, {
    start: { s: 'Australian Taxation Office, Karen speaking.', h: 'Hi, I need a Tax File Number. How do I apply?', a: 'Decí qué necesitás.', o: [['tax|tfn|file|number|apply', 'how', 'You can apply online with your passport.']], f: ['how', 'Are you calling about a Tax File Number? You can apply online.'] },
    how: { s: 'Do you have your passport and an Australian address?', h: 'Yes, I have both. How long does it take?', o: [['how long|time|weeks|days|when', 'job', 'Usually around two weeks, by post.'], ['yes|have|both', 'job', 'Great, then you can apply today.'], ['no|address', 'job', 'You can use your hostel address.']], f: ['job'] },
    job: { s: 'Do you have a job already?', h: 'Yes, I start next week. What should I tell my employer?', o: [['yes|start|job|employer|tell', 'end', "Tell them you've applied. You have twenty-eight days to give them the number."], ['no|not yet|looking', 'end', 'Then apply now, so you have it ready.']], f: ['end', 'Just tell your employer you applied.'] },
  }),
  rp('31', {
    p: 'Oficina de recursos humanos del trabajo', w: ['Lisa', 'encargada de sueldos'],
    s: 'Recibiste tu primer recibo de sueldo (payslip) y hay cosas que no entendés.',
    g: 'Preguntar por las horas, los impuestos y la super del recibo.',
    v: [['payslip', 'recibo de sueldo', 'péislip', 'I have a question about my payslip.'], ['gross / net', 'bruto / neto', 'grous / net', "What's the difference between gross and net?"], ['tax', 'impuesto', 'tax', 'Why is the tax so high?'], ['penalty rates', 'pago extra fin de semana o feriado', 'pénalti reits', 'Do I get penalty rates on Sunday?']],
    c: ["Any other questions, just come and see me.", 'Happy to help.'],
  }, {
    start: { s: 'Hi, how can I help?', h: 'Hi, I have a question about my payslip.', a: 'Decí que tenés una duda con el recibo.', o: [['payslip|pay|salary|wage|question|money', 'what', 'Sure, what is it?']], f: ['what', 'Is it about your pay?'] },
    what: { s: "What don't you understand?", h: "What's the difference between gross and net?", o: [['gross|net|difference', 'tax', 'Gross is before tax, net is what you actually get.'], ['tax|why|taken|deduct', 'tax', 'That is the tax we take out for the government.'], ['hours|missing|wrong', 'tax', "Let me check… you're right, two hours are missing. I'll fix it."]], f: ['tax'] },
    tax: { s: 'Anything else on the payslip?', h: 'Do I get penalty rates on Sundays?', o: [['penalty|sunday|weekend|holiday|extra', 'end', 'Yes, Sundays are paid at time and a half.'], ['super|superannuation', 'end', "That's your retirement money, we pay it into your super fund."], [ALL, 'end', 'No worries.']], f: ['end', "Come and see me if you have more questions."] },
  }),
  rp('32', {
    p: 'Oficina de recursos humanos del trabajo', w: ['Lisa', 'encargada de sueldos'],
    s: 'Te piden los datos de tu fondo de superannuation (aporte jubilatorio) y no sabés qué es.',
    g: 'Preguntar qué es la super, si tenés que elegir un fondo y si la podés recuperar al irte.',
    v: [['super / superannuation', 'aporte jubilatorio', 'súper', 'What is super?'], ['super fund', 'fondo jubilatorio', 'súper fand', "I don't have a super fund."], ['to claim', 'reclamar, cobrar', 'tu cleim', 'Can I claim it when I leave?'], ['retirement', 'jubilación', 'ritáirment', "It's money for your retirement."]],
    c: ['Happy to help.', 'Any questions, just ask.'],
  }, {
    start: { s: 'I need your super fund details for the paperwork.', h: "Sorry, what is super? I don't understand.", a: 'Preguntá qué es.', o: [['what|super|understand|mean|explain|sorry', 'fund', "It's money we pay for your retirement, about twelve per cent on top of your wage."]], f: ['fund', "It's money for your retirement."] },
    fund: { s: 'Do you have a super fund?', h: "No, I don't. Can you choose one for me?", o: [['no|not|choose|recommend|help|which', 'leave', 'Sure, we can use our default fund.'], ['yes|have', 'leave', 'Great, just send me the details.']], f: ['leave'] },
    leave: { s: 'Any other questions?', h: 'Can I get the money back when I leave Australia?', o: [['back|leave|claim|money|go home|when', 'end', 'Yes, backpackers can claim it after they leave. There is some tax.'], [ALL, 'end', 'No worries.']], f: ['end', "Check the ATO website, it explains everything."] },
  }),
  // 4. Cafeterías, restaurantes y comida
  rp('34', {
    p: 'Un café de barrio en Sídney', w: ['Ruby', 'mesera'],
    s: 'Es sábado de mañana y vas a desayunar a un café.',
    g: 'Pedir el desayuno, cómo querés los huevos y algo para tomar.',
    v: [['smashed avo', 'palta pisada sobre pan tostado', 'smasht ávou', "I'll have the smashed avo."], ['poached / scrambled / fried', 'pochado / revuelto / frito', 'poucht / skrámbold / fráid', 'Scrambled, please.'], ['toast', 'pan tostado', 'tóust', 'Can I get extra toast?'], ['side', 'acompañamiento extra', 'said', 'A side of bacon, please.']],
    a: [['Brekkie', 'desayuno', 'Muy usado en Australia.']],
    c: ["I'll bring it out to you.", 'Coming right up!'],
  }, {
    start: { s: ['Morning! Are you ready to order?', "Hi! What can I get you for brekkie?"], h: "Hi! I'll have the eggs on toast, please.", a: 'Pedí algo para desayunar.', o: [['eggs|avo|toast|pancakes|bacon|breakfast|brekkie|have|like', 'eggs', 'Good choice.']], f: ['eggs', "The eggs on toast are really good."], x: [FX.want, FX.giveMe] },
    eggs: { s: 'How would you like your eggs?', h: 'Scrambled, please.', o: [['scrambled|poached|fried|boiled|sunny', 'drink', 'Lovely.']], f: ['drink', "I'll do them scrambled."] },
    drink: { s: 'Anything to drink?', h: "I'll have a flat white and an orange juice, please.", o: [['coffee|flat white|latte|tea|juice|water|cappuccino|chai', 'end', 'Perfect.'], ["no|that's all|that is all|nothing", 'end', 'No worries.']], f: ['end', 'Just let me know if you want something.'] },
  }),
  rp('35', {
    p: 'Un café de especialidad en Melbourne', w: ['Ollie', 'barista'],
    s: 'Querés el café a tu manera: más fuerte, con otra leche y bien caliente.',
    g: 'Pedir un café personalizado con todos los detalles.',
    v: [['extra shot', 'una dosis más de café', 'éxtra shot', 'With an extra shot, please.'], ['extra hot', 'bien caliente', 'éxtra jot', 'Can I have it extra hot?'], ['decaf', 'descafeinado', 'díkaf', 'A decaf latte, please.'], ['weak / strong', 'suave / fuerte', 'uík / strong', 'Make it strong, please.']],
    c: ["It'll be ready in a sec.", 'Coming right up, mate.'],
  }, {
    start: { s: 'Hey, what are you after?', h: "Can I have a latte with oat milk, please?", a: 'Pedí el café y la leche.', o: [['latte|flat white|cappuccino|coffee|long black|mocha|magic', 'strong', 'Sure thing.']], f: ['strong', "I'll make you a latte."], x: [FX.want] },
    strong: { s: 'Do you want it regular strength?', h: 'Can you make it strong, with an extra shot?', o: [['strong|extra shot|double|shot', 'hot', 'Easy.'], ['weak|half|decaf', 'hot', 'No worries.'], ['regular|normal|yes|fine', 'hot', 'Sure.']], f: ['hot'] },
    hot: { s: 'Anything else for it?', h: 'Yes, extra hot, please.', o: [['hot|extra hot|warm', 'end', 'Extra hot it is.'], ['sugar|sweet|honey', 'end', 'The sugar is just there on the counter.'], ["no|that's all|that is all|that's it", 'end', 'Too easy.']], f: ['end', 'No worries.'] },
  }),
  rp('36', {
    p: 'Un restaurante tailandés', w: ['Nok', 'moza'],
    s: 'Salís a almorzar con un amigo a un restaurante.',
    g: 'Pedir comida para los dos, el nivel de picante y bebidas.',
    v: [['main', 'plato principal', 'mein', "I'll have the green curry as a main."], ['spicy / mild', 'picante / suave', 'spáisi / maild', 'Not too spicy, please.'], ['to share', 'compartir', 'tu sher', "We'd like to share."], ['tap water', 'agua de la canilla (gratis)', 'tap uóter', 'Can we have some tap water?']],
    c: ["I'll put your order in.", 'Your food will be out soon.'],
  }, {
    start: { s: 'Hi! Are you ready to order?', h: "Yes. I'd like the pad thai, and my friend wants the green curry.", a: 'Pedí comida para los dos.', o: [['pad thai|curry|noodles|rice|soup|chicken|beef|like|have|want', 'spicy', 'Great choices.']], f: ['spicy', 'Take your time.'], x: [FX.giveMe] },
    spicy: { s: 'How spicy would you like it? Mild, medium or hot?', h: 'Mild, please. Not too spicy.', o: [['mild|medium|hot|not too|spicy|little', 'drinks', 'No worries.']], f: ['drinks', "I'll make it mild."] },
    drinks: { s: 'And to drink?', h: 'Can we have some tap water, please?', o: [['water|coke|beer|juice|tea|drink|lemonade', 'end', 'Sure.'], ["no|that's all|that is all|nothing", 'end', 'No problem.']], f: ['end', "I'll bring some water."] },
  }),
  rp('37', {
    p: 'Llamada a un restaurante', w: ['Marco', 'encargado'],
    s: 'Es el cumpleaños de un amigo y querés reservar una mesa para el sábado.',
    g: 'Reservar para una cantidad de personas, un día y una hora, y dar tu nombre.',
    v: [['to book a table', 'reservar una mesa', 'tu buk a téibol', "I'd like to book a table."], ['for four', 'para cuatro', 'for for', 'A table for four, please.'], ['fully booked', 'completo', 'fúli bukt', "We're fully booked at eight."], ['under the name', 'a nombre de', 'ánder de neim', 'Under the name Juan.']],
    c: ['See you then!', 'Thanks for calling. See you soon.'],
  }, {
    start: { s: 'Good evening, Marco’s. How can I help?', h: "Hi, I'd like to book a table for Saturday night.", a: 'Pedí una reserva.', o: [['book|table|reservation|reserve', 'people', 'Sure.']], f: ['people', 'Would you like to make a booking?'], x: [FX.want] },
    people: { s: 'How many people?', h: 'Four people, please.', o: [['[0-9]|two|three|four|five|six|eight|people', 'time', 'OK.']], f: ['time'] },
    time: { s: 'What time? We are fully booked at eight.', h: 'How about seven thirty?', o: [['seven|six|nine|half|thirty|[0-9]|earlier|later', 'name', "Seven thirty is fine."]], f: ['name', "I'll put you down for seven thirty."] },
    name: { s: 'And what name is it under?', h: "It's under the name Juan.", o: [['*', 'end', 'Great, all booked.']], f: ['end', 'All booked.'] },
  }),
  rp('38', {
    p: 'Una pizzería en Fremantle', w: ['Sophie', 'moza'],
    s: 'No entendés algunos platos del menú y querés saber qué llevan.',
    g: 'Preguntar qué lleva un plato, si tiene algo que no comés y qué te recomienda.',
    v: [['ingredients', 'ingredientes', 'ingrídients', 'What are the ingredients?'], ['to come with', 'venir con, traer', 'tu kam uiz', 'What does it come with?'], ['vegetarian', 'vegetariano', 'vechetérian', 'Is it vegetarian?'], ['to recommend', 'recomendar', 'tu rekoménd', 'What do you recommend?']],
    c: ["I'll put that through.", 'Enjoy your meal!'],
  }, {
    start: { s: 'Have you had a look at the menu?', h: "Yes. What's in the Aussie pizza?", a: 'Preguntá qué lleva un plato.', o: [['what|in|ingredients|come with|has|have', 'veg', 'It has ham, bacon, egg and cheese.']], f: ['veg', 'Any questions about the menu?'] },
    veg: { s: 'Anything else you want to know?', h: 'Is the pumpkin pizza vegetarian?', o: [['vegetarian|vegan|meat|gluten|cheese|onion|garlic', 'rec', "Yes, it's vegetarian."], ['recommend|best|popular|favourite|favorite', 'rec', 'The pumpkin one is our most popular.'], ["no|that's all|that is all", 'rec', 'No worries.']], f: ['rec'] },
    rec: { s: 'So what would you like?', h: "I'll have the pumpkin pizza, please.", o: [['pizza|have|like|take|pumpkin|aussie|margherita', 'end', 'Great choice.']], f: ['end', 'Take your time.'], x: [FX.want] },
  }),
  rp('39', {
    p: 'Un restaurante de comida rápida', w: ['Jake', 'empleado del mostrador'],
    s: 'Sos alérgico al maní (o no comés gluten) y tenés que avisarlo antes de pedir.',
    g: 'Explicar tu alergia y asegurarte de que la comida sea segura.',
    v: [['allergic to', 'alérgico a', 'alérjik tu', "I'm allergic to peanuts."], ['nuts / peanuts', 'frutos secos / maní', 'nats / pínats', 'Does it have nuts?'], ['gluten-free', 'sin gluten', 'glúten fri', 'Do you have gluten-free bread?'], ['to contain', 'contener', 'tu kontéin', 'Does this contain peanuts?']],
    c: ['Thanks for letting us know.', "We'll be careful with your order."],
  }, {
    start: { s: 'Hi, what can I get you?', h: "Hi. Before I order, I'm allergic to peanuts.", a: 'Avisá tu alergia antes de pedir.', o: [['allergic|allergy|peanut|peanuts|nuts|gluten|celiac|coeliac', 'safe', 'Thanks for telling me.']], f: ['safe', 'Do you have any allergies?'], x: [['\\bi have allergy\\b', "I'm allergic to… / I have an allergy to…", 'Se dice «I’m allergic to…» o «I have an allergy to…».']] },
    safe: { s: 'What would you like to order?', h: 'Does the chicken burger contain peanuts?', o: [['contain|have|peanut|nuts|burger|safe|chicken|gluten', 'order', "No, it doesn't. It's safe for you."]], f: ['order', 'The chicken burger has no nuts.'] },
    order: { s: 'So, the chicken burger?', h: 'Yes, the chicken burger and some chips, please.', o: [['yes|burger|chips|fries|please', 'end', 'No worries, I told the kitchen about your allergy.'], ['no|else|something', 'end', 'Sure, let me know when you are ready.']], f: ['end', "I'll tell the kitchen about your allergy."] },
  }),
  rp('40', {
    p: 'Un restaurante, al terminar de comer', w: ['Ruby', 'moza'],
    s: 'Terminaste de comer con tus amigos y quieren pagar por separado.',
    g: 'Pedir la cuenta, pagar por separado y dejar propina si querés.',
    v: [['the bill', 'la cuenta', 'de bil', 'Could we have the bill, please?'], ['to split the bill', 'dividir la cuenta', 'tu split de bil', 'Can we split the bill?'], ['separately', 'por separado', 'séparetli', "We'll pay separately."], ['tip', 'propina (no es obligatoria en Australia)', 'tip', 'Do you take tips?']],
    c: ['Thanks, have a great night!', 'Thanks for coming in!'],
  }, {
    start: { s: 'How was everything?', h: 'It was great, thanks. Could we have the bill, please?', a: 'Pedí la cuenta.', o: [['bill|check|pay|cheque', 'split', 'Sure.']], f: ['split', 'Would you like the bill?'], x: [['\\bthe account\\b', 'the bill', 'La cuenta del restaurante es «the bill» (account es una cuenta de banco).']] },
    split: { s: 'Is it all together or separately?', h: 'Separately, please. We want to split the bill.', o: [['separate|separately|split|each', 'card', 'No problem.'], ['together|all|one', 'card', 'Sure.']], f: ['card'] },
    card: { s: "That's thirty-two each. Card or cash?", h: 'Card, please. Can I add a tip?', o: [['tip|add', 'end', "That's very kind, thank you!"], ['card|cash|tap|phone', 'end', 'All done, thanks.']], f: ['end', 'You can tap here.'] },
  }),
  rp('41', {
    p: 'Un restaurante', w: ['Tom', 'mozo'],
    s: 'Te trajeron un plato que no pediste y además está frío.',
    g: 'Reclamar con educación y pedir una solución.',
    v: [["this isn't what I ordered", 'esto no es lo que pedí', 'dis ísent uót ai órderd', "Sorry, this isn't what I ordered."], ['cold', 'frío', 'kould', 'My food is cold.'], ['to replace', 'cambiar, reponer', 'tu ripléis', 'Could you replace it?'], ['to apologise', 'disculparse', 'tu apólochais', "We apologise for that."]],
    c: ['Sorry again. Enjoy your meal.', 'Thanks for your patience.'],
  }, {
    start: { s: 'Is everything OK with your meal?', h: "Sorry, this isn't what I ordered. I ordered the fish.", a: 'Decí con amabilidad que no es lo que pediste.', o: [['ordered|wrong|not|mistake|fish|order', 'cold', "Oh, I'm so sorry about that."]], f: ['cold', 'Is there a problem with your meal?'], x: [['\\bi ordered? the fish and (you|they) (bring|bringed|brought) me\\b', 'I ordered the fish, but this is the steak.', 'Más simple y amable: «I ordered the fish, but this is the steak.»']] },
    cold: { s: "I'll get you the fish. Is there anything else?", h: 'Also, the chips are cold.', o: [['cold|chips|fries|warm|also', 'end', "I'll bring fresh chips too, and the drinks are on us."], ["no|that's all|that is all|thanks|fine", 'end', 'Your fish will be out in five minutes.']], f: ['end', 'It will be out shortly.'] },
  }),
  rp('42', {
    p: 'Mostrador de un local de fish and chips', w: ['Gus', 'dueño del local'],
    s: 'Querés llevarte comida a la playa.',
    g: 'Pedir para llevar, preguntar cuánto tarda y pagar.',
    v: [['takeaway', 'para llevar', 'téik-auei', "It's takeaway."], ['fish and chips', 'pescado frito con papas fritas', 'fish and chips', "Two fish and chips, please."], ['salt', 'sal', 'solt', 'With salt?'], ['ten minutes', 'diez minutos', 'ten mínits', 'It takes about ten minutes.']],
    c: ['Enjoy your lunch!', 'There you go, enjoy!'],
  }, {
    start: { s: 'What can I get you, mate?', h: 'Two fish and chips to take away, please.', a: 'Pedí para llevar.', o: [['fish|chips|burger|calamari|takeaway|take away', 'salt', 'No worries.']], f: ['salt', 'Fish and chips?'], x: [FX.giveMe] },
    salt: { s: 'Salt and vinegar on the chips?', h: 'Just salt, please.', o: [['salt|vinegar|yes|no|both|just|plain', 'wait', 'Righto.']], f: ['wait'] },
    wait: { s: "That's twenty-four dollars.", h: 'Here you go. How long will it take?', o: [['how long|wait|minutes|time|ready', 'end', 'About ten minutes. Have a seat.'], ['card|cash|here|pay|tap', 'end', "Thanks. It'll be about ten minutes."]], f: ['end', 'About ten minutes.'], x: [FX.hereYouHave] },
  }),
  rp('43', {
    p: 'Un restaurante con mucha gente', w: ['Lily', 'moza'],
    s: 'Necesitás pedirle varias cosas a la moza durante la comida.',
    g: 'Pedir cosas con educación: más agua, una servilleta y si podés cambiar de mesa.',
    v: [['napkin / serviette', 'servilleta', 'nápkin / servi-ét', 'Could I have a napkin?'], ['excuse me', 'disculpe (para llamar la atención)', 'ixkiús mi', 'Excuse me!'], ['another', 'otro, otra', 'anáder', 'Could I have another water?'], ['to move', 'cambiarse (de lugar)', 'tu muv', 'Could we move to a table outside?']],
    c: ['Enjoy the rest of your night.', 'No worries at all.'],
  }, {
    start: { s: 'Yes? What can I get you?', h: 'Excuse me, could we have some more water, please?', a: 'Pedí algo con amabilidad.', o: [['water|napkin|serviette|bread|another|more|could|can', 'table', 'Of course.']], f: ['table', 'Do you need something?'], x: [FX.giveMe] },
    table: { s: 'Anything else?', h: 'Could we move to a table outside?', o: [['move|outside|table|change|window|another', 'end', 'Sure, that table by the window is free now.'], ["no|that's all|that is all|thanks", 'end', 'Just wave if you need me.']], f: ['end', 'Just let me know.'] },
  }),
  // 5. Compras y vida cotidiana
  rp('44', {
    p: 'Una tienda de ropa', w: ['Hannah', 'vendedora'],
    s: 'Necesitás una campera para el invierno y entrás a una tienda.',
    g: 'Decir qué buscás, el color y preguntar el precio.',
    v: [['jacket', 'campera', 'yáket', "I'm looking for a jacket."], ["I'm just looking", 'solo estoy mirando', 'aim yast lúking', "I'm just looking, thanks."], ['on sale', 'en oferta', 'on seil', 'Is this on sale?'], ['How much is it?', '¿Cuánto sale?', 'jau mach is it', 'How much is this jacket?']],
    c: ['Thanks for coming in!', 'Have a good day!'],
  }, {
    start: { s: 'Hi there! Can I help you find anything?', h: "Yes, I'm looking for a warm jacket.", a: 'Decí qué buscás.', o: [['looking|jacket|jumper|shirt|pants|jeans|shoes|coat', 'colour', 'Sure, follow me.'], ['just looking|only looking|thanks', 'colour', 'No worries. If you need anything, let me know.']], f: ['colour'] },
    colour: { s: 'What colour do you like?', h: 'Something dark, maybe black or navy.', o: [['black|navy|blue|grey|gray|green|dark|red|white|brown|colour|color', 'price', 'We have this one in black.']], f: ['price', 'This black one is popular.'] },
    price: { s: 'What do you think of this one?', h: 'I like it. How much is it?', o: [['how much|price|cost|sale', 'end', "It's ninety dollars, but it's twenty per cent off today."], ['like|nice|good|take', 'end', 'Great, the fitting rooms are just there.']], f: ['end', "It's on sale this week."] },
  }),
  rp('45', {
    p: 'Probadores de una tienda de ropa', w: ['Hannah', 'vendedora'],
    s: 'Te probaste un pantalón y te queda grande.',
    g: 'Decir cómo te queda y pedir otro talle.',
    v: [['fitting room', 'probador', 'fíting rum', 'Where are the fitting rooms?'], ['size', 'talle', 'sáis', 'Do you have a smaller size?'], ["it doesn't fit", 'no me entra / no me queda bien', 'it dásent fit', "It doesn't fit."], ['too big / too small', 'muy grande / muy chico', 'tu big / tu smol', "It's too big."]],
    c: ["I'll be just outside if you need me.", 'Let me know how it goes.'],
  }, {
    start: { s: 'How did the jeans go?', h: "They're too big. Do you have a smaller size?", a: 'Contá cómo te quedó y pedí otro talle.', o: [['big|small|tight|long|short|fit|size|smaller|bigger', 'size', "Sure. What size are those?"]], f: ['size', 'Do you need another size?'], x: [['\\bit (is|s) too big for me the size\\b', 'The size is too big.', 'Más simple: «They’re too big.»']] },
    size: { s: 'What size are those?', h: "They're a thirty-four. I need a thirty-two.", o: [['[0-9]|thirty|small|medium|large|size', 'try', "Here's a thirty-two."]], f: ['try', "Here's a smaller size."] },
    try: { s: 'Do you want to try them on?', h: "Yes, please. I'll try them on.", o: [['no|think|later', 'end', 'No worries.'], ['yes|try|please|ok|okay', 'end', 'The fitting room is free.']], f: ['end'] },
  }),
  rp('46', {
    p: 'Caja de una tienda', w: ['Chris', 'cajero'],
    s: 'Compraste unas zapatillas, pero te quedan chicas. Las vas a devolver.',
    g: 'Explicar el problema, mostrar el recibo y pedir un cambio o la devolución.',
    v: [['to return', 'devolver', 'tu ritérn', "I'd like to return these."], ['receipt', 'recibo, ticket', 'risít', 'Here is the receipt.'], ['refund', 'devolución del dinero', 'rífand', 'Can I get a refund?'], ['exchange', 'cambio', 'ixchéinch', 'Can I exchange them?']],
    c: ['Thanks, have a good day.', 'All sorted. Have a good one.'],
  }, {
    start: { s: 'Hi, how can I help?', h: "Hi, I'd like to return these shoes. They're too small.", a: 'Decí qué querés devolver y por qué.', o: [['return|back|small|big|fit|wrong|broken|exchange|refund', 'receipt', 'No problem.']], f: ['receipt', 'Do you want to return something?'] },
    receipt: { s: 'Do you have the receipt?', h: 'Yes, here is the receipt.', o: [['yes|here|receipt', 'what', 'Thanks.'], ['no|lost|do not', 'what', "That's OK, I can find it with your card."]], f: ['what'], x: [FX.hereYouHave] },
    what: { s: 'Would you like a refund or an exchange?', h: "I'd like to exchange them for a bigger size.", o: [['exchange|change|bigger|another|size', 'end', 'Sure, here is the next size up.'], ['refund|money|back', 'end', "No worries, the refund will be on your card in a few days."]], f: ['end', "I'll give you a refund."] },
  }),
  rp('47', {
    p: 'Un supermercado', w: ['Nina', 'cajera'],
    s: 'Llegás a la caja con tus compras.',
    g: 'Responder lo que pregunta la cajera, pedir bolsas y pagar.',
    v: [['bag', 'bolsa', 'bag', 'Do you need a bag?'], ['loyalty card', 'tarjeta de puntos', 'lóialti card', 'Do you have a loyalty card?'], ['receipt', 'ticket', 'risít', 'Do you want the receipt?'], ['tap', 'pagar apoyando la tarjeta', 'tap', 'You can tap your card.']],
    c: ['Have a good one!', 'Thanks, see you!'],
  }, {
    start: { s: 'Hi! How are you today?', h: "Good, thanks. How are you?", o: [['good|fine|great|well|thanks|how are you|not bad', 'bags', "I'm good, thanks for asking."]], f: ['bags'] },
    bags: { s: 'Do you need any bags? They are twenty cents.', h: 'Yes, two bags, please.', o: [['yes|two|one|bag|bags|please', 'card', 'No worries.'], ['no|have|my own', 'card', 'Great.']], f: ['card'] },
    card: { s: 'Have you got a loyalty card?', h: "No, I don't. Card payment, please.", o: [['no|do not|card|pay|tap|cash', 'end', "That's thirty-seven fifty. Just tap when you're ready."], ['yes|have', 'end', "Great, just scan it there."]], f: ['end', 'Just tap when ready.'], x: [FX.noHave] },
  }),
  rp('48', {
    p: 'Un supermercado grande', w: ['Ahmed', 'repositor'],
    s: 'No encontrás algunas cosas en el súper.',
    g: 'Preguntar dónde están los productos y entender las indicaciones.',
    v: [['aisle', 'pasillo (se pronuncia «ail»)', 'ail', "It's in aisle five."], ['at the end', 'al fondo', 'at di end', "It's at the end of the aisle."], ['top shelf', 'estante de arriba', 'top shelf', "It's on the top shelf."], ['out of stock', 'agotado', 'aut ov stok', "Sorry, it's out of stock."]],
    c: ['No worries, enjoy your shopping.', 'Happy to help!'],
  }, {
    start: { s: 'Can I help you find something?', h: 'Yes, please. Where can I find the rice?', a: 'Preguntá dónde está algo.', o: [['where|find|rice|milk|bread|coffee|pasta|eggs|looking', 'next', "It's in aisle five, on the left."]], f: ['next', "Most things are signed above the aisles."] },
    next: { s: 'Anything else?', h: 'Do you have yerba mate?', o: [['yerba|mate|tea|coffee|have|sell', 'end', "Yes, in the international aisle, aisle nine, top shelf."], ["no|that's all|that is all|thanks", 'end', 'No worries.']], f: ['end', 'Check aisle nine, the international foods.'] },
  }),
  rp('49', {
    p: 'Un supermercado', w: ['Nina', 'empleada'],
    s: 'Ves dos ofertas y no entendés cuál conviene.',
    g: 'Preguntar por las ofertas y elegir la más barata.',
    v: [['special / on special', 'oferta / en oferta', 'spéshal', "It's on special this week."], ['two for one', 'dos por uno', 'tu for uán', "It's two for one."], ['per kilo', 'por kilo', 'per kílo', "It's five dollars per kilo."], ['cheaper', 'más barato', 'chíper', 'Which one is cheaper?']],
    c: ['Happy shopping!', 'No worries at all.'],
  }, {
    start: { s: 'Need a hand?', h: 'Yes. Which one is cheaper, this one or that one?', a: 'Preguntá cuál conviene.', o: [['which|cheaper|price|better|deal|special|cost', 'deal', 'The big one is cheaper per kilo.']], f: ['deal', 'Let me check.'] },
    deal: { s: 'Also, the coffee is two for one this week.', h: "Great, I'll take two. Is the bread on special too?", o: [['take|bread|special|yes|great|two', 'end', "The bread is half price after six."], ['no|ok|okay|thanks', 'end', 'No worries.']], f: ['end', 'No worries.'] },
  }),
  rp('50', {
    p: 'Una tienda de electrónica', w: ['Kevin', 'vendedor'],
    s: 'Se te rompió el celular y necesitás uno nuevo, sin gastar mucho.',
    g: 'Decir tu presupuesto, preguntar por la batería y la garantía, y decidir.',
    v: [['budget', 'presupuesto', 'báyet', 'My budget is three hundred.'], ['battery life', 'duración de la batería', 'báteri laif', "How's the battery life?"], ['warranty', 'garantía', 'uórranti', 'Does it have a warranty?'], ['storage', 'almacenamiento', 'stórach', 'How much storage does it have?']],
    c: ['Thanks for coming in.', 'Enjoy your new phone!'],
  }, {
    start: { s: 'Hi, can I help you with anything?', h: "Yes, I need a new phone. My budget is about three hundred dollars.", a: 'Decí qué buscás y tu presupuesto.', o: [['phone|budget|dollars|[0-9]|hundred|cheap|need', 'battery', "This one is two ninety-nine. It's very popular."]], f: ['battery', 'This one is good value.'] },
    battery: { s: 'Any questions about it?', h: "How's the battery life?", o: [['battery|charge|last|storage|camera|memory', 'warranty', 'The battery lasts two days.'], ['warranty|guarantee', 'warranty', 'It has a one-year warranty.']], f: ['warranty'] },
    warranty: { s: 'It also comes with a one-year warranty. What do you think?', h: "Sounds good. I'll take it.", o: [['think|not sure|other|cheaper|later', 'end', 'No worries, have a look around.'], ["take|buy|i'll|i will|good|yes|ok|okay", 'end', 'Great choice.']], f: ['end', 'Take your time.'] },
  }),
  rp('51', {
    p: 'Una farmacia (chemist)', w: ['Pat', 'farmacéutica'],
    s: 'Tenés dolor de garganta y querés algo sin receta.',
    g: 'Explicar los síntomas, preguntar cómo se toma y pagar.',
    v: [['sore throat', 'dolor de garganta', 'sor zróut', 'I have a sore throat.'], ['prescription', 'receta', 'preskrípshon', 'Do I need a prescription?'], ['twice a day', 'dos veces por día', 'tuáis a dei', 'Take it twice a day.'], ['chemist', 'farmacia (en Australia)', 'kémist', "I'm going to the chemist."]],
    c: ['Hope you feel better soon!', 'Get well soon.'],
  }, {
    start: { s: 'Hi, how can I help?', h: "Hi, I have a sore throat. What can I take?", a: 'Contá qué te pasa.', o: [['sore|throat|cold|cough|headache|fever|sick|pain|hurts', 'how', "These lozenges are good for that."]], f: ['how', 'What symptoms do you have?'], x: [['\\bi have pain of\\b', 'My … hurts / I have a sore …', 'Se dice «I have a sore throat» o «My throat hurts».']] },
    how: { s: 'Have you had a fever?', h: 'No, just a sore throat. How do I take them?', o: [['no|yes|just|fever|how|take', 'end', 'One every three hours, no more than eight a day. If it gets worse, see a doctor.']], f: ['end', 'One every three hours.'] },
  }),
  rp('52', {
    p: 'Una peluquería (barber)', w: ['Nick', 'peluquero'],
    s: 'Te vas a cortar el pelo y tenés que explicar cómo lo querés.',
    g: 'Explicar el corte: corto a los costados, cuánto arriba, y si querés la barba.',
    v: [['short on the sides', 'corto a los costados', 'short on de sáids', 'Short on the sides, please.'], ['a bit off the top', 'un poco arriba', 'a bit of de top', 'Just a bit off the top.'], ['number two', 'máquina número dos', 'námber tu', 'A number two on the sides.'], ['beard', 'barba', 'bíerd', 'Can you trim my beard?']],
    c: ['There you go, looking sharp!', 'All done. See you next time.'],
  }, {
    start: { s: "G'day, what are we doing today?", h: 'Hi. Short on the sides and a bit off the top, please.', a: 'Explicá el corte.', o: [['short|sides|top|trim|cut|number|bit|long', 'sides', 'No worries.']], f: ['sides', "I'll keep it simple then."] },
    sides: { s: 'What number on the sides?', h: 'A number two, please.', o: [['[0-9]|one|two|three|four|number|scissors', 'beard', 'Easy.']], f: ['beard', "I'll do a number two."] },
    beard: { s: 'Do you want me to tidy up the beard too?', h: 'Yes, just a trim, please.', o: [['no|leave', 'end', 'No worries.'], ['yes|trim|beard|please|short', 'end', 'Done.']], f: ['end'] },
  }),
  rp('53', {
    p: 'Consultorio de un médico de cabecera (GP)', w: ['Dr Patel', 'médica'],
    s: 'Hace tres días que te duele la espalda después de trabajar cargando cajas.',
    g: 'Explicar el dolor, cuándo empezó y qué hiciste.',
    v: [['backache / my back hurts', 'dolor de espalda / me duele la espalda', 'bákeik', 'My back hurts.'], ['since', 'desde', 'sins', 'Since Monday.'], ['to lift', 'levantar (peso)', 'tu lift', 'I lifted heavy boxes.'], ['painkillers', 'calmantes', 'péinkilers', 'You can take painkillers.']],
    c: ['Take care, and come back if it gets worse.', 'Look after yourself.'],
  }, {
    start: { s: 'Hi, come in. What brings you in today?', h: 'Hi, doctor. My back hurts a lot.', a: 'Contá qué te pasa.', o: [['back|pain|hurts|ache|sore|neck|shoulder', 'when', "I'm sorry to hear that."]], f: ['when', 'What seems to be the problem?'], x: [['\\bi have pain in my back since\\b', "My back has hurt since… / My back has been hurting for…", 'Para algo que empezó antes y sigue: present perfect (has hurt / has been hurting).']] },
    when: { s: 'When did it start?', h: 'Three days ago. I lifted heavy boxes at work.', o: [['ago|days|yesterday|monday|week|started|since|lifted|work', 'adv', "OK, it sounds like a muscle strain."]], f: ['adv'] },
    adv: { s: "Rest for a few days and take painkillers if you need. Any questions?", h: 'Can I go to work tomorrow?', o: [['work|tomorrow|job|certificate', 'end', "I'll give you a medical certificate for two days."], ["no|that's all|that is all|thanks", 'end', 'Take care.']], f: ['end', 'Rest for a couple of days.'] },
  }),
  rp('54', {
    p: 'Recepción de un dentista', w: ['Amy', 'recepcionista'],
    s: 'Te duele una muela y querés un turno lo antes posible.',
    g: 'Explicar el dolor, pedir turno urgente y preguntar el costo.',
    v: [['toothache', 'dolor de muela', 'túzeik', 'I have a toothache.'], ['appointment', 'turno', 'apóintment', 'I need an appointment.'], ['as soon as possible', 'lo antes posible', 'as sun as pósibol', 'As soon as possible, please.'], ['check-up', 'control', 'chek ap', 'How much is a check-up?']],
    c: ["See you then. Hope it eases up.", 'See you soon.'],
  }, {
    start: { s: 'Good morning, Smile Dental.', h: 'Hi, I have a toothache. I need an appointment as soon as possible.', a: 'Pedí un turno urgente.', o: [['toothache|tooth|pain|hurts|appointment|soon|urgent|emergency', 'time', "Oh no. Let me see what we have."]], f: ['time', 'Do you need an appointment?'] },
    time: { s: 'We have a cancellation at two this afternoon. Can you make it?', h: 'Yes, two is fine.', o: [["can not|cannot|work|busy|later|tomorrow|another", 'cost', "Then tomorrow at nine is the next one. I'll book you in."], ['yes|fine|ok|okay|two|great|perfect', 'cost', "Great, you're booked in for two."]], f: ['cost'] },
    cost: { s: 'Anything else?', h: 'How much does it cost?', o: [['how much|cost|price|pay', 'end', "The first appointment is a hundred and twenty dollars."], ["no|that's all|that is all", 'end', 'No worries.']], f: ['end', 'The dentist will explain the costs.'] },
  }),
  rp('55', {
    p: 'Una oficina de correo (Australia Post)', w: ['Ray', 'empleado del correo'],
    s: 'Querés mandarle un paquete chico a tu familia en Uruguay.',
    g: 'Decir qué mandás y a dónde, elegir el envío y declarar el contenido.',
    v: [['parcel', 'paquete', 'pársel', "I'd like to send this parcel."], ['express / standard', 'rápido / común', 'ixprés / stándard', 'Standard is fine.'], ['customs form', 'formulario de aduana', 'kástoms form', 'Fill in the customs form.'], ['tracking number', 'número de seguimiento', 'tráking námber', "Here's your tracking number."]],
    c: ['There you go. Have a good day!', 'All done. Thanks!'],
  }, {
    start: { s: "Next, please! What can I do for you?", h: "Hi, I'd like to send this parcel to Uruguay.", a: 'Decí qué querés mandar y a dónde.', o: [['send|parcel|package|post|uruguay|overseas|letter', 'how', "Sure, let me weigh it."]], f: ['how', 'Do you want to send something?'] },
    how: { s: "It's forty dollars standard, or seventy express. Which one?", h: 'Standard is fine, thanks.', o: [['standard|cheap|cheaper|forty|normal|first', 'form', 'No worries.'], ['express|fast|faster|seventy|second', 'form', 'Express it is.'], ['how long|days|weeks', 'form', "Standard takes about three weeks. I'll send it standard."]], f: ['form'] },
    form: { s: "What's inside?", h: 'Some clothes and chocolates for my family.', o: [['clothes|chocolate|chocolates|gift|gifts|presents|books|food|souvenirs', 'end', "Great. Here's your tracking number."]], f: ['end', 'Just write it on the customs form.'] },
  }),
];
