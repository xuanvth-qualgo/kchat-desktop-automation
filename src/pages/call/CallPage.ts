import { Page, ElectronApplication, Locator } from '@playwright/test';
import { BasePage } from '../BasePage';
import { click } from '../../utils/actions';
import { CallLabels as L } from '../../_generated/call.element';

export class CallPage extends BasePage {
   constructor(
         page: Page,
         app?: ElectronApplication,
         scope?: Page | Locator
      ) {
         super(page, app, scope);
   }
   
   getPage(): Page { return this.page; }

   get btn_startVoiceCall(): Locator { return this.page.getByRole('button', { name: L.startVoice }); }
   get btn_startVideoCall(): Locator { return this.page.getByRole('button', { name: L.startVideo }); }
   get btn_searchParticipant(): Locator { return this.page.getByRole('button', { name: L.searchParticipant }); }
   get btn_participantItem(): Locator { return this.page.getByRole('button', { name: L.partcipantItem }); }
   get btn_confirmCall(): Locator { return this.page.getByRole('button', { name: L.confirmCall }); }

   get btn_cancelOutgoing(): Locator { return this.page.getByRole('button', { name: L.cancelOutgoing }); }
   get btn_acceptIncoming():  Locator { return this.page.getByRole('button', { name: L.acceptIncoming }); }
   get btn_rejectIncoming():  Locator { return this.page.getByRole('button', { name: L.rejectIncoming }); }
   get btn_endCall():     Locator { return this.page.getByRole('button', { name: L.endCall }); }

   get btn_muteMic():        Locator { return this.page.getByRole('button', { name: L.muteMic }); }
   get btn_unmuteMic():      Locator { return this.page.getByRole('button', { name: L.unmuteMic }); }

   get btn_cameraOn():    Locator { return this.page.getByRole('button', { name: L.cameraOn }); }
   get btn_cameraOff():   Locator { return this.page.getByRole('button', { name: L.cameraOff }); }
   
   get btn_shareScreen(): Locator { return this.page.getByRole('button', { name: L.shareScreen }); }
   get btn_stopScreen():  Locator { return this.page.getByRole('button', { name: L.stopScreen }); }

   get btn_settings():       Locator { return this.page.getByRole('button', { name: L.settings }); }


   get btn_invite():      Locator { return this.page.getByRole('button', { name: L.invite }); }

   muteMic():        Promise<void> { return click(this.btn_muteMic); }
   unmuteMic():      Promise<void> { return click(this.btn_unmuteMic); }
   openSettings():   Promise<void> { return click(this.btn_settings); }
   acceptCall():     Promise<void> { return click(this.btn_accept); }
   cameraOn():       Promise<void> { return click(this.btn_cameraOn); }
   cameraOff():      Promise<void> { return click(this.btn_cameraOff); }
   shareScreen():    Promise<void> { return click(this.btn_shareScreen); }
   stopScreen():     Promise<void> { return click(this.btn_stopScreen); }
   openInvite():     Promise<void> { return click(this.btn_invite); }

   async safeClose(): Promise<void> {
      if (this.page.isClosed()) return;
      await this.page.waitForTimeout(800).catch(() => {});
      await this.page.close({ runBeforeUnload: false }).catch(() => {});
   }

   close(): Promise<void> { return this.safeClose(); }


   async startVoiceCall(): Promise<void> { 
      await click(this.page.getByRole('button', { name: L.triggerVoice })); 
   }

   async startVideoCall(): Promise<void> { 
      await click(this.page.getByRole('button', { name: L.triggerVideo })); 
   }

   async searchParticipant(keyword: string): Promise<void> { 
      await this.page.getByRole('textbox', { name: L.searchParticipant }).fill(keyword);
   }

   async selectParticipants(participants: string[]): Promise<void> { 
      for (const participant of participants) {
         const participantItem = this.page.getByRole('button', { name: `${L.partcipantItem} ${participant}` });
         await click(participantItem);
      }
   }

   async confirmToCall(): Promise<void> { 
      await click(this.page.getByRole('button', { name: L.confirmCall })); 
   }

   async cancelOutgoing(): Promise<void> { await click(this.btn_cancelOutgoing); await this.safeClose(); }
   async rejectCall():     Promise<void> { await click(this.btn_reject);         await this.safeClose(); }
   async endCall():        Promise<void> { await click(this.btn_endCall);        await this.safeClose(); }

}
