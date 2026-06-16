import { ChatPage } from '../src/pages/chat/ChatPage';
import { ChatService } from '../src/services/chat/ChatService';
import { NotificationPushPage } from '../src/pages/notification-push/NotificationPushPage';
import { NotificationPushService } from '../src/services/notification-push/NotificationPushService';
import { test } from './fixtures';
import { stepAndRetry } from './retry';
import 'dotenv/config';

const ACCOUNT1 = process.env.ACCOUNT1!;
const ACCOUNT2 = process.env.ACCOUNT2!;
const ACCOUNT3 = process.env.ACCOUNT3!;
const GROUP_NAME = "Automation Test Group";
const COMMUNITY_NAME = "Automation Test Community";
const GROUP_COMMUNITY_NAME = "Group A";

test.describe("ACCOUNT1 send message", () => {
    test.describe.configure({ mode: 'serial' });

    let kService1: ChatService, kService2: ChatService, kService3: ChatService;
    let nService2: NotificationPushService, nService3: NotificationPushService;
 
    test.beforeEach(({ user1, user2, user3 }) => {
        kService1 = new ChatService(new ChatPage(user1.app, user1.page));
        kService2 = new ChatService(new ChatPage(user2.app, user2.page));
        kService3 = new ChatService(new ChatPage(user3.app, user3.page));
        nService2 = new NotificationPushService(new NotificationPushPage(user2.page));
        nService3 = new NotificationPushService(new NotificationPushPage(user3.page));
    });


    test("send text to direct chat", async () => {
        const unread2 = await nService2.getUnreadCount(ACCOUNT1);
        const unread3 = await nService3.getUnreadCount(ACCOUNT1);

        await stepAndRetry("receivers switch other conversations", async () => {
            await kService2.openConversation("KChat™ ✨");
            await kService3.openConversation("KChat™ ✨");
        });

        await stepAndRetry("send text to and check last sent", async () => {
            await kService1.openConversation("autotest02");
            await kService1.send.sendText("Hello 1");
            await kService1.view.verifyLastText("Hello 1");
        });
        
        await stepAndRetry("send text and check last sent", async () => {
            await kService1.openConversation("autotest03");
            await kService1.send.sendText("Hello 1");
            await kService1.view.verifyLastText("Hello 1");
        });


        await nService2.expectUnreadCount("autotest01", unread2 + 1);
        await kService2.openConversation("autotest01");
        await kService2.view.verifyLastText("Hello 1");
        await kService2.view.takeScreenShot("autotest01-send-direct-autotest02")
        await kService2.chatPage.composers.focusMessage();


        await nService3.expectUnreadCount("autotest01", unread3 + 1);
        await kService3.openConversation("autotest01");
        await kService3.view.verifyLastText("Hello 1");
        await kService3.view.takeScreenShot("autotest01-send-direct-autotest03")
        await kService3.chatPage.composers.focusMessage();
    });

    stepAndRetry("send text to group chat", async()=>{
                const unread2 = await nService2.getUnreadCount(GROUP_NAME);
        const unread3 = await nService3.getUnreadCount(GROUP_NAME);
        
        await kService2.openConversation("KChat™ ✨");
        await kService3.openConversation("KChat™ ✨");

        await kService1.openConversation(GROUP_NAME);
        await kService1.send.sendText("Hello 2");
        await kService1.view.verifyLastText("Hello 2");

            await nService2.expectUnreadCount(GROUP_NAME, unread2 + 1);
        await kService2.openConversation(GROUP_NAME);
        await kService2.view.verifyLastText("Hello 2");
            await kService2.view.takeScreenShot("autotest01-send-group-autotest02")
        await kService2.chatPage.composers.focusMessage();

            await nService3.expectUnreadCount(GROUP_NAME, unread3 + 1);
        await kService3.openConversation(GROUP_NAME);
        await kService3.view.verifyLastText("Hello 2");
                await kService3.view.takeScreenShot("autotest01-send-group-autotest03")
        await kService3.chatPage.composers.focusMessage();
    });

    stepAndRetry("send emoji to direct chat", async () => {
        const unread2 = await nService2.getUnreadCount("autotest01");
        const unread3 = await nService3.getUnreadCount("autotest01");

await kService2.openConversation("KChat™ ✨");
    await kService3.openConversation("KChat™ ✨");


    await kService1.openConversation("autotest02");
    await kService1.send.sendEmoji({category: "Animals & Nature", emojis: ['🐣']});
    await kService1.view.verifyLastText("🐣");
    await kService1.openConversation("autotest03");
    await kService1.send.sendMedia("test-data/demo.jpeg", "Send image");
    await kService1.view.verifyLastImage("demo.jpeg");

    await nService2.expectUnreadCount("autotest01", unread2 + 1);
    await kService2.openConversation("autotest01");
    await kService2.view.verifyLastText("🐣");
    await kService2.view.takeScreenShot("autotest01-send-direct-autotest02")
    await kService2.chatPage.composers.focusMessage();

    await nService3.expectUnreadCount("autotest01", unread3 + 1);
    await kService3.openConversation("autotest01");
    await kService3.view.verifyLastImage("demo.jpeg");
    await kService3.view.takeScreenShot("autotest01-send-direct-autotest03")
    await kService3.chatPage.composers.focusMessage();

    });

    stepAndRetry("send image to group chat", async () => {
            const unread2 = await nService2.getUnreadCount(GROUP_NAME);
        const unread3 = await nService3.getUnreadCount(GROUP_NAME);

        await kService2.openConversation("KChat™ ✨");
    await kService3.openConversation("KChat™ ✨");

    await kService1.openConversation(GROUP_NAME);
    await kService1.send.selectMention("@autotest02");
    await kService1.view.verifyLastText("@autotest02");

        await nService2.expectUnreadCount(GROUP_NAME, unread2 +1);
    await kService2.openConversation(GROUP_NAME);
    await kService2.view.verifyLastText("@autotest02");
        await kService2.view.takeScreenShot("autotest01-send-group-autotest02")
    await kService2.chatPage.composers.focusMessage();

        await nService3.expectUnreadCount("Automation Test Group", unread3 + 1);
    await kService3.openConversation("Automation Test Group");
    await kService3.view.verifyLastText("@autotest02");
            await kService3.view.takeScreenShot("autotest01-send-group-autotest03")
    await kService3.chatPage.composers.focusMessage();


    })
   
      stepAndRetry("send text to community chat", async () => {
            const unread2 = await nService2.getUnreadCount("Automation Test Group");
        const unread3 = await nService3.getUnreadCount("Automation Test Group");

            await kService2.openConversation("General", "Automation Test Community");
    await kService3.openConversation("General", "Automation Test Community");

    await kService1.openConversation("Group A", "Automation Test Community");
    await kService1.send.sendText("Hello 3");
    await kService1.view.verifyLastText("Hello 3");

                        await nService2.expectUnreadCount("Group A", unread2 + 1);
    await kService2.openConversation("Group A", "Automation Test Community");
    await kService2.view.verifyLastText("Hello 3");
            await kService2.view.takeScreenShot("autotest01-send-community-autotest02")
    await kService2.chatPage.composers.focusMessage();


                    await nService3.expectUnreadCount("Group A", unread3 + 1);
    await kService3.openConversation("Group A", "Automation Test Community");
    await kService3.view.verifyLastText("Hello 3");
            await kService3.view.takeScreenShot("autotest01-send-community-autotest03")
    await kService3.chatPage.composers.focusMessage();
      });


});
