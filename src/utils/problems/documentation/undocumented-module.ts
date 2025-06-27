import { DocumentationProblem, CodeFile, ExpectedOutputFile } from "../../types/problem";

const undocumentedCode: CodeFile[] = [
  {
    filename: "utils.js",
    content: `
/**
 * This module provides utility functions for string manipulation.
 */

function capitalizeFirstLetter(str) {
  if (typeof str !== 'string' || str.length === 0) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function reverseString(str) {
  if (typeof str !== 'string') {
    throw new Error('Input must be a string.');
  }
  return str.split('').reverse().join('');
}

function isPalindrome(str) {
  const cleanedStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversedStr = reverseString(cleanedStr);
  return cleanedStr === reversedStr;
}
`,
  },
  {
    filename: "README.md",
    content: `
# String Utilities

This is a placeholder README.
`,
  },
];

export const documentationHandler = (userCode: string, initialCodeFiles: CodeFile[]): { passed: boolean; feedback: string } => {
  let feedback = "";
  let passed = true;

  // --- Simulate JSDoc check for utils.js ---
  const jsFileContent = userCode; // userCode is the content of utils.js from the editor

  const checkJSDoc = (functionName: string, content: string, requiredTags: string[]) => {
    const regex = new RegExp(`function ${functionName}\\([^)]*\\)\\s*{[^}]*}`);
    const match = content.match(regex);
    if (!match) {
      feedback += `Function '${functionName}' not found in utils.js. `;
      return false;
    }
    const functionBlock = match[0];
    let hasAllTags = true;
    for (const tag of requiredTags) {
      if (!functionBlock.includes(tag)) {
        feedback += `Function '${functionName}' is missing JSDoc tag '${tag}'. `;
        hasAllTags = false;
      }
    }
    if (!functionBlock.includes("/**") || !functionBlock.includes("*/")) {
        feedback += `Function '${functionName}' is missing JSDoc block. `;
        hasAllTags = false;
    }
    return hasAllTags;
  };

  if (!checkJSDoc("capitalizeFirstLetter", jsFileContent, ["@param", "@returns"])) {
    passed = false;
  }
  if (!checkJSDoc("reverseString", jsFileContent, ["@param", "@returns", "@throws"])) {
    passed = false;
  }
  if (!checkJSDoc("isPalindrome", jsFileContent, ["@param", "@returns"])) {
    passed = false;
  }

  // --- Simulate README.md section check ---
  // IMPORTANT: In a real multi-file problem, the frontend would need to send the *edited* README.md content.
  // For this simulation, we are checking against the *initial* README.md content.
  const readmeFile = initialCodeFiles.find(file => file.filename === "README.md");
  if (!readmeFile) {
    feedback += "README.md not found in problem definition. ";
    passed = false;
  } else {
    const readmeContent = readmeFile.content; // This is the original content

    if (!readmeContent.includes("## Installation")) {
      feedback += "README.md is missing '## Installation' section. ";
      passed = false;
    }
    if (!readmeContent.includes("## Usage")) {
      feedback += "README.md is missing '## Usage' section. ";
      passed = false;
    }
    if (!readmeContent.includes("# String Utilities")) {
        feedback += "README.md is missing '# String Utilities' heading. ";
        passed = false;
    }
  }

  if (passed) {
    feedback = "Documentation looks good! All required JSDoc comments and README sections are present (simulated check).";
  } else if (feedback === "") {
    feedback = "Documentation evaluation failed for unknown reasons.";
  }

  return { passed, feedback };
};

export const undocumentedModuleProblem: DocumentationProblem = {
  id: "undocumented-module",
  title: "2. Documentation: String Utility Module",
  taskType: "documentation",
  taskDescription: `
    <p class='mt-3'>You are provided with a JavaScript module containing several string utility functions. Your task is to add comprehensive JSDoc comments to all functions in <code>utils.js</code> and update the <code>README.md</code> file to include installation and usage instructions.</p>
    <p class='mt-3'>The AI assistant can help you draft documentation, but you are responsible for reviewing, refining, and integrating it to ensure accuracy and completeness.</p>
  `,
  starterCode: undocumentedCode[0].content, // For the main editor, assume utils.js is primary
  initialCodeFiles: undocumentedCode, // All files for the problem
  documentationTarget: "code",
  targetFormat: "jsdoc",
  examples: [
    {
      id: 0,
      inputText: `capitalizeFirstLetter("hello")`,
      outputText: `"Hello"`,
      explanation: "Demonstrates capitalizing the first letter of a string.",
    },
  ],
  constraints: `
    <li>All functions in <code>utils.js</code> must have JSDoc comments.</li>
    <li>The <code>README.md</code> must be updated with relevant sections.</li>
    <li>Documentation should be clear, concise, and accurate.</li>
  `,
  evaluationCriteria: `
    <p>Your solution will be evaluated based on the following:</p>
    <ul>
      <li><strong>JSDoc Compliance:</strong> All functions in <code>utils.js</code> must have valid JSDoc comments, including <code>@param</code>, <code>@returns</code>, and <code>@throws</code> (where applicable).</li>
      <li><strong>README Completeness:</strong> The <code>README.md</code> file must contain "Installation" and "Usage" sections, along with a clear overview of the module.</li>
      <li><strong>Accuracy:</strong> The documentation must accurately reflect the code's functionality.</li>
      <li><strong>Clarity and Readability:</strong> The documentation should be easy to understand for other developers.</li>
    </ul>
  `,
  expectedDocumentationCriteria: `
      - Function 'capitalizeFirstLetter' must have JSDoc with @param {string} str and @returns {string}.
      - Function 'reverseString' must have JSDoc with @param {string} str, @returns {string}, and @throws {Error}.
      - Function 'isPalindrome' must have JSDoc with @param {string} str and @returns {boolean}.
      - All JSDoc comments should be accurate and describe function purpose, parameters, and return values.

      - README must include a "Usage" section with an example.
      - README must include an "Installation" section.
      - README must include a brief description of the module's purpose.
    `,
  hints: [
    "Start by asking the AI to generate JSDoc for one function at a time.",
    "Review the AI's output carefully. Does it accurately describe the function's behavior, including edge cases or error handling?",
    "For the README, consider what a new user would need to know to get started with this module.",
    "You might need to ask the AI to refine its suggestions multiple times."
  ],
  order: 6,
};