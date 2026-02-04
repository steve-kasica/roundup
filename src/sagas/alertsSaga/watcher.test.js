/**
 * @fileoverview Tests for the alerts saga watcher.
 * @module sagas/alertsSaga/watcher.test
 *
 */
import { describe, it, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateAlertsSagaWatcher from "./watcher";
import { validateOperationWorker } from "./worker";
import { createOperationsSuccess } from "../createOperationsSaga/actions";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { COLUMN_TYPE_CATEGORICAL } from "../../slices/columnsSlice";
import { updateOperationsSuccess } from "../updateOperationsSaga";
import { updateTablesSuccess } from "../updateTablesSaga";

vi.mock("./worker", () => ({
  validateOperationWorker: vi.fn(),
  default: vi.fn(),
}));

describe("updateAlertsSagaWatcher", () => {
  let state;

  beforeEach(() => {
    // Create test operations
    state = {
      tables: {
        byId: {
          t1: {
            id: "t1",
            parentId: "o1",
            columnIds: ["c1", "c2"],
          },
          t2: {
            id: "t2",
            parentId: "o1",
            columnIds: ["c3", "c4"],
          },
          t3: {
            id: "t3",
            parentId: "o2",
            columnIds: ["c5", "c6"],
          },
        },
        allIds: ["t1", "t2", "t3"],
      },
      operations: {
        byId: {
          o1: {
            id: "o1",
            operationType: OPERATION_TYPE_STACK,
            parentId: "o2",
            childIds: ["t1", "t2"],
            isMaterialized: true,
            columnIds: ["c7", "c8"],
          },
          o2: {
            id: "o2",
            operationType: OPERATION_TYPE_PACK,
            parentId: null,
            childIds: ["o1", "t3"],
            joinKey1: "c7",
            joinKey2: "c5",
            joinPredicate: "EQUALS",
            joinType: "FULL OUTER",
          },
        },
        allIds: ["o1", "o2"],
      },
      columns: {
        byId: {
          c1: {
            id: "c1",
            parentId: "t1",
            columnType: COLUMN_TYPE_CATEGORICAL,
          },
          c2: {
            id: "c2",
            parentId: "t1",
            columnType: COLUMN_TYPE_CATEGORICAL,
          },
          c3: {
            id: "c3",
            parentId: "t2",
            columnType: COLUMN_TYPE_CATEGORICAL,
          },
          c4: {
            id: "c4",
            parentId: "t2",
            columnType: COLUMN_TYPE_CATEGORICAL,
          },
          c5: {
            id: "c5",
            parentId: "t3",
            columnType: COLUMN_TYPE_CATEGORICAL,
          },
          c6: {
            id: "c6",
            parentId: "t3",
            columnType: COLUMN_TYPE_CATEGORICAL,
          },
          c7: {
            id: "c7",
            parentId: "o1",
            columnType: COLUMN_TYPE_CATEGORICAL,
          },
          c8: {
            id: "c8",
            parentId: "o1",
            columnType: COLUMN_TYPE_CATEGORICAL,
          },
        },
        allIds: ["c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8"],
      },
    };
  });

  describe("handling createOperationsSuccess action", () => {
    it("should call validateOperations for each newly created operation", () => {
      const action = createOperationsSuccess([
        { id: "o2", operationType: OPERATION_TYPE_PACK, databaseName: "db1" },
      ]);

      return expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .call(validateOperationWorker, action.payload)
        .dispatch(action)
        .run();
    });
  });

  describe("handling updateOperationsSuccess action", () => {
    it("should call validateOperations for operations when relevant property changes", () => {
      const action = updateOperationsSuccess([
        {
          id: "o1",
          childIds: ["t1", "t2"],
        },
      ]);
      return expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .call(validateOperationWorker, [state.operations.byId["o1"]])
        .dispatch(action)
        .run();
    });
    it("should not call validateOperations for operations when no relevant property changes", () => {
      const action = updateOperationsSuccess([
        {
          id: "o2",
          name: "Operation Name",
        },
      ]);
      return expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .not.call.fn(validateOperationWorker)
        .dispatch(action)
        .run();
    });
    it("should call validateOperations for parent operations when child operation's columnIds change", () => {
      const action = updateOperationsSuccess([
        {
          id: "o1",
          columnIds: ["c7", "c8"],
        },
      ]);
      return expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .call(validateOperationWorker, [state.operations.byId["o2"]])
        .dispatch(action)
        .run();
    });
  });

  describe("handling updateTablesSuccess action", () => {
    it("should call validateOperationsWorker for parent operations when tables are updated", () => {
      const action = updateTablesSuccess([{ id: "t1", columnIds: ["c1"] }]);
      return expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .call(validateOperationWorker, [state.operations.byId["o1"]])
        .dispatch(action)
        .run();
    });
    it("should not call validateOperationsWorker if no parent operations affected", () => {
      const action = updateTablesSuccess([
        { id: "t1", name: "New Table Name" },
      ]);
      return expectSaga(updateAlertsSagaWatcher)
        .withState(state)
        .not.call.fn(validateOperationWorker)
        .dispatch(action)
        .run();
    });
  });
});
