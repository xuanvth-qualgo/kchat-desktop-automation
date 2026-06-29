import { EmojiObj } from '../../../src/pages/chat/sections/components/EmojiPicker';
import { RUN_TAG } from '../../../src/utils/helpers';

export const PASTE_SHORTCUT = process.platform === 'darwin'
   ? 'Meta+V'
   : 'Control+V';

export const IMAGE_EXT = new Set([
   'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'heic', 'heif', 'ico', 'tiff', 'tif', 'avif', 'svg',
]);
export const VIDEO_EXT = new Set([
   'mp4', 'avi', 'mov', 'mkv', 'webm', 'flv', 'wmv', 'mpg', 'mpeg', 'm4v', '3gp',
]);
export const FILE_EXT = new Set([
   'txt', 'md', 'log', 'pdf', 'json', 'jsonl', 'ndjson', 'yaml', 'yml', 'mp3', 'ogg',
]);
export const LINK_TLDS = new Set([
   'com', 'net', 'org', 'io', 'co', 'dev', 'app', 'vn', 'edu', 'gov', 'info', 'me', 'xyz', 'ai',
]);
export const URL_PREFIX_RE = /^(https?:\/\/|www\.)/i;

// Message content
const NAME = 'demo';
const PATH = `./test-files/${NAME}`;
const repeat = (s: string, n = 50) => `${s} `.repeat(n).trim();

export const TEXT = {
   SHORT: `Auto test-${RUN_TAG}`,
   LONG:  repeat(`Auto test-${RUN_TAG}`),
};

export const MENTION = (receiver = 'autotest02') => ({// default, can change from fixture
   SHORT: `@${receiver}`,
   LONG:  repeat(`@${receiver}`),
});

export const LINK = {
   SHORT: 'https://kchat.com',
   LONG:  repeat('https://kchat.com'),
};

export const EMOJI = {
   CATEGORIES: [
      { category: 'Fast Reaction',     emojis: ['👍', '❤️', '😂', '😮', '😢', '🙏'] },
      { category: 'Smileys & People',  emojis: ['😀', '😃', '😄', '😁', '😆',     '👍','👋','👌','✌️','🤟',     '❤️','🙈','💯','🙀','😹'] },
      { category: 'Animals & Nature',  emojis: ['🐶', '🐣', '🐇'] },
      { category: 'Food & Drink',      emojis: ['🍎'] },
      { category: 'Activity',          emojis: ['⚽'] },
      { category: 'Travel & Places',   emojis: ['✈️'] },
      { category: 'Objects',           emojis: ['💄'] },
      { category: 'Symbols',           emojis: ['➡️'] },
      { category: 'Flags',             emojis: ['🏁'] },
   ],
   LONG_GROUP: { category: 'Smileys & People', emojis: Array(10).fill('😀') },
};

const media = (ext: string, formats: string[], large: string) => ({
   NAME:       `${NAME}.${ext}`,
   PATH:       `${PATH}.${ext}`,
   LARGE_NAME: large,
   LARGE_PATH: `./test-data/${large}`,
   FORMATS:    formats,
   PATHS:      formats.map(e => `${PATH}.${e}`),
   NAMES:      formats.map(e => `${NAME}.${e}`),
});

export const IMAGE = media('jpeg', [...IMAGE_EXT], '49MB.jpg');

export const VIDEO = media('mp4',  [...VIDEO_EXT], '50MB.mp4');

export const FILE = media('txt', [...FILE_EXT], '50MB.pdf');

export const VOICE = { DURATION: 10000 };

export const MIX = (receiver = 'autotest02') => ({
   TEXT:     'Welcome to KChat Desktop',
   URL:      'https://kchat.com',
   EMOJI:    '🎉',
   MENTION:  `@${receiver}`,
   IMG:      IMAGE.PATH,
   VID:      VIDEO.PATH,
   FILE:     FILE.PATH,
   VOICE_MS: 3000,
});

// Must search key before img[alt=""]
export const GIF = [
   'Cute Bear Sleeping with Phone on Head',
   'Pudgy Penguin Makes It Rain Dollars',
   'Mario Gives Thumbs Up',
   'Cony and Brown: Thumbs Up!',
   'Pio Chick Says Thank You'
];

export const STICKER = [
   'Acetil Rabbit Says Yes Sticker',
   'Cool Sunglasses Emoji for TikTok',
   'Pixel Art Congrats Clap Sticker',
   'Full-toothed Grin Party Popper Winks and Explodes',
   'Excited Minion Minions Sticker'
];

export type MessageObj =
   | { type: 'text';    value: string;                      expId: string, expValue: string }
   | { type: 'link';    value: string;                      expId: string, expValue: string }
   | { type: 'mention'; value: string;                      expId: string, expValue: string }
   | { type: 'emoji';   value: EmojiObj;                    expId: string, expValue: string }
   | { type: 'image';   value: string;   caption?: string;  expId: string, expValue: string }
   | { type: 'video';   value: string;   caption?: string;  expId: string, expValue: string }
   | { type: 'file';    value: string;   caption?: string;  expId: string, expValue: string }
   | { type: 'voice';   value: number;                      expId: string }
   | { type: 'gif';     value: string;                      expId: string }
   | { type: 'sticker'; value: string;                      expId: string };

export type ReactionObj = 
   | { type: 'fastReact'; value: string;    expValue: string; expCount?: number }
   | { type: 'moreReact'; value: EmojiObj;  expValue: string; expCount?: number }
   ;

export type MessageAction =
   | 'reply'
   | 'forward'
   | 'edit'
   | 'delete'
   | 'copyText'
   | 'copyLink'
   | 'copyImage'
   | 'createThread'
   | 'openThread';

export type MessageReaction =   
   | 'reactFast'
   | 'reactMore'
   ;