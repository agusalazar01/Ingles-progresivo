import { describe, expect, it } from 'vitest';
import { parseVoiceReply, unclear, feedbackRequest } from './ai';

describe('Gemma escucha y responde en una pasada', () => {
  it('separa lo que entendió de lo que responde', () => {
    const p = parseVoiceReply('HEARD: I go to the beach yesterday\nOLIVER: Nice one, mate! You went to the beach? Which one?');
    expect(p.heard).toBe('I go to the beach yesterday');
    expect(p.reply).toBe('Nice one, mate! You went to the beach? Which one?');
    expect(p.replyStarted).toBe(true);
  });
  it('a medio escribir no adelanta nada', () => {
    expect(parseVoiceReply('HE')).toMatchObject({ heard: null, replyStarted: false });
    expect(parseVoiceReply('HEARD: I went to the')).toMatchObject({ heard: null, replyStarted: false });
    expect(parseVoiceReply('HEARD: "I went."\nOLIV')).toMatchObject({ heard: 'I went.', replyStarted: false });
  });
  it('si la IA no respeta el formato, igual hay respuesta', () => {
    const p = parseVoiceReply("G'day mate, that sounds great. What else?");
    expect(p.heard).toBeNull();
    expect(p.reply).toContain('sounds great');
    expect(p.replyStarted).toBe(true);
    expect(parseVoiceReply('HEARD: hello\nHey there, mate!').reply).toBe('Hey there, mate!');
  });
  it('reconoce cuando no se entendió', () => {
    expect(unclear('(unclear)')).toBe(true);
    expect(unclear('')).toBe(true);
    expect(unclear('I am unclear about this')).toBe(false);
  });
  it('los consejos se piden con tus frases numeradas', () => {
    expect(feedbackRequest(['I go yesterday', 'It is good'])).toContain('2. It is good');
  });
});

import { matches } from './answer';
describe('respuestas igual de correctas no se marcan mal', () => {
  it('ortografía de EE. UU. y británica, números y OK', () => {
    expect(matches('My favorite color is gray.', ['My favourite colour is grey.'])).toBe(true);
    expect(matches('I realised I was traveling.', ['I realized I was travelling.'])).toBe(true);
    expect(matches('I get up at 8.', ['I get up at eight.'])).toBe(true);
    expect(matches('I get up at eight o\'clock', ['I get up at 8.'])).toBe(true);
    expect(matches("I do not like it", ["I don't like it."])).toBe(true);
    expect(matches('I get up at nine.', ['I get up at eight.'])).toBe(false);
    expect(matches('The size is ok', ['The size is okay.'])).toBe(true);
  });
});
