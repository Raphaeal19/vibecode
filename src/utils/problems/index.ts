import { Problem } from "../types/problem";
import { jumpGame } from "./jump-game";
import { reverseLinkedList } from "./reverse-linked-list";
import { search2DMatrix } from "./search-a-2d-matrix";
import { twoSum } from "./two-sum";
import { validParantheses } from "./valid-parantheses";

interface problemMap{
  [key:string]: Problem
}

export const problems: problemMap = {
  "two-sum": twoSum,
  "reverse-linked-list": reverseLinkedList,
  "jump-game": jumpGame,
  "valid-parantheses": validParantheses,
  "search-a-2d-matrix": search2DMatrix,
}