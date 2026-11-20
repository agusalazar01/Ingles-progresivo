import type { Level } from './types';

/**
 * El camino: secciones con una meta para comunicarte. Cada sección reúne unidades (gramática y situaciones) y suma
 * escucha, roleplay, cuento, práctica, una postal y un repaso final. Las unidades no cambian: el camino las ordena.
 */
export interface Postcard {
  title: string;
  /** Dato cultural (en español). */
  fact: string;
  /** Expresión australiana con su traducción. */
  phrase: string;
  es: string;
}

export interface PathSection {
  id: string;
  level: Level;
  /** Meta comunicativa, en voseo. */
  title: string;
  /** Unidades que la forman (en orden). Cada una aporta sus escalones como nodos. */
  units: string[];
  /** Roleplays de la sección (ids del catálogo). */
  roleplays: string[];
  /** Cuento libre (id de FREE_STORIES) con su análisis, si ya está armado. */
  story?: string;
  postcard: Postcard;
}

export const LEVEL_GOALS: Record<Level, string> = {
  A1: 'I can introduce myself and talk about my everyday life.',
  A2: 'I can handle everyday situations: food, plans, shopping and getting around.',
  B1: 'I can live and work in English: housing, health, work and problems.',
  B2: 'I can tell stories and talk about my experiences in detail.',
  C1: 'I can express myself precisely and naturally on almost any topic.',
};

const pc = (title: string, fact: string, phrase: string, es: string): Postcard => ({ title, fact, phrase, es });

