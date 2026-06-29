import { test as base, UserApp } from './base.fixture';
import { ChatPage } from '../../../src/pages/chat/ChatPage';
import { installPushHook } from '../_helper';
import { SidebarPage } from '../../../src/pages/common/SidebarPage';
import { NotificationPushPage } from '../../../src/pages/notification/NotificationPushPage';

export type ChatUser = UserApp & {
   chat: ChatPage;
   bar: SidebarPage;
   noti: NotificationPushPage;
};

type ChatFixtures = {
   chatUser1: ChatUser;
   chatUser2: ChatUser;
   chatUser3: ChatUser;
   chatUser4: ChatUser;
   chatUser5: ChatUser;
   chatUser6: ChatUser;
   chatUser7: ChatUser;
   chatUser8: ChatUser;
   chatUser9: ChatUser;
   chatUser10: ChatUser;
};

async function buildChatUser(u: UserApp): Promise<ChatUser> {
   await installPushHook(u.page);
   return {
      ...u,
      chat: new ChatPage(u.page, u.app),
      bar: new SidebarPage(u.page),
      noti: new NotificationPushPage(u.page),
   };
}

export const test = base.extend<{}, ChatFixtures>({
   chatUser1: [async ({ user1 }, use) => { await use(await buildChatUser(user1)); }, { scope: 'worker' }],
   chatUser2: [async ({ user2 }, use) => { await use(await buildChatUser(user2)); }, { scope: 'worker' }],
   chatUser3: [async ({ user3 }, use) => { await use(await buildChatUser(user3)); }, { scope: 'worker' }],
   chatUser4: [async ({ user4 }, use) => { await use(await buildChatUser(user4)); }, { scope: 'worker' }],
   chatUser5: [async ({ user5 }, use) => { await use(await buildChatUser(user5)); }, { scope: 'worker' }],
   chatUser6: [async ({ user6 }, use) => { await use(await buildChatUser(user6)); }, { scope: 'worker' }],
   chatUser7: [async ({ user7 }, use) => { await use(await buildChatUser(user7)); }, { scope: 'worker' }],
   chatUser8: [async ({ user8 }, use) => { await use(await buildChatUser(user8)); }, { scope: 'worker' }],
   chatUser9: [async ({ user9 }, use) => { await use(await buildChatUser(user9)); }, { scope: 'worker' }],
   chatUser10: [async ({ user10 }, use) => { await use(await buildChatUser(user10)); }, { scope: 'worker' }]
});

export { expect } from '@playwright/test';
