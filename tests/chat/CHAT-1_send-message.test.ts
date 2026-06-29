import { test } from '../_shared/fixtures/chat.fixture';
import { stepAndRetry } from '../../src/utils/actions';
import { ChatFlow as CHAT } from '../_shared/flows/chat/chat.flow';
import { GROUP_REF, COMM1_CHANNEL_REF, ORG1_CHANNEL_REF } from '../_shared/data/base.data';
import { TEXT, MENTION, LINK, EMOJI, IMAGE, VIDEO, FILE, VOICE, GIF, STICKER } from '../_shared/data/chat.data';

/* SEND: text, mention, link, emoji, image, video, file, voice, gif, sticker */
/* TOTAL: 38, SMOKE: 13, REGRESSION: 25 */
const TESTCASE_STEPS = [
   '1. User2: Select conversation >> Get old unread message count >> Switch to other conversation >> Minimize app.', 
   '2. User1: Select conversation >> Sent a new message, verify and get last sent message ID.', 
   '3. User2: Reopen app >> Verify actual unread message count >> Select conversation >> Verify last received message >> Switch to other conversation.'
];

const ALLURE_BASE = { feature: 'Chat / Send Message', severity: 'critical' as const, description: `Verify that User can send and receive messages` };
const TESTCASE_NAME = (type: string) => `[Send Message] Send ${type} in 1 round`;

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

