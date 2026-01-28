/**
 * @file deleteColumnsSaga watcher tests
 * @module sagas/deleteColumnsSaga/watcher.test
 *
 * Tests for the deleteColumnsSaga watcher, ensuring it correctly
 * responds to delete column requests and related actions by dispatching
 * appropriate worker sagas with the correct parameters.
 *
 * Scenarios tested:
 * - Direct deleteColumnsRequest actions for table columns
 * - Recursive deletion for operation columns (PACK and STACK types)
 * - Handling of orphaned columns after operation updates
 * - Deletion of columns when parent tables are deleted
 */
import { beforeEach, describe, expect, it } from "vitest";
import { deleteColumnsRequest } from "./actions";
import deleteColumnsWatcher from "./watcher";
import deleteColumnsWorker from "./worker";
import { expectSaga } from "redux-saga-test-plan";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { deleteOperationsSuccess } from "../deleteOperationsSaga/actions";
import { updateOperationsSuccess } from "../updateOperationsSaga";

describe("deleteColumnsSaga watcher", () => {
  describe("handling deleteColumnsRequest actions", () => {
    describe("ColumnIds belonging to a table", () => {
      const state = {
        columns: {
          byId: {
            c1: {
              id: "c1",
              parentId: "t1",
            },
            c2: {
              id: "c2",
              parentId: "t1",
            },
            c3: {
              id: "c3",
              parentId: "t1",
            },
          },
          allIds: ["c1", "c2", "c3"],
        },
        tables: {
          byId: {
            t1: {
              id: "t1",
            },
          },
          allIds: ["t1"],
        },
        operations: {
          byId: {},
          allIds: [],
        },
      };
      it("should pass the appropriate parameters to deleteColumnsWorker", async () => {
        const action = deleteColumnsRequest(["c1", "c2"]);

        await expectSaga(deleteColumnsWatcher)
          .withState(state)
          .call(
            deleteColumnsWorker,
            [
              {
                parentId: "t1",
                id: "c1",
              },
              {
                parentId: "t1",
                id: "c2",
              },
            ],
            true,
          )
          .dispatch(action)
          .silentRun(100);
      });
    });
    describe("ColumnIds belonging to a stack operation", () => {
      const state = {
        columns: {
          byId: {
            c1: {
              id: "c1",
              parentId: "t1",
            },
            c2: {
              id: "c2",
              parentId: "t1",
            },
            c3: {
              id: "c3",
              parentId: "t1",
            },
            c4: {
              id: "c4",
              parentId: "t2",
            },
            c5: {
              id: "c5",
              parentId: "t2",
            },
            c6: {
              id: "c6",
              parentId: "t2",
            },
            c7: {
              id: "c7",
              parentId: "o1",
            },
            c8: {
              id: "c8",
              parentId: "o1",
            },
            c9: {
              id: "c9",
              parentId: "o1",
            },
          },
          allIds: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9"],
        },
        tables: {
          byId: {
            t1: {
              id: "t1",
              columnIds: ["c1", "c2", "c3"],
              parentId: "o1",
            },
            t2: {
              id: "t2",
              columnIds: ["c4", "c5", "c6"],
              parentId: "o1",
            },
          },
          allIds: ["t1", "t2"],
        },
        operations: {
          byId: {
            o1: {
              id: "o1",
              operationType: OPERATION_TYPE_STACK,
              childIds: ["t1", "t2"],
              columnIds: ["c7", "c8", "c9"],
              isMaterialized: true,
            },
          },
          allIds: ["o1"],
        },
      };
      it("should pass the appropriate parameters to deleteColumnsWorker", async () => {
        const action = deleteColumnsRequest(["c7"]);

        await expectSaga(deleteColumnsWatcher)
          .withState(state)
          .call(
            deleteColumnsWorker,
            [
              { parentId: "o1", id: "c7" },
              { parentId: "t1", id: "c1" },
              { parentId: "t2", id: "c4" },
            ],
            true,
          )
          .dispatch(action)
          .run();
      });
    });
    describe("ColumnIds belonging to a pack operation", () => {
      const state = {
        columns: {
          byId: {
            c1: {
              id: "c1",
              parentId: "t1",
            },
            c2: {
              id: "c2",
              parentId: "t1",
            },
            c3: {
              id: "c3",
              parentId: "t2",
            },
            c4: {
              id: "c4",
              parentId: "t2",
            },
            c5: {
              id: "c5",
              parentId: "o1",
            },
            c6: {
              id: "c6",
              parentId: "o1",
            },
            c7: {
              id: "c7",
              parentId: "o1",
            },
            c8: {
              id: "c8",
              parentId: "o1",
            },
          },
          allIds: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"],
        },
        tables: {
          byId: {
            t1: {
              id: "t1",
              columnIds: ["c1", "c2"],
              parentId: "o1",
            },
            t2: {
              id: "t2",
              columnIds: ["c3", "c4"],
              parentId: "o1",
            },
          },
          allIds: ["t1", "t2"],
        },
        operations: {
          byId: {
            o1: {
              id: "o1",
              operationType: OPERATION_TYPE_PACK,
              childIds: ["t1", "t2"],
              columnIds: ["c5", "c6", "c7", "c8"],
              isMaterialized: true,
            },
          },
          allIds: ["o1"],
        },
      };

      it("should pass the appropriate parameters to deleteColumnsWorker", async () => {
        const action = deleteColumnsRequest(["c6"]);

        await expectSaga(deleteColumnsWatcher)
          .withState(state)
          .call(
            deleteColumnsWorker,
            [
              { parentId: "o1", id: "c6" },
              { parentId: "t1", id: "c2" },
            ],
            true,
          )
          .dispatch(action)
          .run();
      });
    });
  });

  describe("handling deleteTablesSuccess actions", () => {
    const state = {
      columns: {
        byId: {
          c1: {
            id: "c1",
            parentId: "t1",
          },
          c2: {
            id: "c2",
            parentId: "t1",
          },
          c3: {
            id: "c3",
            parentId: "t2",
          },
        },
        allIds: ["c1", "c2", "c3"],
      },
      tables: {
        byId: {
          t1: {
            id: "t1",
            columnIds: ["c1", "c2"],
          },
          t2: {
            id: "t2",
            columnIds: ["c3"],
          },
        },
        allIds: ["t1", "t2"],
      },
      operations: {
        byId: {},
        allIds: [],
      },
    };
    it("should pass the appropriate parameters to deleteColumnsWorker", async () => {
      const action = deleteTablesSuccess([state.tables.byId.t1]);

      await expectSaga(deleteColumnsWatcher)
        .withState(state)
        .call(
          deleteColumnsWorker,
          [
            { parentId: "t1", id: "c1" },
            { parentId: "t1", id: "c2" },
          ],
          false,
        )
        .dispatch(action)
        .run();
    });
  });
  describe("handling deleteOperationsSuccess actions", () => {
    const state = {
      columns: {
        byId: {
          c1: {
            id: "c1",
            parentId: "o1",
          },
          c2: {
            id: "c2",
            parentId: "o1",
          },
          c3: {
            id: "c3",
            parentId: "o2",
          },
        },
        allIds: ["c1", "c2", "c3"],
      },
      tables: {
        byId: {},
        allIds: [],
      },
      operations: {
        byId: {
          o1: {
            id: "o1",
            columnIds: ["c1", "c2"],
          },
          o2: {
            id: "o2",
            columnIds: ["c3"],
          },
        },
        allIds: ["o1", "o2"],
      },
    };

    it("should dispatch deleteColumnsRequest with the appropriate parameters", async () => {
      const action = deleteOperationsSuccess([state.operations.byId.o1]);

      await expectSaga(deleteColumnsWatcher)
        .withState(state)
        .call(deleteColumnsWorker, ["c1", "c2"], false)
        .dispatch(action)
        .run();
    });
  });

  describe("handling updateOperationsSuccess actions", () => {
    const state = {
      columns: {
        byId: {
          c1: {
            id: "c1",
            parentId: "o1",
          },
          c2: {
            id: "c2",
            parentId: "o1",
          },
          c3: {
            id: "c3",
            parentId: "o2",
          },
        },
        allIds: ["c1", "c2", "c3"],
      },
      tables: {
        byId: {},
        allIds: [],
      },
      operations: {
        byId: {
          o1: {
            id: "o1",
            columnIds: ["c1"], // c2 has been removed from columnIds, making it orphaned
          },
          o2: {
            id: "o2",
            columnIds: ["c3"],
          },
        },
        allIds: ["o1", "o2"],
      },
    };
    describe("when the columnIds property has changed", () => {
      it("should call deleteColumnsWorker with the appropriate parameters", async () => {
        const action = updateOperationsSuccess({
          changedPropertiesById: { o1: ["columnIds"] },
        });

        await expectSaga(deleteColumnsWatcher)
          .withState(state)
          .call(deleteColumnsWorker, ["c2"], false)
          .dispatch(action)
          .run();
      });
    });
  });
});
