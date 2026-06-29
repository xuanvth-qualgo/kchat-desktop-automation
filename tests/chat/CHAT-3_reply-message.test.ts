import { test } from '../_shared/fixtures/chat.fixture';
import { stepAndRetry } from '../../src/utils/actions';
import { ChatFlow as CHAT } from '../_shared/flows/chat/chat.flow';
import { GROUP_REF, COMM1_CHANNEL_REF, ORG1_CHANNEL_REF } from '../_shared/data/base.data';
import { TEXT, MENTION, LINK, EMOJI, IMAGE, VIDEO, FILE, VOICE, GIF, STICKER } from '../_shared/data/chat.data';

/* REPLY BY: text, mention, link, emoji, image, video, file, voice, gif, sticker */
/* TOTAL: 38, SMOKE: 11, REGRESSION: 27 */

const TESTCASE_STEPS = [
   '1. User2: Select conversation >> Send a root message, verify and get last root message ID >> Get old unread message count >> Switch to other conversation >> Minimize app.', 
   '2. User1: Select conversation >> Reply on root message, verify and get last replied message ID',
   '3. User2: Reopen app >> Select conversation >> Verify actual unread message count >> Verify last replied message >> Switch to other conversation.'
];

const ALLURE_BASE = { feature: 'Chat / Reply On Message', severity: 'normal' as const, description: `Verify that User can reply and receive messages` };
const TESTCASE_NAME = (type: string) => `[Reply On Message] Reply on text by ${type} in 1 round`;

let rootMsg = `${TEXT.SHORT}`;
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

test.describe('[Chat][Reply On Message]', () => {
   test.describe.configure({ mode: 'serial' });

   test(`* CHECK USERNAME AT PROFILE SETTINGS *`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: '* CHECK USERNAME AT PROFILE SETTINGS *', tags: ['smoke']});
      await stepAndRetry('* CHECK USERNAME AT PROFILE SETTINGS *', async () => { 
         await  CHAT.viewProfileInfo(u1); 
         await  CHAT.viewProfileInfo(u2); 
      });
   });

   /*==================== TEXT MESSAGE [3]====================*/
   test(`[Direct Chat]${TESTCASE_NAME('text')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const result = await  CHAT.ACTION.prepareForActionOnMsg(u2, { name: u1.username }, 'text', rootMsg);
         oldUnread = result.oldUnread;
         rootMsgId = result.rootMessageId;
         await  CHAT.restoreApp(u2.app);
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.ACTION.actionOnMsgInConv(u1, { name: u2.username }, 'reply', rootMsgId, 'text', `REPLIED ${text}`); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.ACTION.verifyReceivedActionOnMsg(u2, { name: u1.username }, 'reply', 'text', `REPLIED ${text}`, expUnread, sentMsgId);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('text')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const resultGroup = await  CHAT.ACTION.prepareForActionOnMsg(u2, GROUP, 'text', rootMsg);
         oldUnread = resultGroup.oldUnread;
         rootMsgId = resultGroup.rootMessageId;
         await  CHAT.restoreApp(u2.app);
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.ACTION.actionOnMsgInConv(u1, GROUP, 'reply', rootMsgId, 'text', `REPLIED ${text}`); });  
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.ACTION.verifyReceivedActionOnMsg(u2, GROUP, 'reply', 'text', `REPLIED ${text}`, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('text')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const resultComm = await  CHAT.ACTION.prepareForActionOnMsg(u2, COMM_CHANNEL, 'text', rootMsg);
         oldUnread = resultComm.oldUnread;
         rootMsgId = resultComm.rootMessageId;
         await u2.bar.resetToChatTab();
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.ACTION.actionOnMsgInConv(u1, COMM_CHANNEL, 'reply', rootMsgId, 'text', `REPLIED ${text}`); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.ACTION.verifyReceivedActionOnMsg(u2, COMM_CHANNEL, 'reply', 'text', `REPLIED ${text}`, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/   

   /*==================== MENTION MESSAGE [2]====================*/
   test(`[Group Chat]${TESTCASE_NAME('mention')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('mention'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const resultGroup = await  CHAT.ACTION.prepareForActionOnMsg(u2, GROUP, 'text', rootMsg);
         oldUnread = resultGroup.oldUnread;
         rootMsgId = resultGroup.rootMessageId;
         await  CHAT.restoreApp(u2.app);
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.ACTION.actionOnMsgInConv(u1, GROUP, 'reply', rootMsgId, 'mention', `REPLIED ${mention}`); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.ACTION.verifyReceivedActionOnMsg(u2, GROUP, 'reply', 'mention', `REPLIED ${mention}`, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('mention')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('mention'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { 
         const resultComm = await  CHAT.ACTION.prepareForActionOnMsg(u2, COMM_CHANNEL, 'text', rootMsg);
         oldUnread = resultComm.oldUnread;
         rootMsgId = resultComm.rootMessageId;
         await u2.bar.resetToChatTab();
      });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.ACTION.actionOnMsgInConv(u1, COMM_CHANNEL, 'reply', rootMsgId, 'mention', `REPLIED ${mention}`); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.ACTION.verifyReceivedActionOnMsg(u2, COMM_CHANNEL, 'reply', 'mention', `REPLIED ${mention}`, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/   

   /*==================== LINK MESSAGE [3]====================*/
   
   /*=======================================================*/   

   /*==================== EMOJI MESSAGE [3]====================*/
   
   /*=======================================================*/   

   /*==================== IMAGE MESSAGE [3]====================*/
 
   /*=======================================================*/   

   /*==================== IMAGE MESSAGE (EXISTS CAPTION) [3]====================*/

   /*=======================================================*/

   /*==================== VIDEO MESSAGE [3]====================*/
   
   /*=======================================================*/
   
   /*==================== VIDEO MESSAGE (EXISTS CAPTION) [3]====================*/

   /*=======================================================*/   
   
   /*==================== FILE MESSAGE [3]====================*/
  
   /*=======================================================*/   

   /*==================== FILE MESSAGE (EXISTS CAPTION) [3]====================*/

   /*=======================================================*/   

   /*==================== VOICE MESSAGE [3]====================*/
   
   /*=======================================================*/   

   /*==================== GIF MESSAGE [3]====================*/
   
   /*=======================================================*/   

   /*==================== STICKER MESSAGE [3]====================*/
   
   /*=======================================================*/   

});
