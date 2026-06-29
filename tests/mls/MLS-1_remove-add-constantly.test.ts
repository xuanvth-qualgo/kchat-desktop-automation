import { test } from '../_shared/fixtures/chat.fixture';
import { stepAndRetry } from '../../src/utils/actions';
import { ChatFlow as CHAT } from '../_shared/flows/chat/chat.flow';
import { GroupFlow as GROUPS } from '../_shared/flows/conversation/group.flow';
import { GROUP_REF } from '../_shared/data/base.data';

/**
 * Precondition: Owner, Admin1, Admin2 have contact with each Member
 */

const TESTCASE_STEPS = [
   '1. Owner, Admin1, Admin2, Member1, Member2, Member3, Member4: each account opens conversation',
   '2. Owner, Admin1, Admin2, Member1, Member2, Member3, Member4: each account sends 1 message', 
   '3. Owner: removes Member1',
   '4. Owner, Admin1, Admin2, Member2, Member3, Member4: each account sends 1 message',
   '5. Admin1: removes Member2',
   '6. Owner, Admin1, Admin2, Member3, Member4: each account sends 1 message',
   '7. Admin2: removes Member3',
   '8. Owner, Admin1, Admin2, Member4: each account sends 1 message',
   '9. Admin1: adds Member1, Member2, Member3',
   '10. Owner, Admin1, Admin2, Member1, Member2, Member3, Member4: each account sends 1 message', 
];

const ROUND = 1; // loop rounds all steps: 5 actions * 10 = 50 epoch
const memPrefix = 'autotest';

let firstMsgIdR1 = '', lastMsgIdR1 = ''; // calculate after step 2
let firstMsgIdR2 = '', lastMsgIdR2 = ''; // calculate after step 4
let firstMsgIdR3 = '', lastMsgIdR3 = ''; // calculate after step 6

const ALLURE_BASE = { feature: '[MLS Group]', severity: 'critical' as const, description: `Verify that User can view full messages and activities after actions constantly` };
const TESTCASE_NAME = `Remove and add member constantly`;

const text = 'test MLS';
const GROUP = { name: GROUP_REF[2].name };

test.describe('[MLS Group][Remove --> Add member constantly]', () => {
   test.describe.configure({ mode: 'serial' });

    /*==================== GROUP ====================*/
   test(`[MLS Group] ${TESTCASE_NAME}`, { tag: '@smoke' }, async ({ chatUser4: own, chatUser5: adm1, chatUser6: adm2 , chatUser7: mem1, chatUser8: mem2, chatUser9: mem3, chatUser10: mem4 }) => {
      for (let i = 1; i <= ROUND; i++) {  
         await CHAT.defineAllureInfo({ ...ALLURE_BASE, story: TESTCASE_NAME, tags: ['regression'] });
         await stepAndRetry(TESTCASE_STEPS[0], async () => {  
            await CHAT.selectConversation(own, GROUP, 'b2c', 500);     
            await CHAT.selectConversation(adm1, GROUP, 'b2c', 500); 
            await CHAT.selectConversation(adm2, GROUP, 'b2c', 500); 
            await CHAT.selectConversation(mem1, GROUP, 'b2c', 500); 
            await CHAT.selectConversation(mem2, GROUP, 'b2c', 500); 
            await CHAT.selectConversation(mem3, GROUP, 'b2c', 500); 
            await CHAT.selectConversation(mem4, GROUP, 'b2c', 500); 
         }); 
         await stepAndRetry(TESTCASE_STEPS[1], async () => {  
            const tag = 'round 1';

            await CHAT.SEND.sendMessageByType(own, 'text', `Owner ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm1, 'text', `Admin1 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm2, 'text', `Admin2 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem1, 'text', `Member1 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem2, 'text', `Member2 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem3, 'text', `Member3 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem4, 'text', `Member4 ${text}-${tag}`);
         });
         await stepAndRetry(TESTCASE_STEPS[2], async () => {  
            await GROUPS.removeMemberInGroup(own, mem1.username, 1500);
         }); 
         await stepAndRetry(TESTCASE_STEPS[3], async () => {  
            const tag = 'round 2';

            await CHAT.SEND.sendMessageByType(own, 'text', `Owner ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm1, 'text', `Admin1 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm2, 'text', `Admin2 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem2, 'text', `Member2 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem3, 'text', `Member3 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem4, 'text', `Member4 ${text}-${tag}`);
         }); 
         await stepAndRetry(TESTCASE_STEPS[4], async () => {  
            await GROUPS.removeMemberInGroup(adm1, mem2.username, 1000);
         }); 
         await stepAndRetry(TESTCASE_STEPS[5], async () => {  
            const tag = 'round 3';

            await CHAT.SEND.sendMessageByType(own, 'text', `Owner ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm1, 'text', `Admin1 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm2, 'text', `Admin2 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem3, 'text', `Member3 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem4, 'text', `Member4 ${text}-${tag}`);
         }); 
         await stepAndRetry(TESTCASE_STEPS[6], async () => {  
            await GROUPS.removeMemberInGroup(adm2, mem3.username, 500);
         }); 
         await stepAndRetry(TESTCASE_STEPS[7], async () => {  
            const tag = 'round 4';

            await CHAT.SEND.sendMessageByType(own, 'text', `Owner ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm1, 'text', `Admin1 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm2, 'text', `Admin2 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem4, 'text', `Member4 ${text}-${tag}`);
         });
         await stepAndRetry(`${TESTCASE_STEPS[8]}`, async () => {  
            const members = [mem1.username, mem2.username, mem3.username];
            await GROUPS.inviteMembersToGroup(adm1, memPrefix, members, 500);

         }); 
         await stepAndRetry(TESTCASE_STEPS[9], async () => {  
            const tag = 'round 5';

            await CHAT.SEND.sendMessageByType(own, 'text', `Owner ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm1, 'text', `Admin1 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(adm2, 'text', `Admin2 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem1, 'text', `Member1 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem2, 'text', `Member2 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem3, 'text', `Member3 ${text}-${tag}`);
            await CHAT.SEND.sendMessageByType(mem4, 'text', `Member4 ${text}-${tag}`);
         }); 
      }
   });
   /*=======================================================*/   
   
});