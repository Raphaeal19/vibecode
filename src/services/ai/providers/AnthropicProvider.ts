import { AIProvider, ChatRequest, ChatResponse } from '../types';
import { getUserApiKey } from '@/utils/api/userSettings';

export class AnthropicProvider implements AIProvider {
  private userId: string;
  private apiKey: string | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  private async getApiKey(): Promise<string> {
    if (!this.apiKey) {
      this.apiKey = await getUserApiKey(this.userId, 'anthropic');
      if (!this.apiKey) {
        throw new Error('Anthropic API key not found');
      }
    }
    return this.apiKey;
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    const apiKey = await this.getApiKey();
    
    const messages = request.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 2000,
        system: this.getSystemPrompt(request.context?.challengeType),
        messages
      })
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return {
      message: data.content[0].text,
      conversationId: request.conversationId || this.generateConversationId(),
      timestamp: Date.now(),
      provider: 'anthropic',
      usage: {
        promptTokens: data.usage.input_tokens,
        completionTokens: data.usage.output_tokens,
        totalTokens: data.usage.input_tokens + data.usage.output_tokens
      }
    };
  }

  async validateConnection(): Promise<boolean> {
    try {
      const apiKey = await this.getApiKey();
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 10,
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ]
        })
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private getSystemPrompt(challengeType?: string): string {
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

  // private formatPrompt(request: ChatRequest): string {
  //   let prompt = request.prompt;
    
  //   // This method might become less relevant if system prompts handle most context
  //   // but keeping it for direct user prompts if needed.
  //   if (request.context?.code && !request.context?.challengeType) { // Only append code if not already handled by challengeType in system prompt
  //     prompt += `\n\nCode:\n```${request.context.language || 'javascript'}\n${request.context.code}\n````;
  //   }
    
  //   return prompt;
  // }

  private generateConversationId(): string {
    return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
