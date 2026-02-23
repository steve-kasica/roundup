import { describe, it, beforeEach } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateOperationsWatcher from "./watcher";
import updateOperationsWorker from "./worker";
import { updateOperationsRequest } from "./actions";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import { updateTablesSuccess } from "../updateTablesSaga";

describe("updateOperationsSaga watcher", () => {
  let state, action;
  beforeEach(() => {
    state = {
      operations: {
        byId: {
          o1: {
            id: "o1",
            operationType: OPERATION_TYPE_STACK,
            columnIds: ["c1", "c2"],
            childIds: ["t1", "t2"],
            isMaterialized: true,
            isInSync: true,
          },
        },
        allIds: ["o1"],
      },
      tables: {
        byId: {
          t1: {
            id: "t1",
            parentId: "o1",
            name: "Table 1",
          },
          t2: {
            id: "t2",
            parentId: "o1",
            name: "Table 2",
          },
          t3: {
            id: "t3",
            parentId: null,
            name: "Table 3",
          },
        },
        allIds: ["t1", "t2", "t3"],
      },
      columns: {
        byId: {
          c1: {
            id: "c1",
            parentId: "o1",
            name: "Column 1",
          },
          c2: {
            id: "c2",
            parentId: "o1",
            name: "Column 2",
          },
        },
        allIds: ["c1", "c2"],
      },
    };
  });
  describe("handling updateOperationsRequest actions", () => {
    beforeEach(() => {
      action = updateOperationsRequest([{ id: "o1", name: "stack" }]);
    });
    it("should call worker saga with correct payload", () => {
      return expectSaga(updateOperationsWatcher)
        .withState(state)
        .dispatch(action)
        .call(updateOperationsWorker, action.payload)
        .run();
    });
    it("should set isInSync to false if operation is materialized and update includes schema changes", () => {
      action = updateOperationsRequest([{ id: "o1", childIds: ["t1"] }]);
      return expectSaga(updateOperationsWatcher)
        .withState(state)
        .provide([
          [
            matchers.select.selector(selectOperationsById),
            state.operations.byId.o1,
          ],
        ])
        .call(updateOperationsWorker, [
          {
            id: "o1",
            childIds: ["t1"],
            isInSync: false,
          },
        ])
        .dispatch(action)
        .run();
    });
  });

  describe("handling deleteTablesSuccess actions", () => {
    beforeEach(() => {
      action = deleteTablesSuccess([
        { id: "t1", name: "Table 1", parentId: "o1" },
      ]);
    });

    it("should call worker saga with correct payload if tables was an operation child", () => {
      return expectSaga(updateOperationsWatcher)
        .withState(state)
        .provide([[matchers.call.fn(updateOperationsWorker), null]])
        .call(updateOperationsWorker, [
          {
            id: "o1",
            childIds: ["t2"],
            isInSync: false,
          },
        ])
        .dispatch(action)
        .run();
    });

    it("should call worker saga with correct payload if tables was an unmaterialized operation child", () => {
      return expectSaga(updateOperationsWatcher)
        .withState({
          ...state,
          operations: {
            byId: {
              o1: {
                ...state.operations.byId.o1,
                isMaterialized: false,
                isInSync: true,
              },
            },
            allIds: state.operations.allIds,
          },
        })
        .provide([[matchers.call.fn(updateOperationsWorker), null]])
        .call(updateOperationsWorker, [
          {
            id: "o1",
            childIds: ["t2"],
            isInSync: true,
          },
        ])
        .dispatch(action)
        .run();
    });

    it("should not call worker saga if deleted table was not an operation child", () => {
      action = deleteTablesSuccess([
        { id: "t3", name: "Table 3", parentId: null },
      ]);
      return expectSaga(updateOperationsWatcher)
        .withState(state)
        .provide([[matchers.call.fn(updateOperationsWorker), null]])
        .not.call(updateOperationsWorker)
        .dispatch(action)
        .run();
    });
  });

  describe("handling createOperationsSuccess actions", () => {
    let localState;
    beforeEach(() => {
      localState = {
        ...state,
        operations: {
          byId: {
            ...state.operations.byId,
            o2: {
              id: "o2",
              operationType: OPERATION_TYPE_PACK,
              childIds: ["o1", "t3"],
            },
          },
          allIds: [...state.operations.allIds, "o2"],
        },
      };
      action = createOperationsSuccess([localState.operations.byId.o2]);
    });
    it("should call worker saga with correct payload", () => {
      return expectSaga(updateOperationsWatcher)
        .withState(localState)
        .provide([[matchers.call.fn(updateOperationsWorker), null]])
        .call(updateOperationsWorker, [
          {
            id: "o1",
            parentId: "o2",
          },
        ])
        .dispatch(action)
        .run();
    });
  });

  describe("handling createColumnsSuccess actions", () => {
    it("should not call updateOperationsWorker with action payload if columns belong to a table", () => {
      action = createColumnsSuccess([
        { id: "c3", index: 1, parentId: "t1", name: "Column 2" },
      ]);
      return expectSaga(updateOperationsWatcher)
        .withState({
          operations: {
            byId: {
              o1: {
                id: "o1",
                columnIds: [],
              },
            },
          },
          tables: {
            byId: {
              t1: {
                id: "t1",
                parentId: "o1",
                name: "Table 1",
                columnIds: ["c1", "c2"],
              },
            },
          },
        })
        .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
        .not.call(updateOperationsWorker, [
          {
            id: "t1",
            columnIds: ["c1", "c2"],
          },
        ])
        .dispatch(action)
        .run();
    });

    describe("when operation columns are initialized", () => {
      it("should call updateOperationsWorker with action payload if columns belong to an operation", () => {
        action = createColumnsSuccess([
          { id: "c1", index: 0, parentId: "o1", name: "Column 1" },
          { id: "c2", index: 1, parentId: "o1", name: "Column 2" },
        ]);
        return expectSaga(updateOperationsWatcher)
          .withState({
            operations: {
              byId: {
                o1: {
                  id: "o1",
                  columnIds: [],
                },
              },
            },
            columns: {
              byId: {
                c1: { id: "c1", index: 0, parentId: "o1", name: "Column 1" },
                c2: { id: "c2", index: 1, parentId: "o1", name: "Column 2" },
              },
            },
          })
          .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
          .call(updateOperationsWorker, [
            {
              id: "o1",
              columnIds: ["c1", "c2"],
            },
          ])
          .dispatch(action)
          .run();
      });
    });
    describe("when a column is being inserted into an operation", () => {
      it("should call updateOperationsWork with all columnIds", () => {
        action = createColumnsSuccess([
          { id: "c3", index: 1, parentId: "o1", name: "Column 3" },
        ]);
        return expectSaga(updateOperationsWatcher)
          .withState({
            operations: {
              byId: { o1: { id: "o1", columnIds: ["c1", "c2"] } },
            },
            columns: {
              byId: {
                c1: { id: "c1", index: 0, parentId: "o1", name: "Column 1" },
                c2: { id: "c2", index: 1, parentId: "o1", name: "Column 2" },
                c3: { id: "c3", index: 1, parentId: "o1", name: "Column 3" },
              },
            },
          })
          .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
          .call(updateOperationsWorker, [
            {
              id: "o1",
              columnIds: ["c1", "c3", "c2"],
            },
          ])
          .dispatch(action)
          .run();
      });
    });
  });

  describe("handling updateTablesSuccess actions", () => {
    action = updateTablesSuccess([
      {
        id: "t1",
        parentId: "o1",
        columnIds: ["c1", "c2", "c3"],
      },
    ]);

    describe("columnId updates", () => {
      it("calls updateOperationsWorker if table is the child of a materialized operation", () => {
        // Image we're swapping columns within a table that is the child of a materialized operation.
        // The operation needs to be flagged as out of sync.
        action = updateTablesSuccess([
          {
            id: "t1",
            parentId: "o1",
            columnIds: ["c2", "c1"],
          },
        ]);
        return expectSaga(updateOperationsWatcher)
          .withState({
            operations: {
              byId: {
                o1: {
                  id: "o1",
                  childIds: ["t1", "t2"],
                  columnIds: ["c5", "c6"],
                  isMaterialized: true,
                },
              },
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
            },
            columnIds: {
              byId: {
                c1: { id: "c1", parentId: "t1", name: "Column 1" },
                c2: { id: "c2", parentId: "t1", name: "Column 2" },
                c3: { id: "c3", parentId: "t2", name: "Column 3" },
                c4: { id: "c4", parentId: "t2", name: "Column 4" },
                c5: { id: "c5", parentId: "o1", name: "Column 5" },
                c6: { id: "c6", parentId: "o1", name: "Column 6" },
              },
            },
          })
          .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
          .call(updateOperationsWorker, [
            {
              id: "o1",
              isInSync: false,
            },
          ])
          .dispatch(action)
          .run();
      });

      it("does not call updateOperationsWorker if table is the child of an unmaterialized operation", () => {
        return expectSaga(updateOperationsWatcher)
          .withState({
            operations: {
              byId: {
                o1: {
                  id: "o1",
                  childIds: ["t1", "t2"],
                  columnIds: ["c1", "c2", "c3"],
                  isMaterialized: false,
                  isInSync: true,
                },
              },
            },
            tables: {
              byId: {
                t1: {
                  id: "t1",
                  parentId: "o1",
                },
                t2: {
                  id: "t2",
                  parentId: "o1",
                },
              },
            },
            columns: {
              byId: {
                c1: { id: "c1", parentId: "o1", name: "Column 1" },
                c2: { id: "c2", parentId: "o1", name: "Column 2" },
                c3: { id: "c3", parentId: "o1", name: "Column 3" },
              },
            },
          })
          .provide([[matchers.call.fn(updateOperationsWorker), undefined]])
          .not.call(updateOperationsWorker)
          .dispatch(action)
          .run();
      });
    });
  });
});
