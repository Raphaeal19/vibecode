import { DocumentationProblem, CodeFile, ExpectedOutputFile } from "../../types/problem";

const undocumentedCode: CodeFile[] = [
  {
    name: "utils.js",
    language: "javascript",
    code: `
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
    name: "README.md",
    language: "markdown",
    code: `
# String Utilities

This is a placeholder README.
`,
  },
];

export const undocumentedModuleProblem: DocumentationProblem = {
  id: "undocumented-module",
  title: "6. Documentation: String Utility Module",
  taskType: "documentation",
  taskDescription: `
    <p class='mt-3'>You are provided with a JavaScript module containing several string utility functions (<code>utils.js</code>) and a placeholder for a <code>README.md</code>. Your primary goal is to **comprehensively document** this module.</p>
    <p class='mt-3'>The code for <code>utils.js</code> is provided in the editor. Below it, you will find a special delimiter <code>/* --- README.md --- */</code>, followed by a placeholder for your <code>README.md</code> content. You must add JSDoc comments directly within the JavaScript code and write your README content in the designated area.</p>
    <p class='mt-3'>This challenge requires you to:</p>
    <ul>
      <li>Add **JSDoc comments** to all functions within <code>utils.js</code>. These comments should accurately describe the function's purpose, parameters, return values, and any errors it might throw.</li>
      <li>Update the <code>README.md</code> section to include essential sections such as **Installation** and **Usage**, along with a clear overview of the module's functionality.</li>
    </ul>
    <p class='mt-3'>**Your AI Assistant's Role:** The AI is here to assist you in drafting documentation. You can ask it to generate JSDoc for a specific function, or suggest content for the README. However, **you are solely responsible** for reviewing the AI's output, ensuring its accuracy, completeness, and proper integration into the codebase. The AI will not automatically edit your files.</p>
    <p class='mt-3'>**Success Criteria:** Your solution will be evaluated on the quality and completeness of the documentation you produce, as measured by the criteria below. This is not about simply accepting the AI's first suggestion, but about using the AI as a tool to achieve a high-quality, human-reviewed outcome.</p>
  `,
  files: undocumentedCode,
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
    <li>The <code>README.md</code> section must be updated with relevant sections.</li>
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
    `<strong>Iterative Prompting:</strong> Don't expect the AI to generate perfect documentation in one go. Start with broad requests and then refine them based on the AI's output and your understanding of the code.`,
    `<strong>Review and Refine:</strong> Always critically review the AI's suggestions. Does the JSDoc accurately reflect the function's behavior? Is the README clear and concise? You are the final editor.`,
    `<strong>Context is Key:</strong> When prompting the AI, provide as much context as possible. For JSDoc, include the function's code. For README sections, describe the purpose and target audience.`,
    `<strong>Break Down the Task:</strong> If you're overwhelmed, break down the documentation task into smaller parts. Focus on one function's JSDoc at a time, or one section of the README.`,
    `<strong>Testing Documentation:</strong> While not directly executable, consider how someone would *use* your documentation. Is it easy to understand and follow?`
  ],
  order: 6,
};
