import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/firebase/firebase';
import { BsChevronDown } from 'react-icons/bs';
import { useRecoilState } from 'recoil';
import { chatState, ChatMessage } from '@/atoms/chatAtom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { DebuggingProblem, DocumentationProblem, Problem } from '@/utils/types/problem';

interface AIChatPanelProps {
  problemId: string;
  problem: Problem
}

const AIChatPanel: React.FC<AIChatPanelProps> = ({ problemId, problem }) => {
  const [prompt, setPrompt] = useState('');
  const [chats, setChats] = useRecoilState(chatState);
  const messages = chats[problemId] || [];
  const [isLoading, setIsLoading] = useState(false);
  const [user] = useAuthState(auth);
  const [selectedProvider, setSelectedProvider] = useState('openai');

  const providers = [
    { value: 'openai', label: 'OpenAI' },
    { value: 'gemini', label: 'Gemini' },
    { value: 'claude', label: 'Claude' },
  ];

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    if (!user) {
      toast.error('Please login to use AI assistant');
      return;
    }

    if (!problem) {
      toast.error('Problem data not available.');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: prompt,
      timestamp: Date.now()
    };

    const updatedMessages = [...messages, userMessage];
    setChats(prev => ({ ...prev, [problemId]: updatedMessages }));
    setPrompt('');
    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          messages: updatedMessages.map(({ id, timestamp, ...rest }) => rest),
          provider: selectedProvider,
          context: {
            problemId,
            challengeType: problem.taskType,
            code: problem.starterCode,
            ...(problem.taskType === 'debugging' && { bugDescription: (problem as DebuggingProblem).bugDescription, testCases: (problem as DebuggingProblem).testCases }),
            ...(problem.taskType === 'documentation' && { initialCodeFiles: (problem as DocumentationProblem).initialCodeFiles, expectedDocumentationCriteria: (problem as DocumentationProblem).expectedDocumentationCriteria }),
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get AI response');
      }

      const data = await response.json();
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: Date.now()
      };

      setChats(prev => ({ ...prev, [problemId]: [...updatedMessages, aiMessage] }));
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-gray-500 text-sm text-center py-8">
            Start a conversation with the AI assistant! Ask for help with refactoring, testing, documentation, or debugging.
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-brand-orange text-white'
                    : 'bg-dark-fill-3 text-gray-200'
                }`}
              >
                <div className="text-sm break-words prose prose-invert">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-dark-fill-3 text-gray-200 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-300"></div>
                <span className="text-sm">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t bottom-0 border-dark-fill-3 pt-4">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <div className="absolute top-2 right-2 z-10">
                <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="appearance-none bg-dark-fill-2 border border-transparent rounded-md pl-2 pr-6 py-1 text-xs text-white focus:outline-none focus:border-brand-orange"
                disabled={isLoading}
                >
                {providers.map(provider => (
                    <option key={provider.value} value={provider.value}>
                    {provider.label}
                    </option>
                ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-gray-400">
                    <BsChevronDown className="h-3 w-3" />
                </div>
            </div>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask the AI for help with this problem..."
                className="flex-1 bg-dark-fill-3 border border-transparent rounded-lg pl-3 pr-28 pt-2 pb-2 text-white placeholder-gray-500 focus:outline-none focus:border-brand-orange w-full min-h-[4rem]"
                disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-brand-orange-s disabled:opacity-50 disabled:cursor-not-allowed transition-colors self-end"
          >
            Send
          </button>
        </div>
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default AIChatPanel;

