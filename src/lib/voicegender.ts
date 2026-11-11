import { getState } from './store';
import { tuneKey } from './ai';

/** Voz femenina o masculina para cada personaje de los roleplays (elegida sola). */
export type Gender = 'f' | 'm';

const FEMALE_NAMES = new Set(
  `kate priya chloe lena ruby emma ella zoe grace mia karen lisa nok sophie lily hannah nina amy megan sarah emily tara margaret zara ruth maria kelly linda tina kylie jess jessica jodie nicole anna aiko matilda olivia charlotte isla ava amelia sienna jade jasmine rachel rebecca laura claire helen susan sue jenny jen julia lucy alice holly molly bella isabella sky nadia fatima mei yuki sakura ana lucia sofia valentina camila maya leah sam-f deb debbie sharon tracey michelle kim mel melissa bec becky shaz shazza kirsty brooke tegan jane mary beth liz elizabeth amanda mandy natalie nat georgia hayley abby abigail eva elena rosa carmen pat patricia joan joanne anne annie gemma erin naomi tash natasha ellie ivy willow hazel poppy daisy rose violet stella luna aria`.split(/\s+/),
);
const MALE_NAMES = new Set(
  `tom dave josh jack mark gary dan liam david ben ollie oliver marco jake gus chris ahmed kevin nick ray mateo darren davo ash paul luca tony steve mick gav bill craig dean rob greg shane raj bruce bazza angus banjo clancy james john mike michael matt matthew luke harry henry charlie noah leo max sam joe will william george lewis adam peter pete brian phil scott tim jason ryan andrew andy simon richard rick ricky wayne trent brett kyle cameron cam jordan lachlan lachie hamish fraser callum connor ethan lucas hugo felix arthur alfie archie oscar finn hiro kenji wei omar ali hassan carlos diego juan pablo luis jorge miguel ivan sergei dmitri kofi sione tane rangi brad bradley gazza robbo stevo johnno thommo ken ted fred frank stan doug don ron reg col kev sanjay arjun vikram mohammed`.split(/\s+/),
);

/** Palabras que no dicen el género del personaje (artículos, lugares, roles que valen para los dos). */
const SKIP = new Set('de del la el en con para por a al y o tu su un una muy nuevo nueva'.split(' '));
const NEUTRAL_ROLE = /^(guía|recepcionista|agente|policía|gerente|estudiante|turista|cliente|colega|chofer|barista|dentista|periodista|taxista|electricista|especialista|artista|guardia|joven|paciente|asistente|representante|piloto|modelo|compañere|persona|staff|bartender|host|atención|recepción|servicio|asistencia|soporte|emergencias|australiano|australiana)$/;
const FEMALE_WORD = /^(señora|señorita|mujer|chica|madre|mamá|abuela|hermana|hija|tía|esposa|novia|reina|actriz|emperatriz)$/;
const MALE_WORD = /^(señor|hombre|chico|padre|papá|abuelo|hermano|hijo|tío|esposo|novio|rey|actor)$/;

function roleWord(role: string): Gender | null {
  // La primera palabra con significado decide: «empleada del mostrador» → empleada.
  const words = role
    .toLowerCase()
    .replace(/\(.*?\)/g, ' ')
    .split(/[^a-záéíóúñü]+/)
    .filter(Boolean);
  for (const w of words) {
    if (w === 'un' || w === 'el') return 'm';
    if (w === 'una') return 'f';
    if (SKIP.has(w)) continue;
    if (NEUTRAL_ROLE.test(w)) return null;
    if (FEMALE_WORD.test(w)) return 'f';
    if (MALE_WORD.test(w)) return 'm';
    if (/(ista|ía|eta)$/.test(w)) return null;
    if (/a$/.test(w)) return 'f';
    if (/(o|or|és|ón|ero)$/.test(w)) return 'm';
    return null;
  }
  return null;
}

/** Género del personaje: por el nombre (Kate, Tom) y, si no es un nombre conocido, por el rol en español (empleada, dueño). */
export function partnerGender(name: string, role = ''): Gender | null {
  if (/^(mrs|ms|miss|aunty)\b/i.test(name)) return 'f';
  if (/^(mr|uncle)\b/i.test(name)) return 'm';
  const first = name
    .toLowerCase()
    .replace(/^(dr|officer|sergeant|nurse|coach|chef)\.?\s+/i, '')
    .split(/[\s-]+/)[0];
  if (FEMALE_NAMES.has(first)) return 'f';
  if (MALE_NAMES.has(first)) return 'm';
  // Sin nombre propio conocido: el rol (una señora, empleada) y, si el rol empieza con «de» (Funcionaria = del consulado),
  // el «nombre», que en esos casos es el rol mismo (Operadora, Funcionaria).
  const fromRole = /^\s*(de|del)\b/i.test(role) ? null : roleWord(role);
  return fromRole ?? roleWord(name);
}

