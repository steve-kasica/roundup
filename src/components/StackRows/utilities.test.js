import { describe, it, expect, beforeAll } from "vitest";
import { getSelectedColumnIndices } from "./utilities.js";

describe("StackRows utilities", () => {
  let columnIdMatrix;
  beforeAll(() => {
    columnIdMatrix = [
      ["c1", "c2", "c3"],
      ["c4", "c5", "c6"],
      ["c7", "c8", "c9"],
    ];
  });
  describe("`getSelectedColumnIndices`", () => {
    let selectedColumnIds;
    it("returns correct set of indices when one column is selected", () => {
      selectedColumnIds = ["c1"];
      const result = getSelectedColumnIndices(
        columnIdMatrix,
        selectedColumnIds
      );
      expect(result).toEqual(new Set([0]));
    });
    it("returns the correct set of indices when multiple columns within table are selected", () => {
      selectedColumnIds = ["c1", "c2"];
      const result = getSelectedColumnIndices(
        columnIdMatrix,
        selectedColumnIds
      );
      expect(result).toEqual(new Set([0, 1]));
    });

    it("returns the correct set of indices when multiple columns across multiple tables are selected", () => {
      selectedColumnIds = ["c2", "c3", "c5", "c8"];
      const result = getSelectedColumnIndices(
        columnIdMatrix,
        selectedColumnIds
      );
      expect(result).toEqual(new Set([1, 2]));
    });

    it("returns an empty set when no columns are selected", () => {
      selectedColumnIds = [];
      const result = getSelectedColumnIndices(
        columnIdMatrix,
        selectedColumnIds
      );
      expect(result).toEqual(new Set());
    });

    it("returns an empty set when selected columns do not exist in matrix", () => {
      selectedColumnIds = ["c10", "c11"];
      const result = getSelectedColumnIndices(
        columnIdMatrix,
        selectedColumnIds
      );
      expect(result).toEqual(new Set());
    });
  });
});
