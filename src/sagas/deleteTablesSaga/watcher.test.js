/**
 * @fileoverview Tests for the delete tables saga watcher.
 * @module sagas/deleteTablesSaga/watcher.test
 *
 * Comprehensive test suite for deleteTablesSagaWatcher covering:
 * - Basic watcher functionality (deleteTablesRequest handling)
 * - Auto-deletion of tables with empty columnIds (updateTablesSuccess handling)
 * - Edge cases and action type matching
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import deleteTablesSagaWatcher from "./watcher";
import { deleteTablesRequest } from "./actions";
import deleteTablesWorker from "./worker";
import { updateTablesSuccess } from "../updateTablesSaga";
import { deleteOperationsSuccess } from "../deleteOperationsSaga/actions";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";

describe("deleteTablesSagaWatcher", () => {
  const state = {
    tables: {
      byId: {
        t1: {
          id: "t1",
          name: "Table 1",
          columnIds: ["c1", "c2"],
        },
        t2: {
          id: "t2",
          name: "Table 2",
          columnIds: ["c3", "c4"],
        },
        t3: {
          id: "t3",
          name: "Table 3",
          columnIds: ["c5", "c6"],
        },
      },
      allIds: ["t1", "t2", "t3"],
    },
    columns: {
      byId: {
        c1: { id: "c1", name: "Column 1" },
        c2: { id: "c2", name: "Column 2" },
        c3: { id: "c3", name: "Column 3" },
        c4: { id: "c4", name: "Column 4" },
        c5: { id: "c5", name: "Column 5" },
        c6: { id: "c6", name: "Column 6" },
      },
      allIds: ["c1", "c2", "c3", "c4", "c5", "c6"],
    },
    operations: {
      byId: {
        o1: {
          id: "o1",
          operationType: OPERATION_TYPE_STACK,
          name: "Operation 1",
          childIds: ["t1", "t2"],
        },
        o2: {
          id: "o2",
          operationType: OPERATION_TYPE_PACK,
          name: "Operation 2",
          childIds: ["o1", "t3"],
        },
      },
      allIds: ["o1", "o2"],
    },
  };

  describe("handling deleteTablesRequest actions", () => {
    const action = deleteTablesRequest(["t1"]);
    it("should pass table objects to worker", () => {
      return expectSaga(deleteTablesSagaWatcher)
        .withState({ ...state })
        .provide([[matchers.call.fn(deleteTablesWorker), undefined]])
        .call(deleteTablesWorker, [state.tables.byId.t1])
        .dispatch(action)
        .run();
    });
  });

  describe("handling updateTablesSuccess actions", () => {
    it("should trigger deletion when columnIds are empty", () => {
      const action = updateTablesSuccess([{ id: "t1", columnIds: [] }]);
      return expectSaga(deleteTablesSagaWatcher)
        .withState({
          ...state,
          tables: {
            ...state.tables,
            byId: {
              ...state.tables.byId,
              t1: {
                ...state.tables.byId.t1,
                columnIds: [],
              },
            },
          },
        })
        .provide([[matchers.call.fn(deleteTablesWorker), undefined]])
        .call(deleteTablesWorker, [{ ...state.tables.byId.t1, columnIds: [] }])
        .dispatch(action)
        .run();
    });

    it("should not trigger deletion when columnIds is not empty", () => {
      const action = updateTablesSuccess([
        { id: "t1", columnIds: ["c1", "c2"] },
      ]);
      return expectSaga(deleteTablesSagaWatcher)
        .withState({ ...state })
        .provide([[matchers.call.fn(deleteTablesWorker), undefined]])
        .not.call.fn(deleteTablesWorker)
        .dispatch(action)
        .run();
    });

    it("should not trigger deletion when other properties have changed", () => {
      const action = updateTablesSuccess([
        { id: "t1", name: "New Table Name" },
      ]);
      return expectSaga(deleteTablesSagaWatcher)
        .withState({ ...state })
        .provide([[matchers.call.fn(deleteTablesWorker), undefined]])
        .not.call.fn(deleteTablesWorker)
        .dispatch(action)
        .run();
    });
  });

  describe("handling deleteOperationsSuccess actions", () => {
    it("should not pass child tables to worker", () => {
      const action = deleteOperationsSuccess([{ ...state.operations.byId.o2 }]);
      const postActionState = {
        ...state,
        operations: {
          byId: { ...state.operations.byId.o1 },
          allIds: ["o1"],
        },
      };
      return expectSaga(deleteTablesSagaWatcher)
        .withState(postActionState)
        .provide([[matchers.call.fn(deleteTablesWorker), undefined]])
        .not.call(deleteTablesWorker, [state.tables.byId.t3])
        .dispatch(action)
        .run();
    });
  });
});
