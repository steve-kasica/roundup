import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import deleteOperationsWorker from "./worker";
import {
  deleteOperations as deleteOperationsFromSlice,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { deleteOperationsSuccess, deleteOperationsFailure } from "./actions";
import { dropView } from "../../lib/duckdb";

/**
 * Helper to create a mock state with operations
 */
const createMockState = (operationsById = {}, uiState = {}) => ({
  operations: {
    byId: operationsById,
    allIds: Object.keys(operationsById),
    rootOperationId: null,
  },
  ui: {
    focusedObjectId: null,
    ...uiState,
  },
});

describe("deleteOperationsWorker saga", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deleting PACK/STACK operations", () => {
    it("dispatches a deleteOperations actions to the slice", async () => {
      const action = {
        payload: {
          operationIds: ["o1"],
        },
      };

      const mockState = createMockState({
        o1: {
          id: "o1",
          operationType: OPERATION_TYPE_PACK,
          databaseName: "pack_view_1",
        },
      });

      const { effects } = await expectSaga(deleteOperationsWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .run();

      // Verify deleteOperations was called from slice
      const deleteOperationsAction = effects.put.find(
        (effect) =>
          effect.payload.action.type === deleteOperationsFromSlice.type,
      );
      expect(deleteOperationsAction).toBeDefined();

      // Verify success action was dispatched
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type,
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.operationIds).toContain("o1");
    });

    it("dispatches a deleteOperations actions to the slice", async () => {
      const action = {
        payload: {
          operationIds: ["o1"],
        },
      };

      const mockState = createMockState({
        o1: {
          id: "o1",
          operationType: OPERATION_TYPE_STACK,
          databaseName: "stack_view_1",
        },
      });

      const { effects } = await expectSaga(deleteOperationsWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type,
      );
      expect(successAction).toBeDefined();
    });

    it("clears the focused object if it is being deleted", async () => {
      const action = {
        payload: {
          operationIds: ["o1"],
        },
      };

      const mockState = {
        ui: {
          focusedObjectId: "o1",
        },
        operations: {
          byId: {
            o1: {
              id: "o1",
              operationType: OPERATION_TYPE_PACK,
              databaseName: "pack_view_1",
            },
          },
          allIds: ["o1"],
        },
      };

      const { effects } = await expectSaga(deleteOperationsWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .run();

      // Verify setFocusedObjectId(null) was dispatched
      const setFocusedObjectAction = effects.put.find(
        (effect) =>
          effect.payload.action.type === "ui/setFocusedObjectId" &&
          effect.payload.action.payload === null,
      );
      expect(setFocusedObjectAction).toBeDefined();
    });
  });

  describe("deleting NO_OP operations", () => {
    it("deletes NO_OP operation from state without dropping view", async () => {
      const action = {
        payload: {
          operationIds: ["o1"],
        },
      };

      const mockState = createMockState({
        o1: {
          id: "o1",
          operationType: OPERATION_TYPE_NO_OP,
        },
      });

      const { effects } = await expectSaga(deleteOperationsWorker, action)
        .withState(mockState)
        .run();

      // Verify deleteOperations was called
      const deleteOperationsAction = effects.put.find(
        (effect) =>
          effect.payload.action.type === deleteOperationsFromSlice.type,
      );
      expect(deleteOperationsAction).toBeDefined();

      // Verify success action was dispatched
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type,
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("deleting multiple operations", () => {
    it("deletes multiple operations of different types", async () => {
      const action = {
        payload: {
          operationIds: ["o1", "o2"],
        },
      };

      const mockState = createMockState({
        o1: { id: "o1", operationType: OPERATION_TYPE_PACK },
        o2: { id: "o2", operationType: OPERATION_TYPE_NO_OP },
      });

      const { effects } = await expectSaga(deleteOperationsWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .run();

      // Should have two deleteOperations calls (one per operation)
      const deleteOperationsActions = effects.put.filter(
        (effect) =>
          effect.payload.action.type === deleteOperationsFromSlice.type,
      );
      expect(deleteOperationsActions).toHaveLength(2);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type,
      );
      expect(successAction.payload.action.payload.operationIds).toHaveLength(2);
    });
  });

  describe("input normalization", () => {
    it("handles single operationId (not array)", async () => {
      const action = {
        payload: {
          operationIds: "o1", // Single ID, not array
        },
      };

      const mockState = createMockState({
        o1: {
          id: "o1",
          operationType: OPERATION_TYPE_NO_OP,
        },
      });

      const { effects } = await expectSaga(deleteOperationsWorker, action)
        .withState(mockState)
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type,
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("returns early for empty operationIds array", async () => {
      const action = {
        payload: {
          operationIds: [],
        },
      };

      const { effects } = await expectSaga(
        deleteOperationsWorker,
        action,
      ).run();

      // No actions should be dispatched
      expect(effects.put).toBeUndefined();
    });
  });
});
