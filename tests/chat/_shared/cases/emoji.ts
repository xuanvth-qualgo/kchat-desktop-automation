import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import type { EmojiObj } from '../../../../src/services/chat/types';
import { toCases } from '../base';

export const ROOT_PICKER = { category: 'Smileys & People', emojis: ['🫣'] };

export const ROOT        = { type: 'emoji' as const, value: ROOT_PICKER.emojis.join('') };

export const CATEGORIES: EmojiObj[] = [
   { category: 'Smileys & People',  emojis: ['😀', '😍', '🤩', '🫢', '🫣'] },
   { category: 'Animals & Nature',  emojis: ['🐶', '🐣', '🐇'] },
   { category: 'Food & Drink',      emojis: ['🍎'] },
   { category: 'Activity',          emojis: ['⚽'] },
   { category: 'Travel & Places',   emojis: ['✈️'] },
   { category: 'Objects',           emojis: ['💄'] },
   { category: 'Symbols',           emojis: ['➡️'] },
   { category: 'Flags',             emojis: ['🏁'] },
];

export const ONE_PER_CATEGORY: EmojiObj[] =
   CATEGORIES.map(c => ({ category: c.category, emojis: [c.emojis[7]] }));

const FIRST      = ONE_PER_CATEGORY[0];
const TWO_GROUPS = CATEGORIES.slice(0, 2);
const MULTILINE  = ONE_PER_CATEGORY.slice(0, 3).map(c => c.emojis[0]);
const LONG_GROUP: EmojiObj = { category: FIRST.category, emojis: Array(10).fill(FIRST.emojis[0]) };
const lastTip    = (gs: EmojiObj[]) => { const g = gs[gs.length - 1]; return g.emojis[g.emojis.length - 1]; };

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'emoji in 1 round',
      run: svc => svc.send.sendEmoji(FIRST),
      expected: FIRST.emojis[0],
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'multiple emojis in N rounds',
      run: svc => svc.send.sendEmojis(TWO_GROUPS),
      expected: lastTip(TWO_GROUPS),
      rounds: TWO_GROUPS.reduce((n, g) => n + g.emojis.length, 0),
   },
   {
      id: '03',
      name: 'long emojis in 1 round',
      run: svc => svc.send.sendEmojisInOneTime([LONG_GROUP]),
      expected: LONG_GROUP.emojis.join(''),
      once: true,
   },
   {
      id: '04',
      name: 'multi-line emojis in 1 round (Shift+Enter)',
      run: svc => svc.send.sendMultilineText(MULTILINE),
      expected: MULTILINE[MULTILINE.length - 1],
      once: true,
   },
   {
      id: '05',
      name: '1 emoji per category in 1 round',
      run: svc => svc.send.sendEmojisInOneTime(ONE_PER_CATEGORY),
      expected: lastTip(ONE_PER_CATEGORY),
      once: true,
   },
   {
      id: '06',
      name: 'emoji while offline in 1 round',
      run: svc => svc.send.sendEmoji(FIRST),
      expected: FIRST.emojis[0],
      once: true,
      skip: 'truthy',
   },
   {
      id: '07',
      name: 'unicode-error emoji in 1 round',
      run: svc => svc.send.sendText('\uD83D invalid \uDC00'),
      expected: '\uD83D invalid \uDC00',
      once: true,
      skip: 'truthy',
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'emoji', SPECS);
