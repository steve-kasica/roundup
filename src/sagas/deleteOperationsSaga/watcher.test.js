/**
 * @fileoverview Tests for the delete operations saga watcher.
 * @module sagas/deleteOperationsSaga/watcher.test
 *
 * Comprehensive test suite for deleteOperationsWatcher covering:
 * - Basic watcher functionality (deleteOperationsRequest handling)
 * - Auto-deletion of childless operations (updateOperationsSuccess handling)
 * - Edge cases and action type matching
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import deleteOperationsWatcher from "./watcher";
import { deleteOperationsRequest, deleteOperationsSuccess } from "./actions";
import {
  deleteOperations as deleteOperationsFromSlice,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import { dropView } from "../../lib/duckdb";

/**
 * Helper to create a mock state with operations
 */
const createMockState = (operationsById = {}) => ({
  operations: {
    byId: operationsById,
    allIds: Object.keys(operationsById),
    rootOperationId: null,
  },
});

describe("deleteOperationsWatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("handling deleteOperationsRequest actions", () => {
    it("should invoke worker and delete PACK operation from state", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          databaseName: "pack_view_1",
        },
      });

      const action = deleteOperationsRequest({
        operationIds: ["o_1"],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action)
        .silentRun(100);

      // Verify deleteOperations was called from slice
      const deleteOperationsAction = effects.put.find(
        (effect) =>
          effect.payload.action.type === deleteOperationsFromSlice.type
      );
      expect(deleteOperationsAction).toBeDefined();

      // Verify success action was dispatched
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should invoke worker and delete STACK operation from state", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_STACK,
          databaseName: "stack_view_1",
        },
      });

      const action = deleteOperationsRequest({
        operationIds: ["o_1"],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.operationIds).toContain(
        "o_1"
      );
    });

    it("should delete NO_OP operation from state without dropping view", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_NO_OP,
        },
      });

      const action = deleteOperationsRequest({
        operationIds: ["o_1"],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .dispatch(action)
        .silentRun(100);

      // Verify deleteOperations was called from slice
      const deleteOperationsAction = effects.put.find(
        (effect) =>
          effect.payload.action.type === deleteOperationsFromSlice.type
      );
      expect(deleteOperationsAction).toBeDefined();

      // dropView should not be called for NO_OP
      const callEffects = effects.call || [];
      const dropViewCall = callEffects.find(
        (effect) => effect.payload?.fn === dropView
      );
      expect(dropViewCall).toBeUndefined();
    });

    it("should delete multiple operations", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          databaseName: "pack_1",
        },
        o_2: {
          id: "o_2",
          operationType: OPERATION_TYPE_STACK,
          databaseName: "stack_1",
        },
      });

      const action = deleteOperationsRequest({
        operationIds: ["o_1", "o_2"],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.operationIds).toContain(
        "o_1"
      );
      expect(successAction.payload.action.payload.operationIds).toContain(
        "o_2"
      );
    });

    it("should handle sequential deleteOperationsRequest actions", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          databaseName: "pack_1",
        },
        o_2: {
          id: "o_2",
          operationType: OPERATION_TYPE_STACK,
          databaseName: "stack_1",
        },
      });

      const action1 = deleteOperationsRequest({
        operationIds: ["o_1"],
      });

      const action2 = deleteOperationsRequest({
        operationIds: ["o_2"],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action1)
        .dispatch(action2)
        .silentRun(100);

      // Should have dispatched success twice
      const successActions = effects.put.filter(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type
      );
      expect(successActions).toHaveLength(2);
    });
    it("should recursively delete child operations", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          databaseName: "pack_1",
          childIds: ["o_2"],
        },
        o_2: {
          id: "o_2",
          operationType: OPERATION_TYPE_STACK,
          databaseName: "stack_1",
          childIds: [],
        },
      });

      const action = deleteOperationsRequest({
        operationIds: ["o_1"],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.operationIds).toContain(
        "o_1"
      );
      expect(successAction.payload.action.payload.operationIds).toContain(
        "o_2"
      );
    });
  });

  describe("handling updateOperationsSuccess actions", () => {
    it("should dispatch deleteOperationsRequest if operation becomes childless", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          childIds: [], // Now empty
        },
      });

      const action = updateOperationsSuccess({
        changedPropertiesById: {
          o_1: ["children"],
        },
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action)
        .silentRun(100);

      // Should dispatch deleteOperationsRequest for childless operation
      const deleteRequest = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === deleteOperationsRequest.type
      );
      expect(deleteRequest).toBeDefined();
      expect(deleteRequest.payload.action.payload.operationIds).toContain(
        "o_1"
      );
    });

    it("should not delete operation if it still has children", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          childIds: ["t_1", "t_2"], // Still has children
        },
      });

      const action = updateOperationsSuccess({
        changedPropertiesById: {
          o_1: ["children"],
        },
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .dispatch(action)
        .silentRun(100);

      // Should not dispatch deleteOperationsRequest
      const deleteRequest = effects.put?.find(
        (effect) =>
          effect.payload?.action?.type === deleteOperationsRequest.type
      );
      expect(deleteRequest).toBeUndefined();
    });

    it("should not trigger deletion when non-children properties change", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          childIds: [],
        },
      });

      const action = updateOperationsSuccess({
        changedPropertiesById: {
          o_1: ["name", "joinType"], // Not "children"
        },
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .dispatch(action)
        .silentRun(100);

      // Should not dispatch deleteOperationsRequest since "children" not changed
      const deleteRequest = effects.put?.find(
        (effect) =>
          effect.payload?.action?.type === deleteOperationsRequest.type
      );
      expect(deleteRequest).toBeUndefined();
    });

    it("should handle multiple operations becoming childless", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          childIds: [],
        },
        o_2: {
          id: "o_2",
          operationType: OPERATION_TYPE_STACK,
          childIds: [],
        },
      });

      const action = updateOperationsSuccess({
        changedPropertiesById: {
          o_1: ["children"],
          o_2: ["children"],
        },
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action)
        .silentRun(100);

      const deleteRequest = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === deleteOperationsRequest.type
      );
      expect(deleteRequest).toBeDefined();
      expect(deleteRequest.payload.action.payload.operationIds).toContain(
        "o_1"
      );
      expect(deleteRequest.payload.action.payload.operationIds).toContain(
        "o_2"
      );
    });

    it("should only delete childless operations when some have children and some don't", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          childIds: [], // Empty - should be deleted
        },
        o_2: {
          id: "o_2",
          operationType: OPERATION_TYPE_STACK,
          childIds: ["t_1"], // Has children - should not be deleted
        },
      });

      const action = updateOperationsSuccess({
        changedPropertiesById: {
          o_1: ["children"],
          o_2: ["children"],
        },
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action)
        .silentRun(100);

      const deleteRequest = effects.put.find(
        (effect) =>
          effect.payload?.action?.type === deleteOperationsRequest.type
      );
      expect(deleteRequest).toBeDefined();
      expect(deleteRequest.payload.action.payload.operationIds).toContain(
        "o_1"
      );
      expect(deleteRequest.payload.action.payload.operationIds).not.toContain(
        "o_2"
      );
    });
  });

  describe("action type matching", () => {
    it("should only respond to deleteOperationsRequest action type", async () => {
      const unrelatedAction = { type: "UNRELATED_ACTION", payload: {} };

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(createMockState())
        .dispatch(unrelatedAction)
        .silentRun(100);

      // Should not have dispatched any delete-related actions
      const deleteAction = effects.put?.find(
        (effect) =>
          effect.payload?.action?.type === deleteOperationsFromSlice.type
      );

      expect(deleteAction).toBeUndefined();
    });

    it("should not respond to deleteOperationsSuccess action for worker triggering", async () => {
      const successAction = deleteOperationsSuccess({
        operationIds: ["o_1"],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(createMockState())
        .dispatch(successAction)
        .silentRun(100);

      // Should not have dispatched deleteOperations from slice
      const deleteAction = effects.put?.find(
        (effect) =>
          effect.payload?.action?.type === deleteOperationsFromSlice.type
      );

      expect(deleteAction).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle empty operationIds array in request", async () => {
      const action = deleteOperationsRequest({
        operationIds: [],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(createMockState())
        .dispatch(action)
        .silentRun(100);

      // Should not dispatch success for empty array
      const successAction = effects.put?.find(
        (effect) =>
          effect.payload?.action?.type === deleteOperationsSuccess.type
      );
      expect(successAction).toBeUndefined();
    });

    it("should handle mixed operation types in single request", async () => {
      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          databaseName: "pack_1",
        },
        o_2: {
          id: "o_2",
          operationType: OPERATION_TYPE_NO_OP,
        },
        o_3: {
          id: "o_3",
          operationType: OPERATION_TYPE_STACK,
          databaseName: "stack_1",
        },
      });

      const action = deleteOperationsRequest({
        operationIds: ["o_1", "o_2", "o_3"],
      });

      const { effects } = await expectSaga(deleteOperationsWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropView), undefined]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.operationIds).toHaveLength(3);
    });
  });
});
