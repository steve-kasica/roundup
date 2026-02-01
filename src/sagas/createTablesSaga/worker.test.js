import { describe, it, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import createTablesWorker from "./worker";
import { addTables } from "../../slices/tablesSlice";
import { createTablesSuccess } from "./actions";
import {
  createTables as createDBTables,
  getTableDimensions,
} from "../../lib/duckdb";

vi.mock("../../lib/duckdb", () => ({
  createTables: vi.fn(() => Promise.resolve()),
  getTableDimensions: vi.fn(() =>
    Promise.resolve({ rowCount: 100, columnCount: 5 }),
  ),
}));

vi.mock("../../lib/utilities/generateUUID", () => ({
  default: vi.fn((prefix) => `${prefix}-mock-uuid`),
}));

describe("createTablesWorker saga", () => {
  describe("Creating a single table", () => {
    const tablesData = [
      {
        source: "local",
        name: "table1",
        fileName: "data1.csv",
        extension: ".csv",
        size: 2048,
        mimeType: "text/csv",
        dateLastModified: 1625155200000,
      },
    ];
    it("should create tables and dispatch success action on successful creation", async () => {
      await expectSaga(createTablesWorker, tablesData)
        .call(createDBTables, "t-mock-uuid", "data1.csv")
        .call(getTableDimensions, "t-mock-uuid")
        .put.like({ action: { type: addTables.type } })
        .put.like({ action: { type: createTablesSuccess.type } })
        .run();
    });
  });
  describe("Creating multiple tables", () => {
    const tablesData = [
      {
        source: "local",
        name: "table1",
        fileName: "data1.csv",
        extension: ".csv",
        size: 2048,
        mimeType: "text/csv",
        dateLastModified: 1625155200000,
      },
      {
        source: "local",
        name: "table2",
        fileName: "data2.csv",
        extension: ".csv",
        size: 4096,
        mimeType: "text/csv",
        dateLastModified: 1625241600000,
      },
    ];
    it("should create tables and dispatch success action on successful creation", async () => {
      await expectSaga(createTablesWorker, tablesData)
        .call(createDBTables, "t-mock-uuid", "data1.csv")
        .call(createDBTables, "t-mock-uuid", "data2.csv")
        .call(getTableDimensions, "t-mock-uuid")
        .call(getTableDimensions, "t-mock-uuid")
        .put.like({ action: { type: addTables.type } })
        .put.like({ action: { type: createTablesSuccess.type } })
        .run();
    });
  });
});
