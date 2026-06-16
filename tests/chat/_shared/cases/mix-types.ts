import type { Case, CaseFactoryOpts, CaseSpec } from '../base';
import type { ChatService } from '../../../../src/services/chat/ChatService';
import { dataPath, RECEIVER, RUN_TAG, toCases } from '../base';

const TEXT     = 'Welcome to KChat Desktop';
const URL      = 'https://kchat.com';
const EMOJI    = '🎉';
const MENTION  = `@${RECEIVER}`;
const IMG      = `${dataPath}.jpeg`;
const VID      = `${dataPath}.mp4`;
const FILE     = `${dataPath}.pdf`;
const VOICE_MS = 3000;

export const sendAllMedia = async (svc: ChatService, caption?: string): Promise<void> => {
   await svc.send.attachMedia(IMG);
   await svc.send.attachMedia(VID);
   await svc.send.attachFile(FILE);
   await svc.send.sendVoice(VOICE_MS, caption);
};

const SPECS: CaseSpec[] = [
   {
      id: '01',
      name: 'text + link + emoji in 1 round',
      run: svc => svc.send.sendText(`${TEXT} ${URL} ${EMOJI} ${RUN_TAG}`),
      expected: `${TEXT} ${URL} ${EMOJI} ${RUN_TAG}`,
      once: true,
      smoke: true,
   },
   {
      id: '02',
      name: 'text + mention + link + emoji in 1 round',
      type: 'mention',
      run: svc => svc.send.selectMention(`${TEXT} ${MENTION} ${URL} ${EMOJI} ${RUN_TAG}`),
      expected: `${TEXT} ${MENTION} ${URL} ${EMOJI} ${RUN_TAG}`,
      once: true,
      smoke: true,
   },// exclude Direct
   {
      id: '03',
      name: 'image + video + file + voice in 1 round',
      type: 'voice',
      run: svc => sendAllMedia(svc),
      once: true,
   },
   {
      id: '04',
      name: 'text + image + video + file + voice in 1 round',
      run: svc => sendAllMedia(svc, `${TEXT} ${RUN_TAG}`),
      expected: `${TEXT} ${RUN_TAG}`,
      once: true,
   },

   // ---- mention + media, auto-excluded in Direct via type: 'mention' ----
   {
      id: '05',
      name: 'mention + image in 1 round',
      type: 'mention',
      run: svc => svc.send.sendMedia(IMG, `${MENTION} image`),
      expected: `${MENTION} image`,
      once: true,
   },
   {
      id: '06',
      name: 'mention + video in 1 round',
      type: 'mention',
      run: svc => svc.send.sendMedia(VID, `${MENTION} video`),
      expected: `${MENTION} video`,
      once: true,
   },
   {
      id: '07',
      name: 'mention + file in 1 round',
      type: 'mention',
      run: svc => svc.send.sendFile(FILE, `${MENTION} file`),
      expected: `${MENTION} file`,
      once: true,
   },
   {
      id: '08',
      name: 'mention + voice in 1 round',
      type: 'mention',
      run: svc => svc.send.sendVoice(VOICE_MS, `${MENTION} voice`),
      expected: `${MENTION} voice`,
      once: true,
   },
   {
      id: '09',
      name: 'mention + image + video + file + voice in 1 round',
      type: 'mention',
      run: svc => sendAllMedia(svc, `${MENTION} image + video + file + voice`),
      expected: `${MENTION} image + video + file + voice`,
      once: true,
   },

   // ---- link + media ----
   {
      id: '10',
      name: 'link + image in 1 round',
      run: svc => svc.send.sendMedia(IMG, `${URL} image`),
      expected: `${URL} image`,
      once: true,
   },
   {
      id: '11',
      name: 'link + video in 1 round',
      run: svc => svc.send.sendMedia(VID, `${URL} video`),
      expected: `${URL} video`,
      once: true,
   },
   {
      id: '12',
      name: 'link + file in 1 round',
      run: svc => svc.send.sendFile(FILE, `${URL} file`),
      expected: `${URL} file`,
      once: true,
   },
   {
      id: '13',
      name: 'link + voice in 1 round',
      run: svc => svc.send.sendVoice(VOICE_MS, `${URL} voice`),
      expected: `${URL} voice`,
      once: true,
   },
   {
      id: '14',
      name: 'link + image + video + file + voice in 1 round',
      run: svc => sendAllMedia(svc, `${URL} image + video + file + voice`),
      expected: `${URL} image + video + file + voice`,
      once: true,
   },

   // ---- emoji + media ----
   {
      id: '15',
      name: 'emoji + image in 1 round',
      run: svc => svc.send.sendMedia(IMG, `${EMOJI} image`),
      expected: `${EMOJI} image`,
      once: true,
   },
   {
      id: '16',
      name: 'emoji + video in 1 round',
      run: svc => svc.send.sendMedia(VID, `${EMOJI} video`),
      expected: `${EMOJI} video`,
      once: true,
   },
   {
      id: '17',
      name: 'emoji + file in 1 round',
      run: svc => svc.send.sendFile(FILE, `${EMOJI} file`),
      expected: `${EMOJI} file`,
      once: true,
   },
   {
      id: '18',
      name: 'emoji + voice in 1 round',
      run: svc => svc.send.sendVoice(VOICE_MS, `${EMOJI} voice`),
      expected: `${EMOJI} voice`,
      once: true,
   },
   {
      id: '19',
      name: 'emoji + image + video + file + voice in 1 round',
      run: svc => sendAllMedia(svc, `${EMOJI} image + video + file + voice`),
      expected: `${EMOJI} image + video + file + voice`,
      once: true,
   },
];

export const buildCases = (opts: CaseFactoryOpts): Case[] => toCases(opts, 'caption', SPECS);
