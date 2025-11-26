import { describe, it, expect, beforeEach } from "vitest";
import reducer, {
  initialState,
  addOperations,
  updateOperations,
  deleteOperations,
} from "./operationsSlice";
import Operation from "./Operation";

describe("operationsSlice reducers", () => {
  describe("addOperations", () => {
    let operation, action, nextState;
    beforeEach(() => {
      operation = Operation();
      action = addOperations(operation);
      nextState = reducer(initialState, action);
    });
    it("adds operationId to allIds array", () => {
      expect(nextState.allIds).toContain(operation.id);
    });
    it("adds a new operation to byId", () => {
      expect(nextState.byId[operation.id]).toEqual(operation);
    });
    it("throws if operation with same ID already exists", () => {
      const state = {
        ...initialState,
        byId: { [operation.id]: operation },
        allIds: [operation.id],
      };
      const action = addOperations(operation);
      expect(() => reducer(state, action)).toThrow();
    });

    describe("first operation added", () => {
      it("sets rootOperationId if none exists", () => {
        const action = addOperations(operation);
        const state = reducer(initialState, action);
        expect(state.rootOperationId).toBe(operation.id);
      });
    });

    describe("subsequent operations added", () => {
      let nextState, op1, op2;
      beforeEach(() => {
        op1 = Operation();
        const state = {
          ...initialState,
          rootOperationId: op1.id,
          byId: { [op1.id]: op1 },
          allIds: [op1.id],
        };
        op2 = Operation();
        const action = addOperations(op2);
        nextState = reducer(state, action);
      });
      it("updates `rootOperationId` with new operation ID", () => {
        expect(nextState.rootOperationId).toBe(op2.id);
      });
    });
  });

  describe("updateOperations", () => {
    it("updates a single operation", () => {
      const op = Operation("stack", ["c1"]);
      const state = {
        ...initialState,
        byId: { [op.id]: op },
        allIds: [op.id],
      };
      const updatedOp = { ...op, operationType: "pack" };
      const action = updateOperations(updatedOp);
      const nextState = reducer(state, action);
      expect(nextState.byId[op.id].operationType).toBe("pack");
    });

    it("updates multiple operations", () => {
      const op1 = Operation("stack", ["c1"]);
      const op2 = Operation("pack", ["c2"]);
      const state = {
        ...initialState,
        byId: { [op1.id]: op1, [op2.id]: op2 },
        allIds: [op1.id, op2.id],
      };
      const updatedOps = [
        { ...op1, operationType: "pack" },
        { ...op2, operationType: "stack" },
      ];
      const action = updateOperations(updatedOps);
      const nextState = reducer(state, action);
      expect(nextState.byId[op1.id].operationType).toBe("pack");
      expect(nextState.byId[op2.id].operationType).toBe("stack");
    });

    it("throws if operation does not exist", () => {
      const op = Operation("stack", ["c1"]);
      const state = initialState;
      const updatedOp = { ...op, operationType: "pack" };
      const action = updateOperations(updatedOp);
      expect(() => reducer(state, action)).toThrow();
    });
  });

  describe("deleteOperations", () => {
    it("deletes an single operation by ID", () => {
      const op = Operation();
      const state = {
        ...initialState,
        byId: { [op.id]: op },
        allIds: [op.id],
        rootOperationId: op.id,
      };
      const action = deleteOperations(op.id);
      const nextState = reducer(state, action);
      expect(nextState.byId[op.id]).toBeUndefined();
      expect(nextState.allIds).not.toContain(op.id);
      expect(nextState.rootOperationId).toBeNull();
    });
    it("deletes multiple operations by IDs", () => {
      const op1 = Operation();
      const op2 = Operation();
      const state = {
        ...initialState,
        byId: { [op1.id]: op1, [op2.id]: op2 },
        allIds: [op1.id, op2.id],
      };
      const action = deleteOperations([op1.id, op2.id]);
      const nextState = reducer(state, action);
      expect(nextState.byId[op1.id]).toBeUndefined();
      expect(nextState.byId[op2.id]).toBeUndefined();
      expect(nextState.allIds).not.toContain(op1.id);
      expect(nextState.allIds).not.toContain(op2.id);
    });
    it("deletes child operations when parent operation is deleted", () => {
      const op1 = Operation();
      const op2 = Operation();
      const op3 = Operation();
      op1.childIds = [op2.id, "t1"];
      op2.childIds = [op3.id];
      const state = {
        ...initialState,
        byId: { [op1.id]: op1, [op2.id]: op2, [op3.id]: op3 },
        allIds: [op1.id, op2.id, op3.id],
        rootOperationId: op1.id,
      };
      const action = deleteOperations(op1.id);
      const nextState = reducer(state, action);
      expect(nextState.byId[op1.id]).toBeUndefined();
      expect(nextState.byId[op2.id]).toBeUndefined();
      expect(nextState.byId[op3.id]).toBeUndefined();
      expect(nextState.allIds).not.toContain(op1.id);
      expect(nextState.allIds).not.toContain(op2.id);
      expect(nextState.allIds).not.toContain(op3.id);
      expect(nextState.rootOperationId).toBeNull();
    });
  });
});
