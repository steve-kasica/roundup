import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import createTablesWorker from "./worker";
import { addTables } from "../../slices/tablesSlice";
import { createTablesSuccess, createTablesFailure } from "./actions";
import {
  createTables as createDBTables,
  getTableDimensions,
} from "../../lib/duckdb";

// Mock generateUUID to return predictable values
vi.mock("../../lib/utilities/generateUUID", () => ({
  default: vi.fn((prefix) => `${prefix}mock-uuid`),
}));

describe("createTablesWorker saga", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful table creation", () => {
    it("creates a single table from uploaded file", async () => {
      const action = {
        payload: {
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
        },
      };

      const mockDimensions = { rowCount: 100, columnCount: 5 };

      const { effects } = await expectSaga(createTablesWorker, action)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .run();

      // Verify addTables was called
      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );
      expect(addTablesAction).toBeDefined();
      const tables = addTablesAction.payload.action.payload;
      expect(tables).toHaveLength(1);
      expect(tables[0]).toMatchObject({
        source: "upload",
        name: "Sales Data",
        fileName: "sales.csv",
        extension: "csv",
        size: 1024,
        mimeType: "text/csv",
        rowCount: 100,
      });
      expect(tables[0].columnIds).toHaveLength(5);
    });

    it("creates multiple tables from multiple uploaded files", async () => {
      const action = {
        payload: {
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
        },
      };

      const mockDimensions1 = { rowCount: 100, columnCount: 5 };
      const mockDimensions2 = { rowCount: 200, columnCount: 8 };

      const { effects } = await expectSaga(createTablesWorker, action)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions1],
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions2],
        ])
        .run();

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );
      expect(addTablesAction).toBeDefined();
      const tables = addTablesAction.payload.action.payload;
      expect(tables).toHaveLength(2);
      expect(tables[0].name).toBe("Sales");
      expect(tables[1].name).toBe("Products");
    });

    it("dispatches createTablesSuccess with table IDs on success", async () => {
      const action = {
        payload: {
          tablesInfo: [
            {
              source: "upload",
              name: "Data",
              fileName: "data.csv",
              extension: "csv",
              size: 512,
              mimeType: "text/csv",
              dateLastModified: "2024-01-01",
            },
          ],
        },
      };

      const mockDimensions = { rowCount: 50, columnCount: 3 };

      const { effects } = await expectSaga(createTablesWorker, action)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === createTablesSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload).toHaveProperty("tableIds");
      expect(successAction.payload.action.payload.tableIds).toHaveLength(1);
    });
  });

  describe("failed table creation", () => {
    it("dispatches createTablesFailure when DB creation fails", async () => {
      const action = {
        payload: {
          tablesInfo: [
            {
              source: "upload",
              name: "Bad Data",
              fileName: "corrupt.csv",
              extension: "csv",
              size: 256,
              mimeType: "text/csv",
              dateLastModified: "2024-01-01",
            },
          ],
        },
      };

      const { effects } = await expectSaga(createTablesWorker, action)
        .provide([
          [
            matchers.call.fn(createDBTables),
            Promise.reject(new Error("DB Error")),
          ],
        ])
        .run();

      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === createTablesFailure.type
      );
      expect(failureAction).toBeDefined();
    });

    it("dispatches createTablesFailure when getTableDimensions fails", async () => {
      const action = {
        payload: {
          tablesInfo: [
            {
              source: "upload",
              name: "Data",
              fileName: "data.csv",
              extension: "csv",
              size: 512,
              mimeType: "text/csv",
              dateLastModified: "2024-01-01",
            },
          ],
        },
      };

      const { effects } = await expectSaga(createTablesWorker, action)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [
            matchers.call.fn(getTableDimensions),
            Promise.reject(new Error("Query Error")),
          ],
        ])
        .run();

      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === createTablesFailure.type
      );
      expect(failureAction).toBeDefined();
    });
  });

  describe("partial success scenarios", () => {
    it("creates successful tables and reports failures for others", async () => {
      const action = {
        payload: {
          tablesInfo: [
            {
              source: "upload",
              name: "Good Data",
              fileName: "good.csv",
              extension: "csv",
              size: 1024,
              mimeType: "text/csv",
              dateLastModified: "2024-01-01",
            },
            {
              source: "upload",
              name: "Bad Data",
              fileName: "bad.csv",
              extension: "csv",
              size: 256,
              mimeType: "text/csv",
              dateLastModified: "2024-01-02",
            },
          ],
        },
      };

      const mockDimensions = { rowCount: 100, columnCount: 5 };

      // First table succeeds, second fails
      let callCount = 0;
      const { effects } = await expectSaga(createTablesWorker, action)
        .provide({
          call(effect) {
            if (effect.fn === createDBTables) {
              callCount++;
              if (callCount === 2) {
                throw new Error("DB Error");
              }
              return undefined;
            }
            if (effect.fn === getTableDimensions) {
              return mockDimensions;
            }
          },
        })
        .run();

      // Should have addTables with one successful table
      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );
      expect(addTablesAction).toBeDefined();
      expect(addTablesAction.payload.action.payload).toHaveLength(1);
      expect(addTablesAction.payload.action.payload[0].name).toBe("Good Data");

      // Should have both success and failure actions
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === createTablesSuccess.type
      );
      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === createTablesFailure.type
      );
      expect(successAction).toBeDefined();
      expect(failureAction).toBeDefined();
    });
  });

  describe("table metadata", () => {
    it("preserves all file metadata in created table", async () => {
      const dateLastModified = "2024-06-15T10:30:00Z";
      const action = {
        payload: {
          tablesInfo: [
            {
              source: "url",
              name: "Remote Data",
              fileName: "remote_data.csv",
              extension: "csv",
              size: 4096,
              mimeType: "text/csv",
              dateLastModified,
            },
          ],
        },
      };

      const mockDimensions = { rowCount: 500, columnCount: 10 };

      const { effects } = await expectSaga(createTablesWorker, action)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .run();

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );
      const table = addTablesAction.payload.action.payload[0];

      expect(table).toMatchObject({
        source: "url",
        name: "Remote Data",
        fileName: "remote_data.csv",
        extension: "csv",
        size: 4096,
        mimeType: "text/csv",
        dateLastModified,
        rowCount: 500,
      });
      expect(table.columnIds).toHaveLength(10);
      expect(table.id).toBeDefined();
      expect(table.databaseName).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("handles empty tablesInfo array", async () => {
      const action = {
        payload: {
          tablesInfo: [],
        },
      };

      const { effects } = await expectSaga(createTablesWorker, action).run();

      // Should still dispatch addTables with empty array
      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );
      expect(addTablesAction).toBeDefined();
      expect(addTablesAction.payload.action.payload).toHaveLength(0);

      // Should not dispatch success or failure
      const successAction = effects.put?.find(
        (effect) => effect.payload.action.type === createTablesSuccess.type
      );
      expect(successAction).toBeUndefined();
    });

    it("handles table with zero rows", async () => {
      const action = {
        payload: {
          tablesInfo: [
            {
              source: "upload",
              name: "Empty Table",
              fileName: "empty.csv",
              extension: "csv",
              size: 10,
              mimeType: "text/csv",
              dateLastModified: "2024-01-01",
            },
          ],
        },
      };

      const mockDimensions = { rowCount: 0, columnCount: 3 };

      const { effects } = await expectSaga(createTablesWorker, action)
        .provide([
          [matchers.call.fn(createDBTables), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .run();

      const addTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === addTables.type
      );
      expect(addTablesAction).toBeDefined();
      const table = addTablesAction.payload.action.payload[0];
      expect(table.rowCount).toBe(0);
      expect(table.columnIds).toHaveLength(3);
    });
  });
});
