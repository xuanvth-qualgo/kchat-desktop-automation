import type { PanelButton } from '../pages/common/ConversationPanelPage';

/* Permission domain — single source of truth for "which UI surfaces are
 * available to which role".
 *
 * Test code asserts visible buttons against the matrix below; UI changes
 * only need updates here, not in every spec. */

export type Role = 'owner' | 'admin' | 'member' | 'guest';

/** Conversation toolbar buttons visible per role.
 *
 * TODO: Verify against real kChat UI for each role before relying on this
 * in assertions. Order is not significant — compare with `.sort()`. */
export const panelButtonsByRole: Record<Role, ReadonlyArray<PanelButton>> = {
   owner:  ['voiceCall', 'videoCall', 'search', 'pinnedMessages', 'members', 'info', 'mute', 'favorite', 'channelSettings', 'more'],
   admin:  ['voiceCall', 'videoCall', 'search', 'pinnedMessages', 'members', 'info', 'mute', 'favorite', 'channelSettings', 'more'],
   member: ['voiceCall', 'videoCall', 'search', 'pinnedMessages', 'members', 'info', 'mute', 'favorite', 'more'],
   guest:  ['voiceCall', 'search', 'info'],
} as const;

/** Returns true if `role` can see `button` in the conversation toolbar. */
export function canSee(role: Role, button: PanelButton): boolean {
   return panelButtonsByRole[role].includes(button);
}
