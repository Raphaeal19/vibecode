import { Problem, CodeFile } from "../../types/problem";

const apiFiles: CodeFile[] = [
  {
    name: "index.js",
    language: "javascript",
    code: `const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  console.log("Example app listening at http://localhost:3000");
});
`,
  },
  {
    name: "package.json",
    language: "json",
    code: `{
  "name": "my-api",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.17.1"
  }
}
`,
  },
];

export const createApiProblem: Problem = {
  id: "create-api",
  title: "7. API Creation: Simple Express Server",
  taskType: "api-creation",
  taskDescription: `
    <p class='mt-3'>Your task is to create a simple Express.js server.</p>
    <p class='mt-3'>You are provided with two files: <code>index.js</code> and <code>package.json</code>. You need to modify these files to create a basic "Hello World" API.</p>
    <p class='mt-3'>**Your AI Assistant's Role:** The AI can help you with the code, but you are responsible for the final implementation.</p>
  `,
  files: apiFiles,
  examples: [],
  constraints: `
    <li>The server must listen on port 3000.</li>
    <li>The server must respond with "Hello World!" at the root endpoint.</li>
  `,
  order: 7,
};
