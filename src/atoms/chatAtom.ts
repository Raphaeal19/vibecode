import { atom } from 'recoil';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface ChatState {
  [problemId: string]: ChatMessage[];
}

export const chatState = atom<ChatState>({
  key: 'chatState',
  default: {},
});
