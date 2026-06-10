import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import { toCases, RUN_TAG } from '../base';

export const ROOT       = { type: 'text' as const, value: `ROOT TEXT ${RUN_TAG}` };

const TEXT      = 'Welcome to KChat Desktop';
const LONG_TEXT = `${TEXT} `.repeat(50).trim();

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'text in 1 round',
      run: svc => svc.send.sendText(TEXT),
      expected: TEXT,
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'multiple texts in N rounds',
      run: svc => svc.send.sendTexts([`${TEXT} 1`, `${TEXT} 2`, `${TEXT} 3`]),
      expected: `${TEXT} 3`,
      rounds: 3,
   },
   {
      id: '03',
      name: 'long text in 1 round',
      run: svc => svc.send.sendText(LONG_TEXT),
      expected: LONG_TEXT,
      once: true,
   },
   {
      id: '04',
      name: 'multi-line text in 1 round (Shift+Enter)',
      run: svc => svc.send.sendMultilineText([`${TEXT} 1`, `${TEXT} 2`, `${TEXT} 3`]),
      expected: `${TEXT} 3`,
      once: true,
   },
   {
      id: '05',
      name: 'text while offline in 1 round',
      run: svc => svc.send.sendText('Offline'),
      expected: 'Offline',
      once: true,
      skip: 'truthy',
   },
   {
      id: '06',
      name: 'unicode-error text in 1 round',
      run: svc => svc.send.sendText('\u0000\uFFFE\uD800 invalid \uDFFF'),
      expected: 'invalid',
      once: true,
      skip: 'truthy',
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'text', SPECS);
