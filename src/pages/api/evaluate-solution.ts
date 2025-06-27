import { NextApiRequest, NextApiResponse } from 'next';
import { adminAuth } from '@/firebase/admin';
import { problems } from '@/utils/problems';
import { DebuggingProblem, DocumentationProblem } from '@/utils/types/problem';
import { debuggingHandler } from '@/utils/problems/debugging/buggy-function';
import { documentationHandler } from '@/utils/problems/documentation/undocumented-module'; // Will be created later

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const userId = decodedToken.uid;

    const { problemId, userCode, taskType } = req.body;

    if (!problemId || !userCode || !taskType) {
      return res.status(400).json({ error: 'Missing problemId, userCode, or taskType' });
    }

    const problem = problems[problemId];
    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    let evaluationResult: { passed: boolean; feedback: string };

    switch (taskType) {
      case 'dsa':
        // For DSA problems, we'll still use the frontend handler for now
        // In a real scenario, this would also be moved to a secure backend sandbox
        evaluationResult = { passed: false, feedback: "DSA problems are evaluated on the frontend." };
        break;
      case 'debugging':
        const debuggingProblem = problem as DebuggingProblem;
        evaluationResult = debuggingHandler(userCode, debuggingProblem.testCases);
        break;
      case 'documentation':
        const documentationProblem = problem as DocumentationProblem;
        evaluationResult = documentationHandler(userCode, documentationProblem.initialCodeFiles);
        break;
      default:
        evaluationResult = { passed: false, feedback: `Unsupported task type: ${taskType}` };
        break;
    }

    res.status(200).json(evaluationResult);

  } catch (error: any) {
    console.error('Evaluation API Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error during evaluation' });
  }
}
