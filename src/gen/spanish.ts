/**
 * Conjugación española (rioplatense: vos) para las oraciones del generador.
 * Personas: 0 yo · 1 vos · 2 él/ella · 3 nosotros · 4 ellos.
 */
type P = 0 | 1 | 2 | 3 | 4;
type Forms = [string, string, string, string, string];

const IRREGULAR: Record<string, Partial<Record<'pres' | 'pret' | 'imp' | 'fut' | 'cond', Forms>> & { ger?: string; pp?: string }> = {
  ir: {
    pres: ['voy', 'vas', 'va', 'vamos', 'van'],
    pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'],
    imp: ['iba', 'ibas', 'iba', 'íbamos', 'iban'],
    ger: 'yendo',
    pp: 'ido',
  },
  ser: { pres: ['soy', 'sos', 'es', 'somos', 'son'], pret: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], imp: ['era', 'eras', 'era', 'éramos', 'eran'] },
  estar: { pres: ['estoy', 'estás', 'está', 'estamos', 'están'], pret: ['estuve', 'estuviste', 'estuvo', 'estuvimos', 'estuvieron'] },
  haber: { pres: ['he', 'has', 'ha', 'hemos', 'han'], fut: ['habré', 'habrás', 'habrá', 'habremos', 'habrán'], cond: ['habría', 'habrías', 'habría', 'habríamos', 'habrían'], pret: ['hube', 'hubiste', 'hubo', 'hubimos', 'hubieron'] },
  hacer: {
    pres: ['hago', 'hacés', 'hace', 'hacemos', 'hacen'],
    pret: ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'],
    fut: ['haré', 'harás', 'hará', 'haremos', 'harán'],
    cond: ['haría', 'harías', 'haría', 'haríamos', 'harían'],
    pp: 'hecho',
  },
  tener: {
    pres: ['tengo', 'tenés', 'tiene', 'tenemos', 'tienen'],
    pret: ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron'],
    fut: ['tendré', 'tendrás', 'tendrá', 'tendremos', 'tendrán'],
    cond: ['tendría', 'tendrías', 'tendría', 'tendríamos', 'tendrían'],
  },
  ver: { pres: ['veo', 'ves', 've', 'vemos', 'ven'], pret: ['vi', 'viste', 'vio', 'vimos', 'vieron'], imp: ['veía', 'veías', 'veía', 'veíamos', 'veían'], pp: 'visto' },
  saber: {
    pres: ['sé', 'sabés', 'sabe', 'sabemos', 'saben'],
    pret: ['supe', 'supiste', 'supo', 'supimos', 'supieron'],
    fut: ['sabré', 'sabrás', 'sabrá', 'sabremos', 'sabrán'],
    cond: ['sabría', 'sabrías', 'sabría', 'sabríamos', 'sabrían'],
  },
  poder: {
    pres: ['puedo', 'podés', 'puede', 'podemos', 'pueden'],
    pret: ['pude', 'pudiste', 'pudo', 'pudimos', 'pudieron'],
    fut: ['podré', 'podrás', 'podrá', 'podremos', 'podrán'],
    cond: ['podría', 'podrías', 'podría', 'podríamos', 'podrían'],
  },
  decir: {
    pres: ['digo', 'decís', 'dice', 'decimos', 'dicen'],
    pret: ['dije', 'dijiste', 'dijo', 'dijimos', 'dijeron'],
    fut: ['diré', 'dirás', 'dirá', 'diremos', 'dirán'],
    cond: ['diría', 'dirías', 'diría', 'diríamos', 'dirían'],
    ger: 'diciendo',
    pp: 'dicho',
  },
  pensar: { pres: ['pienso', 'pensás', 'piensa', 'pensamos', 'piensan'] },
  venir: {
    pres: ['vengo', 'venís', 'viene', 'venimos', 'vienen'],
    pret: ['vine', 'viniste', 'vino', 'vinimos', 'vinieron'],
    fut: ['vendré', 'vendrás', 'vendrá', 'vendremos', 'vendrán'],
    cond: ['vendría', 'vendrías', 'vendría', 'vendríamos', 'vendrían'],
    ger: 'viniendo',
  },
  querer: {
    pres: ['quiero', 'querés', 'quiere', 'queremos', 'quieren'],
    pret: ['quise', 'quisiste', 'quiso', 'quisimos', 'quisieron'],
    fut: ['querré', 'querrás', 'querrá', 'querremos', 'querrán'],
    cond: ['querría', 'querrías', 'querría', 'querríamos', 'querrían'],
  },
  dar: { pres: ['doy', 'das', 'da', 'damos', 'dan'], pret: ['di', 'diste', 'dio', 'dimos', 'dieron'] },
  conseguir: {
    pres: ['consigo', 'conseguís', 'consigue', 'conseguimos', 'consiguen'],
    pret: ['conseguí', 'conseguiste', 'consiguió', 'conseguimos', 'consiguieron'],
    ger: 'consiguiendo',
  },
  poner: {
    pres: ['pongo', 'ponés', 'pone', 'ponemos', 'ponen'],
    pret: ['puse', 'pusiste', 'puso', 'pusimos', 'pusieron'],
    fut: ['pondré', 'pondrás', 'pondrá', 'pondremos', 'pondrán'],
    cond: ['pondría', 'pondrías', 'pondría', 'pondríamos', 'pondrían'],
    pp: 'puesto',
  },
  traer: { pres: ['traigo', 'traés', 'trae', 'traemos', 'traen'], pret: ['traje', 'trajiste', 'trajo', 'trajimos', 'trajeron'], ger: 'trayendo' },
  conocer: { pres: ['conozco', 'conocés', 'conoce', 'conocemos', 'conocen'] },
  salir: { pres: ['salgo', 'salís', 'sale', 'salimos', 'salen'], fut: ['saldré', 'saldrás', 'saldrá', 'saldremos', 'saldrán'], cond: ['saldría', 'saldrías', 'saldría', 'saldríamos', 'saldrían'] },
  pedir: { pres: ['pido', 'pedís', 'pide', 'pedimos', 'piden'], pret: ['pedí', 'pediste', 'pidió', 'pedimos', 'pidieron'], ger: 'pidiendo' },
  contar: { pres: ['cuento', 'contás', 'cuenta', 'contamos', 'cuentan'] },
  aprobar: { pres: ['apruebo', 'aprobás', 'aprueba', 'aprobamos', 'aprueban'] },
  leer: { pret: ['leí', 'leíste', 'leyó', 'leímos', 'leyeron'], ger: 'leyendo', pp: 'leído' },
  dormir: { pres: ['duermo', 'dormís', 'duerme', 'dormimos', 'duermen'], pret: ['dormí', 'dormiste', 'durmió', 'dormimos', 'durmieron'], ger: 'durmiendo' },
  jugar: { pres: ['juego', 'jugás', 'juega', 'jugamos', 'juegan'], pret: ['jugué', 'jugaste', 'jugó', 'jugamos', 'jugaron'] },
  empezar: { pres: ['empiezo', 'empezás', 'empieza', 'empezamos', 'empiezan'], pret: ['empecé', 'empezaste', 'empezó', 'empezamos', 'empezaron'] },
  pagar: { pret: ['pagué', 'pagaste', 'pagó', 'pagamos', 'pagaron'] },
  perder: { pres: ['pierdo', 'perdés', 'pierde', 'perdemos', 'pierden'] },
  encontrar: { pres: ['encuentro', 'encontrás', 'encuentra', 'encontramos', 'encuentran'] },
  cerrar: { pres: ['cierro', 'cerrás', 'cierra', 'cerramos', 'cierran'] },
  entender: { pres: ['entiendo', 'entendés', 'entiende', 'entendemos', 'entienden'] },
  escribir: { pp: 'escrito' },
  abrir: { pp: 'abierto' },
  romper: { pp: 'roto' },
  sacar: { pret: ['saqué', 'sacaste', 'sacó', 'sacamos', 'sacaron'] },
  tocar: { pret: ['toqué', 'tocaste', 'tocó', 'tocamos', 'tocaron'] },
  arrancar: { pret: ['arranqué', 'arrancaste', 'arrancó', 'arrancamos', 'arrancaron'] },
  cargar: { pret: ['cargué', 'cargaste', 'cargó', 'cargamos', 'cargaron'] },
  llegar: { pret: ['llegué', 'llegaste', 'llegó', 'llegamos', 'llegaron'] },
  probar: { pres: ['pruebo', 'probás', 'prueba', 'probamos', 'prueban'] },
  volar: { pres: ['vuelo', 'volás', 'vuela', 'volamos', 'vuelan'] },
  andar: { pret: ['anduve', 'anduviste', 'anduvo', 'anduvimos', 'anduvieron'] },
  construir: {
    pres: ['construyo', 'construís', 'construye', 'construimos', 'construyen'],
    pret: ['construí', 'construiste', 'construyó', 'construimos', 'construyeron'],
    ger: 'construyendo',
  },
  elegir: { pres: ['elijo', 'elegís', 'elige', 'elegimos', 'eligen'], pret: ['elegí', 'elegiste', 'eligió', 'elegimos', 'eligieron'], ger: 'eligiendo' },
};

