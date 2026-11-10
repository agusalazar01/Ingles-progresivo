import type { Level } from './types';

/**
 * «Armá la frase» (como en clase): te doy las palabras clave y el tiempo verbal; vos armás la oración completa.
 * Pensado para B1–C1: varios tiempos en la misma oración, pasiva, estilo indirecto, condicionales, modales en pasado…
 * `cues` van en forma base y en orden; `answers` son las respuestas aceptadas (las contracciones, el «that»
 * optativo y el orden de las expresiones de tiempo se aceptan solos).
 */
export interface BuildItem {
  level: Level;
  topic: string;
  cues: string[];
  /** Qué tiempo o estructura usar. */
  task: string;
  es: string;
  answers: string[];
}

export const BUILD_TOPICS: { id: string; title: string; desc: string }[] = [
  { id: 'past', title: 'Dos tiempos en pasado', desc: 'Pasado simple, continuo, perfecto y perfecto continuo juntos' },
  { id: 'perfect', title: 'Presente perfecto', desc: 'Simple y continuo, con for, since, already, yet' },
  { id: 'future', title: 'Futuro', desc: 'will, going to, futuro continuo y futuro perfecto' },
  { id: 'cond', title: 'Condicionales', desc: 'Primera, segunda, tercera y mixtas' },
  { id: 'passive', title: 'Voz pasiva', desc: 'En distintos tiempos y con modales' },
  { id: 'reported', title: 'Estilo indirecto', desc: 'Contar lo que dijo o preguntó otro' },
  { id: 'modals', title: 'Modales en pasado', desc: 'must have, should have, could have, might have' },
  { id: 'wish', title: 'Deseos y arrepentimientos', desc: 'wish, if only, would rather, it’s time' },
  { id: 'habits', title: 'Costumbres', desc: 'used to, would, be used to, get used to' },
  { id: 'c1', title: 'Estructuras C1', desc: 'Inversión, cleft, participios y más' },
];

const B = (level: Level, topic: string, cues: string[], task: string, es: string, ...answers: string[]): BuildItem => ({ level, topic, cues, task, es, answers });

