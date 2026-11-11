import { describe, expect, it } from 'vitest';
import { synonymForms } from './understand';
import { isRepeatRequest, matchOption, optionExamples } from './roleplay';
import { patternExamples } from './semantic';
import { ROLEPLAYS } from '../content/roleplays/catalog';

describe('entender sin internet', () => {
  it('sinónimos: «yeah» vale «yes», «luggage» vale «bags»', () => {
    expect(synonymForms('Yeah, that would be great')).toContain('yes, that would be great'.replace(',', ''));
    expect(synonymForms('where is my luggage').some((f) => f.includes('bags'))).toBe(true);
    expect(synonymForms('I like pizza')).toEqual([]);
  });
  it('ejemplos a partir de los patrones', () => {
    expect(patternExamples(['open|new', 'account'])).toEqual(['open account', 'new account']);
    expect(patternExamples(['*'])).toEqual([]);
  });
  it('cada nodo entiende su propia pista y tiene ejemplos para comparar', () => {
    let withEx = 0;
    for (const e of ROLEPLAYS)
      for (const n of Object.values(e.script?.nodes ?? {})) if (optionExamples(n).length) withEx++;
    expect(withEx).toBeGreaterThan(300);
  });
  it('los sinónimos amplían lo que se entiende', () => {
    const e = ROLEPLAYS.find((r) => r.script && r.title.includes('airport'))!;
    const n = e.script!.nodes.help;
    expect(matchOption(n, ['Where do I pick up my suitcase?'])).not.toBeNull();
  });
  it('reconoce los pedidos de repetir', () => {
    expect(isRepeatRequest('Sorry, can you repeat that?')).toBe(true);
    expect(isRepeatRequest("I didn't catch that")).toBe(true);
    expect(isRepeatRequest('I would like a latte')).toBe(false);
  });
});

import { CALLS } from '../content/calls';
import { callToRoleplay } from './roleplay';
describe('llamadas de las unidades con la charla nueva', () => {
  it('cada llamada se convierte y su respuesta modelo se entiende', () => {
    const bad: string[] = [];
    for (const c of CALLS) {
      const e = callToRoleplay(c, 'A2');
      const s = e.script!;
      if (!s.nodes[s.start]) bad.push(`${c.id}: sin turnos`);
      for (const [id, n] of Object.entries(s.nodes)) {
        if (!matchOption(n, [n.hint])) bad.push(`${c.id}/${id}: «${n.hint}»`);
        if (n.options.some((o) => !o.next)) bad.push(`${c.id}/${id}: sin siguiente`);
      }
    }
    expect(bad.slice(0, 10)).toEqual([]);
  });
});

import { DEEP_NS, SCRIPTS_BY_N } from '../content/roleplays/all';
describe('guiones profundos', () => {
  it('tienen objetivo en cada momento, 7 o más momentos y la pista se entiende', () => {
    const bad: string[] = [];
    for (const n of DEEP_NS) {
      const s = SCRIPTS_BY_N[n];
      const nodes = Object.entries(s.nodes);
      if (nodes.length < 7) bad.push(`${n}: ${nodes.length} momentos`);
      for (const [id, x] of nodes) {
        if (!x.aim) bad.push(`${n}/${id}: sin objetivo`);
        if (!matchOption(x, [x.hint])) bad.push(`${n}/${id}: no entiende «${x.hint}»`);
        if (x.options[0] && !matchOption({ ...x, options: [x.options[0]] }, [x.hint])) bad.push(`${n}/${id}: la pista no lleva a la primera opción`);
      }
    }
    expect(bad).toEqual([]);
  });
});
