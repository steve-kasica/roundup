/**
 * @fileoverview Tests for the create operations saga watcher.
 * @module sagas/createOperationsSaga/watcher.test
 *
 * Comprehensive test suite for createOperationsWatcher covering:
 * - Basic watcher functionality
 * - Worker invocation with correct parameters
 * - Handling of different operation types
 * - Multiple operation creation requests
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import createOperationsWatcher from "./watcher";
import { createOperationsRequest, createOperationsSuccess } from "./actions";
import {
  addOperations as addOperationsToSlice,
  updateOperations as updateOperationsSlice,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { updateTables as updateTablesSlice } from "../../slices/tablesSlice";
import { setFocusedObjectId } from "../../slices/uiSlice";

// Mock generateUUID to return predictable values
vi.mock("../../lib/utilities/generateUUID", () => ({
  default: vi.fn((prefix) => `${prefix}mock-uuid`),
}));

describe("createOperationsWatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic watcher functionality", () => {
    it("should invoke worker and dispatch addOperations when createOperationsRequest is dispatched", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t_1", "t_2"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      // Verify addOperations was dispatched (worker effect)
      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );

      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations).toHaveLength(1);
      expect(operations[0].operationType).toBe(OPERATION_TYPE_PACK);
    });

    it("should dispatch createOperationsSuccess after processing request", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t_1", "t_2", "t_3"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === createOperationsSuccess.type
      );

      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.operationIds).toHaveLength(1);
    });
  });

  describe("PACK operation creation", () => {
    it("should create a PACK operation with two table children", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t_1", "t_2"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );

      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations[0]).toMatchObject({
        operationType: OPERATION_TYPE_PACK,
        childIds: ["t_1", "t_2"],
      });
    });

    it("should update table parentIds for PACK operation with table children", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t_1", "t_2"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );

      expect(updateTablesAction).toBeDefined();
      expect(updateTablesAction.payload.action.payload).toHaveLength(2);
      expect(updateTablesAction.payload.action.payload[0].id).toBe("t_1");
      expect(updateTablesAction.payload.action.payload[1].id).toBe("t_2");
    });

    it("should update operation parentIds for PACK operation with operation children", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["o_1", "o_2"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const updateOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSlice.type
      );

      expect(updateOperationsAction).toBeDefined();
      expect(updateOperationsAction.payload.action.payload).toHaveLength(2);
      expect(updateOperationsAction.payload.action.payload[0].id).toBe("o_1");
      expect(updateOperationsAction.payload.action.payload[1].id).toBe("o_2");
    });
  });

  describe("STACK operation creation", () => {
    it("should create a STACK operation with multiple table children", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t_1", "t_2", "t_3", "t_4"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );

      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations[0]).toMatchObject({
        operationType: OPERATION_TYPE_STACK,
        childIds: ["t_1", "t_2", "t_3", "t_4"],
      });
    });

    it("should create a STACK operation with two tables", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t_1", "t_2"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );

      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations[0].childIds).toEqual(["t_1", "t_2"]);
    });

    it("should update table parentIds for STACK operation", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t_1", "t_2", "t_3"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );

      expect(updateTablesAction).toBeDefined();
      expect(updateTablesAction.payload.action.payload).toHaveLength(3);
    });
  });

  describe("multiple operations creation", () => {
    it("should handle array of operation data for batch creation", async () => {
      const action = createOperationsRequest({
        operationData: [
          {
            operationType: OPERATION_TYPE_PACK,
            childIds: ["t_1", "t_2"],
          },
          {
            operationType: OPERATION_TYPE_STACK,
            childIds: ["t_3", "t_4", "t_5"],
          },
        ],
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );

      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations).toHaveLength(2);
      expect(operations[0].operationType).toBe(OPERATION_TYPE_PACK);
      expect(operations[1].operationType).toBe(OPERATION_TYPE_STACK);
    });

    it("should dispatch success with multiple operation IDs for batch creation", async () => {
      const action = createOperationsRequest({
        operationData: [
          {
            operationType: OPERATION_TYPE_PACK,
            childIds: ["t_1", "t_2"],
          },
          {
            operationType: OPERATION_TYPE_STACK,
            childIds: ["t_3", "t_4"],
          },
        ],
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === createOperationsSuccess.type
      );

      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.operationIds).toHaveLength(2);
    });

    it("should handle multiple sequential createOperationsRequest actions", async () => {
      const action1 = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t_1", "t_2"],
        },
      });

      const action2 = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t_3", "t_4"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action1)
        .dispatch(action2)
        .silentRun(100);

      // Should have dispatched addOperations twice
      const addOperationsActions = effects.put.filter(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );

      expect(addOperationsActions).toHaveLength(2);

      // Should have dispatched createOperationsSuccess twice
      const successActions = effects.put.filter(
        (effect) =>
          effect.payload?.action?.type === createOperationsSuccess.type
      );

      expect(successActions).toHaveLength(2);
    });
  });

  describe("edge cases", () => {
    it("should handle operation data with empty childIds array", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_STACK,
          childIds: [],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );

      expect(addOperationsAction).toBeDefined();
      const operations = addOperationsAction.payload.action.payload;
      expect(operations[0].childIds).toEqual([]);

      // updateTables should be called with empty array
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction.payload.action.payload).toEqual([]);
    });

    it("should handle mixed table and operation children", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t_1", "o_1"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      // Should update tables for t_1
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction.payload.action.payload).toHaveLength(1);
      expect(updateTablesAction.payload.action.payload[0].id).toBe("t_1");

      // Should update operations for o_1
      const updateOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSlice.type
      );
      expect(updateOperationsAction.payload.action.payload).toHaveLength(1);
      expect(updateOperationsAction.payload.action.payload[0].id).toBe("o_1");
    });
  });

  describe("focus behavior", () => {
    it("should set focused object ID to the created operation", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t_1", "t_2"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const setFocusAction = effects.put.find(
        (effect) => effect.payload.action.type === setFocusedObjectId.type
      );

      expect(setFocusAction).toBeDefined();

      // Get the created operation ID from addOperations
      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );
      const createdOperationId =
        addOperationsAction.payload.action.payload[0].id;

      expect(setFocusAction.payload.action.payload).toBe(createdOperationId);
    });

    it("should set focused object ID to the last created operation in batch", async () => {
      const action = createOperationsRequest({
        operationData: [
          {
            operationType: OPERATION_TYPE_PACK,
            childIds: ["t_1", "t_2"],
          },
          {
            operationType: OPERATION_TYPE_STACK,
            childIds: ["t_3", "t_4"],
          },
        ],
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const setFocusAction = effects.put.find(
        (effect) => effect.payload.action.type === setFocusedObjectId.type
      );

      // Get the created operations from addOperations
      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );
      const lastOperationId = addOperationsAction.payload.action.payload[1].id;

      expect(setFocusAction.payload.action.payload).toBe(lastOperationId);
    });
  });

  describe("action type matching", () => {
    it("should only respond to createOperationsRequest action type", async () => {
      // Dispatch an unrelated action
      const unrelatedAction = { type: "UNRELATED_ACTION", payload: {} };

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(unrelatedAction)
        .silentRun(100);

      // Should not have dispatched addOperations
      const addOperationsAction = effects.put?.find(
        (effect) => effect.payload?.action?.type === addOperationsToSlice.type
      );

      expect(addOperationsAction).toBeUndefined();
    });

    it("should not respond to createOperationsSuccess action", async () => {
      const successAction = createOperationsSuccess({
        operationIds: ["o_1"],
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(successAction)
        .silentRun(100);

      // Should not have dispatched addOperations
      const addOperationsAction = effects.put?.find(
        (effect) => effect.payload?.action?.type === addOperationsToSlice.type
      );

      expect(addOperationsAction).toBeUndefined();
    });
  });

  describe("database name generation", () => {
    it("should generate a unique database name for each operation", async () => {
      const action = createOperationsRequest({
        operationData: {
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t_1", "t_2"],
        },
      });

      const { effects } = await expectSaga(createOperationsWatcher)
        .dispatch(action)
        .silentRun(100);

      const addOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === addOperationsToSlice.type
      );

      const operation = addOperationsAction.payload.action.payload[0];
      expect(operation.databaseName).toBeDefined();
      expect(operation.databaseName).toBe("o_mock-uuid");
    });
  });
});
