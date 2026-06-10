import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import { dataName, dataPath, RUN_TAG, toCases } from '../base';

export const ROOT_PATH  = `${dataPath}.txt`;
export const ROOT       = { type: 'file' as const, value: `${dataName}.txt` };

const EXT        = 'txt';
const NAME       = `${dataName}.${EXT}`;
const PATH       = `${dataPath}.${EXT}`;
const LARGE_NAME = '50MB.pdf';
const LARGE_PATH = './test-data/50MB.pdf';

const FORMATS = ['txt', 'md', 'log', 'pdf', 'json', 'jsonl', 'ndjson', 'yaml', 'yml', 'mp3', 'ogg'];
const FORMAT_PATHS = FORMATS.map(ext => `${dataPath}.${ext}`);
const FORMAT_NAMES = FORMATS.map(ext => `${dataName}.${ext}`);

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'file in 1 round',
      run: svc => svc.send.sendFile(PATH),
      expected: NAME,
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'file (exists caption) in 1 round',
      type: 'caption',
      run: svc => svc.send.sendFile(PATH, `File ${RUN_TAG}`),
      expected: `File ${RUN_TAG}`,
      once: true,
      smoke: true,
   },
   {
      id: '03',
      name: 'multiple files in N rounds',
      run: svc => svc.send.sendFiles([PATH, PATH, PATH]),
      expected: NAME,
      rounds: 3,
   },
   {
      id: '04',
      name: 'multiple files (exists caption) in N rounds',
      type: 'caption',
      run: svc => svc.send.sendFiles([PATH, PATH, PATH], [`File ${RUN_TAG} 1`, `File ${RUN_TAG} 2`, `File ${RUN_TAG} 3`]),
      expected: `File ${RUN_TAG} 3`,
      rounds: 3,
   },
   {
      id: '05',
      name: 'multiple files in 1 round',
      run: svc => svc.send.sendFilesInOneTime([PATH, PATH, PATH]),
      expected: NAME,
      once: true,
   },
   {
      id: '06',
      name: 'multiple files (exists caption) in 1 round',
      type: 'caption',
      run: svc => svc.send.sendFilesInOneTime([PATH, PATH, PATH], `File ${RUN_TAG}`),
      expected: `File ${RUN_TAG}`,
      once: true,
   },
   {
      id: '07',
      name: 'large-size file (~50MB) in 1 round',
      run: svc => svc.send.sendFile(LARGE_PATH),
      expected: LARGE_NAME,
      once: true,
   },
   {
      id: '08',
      name: `all file formats (${FORMATS.length}) in N rounds`,
      run: svc => svc.send.sendFiles(FORMAT_PATHS),
      expected: FORMAT_NAMES[FORMAT_NAMES.length - 1],
      rounds: FORMATS.length,
   },
   {
      id: '09',
      name: 'unsupported file scenario in 1 round',
      run: svc => svc.send.sendFile(`${dataPath}.txtt`),
      once: true,
      skip: 'truthy',
   },
   {
      id: '10',
      name: 'exceed maximum file size (2GB)',
      run: svc => svc.send.sendFile(`./test-data/Exceed2GB.pdf`),
      once: true,
      skip: 'truthy',
   },
   {
      id: '11',
      name: 'file while offline in 1 round',
      run: svc => svc.send.sendFile(PATH),
      once: true,
      skip: 'truthy',
   },
   {
      id: '12',
      name: 'unicode-error caption in 1 round',
      run: svc => svc.send.sendFile(PATH, '\uD800\uDFFF\u0000'),
      once: true,
      skip: 'truthy',
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'file', SPECS);
