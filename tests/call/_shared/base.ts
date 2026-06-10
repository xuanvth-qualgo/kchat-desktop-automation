import { test, accountFor, type UserContext } from '../../../src/core/fixtures';
import { TenantContext } from '../../../src/tenant/TenantContext';
import { ChatPage } from '../../../src/pages/chat/ChatPage';
import { ChatService } from '../../../src/services/chat/ChatService';
import { CallPage } from '../../../src/pages/call/CallPage';
import { CallService } from '../../../src/services/call/CallService';
import { RUN_TAG } from '../../../src/core/utils/helpers';

export { RUN_TAG };

export const EPIC = 'Call';

// HOST (autotest01) is CALLER, VM (autotest02) is CALLEE.
test.use({ user1Role: 'host', user2Role: 'vm' });

export const CALLER = accountFor('host');
export const CALLEE = accountFor('vm');

export const chatOf = (u: UserContext, tenant?: TenantContext) =>
   new ChatService(new ChatPage(u.app, u.page), tenant);

/** Host call service: needs the ElectronApplication to wait for the new call window. */
export const hostCallOf = (u: UserContext, tenant?: TenantContext): CallService => {
   if (!u.app) throw new Error('hostCallOf requires UserContext.app (ElectronApplication)');
   return new CallService(new CallPage(u.page), u.app, tenant);
};

export { test };
export type { UserContext };

export type Severity = 'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';

export type ConversationRef = { name: string; parent?: string };

export type CallContext = 'Direct' | 'Group';

export type CallScenario = {
   id:        string;
   name:      string;
   severity?: Severity;
   feature:   string;
   context:   CallContext;
   /** Conv the HOST (caller) opens before starting the call. */
   hostConv:  ConversationRef;
   /** Conv name the VM (callee) sees on the incoming-call dialog title.
    *  For Direct → caller name; for Group → group name. */
   incomingTitleNeedle: string;
};
