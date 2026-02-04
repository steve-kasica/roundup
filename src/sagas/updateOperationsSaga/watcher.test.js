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
} from "../../slices/operationsSlice";
import { deleteTablesSuccess } from "../deleteTablesSaga";
import { createColumnsSuccess } from "../createColumnsSaga/actions";

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
    beforeEach(() => {
      action = createColumnsSuccess([
        state.columns.byId.c1,
        state.columns.byId.c2,
      ]);
    });

    it("should not call updateOperationsWorker with action payload if columns belong to a table", () => {
      return expectSaga(updateOperationsWatcher)
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
    it("should call updateOperationsWorker with action payload if columns belong to an operation", () => {
      return expectSaga(updateOperationsWatcher)
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
});