export const BUILD: BuildItem[] = [
  // ───────── Dos tiempos en pasado ─────────
  B('B2', 'past', ['she', 'be', 'very tired', 'because', 'she', 'work', 'since 6 a.m.'], 'Pasado simple + pasado perfecto continuo', 'Ella estaba muy cansada porque había estado trabajando desde las 6 a. m.', 'She was very tired because she had been working since 6 a.m.', 'She was very tired because she had been working since 6 am.'),
  B('B1', 'past', ['I', 'cook', 'dinner', 'when', 'the lights', 'go out'], 'Pasado continuo + pasado simple', 'Estaba cocinando la cena cuando se cortó la luz.', 'I was cooking dinner when the lights went out.'),
  B('B1', 'past', ['when', 'we', 'arrive', 'at the station', 'the train', 'already', 'leave'], 'Pasado simple + pasado perfecto', 'Cuando llegamos a la estación, el tren ya se había ido.', 'When we arrived at the station, the train had already left.', 'The train had already left when we arrived at the station.'),
  B('B2', 'past', ['his eyes', 'be', 'red', 'because', 'he', 'cry'], 'Pasado simple + pasado perfecto continuo', 'Tenía los ojos rojos porque había estado llorando.', 'His eyes were red because he had been crying.'),
  B('B1', 'past', ['while', 'I', 'drive', 'to work', 'my boss', 'call', 'me'], 'Pasado continuo + pasado simple', 'Mientras manejaba al trabajo, me llamó mi jefe.', 'While I was driving to work, my boss called me.', 'My boss called me while I was driving to work.'),
  B('B2', 'past', ['by the time', 'the ambulance', 'arrive', 'the man', 'stop', 'breathing'], 'Pasado simple + pasado perfecto', 'Para cuando llegó la ambulancia, el hombre había dejado de respirar.', 'By the time the ambulance arrived, the man had stopped breathing.'),
  B('B2', 'past', ['we', 'wait', 'for two hours', 'when', 'they', 'finally', 'open', 'the doors'], 'Pasado perfecto continuo + pasado simple', 'Hacía dos horas que esperábamos cuando por fin abrieron las puertas.', 'We had been waiting for two hours when they finally opened the doors.'),
  B('B1', 'past', ['I', 'never', 'see', 'the sea', 'before', 'I', 'move', 'to Sydney'], 'Pasado perfecto + pasado simple', 'Nunca había visto el mar antes de mudarme a Sídney.', 'I had never seen the sea before I moved to Sydney.'),
  B('B2', 'past', ['she', 'live', 'in Melbourne', 'for ten years', 'before', 'she', 'decide', 'to come back'], 'Pasado perfecto continuo + pasado simple', 'Hacía diez años que vivía en Melbourne cuando decidió volver.', 'She had been living in Melbourne for ten years before she decided to come back.', 'She had lived in Melbourne for ten years before she decided to come back.'),
  B('B1', 'past', ['the kids', 'play', 'outside', 'and', 'their parents', 'have', 'a barbecue'], 'Pasado continuo (dos acciones a la vez)', 'Los chicos estaban jugando afuera y sus padres estaban haciendo un asado.', 'The kids were playing outside and their parents were having a barbecue.'),

  // ───────── Presente perfecto ─────────
  B('B1', 'perfect', ['I', 'live', 'here', 'since 2019'], 'Presente perfecto', 'Vivo acá desde 2019.', 'I have lived here since 2019.', 'I have been living here since 2019.'),
  B('B1', 'perfect', ['we', 'not', 'finish', 'the report', 'yet'], 'Presente perfecto (negativo)', 'Todavía no terminamos el informe.', "We haven't finished the report yet."),
  B('B2', 'perfect', ['you', 'look', 'exhausted', '—', 'you', 'run'], 'Presente simple + presente perfecto continuo', 'Parecés agotado. ¿Estuviste corriendo?', 'You look exhausted. Have you been running?'),
  B('B2', 'perfect', ['how long', 'you', 'learn', 'English'], 'Presente perfecto continuo (pregunta)', '¿Hace cuánto estás aprendiendo inglés?', 'How long have you been learning English?'),
  B('B1', 'perfect', ['she', 'already', 'send', 'three emails', 'this morning'], 'Presente perfecto', 'Ya mandó tres correos esta mañana.', 'She has already sent three emails this morning.'),
  B('B2', 'perfect', ['it', 'rain', 'all day', 'so', 'the roads', 'be', 'flooded'], 'Presente perfecto continuo + presente simple', 'Llovió todo el día, así que las calles están inundadas.', 'It has been raining all day, so the roads are flooded.'),
  B('B1', 'perfect', ['this', 'be', 'the best coffee', 'I', 'ever', 'have'], 'Presente simple + presente perfecto', 'Es el mejor café que tomé en mi vida.', 'This is the best coffee I have ever had.'),
  B('B2', 'perfect', ['I', 'read', 'that book', 'three times', 'but', 'I', 'still', 'not', 'understand', 'the ending'], 'Presente perfecto + presente simple', 'Leí ese libro tres veces pero todavía no entiendo el final.', "I have read that book three times but I still don't understand the ending.", "I've read that book three times, but I still don't understand the ending."),
  B('B1', 'perfect', ['it', 'be', 'two years', 'since', 'I', 'last', 'see', 'my cousin'], 'Presente simple + pasado simple', 'Hace dos años que no veo a mi primo.', "It's been two years since I last saw my cousin.", 'It is two years since I last saw my cousin.'),

  // ───────── Futuro ─────────
  B('B1', 'future', ['look at those clouds', '—', 'it', 'rain'], 'Futuro con going to (hay evidencia)', 'Mirá esas nubes: va a llover.', "Look at those clouds. It's going to rain."),
  B('B1', 'future', ['I', 'be', 'hungry', '—', 'I', 'make', 'a sandwich'], 'Presente + will (decisión en el momento)', 'Tengo hambre. Me voy a hacer un sándwich.', "I'm hungry. I'll make a sandwich."),
  B('B2', 'future', ['this time tomorrow', 'I', 'fly', 'to Perth'], 'Futuro continuo', 'Mañana a esta hora voy a estar volando a Perth.', 'This time tomorrow I will be flying to Perth.'),
  B('C1', 'future', ['by the end of the year', 'we', 'save', 'enough money', 'to buy a car'], 'Futuro perfecto', 'Para fin de año vamos a haber ahorrado suficiente plata para comprar un auto.', 'By the end of the year we will have saved enough money to buy a car.'),
  B('C1', 'future', ['next month', 'I', 'work', 'here', 'for five years'], 'Futuro perfecto continuo', 'El mes que viene voy a cumplir cinco años trabajando acá.', 'Next month I will have been working here for five years.'),
  B('B1', 'future', ['we', 'meet', 'the landlord', 'on Friday at ten'], 'Presente continuo (plan ya arreglado)', 'Nos vamos a reunir con el dueño el viernes a las diez.', 'We are meeting the landlord on Friday at ten.'),
  B('B2', 'future', ['I', 'call', 'you', 'as soon as', 'I', 'land'], 'Will + presente simple (después de as soon as)', 'Te llamo apenas aterrice.', "I'll call you as soon as I land."),
  B('B2', 'future', ['the film', 'start', 'at eight', 'so', 'we', 'have to', 'leave', 'now'], 'Presente simple (horario) + have to', 'La película empieza a las ocho, así que tenemos que irnos ya.', 'The film starts at eight, so we have to leave now.'),
  B('C1', 'future', ['don’t call', 'at nine', '—', 'we', 'have', 'dinner'], 'Imperativo + futuro continuo', 'No llames a las nueve: vamos a estar cenando.', "Don't call at nine. We'll be having dinner."),

  // ───────── Condicionales ─────────
  B('B1', 'cond', ['if', 'it', 'rain', 'tomorrow', 'we', 'stay', 'at home'], 'Primera condicional', 'Si llueve mañana, nos quedamos en casa.', 'If it rains tomorrow, we will stay at home.', 'If it rains tomorrow, we will stay home.'),
  B('B1', 'cond', ['if', 'I', 'have', 'more time', 'I', 'learn', 'to surf'], 'Segunda condicional', 'Si tuviera más tiempo, aprendería a surfear.', 'If I had more time, I would learn to surf.'),
  B('B2', 'cond', ['if', 'you', 'tell', 'me', 'earlier', 'I', 'help', 'you'], 'Tercera condicional', 'Si me hubieras avisado antes, te habría ayudado.', 'If you had told me earlier, I would have helped you.'),
  B('C1', 'cond', ['if', 'I', 'take', 'that job in 2020', 'I', 'live', 'in Canada', 'now'], 'Condicional mixta (pasado → presente)', 'Si hubiera aceptado ese trabajo en 2020, ahora estaría viviendo en Canadá.', 'If I had taken that job in 2020, I would live in Canada now.', 'If I had taken that job in 2020, I would be living in Canada now.'),
  B('C1', 'cond', ['if', 'she', 'not', 'be', 'so shy', 'she', 'speak', 'at the meeting', 'yesterday'], 'Condicional mixta (presente → pasado)', 'Si no fuera tan tímida, habría hablado ayer en la reunión.', "If she weren't so shy, she would have spoken at the meeting yesterday.", "If she wasn't so shy, she would have spoken at the meeting yesterday."),
  B('B2', 'cond', ['unless', 'you', 'leave', 'now', 'you', 'miss', 'the bus'], 'Primera condicional con unless', 'Si no te vas ya, vas a perder el ómnibus.', 'Unless you leave now, you will miss the bus.', 'You will miss the bus unless you leave now.'),
  B('B2', 'cond', ['if', 'I', 'be', 'you', 'I', 'not', 'sign', 'that contract'], 'Segunda condicional (consejo)', 'Yo que vos, no firmaría ese contrato.', "If I were you, I wouldn't sign that contract.", "If I was you, I wouldn't sign that contract."),
  B('B1', 'cond', ['if', 'you', 'heat', 'ice', 'it', 'melt'], 'Condicional cero (siempre pasa)', 'Si calentás hielo, se derrite.', 'If you heat ice, it melts.'),
  B('C1', 'cond', ['as long as', 'you', 'be', 'back', 'by midnight', 'you', 'can', 'take', 'the car'], 'Condición con as long as', 'Siempre que vuelvas antes de medianoche, podés llevarte el auto.', 'As long as you are back by midnight, you can take the car.', 'You can take the car as long as you are back by midnight.'),
  B('B2', 'cond', ['we', 'not', 'get', 'lost', 'if', 'we', 'bring', 'a map'], 'Tercera condicional (negativa)', 'No nos habríamos perdido si hubiéramos llevado un mapa.', "We wouldn't have got lost if we had brought a map.", "We wouldn't have gotten lost if we had brought a map."),

  // ───────── Voz pasiva ─────────
  B('B1', 'passive', ['this house', 'build', 'in 1920'], 'Pasiva en pasado simple', 'Esta casa se construyó en 1920.', 'This house was built in 1920.'),
  B('B2', 'passive', ['the road', 'repair', 'at the moment'], 'Pasiva en presente continuo', 'Están arreglando la ruta en este momento.', 'The road is being repaired at the moment.'),
  B('B2', 'passive', ['my bike', 'steal', 'twice', 'this year'], 'Pasiva en presente perfecto', 'Me robaron la bici dos veces este año.', 'My bike has been stolen twice this year.'),
  B('B2', 'passive', ['the results', 'announce', 'next week'], 'Pasiva en futuro', 'Los resultados se van a anunciar la semana que viene.', 'The results will be announced next week.', 'The results are going to be announced next week.'),
  B('B2', 'passive', ['when', 'I', 'arrive', 'the meeting', 'already', 'cancel'], 'Pasado simple + pasiva en pasado perfecto', 'Cuando llegué, ya habían cancelado la reunión.', 'When I arrived, the meeting had already been cancelled.', 'When I arrived, the meeting had already been canceled.'),
  B('C1', 'passive', ['the documents', 'must', 'sign', 'before Friday'], 'Pasiva con modal', 'Los documentos tienen que firmarse antes del viernes.', 'The documents must be signed before Friday.'),
  B('C1', 'passive', ['I', 'get', 'my hair', 'cut', 'yesterday'], 'Causativa (have / get something done)', 'Ayer me corté el pelo (en la peluquería).', 'I got my hair cut yesterday.', 'I had my hair cut yesterday.'),
  B('C1', 'passive', ['he', 'say', 'to be', 'the richest man in town'], 'Pasiva impersonal (he is said to…)', 'Se dice que es el hombre más rico del pueblo.', 'He is said to be the richest man in town.'),
  B('B2', 'passive', ['the windows', 'clean', 'when', 'we', 'move', 'in'], 'Pasiva en pasado continuo + pasado simple', 'Estaban limpiando las ventanas cuando nos mudamos.', 'The windows were being cleaned when we moved in.'),

  // ───────── Estilo indirecto ─────────
  B('B2', 'reported', ['she', 'say', '“I am tired”'], 'Estilo indirecto', 'Dijo que estaba cansada.', 'She said that she was tired.', 'She said she was tired.'),
  B('B2', 'reported', ['he', 'tell', 'me', '“I will call you tomorrow”'], 'Estilo indirecto (will → would)', 'Me dijo que me llamaría al día siguiente.', 'He told me that he would call me the next day.', 'He told me he would call me the following day.', 'He told me that he would call me the following day.'),
  B('B2', 'reported', ['she', 'ask', 'me', '“Where do you live?”'], 'Pregunta en estilo indirecto', 'Me preguntó dónde vivía.', 'She asked me where I lived.'),
  B('B2', 'reported', ['they', 'ask', '“Have you finished?”'], 'Pregunta sí/no en estilo indirecto', 'Preguntaron si había terminado.', 'They asked if I had finished.', 'They asked whether I had finished.', 'They asked me if I had finished.'),
  B('C1', 'reported', ['my boss', 'tell', 'me', '“Don’t be late again”'], 'Orden en estilo indirecto (told me not to…)', 'Mi jefe me dijo que no llegara tarde otra vez.', 'My boss told me not to be late again.'),
  B('C1', 'reported', ['he', 'admit', '“I broke the window”'], 'Verbo de reporte + -ing', 'Admitió que había roto la ventana.', 'He admitted breaking the window.', 'He admitted that he had broken the window.', 'He admitted having broken the window.'),
  B('C1', 'reported', ['she', 'suggest', '“Let’s go to the beach”'], 'suggest + -ing / that…', 'Sugirió ir a la playa.', 'She suggested going to the beach.', 'She suggested that we go to the beach.', 'She suggested that we should go to the beach.'),
  B('B2', 'reported', ['he', 'say', '“I have been working all night”'], 'Estilo indirecto (perfecto continuo)', 'Dijo que había estado trabajando toda la noche.', 'He said that he had been working all night.', 'He said he had been working all night.'),

  // ───────── Modales en pasado ─────────
  B('B2', 'modals', ['the street', 'be', 'wet', '—', 'it', 'must', 'rain', 'last night'], 'Deducción en pasado (must have)', 'La calle está mojada: debe haber llovido anoche.', 'The street is wet. It must have rained last night.'),
  B('B2', 'modals', ['you', 'should', 'tell', 'me', 'the truth'], 'Crítica del pasado (should have)', 'Me tendrías que haber dicho la verdad.', 'You should have told me the truth.'),
  B('B2', 'modals', ['he', 'can’t', 'see', 'us', '—', 'it', 'be', 'too dark'], 'Deducción negativa (can’t have) + pasado', 'No nos puede haber visto: estaba demasiado oscuro.', "He can't have seen us. It was too dark.", "He couldn't have seen us. It was too dark."),
  B('B2', 'modals', ['she', 'might', 'miss', 'the train'], 'Posibilidad en pasado (might have)', 'Puede que haya perdido el tren.', 'She might have missed the train.', 'She may have missed the train.'),
  B('C1', 'modals', ['we', 'could', 'win', 'but', 'we', 'not', 'try', 'hard enough'], 'Posibilidad que no pasó (could have) + pasado', 'Podríamos haber ganado, pero no nos esforzamos lo suficiente.', "We could have won, but we didn't try hard enough."),
  B('C1', 'modals', ['you', 'need not', 'bring', 'a present', '—', 'but', 'thank you'], 'needn’t have (no hacía falta y lo hiciste)', 'No hacía falta que trajeras un regalo, pero gracias.', "You needn't have brought a present, but thank you.", "You didn't need to bring a present, but thank you."),
  B('B2', 'modals', ['I', 'had to', 'work', 'last Sunday', 'so', 'I', 'can’t', 'come', 'to the party'], 'had to + couldn’t', 'Tuve que trabajar el domingo pasado, así que no pude ir a la fiesta.', "I had to work last Sunday, so I couldn't come to the party.", "I had to work last Sunday, so I couldn't go to the party."),

  // ───────── Deseos y arrepentimientos ─────────
  B('B2', 'wish', ['I', 'wish', 'I', 'speak', 'Portuguese'], 'wish + pasado (presente imaginario)', 'Ojalá hablara portugués.', 'I wish I spoke Portuguese.', 'I wish I could speak Portuguese.'),
  B('B2', 'wish', ['I', 'wish', 'I', 'not', 'eat', 'so much', 'last night'], 'wish + pasado perfecto (arrepentimiento)', 'Ojalá no hubiera comido tanto anoche.', "I wish I hadn't eaten so much last night."),
  B('C1', 'wish', ['if only', 'we', 'leave', 'earlier'], 'If only + pasado perfecto', 'Si tan solo hubiéramos salido antes.', 'If only we had left earlier.'),
  B('C1', 'wish', ['I', 'wish', 'my neighbours', 'stop', 'making noise'], 'wish + would (queja)', 'Ojalá mis vecinos dejaran de hacer ruido.', 'I wish my neighbours would stop making noise.', 'I wish my neighbors would stop making noise.'),
  B('C1', 'wish', ['I', 'would rather', 'you', 'not', 'smoke', 'in the car'], 'would rather + pasado', 'Preferiría que no fumaras en el auto.', "I'd rather you didn't smoke in the car."),
  B('C1', 'wish', ['it', 'be', 'time', 'we', 'go', 'home'], "It's time + pasado", 'Ya es hora de que nos vayamos a casa.', "It's time we went home."),

  // ───────── Costumbres ─────────
  B('B1', 'habits', ['I', 'use to', 'play', 'football', 'every Saturday'], 'used to (costumbre pasada)', 'Antes jugaba al fútbol todos los sábados.', 'I used to play football every Saturday.'),
  B('B1', 'habits', ['she', 'not', 'use to', 'like', 'vegetables'], 'used to (negativo)', 'Antes no le gustaban las verduras.', "She didn't use to like vegetables.", "She didn't used to like vegetables.", 'She never used to like vegetables.'),
  B('B2', 'habits', ['I', 'be', 'used to', 'get up', 'early'], 'be used to + -ing', 'Estoy acostumbrado a levantarme temprano.', "I'm used to getting up early."),
  B('B2', 'habits', ['it', 'take', 'me', 'months', 'to', 'get used to', 'drive', 'on the left'], 'get used to + -ing', 'Me llevó meses acostumbrarme a manejar por la izquierda.', 'It took me months to get used to driving on the left.'),
  B('C1', 'habits', ['every summer', 'my grandfather', 'would', 'take', 'us', 'fishing'], 'would (costumbre pasada)', 'Todos los veranos mi abuelo nos llevaba a pescar.', 'Every summer my grandfather would take us fishing.'),

  // ───────── Estructuras C1 ─────────
  B('C1', 'c1', ['never', 'I', 'see', 'such a beautiful place'], 'Inversión con never (presente perfecto)', 'Nunca vi un lugar tan lindo.', 'Never have I seen such a beautiful place.'),
  B('C1', 'c1', ['not only', 'he', 'arrive', 'late', 'but', 'he', 'also', 'forget', 'the tickets'], 'Inversión con not only… but also', 'No solo llegó tarde, sino que también se olvidó las entradas.', 'Not only did he arrive late, but he also forgot the tickets.'),
  B('C1', 'c1', ['hardly', 'we', 'sit down', 'when', 'the phone', 'ring'], 'Inversión con hardly… when (pasado perfecto)', 'Apenas nos habíamos sentado cuando sonó el teléfono.', 'Hardly had we sat down when the phone rang.'),
  B('C1', 'c1', ['what', 'I', 'need', 'be', 'a long holiday'], 'Oración cleft con what', 'Lo que necesito es unas vacaciones largas.', 'What I need is a long holiday.'),
  B('C1', 'c1', ['it', 'be', 'my sister', 'who', 'find', 'the keys'], 'Oración cleft con it was… who', 'Fue mi hermana la que encontró las llaves.', 'It was my sister who found the keys.', 'It was my sister that found the keys.'),
  B('C1', 'c1', ['have', 'finish', 'the work', 'we', 'go', 'for a drink'], 'Participio perfecto (having + participio)', 'Después de terminar el trabajo, fuimos a tomar algo.', 'Having finished the work, we went for a drink.'),
  B('C1', 'c1', ['had', 'I', 'know', 'about the traffic', 'I', 'take', 'the train'], 'Condicional con inversión (had I known…)', 'Si hubiera sabido del tráfico, habría tomado el tren.', 'Had I known about the traffic, I would have taken the train.'),
  B('C1', 'c1', ['the more', 'you', 'practise', 'the easier', 'it', 'get'], 'the more… the easier', 'Cuanto más practicás, más fácil se vuelve.', 'The more you practise, the easier it gets.', 'The more you practice, the easier it gets.', 'The more you practise, the easier it becomes.'),
  B('C1', 'c1', ['no sooner', 'I', 'arrive', 'than', 'it', 'start', 'to rain'], 'Inversión con no sooner… than', 'Ni bien llegué, empezó a llover.', 'No sooner had I arrived than it started to rain.', 'No sooner had I arrived than it began to rain.'),
  B('C1', 'c1', ['despite', 'feel', 'sick', 'she', 'go', 'to work'], 'despite + -ing', 'A pesar de sentirse mal, fue a trabajar.', 'Despite feeling sick, she went to work.', 'She went to work despite feeling sick.'),
  B('C1', 'c1', ['the man', 'who', 'I', 'speak to', 'yesterday', 'turn out', 'to be', 'the owner'], 'Relativo + turn out to be', 'El hombre con el que hablé ayer resultó ser el dueño.', 'The man who I spoke to yesterday turned out to be the owner.', 'The man I spoke to yesterday turned out to be the owner.', 'The man that I spoke to yesterday turned out to be the owner.', 'The man whom I spoke to yesterday turned out to be the owner.'),
];
