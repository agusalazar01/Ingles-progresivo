/**
 * Llamadas con Oliver: charlas cortas de roleplay (como hablar con alguien de Australia) que usan
 * la gramática y el vocabulario de cada unidad. Son guiones precargados con ramas: la app compara lo
 * que decís (reconocimiento de voz del teléfono) con lo que espera en cada turno. Sin IA en el celular.
 *
 * Formato:
 *  - o(texto): habla Oliver.
 *  - u(modelo, ramas, consejo): te toca. `modelo` es una respuesta posible (la pista 💡).
 *    Cada rama `b(patrones, respuesta?, elogio)` coincide si aparecen TODOS sus patrones; un patrón
 *    puede tener alternativas separadas por «|». «-ing» = alguna palabra que termine en -ing;
 *    «[0-9]» = algún número; «*» = cualquier cosa. Si ninguna coincide, Oliver pide que repitas y,
 *    al segundo intento, sigue igual y en el repaso aparece el consejo.
 */

export interface Branch {
  match: string[];
  reply?: string;
  praise: string;
}
export interface UserTurn {
  model: string;
  branches: Branch[];
  tip: string;
}
export type Turn = { o: string } | { u: UserTurn };

export interface CallScript {
  id: string;
  unitId: string;
  title: string;
  scene: string;
  goal: string;
  turns: Turn[];
}

const o = (text: string): Turn => ({ o: text });
const b = (match: string[], reply: string | undefined, praise: string): Branch => ({ match, reply, praise });
const u = (model: string, branches: Branch[], tip: string): Turn => ({ u: { model, branches, tip } });

/** Despedida: en todas las llamadas hay que despedirse. */
const BYE = u(
  'Bye, Oliver! See you.',
  [b(['bye|see you|see ya|catch you|cheers|later|take care|good night|have a good'], undefined, 'Te despediste bien.')],
  'No te olvides de despedirte: «Bye!», «See you!» o «Cheers, mate!».',
);
/** Cualquier respuesta (para turnos de charla). */
const ANY = '*';

const scripts: CallScript[] = [];
let n = 0;
function call(unitId: string, title: string, scene: string, goal: string, turns: Turn[]) {
  scripts.push({ id: `${unitId}-${++n}`, unitId, title, scene, goal, turns: [...turns, BYE] });
}

// ───────────── Lo básico ─────────────

call('to-be', 'Conociendo a Oliver', 'Primera llamada', 'Presentate con to be: nombre, de dónde sos, edad y cómo estás.', [
  o("G'day! I'm Oliver. I'm from Adelaide. What's your name?"),
  u("I'm Agustín.", [b(['i am|my name is|name is|it is|i m'], 'Nice to meet you!', 'Usaste bien «I am» / «My name is».')], 'Para decir tu nombre: «I am …» o «My name is …».'),
  o('Where are you from?'),
  u("I'm from Uruguay.", [b(['from'], 'Uruguay! Awesome. I love asado.', 'Bien: «I am from …».')], 'Para decir de dónde sos: «I am from Uruguay».'),
  o("How old are you, if you don't mind me asking?"),
  u("I'm 27 years old.", [b(['am|is|i m', '[0-9]|twenty|thirty|forty|nineteen|eighteen|years'], 'Too easy.', 'Bien: la edad va con to be (I am 27), no con have.')], 'La edad va con to be: «I am 27» (no «I have 27»).'),
  o('And how are you today?'),
  u("I'm good, thanks. And you?", [b(['am|good|great|fine|well|tired|not bad|okay|ok'], "I'm good too, cheers.", 'Bien: «I am good / tired».')], 'Para decir cómo estás: «I am good, thanks» o «I am a bit tired».'),
]);

call('to-be', 'En el hostel', 'Recepción de un hostel en Sydney', 'Contestá preguntas con is / are y negativas.', [
  o("Hi there, welcome to the hostel. Are you here for the night?"),
  u("Yes, I am.", [b(['yes|yeah|yep|i am'], 'Beauty.', 'Bien: respuesta corta «Yes, I am».'), b(['no|not'], 'Ah, two nights then? No worries.', 'Bien: usaste la negativa.')], 'Respuesta corta: «Yes, I am» o «No, I am not».'),
  o('Is this your first time in Australia?'),
  u('Yes, it is my first time here.', [b(['it is|yes|no|it s|first'], 'Exciting!', 'Bien: «Yes, it is».')], 'Con «Is this…?» se responde «Yes, it is» / «No, it is not».'),
  o('Are you tired after the flight?'),
  u("Yes, I'm very tired.", [b(['am|tired|not|yes|no'], "I reckon. The room is upstairs.", 'Bien: «I am (very) tired».')], 'Para contestar: «Yes, I am very tired» o «No, I am not tired».'),
  o('Your friends are in room twelve. Are they from Uruguay too?'),
  u('Yes, they are from Uruguay.', [b(['they are|they re|yes|no|from'], 'Good on ya.', 'Bien: con they va «are».')], 'Con they va are: «Yes, they are» / «They are from …».'),
]);

call('pronouns', 'La familia', 'Charla después del laburo', 'Hablá de tu familia con my, his, her, their.', [
  o("Mate, tell me about your family. Have you got brothers or sisters?"),
  u('I have a sister. Her name is Ana.', [b(['her|his|my'], 'Lovely.', 'Bien: usaste los posesivos (her name, his name).')], 'Para el nombre de tu hermana: «Her name is …»; de tu hermano: «His name is …».'),
  o('What does your mum do?'),
  u('My mum is a teacher.', [b(['my mum|my mom|my mother|she'], 'Good on her.', 'Bien: «My mum is …».')], 'Usá my: «My mum is a teacher».'),
  o('And your parents, where do they live?'),
  u('They live in Montevideo. Their house is near the rambla.', [b(['they|their'], 'Sounds beautiful.', 'Bien: «They live…», «Their house…».')], 'Con los padres: «They live in …», «Their house is …».'),
  o("My sister's name is Kylie. Do you want to meet her?"),
  u("Yes, I'd like to meet her.", [b(['her|yes|sure|love to'], "Too easy, I'll bring her to the barbie.", 'Bien: después del verbo va «her» (meet her).')], 'Después del verbo va el pronombre objeto: «meet her», «meet him».'),
]);

call('pronouns', '¿De quién es?', 'Ordenando la casa compartida después de un asado', "Decí de quién es cada cosa: mine, yours, his, Ana's.", [
  o("Whose hat is this? Is it yours?"),
  u("Yes, it's mine.", [b(['mine|my|yours|his|her|not'], 'Here you go.', 'Bien: usaste un posesivo.')], 'Para decir que es tuyo: «It is mine» o «It is my hat».'),
  o('And this water bottle? Is it Jake\'s?'),
  u("No, it's not his. It's Ana's.", [b(['his|her|s|not|ana|jake'], 'Righto.', 'Bien: usaste his / \'s.')], "Para «de Ana»: «It is Ana's». Para «de él»: «It is his»."),
  o('Can you give me those sunnies, please?'),
  u('Sure, here are your sunnies.', [b(['your|them|here|sure|yes'], 'Cheers.', 'Bien: «your sunnies», «give them to you».')], 'Podés decir: «Sure, here are your sunnies».'),
]);

call('articles-plurals', 'En la feria', 'Puesto de frutas en un mercado de Melbourne', 'Pedí cosas con a / an / some y plurales.', [
  o("Morning! What can I get you?"),
  u('Can I have an apple and two bananas, please?', [b(['an apple|an orange|an avocado|a |two|three|some|bananas|apples'], 'No worries.', 'Bien: usaste a / an y plurales.')], 'Con vocal va an: «an apple»; plural con -s: «two bananas».'),
  o('Anything else? The mangoes are great today.'),
  u('Yes, three mangoes, please.', [b(['mangoes|mangos|tomatoes|potatoes|some|kilo'], 'Beauty.', 'Bien: plural de mango → mangoes.')], 'Plural: «three mangoes», «some tomatoes».'),
  o('Do you need a bag?'),
  u("Yes, a bag, please.", [b(['bag|yes|no|thanks'], "Here you go. That's twelve dollars.", 'Bien: «a bag».')], 'Podés decir: «Yes, a bag, please» o «No, thanks».'),
]);

call('articles-plurals', 'Los compañeros de trabajo', 'Primer día en un trabajo nuevo', 'Hablá de las personas del equipo con plurales irregulares.', [
  o('How many people work in your team?'),
  u('There are ten people in my team.', [b(['people|men|women|workers'], 'Big team!', 'Bien: el plural de person es people.')], 'Plural de person: people. «There are ten people».'),
  o('Are there any women in the team?'),
  u('Yes, there are three women.', [b(['women|woman|girls|no|yes'], 'Nice.', 'Bien: woman → women.')], 'Plural irregular: one woman, two women.'),
  o('Have you got children?'),
  u("No, I haven't got children.", [b(['children|kids|child|no|yes'], 'Fair enough.', 'Bien: child → children.')], 'Plural irregular: one child, two children.'),
]);