const ENDINGS = {
  ar: {
    pres: ['o', 'ás', 'a', 'amos', 'an'],
    pret: ['é', 'aste', 'ó', 'amos', 'aron'],
    imp: ['aba', 'abas', 'aba', 'ábamos', 'aban'],
    ger: 'ando',
    pp: 'ado',
  },
  er: {
    pres: ['o', 'és', 'e', 'emos', 'en'],
    pret: ['í', 'iste', 'ió', 'imos', 'ieron'],
    imp: ['ía', 'ías', 'ía', 'íamos', 'ían'],
    ger: 'iendo',
    pp: 'ido',
  },
  ir: {
    pres: ['o', 'ís', 'e', 'imos', 'en'],
    pret: ['í', 'iste', 'ió', 'imos', 'ieron'],
    imp: ['ía', 'ías', 'ía', 'íamos', 'ían'],
    ger: 'iendo',
    pp: 'ido',
  },
} as const;

const FUT_END: Forms = ['é', 'ás', 'á', 'emos', 'án'];
const COND_END: Forms = ['ía', 'ías', 'ía', 'íamos', 'ían'];

/** Verbo español con una parte fija después: "pasar a buscar" → conjuga "pasar", deja "a buscar". */
function split(inf: string): [string, string] {
  const i = inf.indexOf(' ');
  return i < 0 ? [inf, ''] : [inf.slice(0, i), inf.slice(i)];
}

