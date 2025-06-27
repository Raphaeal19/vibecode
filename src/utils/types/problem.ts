export type Example = {
	id: number;
	inputText: string;
	outputText: string;
	explanation?: string;
	img?: string;
};

// Base Problem type - more generic
export type Problem = {
  id: string;
  title: string;
  taskType: 'dsa' | 'debugging' | 'documentation' | 'api-creation' | 'refactoring'; // New field
  taskDescription?: string; // Renamed from problemStatement
  examples: Example[]; // Still useful for illustrating concepts or expected outputs
  constraints: string;
  order: number;
  starterCode: string; // Initial code provided to the user
  starterFunctionName?: string; // Optional, for DSA problems
  handlerFunction?: string | ((fn: any) => boolean); // for DSA, old question structure
  
  // New fields for specific task types
  testCases?: TestCase[]; // For DSA and Debugging
  expectedOutputFiles?: ExpectedOutputFile[]; // For Documentation, API Creation
  evaluationCriteria?: string; // General criteria for AI-assisted tasks
  problemStatement? : string;
  hints?: string[];
  // Handler function will be managed on the backend based on taskType
  // handlerFunction: ((fn: any) => boolean) | string; // Remove from frontend Problem type
};

// Specific types for different challenge modules
export interface DebuggingProblem extends Problem {
  taskType: 'debugging';
  bugDescription: string; // Detailed description of the bug scenario
  testCases: TestCase[]; // Tests that currently fail due to the bug
  expectedFixDescription?: string; // High-level description of the intended fixs
}

export interface DocumentationProblem extends Problem {
  taskType: 'documentation';
  documentationTarget: 'code' | 'api' | 'project'; // What needs documenting
  targetFormat: 'jsdoc' | 'markdown' | 'swagger'; // Expected output format
  initialCodeFiles: CodeFile[]; // Codebase to document (can be multiple files)
  expectedDocumentationCriteria: string; // Detailed rubric for good documentation
}

// Helper types
export type TestCase = {
  id: number;
  input: any;
  expectedOutput: any;
  explanation?: string;
};

export type CodeFile = {
  filename: string;
  content: string;
  readOnly?: boolean; // If some files should not be edited
};

export type ExpectedOutputFile = {
  filename: string;
  expectedContent?: string; // Can be a regex or partial content
  contentCriteria?: string; // Describes how to validate the content
};

export type DBProblem = {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  likes: number;
  dislikes: number;
  order: number;
  videoId?: string;
  link?: string;
};
