import { OpenAIProvider } from './providers/OpenAIProvider';
import { AnthropicProvider } from './providers/AnthropicProvider';
import { AIProvider, ChatRequest, ChatResponse, AIProviderType } from './types';
import { getUserApiKey } from '@/utils/api/userSettings';
import { GeminiProvider } from './providers/GeminiProvider';

export class AIService {
  private provider: AIProvider;

  constructor(providerType: AIProviderType, userId: string) {
    this.provider = this.createProvider(providerType, userId);
  }

  private createProvider(providerType: AIProviderType, userId: string): AIProvider {
    switch (providerType) {
      case 'openai':
        return new OpenAIProvider(userId);
      case 'anthropic':
        return new AnthropicProvider(userId);
      case 'gemini':
        return new GeminiProvider(userId);
      default:
        throw new Error(`Unsupported AI provider: ${providerType}`);
    }
  }

  async chat(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await this.provider.chat(request);
      return response;
    } catch (error) {
      console.error('AI Service Error:', error);
      throw new Error('Failed to get AI response');
    }
  }

  async validateConnection(): Promise<boolean> {
    return this.provider.validateConnection();
  }

  static getSupportedProviders(): AIProviderType[] {
    return ['openai', 'anthropic', 'gemini'];
  }
}