call('there-is', 'Tu barrio', 'Charla en el ute', 'Describí tu barrio con there is / there are.', [
  o("What's your neighbourhood like back home?"),
  u('There is a big park and there are some cafés.', [b(['there is|there are|there s'], 'Sounds good.', 'Bien: usaste there is / there are.')], 'Para «hay»: «There is a park», «There are some cafés».'),
  o('Is there a beach near your house?'),
  u("Yes, there is. It's ten minutes away.", [b(['there is|there isn|yes|no|there s'], 'Lucky you.', 'Bien: «Yes, there is».')], 'Respuesta corta: «Yes, there is» / «No, there is not».'),
  o('Are there any good restaurants?'),
  u('Yes, there are a lot of parrillas.', [b(['there are|there aren|yes|no|lot'], "I'd love to try one.", 'Bien: con plural va «there are».')], 'Con plural: «There are a lot of restaurants».'),
]);

call('there-is', 'La habitación del hostel', 'Te muestran tu cuarto', 'Preguntá qué hay con Is there…? / Are there…?', [
  o("This is your room. Any questions?"),
  u('Is there wifi in the room?', [b(['is there|are there'], "Yeah, there is, but it's a bit slow.", 'Bien: preguntaste con «Is there…?».')], 'Para preguntar si hay algo: «Is there wifi?», «Are there towels?».'),
  o('Anything else you need to know?'),
  u('Are there any shops near here?', [b(['is there|are there'], "There's a servo ten minutes down the road.", 'Bien: «Are there any…?».')], 'Con plural: «Are there any shops near here?».'),
  o("There's a kitchen downstairs. There isn't a microwave, sorry."),
  u("No worries. Is there a fridge?", [b(['is there|are there|no worries|ok|fine'], 'Yep, a big one.', 'Bien.')], 'Podés preguntar: «Is there a fridge?».'),
]);

call('questions', 'Preguntas sobre un trabajo', 'Llamada por un aviso de trabajo en un café', 'Hacé preguntas con where, when, what, how much.', [
  o("Hi, it's Oliver from the café. Have you got any questions about the job?"),
  u('Yes. When does the job start?', [b(['when|what time|what day'], 'It starts next Monday.', 'Bien: preguntaste con «When does…?».')], 'Para preguntar cuándo: «When does the job start?».'),
  o('Anything else?'),
  u('How much do you pay per hour?', [b(['how much|pay|money|salary|per hour'], 'About thirty bucks an hour.', 'Bien: «How much do you pay…?».')], 'Para preguntar cuánto pagan: «How much do you pay per hour?».'),
  o('Any other questions?'),
  u('Where is the café?', [b(['where|address|location'], "It's on the main street, near the station.", 'Bien: «Where is…?».')], 'Para preguntar dónde: «Where is the café?».'),
  o('Good questions. What do you want to know about the hours?'),
  u('What time do we start?', [b(['what time|when|how many hours|how long'], 'Seven in the morning, mate.', 'Bien: «What time do we start?».')], 'Para la hora: «What time do we start?».'),
]);

call('questions', 'Conociendo a alguien', 'En un asado (barbie) en la playa', 'Hacele preguntas a Oliver: do you…?, where…?, what…?', [
  o("G'day! I'm Oliver. Ask me anything, mate."),
  u('Where do you live?', [b(['where|what|do you|are you|how'], 'I live in Adelaide, near the beach.', 'Bien: hiciste una pregunta con do/does o to be.')], 'Por ejemplo: «Where do you live?».'),
  o("Ask me something else."),
  u('What do you do?', [b(['what do you|do you|what is your|are you'], 'I fix bikes at a shop. I love it.', 'Bien: «What do you do?» = ¿a qué te dedicás?')], 'Para el trabajo: «What do you do?».'),
  o('Go on, one more.'),
  u('Do you like football?', [b(['do you|are you|have you|can you'], 'I prefer footy, mate. Aussie rules.', 'Bien: pregunta con «Do you…?».')], 'Pregunta de sí o no: «Do you like football?».'),
]);

call('prep-time-place', 'Armando un plan', 'Combinando para salir', 'Usá in / on / at para horas, días y lugares.', [
  o("Let's catch up this week. Are you free on Friday?"),
  u("Yes, I'm free on Friday.", [b(['on friday|on saturday|on sunday|on monday|on tuesday|on wednesday|on thursday|yes|no'], 'Ripper.', 'Bien: con días va «on».')], 'Con días va on: «on Friday».'),
  o('What time?'),
  u('At seven in the evening.', [b(['at'], "Seven's good.", 'Bien: con la hora va «at».')], 'Con la hora va at: «at seven».'),
  o('Where do you want to meet?'),
  u("Let's meet at the café on the corner.", [b(['at|in|on'], 'Perfect. See you there.', 'Bien: usaste una preposición de lugar.')], 'Lugar puntual: «at the café», «at the station».'),
  o('And when is your birthday, by the way?'),
  u("It's in December, on the 26th.", [b(['in|on'], "A Christmas baby! We'll have a barbie.", 'Bien: in con meses, on con fechas.')], 'Mes con in: «in December»; fecha con on: «on the 26th».'),
]);

call('prep-time-place', '¿Dónde está?', 'Buscando cosas en casa', 'Decí dónde están las cosas: in, on, under, next to.', [
  o("Mate, I can't find my keys. Have you seen them?"),
  u("They're on the table.", [b(['on|in|under|next to|near|behind'], 'Got them, cheers.', 'Bien: usaste una preposición de lugar.')], 'Sobre algo: «on the table»; adentro: «in the bag».'),
  o('And where is my phone charger?'),
  u('It is in the drawer.', [b(['in|on|next to|behind|near|under'], 'Good.', 'Bien: «in the drawer».')], 'Adentro de algo: «in the drawer».'),
  o('Where do you usually have lunch?'),
  u('I have lunch at work.', [b(['at|in|on'], 'Me too.', 'Bien: «at work», «at home».')], 'Con work y home va at: «at work», «at home».'),
]);

// ───────────── Presente ─────────────

call('pres-simple', 'Tu rutina', 'Charla en el descanso (smoko)', 'Contá tu rutina con el presente simple.', [
  o("So, what's a normal day like for you?"),
  u('I get up at six and I have breakfast.', [b(['i get up|i wake up|i have|i go|i work|i start'], 'Early bird!', 'Bien: presente simple para la rutina.')], 'Rutina: «I get up at six», «I have breakfast».'),
  o('What does your boss do in the morning?'),
  u('He checks his emails.', [b(['he|she', '-s'], 'Sounds about right.', 'Bien: con he/she el verbo lleva -s.')], 'Con he/she el verbo lleva -s: «He checks», «She works».'),
  o('Do you drink coffee or mate?'),
  u('I drink mate every day.', [b(['i drink|i have|i love|i like|i prefer|i don'], 'Ha, typical Uruguayan!', 'Bien: «I drink mate every day».')], 'Algo que hacés siempre: «I drink mate every day».'),
  o("What don't you like about your job?"),
  u("I don't like the early mornings.", [b(['don t|do not|doesn t|does not|i hate|not'], 'Fair enough.', 'Bien: negativa con don\'t.')], 'Negativa: «I do not like …» (don\'t).'),
]);

call('pres-simple', 'El fin de semana', 'Charla en el ute', 'Contá qué hacés los fines de semana y qué hace tu familia.', [
  o('What do you usually do on weekends?'),
  u('I usually play football with my friends.', [b(['i play|i go|i watch|i visit|i meet|i usually|i often|i sometimes|i stay'], 'Nice.', 'Bien: presente simple con un adverbio de frecuencia.')], 'Por ejemplo: «I usually play football».'),
  o('Does your brother play too?'),
  u("No, he doesn't. He prefers basketball.", [b(['doesn t|does not|he plays|he prefers|he likes|yes he does|no he'], 'Each to their own.', 'Bien: respuesta con does / doesn\'t.')], 'Con he: «Yes, he does» / «No, he does not».'),
  o('How often do you go to the beach?'),
  u('I go to the beach every summer.', [b(['every|always|often|sometimes|never|once|twice|usually'], "Here we go every arvo in summer.", 'Bien: usaste una expresión de frecuencia.')], 'Frecuencia: «every summer», «twice a week», «sometimes».'),
]);

call('pres-cont', '¿Qué estás haciendo?', 'Oliver te llama al celular', 'Contá qué está pasando ahora con el presente continuo.', [
  o("Hey mate, what are you doing right now?"),
  u("I'm cooking dinner.", [b(['am|i m|are|is', '-ing'], 'Smells good from here!', 'Bien: am + verbo con -ing.')], 'Para algo de ahora: «I am cooking».'),
  o("What's the weather doing there?"),
  u("It's raining.", [b(['is|it s', '-ing'], "Here it's sunny, sorry!", 'Bien: «It is raining».')], 'El clima ahora: «It is raining», «The sun is shining».'),
  o('Are your friends watching the game?'),
  u("Yes, they're watching it on TV.", [b(['are|they re|aren t|not', '-ing'], 'Who is winning?', 'Bien: «They are watching».')], 'Con they: «They are watching».'),
  o('What are you studying these days?'),
  u("I'm studying English for my trip.", [b(['am|i m', '-ing'], 'Good on ya.', 'Bien: presente continuo para algo de estos días.')], 'Algo de estos días: «I am studying English».'),
]);

