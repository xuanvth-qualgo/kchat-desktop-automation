import { Locator, Page } from '@playwright/test';
import { click } from '../../core/utils/actions';

export type PanelButton =
   | 'voiceCall'
   | 'videoCall'
   | 'search'
   | 'pinnedMessages'
   | 'members'
   | 'info'
   | 'mute'
   | 'favorite'
   | 'channelSettings'
   | 'more';

export class ConversationPanelPage {
   constructor(protected readonly page: Page) {}

   getPage(): Page { return this.page; }

   // ---- Locators (all permission-agnostic; presence varies by role) ----

   get btn_voiceCall():       Locator { return this.page.getByRole('button', { name: 'Voice call' }); }
   get btn_videoCall():       Locator { return this.page.getByRole('button', { name: 'Video call' }); }
   get btn_search():          Locator { return this.page.getByRole('button', { name: /^Search( messages)?$/ }); }
   get btn_pinnedMessages():  Locator { return this.page.getByRole('button', { name: /^Pinned( messages)?$/ }); }
   get btn_members():         Locator { return this.page.getByRole('button', { name: /^(Members|Member list)$/ }); }
   get btn_info():            Locator { return this.page.getByRole('button', { name: /^(Info|Details|Conversation info)$/ }); }
   get btn_mute():             Locator { return this.page.getByRole('button', { name: /^(Mute|Unmute)( conversation)?$/ }); }
   get btn_favorite():         Locator { return this.page.getByRole('button', { name: /^(Add to favorites|Remove from favorites|Favorite|Unfavorite)$/ }); }
   /** Admin-only entry. */
   get btn_channelSettings(): Locator { return this.page.getByRole('button', { name: /^(Channel settings|Conversation settings)$/ }); }
   /** Overflow / kebab menu. */
   get btn_more():            Locator { return this.page.getByRole('button', { name: /^(More|More options|More actions)$/ }); }

   // ---- Lookup table ----

   private readonly catalog: Record<PanelButton, () => Locator> = {
      voiceCall:       () => this.btn_voiceCall,
      videoCall:       () => this.btn_videoCall,
      search:          () => this.btn_search,
      pinnedMessages:  () => this.btn_pinnedMessages,
      members:         () => this.btn_members,
      info:            () => this.btn_info,
      mute:            () => this.btn_mute,
      favorite:        () => this.btn_favorite,
      channelSettings: () => this.btn_channelSettings,
      more:            () => this.btn_more,
   };

   button(key: PanelButton): Locator { return this.catalog[key](); }

   // ---- Permission-aware helpers ----

   /** True if the button is currently rendered in the panel (i.e. visible).
    *  Cheap probe — does not throw on absence. */
   async isAvailable(key: PanelButton, timeout: number = 1_000): Promise<boolean> {
      try {
         await this.catalog[key]().first().waitFor({ state: 'visible', timeout });
         return true;
      } catch {
         return false;
      }
   }

   /** Snapshot of which logical buttons are currently visible.
    *  Useful for permission assertions: `expect(snapshot).toEqual(['voiceCall','videoCall',...])`. */
   async availableButtons(): Promise<PanelButton[]> {
      const keys = Object.keys(this.catalog) as PanelButton[];
      const checks = await Promise.all(keys.map(k => this.isAvailable(k)));
      return keys.filter((_, i) => checks[i]);
   }

   // ---- Actions (no permission gate; let the action fail naturally if hidden) ----

   async openVoiceCall():      Promise<void> { await click(this.btn_voiceCall); }
   async openVideoCall():      Promise<void> { await click(this.btn_videoCall); }
   async openSearch():         Promise<void> { await click(this.btn_search); }
   async openPinnedMessages(): Promise<void> { await click(this.btn_pinnedMessages); }
   async openMembers():        Promise<void> { await click(this.btn_members); }
   async openInfo():           Promise<void> { await click(this.btn_info); }
   async toggleMute():         Promise<void> { await click(this.btn_mute); }
   async toggleFavorite():     Promise<void> { await click(this.btn_favorite); }
   async openChannelSettings(): Promise<void> { await click(this.btn_channelSettings); }
   async openMore():            Promise<void> { await click(this.btn_more); }
}
