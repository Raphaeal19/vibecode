import { AIProvider, ChatRequest, ChatResponse } from '../types';
import { getUserApiKey } from '@/utils/api/userSettings';

export class GeminiProvider implements AIProvider {
  private userId: string;
  private apiKey: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getApiKey(): Promise<string> {
    if (!this.apiKey) {
      // Fetches the API key for the 'gemini' provider
      this.apiKey = await getUserApiKey(this.userId, 'gemini');
      if (!this.apiKey) {
        throw new Error('Gemini API key not found');
      }
    }
    return this.apiKey;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = await this.getApiKey();
    const model = request.model || 'gemini-2.5-flash';
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: request.messages.map(msg => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        })),
        systemInstruction: {
          parts: [{ text: GeminiProvider.getSystemPrompt(request.context?.challengeType) }],
        },
        generationConfig: {
          maxOutputTokens: 10000,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
        const errorBody = await response.json();
        console.error('Gemini API Error:', errorBody);
        throw new Error(`Gemini API error: ${response.statusText} - ${errorBody.error?.message || 'Details not available'}`);
    }

    const data = await response.json();
    const usageData = data.usageMetadata || { promptTokenCount: 0, candidatesTokenCount: 0, totalTokenCount: 0 };
    
    return {
      message: data.candidates?.[0]?.content?.parts?.[0]?.text || '',
      conversationId: request.conversationId || this.generateConversationId(),
      timestamp: Date.now(),
      provider: 'gemini',
      usage: {
        promptTokens: usageData.promptTokenCount,
        completionTokens: usageData.candidatesTokenCount,
        totalTokens: usageData.totalTokenCount,
      },
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      const model = 'gemini-2.5-flash';
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: 'Hello' }] }],
          generationConfig: {
              maxOutputTokens: 10,
          }
        }),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private static getSystemPrompt(challengeType?: string): string {
    const basePrompt = `You are an AI coding assistant for VibeCode, an interactive coding platform. Help users with coding challenges, refactoring, testing, documentation, and debugging.`;
    
    switch (challengeType) {
      case 'refactor':
        return `${basePrompt} Focus on code refactoring: improving readability, performance, and maintainability while preserving functionality.`;
      case 'test':
        return `${basePrompt} Focus on test generation: create comprehensive unit tests, edge cases, and testing strategies.`;
      case 'documentation':
        return `${basePrompt} Focus on documentation: generate clear, comprehensive documentation including JSDoc comments and README files.`;
      case 'translate':
        return `${basePrompt} Focus on code translation: convert code between languages or frameworks while maintaining functionality and best practices.`;
      case 'debug':
        return `${basePrompt} Focus on debugging: help identify bugs, trace logic, and suggest fixes with clear explanations.`;
      default:
        return basePrompt;
    }
  }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
