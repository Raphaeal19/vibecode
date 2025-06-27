import { AIProviderType } from '@/services/ai/types';
import { getUserApiKey } from './userSettings';

export async function validateApiKey(userId: string, provider: AIProviderType): Promise<boolean> {
  try {
    const apiKey = await getUserApiKey(userId, provider);
    if (!apiKey) {
      return false;
    }

    // Basic validation - check if key format is correct
    switch (provider) {
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'anthropic':
        return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
      case 'gemini':
        return apiKey.startsWith('AIza') && apiKey.length > 30;
      default:
        return false;
    }
  } catch (error) {
    console.error('API key validation error:', error);
    return false;
  }
}

export function sanitizeInput(input: string): string {
  // Basic input sanitization
  return input.trim().slice(0, 10000); // Limit to 10k characters
}

export function validatePrompt(prompt: string): boolean {
  return prompt.trim().length > 0 && prompt.length <= 10000;
}