call('pres-cont', 'Mirando por la ventana', 'Llamada mientras esperás el ómnibus', 'Describí lo que ves que está pasando.', [
  o("Where are you? What's happening around you?"),
  u("I'm waiting for the bus.", [b(['am|i m', '-ing'], 'Is it late?', 'Bien: «I am waiting».')], 'Ahora mismo: «I am waiting for the bus».'),
  o('What are the people doing there?'),
  u('Some people are drinking mate and a man is reading.', [b(['are|is', '-ing'], 'Typical Montevideo, eh?', 'Bien: «are drinking», «is reading».')], 'Varias personas: «are + -ing»; una: «is + -ing».'),
  o("Is it getting cold?"),
  u("Yes, it's getting cold.", [b(['is|it s|isn t|not', '-ing'], 'Grab a jumper.', 'Bien.')], 'Para algo que cambia: «It is getting cold».'),
]);

call('can', '¿Qué sabés hacer?', 'Entrevista para un trabajo de verano', 'Hablá de tus habilidades con can / can\'t.', [
  o('Can you drive a manual car?'),
  u("No, I can't, but I can learn.", [b(['can|can t|can not'], "No worries, we'll teach you.", 'Bien: can / can\'t + verbo sin to.')], 'Con can el verbo va sin to: «I can drive», «I can not drive».'),
  o('Can you speak Spanish?'),
  u('Yes, I can. It is my first language.', [b(['can|yes|of course'], "Ripper, we've got Spanish backpackers.", 'Bien: «Yes, I can».')], 'Respuesta corta: «Yes, I can» / «No, I can not».'),
  o('What else can you do?'),
  u('I can cook and I can fix things.', [b(['i can'], 'Handy!', 'Bien: «I can cook».')], 'Habilidades: «I can cook», «I can fix things».'),
  o('Can you start next Monday?'),
  u('Yes, I can start on Monday.', [b(['can|yes|no'], 'Too easy.', 'Bien.')], 'Podés decir: «Yes, I can start on Monday».'),
]);

call('can', 'Pidiendo favores', 'En la casa compartida', 'Pedí y ofrecé ayuda con Can you…? / Can I…?', [
  o("Mate, I'm making a barbie tonight."),
  u('Can I help you?', [b(['can i|can you|could i|could you'], 'Yeah, you can bring the snags.', 'Bien: ofreciste ayuda con «Can I…?».')], 'Para ofrecer ayuda: «Can I help you?».'),
  o('Can you pick up some ice on the way?'),
  u('Yes, I can. Can you send me the address?', [b(['can|yes|sure'], "I'll text it to you.", 'Bien.')], 'Para pedir algo: «Can you send me the address?».'),
  o("Can you bring your friend too?"),
  u("Sure, she can come.", [b(['can|sure|yes|no'], 'Beauty.', 'Bien: «She can come».')], 'Con she el can no cambia: «She can come».'),
]);

call('vocab-daily', 'Un día en tu vida', 'Charla tranquila', 'Contá tu día con vocabulario de rutina.', [
  o('What time do you get up on a work day?'),
  u('I usually get up at six.', [b(['get up|wake up'], 'Early!', 'Bien: «get up» = levantarse.')], 'Levantarse: «get up».'),
  o('Do you have breakfast at home?'),
  u('Yes, I have breakfast at home.', [b(['have breakfast|have brekkie|eat|breakfast|brekkie'], 'Good, brekkie is important.', 'Bien: desayunar = have breakfast.')], 'Desayunar = «have breakfast».'),
  o('How do you get to work?'),
  u('I catch the bus.', [b(['bus|car|walk|ride|drive|bike|train|catch|take'], 'Right.', 'Bien.')], 'Por ejemplo: «I catch the bus» o «I walk to work».'),
  o('What do you do in the evening?'),
  u('I have dinner and go to bed early.', [b(['dinner|go to bed|watch|read|relax|cook|shower'], 'Sounds relaxing.', 'Bien: vocabulario de rutina.')], 'De noche: «I have dinner», «I go to bed».'),
]);

call('vocab-daily', 'La rutina del trabajo nuevo', 'Te explican el día de trabajo', 'Preguntá y contá con always, usually, never.', [
  o('We always start at seven. Do you usually wake up early?'),
  u('Yes, I always wake up early.', [b(['always|usually|often|sometimes|never|rarely'], 'Perfect for this job.', 'Bien: adverbio de frecuencia antes del verbo.')], 'El adverbio va antes del verbo: «I always wake up early».'),
  o('Do you ever take a nap after lunch?'),
  u('No, I never take a nap.', [b(['never|sometimes|always|usually|rarely|no|yes'], 'Ha, me neither.', 'Bien.')], '«never» ya es negativo: «I never take a nap».'),
  o("We have smoko at ten. Do you drink tea or coffee?"),
  u('I usually have a coffee.', [b(['have|drink|coffee|tea|mate'], 'Flat white?', 'Bien: «have a coffee».')], 'Tomar algo: «have a coffee».'),
]);

// ───────────── Pasado ─────────────

call('past-simple', 'El fin de semana pasado', 'Lunes en el trabajo', 'Contá qué hiciste con el pasado simple.', [
  o('How was your weekend? What did you do?'),
  u('I went to the beach and played football.', [b(['went|played|visited|watched|had|saw|did|stayed|cooked|met|was'], 'Nice one.', 'Bien: verbos en pasado.')], 'En pasado: «I went to the beach», «I played football».'),
  o('Did you go out on Saturday night?'),
  u("No, I didn't. I stayed home.", [b(['didn t|did not|went|yes|stayed|no'], 'Fair enough, big week.', 'Bien: didn\'t + verbo base.')], 'Negativa: «I did not go out» (didn\'t + verbo base).'),
  o('What did you eat?'),
  u('I ate a chivito.', [b(['ate|had|cooked|made|ordered'], "I've got to try one.", 'Bien: eat → ate.')], 'Pasado irregular: eat → ate, have → had.'),
  o('Where did you watch the game?'),
  u('I watched it at a pub.', [b(['watched|saw|didn t|did not'], 'Good stuff.', 'Bien: verbo regular con -ed.')], 'Regular: watch → watched.'),
]);

call('past-simple', 'Tu viaje', 'Contándole a Oliver cómo llegaste', 'Contá tu viaje a Australia en pasado.', [
  o('So, how did you get here from Uruguay?'),
  u('I flew from Montevideo to Sydney.', [b(['flew|took|came|travelled|traveled|went|was'], 'Long flight!', 'Bien: verbos irregulares en pasado.')], 'fly → flew, take → took: «I flew to Sydney».'),
  o('How long did the flight take?'),
  u('It took about fifteen hours.', [b(['took|was|hours'], 'Wow.', 'Bien: take → took.')], 'Duración: «It took fifteen hours».'),
  o('Did you sleep on the plane?'),
  u("No, I didn't sleep much.", [b(['didn t|did not|slept|yes|no'], "I can never sleep on planes either.", 'Bien.')], 'Negativa: «I did not sleep».'),
  o('What did you do when you arrived?'),
  u('I went to the hostel and had a shower.', [b(['went|had|slept|ate|called|took|was'], 'Smart move.', 'Bien.')], 'Por ejemplo: «I went to the hostel».'),
]);

call('past-cont', '¿Qué estabas haciendo?', 'Te llamó y no atendiste', 'Contá qué estabas haciendo con was/were + -ing.', [
  o("I called you at eight last night. What were you doing?"),
  u('I was having dinner with my friends.', [b(['was|were', '-ing'], 'Ah, fair enough.', 'Bien: was + -ing para algo en curso.')], 'Algo en curso en el pasado: «I was having dinner».'),
  o('Were your friends watching the footy?'),
  u('No, they were playing cards.', [b(['were|weren t|was', '-ing'], 'Who won?', 'Bien: con they va were.')], 'Con they: «They were playing».'),
  o('What was happening when I called?'),
  u('We were laughing at a funny video.', [b(['were|was', '-ing'], 'Ha! Send it to me.', 'Bien.')], 'Por ejemplo: «We were laughing».'),
]);

call('past-cont', 'Un susto', 'Contando una anécdota', 'Usá pasado continuo + pasado simple (when / while).', [
  o("Did anything funny happen at work today?"),
  u('Yes. I was walking in the park when I saw a kangaroo.', [b(['was|were', '-ing', 'when|while|saw|came|jumped'], 'Ha! They love that park.', 'Bien: acción larga (was working) cortada por una corta (saw).')], 'Una acción en curso y otra que la corta: «I was walking when I saw…».'),
  o('What were you doing when it jumped?'),
  u('I was taking photos.', [b(['was|were', '-ing'], 'Classic.', 'Bien.')], '«I was taking photos».'),
  o('Where was your friend while that was happening?'),
  u('She was talking on the phone.', [b(['was|were', '-ing'], 'Of course she was!', 'Bien.')], 'Con she: «She was talking».'),
]);

call('past-perfect', 'Antes de llegar', 'Hablando de tu llegada', 'Usá had + participio para algo anterior a otro pasado.', [
  o('Had you visited Australia before this trip?'),
  u("No, I had never been here before.", [b(['had|hadn t'], 'First time, nice.', 'Bien: had + participio.')], 'Antes de ese momento: «I had never been here before».'),
  o('When you arrived at the hostel, had your friends arrived?'),
  u('Yes, they had already arrived.', [b(['had|hadn t'], 'Good, someone to show you around.', 'Bien: «had already arrived».')], 'Algo anterior: «They had already arrived».'),
  o('Had you eaten before the flight?'),
  u("Yes, I had eaten at the airport.", [b(['had|hadn t'], 'Smart.', 'Bien.')], '«I had eaten before the flight».'),
]);

