import { Locator } from '@playwright/test';
import { click, getButtonByName, getMenuItemByName } from '../../../core/utils/actions';
import { AttachmentLabels, VoiceLabels } from '../labels';
import { ComposerScope } from './ComposerScope';

export class VoiceRecorder extends ComposerScope {
   private get btn_openAttachments(): Locator { return getButtonByName  (this.scope, AttachmentLabels.open);        }
   private get btn_voiceOption():     Locator { return getMenuItemByName(this.scope, AttachmentLabels.voiceRecord); }

   private get btn_startVoice():  Locator { return getButtonByName(this.scope, VoiceLabels.start);       }
   private get btn_pauseVoice():  Locator { return getButtonByName(this.scope, VoiceLabels.pause);       }
   private get btn_submitVoice(): Locator { return getButtonByName(this.page,  VoiceLabels.submit, true); }

   async openVoiceOption(): Promise<void> {
      await click(this.btn_openAttachments);
      await click(this.btn_voiceOption);
   }

   async startVoice():  Promise<void> { await click(this.btn_startVoice);  }
   async pauseVoice():  Promise<void> { await click(this.btn_pauseVoice);  }
   async submitVoice(): Promise<void> { await click(this.btn_submitVoice); }
}
