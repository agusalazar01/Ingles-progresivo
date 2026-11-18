import { x, type Expression } from './dsl';

/**
 * Modales y sus construcciones, y formas del inglés hablado. No tienen unidad propia: se practican dentro de las
 * unidades temáticas (cada unidad los usa en su situación) y se consultan en el catálogo.
 */
export const MODAL_EXPR: Expression[] = [
  x('should', 'should + verbo', 'debería', 'modal', 'neutro', 3, 'Consejo u opinión de lo que conviene. No lleva «to» ni -s: «She should go», nunca «she shoulds» ni «should to go».', [
    ['Consejo', 'You should see a doctor.', 'Deberías ir al médico.'],
    ['Negativa', "You shouldn't work so much.", 'No deberías trabajar tanto.'],
    ['Pregunta', 'Should I bring anything?', '¿Llevo algo? / ¿Debería llevar algo?'],
    ['Con continuo', 'We should be leaving soon.', 'Ya nos tendríamos que ir yendo.'],
    ['Expectativa', 'The bus should be here in five minutes.', 'El bus debería llegar en cinco minutos.'],
  ], { vs: 'should (consejo) · must / have to (obligación) · ought to (= should, más formal y menos común)', match: ['should', "shouldn't"] }),
  x('could', 'could + verbo', 'podría / podía', 'modal', 'neutro', 3, 'Tres usos: posibilidad («It could rain»), sugerencia («We could go to the beach») y pasado de can («I could swim when I was five»). También para pedir amablemente: «Could you…?».', [
    ['Sugerencia', 'We could grab a coffee.', 'Podríamos tomar un café.'],
    ['Pedir', 'Could you help me with this?', '¿Me podrías ayudar con esto?'],
    ['Posibilidad', 'It could be a problem.', 'Podría ser un problema.'],
    ['Pasado de can', "I couldn't sleep last night.", 'Anoche no pude dormir.'],
    ['Hipótesis', 'If I had a car, I could drive you.', 'Si tuviera auto, te podría llevar.'],
  ], { vs: 'can (puedo, ahora) · could (podría / podía; más amable) · be able to (para otros tiempos: I will be able to)', match: ['could', "couldn't"] }),
  x('would', 'would + verbo', 'condicional (-ría)', 'modal', 'neutro', 3, 'Es el condicional del español: «I would go» = iría. Se usa en hipótesis («If I won, I would travel»), para ofrecer o pedir con amabilidad («Would you like…?», «I would like…») y para costumbres del pasado («We would go every summer»).', [
    ['Ofrecer', 'Would you like a cuppa?', '¿Querés un té / café?'],
    ['Pedir', "I'd like a flat white, please.", 'Quisiera un flat white, por favor.'],
    ['Hipótesis', 'I would help you, but I have to work.', 'Te ayudaría, pero tengo que trabajar.'],
    ['Condicional 2', "If I had more time, I'd learn to surf.", 'Si tuviera más tiempo, aprendería a surfear.'],
    ['Costumbre pasada', 'We would go to the beach every summer.', 'Íbamos a la playa todos los veranos.'],
  ], { say: 'wud (la l no suena)', match: ['would', "i'd", "you'd", "we'd", "wouldn't", "she'd", "he'd", "they'd"] }),
  x('might', 'might + verbo', 'puede que, capaz que', 'modal', 'neutro', 3, 'Algo posible pero no seguro (menos seguro que will). «We might have a swim» = capaz que nos damos un chapuzón. Muy usado al hablar de planes.', [
    ['Plan posible', 'We might have a swim later.', 'Capaz que nos metemos al agua más tarde.'],
    ['Negativa', "I might not make it tonight.", 'Puede que no llegue esta noche.'],
    ['Continuo', "He might be working, he's not answering.", 'Capaz que está trabajando, no contesta.'],
    ['Pasado (might have)', 'I might have left my keys at work.', 'Puede que me haya olvidado las llaves en el trabajo.'],
  ], { vs: 'will (seguro) · might / may (puede que) · could (es posible)', match: ['might', 'might not', "mightn't"] }),
  x('may', 'may + verbo', 'puede que / ¿puedo…? (formal)', 'modal', 'formal', 2, 'Como might pero un poco más formal: «It may rain». También para pedir permiso en situaciones formales: «May I come in?». En la charla de todos los días se usa más might y can.', [
    ['Posibilidad', 'It may rain this arvo.', 'Puede que llueva esta tarde.'],
    ['Permiso formal', 'May I ask a question?', '¿Puedo hacer una pregunta?'],
    ['Pasado', 'He may have missed the train.', 'Puede que haya perdido el tren.'],
  ], { match: ['may'] }),
  x('must', 'must + verbo', 'tener que / debe de (deducción)', 'modal', 'neutro', 2, 'Dos usos: obligación fuerte o regla («You must wear a helmet») y deducción casi segura («You must be tired» = debés estar cansado). En la charla, para obligaciones se usa más «have to».', [
    ['Regla', 'You must wear a seatbelt.', 'Tenés que usar cinturón.'],
    ['Deducción', 'You must be knackered after that shift.', 'Debés estar muerto después de ese turno.'],
    ['Prohibición', "You mustn't swim outside the flags.", 'No se puede nadar fuera de las banderas.'],
    ['Deducción pasada', 'They must have left already.', 'Ya se deben de haber ido.'],
  ], { vs: "must (regla / deducción) · have to (obligación, lo más común) · mustn't (prohibido) ≠ don't have to (no hace falta)", match: ['must', "mustn't", 'must be', 'must have'] }),
  x('ought-to', 'ought to + verbo', 'debería (más formal)', 'modal', 'formal', 1, 'Significa lo mismo que should, pero suena más formal y se escucha poco en Australia. Conviene reconocerlo.', [
    ['Consejo', 'You ought to call her.', 'Deberías llamarla.'],
    ['Negativa', "You ought not to drive so fast.", 'No deberías manejar tan rápido.'],
  ], { say: 'Ó-tu', match: ['ought to'] }),
  x('have-to', 'have to + verbo', 'tener que', 'modal', 'neutro', 3, "La forma más común de obligación. A diferencia de los modales, cambia con el sujeto y el tiempo: has to, had to, will have to. En el habla: «I've got to» / «I gotta».", [
    ['Presente', 'I have to work tomorrow.', 'Mañana tengo que trabajar.'],
    ['Tercera persona', 'She has to pay the rent on Friday.', 'Ella tiene que pagar el alquiler el viernes.'],
    ['Pasado', 'We had to wait for an hour.', 'Tuvimos que esperar una hora.'],
    ['Futuro', "You'll have to book in advance.", 'Vas a tener que reservar con tiempo.'],
    ['Pregunta', 'Do I have to bring anything?', '¿Tengo que llevar algo?'],
  ], { match: ['have to', 'has to', 'had to', 'have got to', 'got to', 'gotta'] }),
  x('dont-have-to', "don't have to ≠ mustn't", 'no hace falta ≠ no se puede', 'modal', 'neutro', 3, "La trampa clásica: «You don't have to come» = no hace falta que vengas (podés si querés). «You mustn't come» = no podés venir (está prohibido).", [
    ['No hace falta', "You don't have to bring anything.", 'No hace falta que traigas nada.'],
    ['Pasado', "We didn't have to pay.", 'No tuvimos que pagar.'],
    ['Prohibido', "You mustn't smoke here.", 'Acá no se puede fumar.'],
  ], { match: ["don't have to", "doesn't have to", "didn't have to", "mustn't"] }),
  x('should-have', 'should have + participio', 'debería haber…', 'modal', 'neutro', 3, 'Para lamentar o criticar algo del pasado: lo que convenía hacer y no se hizo. En el habla suena «should’ve» (shúd-ov).', [
    ['Lamento', 'I should have brought my sunnies.', 'Me tendría que haber traído los lentes de sol.'],
    ['Negativa', "You shouldn't have paid for me.", 'No tendrías que haber pagado por mí.'],
    ['Crítica', 'He should have called.', 'Tendría que haber llamado.'],
  ], { say: 'SHÚD-ov', match: ['should have', "should've", "shouldn't have"] }),
  x('could-have', 'could have + participio', 'podría haber…', 'modal', 'neutro', 2, 'Algo posible en el pasado que no pasó («We could have won») o una posibilidad sobre el pasado («It could have been worse»).', [
    ['No pasó', 'We could have taken the train.', 'Podríamos haber tomado el tren.'],
    ['Alivio', 'It could have been worse.', 'Podría haber sido peor.'],
    ['Reproche', 'You could have told me!', '¡Me podrías haber avisado!'],
  ], { say: 'KÚD-ov', match: ['could have', "could've", "couldn't have"] }),
  x('would-have', 'would have + participio', 'habría…', 'modal', 'neutro', 2, 'Condicional del pasado (tercer condicional): lo que habría pasado. «If I had known, I would have come» = si hubiera sabido, habría venido.', [
    ['Condicional 3', 'If I had known, I would have come.', 'Si hubiera sabido, habría venido.'],
    ['Corto', "I'd have helped you.", 'Te habría ayudado.'],
    ['Negativa', "I wouldn't have done that.", 'Yo no habría hecho eso.'],
  ], { say: 'WÚD-ov', match: ['would have', "would've", "wouldn't have", "i'd have"] }),
  x('might-have', 'might have + participio', 'puede que haya…', 'modal', 'neutro', 2, 'Una posibilidad sobre algo que ya pasó, sin estar seguro.', [
    ['Posibilidad', 'I might have left it on the bus.', 'Puede que lo haya dejado en el bus.'],
    ['Negativa', "She might not have seen your message.", 'Capaz que no vio tu mensaje.'],
  ], { match: ['might have', "might've"] }),
  x('must-have', 'must have + participio', 'debe de haber…', 'modal', 'neutro', 2, 'Deducción casi segura sobre el pasado: «The road is wet. It must have rained».', [
    ['Deducción', 'It must have rained last night.', 'Debe de haber llovido anoche.'],
    ['Persona', 'He must have missed the train.', 'Debe de haber perdido el tren.'],
    ['Lo contrario', "She can't have finished already.", 'No puede ser que ya haya terminado.'],
  ], { match: ['must have', "must've", "can't have"] }),
  x('be-able-to', 'be able to + verbo', 'poder (en otros tiempos)', 'modal', 'neutro', 2, 'Can no se combina con will ni con have: no existe «will can» ni «have could». Para eso: «I will be able to», «I have been able to». (Para planes, «I can help you tomorrow» está bien.)', [
    ['Futuro', "I'll be able to help you tomorrow.", 'Mañana te voy a poder ayudar.'],
    ['Presente perfecto', "I haven't been able to call him.", 'No lo pude llamar (todavía).'],
    ['Pasado (logro)', 'We were able to fix it.', 'Pudimos arreglarlo.'],
  ], { match: ['able to'] }),
  x('used-to', 'used to + verbo', 'solía, antes…', 'modal', 'neutro', 2, 'Algo que hacías antes y ya no. No confundir con «be used to + -ing» (estar acostumbrado).', [
    ['Antes sí', 'I used to work in a café.', 'Antes trabajaba en un café.'],
    ['Negativa', "I didn't use to like coffee.", 'Antes no me gustaba el café.'],
    ['Acostumbrado', "I'm used to working early.", 'Estoy acostumbrado a trabajar temprano.'],
  ], { say: 'IÚS-tu', match: ['used to', 'use to'] }),

  // ── Inglés hablado ──
  x('gonna', 'gonna = going to', 'voy a… (hablado)', 'contraccion', 'informal', 3, 'Así suena «going to» + verbo en la charla rápida. Se escucha todo el tiempo; al escribir algo formal, mejor «going to». Solo cuando va un verbo atrás: «I’m gonna eat», pero «I’m going to the beach» (no gonna).', [
    ['Plan', "I'm gonna grab a coffee.", 'Voy a ir a buscar un café.'],
    ['Pregunta', 'Are you gonna come?', '¿Vas a venir?'],
    ['Escrito', "I'm going to grab a coffee.", 'Voy a ir a buscar un café.'],
  ], { say: 'GÓ-na', match: ['gonna'] }),
  x('wanna', 'wanna = want to', 'querer (hablado)', 'contraccion', 'informal', 3, '«Wanna come?» = Do you want to come? Muy común en la charla y en mensajes. Con un sustantivo es «want a»: «Wanna beer?» también se escucha.', [
    ['Invitar', 'Wanna come?', '¿Querés venir?'],
    ['Plan', 'I wanna go to the beach.', 'Quiero ir a la playa.'],
    ['Escrito', 'Do you want to come?', '¿Querés venir?'],
  ], { say: 'UÓ-na', match: ['wanna'] }),
  x('gotta', "gotta = have got to / have to", 'tengo que (hablado)', 'contraccion', 'informal', 3, "«I gotta go» = I have to go. Se escucha mucho al despedirse.", [
    ['Despedida', 'I gotta go, mate.', 'Me tengo que ir, bo.'],
    ['Completa', "I've got to work early.", 'Tengo que trabajar temprano.'],
  ], { say: 'GÓ-ta', match: ['gotta', 'got to'] }),
  x('dunno', "dunno = don't know", 'ni idea, no sé', 'contraccion', 'muy informal', 2, '«I dunno» = I don\'t know. Solo hablado o en mensajes entre amigos.', [
    ['Respuesta', 'I dunno, maybe.', 'No sé, capaz.'],
    ['Completa', "I don't know where it is.", 'No sé dónde está.'],
  ], { say: 'da-NÓU', match: ['dunno'] }),
  x('ya', 'ya = you', 'vos / te (hablado)', 'contraccion', 'muy informal', 3, '«ya» reemplaza a «you» en frases hechas: How ya going?, See ya, Catch ya, Good on ya, Thank ya.', [
    ['Saludo', 'How ya going?', '¿Cómo andás?'],
    ['Despedida', 'See ya tomorrow!', '¡Nos vemos mañana!'],
  ], { match: ['ya'] }),
  x('aux-contractions', "I'll · I'd · I've · we're", 'contracciones de auxiliares', 'contraccion', 'neutro', 3, "En el habla, los auxiliares se pegan al sujeto: I will → I'll, I would / I had → I'd, I have → I've, we are → we're. Entenderlas es clave para seguir una charla rápida.", [
    ['will', "I'll flick you a message.", 'Te mando un mensaje.'],
    ['would', "I'd love to come.", 'Me encantaría ir.'],
    ['have', "I've been flat out.", 'Estuve a full.'],
    ['are', "We're heading out.", 'Estamos saliendo.'],
  ]),
];