call('past-perfect', 'Un mal día', 'Contando un día que salió mal', 'Explicá por qué pasó algo con el pasado perfecto.', [
  o("You were late this morning. What happened?"),
  u('When I got to the station, the bus had left.', [b(['had', 'left|gone|missed|forgotten|lost'], 'Bad luck, mate.', 'Bien: «the bus had left».')], 'Algo que ya había pasado: «the bus had left».'),
  o('Had you set an alarm?'),
  u("Yes, but I had forgotten to charge my phone.", [b(['had|hadn t'], 'Been there.', 'Bien: «had forgotten».')], '«I had forgotten to charge my phone».'),
  o("Next time, call me and I'll pick you up."),
  u("Thanks, I'll do that.", [b([ANY], 'No worries.', 'Bien.')], 'Podés decir: «Thanks, I will».'),
]);

// ───────────── Futuro ─────────────

call('future', 'Planes del finde', 'Viernes de tarde', 'Contá tus planes con going to y will.', [
  o("What are you going to do this weekend?"),
  u("I'm going to visit the Great Ocean Road.", [b(['going to|gonna'], 'Great choice.', 'Bien: going to para un plan.')], 'Plan decidido: «I am going to visit…».'),
  o('Will you stay there overnight?'),
  u('Yes, I will stay in a small hotel.', [b(['will|won t|going to|yes|no'], 'Sounds lovely.', 'Bien.')], 'Con will: «I will stay…».'),
  o("Oh, it's going to rain on Sunday."),
  u("Then I'll take an umbrella.", [b(['will|i ll|going to'], 'Good idea.', 'Bien: will para una decisión del momento.')], 'Decisión en el momento: «I will take an umbrella».'),
]);

call('future', 'Predicciones', 'Charla sobre el año que viene', 'Hacé predicciones con will.', [
  o("Do you think next year will be good for you?"),
  u('Yes, I think it will be a great year.', [b(['will|won t'], "I reckon you're right.", 'Bien: will para predecir.')], 'Predicción: «I think it will be…».'),
  o('Will you travel next year?'),
  u('Maybe. I will decide later.', [b(['will|won t|maybe|probably|i think'], 'Let me know if you come here.', 'Bien.')], '«I will come back» / «I will decide later».'),
  o('What will you do with the money?'),
  u("I'll save it to build a house in Uruguay.", [b(['will|i ll|going to'], 'Good on ya, mate.', 'Bien.')], '«I will save it…».'),
]);

call('future-perf', 'Al final del año', 'Charla de fin de año', 'Usá will have + participio y will be + -ing.', [
  o('By the end of the year, how many months will you have studied English?'),
  u('I will have studied for ten months.', [b(['will have|ll have'], 'Massive effort.', 'Bien: will have + participio.')], 'Terminado antes de un momento futuro: «I will have studied…».'),
  o("And this time next month, what will you be doing?"),
  u("I'll be travelling around Australia.", [b(['will be|ll be', '-ing'], 'Lucky!', 'Bien: will be + -ing.')], 'En curso en el futuro: «I will be travelling».'),
  o('By then, will you have saved enough money?'),
  u('Yes, I will have saved enough.', [b(['will have|ll have|won t have|will not have'], 'Top stuff.', 'Bien.')], '«I will have saved enough».'),
]);

call('future-perf', 'Planes a largo plazo', 'Charla sobre el futuro', 'Proyectate a 5 años.', [
  o('Where do you see yourself in five years?'),
  u('In five years, I will have built my own house.', [b(['will have|ll have|will be'], 'Love that.', 'Bien: will have + participio.')], '«I will have built my house».'),
  o('Will you be living in Uruguay or Australia?'),
  u("I'll be living in Uruguay.", [b(['will be|ll be', '-ing'], 'Near the beach?', 'Bien: will be living.')], '«I will be living in …».'),
  o('Will you have learnt to surf by then?'),
  u("I hope I'll have learnt.", [b(['will have|ll have|hope|maybe|yes|no'], 'Ha! We can practise here.', 'Bien.')], '«I will have learnt to surf».'),
]);

call('future-cont', 'Mañana a esta hora', 'Charla sobre mañana', 'Decí qué vas a estar haciendo con will be + -ing.', [
  o('What will you be doing this time tomorrow?'),
  u("I'll be working at the café.", [b(['will be|ll be', '-ing'], 'Busy day then.', 'Bien: will be + -ing.')], 'En curso en el futuro: «I will be working».'),
  o('And at eight in the evening?'),
  u("I'll be having dinner with my friends.", [b(['will be|ll be', '-ing'], 'Sounds good.', 'Bien: «will be having».')], '«I will be having dinner».'),
  o('Will you be using your car on Saturday?'),
  u("No, I won't be using it.", [b(['will be|ll be|won t be|will not be', '-ing'], 'Great, can I borrow it?', 'Bien: won’t be + -ing.'), b(['yes|no'], 'Fair enough.', 'Bien. Completo: «I won’t be using it».')], '«I won’t be using it» / «Yes, I’ll be using it».'),
]);

call('future-cont', 'El viaje', 'Antes de un viaje', 'Contá tu viaje con will be + -ing.', [
  o("So you're flying out next week. Where will you be staying?"),
  u("I'll be staying at a hostel in Sydney.", [b(['will be|ll be', '-ing'], 'Nice one.', 'Bien: «will be staying».')], '«I will be staying at…».'),
  o('Will you be travelling alone?'),
  u("No, I'll be travelling with a friend.", [b(['will be|ll be|won t be', '-ing'], 'Good company helps.', 'Bien.'), b(['yes|no'], 'Right.', 'Bien. Completo: «I’ll be travelling with a friend».')], '«I will be travelling with…».'),
  o("I'll be thinking of you, mate. Send me a photo."),
  u("Sure, I'll send you one.", [b([ANY], 'Legend.', 'Bien.')], 'Podés decir: «Sure, I will».'),
]);

call('past-perf-cont', 'Antes de mudarte', 'Charla sobre tu vida antes', 'Usá had been + -ing para lo que venías haciendo.', [
  o('How long had you been working at your old job before you left?'),
  u('I had been working there for three years.', [b(['had been|d been', '-ing'], "That's a fair while.", 'Bien: had been + -ing.')], 'Duración hasta un momento del pasado: «I had been working there for…».'),
  o('And had you been studying English before you came?'),
  u('Yes, I had been studying for two years.', [b(['had been|d been|hadn t been', '-ing'], 'It shows, mate.', 'Bien.'), b(['yes|no'], 'Right.', 'Bien. Completo: «I had been studying for two years».')], '«I had been studying for…».'),
  o('Had you been saving money for a long time?'),
  u('Yes, I had been saving for a year.', [b(['had been|d been|hadn t been', '-ing'], 'Good planning.', 'Bien: «had been saving».'), b(['yes|no'], 'Good on ya.', 'Bien.')], '«I had been saving for a year».'),
]);

call('past-perf-cont', 'Un día largo', 'Contando un día agotador', 'Explicá por qué estabas cansado con had been + -ing.', [
  o('You looked tired yesterday. What had you been doing?'),
  u('I had been working since six in the morning.', [b(['had been|d been', '-ing'], 'No wonder.', 'Bien: «had been working».')], 'La causa venía de antes: «I had been working since…».'),
  o('Had it been raining all day too?'),
  u('Yes, it had been raining for hours.', [b(['had been|d been|hadn t been', '-ing'], 'What a day.', 'Bien.'), b(['yes|no'], 'Right.', 'Bien. Completo: «It had been raining for hours».')], '«It had been raining for hours».'),
  o('How long had you been waiting for the bus?'),
  u('I had been waiting for forty minutes.', [b(['had been|d been', '-ing'], 'That’s rough.', 'Bien.'), b(['[0-9]|minutes|hour|hours'], 'That’s rough.', 'Bien. Completo: «I had been waiting for…».')], '«I had been waiting for forty minutes».'),
]);

call('future-perf-cont', 'Aniversarios', 'Sacando cuentas', 'Decí cuánto vas a llevar con will have been + -ing.', [
  o('By December, how long will you have been studying English?'),
  u("I'll have been studying for three years.", [b(['will have been|ll have been', '-ing'], 'Three years, good on ya.', 'Bien: will have been + -ing.')], 'Duración hasta un momento futuro: «I will have been studying for…».'),
  o('And next year, how long will you have been living in your house?'),
  u("I'll have been living there for five years.", [b(['will have been|ll have been', '-ing'], 'Time flies.', 'Bien.')], '«I will have been living there for…».'),
  o('By the end of today, how many hours will you have been working?'),
  u("I'll have been working for ten hours.", [b(['will have been|ll have been', '-ing'], 'You need a rest.', 'Bien.'), b(['[0-9]|hours|ten|eight|nine'], 'You need a rest.', 'Bien. Completo: «I’ll have been working for ten hours».')], '«I will have been working for ten hours».'),
]);

call('future-perf-cont', 'El viaje largo', 'Planeando un viaje en auto', 'Sacá cuentas del viaje con will have been + -ing.', [
  o("We leave at six. By midday, how long will we have been driving?"),
  u("We'll have been driving for six hours.", [b(['will have been|ll have been', '-ing'], 'Time for a break then.', 'Bien: «will have been driving».')], '«We will have been driving for six hours».'),
  o('By the time we get to Perth, how long will we have been travelling?'),
  u("We'll have been travelling for three days.", [b(['will have been|ll have been', '-ing'], 'Worth it.', 'Bien.'), b(['[0-9]|days|three|two'], 'Worth it.', 'Bien. Completo: «We’ll have been travelling for three days».')], '«We will have been travelling for three days».'),
  o("I reckon we'll be pretty tired."),
  u("Yes, but it'll be fun.", [b([ANY], 'Too right.', 'Bien.')], 'Podés decir: «Yes, but it will be fun».'),
]);

