import { ConversationRef } from '../../../src/pages/common/SidebarPage';

export type AllureInfo = {
   feature?:     string;                                                    // sub-module (level 2)
   story?:       string;                                                    // scenario   (level 3)
   severity?:    'blocker' | 'critical' | 'normal' | 'minor' | 'trivial';   // impact level
   tags?:        string[];                                                  // regression, smoke, ...
   description?: string;                                                    // narrative: precondition, steps, expected
};

// Conversation references
export const GROUP_REF: ConversationRef[] = [
   { name: 'KChat™ ✨' },
   { name: 'Group Func Desktop Test' },
   { name: 'Group MLS Desktop Test' },   
];

const COMM1 = 'Community Func Desktop Test';
export const COMM1_CHANNEL_REF: ConversationRef[] = [
   { parent: COMM1, name: 'General' },
   { parent: COMM1, name: 'CGroup Func Desktop Test 1' },// 01,02
   { parent: COMM1, name: 'CGroup Func Desktop Test 2' },// 01,03
   { parent: COMM1, name: 'CGroup Func Desktop Test 3' },// 01,02,03
];

const COMM2 = 'Community MLS Desktop Test';
export const COMM2_CHANNEL_REF: ConversationRef[] = [
   { parent: COMM2, name: 'General' },
   { parent: COMM2, name: 'CGroup MLS Desktop Test' },// 04 ... 10
];

const ORG1 = 'Organization Func Desktop Test';
export const ORG1_CHANNEL_REF: ConversationRef[] = [
   { parent: ORG1, name: 'General' },
   { parent: ORG1, name: 'OGroup Func Desktop Test 1' },// 01,02
   { parent: ORG1, name: 'OGroup Func Desktop Test 2' },// 01,03
   { parent: ORG1, name: 'OGroup Func Desktop Test 3' },// 01,02,03
];

const ORG2 = 'Organization MLS Desktop Test';
export const ORG2_CHANNEL_REF: ConversationRef[] = [
   { parent: ORG2, name: 'General' },
   { parent: ORG2, name: 'OGroup MLS Desktop Test' },// 04 ... 10
];