import { test, accountFor, type UserContext } from '../../../src/core/fixtures';
import { TenantContext } from '../../../src/tenant/TenantContext';
import { ChatPage } from '../../../src/pages/chat/ChatPage';
import { ChatService } from '../../../src/services/chat/ChatService';
import { NotificationPushPage } from '../../../src/pages/notification-push/NotificationPushPage';
import { NotificationPushService } from '../../../src/services/notification-push/NotificationPushService';
import type { MessageType } from '../../../src/services/chat/types';
import { RUN_TAG } from '../../../src/core/utils/helpers';

export { RUN_TAG };

export const EPIC = 'Chat';

test.use({ user1Role: 'host', user2Role: 'vm' }); // HOST (autotest01) is SENDER, VM (autotest02) is RECEIVER

export const SENDER   = accountFor('host');
export const RECEIVER = accountFor('vm');

export const dataName = 'demo';
export const dataPath = `./test-data/${dataName}`;

export const chatOf  = (u: UserContext, tenant?: TenantContext) =>
   new ChatService(new ChatPage(u.app, u.page), tenant);
export const notifOf = (u: UserContext) =>
   new NotificationPushService(new NotificationPushPage(u.page));

export { test };
export type { UserContext, MessageType };

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

export type Action = {
   feature:       string;
   severity?:     Severity;
   scope?:        'once' | 'all'; // once: only run TC - 1 round, all: run all cases
   description: (ctx: string) => string;
   prelude?:      (svc: ChatService, shared: SharedState) => Promise<void>;
   seedRoot?:     (svc: ChatService) => Promise<string | object | void>; // returns root text for replier to quote against
   verifyQuote?:  boolean; // verify quote reply
   verifyOverride?: (svc: ChatService, tc: Case, shared: SharedState) => Promise<void>;
   skipSidebarUnread?: boolean;
   skipPushNotif?: boolean;
   rootType?:     MessageType; // type of the seedRoot message; used to skip context-incompatible scenarios (e.g. mention root in Direct)
};

export type CaseFactoryOpts = {
   idPrefix:   string;
   namePrefix: string;
};

export type SharedState = {
   rootId?:        string;
   rootQuoteText?: string;
};

export type Case = {
   id: string;
   name: string;
   type: MessageType;
   run: (svc: ChatService, shared?: SharedState) => Promise<void>;
   expected?: string;
   rounds?: number;
   once?: boolean;
   smoke?: boolean;
   skip?: string; 
};

export type CaseSpec = Omit<Case, 'id' | 'name' | 'type'> & {
   id:    string;        // local suffix, e.g. '01'
   name:  string;        // suffix appended after the test's `namePrefix`
   type?: MessageType;   // optional per-row override; defaults to factory's `type`
};

export const toCases = (
   opts:  CaseFactoryOpts,
   type:  MessageType,
   specs: CaseSpec[],
): Case[] => specs.map(s => ({
   ...s,
   type: s.type ?? type,
   id:   `${opts.idPrefix}-${s.id}`,
   name: `${opts.namePrefix} ${s.name}`,
}));