// ───────────── Tiempos perfectos ─────────────

call('pres-perfect', 'Experiencias', 'Charla en el asado', 'Hablá de experiencias con have you ever…?', [
  o('Have you ever seen a kangaroo?'),
  u("Yes, I've seen a lot of kangaroos.", [b(['have|ve|haven t|never'], 'They are everywhere here.', 'Bien: presente perfecto para experiencias.')], 'Experiencia: «I have seen…» / «I have never seen…».'),
  o('Have you ever tried Vegemite?'),
  u("No, I've never tried it.", [b(['have|ve|haven t|never'], "You have to! On toast with butter.", 'Bien: «I have never tried it».')], '«I have never tried it».'),
  o('Ask me a question about my experiences.'),
  u('Have you ever been to South America?', [b(['have you'], "Nah, never. It's on my list.", 'Bien: preguntaste con «Have you ever…?».')], 'Preguntá: «Have you ever been to …?».'),
  o("How long have you lived here?"),
  u("I've lived here for two months.", [b(['have|ve', 'for|since'], 'Time flies.', 'Bien: for + duración.')], 'Duración: «I have lived here for two months».'),
]);

call('pres-perfect', 'Novedades', 'Oliver vuelve de vacaciones', 'Contá novedades con just, already, yet.', [
  o("I've been away a week. What's new?"),
  u("We've already finished the Shiraz.", [b(['have|ve|has'], 'Already? Good work.', 'Bien: presente perfecto para novedades.')], 'Novedad: «We have already finished…».'),
  o('Have you found a car yet?'),
  u("No, I haven't found one yet.", [b(['haven t|have not|have|ve|yet|just'], "Keep looking, they pop up.", 'Bien: «I have not found one yet».')], 'Con yet en negativa: «I have not found one yet».'),
  o('Has your boss paid you?'),
  u('Yes, he has just paid me.', [b(['has|hasn t|have'], 'Beauty.', 'Bien: con he va has.')], 'Con he: «He has just paid me».'),
]);

call('pres-perf-cont', '¿Cuánto hace?', 'Charla sobre lo que venís haciendo', 'Usá have been + -ing con for / since.', [
  o('How long have you been studying English?'),
  u("I've been studying English for three years.", [b(['have been|ve been', '-ing'], 'Your English is good, mate.', 'Bien: have been + -ing.')], 'Algo que empezó y sigue: «I have been studying for three years».'),
  o('You look tired. What have you been doing?'),
  u("I've been working all day.", [b(['have been|ve been', '-ing'], 'Put your feet up.', 'Bien.')], '«I have been working all day».'),
  o('How long have you been waiting for the bus?'),
  u("I've been waiting since six.", [b(['have been|ve been', 'since|for'], 'That bus is always late.', 'Bien: since + momento.')], 'Desde un momento: «since six».'),
]);

call('pres-perf-cont', 'Cómo va todo', 'Charla de mitad de semana', 'Contá qué venís haciendo en el trabajo.', [
  o("How's it going? What have you been doing this week?"),
  u("I've been working a lot.", [b(['have been|ve been', '-ing'], 'Busy week!', 'Bien.')], '«I have been working a lot».'),
  o('Has it been raining over there?'),
  u("Yes, it's been raining since Monday.", [b(['has been|s been|have been|hasn t been', '-ing|since|for'], 'Good for the garden.', 'Bien.')], '«It has been raining since Monday».'),
  o('How long have you been living in the house?'),
  u("I've been living there for a month.", [b(['have been|ve been', 'for|since'], 'Settled in?', 'Bien.')], '«I have been living there for a month».'),
]);

// ───────────── Condicionales ─────────────

call('cond-1-2', '¿Y si…?', 'Planes con el clima', 'Usá if + presente, will (condicional 1).', [
  o("It might rain tomorrow. What will we do if it rains?"),
  u("If it rains, we'll stay inside.", [b(['if', 'will|ll|won t'], 'Fair call.', 'Bien: if + presente, will + verbo.')], 'Condicional 1: «If it rains, we will stay inside».'),
  o("And if it's sunny?"),
  u("If it's sunny, we'll go to the beach.", [b(['if', 'will|ll'], 'Bring sunscreen.', 'Bien.')], '«If it is sunny, we will go to the beach».'),
  o('What will you do if you miss the bus?'),
  u("I'll call you if I miss it.", [b(['if', 'will|ll'], 'Deal.', 'Bien.')], '«If I miss the bus, I will call you».'),
]);

call('cond-1-2', 'La lotería', 'Charla soñando', 'Usá if + pasado, would (condicional 2).', [
  o("If you won the lottery, what would you do?"),
  u('If I won the lottery, I would buy a farm.', [b(['would|d'], 'Dream big!', 'Bien: if + pasado, would + verbo.')], 'Condicional 2: «If I won…, I would buy…».'),
  o('Would you stay in Australia?'),
  u("No, I would go back to Uruguay.", [b(['would|wouldn t|d'], 'Fair enough, family is family.', 'Bien.')], '«I would go back…» / «I would not stay».'),
  o('If you were the boss here, what would you change?'),
  u('If I were the boss, I would start later.', [b(['were|was', 'would|d'], 'Ha! Everyone would love you.', 'Bien: If I were…')], 'Con if se usa were: «If I were the boss, I would…».'),
]);

call('cond-3', 'Si hubiera sabido…', 'Charla sobre decisiones', 'Usá if + had + participio, would have (condicional 3).', [
  o("You missed the barbie on Saturday. What happened?"),
  u("If I had known, I would have come.", [b(['had', 'would have|d have|would ve|wouldn t have'], 'We should have told you.', 'Bien: condicional 3.')], 'Pasado que no pasó: «If I had known, I would have come».'),
  o("If you had come, you would have met my sister."),
  u('If I had met her, I would have practised my English.', [b(['had|would have|d have'], 'Ha! Next time.', 'Bien.')], '«If I had met her, I would have…».'),
  o('Would you have come if I had picked you up?'),
  u('Yes, I would have come.', [b(['would have|d have|would ve|wouldn t have'], 'Noted for next time.', 'Bien.')], '«Yes, I would have come».'),
]);

call('cond-3', 'Mirando atrás', 'Charla sobre tu viaje', 'Imaginá cómo habría sido distinto.', [
  o("If you hadn't come to Australia, what would you have done?"),
  u('I would have stayed in my job in Uruguay.', [b(['would have|d have|would ve'], 'Glad you came though.', 'Bien.')], '«I would have stayed…».'),
  o("If you had studied more English before, would it have been easier?"),
  u('Yes, it would have been easier.', [b(['would have|d have|wouldn t have'], 'You are doing great anyway.', 'Bien.')], '«It would have been easier».'),
  o("I wouldn't have met you if you hadn't come!"),
  u("True! If I hadn't come, I wouldn't have met you.", [b(['had|hadn t|wouldn t have|would not have|true|yes'], 'Cheers to that.', 'Bien.')], '«If I had not come, I would not have met you».'),
]);

call('past-modals', 'Debería haber…', 'Algo salió mal en casa', 'Usá should have, could have, must have.', [
  o("The bath overflowed last night. What should we have done?"),
  u('We should have turned off the tap.', [b(['should have|should ve|shouldn t have'], 'Yeah, lesson learnt.', 'Bien: should have + participio.')], 'Lo que convenía: «We should have turned off the tap».'),
  o('Who do you think left the tap on?'),
  u('It must have been Jake.', [b(['must have|might have|could have|can t have|must ve'], 'Ha! Probably.', 'Bien: deducción sobre el pasado.')], 'Deducción: «It must have been Jake».'),
  o("Could you have stayed later to help?"),
  u('Yes, I could have stayed.', [b(['could have|could ve|couldn t have'], 'Next time, mate.', 'Bien.')], '«I could have stayed».'),
]);

call('past-modals', 'El celular perdido', 'Buscando tu teléfono', 'Hacé suposiciones sobre el pasado.', [
  o("You can't find your phone? Where might you have left it?"),
  u('I might have left it in the ute.', [b(['might have|may have|could have|must have|might ve'], "Let's check.", 'Bien: might have + participio.')], 'Posibilidad: «I might have left it in the ute».'),
  o("It isn't there. Someone must have picked it up."),
  u("Or I could have dropped it in the park.", [b(['could have|might have|must have|may have'], 'Good thinking.', 'Bien.')], '«I could have dropped it…».'),
  o("Found it! It was in your jacket. You should have checked there first."),
  u("Yes, I should have checked my jacket.", [b(['should have|should ve'], 'Ha! No worries.', 'Bien.')], '«I should have checked my jacket».'),
]);

// ───────────── Cantidades y comparaciones ─────────────

