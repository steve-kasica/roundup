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
import updateTablesSagaWatcher from "./watcher";
import { deleteColumnsSuccess } from "../deleteColumnsSaga";
import updateTablesWorker from "./worker";
import { updateTablesRequest } from "./actions";

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
      const action = deleteColumnsSuccess([
        { id: "c2", parentId: "t1", name: "Column 2" },
      ]);
      it("should call updateTablesWorker with appropriate params", async () => {
        await expectSaga(updateTablesSagaWatcher)
          .withState(state)
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
          .withState(state)
          .not.call.fn(updateTablesWorker)
          .dispatch(action)
          .run();
      });
    });
  });
});
