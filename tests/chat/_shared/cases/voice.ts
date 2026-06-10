import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import { RUN_TAG, toCases } from '../base';

export const ROOT = { type: 'voice' as const };

const DURATION = 1000;

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'voice in 1 round',
      run: svc => svc.send.sendVoice(DURATION),
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'voice (exists caption) in 1 round',
      type: 'caption',
      run: svc => svc.send.sendVoice(DURATION, `Voice ${RUN_TAG}`),
      expected: `Voice ${RUN_TAG}`,
      once: true,
      smoke: true
   },
   {
      id: '03',
      name: 'multiple voices in N rounds',
      run: svc => svc.send.sendVoices([DURATION, DURATION, DURATION]),
      rounds: 3,
   },
   {
      id: '04',
      name: 'multiple voices (exists caption) in N rounds',
      type: 'caption',
      run: svc => svc.send.sendVoices([DURATION, DURATION, DURATION], [`Voice ${RUN_TAG} 1`, `Voice ${RUN_TAG} 2`, `Voice ${RUN_TAG} 3`]),
      expected: `Voice ${RUN_TAG} 3`,
      rounds: 3,
   },
   {
      id: '05',
      name: 'multiple voices in 1 round',
      run: svc => svc.send.sendVoicesInOneTime([DURATION, DURATION, DURATION]),
      once: true,
   },
   {
      id: '06',
      name: 'multiple voices (exists caption) in 1 round',
      type: 'caption',
      run: svc => svc.send.sendVoicesInOneTime([DURATION, DURATION, DURATION], `Voice ${RUN_TAG}`),
      expected: `Voice ${RUN_TAG}`,
      once: true,
   },
   {
      id: '07',
      name: 'long voice (~60s) in 1 round',
      run: svc => svc.send.sendVoice(60_000),
      once: true,
   },
   {
      id: '08',
      name: 'voice while offline in 1 round',
      run: svc => svc.send.sendVoice(DURATION),
      once: true,
      skip: 'truthy',
   },
   {
      id: '09',
      name: 'unicode-error caption in 1 round',
      run: svc => svc.send.sendVoice(DURATION, '\uD800\uDFFF\u0000'),
      once: true,
      skip: 'truthy',
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'voice', SPECS);
