import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/firebase/admin';
import { getUserAISettings, updateUserAISettings, setUserApiKey, removeUserApiKey } from '@/utils/api/userSettings';
import { AIProviderType } from '@/services/ai/types';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Verify user authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    // console.log(userId, "user ID here")

    switch (req.method) {
      case 'GET':
        const settings = await getUserAISettings(userId);
        // Don't send API keys in the response for security
        const sanitizedSettings = {
          ...settings,
          apiKeys: Object.keys(settings.apiKeys).reduce((acc, key) => {
            acc[key as AIProviderType] = settings.apiKeys[key as AIProviderType] ? '***masked***' : null;
            return acc;
          }, {} as any)
        };
        res.status(200).json(sanitizedSettings);
        break;

      case 'PUT':
        const { preferredProvider, maxTokens, temperature } = req.body;
        await updateUserAISettings(userId, {
          preferredProvider,
          maxTokens,
          temperature
        });
        res.status(200).json({ message: 'Settings updated successfully' });
        break;

      case 'POST':
        const { provider, apiKey, action } = req.body;
        // console.log("provider", provider)
        
        if (!provider || !['openai', 'anthropic', 'gemini'].includes(provider)) {
          return res.status(400).json({ error: 'Invalid provider' });
        }

        if (action === 'set') {
          if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
          }
          await setUserApiKey(userId, provider, apiKey);
          const updatedSettings = await getUserAISettings(userId);
          const sanitizedUpdatedSettings = {
            ...updatedSettings,
            apiKeys: Object.keys(updatedSettings.apiKeys).reduce((acc, key) => {
              acc[key as AIProviderType] = updatedSettings.apiKeys[key as AIProviderType] ? '***masked***' : null;
              return acc;
            }, {} as any)
          };
          res.status(200).json(sanitizedUpdatedSettings);
        } else if (action === 'remove') {
          await removeUserApiKey(userId, provider);
          res.status(200).json({ message: 'API key removed successfully' });
        } else {
          return res.status(400).json({ error: 'Invalid action' });
        }
        break;

      default:
        res.status(405).json({ error: 'Method not allowed' });
        break;
    }
  } catch (error) {
    console.error('AI Settings API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
