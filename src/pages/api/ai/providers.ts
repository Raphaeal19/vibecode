import { NextApiRequest, NextApiResponse } from 'next';
import { AIService } from '@/services/ai/AIService';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const providers = AIService.getSupportedProviders().map(provider => {
    switch (provider) {
      case 'openai':
        return {
          id: provider,
          name: 'OpenAI',
          description: 'GPT-4 and other OpenAI models',
          models: ['gpt-4', 'gpt-3.5-turbo']
        };
      case 'anthropic':
        return {
          id: provider,
          name: 'Anthropic',
          description: 'Claude and other Anthropic models',
          models: ['claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
        };
      case 'gemini':
        return {
          id: provider,
          name: 'Google Gemini',
          description: 'The latest Gemini models from Google',
          models: ['gemini-2.5-flash']
        };
      default:
        return null;
    }
  }).filter(p => p !== null);

  res.status(200).json({ providers });
}