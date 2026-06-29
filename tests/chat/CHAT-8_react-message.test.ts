import { test } from '../_shared/fixtures/chat.fixture';
import { stepAndRetry } from '../../src/utils/actions';
import { ChatFlow as CHAT } from '../_shared/flows/chat/chat.flow';
import { GROUP_REF, COMM1_CHANNEL_REF, ORG1_CHANNEL_REF } from '../_shared/data/base.data';
import { TEXT, MENTION, LINK, EMOJI, IMAGE, VIDEO, FILE, VOICE, GIF, STICKER } from '../_shared/data/chat.data';

/* REACT ON: text, mention, link, emoji, image, video, file, voice, gif, sticker */
/* TOTAL: 20, SMOKE: 4, REGRESSION: 16 */

const TESTCASE_STEPS = [
   '1. User2: Select conversation >> Send a root message, verify and get last root message ID >> Get old unread message count >> Switch to other conversation >> Minimize app.', 
   '2. User1: Select conversation >> React on root message, verify and get last emoji on message',
   '3. User2: Reopen app >> Select conversation >> Verify last emoji on message >> Switch to other conversation.'
];

const ALLURE_BASE = { feature: 'Chat / React On Message', severity: 'normal' as const, description: `Verify that User can react and receive messages` };
const TESTCASE_NAME = (type: string) => `[React On Message] React on ${type} in 1 round`;

let rootMsg = `${TEXT.SHORT}`;
let rootMsgId = '';
let lastEmoji = '';

let oldUnread = 0; 
let newUnread = 0;// only send 1 time
let expUnread = 0;

let emojiObj = EMOJI.CATEGORIES[0]; let emojiIdx = 2;// emojis: ['👍', '❤️', '😂', '😮', '😢', '🙏']
let expEmoji = '😂';

const GROUP = { name: GROUP_REF[1].name };
const COMM_CHANNEL = { name: COMM1_CHANNEL_REF[3].name, parent: COMM1_CHANNEL_REF[3].parent };
const ORG_CHANNEL = { name: ORG1_CHANNEL_REF[3].name, parent: ORG1_CHANNEL_REF[3].parent };

const text = TEXT.SHORT;
const mention = MENTION('autotest02').SHORT;
const link = LINK.SHORT;

const emojiObj2 = { 
   category: EMOJI.CATEGORIES[1].category, 
   emojis: [EMOJI.CATEGORIES[1].emojis[10]] 
}; // ❤️
let expEmoji2 = '❤️';

const imageName = IMAGE.NAME;// demo.jpeg
const imagePath = IMAGE.PATH;
const imageCaption = `Test ${IMAGE.NAME}`;
const videoName = VIDEO.NAME;// demo.mp4
const videoPath = VIDEO.PATH;
const videoCaption = `Test ${VIDEO.NAME}`;
const fileName = FILE.NAME;// demo.txt
const filePath = FILE.PATH;
const fileCaption = `Test ${FILE.NAME}`;
const voiceDuration = VOICE.DURATION;
const gifName = GIF[0];// Cute Bear Sleeping with Phone on Head
const stickerName = STICKER[0];// Acetil Rabbit Says Yes Sticker

test.describe('[Chat][React On Message]', () => {
   test.describe.configure({ mode: 'serial' });

   test(`* CHECK USERNAME AT PROFILE SETTINGS *`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: '* CHECK USERNAME AT PROFILE SETTINGS *', tags: ['smoke']});
      await stepAndRetry('* CHECK USERNAME AT PROFILE SETTINGS *', async () => { 
         await  CHAT.viewProfileInfo(u1); 
         await  CHAT.viewProfileInfo(u2); 
      });
   });

   /*==================== TEXT MESSAGE ====================*/
   test(`[Direct Chat]${TESTCASE_NAME('text')} by fast`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.REACTION.prepareForReactionOnMsg( u2, { name: u1.username }, 'text', rootMsg);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { lastEmoji = await CHAT.REACTION.reactOnMsgAndVerifyInConv(u1, { name: u2.username }, 'reactFast', emojiObj, emojiIdx, rootMsgId); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.REACTION.verifyReceivedReactionOnMsg(u2, { name: u1.username }, rootMsgId, lastEmoji, expEmoji);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('text')} by more`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.REACTION.prepareForReactionOnMsg( u2, GROUP, 'text', rootMsg);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { lastEmoji = await CHAT.REACTION.reactOnMsgAndVerifyInConv(u1, GROUP, 'reactFast', emojiObj, emojiIdx, rootMsgId); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.REACTION.verifyReceivedReactionOnMsg(u2, GROUP, rootMsgId, lastEmoji, expEmoji);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('text')} by fast and more`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.REACTION.prepareForReactionOnMsg( u2, COMM_CHANNEL, 'text', rootMsg);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { lastEmoji = await CHAT.REACTION.reactOnMsgAndVerifyInConv(u1, COMM_CHANNEL, 'reactFast', emojiObj, emojiIdx, rootMsgId); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.REACTION.verifyReceivedReactionOnMsg(u2, COMM_CHANNEL, rootMsgId, lastEmoji, expEmoji);
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { lastEmoji = await CHAT.REACTION.reactOnMsgAndVerifyInConv(u1, COMM_CHANNEL, 'reactMore', emojiObj2, 0, rootMsgId); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.REACTION.verifyReceivedReactionOnMsg(u2, COMM_CHANNEL, rootMsgId, lastEmoji, expEmoji2);
      });
   });
   /*=======================================================*/   

});
