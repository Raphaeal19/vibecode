import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/firebase/admin';
import { AIService } from '@/services/ai/AIService';
import { validateApiKey } from '@/utils/api/validation';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify user authentication
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { messages, provider, context, conversationId } = req.body;

    console.log(messages, provider, context, conversationId)

    if (!messages || !provider) {
      return res.status(400).json({ error: 'Prompt and provider are required' });
    }

    // Validate API key for the specified provider
    const isValidKey = await validateApiKey(userId, provider);
    if (!isValidKey) {
      return res.status(400).json({ error: 'Invalid or missing API key for provider' });
    }

    // Initialize AI service
    const aiService = new AIService(provider, userId);
    
    // Get AI response
    const response = await aiService.chat({
      messages,
      context,
      conversationId,
      userId
    });

    res.status(200).json(response);
  } catch (error) {
    console.error('AI Chat API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
