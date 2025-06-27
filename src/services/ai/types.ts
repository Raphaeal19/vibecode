export type AIProviderType = 'openai' | 'anthropic' | 'gemini';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: Message[];
  context?: {
    code?: string;
    problemId?: string;
    challengeType?: string;
    language?: string;
  };
  model?: string
  conversationId?: string;
  userId: string;
}

export interface ChatResponse {
  message: string;
  conversationId: string;
  timestamp: number;
  provider: AIProviderType;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface AIProvider {
  chat(request: ChatRequest): Promise<ChatResponse>;
  validateConnection(): Promise<boolean>;
}

export interface AIUserSettings {
  preferredProvider: AIProviderType;
  apiKeys: Partial<Record<AIProviderType, string>>;
  maxTokens?: number;
  temperature?: number;
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  provider: AIProviderType;
}

export interface Conversation {
  id: string;
  userId: string;
  problemId?: string;
  challengeType?: string;
  messages: ConversationMessage[];
  createdAt: number;
  updatedAt: number;
}
