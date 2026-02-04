import { describe, expect, it, vi } from "vitest";
import { runSaga } from "redux-saga";
import updateTablesWorker from "./worker";
import { expectSaga } from "redux-saga-test-plan";
import { getTableStats } from "../../lib/duckdb";
import { updateTablesSuccess } from "./actions";
import { updateTables } from "../../slices/tablesSlice";

vi.mock("../../lib/duckdb", () => ({
  getTableStats: vi.fn((databaseName) =>
    Promise.resolve(
      databaseName === "db1" ? [{ rowCount: 150 }] : [{ rowCount: 250 }],
    ),
  ),
}));

describe("updateTablesWorker", () => {
  describe("Updates do not contain database attributes", () => {
    it("should not call getTableStats", async () => {
      const tableUpdates = [{ id: "table1", name: "New Table Name" }];
      await expectSaga(updateTablesWorker, tableUpdates)
        .not.call(getTableStats)
        .run();
    });
  });
  describe("Updates container attributes set via a database call", () => {
    const state = {
      tables: {
        byId: {
          t1: {
            id: "t1",
            name: "table1",
            rowCount: null,
            databaseName: "db1",
          },
          t2: {
            id: "t2",
            name: "table2",
            rowCount: 100,
            databaseName: "db2",
          },
        },
      },
    };
    it("should call getTableStats", async () => {
      const tableUpdates = [
        { id: "t1", rowCount: null },
        { id: "t2", rowCount: null },
      ];
      const expectedPayload = [
        { id: "t1", rowCount: 150 },
        { id: "t2", rowCount: 250 },
      ];
      await expectSaga(updateTablesWorker, tableUpdates)
        .withState(state)
        .call(getTableStats, "db2")
        .put(updateTables(expectedPayload))
        .put(updateTablesSuccess(expectedPayload))
        .run();
    });
  });
});
