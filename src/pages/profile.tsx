import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase';
import { AIProviderType, AIUserSettings } from '@/services/ai/types';
import Topbar from '@/components/Topbar/Topbar';
import useHasMounted from '@/hooks/useHasMounted';
import { useRouter } from 'next/router';

const ProfilePage: React.FC = () => {
  const [user] = useAuthState(auth);
  const [providers, setProviders] = useState<{ id: string; name: string; description: string }[]>([]);
  const [userSettings, setUserSettings] = useState<AIUserSettings | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<AIProviderType>('gemini');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const hasMounted = useHasMounted();
  const router = useRouter();

  useEffect(() => {
    fetch('/api/ai/providers')
      .then((res) => res.json())
      .then((data) => setProviders(data.providers))
      .catch((err) => toast.error('Failed to load providers'));

    if (user) {
      user.getIdToken().then((token) => {
        fetch('/api/user/ai-settings', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((settings) => {
            setUserSettings(settings);
            if (settings.preferredProvider) {
              setSelectedProvider(settings.preferredProvider);
            }
          })
          .catch((err) => console.log('Settings not found, using defaults'));
      });
    }
  }, [user]);

  useEffect(() => {
    if (userSettings && userSettings.apiKeys && userSettings.apiKeys[selectedProvider]) {
      setApiKey('••••••••••••••••');
    } else {
      setApiKey('');
    }
  }, [selectedProvider, userSettings]);

  const handleSaveSettings = async () => {
    if (!user) {
      toast.error('Please login to save settings');
      return;
    }

    if (!apiKey.trim() || apiKey === '••••••••••••••••') {
      toast.error('Please enter a new API key to save.');
      return;
    }

    setLoading(true);
    try {
      const token = await user.getIdToken(true);
      const response = await fetch('/api/user/ai-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          provider: selectedProvider,
          apiKey,
          action: 'set',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save API key');
      }

      toast.success('API key saved successfully!');
      setUserSettings(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted) return null;

  return (
    <>
      <Topbar />
      <main className="bg-dark-layer-2 min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="bg-dark-layer-1 rounded-lg shadow-lg p-8 relative">
            <button
              onClick={() => router.back()}
              className="absolute top-8 left-8 text-white hover:text-brand-orange transition-colors flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Back
            </button>
            <h1 className="text-3xl font-bold text-white mb-8 text-center">Profile Settings</h1>
            
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
              <div className="bg-dark-fill-3 rounded-lg p-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={user?.photoURL || '/avatar.png'}
                    alt="User Avatar"
                    className="w-16 h-16 rounded-full"
                  />
                  <div>
                    <p className="text-white font-medium">{user?.displayName || 'Anonymous User'}</p>
                    <p className="text-gray-400">{user?.email}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-white mb-4">AI Provider Settings</h2>
              <div className="bg-dark-fill-3 rounded-lg p-6 space-y-6">
                <div>
                  <label htmlFor="provider" className="block text-sm font-medium text-gray-300 mb-2">
                    Choose AI Provider:
                  </label>
                  <select
                    id="provider"
                    value={selectedProvider}
                    onChange={(e) => setSelectedProvider(e.target.value as AIProviderType)}
                    className="w-full bg-dark-layer-2 border-dark-border-2 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-brand-orange"
                  >
                    {providers.map((provider) => (
                      <option key={provider.id} value={provider.id}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-2">
                    API Key for {providers.find(p => p.id === selectedProvider)?.name}:
                  </label>
                  <input
                    type="password"
                    id="apiKey"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter your API key to update..."
                    className="w-full bg-dark-layer-2 border-dark-border-2 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Your API key is stored securely and never shared. It is only used to make requests to the selected provider on your behalf.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={handleSaveSettings}
                    disabled={loading || !user}
                    className="bg-brand-orange hover:bg-brand-orange-s disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 px-6 rounded-lg transition-colors"
                  >
                    {loading ? 'Saving...' : 'Save API Key'}
                  </button>
                </div>

                <div className="border-t border-dark-border-2 pt-6">
                  <h3 className="text-lg font-medium text-white mb-3">How to get API keys:</h3>
                  <div className="space-y-3 text-sm text-gray-300">
                    <div>
                      <strong className="text-white">OpenAI:</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                        <li>Go to <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">OpenAI API Keys</a></li>
                        <li>Create a new secret key</li>
                        <li>Copy and paste it above</li>
                      </ol>
                    </div>
                    <div>
                      <strong className="text-white">Anthropic (Claude):</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                        <li>Go to <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">Anthropic Console</a></li>
                        <li>Navigate to API Keys section</li>
                        <li>Generate a new API key</li>
                        <li>Copy and paste it above</li>
                      </ol>
                    </div>
                     <div>
                      <strong className="text-white">Google (Gemini):</strong>
                      <ol className="list-decimal list-inside ml-4 mt-1 space-y-1">
                        <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline">Google AI Studio</a></li>
                        <li>Create an API key in a new or existing project</li>
                        <li>Copy and paste it above</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ProfilePage;

