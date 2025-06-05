import { describe, it, expect } from "vitest";
import {
  selectOperation,
  selectAllOperationIds,
  selectOperationByTableId,
  selectOperationDepth,
  selectMaxOperationDepth,
  selectRootOperation,
  selectFocusedOperationId,
  selectHoveredOperation,
  selectParentOperation,
} from "./operationsSelectors";

// Mock state for testing
const mockState = {
  operations: {
    root: "op1",
    ids: ["op1", "op2", "op3", "op4"],
    data: {
      op1: { id: "op1", children: ["op2", "op3", "t1"] },
      op2: { id: "op2", children: ["op4", "t2", "t3"] },
      op3: { id: "op3", children: [] },
      op4: { id: "op4", children: ["t4"] },
    },
    focused: "op2",
    hovered: "op3",
  },
};

describe("operationsSelectors", () => {
  it("selectOperation returns the correct operation", () => {
    expect(selectOperation(mockState, "op2")).toEqual(
      mockState.operations.data["op2"]
    );
  });

  it("selectOperation returns undefined if not found", () => {
    expect(selectOperation(mockState, "op90000")).toEqual(undefined);
  });

  it("selectAllOperationIds returns all operation ids", () => {
    expect(selectAllOperationIds(mockState)).toEqual([
      "op1",
      "op2",
      "op3",
      "op4",
    ]);
  });

  it("selectOperationByTableId finds operation by tableId", () => {
    expect(selectOperationByTableId(mockState, "t2")).toEqual(
      mockState.operations.data["op2"]
    );
    expect(selectOperationByTableId(mockState, "t4")).toEqual(
      mockState.operations.data["op4"]
    );
    expect(selectOperationByTableId(mockState, "notable")).toBeUndefined();
  });

  it("selectOperationDepth returns correct depth", () => {
    // op1 (root) depth 0
    expect(selectOperationDepth(mockState, "op1")).toBe(0);
    // op2 is child of op1: depth 1
    expect(selectOperationDepth(mockState, "op2")).toBe(1);
    // op4 is child of op2: depth 2
    expect(selectOperationDepth(mockState, "op4")).toBe(2);
    // op3 is child of op1: depth 1
    expect(selectOperationDepth(mockState, "op3")).toBe(1);
    // not found
    expect(selectOperationDepth(mockState, "notfound")).toBeNull();
  });

  it("selectMaxOperationDepth returns the max depth of the tree", () => {
    expect(selectMaxOperationDepth(mockState)).toBe(2); // op1 -> op2 -> op4
  });

  it("selectRootOperation returns the root operation id", () => {
    expect(selectRootOperation(mockState)).toBe("op1");
  });

  it("selectFocusedOperationId returns the focused operation id", () => {
    expect(selectFocusedOperationId(mockState)).toBe("op2");
  });

  it("selectHoveredOperation returns the hovered operation", () => {
    expect(selectHoveredOperation(mockState)).toEqual("op3");
  });

  it("selectParentOperation finds the parent operation id", () => {
    expect(selectParentOperation(mockState, "op2")).toBe("op1");
    expect(selectParentOperation(mockState, "op3")).toBe("op1");
    expect(selectParentOperation(mockState, "op4")).toBe("op2");
    expect(selectParentOperation(mockState, "op1")).toBeNull();
    expect(selectParentOperation(mockState, "notfound")).toBeNull();
  });
});
