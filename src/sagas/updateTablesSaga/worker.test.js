import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import updateTablesWorker from "./worker";
import { updateTables as updateTablesSlice } from "../../slices/tablesSlice";
import { updateTablesSuccess, updateTablesFailure } from "./actions";
import { getTableStats } from "../../lib/duckdb";

/**
 * Helper to create a mock state with tables
 */
const createMockState = (tablesById = {}) => ({
  tables: {
    byId: tablesById,
    allIds: Object.keys(tablesById),
  },
});

describe("updateTablesWorker saga", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updating table with database attributes", () => {
    it("fetches stats from database when updating database attributes", async () => {
      const action = {
        payload: {
          tableUpdates: [
            { id: "t_1", rowCount: null }, // rowCount is a database attribute
          ],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          databaseName: "sales_db",
          rowCount: 100,
        },
      });

      const mockStats = [{ rowCount: 150, columnCount: 5 }];

      const { effects } = await expectSaga(updateTablesWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), mockStats]])
        .run();

      // Verify updateTables was called in slice
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction).toBeDefined();

      // Verify success action
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(
        successAction.payload.action.payload.changedPropertiesById["t_1"]
      ).toBeDefined();
    });

    it("merges database stats with provided update data", async () => {
      const action = {
        payload: {
          tableUpdates: [{ id: "t_1", rowCount: null, name: "Updated Name" }],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          databaseName: "table_db",
          name: "Original Name",
        },
      });

      const mockStats = [{ rowCount: 200 }];

      const { effects } = await expectSaga(updateTablesWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), mockStats]])
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("updating table without database attributes", () => {
    it("updates table without calling database when no database attrs present", async () => {
      const action = {
        payload: {
          tableUpdates: [
            { id: "t_1", name: "New Name" }, // name is not a database attribute
          ],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          databaseName: "table_db",
          name: "Old Name",
        },
      });

      const { effects } = await expectSaga(updateTablesWorker, action)
        .withState(mockState)
        .run();

      // Verify updateTables was called
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction).toBeDefined();

      // Verify success action
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("updating multiple tables", () => {
    it("handles multiple table updates", async () => {
      const action = {
        payload: {
          tableUpdates: [
            { id: "t_1", name: "Table 1" },
            { id: "t_2", name: "Table 2" },
          ],
        },
      };

      const mockState = createMockState({
        t_1: { id: "t_1", databaseName: "db1", name: "Old 1" },
        t_2: { id: "t_2", databaseName: "db2", name: "Old 2" },
      });

      const { effects } = await expectSaga(updateTablesWorker, action)
        .withState(mockState)
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(
        Object.keys(successAction.payload.action.payload.changedPropertiesById)
      ).toHaveLength(2);
    });
  });

  describe("failed table updates", () => {
    it("dispatches failure action when database call fails", async () => {
      const action = {
        payload: {
          tableUpdates: [
            { id: "t_1", rowCount: null }, // Will trigger database call
          ],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          databaseName: "table_db",
        },
      });

      const { effects } = await expectSaga(updateTablesWorker, action)
        .withState(mockState)
        .provide([
          [
            matchers.call.fn(getTableStats),
            throwError(new Error("Query failed")),
          ],
        ])
        .run();

      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesFailure.type
      );
      expect(failureAction).toBeDefined();
      expect(failureAction.payload.action.payload.tableIds).toContain("t_1");
    });
  });

  describe("partial success scenarios", () => {
    it("reports both successes and failures", async () => {
      const action = {
        payload: {
          tableUpdates: [
            { id: "t_1", rowCount: null },
            { id: "t_2", rowCount: null },
          ],
        },
      };

      const mockState = createMockState({
        t_1: { id: "t_1", databaseName: "db1" },
        t_2: { id: "t_2", databaseName: "db2" },
      });

      let callCount = 0;
      const { effects } = await expectSaga(updateTablesWorker, action)
        .withState(mockState)
        .provide({
          call(effect, next) {
            if (effect.fn === getTableStats) {
              callCount++;
              if (callCount === 2) {
                throw new Error("Query failed");
              }
              return [{ rowCount: 100 }];
            }
            return next();
          },
        })
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesFailure.type
      );

      expect(successAction).toBeDefined();
      expect(failureAction).toBeDefined();
    });
  });

  describe("success action payload", () => {
    it("includes changedPropertiesById mapping property names", async () => {
      const action = {
        payload: {
          tableUpdates: [{ id: "t_1", name: "New Name", parentId: "o_1" }],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          databaseName: "table_db",
        },
      });

      const { effects } = await expectSaga(updateTablesWorker, action)
        .withState(mockState)
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
      const changedProps =
        successAction.payload.action.payload.changedPropertiesById["t_1"];
      expect(changedProps).toContain("name");
      expect(changedProps).toContain("parentId");
    });
  });

  describe("edge cases", () => {
    it("handles empty tableUpdates array", async () => {
      const action = {
        payload: {
          tableUpdates: [],
        },
      };

      const { effects } = await expectSaga(updateTablesWorker, action).run();

      // Should still dispatch updateTables with empty array
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction).toBeDefined();
      expect(updateTablesAction.payload.action.payload).toHaveLength(0);
    });
  });
});
