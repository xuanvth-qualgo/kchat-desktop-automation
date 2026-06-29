import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { click } from '../../utils/actions';
import { PanelLabels} from '../../_generated/common.element';

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

export class PanelPage extends BasePage {
   constructor(readonly page: Page) {
      super(page);
   }

   getPage(): Page { return this.page; }

   get btn_voiceCall():       Locator { return this.page.getByRole('button', { name: PanelLabels.voiceCall }); }
   get btn_videoCall():       Locator { return this.page.getByRole('button', { name: PanelLabels.videoCall }); }
   get btn_search():          Locator { return this.page.getByRole('button', { name: PanelLabels.searchRe }); }
   get btn_pinnedMessages():  Locator { return this.page.getByRole('button', { name: PanelLabels.pinnedRe }); }
   get btn_members():         Locator { return this.page.getByRole('button', { name: PanelLabels.membersRe }); }
   get btn_info():            Locator { return this.page.getByRole('button', { name: PanelLabels.infoRe }); }
   get btn_mute():            Locator { return this.page.getByRole('button', { name: PanelLabels.muteRe }); }
   get btn_favorite():        Locator { return this.page.getByRole('button', { name: PanelLabels.favoriteRe }); }
   get btn_channelSettings(): Locator { return this.page.getByRole('button', { name: PanelLabels.channelSettingsRe }); }
   get btn_more():            Locator { return this.page.getByRole('button', { name: PanelLabels.moreRe }); }

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

   async isAvailable(key: PanelButton, timeout: number = 1_000): Promise<boolean> {
      try {
         await this.catalog[key]().first().waitFor({ state: 'visible', timeout });
         return true;
      } catch {
         return false;
      }
   }

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