call('countables', 'La lista del súper', 'Comprando para la barbie', 'Usá much / many / some / any / a few.', [
  o("We need stuff for the barbie. How many snags should we buy?"),
  u("Let's buy twenty snags.", [b(['many|snags|sausages|[0-9]|twenty|ten|fifteen|thirty'], 'Plenty.', 'Bien.')], 'Por ejemplo: «Let\'s buy twenty snags».'),
  o('Have we got any bread?'),
  u("No, we haven't got any bread.", [b(['any|some|no|yes'], "I'll grab some.", 'Bien: any en negativas.')], 'Negativa con any: «We have not got any bread».'),
  o('How much ice do we need?'),
  u('We need a lot of ice.', [b(['a lot|lots|much|some|a little|bag|bags'], 'True, it is going to be hot.', 'Bien.')], 'Incontable: «a lot of ice», «some ice».'),
  o('Do we need many drinks?'),
  u('Just a few drinks.', [b(['a few|a lot|many|some|lots'], 'Righto.', 'Bien.')], 'Contable: «a few drinks», «many drinks».'),
]);

call('countables', 'Consejos', 'Pidiendo información', 'Usá incontables: information, advice, money.', [
  o('Do you need any information about the job?'),
  u('Yes, I need some information about the hours.', [b(['some information|information|any information'], 'Sure.', 'Bien: information es incontable (sin -s).')], 'Incontable: «some information» (no «informations»).'),
  o('Can I give you some advice? Bring a hat.'),
  u('Thanks for the advice.', [b(['advice|thanks|thank'], 'No worries.', 'Bien: advice sin -s.')], 'Incontable: «the advice» (no «advices»).'),
  o('How much money do you need for a car?'),
  u('I need a lot of money.', [b(['much|a lot|lots|some|money|dollars|thousand'], 'Second-hand cars are cheap here.', 'Bien.')], '«How much money…?» → «a lot of money».'),
]);

call('comparatives', 'Uruguay vs. Australia', 'Comparando países', 'Compará con -er than, more … than, the most.', [
  o("Is Montevideo bigger than Adelaide?"),
  u('Yes, Montevideo is bigger than Adelaide.', [b(['-er|more|less', 'than'], 'Didn\'t know that!', 'Bien: comparativo + than.')], 'Comparar: «bigger than», «more expensive than».'),
  o('Which is more expensive, Uruguay or Australia?'),
  u('Australia is more expensive than Uruguay.', [b(['more|less|cheaper|expensive', 'than'], 'Yeah, it is pricey here.', 'Bien: more expensive than.')], 'Adjetivo largo: «more expensive than».'),
  o("What's the best food in Uruguay?"),
  u('The best food is asado.', [b(['the best|the most|best'], 'I need to try it.', 'Bien: superlativo.')], 'Superlativo: «the best».'),
  o('Is the weather hotter here?'),
  u('Yes, it is much hotter here.', [b(['hotter|colder|warmer|more|less|as'], 'Wait until February!', 'Bien.')], '«hotter» (se duplica la t).'),
]);

call('comparatives', 'Eligiendo auto', 'Mirando dos autos usados', 'Compará dos opciones.', [
  o("Look at these two cars. Which one is better?"),
  u('The white one is better than the red one.', [b(['better|worse|-er|more|less', 'than|one'], 'I agree.', 'Bien: good → better.')], 'Irregular: good → better.'),
  o('Is the red one cheaper?'),
  u("Yes, but it's older.", [b(['cheaper|older|newer|-er|more|less'], 'True.', 'Bien.')], '«cheaper», «older».'),
  o('Is it as fast as the white one?'),
  u("No, it isn't as fast as the white one.", [b(['as', 'as'], 'Then go with the white one.', 'Bien: as … as.')], 'Igualdad: «as fast as».'),
]);

// ───────────── Preposiciones y vocabulario ─────────────

call('collocations', 'Make o do', 'Charla en el descanso', 'Usá make / do / take / have bien.', [
  o("Have you made any friends here yet?"),
  u("Yes, I've made a lot of friends.", [b(['made|make'], 'Good on ya.', 'Bien: make friends.')], 'Hacer amigos = «make friends».'),
  o('What do you do after work?'),
  u('I do exercise and take a shower.', [b(['do|take|have|go'], 'Healthy!', 'Bien: do exercise, take a shower.')], '«do exercise», «take a shower».'),
  o('Did you make a mistake on your first day?'),
  u('Yes, I made a big mistake.', [b(['made|make'], 'Ha! Everyone does.', 'Bien: make a mistake.')], 'Equivocarse = «make a mistake».'),
  o("Let's take a photo for your family."),
  u("Good idea, let's take a photo.", [b(['take|photo|picture|yes|sure'], 'Say cheese!', 'Bien: take a photo.')], 'Sacar una foto = «take a photo».'),
]);

call('collocations', 'Pasarla bien', 'Charla del finde', 'Usá have a good time, make plans, do a favour.', [
  o('Did you have a good time at the party?'),
  u('Yes, I had a great time.', [b(['had|have', 'time'], 'Ripper.', 'Bien: have a great time.')], 'Pasarla bien = «have a great time».'),
  o('Have you made plans for next weekend?'),
  u("Not yet, I haven't made plans.", [b(['made|make|plans|plan'], 'Come to the footy then.', 'Bien: make plans.')], '«make plans».'),
  o('Can you do me a favour and feed my dog on Saturday?'),
  u('Sure, I can do you a favour.', [b(['sure|yes|do|favour|favor|no worries'], 'Legend.', 'Bien: do a favour.')], 'Hacer un favor = «do a favour».'),
]);

call('phrasal-1', 'Buscando cosas', 'En la casa compartida', 'Usá phrasal verbs comunes.', [
  o("What are you looking for, mate?"),
  u("I'm looking for my keys.", [b(['looking for|look for'], 'Check the kitchen.', 'Bien: look for = buscar.')], 'Buscar = «look for».'),
  o("Did you turn off the heater?"),
  u('Yes, I turned it off.', [b(['turned off|turn off|turned it off|turn it off|turned on'], 'Good, power is expensive.', 'Bien: turn off.')], 'Apagar = «turn off».'),
  o("We've run out of milk. Can you pick some up?"),
  u("Sure, I'll pick some up.", [b(['pick|get|buy|sure|yes'], 'Cheers.', 'Bien: pick up.')], '«pick up» = pasar a buscar / comprar al pasar.'),
  o('Did you find out the bus times?'),
  u('Yes, I found out the times online.', [b(['found out|find out|yes|no'], 'Good.', 'Bien: find out = averiguar.')], 'Averiguar = «find out».'),
]);

call('phrasal-1', 'No te rindas', 'Charla motivadora', 'Usá give up, get up, go out, catch up.', [
  o("Learning English is hard. Do you ever want to give up?"),
  u("Sometimes, but I won't give up.", [b(['give up|gave up|won t|never'], 'That\'s the spirit.', 'Bien: give up = rendirse.')], 'Rendirse = «give up».'),
  o('What time do you get up on Sundays?'),
  u('I get up at ten on Sundays.', [b(['get up|wake up'], 'Sleep-in day.', 'Bien.')], '«get up».'),
  o("Let's catch up on Saturday. Do you want to go out?"),
  u("Yes, let's go out for a drink.", [b(['go out|catch up|yes|sure'], 'Beauty.', 'Bien: go out = salir.')], 'Salir = «go out».'),
]);

call('relatives', 'La gente del trabajo', 'Describiendo compañeros', 'Usá who / which / where.', [
  o("Who's the guy who drives the forklift?"),
  u("He's the guy who works in the kitchen.", [b(['who|that'], 'Ah, that\'s Jake.', 'Bien: who para personas.')], 'Para personas: «the guy who…».'),
  o("What's that thing which you use for opening tins?"),
  u('It is the tool which opens tins.', [b(['which|that'], 'Right, a tin opener.', 'Bien: which para cosas.')], 'Para cosas: «the tool which…».'),
  o("Tell me about the town where you grew up."),
  u('It is a small town where everyone knows each other.', [b(['where'], 'Sounds like here.', 'Bien: where para lugares.')], 'Para lugares: «a town where…».'),
]);

call('relatives', 'Recomendaciones', 'Pidiendo dónde comer', 'Recomendá con who, which, whose.', [
  o("Do you know a place where I can eat a good steak?"),
  u('There is a restaurant where they cook asado.', [b(['where|which|that'], 'I\'m there.', 'Bien.')], '«a restaurant where…».'),
  o('Do you know anyone who speaks Spanish here?'),
  u('Yes, I have a friend who speaks Spanish.', [b(['who|that'], 'Great, introduce me.', 'Bien.')], '«a friend who speaks Spanish».'),
  o("I've got a mate whose dad has a restaurant."),
  u('Can you introduce me to the guy whose dad has a restaurant?', [b(['whose|who|introduce|yes|sure'], 'Sure thing.', 'Bien.')], '«the guy whose dad…» = cuyo padre.'),
]);

call('connectors', 'Opiniones', 'Charla sobre el trabajo', 'Conectá ideas con because, but, so, although.', [
  o("Do you like your job?"),
  u("Yes, I like it because I learn a lot.", [b(['because|but|so|although|and'], 'True, you learn heaps.', 'Bien: usaste un conector.')], 'Para dar la razón: «because…».'),
  o("Isn't it tiring?"),
  u("It's tiring, but I enjoy it.", [b(['but|although|though|however'], 'Good attitude.', 'Bien: but para contrastar.')], 'Contraste: «It is tiring, but…».'),
  o("It's going to be hot tomorrow."),
  u("So I'll bring a lot of water.", [b(['so|because|then'], 'Smart.', 'Bien: so para la consecuencia.')], 'Consecuencia: «so…».'),
  o("Would you come back, even though it's far?"),
  u("Although it's far, I would come back.", [b(['although|even though|though|but|despite'], 'Love it.', 'Bien.')], '«Although it is far, …».'),
]);

