import { describe, it, expect, beforeEach } from "vitest";
import { runSaga } from "redux-saga";
import { removeTablesSagaWorker, removeTablesAction } from "./dropTablesSaga";
import {
  addTablesToLoading,
  removeTables,
  removeTablesFromLoading,
} from "../../slices/tablesSlice";
import { removeFromSelectedTables } from "../../slices/uiSlice/uiSlice";
import { removeChildFromOperation } from "../../slices/operationsSlice/operationsSlice";

describe("removeTablesSagaWorker", () => {
  let dispatched;

  beforeEach(() => {
    dispatched = [];
  });

  it("dispatches correct actions for a single table id", async () => {
    const tableId = "table1";
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      removeTablesSagaWorker,
      { payload: tableId }
    ).toPromise();

    expect(dispatched).toEqual([
      addTablesToLoading([tableId]),
      removeChildFromOperation({ operationId: undefined, childId: tableId }),
      removeTables([tableId]),
      removeFromSelectedTables(tableId),
      removeTablesFromLoading([tableId]),
    ]);
  });

  it("dispatches correct actions for multiple table ids", async () => {
    const tableIds = ["table1", "table2"];
    await runSaga(
      {
        dispatch: (action) => dispatched.push(action),
      },
      removeTablesSagaWorker,
      { payload: tableIds }
    ).toPromise();

    expect(dispatched).toEqual([
      addTablesToLoading(tableIds),
      removeChildFromOperation({ operationId: undefined, childId: "table1" }),
      removeChildFromOperation({ operationId: undefined, childId: "table2" }),
      removeTables(tableIds),
      removeFromSelectedTables("table1"),
      removeFromSelectedTables("table2"),
      removeTablesFromLoading(tableIds),
    ]);
  });
});
