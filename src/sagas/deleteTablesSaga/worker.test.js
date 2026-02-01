import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import deleteTablesWorker from "./worker";
import { deleteTables as deleteTablesInSlice } from "../../slices/tablesSlice";
import { deleteTablesSuccess } from "./actions";
import { dropTable } from "../../lib/duckdb";

describe("deleteTablesWorker", () => {
  const state = {
    tables: {
      byId: {
        t1: { id: "t1", name: "Table 1", databaseName: "db_table_1" },
        t2: { id: "t2", name: "Table 2", databaseName: "db_table_2" },
      },
      allIds: ["t1", "t2"],
    },
  };
  it("calls dropTable and dispatches success actions on successful deletion", () => {
    const workerPayload = [state.tables.byId.t1, state.tables.byId.t2];
    return expectSaga(deleteTablesWorker, workerPayload)
      .provide([[matchers.call.fn(dropTable), null]])
      .call(dropTable, "db_table_1")
      .call(dropTable, "db_table_2")
      .put(deleteTablesInSlice(["t1", "t2"]))
      .put(deleteTablesSuccess([state.tables.byId.t1, state.tables.byId.t2]))
      .run();
  });
});