call('connectors', 'Decidiendo', 'Pensando en comprar un auto', 'Usá unless, in case, however.', [
  o("Are you going to buy a car?"),
  u("I won't buy one unless it's cheap.", [b(['unless|if|because|but'], 'Fair enough.', 'Bien: unless = a menos que.')], '«unless» = a menos que.'),
  o("Should you bring a jacket to the trip?"),
  u("Yes, I'll bring one in case it gets cold.", [b(['in case|because|if|so'], 'Good idea, nights are cold.', 'Bien: in case = por si.')], 'Por si acaso: «in case it gets cold».'),
  o("Cars are cheap in the country. However, they're old."),
  u("I know. However, I only need it for a few months.", [b(['however|but|although|so|because'], 'Makes sense.', 'Bien.')], '«However, …».'),
]);

call('passive', 'Cómo se hace el pan', 'Visita a una panadería', 'Explicá procesos con la pasiva.', [
  o("Do you know how bread is made?"),
  u('Yes, the flour is mixed with water and then it is baked.', [b(['are|is|was|were', 'mixed|baked|made|kneaded|cooked'], 'Exactly.', 'Bien: pasiva (is mixed).')], 'Pasiva: «The flour is mixed», «It is baked».'),
  o('Where is the bread kept?'),
  u('It is kept in a basket.', [b(['is|are', 'stored|kept|put'], 'Right, or in a paper bag.', 'Bien: is kept.')], '«It is kept in a basket».'),
  o('When was this bakery opened?'),
  u('It was opened in nineteen fifty.', [b(['was|were', 'built|made|opened|founded|started'], 'Close, 1948.', 'Bien: pasiva en pasado.')], 'Pasado: «It was opened in…».'),
]);

call('passive', 'Uruguay es conocido por…', 'Charla sobre tu país', 'Contá qué se produce y se come en Uruguay.', [
  o("What is Uruguay known for?"),
  u('Uruguay is known for its beef and football.', [b(['is|are', 'known|famous'], 'Of course!', 'Bien: is known for.')], '«Uruguay is known for…».'),
  o('Is wine produced there?'),
  u('Yes, Tannat is produced in Uruguay.', [b(['is|are|was', 'produced|made|grown'], "I've tried it, it's good.", 'Bien.')], '«Tannat is produced in Uruguay».'),
  o('Is Spanish spoken everywhere?'),
  u('Yes, Spanish is spoken everywhere.', [b(['is|are', 'spoken'], 'Must practise mine.', 'Bien: is spoken.')], '«Spanish is spoken…».'),
]);

call('aussie', 'Hablando como australiano', 'Barbie en la casa de Oliver', 'Usá expresiones australianas.', [
  o("G'day mate! How ya going?"),
  u("Good thanks, mate. How are you going?", [b(['good|not bad|going|great|well'], "Not too bad, cheers.", 'Bien: respondiste como un local.')], 'Respuesta típica: «Good thanks, mate».'),
  o('Want a snag in bread?'),
  u('Yes, please. I love snags.', [b(['yes|yeah|please|sure|love'], "Too easy. Grab a drink from the esky.", 'Bien.')], 'Podés decir: «Yes, please».'),
  o("Thanks for coming this arvo."),
  u("No worries! Thanks for the barbie.", [b(['no worries|thanks|cheers|thank'], 'Any time.', 'Bien: «No worries».')], '«No worries» = no pasa nada / de nada.'),
  o("You coming to the footy on Saturday?"),
  u("Yeah, sounds good. I reckon it'll be fun.", [b(['yeah|yes|sure|reckon|sounds good|no'], 'Ripper.', 'Bien.')], '«I reckon…» = me parece.'),
]);

call('aussie', 'Un día en la playa', 'Bondi', 'Entendé y usá slang australiano.', [
  o("Did you bring your sunnies and thongs?"),
  u("Yes, I've got my sunnies and thongs.", [b(['sunnies|thongs|yes|got|sunglasses'], 'Legend.', 'Bien: sunnies = lentes, thongs = ojotas.')], 'sunnies = lentes de sol; thongs = ojotas.'),
  o("It's a bit exy here. Let's go to the servo for drinks."),
  u('Good idea, the servo is cheaper.', [b(['servo|cheaper|good|yes|sure|ok'], 'Too right.', 'Bien.')], 'servo = estación de servicio; exy = caro.'),
  o("I'm knackered after that swim."),
  u("Me too, I'm knackered.", [b(['knackered|tired|me too|yeah'], "Let's grab a cuppa.", 'Bien.')], 'knackered = muerto de cansancio.'),
]);

call('false-friends', 'Cuidado con las palabras', 'Charla con trampas', 'Usá bien los falsos amigos.', [
  o("What do you actually do in Uruguay?"),
  u('Actually, I work in a bank. Currently I am on holiday.', [b(['actually|currently|now|at the moment|i work'], 'Ah, makes sense.', 'Bien: actually = en realidad; currently = actualmente.')], '«actualmente» = currently (no actually).'),
  o('Did you attend the meeting this morning?'),
  u("Yes, I attended the meeting.", [b(['attended|attend|went|yes|no'], 'Good.', 'Bien: attend = asistir a un evento.')], 'Asistir a una reunión = «attend».'),
  o("You looked embarrassed at the party!"),
  u('Yes, I was embarrassed because I forgot your name.', [b(['embarrassed|ashamed|yes|no'], 'Ha! No worries.', 'Bien: embarrassed = con vergüenza.')], 'embarrassed = con vergüenza (no embarazada).'),
]);

call('false-friends', 'En la librería', 'Buscando un libro', 'Evitá los falsos amigos más comunes.', [
  o("Where did you buy that book?"),
  u('I bought it at a bookshop.', [b(['bookshop|bookstore|shop|store'], 'Which one?', 'Bien: bookshop = librería (library = biblioteca).')], 'Librería = «bookshop»; biblioteca = «library».'),
  o("Did you realise the shop closes at five?"),
  u("No, I didn't realise.", [b(['realise|realize|know|didn t'], 'It does, on Sundays.', 'Bien: realise = darse cuenta.')], 'Darse cuenta = «realise / realize».'),
  o('Was the trip a success?'),
  u('Yes, it was a big success.', [b(['success|good|great|yes'], 'Brilliant.', 'Bien: success = éxito.')], 'Éxito = «success» (exit = salida).'),
]);

call('gerund-inf', 'Gustos y planes', 'Charla tranquila', 'Usá -ing después de enjoy/like y to después de want/decide.', [
  o("What do you enjoy doing in your free time?"),
  u('I enjoy playing the guitar.', [b(['enjoy|love|like', '-ing'], 'Bring it to the barbie!', 'Bien: enjoy + -ing.')], 'Después de enjoy va -ing: «I enjoy playing».'),
  o('What do you want to do next year?'),
  u('I want to travel around Australia.', [b(['want to|would like to|plan to|hope to|going to'], 'Do the Great Ocean Road.', 'Bien: want + to.')], 'Después de want va to: «I want to travel».'),
  o("Are you interested in learning to surf?"),
  u("Yes, I'm interested in learning.", [b(['interested in|-ing|yes|no'], "I'll teach you.", 'Bien: preposición + -ing.')], 'Después de una preposición va -ing: «interested in learning».'),
  o("Don't forget to bring a hat tomorrow."),
  u("I won't forget to bring it.", [b(['forget to|remember to|won t|will|ok|sure'], 'Good.', 'Bien.')], '«remember to bring» / «forget to bring».'),
]);

call('gerund-inf', 'Dejar o seguir', 'Hablando de hábitos', 'Usá stop/keep/avoid + -ing.', [
  o("Did you stop drinking soft drinks?"),
  u('Yes, I stopped drinking them.', [b(['stopped|stop|quit|gave up', '-ing'], 'Good on ya.', 'Bien: stop + -ing = dejar de.')], 'Dejar de: «stop drinking».'),
  o('Do you keep practising English every day?'),
  u('Yes, I keep practising every day.', [b(['keep|kept|-ising|-icing', '-ing'], 'It shows.', 'Bien: keep + -ing.')], 'Seguir haciendo: «keep practising».'),
  o("I'm looking forward to seeing you at the barbie."),
  u("Me too, I'm looking forward to seeing everyone.", [b(['looking forward to', '-ing'], 'Ripper.', 'Bien: look forward to + -ing.')], '«look forward to + -ing».'),
]);

call('reported', '¿Qué te dijo?', 'Contando una charla con el jefe', 'Contá lo que te dijeron con estilo indirecto.', [
  o("What did the boss say to you?"),
  u('He said that I was doing a good job.', [b(['said|told', 'was|were|had|would|could'], 'Good on ya!', 'Bien: estilo indirecto (said that I was).')], 'Estilo indirecto: «He said that I was…».'),
  o('Did he tell you when we finish?'),
  u('He told me that we would finish in April.', [b(['told|said', 'would|was|were|had'], 'Great, thanks.', 'Bien: will → would.')], '«He told me (that) we would finish…».'),
  o('What did he ask you?'),
  u('He asked me if I wanted to come back next year.', [b(['asked', 'if|whether|where|when|what'], 'Will you?', 'Bien: asked me if…')], 'Pregunta indirecta: «He asked me if I wanted…».'),
]);

