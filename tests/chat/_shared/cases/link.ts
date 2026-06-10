import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import { toCases, RUN_TAG } from '../base';

export const ROOT       = { type: 'link' as const, value: `https://example.com ${RUN_TAG}` };

const URL      = 'https://kchat.com';
const LONG_URL = `${URL}/`.repeat(50);

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'link in 1 round',
      run: svc => svc.send.sendText(URL),
      expected: URL,
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'multiple links in N rounds',
      run: svc => svc.send.sendTexts([`${URL}/1`, `${URL}/2`, `${URL}/3`]),
      expected: `${URL}/3`,
      rounds: 3,
   },
   {
      id: '03',
      name: 'multi-line links in 1 round (Shift+Enter)',
      run: svc => svc.send.sendMultilineText([`${URL}/1`, `${URL}/2`, `${URL}/3`]),
      expected: `${URL}/3`,
      once: true,
   },
   {
      id: '04',
      name: 'long link in 1 round',
      run: svc => svc.send.sendText(LONG_URL),
      expected: LONG_URL,
      once: true,
   },
   {
      id: '05',
      name: 'link while offline in 1 round',
      run: svc => svc.send.sendText(`${URL}/offline`),
      expected: `${URL}/offline`,
      once: true,
      skip: 'truthy',
   },
   {
      id: '06',
      name: 'unicode-error link in 1 round',
      run: svc => svc.send.sendText(`${URL}/\uD800\uDFFF`),
      once: true,
      skip: 'truthy',
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'link', SPECS);
