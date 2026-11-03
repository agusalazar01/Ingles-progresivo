import type { PlacementItem } from './types';

/** Banco del test de ubicación: 6 ítems por nivel; cada test usa 4 al azar, así el re-test cambia las preguntas. */
export const PLACEMENT: PlacementItem[] = [
  // A1
  { id: 'a1-1', level: 'A1', skill: 'gramática', prompt: 'She ___ in a bank.', options: ['work', 'works', 'working'], answer: 1 },
  { id: 'a1-2', level: 'A1', skill: 'gramática', prompt: '___ you like pizza?', options: ['Do', 'Does', 'Are'], answer: 0 },
  { id: 'a1-3', level: 'A1', skill: 'vocabulario', prompt: "The opposite of 'cheap' is ___.", options: ['expensive', 'small', 'early'], answer: 0 },
  { id: 'a1-4', level: 'A1', skill: 'gramática', prompt: 'Look, they ___ football now.', options: ['play', 'are playing', 'plays'], answer: 1 },
  { id: 'a1-5', level: 'A1', skill: 'lectura', text: 'Tom gets up at 7. He has breakfast and goes to work by bus.', prompt: 'How does Tom go to work?', options: ['By car', 'By bus', 'On foot'], answer: 1 },
  { id: 'a1-6', level: 'A1', skill: 'vocabulario', prompt: "I'm hungry. I want to ___ something.", options: ['drink', 'eat', 'sleep'], answer: 1 },
  // A2
  { id: 'a2-1', level: 'A2', skill: 'gramática', prompt: 'We ___ to the beach last Sunday.', options: ['go', 'went', 'have gone'], answer: 1 },
  { id: 'a2-2', level: 'A2', skill: 'gramática', prompt: 'I ___ TV when you called.', options: ['watched', 'was watching', 'am watching'], answer: 1 },
  { id: 'a2-3', level: 'A2', skill: 'gramática', prompt: 'Look at the sky! It ___ rain.', options: ['will', 'is going to', 'goes'], answer: 1 },
  { id: 'a2-4', level: 'A2', skill: 'vocabulario', prompt: 'I need to ___ an appointment with the dentist.', options: ['do', 'make', 'take'], answer: 1 },
  { id: 'a2-5', level: 'A2', skill: 'lectura', text: "Ana moved to Canada two years ago. At first she didn't like the cold, but now she loves the winter.", prompt: 'How does Ana feel about winter now?', options: ['She hates it', 'She loves it', "She doesn't know"], answer: 1 },
  { id: 'a2-6', level: 'A2', skill: 'vocabulario', prompt: 'My flight was ___ because of the storm.', options: ['cancelled', 'closed', 'finished'], answer: 0 },
  // B1
  { id: 'b1-1', level: 'B1', skill: 'gramática', prompt: 'I ___ here since 2020.', options: ['live', 'lived', 'have lived'], answer: 2 },
  { id: 'b1-2', level: 'B1', skill: 'gramática', prompt: 'If I ___ more money, I would buy a car.', options: ['have', 'had', 'will have'], answer: 1 },
  { id: 'b1-3', level: 'B1', skill: 'gramática', prompt: 'This bridge ___ in 1950.', options: ['built', 'was built', 'has built'], answer: 1 },
  { id: 'b1-4', level: 'B1', skill: 'vocabulario', prompt: 'Can you ___ the baby while I cook?', options: ['look after', 'look for', 'look up'], answer: 0 },
  { id: 'b1-5', level: 'B1', skill: 'lectura', text: 'Although the restaurant was expensive, we decided to stay because the view was amazing.', prompt: 'Why did they stay?', options: ['Because it was cheap', 'Because of the view', 'Because they were tired'], answer: 1 },
  { id: 'b1-6', level: 'B1', skill: 'vocabulario', prompt: "She's very ___; she always tells the truth.", options: ['honest', 'polite', 'proud'], answer: 0 },
  // B2
  { id: 'b2-1', level: 'B2', skill: 'gramática', prompt: 'By the time we arrived, the film ___.', options: ['started', 'had started', 'has started'], answer: 1 },
  { id: 'b2-2', level: 'B2', skill: 'gramática', prompt: "She's exhausted because she ___ all day.", options: ['has worked', 'has been working', 'worked'], answer: 1 },
  { id: 'b2-3', level: 'B2', skill: 'gramática', prompt: 'He told me that he ___ come the next day.', options: ['will', 'would', 'can'], answer: 1 },
  { id: 'b2-4', level: 'B2', skill: 'vocabulario', prompt: 'We need to ___ a solution before Friday.', options: ['come up with', 'come across', 'come down'], answer: 0 },
  { id: 'b2-5', level: 'B2', skill: 'lectura', text: "The council's decision to close the library has been met with fierce opposition from residents, who argue it is one of the few free public spaces left.", prompt: 'What do the residents think?', options: ['They support the closure', 'They oppose the closure', "They don't care"], answer: 1 },
  { id: 'b2-6', level: 'B2', skill: 'vocabulario', prompt: 'The new policy had a significant ___ on small businesses.', options: ['impact', 'affect', 'effort'], answer: 0 },
  // C1
  { id: 'c1-1', level: 'C1', skill: 'gramática', prompt: 'If I had taken the job, I ___ in Sydney now.', options: ['would be', 'will be', 'would have been'], answer: 0 },
  { id: 'c1-2', level: 'C1', skill: 'gramática', prompt: 'You ___ told me! I would have helped.', options: ['should have', 'must have', "can't have"], answer: 0 },
  { id: 'c1-3', level: 'C1', skill: 'gramática', prompt: 'Hardly ___ arrived when it started to rain.', options: ['we had', 'had we', 'we have'], answer: 1 },
  { id: 'c1-4', level: 'C1', skill: 'vocabulario', prompt: 'Her argument was so ___ that nobody could refute it.', options: ['compelling', 'compelled', 'complying'], answer: 0 },
  { id: 'c1-5', level: 'C1', skill: 'lectura', text: 'Far from being a mere inconvenience, the delay ultimately allowed the team to refine the product, which arguably contributed to its success.', prompt: 'What does the text suggest about the delay?', options: ['It ruined the product', 'It was ultimately beneficial', 'It was only a small problem'], answer: 1 },
  { id: 'c1-6', level: 'C1', skill: 'vocabulario', prompt: 'House prices have ___ since the crisis.', options: ['soared', 'sored', 'soured'], answer: 0 },
];
