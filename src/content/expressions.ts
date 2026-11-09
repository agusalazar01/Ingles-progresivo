import type { Level } from './types';

/**
 * «Formas de decir»: expresiones naturales del inglés (no solo australianas), agrupadas por lo que querés
 * decir. Cada grupo tiene varias maneras de decirlo y cuándo conviene cada una, más situaciones para
 * elegir la mejor. Para sumar grupos alcanza con agregar datos acá.
 */
export interface Way {
  en: string;
  /** Forma general para elegir en las situaciones (si el ejemplo es muy concreto). */
  form?: string;
  es: string;
  /** Cuándo usarla: registro (informal / neutro / formal) y matiz. */
  when: string;
}

export interface ExpressionGroup {
  id: string;
  level: Level;
  /** La idea, en español. */
  idea: string;
  ways: Way[];
  /** Situaciones para elegir la mejor forma: [situación, índice de la mejor, por qué]. */
  situations: [string, number, string][];
}

export const EXPRESSIONS: ExpressionGroup[] = [
  {
    id: 'costumbre',
    level: 'B1',
    idea: 'Costumbres: antes sí, ahora me acostumbro, le agarro la mano',
    ways: [
      { en: 'I used to work at night.', form: 'I used to + verbo…', es: 'Antes trabajaba de noche (ya no).', when: 'Used to + verbo: algo que hacías antes y ya no.' },
      { en: "I'm used to working at night.", form: "I'm used to + -ing…", es: 'Estoy acostumbrado a trabajar de noche.', when: 'Be used to + -ing: algo que ya te resulta normal.' },
      { en: "I'm getting used to it.", es: 'Me estoy acostumbrando.', when: 'Get used to + -ing / cosa: el proceso de acostumbrarte.' },
      { en: "I'm getting the hang of it.", es: 'Le estoy agarrando la mano.', when: 'Informal: cuando algo que te costaba (una tarea, una máquina) te empieza a salir.' },
    ],
    situations: [
      ['Hace un mes que manejás del lado izquierdo y ya no te parece raro.', 1, 'Ya te resulta normal: be used to.'],
      ['Tu jefe te pregunta qué tal con la máquina de café nueva; al principio te costaba y ahora te sale cada vez mejor.', 3, 'Algo que te empieza a salir: getting the hang of it.'],
      ['Contás que en Uruguay jugabas al fútbol todos los domingos, pero acá ya no.', 0, 'Algo de antes que ya no hacés: used to.'],
      ['Llegaste hace una semana y el acento todavía te cuesta, pero cada día un poco menos.', 2, 'Es un proceso que está pasando: getting used to.'],
    ],
  },
  {
    id: 'cansado',
    level: 'A2',
    idea: 'Estoy cansado',
    ways: [
      { en: "I'm tired.", es: 'Estoy cansado.', when: 'Neutro, para cualquier situación.' },
      { en: "I'm exhausted.", es: 'Estoy agotado.', when: 'Más fuerte que tired.' },
      { en: "I'm knackered.", es: 'Estoy muerto.', when: 'Muy informal (Australia y Reino Unido). Con amigos o compañeros.' },
      { en: "I'm worn out.", es: 'Estoy destruido, sin energía.', when: 'Informal; después de mucho esfuerzo o muchos días.' },
    ],
    situations: [
      ['Después de un turno de 12 horas, un compañero te pregunta cómo estás.', 2, 'Entre compañeros, informal y fuerte: knackered.'],
      ['El médico te pregunta cómo te sentís últimamente.', 0, 'Con el médico, neutro y claro: tired.'],
      ['Corriste una media maratón y apenas podés hablar.', 1, 'Cansancio extremo: exhausted.'],
    ],
  },
  {
    id: 'no-entiendo',
    level: 'A2',
    idea: 'No entendí / no te sigo',
    ways: [
      { en: "Sorry, I didn't catch that.", es: 'Perdón, no te escuché / no lo agarré.', when: 'Cuando no oíste o no entendiste una palabra o frase. Muy natural.' },
      { en: 'Could you say that again, please?', es: '¿Podrías repetirlo, por favor?', when: 'Amable, sirve con cualquiera (jefe, banco, cliente).' },
      { en: "I'm not following you.", es: 'No te estoy siguiendo.', when: 'Cuando la explicación se te perdió, no una palabra suelta.' },
      { en: "It's all Greek to me.", es: 'No entiendo nada (es chino para mí).', when: 'Frase hecha, con humor: cuando algo te resulta totalmente incomprensible.' },
    ],
    situations: [
      ['Un cliente te dice su pedido rápido y con ruido de fondo.', 0, 'No oíste bien: didn’t catch that.'],
      ['El supervisor te explica un procedimiento largo y te perdiste a mitad.', 2, 'Te perdiste en la explicación: not following you.'],
      ['Te muestran el formulario de impuestos y no entendés absolutamente nada; lo decís riéndote.', 3, 'Con humor, nada se entiende: all Greek to me.'],
    ],
  },
  {
    id: 'facil',
    level: 'B1',
    idea: 'Es fácil / no es tan fácil',
    ways: [
      { en: "It's a piece of cake.", es: 'Es pan comido.', when: 'Informal: algo muy fácil.' },
      { en: "It's not rocket science.", es: 'No es nada del otro mundo.', when: 'Informal: para tranquilizar a alguien, «no es tan complicado».' },
      { en: "It's easier said than done.", es: 'Es fácil decirlo, pero hacerlo no.', when: 'Cuando alguien da un consejo que en la práctica cuesta.' },
      { en: 'Too easy!', es: '¡Fácil! / ¡Dale!', when: 'Muy australiano: para aceptar algo sin problema.' },
    ],
    situations: [
      ['Un amigo te dice «solo tenés que dejar de gastar plata» y vos sabés que no es tan simple.', 2, 'Fácil decirlo, difícil hacerlo.'],
      ['Tu jefe te pide que cierres la caja y te parece facilísimo.', 3, 'Aceptar algo sin problema, en Australia: too easy.'],
      ['Un compañero nuevo tiene miedo de usar la máquina de lavar copas; le decís que es simple.', 1, 'Para tranquilizar: not rocket science.'],
    ],
  },
  {
    id: 'gusta',
    level: 'B1',
    idea: 'Me gusta mucho / no es lo mío',
    ways: [
      { en: "I'm really into surfing.", form: "I'm really into…", es: 'Me copa mucho el surf.', when: 'Informal: un interés o hobby que te engancha.' },
      { en: "I'm a big fan of Thai food.", form: "I'm a big fan of…", es: 'Soy fan de la comida tailandesa.', when: 'Neutro, para algo que te gusta mucho.' },
      { en: "It's not my cup of tea.", es: 'No es lo mío.', when: 'Amable: decir que algo no te gusta sin ofender.' },
      { en: "I can't stand waiting.", form: "I can't stand…", es: 'No soporto esperar.', when: 'Fuerte: algo que te molesta mucho.' },
    ],
    situations: [
      ['Te invitan a ver ópera y no te gusta, pero no querés quedar mal.', 2, 'Amable: not my cup of tea.'],
      ['Contás tu hobby nuevo, que te tiene enganchado.', 0, 'Un interés que te engancha: really into.'],
      ['Explicás algo que te pone de mal humor: las filas largas.', 3, 'Algo que te molesta mucho: can’t stand.'],
    ],
  },
  {
    id: 'precio',
    level: 'B1',
    idea: 'Caro o barato',
    ways: [
      { en: 'It costs an arm and a leg.', es: 'Sale un ojo de la cara.', when: 'Frase hecha: algo carísimo.' },
      { en: "It's a rip-off.", es: 'Es un robo.', when: 'Informal: caro y además injusto, no lo vale.' },
      { en: "It's a bargain.", es: 'Es una ganga.', when: 'Algo barato para lo que es.' },
      { en: "It's good value.", es: 'Vale lo que cuesta.', when: 'Neutro: buena relación precio-calidad.' },
    ],
    situations: [
      ['Pagaste 12 dólares por un café chico y malo en el aeropuerto.', 1, 'Caro y no lo vale: rip-off.'],
      ['Encontraste unas botas de trabajo de 200 dólares a 40.', 2, 'Muy barato para lo que es: bargain.'],
      ['El alquiler en Sídney es carísimo.', 0, 'Carísimo: costs an arm and a leg.'],
    ],
  },
  {
    id: 'ocupado',
    level: 'B1',
    idea: 'Estoy muy ocupado',
    ways: [
      { en: "I'm flat out.", es: 'Estoy a full.', when: 'Australiano e informal.' },
      { en: "I've got a lot on my plate.", es: 'Tengo muchas cosas encima.', when: 'Neutro: muchas responsabilidades a la vez.' },
      { en: "I'm snowed under.", es: 'Estoy tapado de trabajo.', when: 'Informal: muchísimo trabajo pendiente.' },
      { en: "I'm tied up at the moment.", es: 'Estoy ocupado en este momento.', when: 'Más formal: con clientes, jefes o por teléfono.' },
    ],
    situations: [
      ['Te llama un cliente mientras atendés a otro.', 3, 'Más formal: tied up at the moment.'],
      ['Un amigo te invita a salir y estás con mil cosas: mudanza, trabajo, papeles.', 1, 'Muchas responsabilidades: a lot on my plate.'],
      ['En el descanso un compañero australiano te pregunta qué tal la semana, que fue de locos.', 0, 'Entre australianos, informal: flat out.'],
    ],
  },
  {
    id: 'pensar',
    level: 'B1',
    idea: 'Lo voy a pensar / ya decidí',
    ways: [
      { en: 'Let me sleep on it.', es: 'Dejame consultarlo con la almohada.', when: 'Para pedir un día antes de decidir algo importante.' },
      { en: "I'll think it over.", es: 'Lo voy a pensar.', when: 'Neutro, cualquier decisión.' },
      { en: "I'm in two minds.", es: 'Estoy entre dos opciones / no me decido.', when: 'Cuando dudás entre dos cosas.' },
      { en: "I've made up my mind.", es: 'Ya me decidí.', when: 'Cuando ya tomaste la decisión.' },
    ],
    situations: [
      ['Te ofrecen un trabajo en otra ciudad y querés pensarlo hasta mañana.', 0, 'Un día para decidir: sleep on it.'],
      ['No sabés si quedarte en Sídney o irte a Melbourne.', 2, 'Dudás entre dos: in two minds.'],
      ['Ya decidiste comprar el auto y nadie te va a convencer de lo contrario.', 3, 'Decisión tomada: made up my mind.'],
    ],
  },
  {
    id: 'suerte',
    level: 'B1',
    idea: 'Suerte / lo lograste',
    ways: [
      { en: 'Good luck!', es: '¡Suerte!', when: 'Neutro, para cualquier cosa.' },
      { en: 'Fingers crossed!', es: '¡Crucemos los dedos!', when: 'Cuando esperás que algo salga bien (vos o el otro).' },
      { en: 'Break a leg!', es: '¡Mucha mierda! (suerte)', when: 'Antes de una actuación, presentación o entrevista.' },
      { en: 'You nailed it!', es: '¡La rompiste!', when: 'Informal: después, cuando a alguien le salió perfecto.' },
    ],
    situations: [
      ['Tu amiga sale a dar una presentación en público.', 2, 'Antes de una presentación: break a leg.'],
      ['Tu compañero salió de la entrevista y lo contrataron en el momento.', 3, 'Después, cuando salió perfecto: nailed it.'],
      ['Estás esperando que te aprueben la visa.', 1, 'Esperás que salga bien: fingers crossed.'],
    ],
  },
  {
    id: 'terminar',
    level: 'B1',
    idea: 'Empezar y terminar',
    ways: [
      { en: "Let's get started.", es: 'Empecemos.', when: 'Para arrancar una tarea o reunión.' },
      { en: "Let's call it a day.", es: 'Dejemos por hoy.', when: 'Para terminar el trabajo del día.' },
      { en: "I'm done.", es: 'Terminé / no doy más.', when: 'Informal: terminaste algo o no podés más.' },
      { en: 'Let’s wrap it up.', es: 'Vayamos cerrando.', when: 'Para terminar una reunión o una charla.' },
    ],
    situations: [
      ['Son las seis, están todos cansados y querés cortar el trabajo por hoy.', 1, 'Terminar el día: call it a day.'],
      ['La reunión se está alargando y querés cerrarla.', 3, 'Cerrar una reunión: wrap it up.'],
      ['Llegó todo el equipo y querés arrancar.', 0, 'Arrancar: get started.'],
    ],
  },
  {
    id: 'acuerdo',
    level: 'B1',
    idea: 'Estoy de acuerdo / tenés razón',
    ways: [
      { en: 'Fair enough.', es: 'Me parece justo / tiene sentido.', when: 'Muy común en Australia: aceptar lo que dice el otro.' },
      { en: "I couldn't agree more.", es: 'Estoy totalmente de acuerdo.', when: 'Acuerdo fuerte.' },
      { en: 'Fair point.', es: 'Buen punto.', when: 'Reconocer un buen argumento, aunque no cambies del todo de idea.' },
      { en: 'I see what you mean.', es: 'Entiendo lo que decís.', when: 'Mostrar que entendés el punto del otro.' },
    ],
    situations: [
      ['Tu jefe dice que hoy no hay turno extra porque no hay clientes. Lo aceptás.', 0, 'Aceptar con naturalidad: fair enough.'],
      ['Un amigo dice que Sídney es carísimo y vos pensás exactamente lo mismo.', 1, 'Acuerdo total: couldn’t agree more.'],
      ['En una discusión, el otro dice algo razonable que no habías pensado.', 2, 'Buen argumento: fair point.'],
    ],
  },
  {
    id: 'desacuerdo',
    level: 'B2',
    idea: 'No estoy de acuerdo (con amabilidad)',
    ways: [
      { en: "I'm not so sure about that.", es: 'No estoy tan seguro de eso.', when: 'Suave, para empezar a discrepar.' },
      { en: 'I see your point, but…', es: 'Entiendo tu punto, pero…', when: 'Reconocés lo del otro y das tu opinión.' },
      { en: 'I beg to differ.', es: 'Permitime discrepar.', when: 'Formal, algo serio.' },
      { en: 'No way!', es: '¡Ni loco! / ¡Para nada!', when: 'Muy informal, con amigos. Con el jefe puede sonar grosero.' },
    ],
    situations: [
      ['En una reunión formal, tu supervisor dice algo con lo que no estás de acuerdo.', 1, 'Reconocés y opinás: I see your point, but…'],
      ['Tu amigo dice que el mate es feo. Vos, uruguayo, reaccionás riéndote.', 3, 'Entre amigos, con humor: no way!'],
      ['Un compañero asegura que el turno empieza a las ocho, pero vos creés que es a las siete.', 0, 'Suave: not so sure about that.'],
    ],
  },
  {
    id: 'resumir',
    level: 'B2',
    idea: 'Ir al grano / resumir',
    ways: [
      { en: 'To cut a long story short, …', es: 'Para hacerla corta, …', when: 'Para resumir una historia larga.' },
      { en: 'In a nutshell, …', es: 'En pocas palabras, …', when: 'Para resumir una idea.' },
      { en: "Let's get to the point.", es: 'Vamos al grano.', when: 'Para pedir que se hable de lo importante (puede sonar seco).' },
      { en: 'The bottom line is …', es: 'Lo importante es / en definitiva …', when: 'Para decir la conclusión o lo esencial.' },
    ],
    situations: [
      ['Estás contando cómo perdiste el pasaporte, la historia es larga y querés saltar al final.', 0, 'Resumir una historia: to cut a long story short.'],
      ['Te piden explicar tu trabajo en una frase.', 1, 'Resumir una idea: in a nutshell.'],
      ['Después de discutir mucho, decís la conclusión: no hay plata para más personal.', 3, 'La conclusión: the bottom line is.'],
    ],
  },
  {
    id: 'rapido',
    level: 'A2',
    idea: 'Ya mismo / enseguida',
    ways: [
      { en: 'Right away.', es: 'Ya mismo / enseguida.', when: 'Neutro, cuando te piden algo en el trabajo.' },
      { en: 'In a sec.', es: 'En un segundo.', when: 'Informal: ahora voy.' },
      { en: 'ASAP (as soon as possible).', es: 'Lo antes posible.', when: 'En mensajes y en el trabajo, cuando algo es urgente.' },
      { en: 'No rush.', es: 'Sin apuro.', when: 'Para decir que no es urgente.' },
    ],
    situations: [
      ['Tu jefe te pide que limpies una mesa y querés mostrar que lo hacés ya.', 0, 'En el trabajo, enseguida: right away.'],
      ['Un compañero te pide un favor y le decís que no hay apuro con devolvértelo.', 3, 'No es urgente: no rush.'],
      ['Tu amigo te llama desde abajo y le decís que ya bajás.', 1, 'Informal, ahora voy: in a sec.'],
    ],
  },
  {
    id: 'gente',
    level: 'B1',
    idea: 'Llevarse bien con la gente',
    ways: [
      { en: 'We hit it off.', es: 'Congeniamos enseguida.', when: 'Cuando con alguien hubo onda desde el principio.' },
      { en: 'I get on well with my boss.', form: 'I get on well with…', es: 'Me llevo bien con mi jefe.', when: 'Relación buena y estable (también get along with).' },
      { en: 'Let me break the ice.', es: 'Dejame romper el hielo.', when: 'Empezar a charlar en un grupo o situación incómoda.' },
      { en: "We're on the same page.", es: 'Estamos en la misma sintonía.', when: 'Cuando pensás igual que el otro sobre un plan o trabajo.' },
    ],
    situations: [
      ['Conociste a alguien en el hostel y en cinco minutos parecían amigos de toda la vida.', 0, 'Onda inmediata: hit it off.'],
      ['Contás que con tus compañeros de trabajo no hay problemas, todo bien.', 1, 'Buena relación: get on well with.'],
      ['Con tu socio coinciden en cómo organizar el negocio.', 3, 'Misma sintonía: on the same page.'],
    ],
  },
  {
    id: 'error',
    level: 'B1',
    idea: 'Me equivoqué',
    ways: [
      { en: 'My bad.', es: 'Culpa mía.', when: 'Muy informal: un error chico, entre amigos o compañeros.' },
      { en: 'I made a mistake.', es: 'Me equivoqué.', when: 'Neutro, cualquier situación.' },
      { en: 'I messed up.', es: 'La embarré.', when: 'Informal: un error que tuvo consecuencias.' },
      { en: 'I stand corrected.', es: 'Tenés razón, me equivoqué.', when: 'Cuando alguien te corrige y aceptás (algo formal o con humor).' },
    ],
    situations: [
      ['Le diste el café equivocado a un compañero en el descanso.', 0, 'Error chico, informal: my bad.'],
      ['Mandaste mal un pedido grande y el cliente se quejó con tu jefe.', 2, 'Error con consecuencias: messed up.'],
      ['Dijiste que Canberra no es la capital y te corrigen con el dato.', 3, 'Aceptar la corrección: I stand corrected.'],
    ],
  },
  {
    id: 'plata',
    level: 'B1',
    idea: 'La plata no alcanza / estoy ahorrando',
    ways: [
      { en: "I'm broke.", es: 'Estoy sin un peso.', when: 'Informal.' },
      { en: "I'm saving up for a car.", form: "I'm saving up for…", es: 'Estoy ahorrando para un auto.', when: 'Save up for: juntar plata para algo concreto.' },
      { en: "It's hard to make ends meet.", es: 'Cuesta llegar a fin de mes.', when: 'Cuando la plata apenas alcanza.' },
      { en: "I'm a bit short this week.", es: 'Estoy un poco justo esta semana.', when: 'Amable: no tenés mucha plata ahora.' },
    ],
    situations: [
      ['Un amigo te invita a cenar, pero esta semana no tenés mucha plata y lo decís con suavidad.', 3, 'Amable: a bit short.'],
      ['Contás tu plan de juntar plata para un auto.', 1, 'Juntar para algo: saving up.'],
      ['Explicás que con el alquiler y la comida la plata apenas alcanza.', 2, 'Apenas alcanza: make ends meet.'],
    ],
  },
  {
    id: 'enfermo',
    level: 'B1',
    idea: 'Me siento mal / estoy enfermo',
    ways: [
      { en: "I'm feeling a bit under the weather.", es: 'Estoy medio decaído / no me siento bien.', when: 'Suave, para algo leve.' },
      { en: "I'm feeling a bit crook.", es: 'Estoy medio enfermo.', when: 'Australiano e informal.' },
      { en: "I think I'm coming down with something.", es: 'Creo que me estoy enfermando.', when: 'Cuando empezás con síntomas.' },
      { en: "I'm sick.", es: 'Estoy enfermo.', when: 'Neutro y claro. Para avisar en el trabajo: I’m sick, I can’t come in today.' },
    ],
    situations: [
      ['Llamás temprano al trabajo para avisar que no vas porque estás enfermo.', 3, 'Claro para el trabajo: I’m sick.'],
      ['Te duele un poco la garganta y sentís que se viene un resfrío.', 2, 'Empezás con síntomas: coming down with something.'],
      ['Un compañero australiano te ve con mala cara y le contestás informal.', 1, 'Australiano e informal: a bit crook.'],
    ],
  },
  {
    id: 'entendi',
    level: 'B1',
    idea: 'Ahora sí entendí',
    ways: [
      { en: 'Now I get it.', es: 'Ahora entiendo.', when: 'Neutro e informal.' },
      { en: 'It finally clicked.', es: 'Por fin me cayó la ficha.', when: 'Cuando algo que no entendías de repente tiene sentido.' },
      { en: 'That makes sense.', es: 'Tiene sentido.', when: 'Cuando la explicación te cierra.' },
      { en: 'Got it.', es: 'Entendido.', when: 'Muy corto, para confirmar una instrucción.' },
    ],
    situations: [
      ['Tu supervisor te da una instrucción rápida y querés confirmar que la entendiste.', 3, 'Confirmar una instrucción: got it.'],
      ['Llevabas semanas sin entender el present perfect y hoy de golpe lo entendiste.', 1, 'De repente tiene sentido: it clicked.'],
      ['Te explican por qué el alquiler se paga cada dos semanas y la razón te parece lógica.', 2, 'La explicación te cierra: makes sense.'],
    ],
  },
  {
    id: 'tranqui',
    level: 'A2',
    idea: 'Tranquilo / no pasa nada',
    ways: [
      { en: 'No worries.', es: 'No pasa nada / de nada.', when: 'Muy australiano: para cualquier gracias o disculpa.' },
      { en: 'Take it easy.', es: 'Tomalo con calma.', when: 'Para alguien estresado, o como despedida.' },
      { en: "Don't worry about it.", es: 'No te preocupes.', when: 'Neutro, cuando alguien se disculpa por algo.' },
      { en: "She'll be right.", es: 'Va a estar todo bien.', when: 'Muy australiano e informal: todo se va a arreglar.' },
    ],
    situations: [
      ['Alguien te pide perdón por pisarte en el tren.', 0, 'Respuesta australiana a una disculpa: no worries.'],
      ['Tu amigo está nervioso porque se le rompió el auto, y vos estás seguro de que se arregla.', 3, 'Todo se va a arreglar: she’ll be right.'],
      ['Un compañero está muy estresado con el trabajo.', 1, 'Para alguien estresado: take it easy.'],
    ],
  },
];
