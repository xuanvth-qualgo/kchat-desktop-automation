import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import { dataName, dataPath, RUN_TAG, toCases } from '../base';

export const ROOT_PATH  = `${dataPath}.mp4`;
export const ROOT       = { type: 'video' as const, value: `${dataName}.mp4` };

const EXT        = 'mp4';
const NAME       = `${dataName}.${EXT}`;
const PATH       = `${dataPath}.${EXT}`;
const LARGE_NAME = '50MB.mp4';
const LARGE_PATH = './test-data/50MB.mp4';

const FORMATS = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'mpeg', 'mpg', 'm4v', 'ogv', '3gp', '3gpp', '3g2', '3gpp2'];
const FORMAT_PATHS = FORMATS.map(ext => `${dataPath}.${ext}`);
const FORMAT_NAMES = FORMATS.map(ext => `${dataName}.${ext}`);

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'video in 1 round',
      run: svc => svc.send.sendMedia(PATH),
      expected: NAME,
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'video (exists caption) in 1 round',
      type: 'caption',
      run: svc => svc.send.sendMedia(PATH, `Video ${RUN_TAG}`),
      expected: `Video ${RUN_TAG}`,
      once: true,
      smoke: true
   },
   {
      id: '03',
      name: 'multiple videos in N rounds',
      run: svc => svc.send.sendMedias([PATH, PATH, PATH]),
      expected: NAME,
      rounds: 3,
   },
   {
      id: '04',
      name: 'multiple videos (exists caption) in N rounds',
      type: 'caption',
      run: svc => svc.send.sendMedias([PATH, PATH, PATH], [`Video ${RUN_TAG} 1`, `Video ${RUN_TAG} 2`, `Video ${RUN_TAG} 3`]),
      expected: `Video ${RUN_TAG} 3`,
      rounds: 3,
   },
   {
      id: '05',
      name: 'multiple videos in 1 round',
      run: svc => svc.send.sendMediasInOneTime([PATH, PATH, PATH]),
      expected: NAME,
      once: true,
   },
   {
      id: '06',
      name: 'multiple videos (exists caption) in 1 round',
      type: 'caption',
      run: svc => svc.send.sendMediasInOneTime([PATH, PATH, PATH], `Video ${RUN_TAG}`),
      expected: `Video ${RUN_TAG}`,
      once: true,
   },
   {
      id: '07',
      name: 'large-size video (~50MB) in 1 round',
      run: svc => svc.send.sendMedia(LARGE_PATH),
      expected: LARGE_NAME,
      once: true,
   },
   {
      id: '08',
      name: `all video formats (${FORMATS.length}) in N rounds`,
      run: svc => svc.send.sendMedias(FORMAT_PATHS),
      expected: FORMAT_NAMES[FORMAT_NAMES.length - 1],
      rounds: FORMATS.length,
   },
   {
      id: '09',
      name: 'unsupported video scenario in 1 round',
      run: svc => svc.send.sendMedia(`${dataPath}.mp4g`),
      once: true,
      skip: 'truthy',
   },
   {
      id: '10',
      name: 'exceed maximum video size (200MB)',
      run: svc => svc.send.sendMedia(`./test-data/Exceed200MB.mp4`),
      once: true,
      skip: 'truthy',
   },
   {
      id: '11',
      name: 'video while offline in 1 round',
      run: svc => svc.send.sendMedia(PATH),
      once: true,
      skip: 'truthy',
   },
   {
      id: '12',
      name: 'unicode-error caption in 1 round',
      run: svc => svc.send.sendMedia(PATH, '\uD800\uDFFF\u0000'),
      once: true,
      skip: 'truthy',
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'video', SPECS);
