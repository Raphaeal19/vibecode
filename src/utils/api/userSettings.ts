import { AIProviderType, AIUserSettings } from '@/services/ai/types';
import { adminDb } from '@/firebase/admin';

const DEFAULT_AI_SETTINGS: AIUserSettings = {
  preferredProvider: 'gemini',
  apiKeys: {},
  maxTokens: 2000,
  temperature: 0.7,
};

export async function getUserAISettings(userId: string): Promise<AIUserSettings> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      const userData = userDoc.data();
      return {
        ...DEFAULT_AI_SETTINGS,
        ...userData?.aiSettings,
      };
    }

    await userRef.set(
      {
        aiSettings: DEFAULT_AI_SETTINGS,
      },
      { merge: true }
    );

    return DEFAULT_AI_SETTINGS;
  } catch (error) {
    console.error('Error getting user AI settings:', error);
    return DEFAULT_AI_SETTINGS;
  }
}

export async function updateUserAISettings(userId: string, settings: Partial<AIUserSettings>): Promise<void> {
  try {
    const userRef = adminDb.collection('users').doc(userId);
    await userRef.update({
      aiSettings: {
        ...DEFAULT_AI_SETTINGS,
        ...settings,
      },
    });
  } catch (error) {
    console.error('Error updating user AI settings:', error);
    throw new Error('Failed to update AI settings');
  }
}

export async function getUserApiKey(userId: string, provider: AIProviderType): Promise<string | null> {
  try {
    const settings = await getUserAISettings(userId);
    return settings.apiKeys[provider] || null;
  } catch (error) {
    console.error('Error getting user API key:', error);
    return null;
  }
}

export async function setUserApiKey(userId: string, provider: AIProviderType, apiKey: string): Promise<void> {
  try {
    const settings = await getUserAISettings(userId);
    const updatedSettings: AIUserSettings = {
      ...settings,
      apiKeys: {
        ...settings.apiKeys,
        [provider]: apiKey,
      },
    };

    await updateUserAISettings(userId, updatedSettings);
  } catch (error) {
    console.error('Error setting user API key:', error);
    throw new Error('Failed to save API key');
  }
}

export async function removeUserApiKey(userId: string, provider: AIProviderType): Promise<void> {
  try {
    const settings = await getUserAISettings(userId);
    const updatedApiKeys = { ...settings.apiKeys };
    delete updatedApiKeys[provider];

    const updatedSettings: AIUserSettings = {
      ...settings,
      apiKeys: updatedApiKeys,
    };

    await updateUserAISettings(userId, updatedSettings);
  } catch (error) {
    console.error('Error removing user API key:', error);
    throw new Error('Failed to remove API key');
  }
}
