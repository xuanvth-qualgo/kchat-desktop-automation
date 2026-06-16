import type { Case, CaseFactoryOpts, CaseSpec, SharedState } from '../base';
import type { ChatService } from '../../../../src/services/chat/ChatService';
import type { EmojiObj, MessageType } from '../../../../src/services/chat/types';
import { toCases } from '../base';
import { ONE_PER_CATEGORY } from './emoji';

export type ReactionRootRef = { type: MessageType; value?: string };

/* Must match the live UI for click selectors. */
const FAST: EmojiObj[] = ['👍', '❤️', '😂', '😯', '😢', '🙏'].map(e => ({ emojis: [e] }));
const MORE_THREE = ONE_PER_CATEGORY.slice(0, 3);
const MORE_ALL   = ONE_PER_CATEGORY;
const last       = <T>(xs: readonly T[]): T => xs[xs.length - 1];
const tip        = (g: EmojiObj) => g.emojis[0];

const react = (mode: 'fast' | 'more', emojis: readonly EmojiObj[], root: ReactionRootRef) =>
   async (svc: ChatService, shared?: SharedState) => {
      if (!shared?.rootId) throw new Error('reaction case requires shared.rootId');
      await svc.chatPage.scrollToBottom();
      const target = { id: shared.rootId, type: root.type, value: root.value } as Parameters<typeof svc.actions.reactMany>[0];
      await svc.actions.reactMany(target, emojis, mode);
   };

export function buildCases({ root, ...opts }: CaseFactoryOpts & { root: ReactionRootRef }): Case[] {
   const SPECS: CaseSpec[] = [
      {
         id: '01',
         name: 'fast reaction in 1 round',
         run: react('fast', [FAST[0]], root),
         expected: tip(FAST[0]),
         once: true,
         //smoke: true,
      },
      {
         id: '02',
         name: 'multiple fast reactions in N rounds',
         run: react('fast', FAST, root),
         expected: tip(last(FAST)),
         rounds: FAST.length,
      },
      {
         id: '03',
         name: 'full-picker reaction in 1 round',
         run: react('more', [MORE_ALL[0]], root),
         expected: tip(MORE_ALL[0]),
         once: true,
         smoke: true
      },
      {
         id: '04',
         name: 'multiple full-picker reactions in N rounds',
         run: react('more', MORE_THREE, root),
         expected: tip(last(MORE_THREE)),
         rounds: MORE_THREE.length,
      },
      {
         id: '05',
         name: '1 full-picker reaction per category in N rounds',
         run: react('more', MORE_ALL, root),
         expected: tip(last(MORE_ALL)),
         rounds: MORE_ALL.length,
      },
   ];
   return toCases(opts, 'emoji', SPECS);
}
