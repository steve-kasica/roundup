import { describe, it, expect, beforeEach } from "vitest";
import { initialState } from "./operationsSlice";
import {
  selectOperationsById,
  selectOperationChildrenByIds,
  selectAllOperationIds,
  selectOperationIdByChildId,
  selectOperationDepthById,
  selectMaxOperationDepth,
} from "./selectors";
import Operation from "./Operation";

describe("operationsSelectors", () => {
  describe("selectOperationsById", () => {
    let operation1, operation2, state;
    beforeEach(() => {
      operation1 = Operation();
      operation2 = Operation();
      state = {
        operations: {
          ...initialState,
          data: {
            [operation1.id]: operation1,
            [operation2.id]: operation2,
          },
        },
      };
    });
    it("should return the operation for a given ID", () => {
      expect(selectOperationsById(state, operation1.id)).toEqual(operation1);
    });
    it("should return an array of operations for given IDs", () => {
      expect(
        selectOperationsById(state, [operation1.id, operation2.id])
      ).toEqual([operation1, operation2]);
    });
  });
  describe("selectOperationChildrenByIds", () => {
    let operation1, operation2, operation3, state;
    beforeEach(() => {
      operation1 = Operation();
      operation2 = Operation();
      operation3 = Operation();
      state = {
        operations: {
          ...initialState,
          data: {
            [operation1.id]: operation1,
            [operation2.id]: operation2,
            [operation3.id]: operation3,
          },
          childIds: {
            [operation1.id]: [operation2.id, operation3.id],
            [operation2.id]: ["t1"],
            [operation3.id]: [],
          },
        },
      };
    });
    it("should return child IDs for a given operation ID", () => {
      expect(selectOperationChildrenByIds(state, operation1.id)).toEqual([
        operation2.id,
        operation3.id,
      ]);
    });
    it("should return arrays of child IDs for given operation IDs", () => {
      expect(
        selectOperationChildrenByIds(state, [operation1.id, operation2.id])
      ).toEqual([[operation2.id, operation3.id], ["t1"]]);
    });
  });
  describe("selectAllOperationIds", () => {
    let operation1, operation2, state;
    beforeEach(() => {
      operation1 = Operation();
      operation2 = Operation();
      state = {
        operations: {
          ...initialState,
          data: {
            [operation1.id]: operation1,
            [operation2.id]: operation2,
          },
          ids: [operation1.id, operation2.id],
        },
      };
    });
    it("should return all operation IDs", () => {
      expect(selectAllOperationIds(state)).toEqual([
        operation1.id,
        operation2.id,
      ]);
    });
  });
  describe("selectOperationIdByChildId", () => {
    let operation1, operation2, state;
    beforeEach(() => {
      operation1 = Operation();
      operation2 = Operation();
      state = {
        operations: {
          ...initialState,
          data: {
            [operation1.id]: operation1,
            [operation2.id]: operation2,
          },
          childIds: {
            [operation1.id]: ["t1", "t2"],
            [operation2.id]: ["t3"],
          },
        },
      };
    });
    it("should return the operation ID for a given table ID", () => {
      expect(selectOperationIdByChildId(state, "t1")).toEqual(operation1.id);
      expect(selectOperationIdByChildId(state, "t3")).toEqual(operation2.id);
    });
    it("should return undefined if no operation contains the table ID", () => {
      expect(selectOperationIdByChildId(state, "t4")).toBeUndefined();
    });
  });
  describe("selectOperationDepthByIdById", () => {
    let operation1, operation2, operation3, state;
    beforeEach(() => {
      operation1 = Operation();
      operation2 = Operation();
      operation3 = Operation();
      state = {
        operations: {
          ...initialState,
          data: {
            [operation1.id]: operation1,
            [operation2.id]: operation2,
            [operation3.id]: operation3,
          },
          rootOperationId: operation1.id,
          childIds: {
            [operation1.id]: [operation2.id],
            [operation2.id]: [operation3.id],
            [operation3.id]: [],
          },
        },
      };
    });
    it("should return the depth of the operation in the tree", () => {
      // Assuming root operation has depth 0
      expect(selectOperationDepthById(state, operation1.id)).toEqual(0);
      expect(selectOperationDepthById(state, operation2.id)).toEqual(1);
      expect(selectOperationDepthById(state, operation3.id)).toEqual(2);
    });
  });
  describe("selectMaxOperationDepth", () => {
    let operation1, operation2, operation3, state;
    beforeEach(() => {
      operation1 = Operation();
      operation2 = Operation();
      operation3 = Operation();
      state = {
        operations: {
          ...initialState,
          data: {
            [operation1.id]: operation1,
            [operation2.id]: operation2,
            [operation3.id]: operation3,
          },
          rootOperationId: operation1.id,
          childIds: {
            [operation1.id]: [operation2.id],
            [operation2.id]: [operation3.id],
            [operation3.id]: [],
          },
        },
      };
    });
    it("should return the maximum depth of the operation tree", () => {
      expect(selectMaxOperationDepth(state)).toEqual(2);
    });
  });
});
