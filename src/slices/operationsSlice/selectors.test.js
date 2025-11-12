import { describe, it, expect, beforeEach } from "vitest";
import { initialState } from "./operationsSlice";
import {
  selectOperationsById,
  selectAllOperationIds,
  selectOperationIdByChildId,
  selectOperationDepthById,
  selectMaxOperationDepth,
} from "./selectors";
import Operation from "./Operation";

describe("operationsSelectors", () => {
  let operation1, operation2, operation3, operation4, state;
  beforeEach(() => {
    operation4 = Operation({
      childIds: ["t5", "t6", "t7"],
    });
    operation3 = Operation({
      childIds: ["t2", "t3"],
    });
    operation2 = Operation({
      childIds: ["t1", operation4.id],
    });
    operation1 = Operation({
      childIds: [operation2.id, operation3.id],
    });

    state = {
      operations: {
        ...initialState,
        byId: {
          [operation1.id]: operation1,
          [operation2.id]: operation2,
          [operation3.id]: operation3,
        },
        allIds: [operation1.id, operation2.id, operation3.id],
        rootOperationId: operation1.id,
      },
    };
  });
  describe("selectOperationsById", () => {
    it("should return the operation for a given ID", () => {
      expect(selectOperationsById(state, operation1.id)).toEqual(operation1);
    });
    it("should return an array of operations for given IDs", () => {
      expect(
        selectOperationsById(state, [operation1.id, operation2.id])
      ).toEqual([operation1, operation2]);
    });
  });
  describe("selectAllOperationIds", () => {
    it("should return all operation IDs", () => {
      expect(selectAllOperationIds(state)).toEqual([
        operation1.id,
        operation2.id,
        operation3.id,
      ]);
    });
  });
  describe("selectOperationIdByChildId", () => {
    it("should return the operation ID for a given table ID", () => {
      expect(selectOperationIdByChildId(state, "t1")).toEqual(operation2.id);
    });
    it("should return undefined if no operation contains the table ID", () => {
      expect(selectOperationIdByChildId(state, "t4")).toBeUndefined();
    });
  });
  describe("selectOperationDepthByIdById", () => {
    it("should return the depth of the operation in the tree", () => {
      // Assuming root operation has depth 0
      expect(selectOperationDepthById(state, operation1.id)).toEqual(0);
      expect(selectOperationDepthById(state, operation2.id)).toEqual(1);
      expect(selectOperationDepthById(state, operation4.id)).toEqual(2);
    });
  });
  describe("selectMaxOperationDepth", () => {
    it("should return the maximum depth of the operation tree", () => {
      expect(selectMaxOperationDepth(state)).toEqual(2);
    });
  });
});
