import { allure } from 'allure-playwright';
import type { ChatUser } from '../../../_shared/fixtures/chat.fixture';
import { minimizeApp, restoreApp, takeScreenShot } from '../../../../src/utils/actions';
import { AllureInfo } from '../../../_shared/data/base.data';
import { SendMessageFlow as SEND } from './send-message.flow';
import { MoreActionFlow as ACTION } from './more-action.flow';
import { ReactionFlow as REACTION } from './reaction.flow';
import { ConversationRef } from '../../../../src/pages/common/SidebarPage';
import { GROUP_REF, COMM1_CHANNEL_REF, ORG1_CHANNEL_REF } from '../../../_shared/data/base.data';

const TIMEOUT = 500;

const EPIC_NAME = 'B2C / Chat';

export const ChatFlow = {
   defineAllureInfo,
   takeChatScreenShot,
   minimizeApp,
   restoreApp,
   selectConversation,
   switchToOtherConv,
   viewProfileInfo,

   SEND,
   ACTION,
   REACTION,
}

async function takeChatScreenShot(receiver: ChatUser, screenshotTag: string): Promise<void> {
   const page = receiver.page;
   await page.waitForTimeout(TIMEOUT);
   await takeScreenShot(page, screenshotTag);
}

async function defineAllureInfo(info: AllureInfo): Promise<void> {
   await allure.epic(EPIC_NAME);
   if (info.feature)     await allure.feature(info.feature);
   if (info.story)       await allure.story(info.story);
   if (info.severity)    await allure.severity(info.severity);
   if (info.description) await allure.description(info.description);
   for (const t of info.tags ?? []) await allure.tag(t);
}

async function viewProfileInfo(user: ChatUser){
   await user.page.getByRole('button', { name: 'Settings' }).click();
   await user.page.getByRole('button', { name: 'Profile & Account' }).click();
   const username = await user.page.getByPlaceholder('Choose a username').inputValue();
   console.log(`✅ Checked ${username} at Profile Setting`);
   await user.page.waitForTimeout(TIMEOUT);
   return username;
}

async function selectConversation(user: ChatUser, receiver: ConversationRef, tenant: string = 'b2c', timeout: number = 3000){// default B2C
   if (tenant === 'b2b'){
       await user.bar.selectOrganizationChannel(receiver.parent!, receiver.name);
   } else {// b2c
      if (receiver.parent) {
         await user.bar.selectCommunityChannel(receiver.parent!, receiver.name);
      } else {
         await user.bar.selectDirectConv(receiver.name);
      }
   }
   await user.page.waitForTimeout(timeout);
}

async function switchToOtherConv(
   user: ChatUser, 
   receiver: ConversationRef, 
   tenant?: string, 
   timeout: number = TIMEOUT
): Promise<void>{// to check unread count
   if (tenant === 'b2b'){
      await selectConversation(user, { name: ORG1_CHANNEL_REF[0].name, parent: ORG1_CHANNEL_REF[0].parent}, tenant);
   } else if (receiver.parent) {
      await selectConversation(user, { name: COMM1_CHANNEL_REF[0].name, parent: COMM1_CHANNEL_REF[0].parent}, tenant);
   } else {
      await selectConversation(user, { name: GROUP_REF[0].name}, tenant);
   }
   await user.page.waitForTimeout(timeout);
}