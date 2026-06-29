import { escapeRegex } from '../utils/helpers';

export const PanelLabels = {
   voiceCall:       'Voice call',
   videoCall:       'Video call',
   confirmCall:     'Call',
   searchRe:        /^Search( messages)?$/,
   pinnedRe:        /^Pinned( messages)?$/,
   membersRe:       /^(Members|Member list)$/,
   infoRe:          /^(Info|Details|Conversation info)$/,
   muteRe:          /^(Mute|Unmute)( conversation)?$/,
   favoriteRe:      /^(Add to favorites|Remove from favorites|Favorite|Unfavorite)$/,
   channelSettingsRe: /^(Channel settings|Conversation settings)$/,
   moreRe:          /^(More|More options|More actions)$/,
} as const;

export const SidebarLabels = {
   chatTab:           'Chat',
   convContainer:     '[aria-label="Conversations"] [data-testid="virtuoso-scroller"]',
   searchConvBtn:       '//div[@data-sidebar-id="conversations-leftbar"]//input[contains(@placeholder, "Search")]',
   searchConvInput:     '//div[@class="kc-input-control kc-search-field__control"]//input[contains(@placeholder, "Search name or username")]',
   conversationId:    'data-conversation-id',
   unreadBadge:       'span[data-slot="numeric-badge"]',
   unreadCount:       'data-count'
} as const;

export const SidebarSelectors = {
   conversationBtn:  (title: string) => new RegExp(`${escapeRegex(title)}`),
   communityBtn:    (title: string) => `button[data-account-type="personal"][title="${title}"]`,
   organizationBtn: (title: string) => `button[data-account-type="organization"][title="${title}"]`,
   communityBtn2:    (title: string) => `button[title="${title}"]`,
   organizationBtn2: (title: string) => `button[title="${title}"]`,
} as const;