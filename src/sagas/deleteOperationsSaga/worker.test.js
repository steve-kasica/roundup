import { describe, it } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import deleteOperationsWorker from "./worker";
import {
  deleteOperations as deleteOperationsFromSlice,
  OPERATION_TYPE_PACK,
} from "../../slices/operationsSlice";
import { deleteOperationsSuccess } from "./actions";
import { dropView } from "../../lib/duckdb";

describe("deleteOperationsWorker saga", () => {
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
      },
      allIds: ["o1"],
    },
    tables: {
      byId: {
        t1: { id: "t1", name: "table_1" },
        t2: { id: "t2", name: "table_2" },
      },
      allIds: ["t1", "t2"],
    },
  };
  describe("deleting operations from state and database", () => {
    it("calls dropView and puts deleteOperationsFromSlice and deleteOperationsSuccess", () => {
      const workerPayload = [state.operations.byId.o1];

      return expectSaga(deleteOperationsWorker, workerPayload)
        .withState({ ...state })
        .provide([[matchers.call.fn(dropView), undefined]])
        .call(dropView, "pack_view_1")
        .put(deleteOperationsFromSlice(["o1"]))
        .put(deleteOperationsSuccess([state.operations.byId.o1]))
        .run();
    });
  });

  describe("deleting operations just from state", () => {
    it("onlys puts deleteOperationsFromSlice and deleteOperationsSuccess", () => {
      const workerPayload = [
        { ...state.operations.byId.o1, isMaterialized: false },
      ];

      return expectSaga(deleteOperationsWorker, workerPayload)
        .withState({
          ...state,
          operations: {
            ...state.operations,
            byId: {
              ...state.operations.byId,
              o1: { ...state.operations.byId.o1, isMaterialized: false },
            },
          },
        })
        .provide([[matchers.call.fn(dropView), undefined]])
        .not.call(dropView, "pack_view_1")
        .put(deleteOperationsFromSlice(["o1"]))
        .put(
          deleteOperationsSuccess([
            { ...state.operations.byId.o1, isMaterialized: false },
          ]),
        )
        .run();
    });
  });
});
