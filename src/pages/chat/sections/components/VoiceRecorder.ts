import { Page, Locator } from '@playwright/test';
import { click, getButtonByName, getMenuItemByName } from '../../../../utils/actions';
import { AttachmentLabels, VoiceLabels } from '../../../../_generated/chat.element';

export class VoiceRecorder {
   constructor(private readonly page: Page, private readonly scope: Page | Locator) {}

   private get btn_openAttachments(): Locator { return getButtonByName  (this.scope, AttachmentLabels.open);        }
   private get btn_voiceOption():     Locator { return getMenuItemByName(this.scope, AttachmentLabels.voiceRecord); }

   private get btn_startVoice():  Locator { return getButtonByName(this.scope, VoiceLabels.start);       }
   private get btn_pauseVoice():  Locator { return getButtonByName(this.scope, VoiceLabels.pause);       }
   private get btn_sendVoice(): Locator { return getButtonByName(this.page,  VoiceLabels.send, true); }

   async openVoiceOption(): Promise<void> {
      await click(this.btn_openAttachments);
      await click(this.btn_voiceOption);
   }

   async startVoice():  Promise<void> { await click(this.btn_startVoice);  }
   async pauseVoice():  Promise<void> { await click(this.btn_pauseVoice);  }
   async sendVoice(): Promise<void> { await click(this.btn_sendVoice); }
}
