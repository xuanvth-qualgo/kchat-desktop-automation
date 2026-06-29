import { allure } from 'allure-playwright';
import type { ChatUser } from '../../fixtures/chat.fixture';
import { minimizeApp, restoreApp, takeScreenShot } from '../../../../src/utils/actions';
import { AllureInfo } from '../../data/base.data';
import { scrollToElement } from '../../../../src/utils/ui';

const TIMEOUT = 500;

const EPIC_NAME = 'B2C / Group Conversation';

export const GroupFlow = {
   defineAllureInfo,
   takeGroupScreenShot,
   minimizeApp,
   restoreApp,

   removeMemberInGroup,
   inviteMembersToGroup,
   leaveGroup
}

async function takeGroupScreenShot(receiver: ChatUser, screenshotTag: string): Promise<void> {
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

async function removeMemberInGroup(user: ChatUser, username: string, timeout: number = TIMEOUT){
   await user.page.waitForTimeout(timeout);
   const convPanel = user.chat.getPage().getByRole('button', { name: 'Conversation info' });
   const groupScrollBar = user.chat.getPage().locator('//div[@class="kc-rightbar-content kc-rightbar-content--scrollable"]');
   const showAllBtn = user.chat.getPage().getByRole('button', { name: 'Show all member'});
   const removeMemBtn = user.chat.getPage().locator(`//span[normalize-space(.)="Remove member"]`)
   const removeConfBtn = user.chat.getPage().getByRole('button', { name: `Remove` })
   const closeBtn = user.chat.getPage().getByRole('button', { name: `Close` })

   const memEle = groupScrollBar.getByRole('button', { name: username } );
   await convPanel.click();
   if (await showAllBtn.isVisible()) await showAllBtn.click();
   await scrollToElement (groupScrollBar, memEle);
   await memEle.getByRole('button', { name: 'More action' }).click();
   await removeMemBtn.click();
   await removeConfBtn.click();
   await closeBtn.click();      
}

async function inviteMembersToGroup(user: ChatUser, usernamePrefix: string, usernames: string[], timeout: number = TIMEOUT){
   await user.page.waitForTimeout(timeout);
   const convPanel = user.chat.getPage().getByRole('button', { name: 'Conversation info' });
   const inviteBtn = user.chat.getPage().locator(`//span[normalize-space(.)="Invite"]`);
   const searchInput = user.chat.getPage().getByPlaceholder('Search by name or username');
   const inviteConfBtn = user.chat.getPage().getByRole('button', { name: `Invite` })
   const closeBtn = user.chat.getPage().getByRole('button', { name: `Close` })

   await convPanel.click();
   await inviteBtn.click();
   await searchInput.fill(usernamePrefix);

   for (const usr of usernames) {
       await user.chat.getPage().getByRole('button', { name: usr }).click();
   }

   await inviteConfBtn.click();
   await closeBtn.click();
}

async function leaveGroup(user: ChatUser, timeout: number = TIMEOUT){
   await user.page.waitForTimeout(timeout);
   const convPanel = user.chat.getPage().getByRole('button', { name: 'Conversation info' });
   const groupScrollBar = user.chat.getPage().locator('//div[@class="kc-rightbar-content kc-rightbar-content--scrollable"]');
   const leaveBtn = user.chat.getPage().getByRole('button', { name: 'Leave group'});
   const leaveConfBtn = user.chat.getPage().getByRole('button', { name: 'Leave'});
   const closeBtn = user.chat.getPage().getByRole('button', { name: `Close` })

   await convPanel.click();
   await scrollToElement (groupScrollBar, leaveBtn);
   await leaveBtn.click();
   await leaveConfBtn.click();
   await closeBtn.click();      
}