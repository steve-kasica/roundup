import { describe, it, expect } from "vitest";
import { getIndexOfValue, getValuesInRange } from "./selectionUtils";

const matrix = [
  ["a", "b", "c"],
  ["d", "e", "f"],
  ["g", "h", "i"],
];

describe("getIndexOfValue", () => {
  it("finds correct index", () => {
    expect(getIndexOfValue(matrix, "e")).toEqual([1, 1]);
    expect(getIndexOfValue(matrix, "a")).toEqual([0, 0]);
    expect(getIndexOfValue(matrix, "z")).toBeNull();
  });
});

describe("getValuesInRange", () => {
  it("selects single cell", () => {
    expect(getValuesInRange(matrix, [1, 1], [1, 1])).toEqual(["e"]);
  });
  it("selects rectangle", () => {
    expect(getValuesInRange(matrix, [0, 0], [1, 1])).toEqual([
      "a",
      "b",
      "d",
      "e",
    ]);
    expect(getValuesInRange(matrix, [2, 2], [1, 1])).toEqual([
      "e",
      "f",
      "h",
      "i",
    ]);
  });
  it("skips null/undefined", () => {
    const ragged = [["a", null], ["b"]];
    expect(getValuesInRange(ragged, [0, 0], [1, 1])).toEqual(["a", "b"]);
  });
});