/** Género de cada voz de los paquetes (de la documentación de cada modelo). */
export function speakerGender(packId: string, id: number, name = ''): Gender | null {
  const own = getState().settings.ai.genders?.[tuneKey(packId, id)];
  if (own) return own;
  switch (packId) {
    case 'kitten':
      return id % 2 === 0 ? 'm' : 'f';
    case 'kokoro':
      // af, af_bella, af_nicole, af_sarah, af_sky, am_adam, am_michael, bf_emma, bf_isabella, bm_george, bm_lewis
      return id <= 4 || id === 7 || id === 8 ? 'f' : 'm';
    case 'supertonic':
      // voice.bin: 0–4 = F1–F5, 5–9 = M1–M5
      return id <= 4 ? 'f' : 'm';
    case 'pocket':
      return id === 100 ? null : 'm';
    default: {
      const first = name
        .toLowerCase()
        .replace(/^\d+\.\s*/, '')
        .split(/\s+/)[0];
      if (FEMALE_NAMES.has(first)) return 'f';
      if (MALE_NAMES.has(first)) return 'm';
      return null;
    }
  }
}

const hash = (t: string) => [...t].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * Voz para un personaje: la elegida si coincide el género; si no, una del mismo género del paquete
 * (siempre la misma para el mismo personaje). `null` = el paquete no tiene voces de ese género.
 */
export function speakerFor(packId: string, speakers: { id: number; name: string }[], chosen: number, gender: Gender | null, who: string): number | null {
  if (!gender) return chosen;
  const g = (sp: { id: number; name: string }) => speakerGender(packId, sp.id, sp.name);
  const mine = speakers.find((x) => x.id === chosen);
  if (mine && g(mine) === gender) return chosen;
  const same = speakers.filter((x) => g(x) === gender);
  if (!same.length) return null;
  return same[hash(who) % same.length].id;
}

/** Si la elección automática está prendida (lo está salvo que la apagues). */
export const autoGender = () => getState().settings.ai.autoGender !== false;

/** Códigos de las voces de Google (en-au-x-aua-local…): cuáles son de mujer y cuáles de hombre. */
const GOOGLE: Record<string, Gender> = {
  aua: 'f', aub: 'm', auc: 'f', aud: 'm',
  gba: 'f', gbb: 'm', gbc: 'f', gbd: 'm', gbg: 'f', rjs: 'm',
  iob: 'f', iog: 'f', iol: 'm', iom: 'm', sfg: 'f', tpc: 'f', tpd: 'm', tpf: 'f',
};

/** Género de una voz del teléfono o del navegador, si se puede saber por su nombre. */
export function systemVoiceGender(id: string, name: string): Gender | null {
  const t = `${id} ${name}`.toLowerCase();
  if (/female|woman|\bfem\b/.test(t)) return 'f';
  if (/\bmale\b|\bman\b/.test(t)) return 'm';
  const smt = t.match(/smt([fm])\d/);
  if (smt) return smt[1] as Gender;
  const g = t.match(/-x-([a-z]{3})/);
  if (g && GOOGLE[g[1]]) return GOOGLE[g[1]];
  for (const w of t.split(/[^a-z]+/)) {
    if (FEMALE_NAMES.has(w) || /^(samantha|serena|moira|tessa|fiona|veena|victoria|zira|hazel|susan|catherine)$/.test(w)) return 'f';
    if (MALE_NAMES.has(w) || /^(daniel|gordon|alex|fred|rishi|aaron|arthur|thomas|guy|ryan)$/.test(w)) return 'm';
  }
  return null;
}

/** De la lista de voces del teléfono, una del género pedido (primero australiana); siempre la misma para el mismo personaje. */
export function systemVoiceFor(voices: { id: string; name: string; lang: string }[], gender: Gender, who: string): string | null {
  for (const lang of ['en-AU', 'en-GB', 'en-US', '']) {
    const same = voices.filter((v) => (!lang || v.lang === lang) && systemVoiceGender(v.id, v.name) === gender);
    if (same.length) return same[hash(who) % same.length].id;
  }
  return null;
}
