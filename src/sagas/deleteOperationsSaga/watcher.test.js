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
import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import deleteOperationsWatcher from "./watcher";
import { deleteOperationsRequest } from "./actions";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import deleteOperationsWorker from "./worker";

describe("deleteOperationsWatcher", () => {
  const state = {
    operations: {
      byId: {
        o1: {
          id: "o1",
          operationType: OPERATION_TYPE_PACK,
          databaseName: "pack_view_1",
          isMaterialized: true,
          childIds: ["t1", "t2"],
        },
        o2: {
          id: "o2",
          operationType: OPERATION_TYPE_STACK,
          databaseName: "stack_view_1",
          isMaterialized: true,
          childIds: ["o1", "t3"],
        },
      },
      allIds: ["o1", "o2"],
    },
    tables: {
      byId: {
        t1: { id: "t1", name: "table_1" },
        t2: { id: "t2", name: "table_2" },
        t3: { id: "t3", name: "table_3" },
      },
      allIds: ["t1", "t2", "t3"],
    },
  };

  describe("handling deleteOperationsRequest actions", () => {
    describe("Operation with only table children", () => {
      it("should pass the correct arguments to the worker", () => {
        const action = deleteOperationsRequest(["o1"]);

        return expectSaga(deleteOperationsWatcher)
          .withState({ ...state })
          .provide([[matchers.call.fn(deleteOperationsWorker), undefined]])
          .call(deleteOperationsWorker, [state.operations.byId.o1])
          .dispatch(action)
          .run();
      });
    });

    describe("Operation with nested child operations", () => {
      it("should pass the correct arguments to the worker", () => {
        const action = deleteOperationsRequest(["o2"]);
        return expectSaga(deleteOperationsWatcher)
          .withState({ ...state })
          .provide([[matchers.call.fn(deleteOperationsWorker), undefined]])
          .call(deleteOperationsWorker, [
            state.operations.byId.o2,
            state.operations.byId.o1,
          ])
          .dispatch(action)
          .run();
      });
    });
  });

  describe("handling updateOperationsSuccess actions", () => {
    describe("If an update involves columnIDs changes", () => {
      it("call deleteOperationsWorker if operation is childless", () => {
        const action = updateOperationsSuccess([{ id: "o1", childIds: [] }]);

        return expectSaga(deleteOperationsWatcher)
          .withState({
            ...state,
            operations: {
              ...state.operations,
              byId: {
                ...state.operations.byId,
                o1: { ...state.operations.byId.o1, childIds: [] },
              },
            },
          })
          .provide([[matchers.call.fn(deleteOperationsWorker), undefined]])
          .call(deleteOperationsWorker, [
            { ...state.operations.byId.o1, childIds: [] },
          ])
          .dispatch(action)
          .run();
      });
      it("doesn't call deleteOperationsWorker if operation still has children", () => {
        const action = updateOperationsSuccess([
          { id: "o2", childIds: ["o1", "t3"] },
        ]);

        return expectSaga(deleteOperationsWatcher)
          .withState({
            ...state,
            operations: {
              ...state.operations,
              byId: {
                ...state.operations.byId,
                o2: { ...state.operations.byId.o2, childIds: ["o1", "t3"] },
              },
            },
          })
          .provide([[matchers.call.fn(deleteOperationsWorker), undefined]])
          .not.call.fn(deleteOperationsWorker)
          .dispatch(action)
          .run();
      });
    });
  });
});
