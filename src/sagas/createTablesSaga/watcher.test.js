/**
 * @fileoverview Tests for the create tables saga watcher.
 * @module sagas/createTablesSaga/watcher.test
 *
 * Comprehensive test suite for createTablesWatcher covering:
 * - Basic watcher functionality
 * - Worker invocation with correct parameters
 * - Handling of single and multiple table creations
 * - Table metadata processing
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import createTablesWatcher from "./watcher";
import { createTablesRequest, createTablesSuccess } from "./actions";
import { addTables } from "../../slices/tablesSlice";
import {
  createTables as createDBTables,
  getTableDimensions,
} from "../../lib/duckdb";

// Mock generateUUID to return predictable values
vi.mock("../../lib/utilities/generateUUID", () => ({
  default: vi.fn((prefix) => `${prefix}mock-uuid`),
}));

describe("createTablesWatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("basic watcher functionality", () => {
    it("should invoke worker and dispatch addTables when createTablesRequest is dispatched", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "Sales Data",
            fileName: "sales.csv",
            extension: "csv",
            size: 1024,
            mimeType: "text/csv",
            dateLastModified: "2024-01-01",
          },
        ],
      });

      const mockDimensions = { rowCount: 100, columnCount: 5 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      // Verify addTables was dispatched (worker effect)
      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );

      expect(addTablesAction).toBeDefined();
      const tables = addTablesAction.payload.action.payload;
      expect(tables).toHaveLength(1);
    });

    it("should dispatch createTablesSuccess after processing request", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "Products",
            fileName: "products.csv",
            extension: "csv",
            size: 2048,
            mimeType: "text/csv",
            dateLastModified: "2024-01-02",
          },
        ],
      });

      const mockDimensions = { rowCount: 50, columnCount: 3 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload?.action?.type === createTablesSuccess.type
      );

      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.tableIds).toHaveLength(1);
    });
  });

  describe("single table creation", () => {
    it("should create a table with correct metadata from uploaded file", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "Customer Data",
            fileName: "customers.csv",
            extension: "csv",
            size: 5000,
            mimeType: "text/csv",
            dateLastModified: "2024-06-15",
          },
        ],
      });

      const mockDimensions = { rowCount: 250, columnCount: 8 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );

      const tables = addTablesAction.payload.action.payload;
      expect(tables[0]).toMatchObject({
        source: "upload",
        name: "Customer Data",
        fileName: "customers.csv",
        extension: "csv",
        size: 5000,
        mimeType: "text/csv",
        rowCount: 250,
      });
      expect(tables[0].columnIds).toHaveLength(8);
    });

    it("should generate a unique database name for the table", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "Test",
            fileName: "test.csv",
            extension: "csv",
            size: 100,
            mimeType: "text/csv",
            dateLastModified: "2024-01-01",
          },
        ],
      });

      const mockDimensions = { rowCount: 10, columnCount: 2 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );

      const table = addTablesAction.payload.action.payload[0];
      expect(table.databaseName).toBeDefined();
      expect(table.databaseName).toBe("tmock-uuid");
    });
  });

  describe("multiple table creation", () => {
    it("should create multiple tables from multiple uploaded files", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "Sales",
            fileName: "sales.csv",
            extension: "csv",
            size: 1024,
            mimeType: "text/csv",
            dateLastModified: "2024-01-01",
          },
          {
            source: "upload",
            name: "Products",
            fileName: "products.csv",
            extension: "csv",
            size: 2048,
            mimeType: "text/csv",
            dateLastModified: "2024-01-02",
          },
        ],
      });

      const mockDimensions = { rowCount: 100, columnCount: 5 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );

      const tables = addTablesAction.payload.action.payload;
      expect(tables).toHaveLength(2);
      expect(tables[0].name).toBe("Sales");
      expect(tables[1].name).toBe("Products");
    });

    it("should dispatch success with multiple table IDs for batch creation", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "Table1",
            fileName: "table1.csv",
            extension: "csv",
            size: 100,
            mimeType: "text/csv",
            dateLastModified: "2024-01-01",
          },
          {
            source: "upload",
            name: "Table2",
            fileName: "table2.csv",
            extension: "csv",
            size: 200,
            mimeType: "text/csv",
            dateLastModified: "2024-01-02",
          },
          {
            source: "upload",
            name: "Table3",
            fileName: "table3.csv",
            extension: "csv",
            size: 300,
            mimeType: "text/csv",
            dateLastModified: "2024-01-03",
          },
        ],
      });

      const mockDimensions = { rowCount: 50, columnCount: 3 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload?.action?.type === createTablesSuccess.type
      );

      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.tableIds).toHaveLength(3);
    });

    it("should handle multiple sequential createTablesRequest actions", async () => {
      const action1 = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "First",
            fileName: "first.csv",
            extension: "csv",
            size: 100,
            mimeType: "text/csv",
            dateLastModified: "2024-01-01",
          },
        ],
      });

      const action2 = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "Second",
            fileName: "second.csv",
            extension: "csv",
            size: 200,
            mimeType: "text/csv",
            dateLastModified: "2024-01-02",
          },
        ],
      });

      const mockDimensions = { rowCount: 25, columnCount: 4 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action1)
        .dispatch(action2)
        .silentRun(100);

      // Should have dispatched addTables twice
      const addTablesActions = effects.put.filter(
        (effect) => effect.payload.action.type === addTables.type
      );

      expect(addTablesActions).toHaveLength(2);

      // Should have dispatched createTablesSuccess twice
      const successActions = effects.put.filter(
        (effect) => effect.payload?.action?.type === createTablesSuccess.type
      );

      expect(successActions).toHaveLength(2);
    });
  });

  describe("different file types", () => {
    it("should handle CSV file uploads", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "CSV Data",
            fileName: "data.csv",
            extension: "csv",
            size: 1000,
            mimeType: "text/csv",
            dateLastModified: "2024-01-01",
          },
        ],
      });

      const mockDimensions = { rowCount: 100, columnCount: 5 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );

      expect(addTablesAction.payload.action.payload[0].extension).toBe("csv");
    });

    it("should handle TSV file uploads", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "TSV Data",
            fileName: "data.tsv",
            extension: "tsv",
            size: 1500,
            mimeType: "text/tab-separated-values",
            dateLastModified: "2024-02-01",
          },
        ],
      });

      const mockDimensions = { rowCount: 75, columnCount: 6 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );

      expect(addTablesAction.payload.action.payload[0].extension).toBe("tsv");
    });
  });

  describe("action type matching", () => {
    it("should only respond to createTablesRequest action type", async () => {
      const unrelatedAction = { type: "UNRELATED_ACTION", payload: {} };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [
            matchers.call.fn(getTableDimensions),
            { rowCount: 10, columnCount: 2 },
          ],
        ])
        .dispatch(unrelatedAction)
        .silentRun(100);

      // Should not have dispatched addTables
      const addTablesAction = effects.put?.find(
        (effect) => effect.payload?.action?.type === addTables.type
      );

      expect(addTablesAction).toBeUndefined();
    });

    it("should not respond to createTablesSuccess action", async () => {
      const successAction = createTablesSuccess({
        tableIds: ["t_1"],
      });

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [
            matchers.call.fn(getTableDimensions),
            { rowCount: 10, columnCount: 2 },
          ],
        ])
        .dispatch(successAction)
        .silentRun(100);

      // Should not have dispatched addTables
      const addTablesAction = effects.put?.find(
        (effect) => effect.payload?.action?.type === addTables.type
      );

      expect(addTablesAction).toBeUndefined();
    });
  });

  describe("table source types", () => {
    it("should handle upload source type", async () => {
      const action = createTablesRequest({
        tablesInfo: [
          {
            source: "upload",
            name: "Uploaded",
            fileName: "uploaded.csv",
            extension: "csv",
            size: 500,
            mimeType: "text/csv",
            dateLastModified: "2024-01-01",
          },
        ],
      });

      const mockDimensions = { rowCount: 20, columnCount: 3 };

      const { effects } = await expectSaga(createTablesWatcher)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .dispatch(action)
        .silentRun(100);

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );

      expect(addTablesAction.payload.action.payload[0].source).toBe("upload");
    });
  });
});
