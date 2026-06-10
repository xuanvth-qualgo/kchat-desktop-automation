import { Locator, Page } from '@playwright/test';
import { click } from '../../core/utils/actions';

/* Page-Object for the call window (and call buttons in the chat sidebar).
 *
 * Reconstructed after the original file was deleted. Locators mirror the
 * button labels observed in the running app (see inspect-call-4 dumps):
 *   "Voice call", "Video call"      — entry buttons in chat header
 *   "Cancel call"                   — outgoing window (caller)
 *   "Accept call" / "Decline call"  — incoming window (receiver)
 *   "End call" / "Hang up" / "Leave call" — active window
 *   "Mute microphone" / "Unmute microphone"
 *   "Turn off camera" / "Turn on camera"
 *   "Share screen" / "Stop screen share"
 *   "Call settings"
 */

export class CallPage {
   constructor(protected readonly page: Page) {}

   getPage(): Page { return this.page; }

   // ---------- entry buttons (chat header) ----------
   get btn_voiceCall(): Locator { return this.page.getByRole('button', { name: 'Voice call' }); }
   get btn_videoCall(): Locator { return this.page.getByRole('button', { name: 'Video call' }); }

   async startVoiceCall(): Promise<void> { await click(this.btn_voiceCall); }
   async startVideoCall(): Promise<void> { await click(this.btn_videoCall); }

   /* Group call uses the same entry buttons in kChat; kept as separate methods
    * so service layer can stay symmetric (1-on-1 vs group). */
   async startGroupVoiceCall(): Promise<void> { await click(this.btn_voiceCall); }
   async startGroupVideoCall(): Promise<void> { await click(this.btn_videoCall); }

   // ---------- outgoing call window (caller) ----------
   get btn_cancelCall(): Locator { return this.page.getByRole('button', { name: 'Cancel call' }); }

   async cancelCall(): Promise<void> { await click(this.btn_cancelCall); }

   // ---------- incoming call window (receiver) ----------
   get btn_acceptCall():  Locator { return this.page.getByRole('button', { name: 'Accept call' }); }
   get btn_declineCall(): Locator { return this.page.getByRole('button', { name: 'Decline call' }); }

   async acceptCall():  Promise<void> { await click(this.btn_acceptCall); }
   async declineCall(): Promise<void> { await click(this.btn_declineCall); }

   // ---------- active call window ----------
   get btn_endCall(): Locator {
      return this.page.getByRole('button', { name: /^(End call|Hang up|Leave call)$/ });
   }

   async endCall(): Promise<void> { await click(this.btn_endCall); }

   // ---------- microphone toggle ----------
   get btn_muteMic():   Locator { return this.page.getByRole('button', { name: 'Mute microphone' }); }
   get btn_unmuteMic(): Locator { return this.page.getByRole('button', { name: 'Unmute microphone' }); }

   async muteMic():   Promise<void> { await click(this.btn_muteMic); }
   async unmuteMic(): Promise<void> { await click(this.btn_unmuteMic); }

   // ---------- camera toggle ----------
   get btn_cameraOff(): Locator { return this.page.getByRole('button', { name: 'Turn off camera' }); }
   get btn_cameraOn():  Locator { return this.page.getByRole('button', { name: 'Turn on camera' }); }

   async turnOffCamera(): Promise<void> { await click(this.btn_cameraOff); }
   async turnOnCamera():  Promise<void> { await click(this.btn_cameraOn); }

   // ---------- screen share toggle ----------
   get btn_shareScreen(): Locator {
      return this.page.getByRole('button', { name: /^(Share screen|Start screen share|Screen share|Start sharing)$/ });
   }
   get btn_stopShareScreen(): Locator {
      return this.page.getByRole('button', { name: /^(Stop screen share|Stop sharing)$/ });
   }

   async startShareScreen(): Promise<void> { await click(this.btn_shareScreen); }
   async stopShareScreen():  Promise<void> { await click(this.btn_stopShareScreen); }

   // ---------- settings ----------
   get btn_callSettings(): Locator { return this.page.getByRole('button', { name: 'Call settings' }); }

   async openSettings(): Promise<void> { await click(this.btn_callSettings); }
}
