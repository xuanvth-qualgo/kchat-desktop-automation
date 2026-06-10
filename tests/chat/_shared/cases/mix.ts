import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import type { ChatService } from '../../../../src/services/chat/ChatService';
import { dataPath, RECEIVER, RUN_TAG, toCases } from '../base';

/* Mix-content cases: combine text-like elements (text/mention/link/emoji)
 * with media-like attachments (image/video/file/voice). Combo cases put the
 * caption on the LAST item so the verifier matches a single bubble. */

const TEXT     = 'Welcome to KChat Desktop';
const URL      = 'https://kchat.com';
const EMOJI    = '🎉';
const MENTION  = `@${RECEIVER}`;
const IMG      = `${dataPath}.jpeg`;
const VID      = `${dataPath}.mp4`;
const FILE     = `${dataPath}.pdf`;
const VOICE_MS = 3000;

const sendAllMedia = (svc: ChatService, caption?: string) =>
   svc.send.sendMedia(IMG)
      .then(() => svc.send.sendMedia(VID))
      .then(() => svc.send.sendFile(FILE))
      .then(() => svc.send.sendVoice(VOICE_MS, caption));

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'text + mention + link + emoji in 1 round',
      type: 'mention',
      run: svc => svc.send.selectMention(`${TEXT} ${MENTION} ${URL} ${EMOJI} ${RUN_TAG}`),
      expected: `${TEXT} ${MENTION} ${URL} ${EMOJI} ${RUN_TAG}`,
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'image + video + file + voice in 1 round',
      type: 'voice',
      run: svc => sendAllMedia(svc),
      once: true,
   },
   {
      id: '03',
      name: 'text + image + video + file + voice in 1 round',
      run: svc => sendAllMedia(svc, `${TEXT} ${RUN_TAG}`),
      expected: `${TEXT} ${RUN_TAG}`,
      once: true,
   },

   // ---- mention + media ----
   {
      id: '04',
      name: 'mention + image in 1 round',
      run: svc => svc.send.sendMedia(IMG, `${MENTION} image`),
      expected: `${MENTION} image`,
      once: true,
   },
   {
      id: '05',
      name: 'mention + video in 1 round',
      run: svc => svc.send.sendMedia(VID, `${MENTION} video`),
      expected: `${MENTION} video`,
      once: true,
   },
   {
      id: '06',
      name: 'mention + file in 1 round',
      run: svc => svc.send.sendFile(FILE, `${MENTION} file`),
      expected: `${MENTION} file`,
      once: true,
   },
   {
      id: '07',
      name: 'mention + voice in 1 round',
      run: svc => svc.send.sendVoice(VOICE_MS, `${MENTION} voice`),
      expected: `${MENTION} voice`,
      once: true,
   },
   {
      id: '08',
      name: 'mention + image + video + file + voice in 1 round',
      run: svc => sendAllMedia(svc, `${MENTION} combo`),
      expected: `${MENTION} combo`,
      once: true,
   },

   // ---- link + media ----
   {
      id: '09',
      name: 'link + image in 1 round',
      run: svc => svc.send.sendMedia(IMG, `${URL} image`),
      expected: `${URL} image`,
      once: true,
   },
   {
      id: '10',
      name: 'link + video in 1 round',
      run: svc => svc.send.sendMedia(VID, `${URL} video`),
      expected: `${URL} video`,
      once: true,
   },
   {
      id: '11',
      name: 'link + file in 1 round',
      run: svc => svc.send.sendFile(FILE, `${URL} file`),
      expected: `${URL} file`,
      once: true,
   },
   {
      id: '12',
      name: 'link + voice in 1 round',
      run: svc => svc.send.sendVoice(VOICE_MS, `${URL} voice`),
      expected: `${URL} voice`,
      once: true,
   },
   {
      id: '13',
      name: 'link + image + video + file + voice in 1 round',
      run: svc => sendAllMedia(svc, `${URL} combo`),
      expected: `${URL} combo`,
      once: true,
   },

   // ---- emoji + media ----
   {
      id: '14',
      name: 'emoji + image in 1 round',
      run: svc => svc.send.sendMedia(IMG, `${EMOJI} image`),
      expected: `${EMOJI} image`,
      once: true,
   },
   {
      id: '15',
      name: 'emoji + video in 1 round',
      run: svc => svc.send.sendMedia(VID, `${EMOJI} video`),
      expected: `${EMOJI} video`,
      once: true,
   },
   {
      id: '16',
      name: 'emoji + file in 1 round',
      run: svc => svc.send.sendFile(FILE, `${EMOJI} file`),
      expected: `${EMOJI} file`,
      once: true,
   },
   {
      id: '17',
      name: 'emoji + voice in 1 round',
      run: svc => svc.send.sendVoice(VOICE_MS, `${EMOJI} voice`),
      expected: `${EMOJI} voice`,
      once: true,
   },
   {
      id: '18',
      name: 'emoji + image + video + file + voice in 1 round',
      run: svc => sendAllMedia(svc, `${EMOJI} combo`),
      expected: `${EMOJI} combo`,
      once: true,
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'caption', SPECS);