export const SECTIONS: PathSection[] = [
  // ───── A1 ─────
  {
    id: 'a1-1', level: 'A1', title: 'Saludá y presentate', units: ['to-be', 'pronouns', 'ctx-greetings'], roleplays: ['56-introducing-yourself', '66-making-small-talk'], story: 'punishment',
    postcard: pc("G'day", "En Australia se saluda con «G'day» a cualquier hora, y es normal que alguien que no conocés (el chofer, la cajera) te pregunte «How are you going?». No espera una respuesta larga: con «Good, thanks. You?» alcanza.", "How ya going?", '¿Cómo andás?'),
  },
  {
    id: 'a1-family', level: 'A1', title: 'Tu familia y tu gente', units: ['ctx-family'], roleplays: ['57-making-friends-at-a-hostel', '10-meeting-roommates'], story: 'zama',
    postcard: pc('Nan y pop', 'Muchos australianos les dicen «nan» y «pop» a los abuelos, y «mum» (no mom) a la mamá. A la pareja, casados o no, se le dice «partner».', "I'm off to see Nan this arvo.", 'Esta tarde voy a ver a la abuela.'),
  },
  {
    id: 'a1-2', level: 'A1', title: 'Las cosas y la gente', units: ['articles-plurals', 'sounds-vowels'], roleplays: ['3-collecting-your-luggage'], story: 'counting-animals',
    postcard: pc('El arvo', 'Los australianos acortan casi todo y le agregan -o o -ie: afternoon → arvo, breakfast → brekkie, service station → servo. Si no entendés una palabra rara, probá pensar cuál palabra larga acortaron.', 'See you this arvo!', '¡Nos vemos esta tarde!'),
  },
  {
    id: 'a1-3', level: 'A1', title: 'Contá tu rutina', units: ['pres-simple', 'vocab-daily'], roleplays: ['59-talking-about-your-job', '64-talking-about-hobbies'], story: 'tom-bananas',
    postcard: pc('Smoko', 'En muchos trabajos (sobre todo de campo y de obra) hay un descanso corto a media mañana: el «smoko». Es el momento de tomar un té y charlar con los compañeros.', "When's smoko?", '¿A qué hora es el descanso?'),
  },
  {
    id: 'a1-4', level: 'A1', title: 'Tu barrio y tu casa', units: ['there-is', 'prep-time-place'], roleplays: ['9-arriving-at-a-hostel', '13-looking-for-a-room'], story: 'tall-man',
    postcard: pc('La noche de la basura', 'En Australia cada casa tiene contenedores de colores (basura, reciclaje, jardín) y una noche fija para sacarlos a la calle: «bin night».', "It's bin night tonight.", 'Hoy hay que sacar la basura.'),
  },
  {
    id: 'a1-5', level: 'A1', title: 'Preguntá de todo', units: ['questions'], roleplays: ['38-asking-about-the-menu', '11-asking-for-recommendations'], story: 'like-to-read',
    postcard: pc('No worries', '«No worries» sirve para casi todo: de nada, no pasa nada, dale. Si alguien te agradece, es la respuesta más australiana que hay.', 'No worries, mate.', 'De nada, bo.'),
  },
  {
    id: 'a1-6', level: 'A1', title: 'Qué estás haciendo y qué podés hacer', units: ['pres-cont', 'can'], roleplays: ['61-making-weekend-plans', '7-using-public-transport'], story: 'what-doing',
    postcard: pc('Flat white', 'El café más pedido en Australia es el «flat white»: espresso con leche cremosa y poca espuma. Pedirlo con «Can I get a flat white, please?» es lo más natural.', 'Can I get a flat white, please?', '¿Me das un flat white, por favor?'),
  },
  // ───── A2 ─────
  {
    id: 'a2-1', level: 'A2', title: 'Contá lo que hiciste', units: ['past-simple', 'sounds-endings'], roleplays: ['58-talking-about-your-country'], story: 'hippos',
    postcard: pc('Footy', 'En Melbourne «footy» es el fútbol australiano (AFL), no el fútbol. En Sydney y Brisbane muchas veces es el rugby. Al fútbol se le dice «soccer».', 'Are you going to the footy?', '¿Vas al partido?'),
  },
  {
    id: 'a2-2', level: 'A2', title: 'En el súper y el café', units: ['countables', 'ctx-food'], roleplays: ['33-ordering-coffee', '47-buying-groceries'], story: 'goat-dog-cow',
    postcard: pc('My shout', 'En el pub los australianos se turnan para pagar las rondas: «It\'s my shout» = invito yo. Si alguien te invitó, la próxima te toca a vos.', "It's my shout.", 'Invito yo.'),
  },
  {
    id: 'a2-shopping', level: 'A2', title: 'De compras', units: ['ctx-shopping'], roleplays: ['44-shopping-for-clothes', '45-trying-on-clothes'], story: 'dog-shadow',
    postcard: pc('On special', 'En los súper australianos vas a ver carteles de «on special» o «half price» todas las semanas. Casi todo se paga apoyando la tarjeta o el celular («tap»), y en la caja te preguntan «Do you need a bag?»: las bolsas se cobran.', 'Is this on special?', '¿Esto está en promo?'),
  },
  {
    id: 'a2-3', level: 'A2', title: 'Hacé planes', units: ['future', 'ctx-plans'], roleplays: ['60-talking-about-your-plans', '62-inviting-someone-for-a-drink'], story: 'milkmaid',
    postcard: pc('Keen', '«Keen» = con ganas. Si te invitan a algo y querés ir, la respuesta típica es «Yeah, keen!». Si no podés: «Can I take a rain check?».', "Yeah, I'm keen!", '¡Sí, me prendo!'),
  },
  {
    id: 'a2-4', level: 'A2', title: 'Un día de playa', units: ['ctx-beach', 'comparatives'], roleplays: ['65-understanding-australian-slang'], story: 'chicken-millipede',
    postcard: pc('Las banderas', 'En las playas australianas se nada siempre entre las banderas rojas y amarillas: ahí vigilan los guardavidas. Fuera de ellas puede haber corrientes (rips) muy peligrosas.', 'Swim between the flags.', 'Nadá entre las banderas.'),
  },
  {
    id: 'a2-weather', level: 'A2', title: 'El clima y el aire libre', units: ['ctx-weather'], roleplays: ['r18-discussing-weather-conditions'], story: 'north-wind',
    postcard: pc('Slip, slop, slap', 'El sol australiano es de los más fuertes del mundo. Desde los años 80 la campaña «Slip, slop, slap» enseña: ponete remera, protector y sombrero. En verano el índice UV llega a «extreme».', "It's stinking hot today.", 'Hoy hace un calor insoportable.'),
  },
  {
    id: 'a2-5', level: 'A2', title: 'Contá una escena', units: ['past-cont', 'collocations'], roleplays: ['67-handling-misunderstandings'], story: 'lion-mouse',
    postcard: pc('Yarn', '«Have a yarn» es charlar un rato, contar una historia. En las comunidades aborígenes, el «yarning» es una forma tradicional de conversar y compartir.', "Let's have a yarn.", 'Charlemos un rato.'),
  },
  {
    id: 'a2-6', level: 'A2', title: 'Moverte por la ciudad', units: ['ctx-transport'], roleplays: ['8-buying-a-transport-card', '121-asking-for-directions', '156-talking-to-an-attendant-at-a-servo'], story: 'town-mouse',
    postcard: pc('La tarjeta de transporte', 'Cada ciudad tiene su tarjeta: Opal en Sydney, myki en Melbourne, go card en Brisbane. En varias ciudades también podés pagar tocando con la tarjeta de débito.', 'I need to top up my card.', 'Tengo que cargar la tarjeta.'),
  },
  // ───── B1 ─────
  {
    id: 'b1-1', level: 'B1', title: 'Lo que ya viviste', units: ['pres-perfect', 'ctx-house'], roleplays: ['16-meeting-potential-housemates', '22-discussing-house-rules'], story: 'grandmas-bananas',
    postcard: pc('El bond', 'Al alquilar se paga un depósito («bond»), en general cuatro semanas de alquiler. No lo guarda el dueño: va a un organismo del estado y te lo devuelven al irte si la casa queda bien.', "Do I have to pay a bond?", '¿Tengo que pagar depósito?'),
  },
  {
    id: 'b1-2', level: 'B1', title: 'Cómo te sentís', units: ['ctx-feelings', 'future-cont'], roleplays: ['66-making-small-talk'], story: 'children-of-wax',
    postcard: pc('Yeah, nah', 'En Australia «Yeah, nah» significa «no» y «Nah, yeah» significa «sí». Lo que cuenta es la última palabra.', 'Yeah, nah, all good.', 'No, todo bien.'),
  },
  {
    id: 'b1-3', level: 'B1', title: 'Resolvé problemas', units: ['phrasal-1', 'ctx-problems'], roleplays: ['28-having-a-problem-with-your-card', '12-dealing-with-a-problem-at-the-hostel'], story: 'anansi',
    postcard: pc('She\'ll be right', '«She\'ll be right» es la filosofía australiana de que todo se va a arreglar. Se dice para tranquilizar a alguien (aunque a veces también para no preocuparse demasiado).', "She'll be right, mate.", 'Ya se va a arreglar, bo.'),
  },
  {
    id: 'b1-4', level: 'B1', title: 'Cuidá tu salud', units: ['ctx-health'], roleplays: ['53-going-to-the-doctor', '51-visiting-a-pharmacy'], story: 'sakima',
    postcard: pc('El GP y el 000', 'Para casi todo vas primero al GP (médico clínico). En una emergencia el número es el 000 («triple zero»). Medicare cubre a los residentes; si estás de visita, conviene tener seguro.', 'Call triple zero!', '¡Llamá al 000!'),
  },
  {
    id: 'b1-5', level: 'B1', title: 'El laburo', units: ['ctx-work', 'relatives'], roleplays: ['31-understanding-your-payslip', '32-asking-about-superannuation'], story: 'grasshopper-ants',
    postcard: pc('Super', 'Además del sueldo, el empleador aporta un porcentaje a tu «super» (superannuation), un fondo de jubilación. Si trabajaste con visa temporal, cuando te vas podés pedir que te lo devuelvan.', "What's your super fund?", '¿Cuál es tu fondo de jubilación?'),
  },
  {
    id: 'b1-jobhunt', level: 'B1', title: 'Buscar trabajo', units: ['ctx-jobhunt'], roleplays: ['85-calling-about-a-job-advertisement', '87-following-up-on-an-application', '89-explaining-your-availability'], story: 'shepherds-boy',
    postcard: pc('El trial shift', 'En muchos cafés y restaurantes te piden un «trial shift» (turno de prueba) antes de contratarte. Si dura más que una demostración corta, por ley te lo tienen que pagar. Y desconfiá del «cash in hand»: sin recibo no tenés seguro ni super.', "I'm available to start straight away.", 'Puedo empezar ya mismo.'),
  },
  {
    id: 'b1-6', level: 'B1', title: 'Si tuvieras plata…', units: ['cond-1-2', 'ctx-money'], roleplays: ['49-comparing-prices', '114-buying-a-used-car'], story: 'golden-eggs',
    postcard: pc('Exy', 'Australia es cara: «exy» (expensive) es de las palabras que más vas a escuchar. Los martes muchos cines tienen precio rebajado y las tiendas de «op shop» venden ropa usada barata.', "It's so exy!", '¡Está carísimo!'),
  },
  {
    id: 'b1-7', level: 'B1', title: 'Noticias y procesos', units: ['passive', 'connectors'], roleplays: ['30-applying-for-a-tfn'], story: 'hen-eagle',
    postcard: pc('El TFN', 'Para trabajar necesitás un Tax File Number (TFN). Se pide gratis en internet; si alguien te cobra por tramitarlo, desconfiá.', "I've applied for my TFN.", 'Ya pedí mi número de contribuyente.'),
  },
  {
    id: 'b1-8', level: 'B1', title: 'Australia y el inglés real', units: ['aussie', 'connected-speech'], roleplays: ['63-going-to-a-pub', '158-visiting-a-national-park-information-centre'], story: 'vusi',
    postcard: pc('El acento', 'En el habla rápida las palabras se pegan: «Whaddaya reckon?» = What do you reckon? No es que hablen mal: es el inglés conectado. Escuchar mucho es la clave.', 'Whaddaya reckon?', '¿Qué te parece?'),
  },
  // ───── B2 ─────
  {
    id: 'b2-1', level: 'B2', title: 'Contá historias', units: ['pres-perf-cont', 'past-perfect', 'ctx-stories'], roleplays: ['159-checking-in-at-a-campground', '160-getting-ready-for-a-bushwalk'], story: 'after-twenty-years',
    postcard: pc('Henry Lawson', 'Henry Lawson (1867–1922) es el gran cuentista australiano: sus historias del bush retratan la vida dura del campo con humor. Sus textos son de dominio público.', 'The bush is a hard place.', 'El campo australiano es un lugar duro.'),
  },
  {
    id: 'b2-2', level: 'B2', title: 'Lo que había pasado', units: ['past-perf-cont', 'false-friends'], roleplays: ['46-returning-an-item'], story: 'hearts-and-hands',
    postcard: pc('Falsos amigos', '«Actually» no es actualmente, «realise» no es realizar y «eventually» no es eventualmente. Son de los errores más comunes de los hispanohablantes.', 'I eventually realised it.', 'Al final me di cuenta.'),
  },
  {
    id: 'b2-news', level: 'B2', title: 'Noticias y chismes', units: ['ctx-news'], roleplays: ['112-having-a-conversation-with-coworkers', '143-explaining-a-misunderstanding'], story: 'lady-or-tiger',
    postcard: pc('Word gets around', 'En los pueblos chicos de Australia todo se sabe: el pub y la panadería son el centro de las noticias. Para contar algo sin asegurarlo, los australianos dicen mucho «apparently» y «I reckon».', 'Apparently, the pub is closing.', 'Por lo visto, cierra el pub.'),
  },
  {
    id: 'b2-3', level: 'B2', title: 'Hablá con propiedad', units: ['gerund-inf', 'register'], roleplays: ['24-speaking-to-a-bank-employee'], story: 'open-window',
    postcard: pc('El registro', 'Con amigos «Cheers, mate»; con un jefe nuevo o en un trámite, «Thank you very much». Cambiar de registro según la situación es clave en el trabajo.', 'Thank you for your time.', 'Gracias por su tiempo.'),
  },
  {
    id: 'b2-4', level: 'B2', title: 'Lo que dijo', units: ['reported'], roleplays: ['138-disputing-an-incorrect-bill'], story: 'selfish-giant',
    postcard: pc('Fair dinkum', '«Fair dinkum» = de verdad, auténtico. Es una expresión clásica: hoy se escucha menos, pero aparece en canciones, publicidades y entre la gente mayor.', 'Fair dinkum?', '¿En serio?'),
  },
  // ───── C1 ─────
  {
    id: 'c1-1', level: 'C1', title: 'Lo que habría pasado', units: ['cond-3', 'past-modals'], roleplays: ['144-making-a-complaint'], story: 'gift-of-the-magi',
    postcard: pc('Tall poppy', 'El «tall poppy syndrome» es la tendencia australiana a criticar a quien se cree más que los demás. Por eso se valora tanto la humildad.', "Don't be a tall poppy.", 'No te la creas.'),
  },
  {
    id: 'c1-debate', level: 'C1', title: 'Opinar y debatir', units: ['ctx-debate'], roleplays: ['153-you-meet-someone-from-another-country', '154-you-have-to-explain-something-complicated'], story: 'lumber-room',
    postcard: pc('To be fair', 'En una discusión, los australianos suavizan mucho: «To be fair…», «Fair enough», «Yeah, nah». Contradecir de frente se siente brusco; reconocer primero el punto del otro es lo normal.', 'To be fair, you have a point.', 'Para ser justos, tenés razón.'),
  },
  {
    id: 'c1-2', level: 'C1', title: 'Mirando al futuro', units: ['future-perf', 'future-perf-cont'], roleplays: ['123-planning-a-road-trip'], story: 'story-teller',
    postcard: pc('Mateship', 'La «mateship» (el compañerismo, bancarse entre amigos) es uno de los valores más nombrados de la cultura australiana.', "You're a top mate.", 'Sos un amigazo.'),
  },
  {
    id: 'c1-3', level: 'C1', title: 'Estilo avanzado', units: ['inversion'], roleplays: ['155-you-need-to-defend-your-opinion'], story: 'tell-tale-heart',
    postcard: pc('Understatement', 'Los australianos suelen decir menos de lo que sienten: «not bad» puede significar «excelente» y «a bit of a problem» puede ser un problema grave.', 'Not too bad at all.', 'Nada mal (o sea, buenísimo).'),
  },
];
