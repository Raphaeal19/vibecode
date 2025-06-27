import { DocumentationProblem, CodeFile, ExpectedOutputFile } from "../../types/problem";

const FILE_DELIMITER = "\n\n/* --- README.md --- */\n\n";

const undocumentedCode: CodeFile[] = [
  {
    filename: "utils.js",
    content: `\n/**\n * This module provides utility functions for string manipulation.\n */\n\nfunction capitalizeFirstLetter(str) {\n  if (typeof str !== 'string' || str.length === 0) {\n    return '';\n  }\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}\n\nfunction reverseString(str) {\n  if (typeof str !== 'string') {\n    throw new Error('Input must be a string.');\n  }\n  return str.split('').reverse().join('');\n}\n\nfunction isPalindrome(str) {\n  const cleanedStr = str.toLowerCase().replace(/[^a-z0-9]/g, '');\n  const reversedStr = reverseString(cleanedStr);\n  return cleanedStr === reversedStr;\n}\n`,
  },
  {
    filename: "README.md",
    content: `\n# String Utilities\n\nThis is a placeholder README.\n`,
  },
];

export const documentationHandler = (userCode: string, initialCodeFiles: CodeFile[]): { passed: boolean; feedback: string } => {
  let feedback = "";
  let passed = true;

  const parts = userCode.split(FILE_DELIMITER);
  const jsFileContent = parts[0];
  const readmeContent = parts[1] || ""; // If README part is missing, treat as empty

  // --- Simulate JSDoc check for utils.js ---
  const checkJSDoc = (functionName: string, content: string, requiredTags: string[]) => {
    const regex = new RegExp(`function ${functionName}\\([^)]*\\)\\s*{\\[^}]*\\}`);
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

  if (passed) {
    feedback = "Documentation looks good! All required JSDoc comments and README sections are present (simulated check).";
  } else if (feedback === "") {
    feedback = "Documentation evaluation failed for unknown reasons.";
  }

  return { passed, feedback };
};

export const undocumentedModuleProblem: DocumentationProblem = {
  id: "undocumented-module",
  title: "6. Documentation: String Utility Module",
  taskType: "documentation",
  taskDescription: `\n    <p class='mt-3'>You are provided with a JavaScript module containing several string utility functions (<code>utils.js</code>) and a placeholder for a <code>README.md</code>. Your primary goal is to **comprehensively document** this module.</p>\n    <p class='mt-3'>The code for <code>utils.js</code> is provided in the editor. Below it, you will find a special delimiter <code>/* --- README.md --- */</code>, followed by a placeholder for your <code>README.md</code> content. You must add JSDoc comments directly within the JavaScript code and write your README content in the designated area.</p>\n    <p class='mt-3'>This challenge requires you to:</p>\n    <ul>\n      <li>Add **JSDoc comments** to all functions within <code>utils.js</code>. These comments should accurately describe the function's purpose, parameters, return values, and any errors it might throw.</li>\n      <li>Update the <code>README.md</code> section to include essential sections such as **Installation** and **Usage**, along with a clear overview of the module's functionality.</li>\n    </ul>\n    <p class='mt-3'>**Your AI Assistant's Role:** The AI is here to assist you in drafting documentation. You can ask it to generate JSDoc for a specific function, or suggest content for the README. However, **you are solely responsible** for reviewing the AI's output, ensuring its accuracy, completeness, and proper integration into the codebase. The AI will not automatically edit your files.</p>\n    <p class='mt-3'>**Success Criteria:** Your solution will be evaluated on the quality and completeness of the documentation you produce, as measured by the criteria below. This is not about simply accepting the AI's first suggestion, but about using the AI as a tool to achieve a high-quality, human-reviewed outcome.</p>\n  `,
  starterCode: undocumentedCode[0].content + FILE_DELIMITER + undocumentedCode[1].content, // Combined content
  initialCodeFiles: undocumentedCode, // Still keep original for context if needed elsewhere
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
  constraints: `\n    <li>All functions in <code>utils.js</code> must have JSDoc comments.</li>\n    <li>The <code>README.md</code> section must be updated with relevant sections.</li>\n    <li>Documentation should be clear, concise, and accurate.</li>\n  `,
  evaluationCriteria: `\n    <p>Your solution will be evaluated based on the following:</p>\n    <ul>\n      <li><strong>JSDoc Compliance:</strong> All functions in <code>utils.js</code> must have valid JSDoc comments, including <code>@param</code>, <code>@returns</code>, and <code>@throws</code> (where applicable).</li>\n      <li><strong>README Completeness:</strong> The <code>README.md</code> file must contain "Installation" and "Usage" sections, along with a clear overview of the module.</li>\n      <li><strong>Accuracy:</strong> The documentation must accurately reflect the code's functionality.</li>\n      <li><strong>Clarity and Readability:</strong> The documentation should be easy to understand for other developers.</li>\n    </ul>\n  `,
  expectedDocumentationCriteria: `\n      - Function 'capitalizeFirstLetter' must have JSDoc with @param {string} str and @returns {string}.\n      - Function 'reverseString' must have JSDoc with @param {string} str, @returns {string}, and @throws {Error}.\n      - Function 'isPalindrome' must have JSDoc with @param {string} str and @returns {boolean}.\n      - All JSDoc comments should be accurate and describe function purpose, parameters, and return values.\n\n      - README must include a "Usage" section with an example.\n      - README must include an "Installation" section.\n      - README must include a brief description of the module's purpose.\n    `,
  hints: [
    `<strong>Iterative Prompting:</strong> Don't expect the AI to generate perfect documentation in one go. Start with broad requests and then refine them based on the AI's output and your understanding of the code.`,
    `<strong>Review and Refine:</strong> Always critically review the AI's suggestions. Does the JSDoc accurately reflect the function's behavior? Is the README clear and concise? You are the final editor.`,
    `<strong>Context is Key:</strong> When prompting the AI, provide as much context as possible. For JSDoc, include the function's code. For README sections, describe the purpose and target audience.`,
    `<strong>Break Down the Task:</strong> If you're overwhelmed, break down the documentation task into smaller parts. Focus on one function's JSDoc at a time, or one section of the README.`,
    `<strong>Testing Documentation:</strong> While not directly executable, consider how someone would *use* your documentation. Is it easy to understand and follow?`
  ],
  order: 6,
};