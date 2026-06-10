import { expect } from '@playwright/test';
import type { ElectronApplication } from '@playwright/test';
import { CallPage } from '../../pages/call/CallPage';
import { SidebarPage } from '../../pages/common/SidebarPage';
import { TenantContext } from '../../tenant/TenantContext';
import { B2CContext } from '../../tenant/B2CContext';
import { click } from '../../core/utils/actions';

/* Business logic for the call operations */

export class CallService {
    readonly callPage: CallPage;
    readonly page: any;
    readonly sidebar: SidebarPage;
    readonly tenant:  TenantContext;

    constructor(
        callPage: CallPage,
        private app: ElectronApplication,
        tenant: TenantContext = new B2CContext(),
    ) {
        this.callPage = callPage;
        this.page = callPage.getPage();
        this.sidebar = new SidebarPage(this.page);
        this.tenant  = tenant;
    }

    /** Open a conversation through the active TenantContext (B2C by default). */
    async selectConversation(conversationName: string, parent?: string){
        await this.tenant.openConversation(this.page, { name: conversationName, parent });
    }

    // Select participant
    async selectParticipant(type: 'voice' | 'video', participant: string){
        type === 'voice'
            ? this.callPage.startVoiceCall()
            : this.callPage.startVideoCall()
        this.selectConversation(participant);
    }

    // Open call window
    async startCallAndSwitchWindow(type: 'voice' | 'video') {
        const [newWindow] = await Promise.all([
            this.app.waitForEvent('window', {timeout: 120000}),
            type === 'voice'
                ? this.callPage.startVoiceCall()
                : this.callPage.startVideoCall()
        ]);

        await newWindow.waitForLoadState();

        return new CallPage(newWindow);
    }

    async startGroupCallAndSwitchWindow(type: 'voice' | 'video') {
        const [newWindow] = await Promise.all([
            this.app.waitForEvent('window', {timeout: 120000}),
            type === 'voice'
                ? this.callPage.startGroupVoiceCall()
                : this.callPage.startGroupVideoCall()
        ]);

        await newWindow.waitForLoadState();

        return new CallPage(newWindow);
    }

    // Start and cancel call (Caller))
    async startAndCancelCall(type: 'voice' | 'video'){
        const callWindow = await (
            type === 'voice'
                ? this.startCallAndSwitchWindow('voice')
                : this.startCallAndSwitchWindow('video')
        );
        await callWindow.cancelCall();
    }

    async startAndCancelGroupCall(type: 'voice' | 'video'){
        const callWindow = await (
            type === 'voice'
                ? this.startGroupCallAndSwitchWindow('voice')
                : this.startGroupCallAndSwitchWindow('video')
        );
        await callWindow.cancelCall(); 
    }

    // Start and accept call (Listener)
    async startAndAcceptCall(type: 'voice' | 'video'){
        const callWindow = await (
            type === 'voice'
                ? this.startCallAndSwitchWindow('voice')
                : this.startCallAndSwitchWindow('video')
        );
        await callWindow.endCall();
    }

    async startAndAcceptGroupCall(type: 'voice' | 'video'){
        const callWindow = await (
            type === 'voice'
                ? this.startGroupCallAndSwitchWindow('voice')
                : this.startGroupCallAndSwitchWindow('video')
        );
        await callWindow.endCall();
    }

    // Start and decline call (Listener)
    async startAndDeclineCall(type: 'voice' | 'video'){
        const callWindow = await (
            type === 'voice'
                ? this.startCallAndSwitchWindow('voice')
                : this.startCallAndSwitchWindow('video')
        );
        await callWindow.endCall();
    }

    async startAndDeclineGroupCall(type: 'voice' | 'video'){
        const callWindow = await (
            type === 'voice'
                ? this.startGroupCallAndSwitchWindow('voice')
                : this.startGroupCallAndSwitchWindow('video')
        );
        await callWindow.endCall();
    }

    // Verify call results
    async verifyVoiceCalledResults (action: string){
        await expect(this.page.getByText('Audio call').last()).toBeVisible();
        await expect(this.page.getByText(action).last()).toBeVisible();
    }

    async verifyVoiceReceivedResults (action: string){
        
    }

    async verifyVideoCalledResults (action: string){
        await expect(this.page.getByText('Video call').last()).toBeVisible();
        await expect(this.page.getByText(action).last()).toBeVisible();
    }

    async verifyVideoReceivedResults (action: string){

    }

    // Take a screenshot
    async takeAScreenShot(serviceName: string){
        await this.page.screenshot({ path: `./app-screenshots/${serviceName}-${Date.now()}.png` });
    }

    // Get imcoming call notification
    async getImcomingCallNotification(type: 'voice' | 'video', caller: string){
        return this.page.getByRole('dialog').getByText(`${caller}\n ${type}`);
    }

}