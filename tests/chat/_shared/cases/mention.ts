import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import { RECEIVER, toCases, RUN_TAG } from '../base';

export const ROOT       = { type: 'mention' as const, value: `@autotest02 ${RUN_TAG}` };

const MENTION      = `@${RECEIVER}`;
const LONG_MENTION = `${MENTION} `.repeat(50).trim();

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'mention in 1 round',
      run: svc => svc.send.selectMention(`${MENTION} hello`),
      expected: `${MENTION} hello`,
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'multiple mentions in N rounds',
      run: svc => svc.send.selectMentions([`${MENTION} 1`, `${MENTION} 2`, `${MENTION} 3`]),
      expected: `${MENTION} 3`,
      rounds: 3,
   },
   {
      id: '03',
      name: 'multi-line mentions in 1 round (Shift+Enter)',
      run: svc => svc.send.selectMultilineMention([`${MENTION} 1`, `${MENTION} 2`, `${MENTION} 3`]),
      expected: `${MENTION} 3`,
      once: true,
   },
   {
      id: '04',
      name: 'long mention in 1 round',
      run: svc => svc.send.selectMention(LONG_MENTION),
      expected: LONG_MENTION,
      once: true,
   },
   {
      id: '05',
      name: 'mention while offline in 1 round',
      run: svc => svc.send.selectMention(`${MENTION} offline`),
      expected: `${MENTION} offline`,
      once: true,
      skip: 'truthy',
   },
   {
      id: '06',
      name: 'unicode-error mention in 1 round',
      run: svc => svc.send.selectMention(`@\uD800\uDFFF\u0000`),
      once: true,
      skip: 'truthy',
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'mention', SPECS);
