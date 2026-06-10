import { Page } from '@playwright/test';
import { ChatPage } from '../../pages/chat/ChatPage';
import { ChatMoreActions } from './ChatMoreActions';
import { ChatView } from './ChatView';
import { ChatSendAction } from './ChatSendAction';
import { TenantContext } from '../../tenant/TenantContext';
import { B2CContext } from '../../tenant/B2CContext';

export class ChatService {
   readonly tenant:  TenantContext;
   readonly view:    ChatView;
   readonly send:    ChatSendAction;
   readonly actions: ChatMoreActions;

   constructor(readonly chatPage: ChatPage, tenant: TenantContext = new B2CContext()) {
      this.tenant  = tenant;
      this.view    = new ChatView(chatPage);
      this.send    = new ChatSendAction(chatPage);
      this.actions = new ChatMoreActions(chatPage, this.view);
   }

   get page(): Page { return this.chatPage.page; }

   openConversation(name: string, parent?: string) {
      return this.tenant.openConversation(this.page, { name, parent });
   }
}
