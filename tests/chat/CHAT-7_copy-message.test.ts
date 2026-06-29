import { test } from '../_shared/fixtures/chat.fixture';
import { stepAndRetry } from '../../src/utils/actions';
import { ChatFlow as CHAT } from '../_shared/flows/chat/chat.flow';
import { GROUP_REF, COMM1_CHANNEL_REF, ORG1_CHANNEL_REF } from '../_shared/data/base.data';
import { TEXT, MENTION, LINK, EMOJI, IMAGE, VIDEO, FILE, VOICE, GIF, STICKER } from '../_shared/data/chat.data';

/* COPY FROM: copyText(text, mention, emoji), copyLink(link), copyImage(image, gif, sticker), copyText by caption(image, video, file) */
/* TOTAL: 29, SMOKE: 3, REGRESSION: 26 */

const TESTCASE_STEPS = [
   '1. User2: Select conversation >> Send a root message, verify and get last root message ID >> Get old unread message count >> Switch to other conversation >> Minimize app.', 
   '2. User1: Select conversation >> Copy root message and paste to group conversation, verify and get last pasted message ID',
   '3. User2: Reopen app >> Select pasted conversation >> Verify last pasted message >> Switch to other conversation.'
];

const ALLURE_BASE = { feature: 'Chat / Copy Message', severity: 'normal' as const, description: `Verify that User can copy-paste and receive messages` };
const TESTCASE_NAME = (type: string) => `[Copy Message] Copy from ${type} and paste in 1 round`;

let rootMsgId = '';
let sentMsgId = ''; 

let oldUnread = 0; 
let newUnread = 1;// only send 1 time
let expUnread = 0;

const GROUP = { name: GROUP_REF[1].name };
const COMM_CHANNEL = { name: COMM1_CHANNEL_REF[3].name, parent: COMM1_CHANNEL_REF[3].parent };
const ORG_CHANNEL = { name: ORG1_CHANNEL_REF[3].name, parent: ORG1_CHANNEL_REF[3].parent };

const text = TEXT.SHORT;
const mention = MENTION('autotest02').SHORT;
const link = LINK.SHORT;
const emojiObj = { 
   category: EMOJI.CATEGORIES[1].category, 
   emojis: [EMOJI.CATEGORIES[1].emojis[10]] 
}; // ❤️
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

test.describe('[Chat][Copy Message]', () => {
   test.describe.configure({ mode: 'serial' });

   test(`* CHECK USERNAME AT PROFILE SETTINGS *`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: '* CHECK USERNAME AT PROFILE SETTINGS *', tags: ['smoke']});
      await stepAndRetry('* CHECK USERNAME AT PROFILE SETTINGS *', async () => { 
         await  CHAT.viewProfileInfo(u1); 
         await  CHAT.viewProfileInfo(u2); 
      });
   });

   /*==================== TEXT MESSAGE [3]====================*/
   test(`[Direct Chat]${TESTCASE_NAME('text')} to Group`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, { name: u1.username }, 'text', text);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, { name: u2.username }, GROUP, 'copyText', rootMsgId, 'text', text); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, GROUP, 'copyText', 'text', `COPIED ${text}`, expUnread, sentMsgId);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('text')} to Community`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, GROUP, 'text', text);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, GROUP, COMM_CHANNEL, 'copyText', rootMsgId, 'text', text); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, COMM_CHANNEL, 'copyText', 'text', `COPIED ${text}`, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('text')} to Direct`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, COMM_CHANNEL, 'text', text);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, COMM_CHANNEL, { name: u2.username }, 'copyText', rootMsgId, 'text', text); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, { name: u1.username }, 'copyText', 'text', `COPIED ${text}`, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/  
   
   /*==================== MENTION MESSAGE [2]====================*/

   /*=======================================================*/   
   
   /*==================== LINK MESSAGE [3]====================*/
   test(`[Direct Chat]${TESTCASE_NAME('link')} to Group`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('link'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, { name: u1.username }, 'link', link);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, { name: u2.username }, GROUP, 'copyLink', rootMsgId, 'link', link); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, GROUP, 'copyLink', 'link', link, expUnread, sentMsgId);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('link')} to Community`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('link'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, GROUP, 'link', link);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, GROUP, COMM_CHANNEL, 'copyLink', rootMsgId, 'link', link); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, COMM_CHANNEL, 'copyLink', 'link', link, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('link')} to Direct`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('link'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, COMM_CHANNEL, 'link', link);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, COMM_CHANNEL, { name: u2.username }, 'copyLink', rootMsgId, 'link', link); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, { name: u1.username }, 'copyLink', 'link', link, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/  

   /*==================== EMOJI MESSAGE [3]====================*/

   /*=======================================================*/  

   /*==================== IMAGE MESSAGE [3]====================*/
   test(`[Direct Chat]${TESTCASE_NAME('image')} to Group`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, COMM_CHANNEL, 'image', imageName, imagePath);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, COMM_CHANNEL, { name: u2.username }, 'copyImage', rootMsgId, 'image', imageName); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, { name: u1.username }, 'copyImage', 'image', imageName, expUnread, sentMsgId);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('image')} to Community`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, COMM_CHANNEL, 'image', imageName, imagePath);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, COMM_CHANNEL, { name: u2.username }, 'copyImage', rootMsgId, 'image', imageName); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, { name: u1.username }, 'copyImage', 'image', imageName, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('image')} to Direct`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await CHAT.ACTION.prepareForActionOnMsg(u2, COMM_CHANNEL, 'image', imageName, imagePath);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await CHAT.ACTION.copyPasteInConv(u1, COMM_CHANNEL, { name: u2.username }, 'copyImage', rootMsgId, 'image', imageName); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await CHAT.ACTION.verifyReceivedActionOnMsg(u2, { name: u1.username }, 'copyImage', 'image', imageName, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/ 

   /*==================== IMAGE MESSAGE (exists caption) [3]====================*/

   /*=======================================================*/  

   /*==================== VIDEO MESSAGE (exists caption) [3]====================*/

   /*=======================================================*/  

   /*==================== FILE MESSAGE (exists caption) [3]====================*/

   /*=======================================================*/  

   /*==================== GIF MESSAGE [3]====================*/

   /*=======================================================*/ 

   /*==================== STICKER MESSAGE [3]====================*/

   /*=======================================================*/ 
});
