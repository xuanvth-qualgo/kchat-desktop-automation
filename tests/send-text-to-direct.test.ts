import { allure } from 'allure-playwright';
import { ChatPage } from '../src/pages/chat/ChatPage';
import { ChatService } from '../src/services/chat/ChatService';
import { NotificationPushPage } from '../src/pages/notification-push/NotificationPushPage';
import { NotificationPushService } from '../src/services/notification-push/NotificationPushService';
import { test } from './fixtures';
import { stepAndRetry } from './retry';
import 'dotenv/config';

const USER1 = process.env.USER1!;
const USER2 = process.env.USER2!;
const USER3 = process.env.USER3!;

test.describe("USER1 send message", () => {
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
        await allure.epic("Send Message");
        await allure.feature("Direct Chat");
        await allure.story("Send text from User1 to User2 & User3");
        await allure.severity("critical");
        await allure.tag("smoke");
        await allure.tag("direct-chat");
        await allure.tag("text");
        await allure.description("User1 sends a text message to User2 and User3 in DM. " +
            "Verify sender shows last sent, receivers get unread badge + last message preview.");

        const unread2 = await nService2.getUnreadCount(USER1);
        const unread3 = await nService3.getUnreadCount(USER1);

        /*
        await stepAndRetry("0. User2, User3 open max windows", async () => {
            await kService2.page.setViewportSize({ width: 1920, height: 1080 });
            await kService3.page.setViewportSize({ width: 1920, height: 1080 });
        });    

        await stepAndRetry("1. User2 switch other conversation", async () => {
            await kService2.chatPage.scrollToBottom();
            await kService2.openConversation("KChat™ ✨");
        });

         await stepAndRetry("2. User3 switch other conversation", async () => {
            await kService3.chatPage.scrollToBottom();
            await kService3.openConversation("KChat™ ✨");
        });
*/
        await stepAndRetry("3. User1 send text to User2 and check last sent", async () => {
            await kService1.openConversation(USER2);
            await kService1.send.sendText("Hello 1");
            await kService1.view.verifyLastText("Hello 1");
        });
        
        await stepAndRetry("4. User1 send text to User3 and check last sent", async () => {
            await kService1.openConversation(USER3);
            await kService1.send.sendText("Hello 1");
            await kService1.view.verifyLastText("Hello 1");
        });

        await stepAndRetry("5. User2 check Unread count in Side-bar and App-bar", async () => {
            await nService2.expectUnreadCount(USER1, unread2 + 1);///////
        });

        await stepAndRetry("6. User2 check last received", async () => {
            await kService2.openConversation(USER1);
            await kService2.view.verifyLastText("Hello 1");
        });

        await stepAndRetry("7. User2 read message", async () => {
            await kService2.view.takeScreenShot("autotest01-send-direct-autotest02")
            await kService2.chatPage.composers.focusMessage();
        });


        await stepAndRetry("8. User3 check Unread count in Side-bar and App-bar", async () => {
            await nService3.expectUnreadCount(USER1, unread3 + 1);
        });

        await stepAndRetry("9. User3 check last received", async () => {
            await kService3.openConversation(USER1);
            await kService3.view.verifyLastText("Hello 1");
        });
        
        
        await stepAndRetry("10. User3 read message", async () => {
            await kService3.view.takeScreenShot("autotest01-send-direct-autotest03")
            await kService3.chatPage.composers.focusMessage();
        });
    });
});
