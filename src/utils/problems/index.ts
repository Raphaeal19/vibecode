import { Problem } from "../types/problem";
import { twoSum } from "./two-sum";
import { reverseLinkedList } from "./reverse-linked-list";
import { jumpGame } from "./jump-game";
import { validParantheses } from "./valid-parantheses";
import { search2DMatrix } from "./search-a-2d-matrix";

// Import new problem types
import { buggyFunctionProblem } from "./debugging/buggy-function";
import { undocumentedModuleProblem } from "./documentation/undocumented-module";
import { createApiProblem } from "./api/create-api";

interface ProblemMap {
  [key: string]: Problem;
}

export const problems: ProblemMap = {
  "two-sum": twoSum,
  "reverse-linked-list": reverseLinkedList,
  "jump-game": jumpGame,
  "valid-parantheses": validParantheses,
  "search-a-2d-matrix": search2DMatrix,
  // New problem types
  "buggy-function": buggyFunctionProblem,
  "undocumented-module": undocumentedModuleProblem,
  "create-api": createApiProblem,
};
