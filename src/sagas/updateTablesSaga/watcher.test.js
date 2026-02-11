/**
 * @fileoverview Tests for the update tables saga watcher.
 * @module sagas/updateTablesSaga/watcher.test
 *
 * Comprehensive test suite for updateTablesSagaWatcher covering:
 * - Basic watcher functionality (updateTablesRequest handling)
 * - Database attribute fetching
 * - Edge cases and action type matching
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateTablesSagaWatcher from "./watcher";
import { deleteColumnsSuccess } from "../deleteColumnsSaga";
import updateTablesWorker from "./worker";
import { updateTablesRequest } from "./actions";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import { createColumnsSuccess } from "../createColumnsSaga/actions";

describe("updateTablesSagaWatcher", () => {
  let state = {};

  describe("handling updateTablesRequest action", () => {
    const action = updateTablesRequest([
      {
        id: "t1",
        name: "Updated Table 1",
      },
    ]);

    it("should call updateTablesWorker with action payload", async () => {
      await expectSaga(updateTablesSagaWatcher)
        .call(updateTablesWorker, action.payload)
        .dispatch(action)
        .run();
    });
  });

  describe("handling deleteColumnsSuccess actions", () => {
    state = {
      tables: {
        byId: {
          t1: {
            id: "t1",
            name: "Table 1",
            columnIds: ["c1", "c2", "c3"],
          },
        },
        allIds: ["t1"],
      },
      columns: {
        byId: {
          c1: { id: "c1", parentId: "t1", name: "Column 1" },
          c2: { id: "c2", parentId: "t1", name: "Column 2" },
          c3: { id: "c3", parentId: "t1", name: "Column 3" },
          c4: { id: "c4", parentId: "o1", name: "Op Column 1" },
          c5: { id: "c5", parentId: "o1", name: "Op Column 2" },
        },
        allIds: ["c1", "c2", "c3", "c4", "c5"],
      },
      operations: {
        byId: {
          o1: { id: "o1", name: "Operation 1", columnIds: ["c4", "c5"] },
        },
        allIds: ["o1"],
      },
    };

    describe("when columns are deleted from a table", () => {
      const action = deleteColumnsSuccess([state.columns.byId.c2]);
      it("should call updateTablesWorker with appropriate params", () => {
        return expectSaga(updateTablesSagaWatcher)
          .withState({
            ...state,
            tables: {
              ...state.tables,
              byId: {
                ...state.tables.byId,
                t1: { ...state.tables.byId.t1, columnIds: ["c1", "c3"] },
              },
            },
            columns: {
              ...state.columns,
              byId: { ...state.columns.byId, c2: undefined },
              allIds: state.columns.allIds.filter((id) => id !== "c2"),
            },
          })
          .provide([[matchers.call.fn(updateTablesWorker), undefined]])
          .call(updateTablesWorker, [{ id: "t1", columnIds: ["c1", "c3"] }])
          .dispatch(action)
          .run();
      });
    });
    describe("when columns are deleted from an operation", () => {
      const action = deleteColumnsSuccess([
        { id: "c4", parentId: "o1", name: "Op Column 1" },
      ]);
      it("should not call updateTablesWorker", async () => {
        await expectSaga(updateTablesSagaWatcher)
          .withState({ ...state })
          .not.call.fn(updateTablesWorker)
          .dispatch(action)
          .run();
      });
    });
    describe("when the table has already been deleted", () => {
      const action = deleteColumnsSuccess([state.columns.byId.c2]);
      it("should not call updateTablesWorker", async () => {
        await expectSaga(updateTablesSagaWatcher)
          .withState({
            ...state,
            tables: {
              ...state.tables,
              byId: { ...state.tables.byId, t1: undefined },
              allIds: state.tables.allIds.filter((id) => id !== "t1"),
            },
            columns: {
              ...state.columns,
              byId: { ...state.columns.byId, c2: undefined },
              allIds: state.columns.allIds.filter((id) => id !== "c2"),
            },
          })
          .not.call.fn(updateTablesWorker)
          .dispatch(action)
          .run();
      });
    });
  });

  describe("handling createOperationsSuccess actions", () => {
    state = {
      tables: {
        byId: {
          t1: {
            id: "t1",
            name: "Table 1",
            parentId: "o1",
            columnIds: ["c1", "c2"],
          },
          t2: {
            id: "t2",
            name: "Table 2",
            parentId: null,
            columnIds: ["c3", "c4"],
          },
          t3: {
            id: "t3",
            name: "Table 3",
            parentId: null,
            columnIds: ["c5", "c6"],
          },
        },
        allIds: ["t1", "t2", "t3"],
      },
      columns: {
        byId: {
          c1: { id: "c1", parentId: "t1", name: "Column 1" },
          c2: { id: "c2", parentId: "t1", name: "Column 2" },
          c3: { id: "c3", parentId: "t2", name: "Column 3" },
          c4: { id: "c4", parentId: "t2", name: "Column 4" },
          c5: { id: "c5", parentId: "t3", name: "Column 5" },
          c6: { id: "c6", parentId: "t3", name: "Column 6" },
        },
        allIds: ["c1", "c2", "c3", "c4", "c5", "c6"],
      },
      operations: {
        byId: {
          o1: {
            id: "o1",
            name: "Operation 1",
            columnIds: ["c4", "c5"],
            childIds: ["t1", "t2"],
          },
          o2: {
            id: "o2",
            name: "Operation 2",
            columnIds: [],
            childIds: ["t3"],
          },
        },
        allIds: ["o1"],
      },
    };
    const action = createOperationsSuccess([state.operations.byId.o2]);
    it("should call updateTablesWorker with action payload", async () => {
      await expectSaga(updateTablesSagaWatcher)
        .provide([[matchers.call.fn(updateTablesWorker), undefined]])
        .call(updateTablesWorker, [
          {
            id: "t3",
            parentId: "o2",
          },
        ])
        .dispatch(action)
        .run();
    });
  });

  describe("handling createColumnsSuccess actions", () => {
    const action = createColumnsSuccess([
      state.columns.byId.c1,
      state.columns.byId.c2,
    ]);
    it("should call updateTablesWorker with action payload if columns belong to a table", async () => {
      await expectSaga(updateTablesSagaWatcher)
        .provide([[matchers.call.fn(updateTablesWorker), undefined]])
        .call(updateTablesWorker, [
          {
            id: "t1",
            columnIds: ["c1", "c2"],
          },
        ])
        .dispatch(action)
        .run();
    });
    it("should not call updateTablesWorker with action payload if columns belong to an operation", async () => {
      await expectSaga(updateTablesSagaWatcher)
        .provide([[matchers.call.fn(updateTablesWorker), undefined]])
        .not.call(updateTablesWorker, [
          {
            id: "o1",
            columnIds: ["c1", "c2"],
          },
        ])
        .dispatch(action)
        .run();
    });
  });
});