test.describe('[Chat][Send Message]', () => {
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
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke']});
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'text', text); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'text', text, expUnread, sentMsgId);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('text')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke']});
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'text', text); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'text', text, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('text')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('text'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'text', text); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'text', text, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     
   
   /*==================== MENTION MESSAGE [2]====================*/
   test(`[Group Chat]${TESTCASE_NAME('mention')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('mention'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'mention', mention); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'mention', mention, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('mention')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('mention'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'mention', mention); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'mention', mention, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     

   /*==================== LINK MESSAGE [3]====================*/ 
   test(`[Direct Chat]${TESTCASE_NAME('link')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('link'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'link', link); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'link', link, expUnread, sentMsgId);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('link')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('link'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'link', link); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'link', link, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('link')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('link'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'link', link); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'link', link, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     
   
   /*==================== EMOJI MESSAGE [3]====================*/
   test(`[Direct Chat]${TESTCASE_NAME('emoji')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('emoji'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'emoji', emojiObj); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'emoji', `${emojiObj.emojis[0]}`, expUnread, sentMsgId);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('emoji')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('emoji'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'emoji', emojiObj); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'emoji', `${emojiObj.emojis[0]}`, expUnread, sentMsgId);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('emoji')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('emoji'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'emoji', emojiObj); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'emoji', `${emojiObj.emojis[0]}`, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     

   /*==================== IMAGE MESSAGE [3]====================*/
   test.skip(`[Direct Chat]${TESTCASE_NAME('image')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'image', imageName, imagePath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'image', imageName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Group Chat]${TESTCASE_NAME('image')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'image', imageName, imagePath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'image', imageName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Community Chat]${TESTCASE_NAME('image')}`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'image', imageName, imagePath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'image', imageName, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     

   /*==================== IMAGE MESSAGE (exists caption) [3]====================*/
   test(`[Direct Chat]${TESTCASE_NAME('image')} (exists caption)`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'image', imageName, imagePath, imageCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'image', imageName, expUnread, sentMsgId, imageCaption);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('image')} (exists caption)`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'image', imageName, imagePath, imageCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'image', imageName, expUnread, sentMsgId, imageCaption);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('image')} (exists caption)`, { tag: '@smoke' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('image'), tags: ['smoke'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'image', imageName, imagePath, imageCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'image', imageName, expUnread, sentMsgId, imageCaption);
      });
   });
   /*=======================================================*/

   /*==================== VIDEO MESSAGE [3]====================*/
   test.skip(`[Direct Chat]${TESTCASE_NAME('video')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('video'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'video', videoName, videoPath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'video', videoName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Group Chat]${TESTCASE_NAME('video')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('video'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'video', videoName, videoPath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'video', videoName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Community Chat]${TESTCASE_NAME('video')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('video'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'video', videoName, videoPath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'video', videoName, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     

   /*==================== VIDEO MESSAGE (exists caption) [3]====================*/
   test(`[Direct Chat]${TESTCASE_NAME('video')} (exists caption)`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('video'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'video', videoName, videoPath, videoCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'video', videoName, expUnread, sentMsgId, videoCaption);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('video')} (exists caption)`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('video'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'video', videoName, videoPath, videoCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'video', videoName, expUnread, sentMsgId, videoCaption);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('video')} (exists caption)`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('video'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'video', videoName, videoPath, videoCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'video', videoName, expUnread, sentMsgId, videoCaption);
      });
   });
   /*=======================================================*/ 

   /*==================== FILE MESSAGE [3]====================*/
   test.skip(`[Direct Chat]${TESTCASE_NAME('file')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('file'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'file', fileName, filePath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'file', fileName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Group Chat]${TESTCASE_NAME('file')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('file'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'file', fileName, filePath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'file', fileName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Community Chat]${TESTCASE_NAME('file')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('file'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'file', fileName, filePath); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'file', fileName, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     

   /*==================== FILE MESSAGE (exists caption) [3]====================*/
   test(`[Direct Chat]${TESTCASE_NAME('file')} (exists caption)`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('file'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'file', fileName, filePath, fileCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'file', fileName, expUnread, sentMsgId, fileCaption);
      });
   });
   test(`[Group Chat]${TESTCASE_NAME('file')} (exists caption)`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('file'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'file', fileName, filePath, fileCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'file', fileName, expUnread, sentMsgId, fileCaption);
      });
   });
   test(`[Community Chat]${TESTCASE_NAME('file')} (exists caption)`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('file'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'file', fileName, filePath, fileCaption); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'file', fileName, expUnread, sentMsgId, fileCaption);
      });
   });
   /*=======================================================*/   

   /*==================== VOICE MESSAGE [3]====================*/
   test.skip(`[Direct Chat]${TESTCASE_NAME('voice')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('voice'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'voice', voiceDuration); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'voice', '', expUnread, sentMsgId);
      });
   });
   test.skip(`[Group Chat]${TESTCASE_NAME('voice')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('voice'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'voice', voiceDuration); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'voice', '', expUnread, sentMsgId);
      });
   });
   test.skip(`[Community Chat]${TESTCASE_NAME('voice')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('voice'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'voice', voiceDuration); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'voice', '', expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     
    
   /*==================== GIF MESSAGE [3]====================*/
   test.skip(`[Direct Chat]${TESTCASE_NAME('gif')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('gif'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'gif', gifName); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'gif', gifName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Group Chat]${TESTCASE_NAME('gif')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
   await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('gif'), tags: ['regression'] });
   await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
   await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'gif', gifName); });
   await stepAndRetry(TESTCASE_STEPS[2], async () => {
      expUnread = oldUnread + newUnread;
      await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'gif', gifName, expUnread, sentMsgId);
   });
   });
   test.skip(`[Community Chat]${TESTCASE_NAME('gif')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('gif'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'gif', gifName); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'gif', gifName, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     

   /*==================== STICKER MESSAGE [3]====================*/
   test.skip(`[Direct Chat]${TESTCASE_NAME('sticker')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('sticker'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, { name: u1.username }); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, { name: u2.username }, 'sticker', stickerName); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, { name: u1.username }, 'sticker', stickerName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Group Chat]${TESTCASE_NAME('sticker')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('sticker'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, GROUP); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, GROUP, 'sticker', stickerName); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, GROUP, 'sticker', stickerName, expUnread, sentMsgId);
      });
   });
   test.skip(`[Community Chat]${TESTCASE_NAME('sticker')}`, { tag: '@regression' }, async ({ chatUser1: u1, chatUser2: u2 }) => {
      await  CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME('sticker'), tags: ['regression'] });
      await stepAndRetry(TESTCASE_STEPS[0], async () => { oldUnread = await  CHAT.SEND.prepareForSendMsg(u2, COMM_CHANNEL); });
      await stepAndRetry(TESTCASE_STEPS[1], async () => { sentMsgId = await  CHAT.SEND.sendMsgInConv(u1, COMM_CHANNEL, 'sticker', stickerName); });
      await stepAndRetry(TESTCASE_STEPS[2], async () => {
         expUnread = oldUnread + newUnread;
         await  CHAT.SEND.verifyReceivedMsg(u2, COMM_CHANNEL, 'sticker', stickerName, expUnread, sentMsgId);
      });
   });
   /*=======================================================*/     
});