call('reported', 'El mensaje', 'Pasando un mensaje', 'Pasale a Oliver lo que dijo otra persona.', [
  o("Did Jake call? What did he say?"),
  u("He said he couldn't come tonight.", [b(['said|told', 'could|couldn t|would|was|wasn t'], 'Bummer.', 'Bien: can → could.')], '«He said he could not come».'),
  o('Did he say why?'),
  u('He said that he was sick.', [b(['said|told', 'was|had|felt'], 'Hope he gets better.', 'Bien.')], '«He said that he was sick».'),
  o('Did he ask about the barbie?'),
  u('He asked what time it started.', [b(['asked', 'what|when|if|where'], 'Seven. I\'ll text him.', 'Bien: pregunta indirecta sin inversión.')], '«He asked what time it started» (sin «did»).'),
]);

call('register', 'Sonar natural', 'Charla relajada', 'Respondé con frases naturales, no de libro.', [
  o("Sorry I'm late, mate."),
  u('No worries, mate.', [b(['no worries|don t worry|no problem|all good|it s fine'], 'Cheers.', 'Bien: suena natural.')], 'Natural: «No worries» o «All good».'),
  o("To be honest, what do you think of Vegemite?"),
  u("To be honest, I don't love it.", [b(['honest|reckon|i think|i mean|not|love|like'], 'Ha! Fair enough.', 'Bien.')], '«To be honest, …» = la verdad, …'),
  o("I'll let you know about Saturday."),
  u("Sounds good, let me know.", [b(['let me know|sounds good|cool|ok|sure|great'], 'Will do.', 'Bien: let me know.')], '«Let me know» = avisame.'),
]);

call('register', 'Formal o informal', 'Llamada con una oficina', 'Cambiá a un registro más formal.', [
  o("Good morning, Adelaide Bikes. How can I help you?"),
  u("Good morning. I'd like to ask about the job.", [b(['would like|d like|i want|could|may|wondering'], 'Certainly.', 'Bien: «I would like to…» es formal y amable.')], 'Formal: «I would like to ask about…».'),
  o('Could you give me your full name, please?'),
  u('Of course. My name is Agustín Salazar.', [b(['name|of course|sure|certainly'], 'Thank you.', 'Bien.')], '«Of course. My name is…».'),
  o("We'll get back to you by Friday."),
  u('Thank you very much. I look forward to hearing from you.', [b(['thank|look forward|appreciate'], "You're welcome.", 'Bien: cierre formal.')], 'Cierre formal: «I look forward to hearing from you».'),
]);

call('inversion', 'Para destacar', 'Contando algo increíble', 'Destacá ideas con inversión y What… is…', [
  o("How was the sunset at Uluru?"),
  u('Never have I seen such a beautiful sunset.', [b(['never have i|rarely have i|seldom have i|never had i'], 'Unreal, right?', 'Bien: inversión después de Never.')], 'Inversión: «Never have I seen…».'),
  o('What did you like the most?'),
  u('What I liked the most was the colour of the rock.', [b(['what i'], 'It changes every minute.', 'Bien: What I liked was…')], 'Para destacar: «What I liked the most was…».'),
  o("Did you expect it to be so big?"),
  u('Not only was it big, but it was also beautiful.', [b(['not only|only then|hardly|no sooner|never'], 'Couldn\'t agree more.', 'Bien: Not only was it…')], '«Not only was it big, but…».'),
]);

call('inversion', 'Fue Ana la que…', 'Aclarando quién hizo qué', 'Usá It was … who / What … is.', [
  o("Who organised the barbie? Was it you?"),
  u('No, it was Ana who organised it.', [b(['it was', 'who|that'], 'Thank Ana for me.', 'Bien: It was … who.')], 'Para destacar a alguien: «It was Ana who…».'),
  o('What do you need for the trip?'),
  u('What I need is a good car.', [b(['what i need|what we need'], 'Let\'s find one.', 'Bien: What I need is…')], '«What I need is…».'),
  o('Did you sleep well after the party?'),
  u('Hardly had I gone to bed when my phone rang.', [b(['hardly|no sooner|never|not only|rarely'], 'Ha, typical.', 'Bien: inversión con Hardly.')], '«Hardly had I gone to bed when…».'),
]);

// ───────────── Sonidos ─────────────

call('sounds-vowels', 'Ship o sheep', 'Practicando vocales', 'Decí bien las vocales cortas y largas.', [
  o("Can you say: I live in a big city."),
  u('I live in a big city.', [b(['live|leave', 'city'], 'Spot on.', 'Bien: «live» con i corta.')], '«live» con i corta, distinta de «leave».'),
  o("Now say: The sheep are on the hill."),
  u('The sheep are on the hill.', [b(['sheep|ship', 'hill'], 'Nice and clear.', 'Bien.')], '«sheep» con i larga.'),
  o("What's your favourite food? Say it in a sentence."),
  u('My favourite food is pizza.', [b(['favourite|favorite|food|is|like|love'], 'Good choice.', 'Bien.')], 'Por ejemplo: «My favourite food is…».'),
]);

call('sounds-endings', 'Finales -s y -ed', 'Practicando finales', 'Pronunciá bien -s y -ed.', [
  o("What did you do yesterday? Use verbs with -ed."),
  u('I worked, I cooked and I watched a movie.', [b(['-ed|worked|cooked|watched|played|visited|wanted'], 'Busy day.', 'Bien: verbos con -ed.')], 'Pasado regular con -ed: «worked», «watched».'),
  o('What does your friend do every day?'),
  u('She works, she eats and she plays football.', [b(['works|eats|plays|goes|watches|studies|drinks|-s'], 'Sounds fun.', 'Bien: -s con she.')], 'Con she el verbo lleva -s: «works», «plays».'),
  o('Did you want to go out tonight?'),
  u('Yes, I wanted to go out.', [b(['wanted|want|yes|no'], 'Ripper.', 'Bien: «wanted» suena /ɪd/.')], '«wanted» suma una sílaba: want-ed.'),
]);

call('connected-speech', 'Hablá de corrido', 'Charla rápida', 'Practicá frases rápidas y naturales.', [
  o("What are you gonna do tonight?"),
  u("I'm gonna watch a movie.", [b(['going to|gonna|will|watch|go|stay'], 'Nice.', 'Bien.')], '«gonna» = going to, en charla rápida.'),
  o("Do you wanna grab a cup of tea first?"),
  u('Sure, I want to grab a cup of tea.', [b(['want to|wanna|sure|yes|ok|cup'], 'Kettle\'s on.', 'Bien.')], '«wanna» = want to.'),
  o("What do you think of it?"),
  u("I think it's great.", [b(['think|reckon|great|good|nice|love'], 'Me too.', 'Bien.')], '«What do you» suena «whaddaya».'),
]);

// ───────────── Llamada extra de práctica general para las unidades que tenían una sola ─────────────
call('sounds-vowels', 'Pidiendo en el café', 'Café en Adelaide', 'Pedí un café pronunciando claro.', [
  o("G'day! What can I get you?"),
  u('Can I have a flat white, please?', [b(['can i|could i|i ll have|i would like|i d like|please'], 'Coming up.', 'Bien: pedido amable.')], 'Pedir: «Can I have a flat white, please?».'),
  o('Anything to eat?'),
  u("Yes, a cheese toastie, please.", [b(['yes|no|please|thanks|toastie|muffin|croissant'], 'Easy.', 'Bien.')], 'Por ejemplo: «Yes, a cheese toastie, please».'),
  o("That'll be nine dollars."),
  u('Here you go. Thank you.', [b(['here|thank|thanks|cheers|card'], 'Cheers, have a good one.', 'Bien.')], '«Here you go. Thank you».'),
]);
call('sounds-endings', 'Contando el día', 'Llamada a la noche', 'Contá tu día con -ed claro.', [
  o('How was your day? What happened?'),
  u('I started early and finished late.', [b(['-ed|started|finished|worked|walked|wanted|needed'], 'Long day!', 'Bien: -ed bien marcado.')], '«started» y «finished».'),
  o('Did you need any help today?'),
  u('No, I needed a break, not help.', [b(['needed|need|no|yes'], 'Fair.', 'Bien: «needed» suma sílaba.')], '«needed» = need-ed.'),
  o('What does your boss usually say?'),
  u('He always says good job.', [b(['says|-s|always|good'], 'Nice boss.', 'Bien: says con -s.')], '«He says» (con -s).'),
]);
call('connected-speech', 'Planes rápidos', 'Mensaje de voz', 'Respondé rápido y natural.', [
  o("Hey, what's up? Wanna come to the beach?"),
  u('Yeah, I want to come.', [b(['yeah|yes|want to|wanna|sure|no'], 'Ripper.', 'Bien.')], '«I wanna come» = I want to come.'),
  o("Got your stuff ready?"),
  u("Yeah, I've got it.", [b(['got|yes|yeah|ready'], 'See you there.', 'Bien.')], '«I have got it».'),
  o("Let's meet at nine, alright?"),
  u('Alright, see you at nine.', [b(['alright|ok|okay|sure|nine|good'], 'Too easy.', 'Bien.')], '«Alright, see you at nine».'),
]);

export const CALLS: CallScript[] = scripts;
export const callsForUnit = (unitId: string) => CALLS.filter((c) => c.unitId === unitId);
export const callById = (id: string) => CALLS.find((c) => c.id === id);
