import assert from "assert";
import { DebuggingProblem, TestCase } from "../../types/problem";

// The buggy code
const buggyCode = `
function calculateDiscount(price, discountPercentage) {
  if (discountPercentage > 100) {
    return price; // Should not apply discount if over 100%
  }
  const discountAmount = price * (discountPercentage / 100);
  return price - discountAmount;
}

function applyTax(amount, taxRate) {
  return amount + (amount * taxRate); // Tax rate is expected as percentage, but applied as decimal
}

function getTotalPrice(itemPrice, discount, tax) {
  let finalPrice = calculateDiscount(itemPrice, discount);
  finalPrice = applyTax(finalPrice, tax);
  return finalPrice;
}
`;

// Tests that expose the bugs
const debuggingTestCases: TestCase[] = [
  {
    id: 0,
    input: { itemPrice: 100, discount: 10, tax: 0.05 }, // 10% discount, 5% tax
    expectedOutput: 94.5, // (100 - 10) * 1.05 = 90 * 1.05 = 94.5
    explanation: "Standard discount and tax application.",
  },
  {
    id: 1,
    input: { itemPrice: 200, discount: 150, tax: 0.10 }, // Discount > 100%, should be no discount
    expectedOutput: 220, // 200 * 1.10 = 220
    explanation: "Discount percentage over 100% should not apply, then 10% tax.",
  },
  {
    id: 2,
    input: { itemPrice: 50, discount: 0, tax: 0.20 }, // No discount, 20% tax
    expectedOutput: 60, // 50 * 1.20 = 60
    explanation: "No discount, then 20% tax.",
  },
];

// Handler function for debugging problems (backend logic)
// This would typically run in a secure sandbox on the server.
// For demonstration, we'll simulate it here.
export const debuggingHandler = (userCode: string, testCases: TestCase[]): { passed: boolean; feedback: string } => {
  try {
    // Dynamically execute the user's code.
    // WARNING: In a real application, this MUST be done in a secure, isolated sandbox environment.
    // Executing arbitrary user code directly like this is a major security risk.
    const userFunction = new Function(`
      ${userCode}
      return { calculateDiscount, applyTax, getTotalPrice };
    `)();

    for (const testCase of testCases) {
      const { itemPrice, discount, tax } = testCase.input;
      const result = userFunction.getTotalPrice(itemPrice, discount, tax);
      assert.strictEqual(result, testCase.expectedOutput, `Test Case ${testCase.id} failed: Input (${JSON.stringify(testCase.input)}) Expected ${testCase.expectedOutput}, Got ${result}`);
    }
    return { passed: true, feedback: "All tests passed! Great job debugging." };
  } catch (error: any) {
    return { passed: false, feedback: `Tests failed: ${error.message}` };
  }
};


export const buggyFunctionProblem: DebuggingProblem = {
  id: "buggy-function",
  title: "1. Debugging: Price Calculation Errors",
  taskType: "debugging",
  bugDescription: `
    <p class='mt-3'>You are given a JavaScript module responsible for calculating the final price of an item, including discounts and taxes. Users are reporting incorrect final prices for certain scenarios.</p>
    <p class='mt-3'>Your task is to identify and fix the bugs in the provided code so that all test cases pass. The bugs are subtle and require careful examination of the logic.</p>
    <p class='mt-3'><strong>Do not rewrite the entire functions. Focus on fixing the specific logical errors.</strong></p>
  `,
  starterCode: buggyCode,
  testCases: debuggingTestCases,
  examples: [
    {
      id: 0,
      inputText: `itemPrice = 100, discount = 10, tax = 0.05`,
      outputText: `94.5`,
      explanation: "A standard calculation: (100 - 10% discount) * (1 + 5% tax) = 90 * 1.05 = 94.5",
    },
    {
      id: 1,
      inputText: `itemPrice = 200, discount = 150, tax = 0.10`,
      outputText: `220`,
      explanation: "If discount percentage is over 100%, no discount should be applied, then 10% tax: 200 * 1.10 = 220.",
    },
  ],
  constraints: `
    <li>The input prices and percentages will be positive numbers.</li>
    <li>The tax rate is provided as a decimal (e.g., 0.05 for 5%).</li>
    <li>The discount percentage is provided as a whole number (e.g., 10 for 10%).</li>
  `,
  evaluationCriteria: `
    <p>Your solution will be evaluated based on the following:</p>
    <ul>
      <li>All provided test cases must pass.</li>
      <li>The core logic of the <code>calculateDiscount</code> and <code>applyTax</code> functions should be preserved, with minimal changes to fix the bugs.</li>
      <li>No new bugs should be introduced.</li>
      <li>Code readability and style should be maintained.</li>
    </ul>
  `,
  hints: [
    "Pay close attention to edge cases for percentages.",
    "Consider how percentages are typically represented (decimal vs. whole number) and how they are used in calculations.",
    "Trace the execution flow with the failing test cases step-by-step."
  ],
  order: 7
};