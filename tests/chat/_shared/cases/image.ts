import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import { dataName, dataPath, RUN_TAG, toCases } from '../base';

export const ROOT_PATH  = `${dataPath}.jpeg`;
export const ROOT       = { type: 'image' as const, value: `${dataName}.jpeg` };

const EXT        = 'jpeg';
const NAME       = `${dataName}.${EXT}`;
const PATH       = `${dataPath}.${EXT}`;
const LARGE_NAME = '49MB.jpg';
const LARGE_PATH = './test-data/49MB.jpg';

const FORMATS = ['jpeg', 'jpg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico', 'tif', 'tiff', 'heic', 'heif', 'avif', 'jxl'];
const FORMAT_PATHS = FORMATS.map(ext => `${dataPath}.${ext}`);
const FORMAT_NAMES = FORMATS.map(ext => `${dataName}.${ext}`);

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'image in 1 round',
      run: svc => svc.send.sendMedia(PATH),
      expected: NAME,
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'image (exists caption) in 1 round',
      type: 'caption',
      run: svc => svc.send.sendMedia(PATH, `Image ${RUN_TAG}`),
      expected: `Image ${RUN_TAG}`,
      once: true,
      smoke: true
   },
   {
      id: '03',
      name: 'multiple images in N rounds',
      run: svc => svc.send.sendMedias([PATH, PATH, PATH]),
      expected: NAME,
      rounds: 3,
   },
   {
      id: '04',
      name: 'multiple images (exists caption) in N rounds',
      type: 'caption',
      run: svc => svc.send.sendMedias([PATH, PATH, PATH], [`Image ${RUN_TAG} 1`, `Image ${RUN_TAG} 2`, `Image ${RUN_TAG} 3`]),
      expected: `Image ${RUN_TAG} 3`,
      rounds: 3,
   },
   {
      id: '05',
      name: 'multiple images in 1 round',
      run: svc => svc.send.sendMediasInOneTime([PATH, PATH, PATH]),
      expected: NAME,
      once: true,
   },
   {
      id: '06',
      name: 'multiple images (exists caption) in 1 round',
      type: 'caption',
      run: svc => svc.send.sendMediasInOneTime([PATH, PATH, PATH], `Image ${RUN_TAG}`),
      expected: `Image ${RUN_TAG}`,
      once: true,
   },
   {
      id: '07',
      name: 'large-size image (~49MB) in 1 round',
      run: svc => svc.send.sendMedia(LARGE_PATH),
      expected: LARGE_NAME,
      once: true,
   },
   {
      id: '08',
      name: `all image formats (${FORMATS.length}) in N rounds`,
      run: svc => svc.send.sendMedias(FORMAT_PATHS),
      expected: FORMAT_NAMES[FORMAT_NAMES.length - 1],
      rounds: FORMATS.length,
   },
   {
      id: '09',
      name: 'unsupported image scenario in 1 round',
      run: svc => svc.send.sendMedia(`${dataPath}.jpegg`),
      once: true,
      skip: 'truthy',
   },
   {
      id: '10',
      name: 'exceed maximum image size (50MB)',
      run: svc => svc.send.sendMedia(`./test-data/Exceed50MB.jpg`),
      once: true,
      skip: 'truthy',
   },
   {
      id: '11',
      name: 'image while offline in 1 round',
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

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'image', SPECS);