function simple(inf: string, tense: 'pres' | 'pret' | 'imp' | 'fut' | 'cond', p: P): string {
  const [verb, rest] = split(inf);
  const irr = IRREGULAR[verb]?.[tense];
  if (irr) return irr[p] + rest;
  if (tense === 'fut') return verb + FUT_END[p] + rest;
  if (tense === 'cond') return verb + COND_END[p] + rest;
  const cls = verb.slice(-2) as 'ar' | 'er' | 'ir';
  const stem = verb.slice(0, -2);
  return stem + ENDINGS[cls][tense][p] + rest;
}

export function gerund(inf: string): string {
  const [verb, rest] = split(inf);
  const g = IRREGULAR[verb]?.ger;
  if (g) return g + rest;
  const cls = verb.slice(-2) as 'ar' | 'er' | 'ir';
  return verb.slice(0, -2) + ENDINGS[cls].ger + rest;
}

export function participle(inf: string): string {
  const [verb, rest] = split(inf);
  const pp = IRREGULAR[verb]?.pp;
  if (pp) return pp + rest;
  const cls = verb.slice(-2) as 'ar' | 'er' | 'ir';
  return verb.slice(0, -2) + ENDINGS[cls].pp + rest;
}

/** Imperfecto de subjuntivo (si tuviera, si trabajara): se forma desde la 3.ª plural del pretérito. */
function subjImp(inf: string, p: P): string {
  const [verb, rest] = split(inf);
  const base = simple(verb, 'pret', 4).replace(/ron$/, '');
  const ends: Forms = ['ra', 'ras', 'ra', 'ramos', 'ran'];
  let form = base + ends[p];
  if (p === 3) form = base.replace(/([aeiou])$/, (m) => ({ a: 'á', e: 'é', i: 'í', o: 'ó', u: 'ú' })[m]!) + 'ramos';
  return form + rest;
}

export type EsTense =
  | 'pres'
  | 'presCont'
  | 'pret'
  | 'pastCont'
  | 'fut'
  | 'goingTo'
  | 'perf'
  | 'perfCont'
  | 'pluperf'
  | 'futPerf'
  | 'futCont'
  | 'cond'
  | 'condPerf'
  | 'subjImp'
  | 'subjPluperf';

export function conjugateEs(inf: string, tense: EsTense, p: P): string {
  switch (tense) {
    case 'pres':
      return simple(inf, 'pres', p);
    case 'presCont':
      return `${simple('estar', 'pres', p)} ${gerund(inf)}`;
    case 'pret':
      return simple(inf, 'pret', p);
    case 'pastCont':
      return `${simple('estar', 'imp', p)} ${gerund(inf)}`;
    case 'fut':
      return simple(inf, 'fut', p);
    case 'goingTo':
      return `${simple('ir', 'pres', p)} a ${inf}`;
    case 'perf':
      return `${simple('haber', 'pres', p)} ${participle(inf)}`;
    case 'perfCont':
      return `${simple('haber', 'pres', p)} estado ${gerund(inf)}`;
    case 'pluperf':
      return `${simple('haber', 'imp', p)} ${participle(inf)}`;
    case 'futPerf':
      return `${simple('haber', 'fut', p)} ${participle(inf)}`;
    case 'futCont':
      return `${simple('estar', 'fut', p)} ${gerund(inf)}`;
    case 'cond':
      return simple(inf, 'cond', p);
    case 'condPerf':
      return `${simple('haber', 'cond', p)} ${participle(inf)}`;
    case 'subjImp':
      return subjImp(inf, p);
    case 'subjPluperf':
      return `${subjImp('haber', p)} ${participle(inf)}`;
  }
}

/** Pone mayúscula inicial y signos. */
export function esSentence(body: string, question: boolean): string {
  const t = body.replace(/\s+/g, ' ').trim();
  const cap = t.charAt(0).toUpperCase() + t.slice(1);
  return question ? `¿${cap}?` : `${cap}.`;
}
