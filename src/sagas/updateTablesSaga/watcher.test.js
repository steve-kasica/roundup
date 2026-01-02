/**
 * @fileoverview Tests for the update tables saga watcher.
 * @module sagas/updateTablesSaga/watcher.test
 *
 * Comprehensive test suite for updateTablesSagaWatcher covering:
 * - Basic watcher functionality (updateTablesRequest handling)
 * - Database attribute fetching
 * - Edge cases and action type matching
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateTablesSagaWatcher from "./watcher";
import {
  updateTablesRequest,
  updateTablesSuccess,
  updateTablesFailure,
} from "./actions";
import { updateTables as updateTablesSlice } from "../../slices/tablesSlice";
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

describe("updateTablesSagaWatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateTablesRequest handling", () => {
    it("should invoke worker and update table in state", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          rowCount: 0,
          columnIds: ["c_1", "c_2"],
        },
      });

      const action = updateTablesRequest({
        tableUpdates: [{ id: "t_1", rowCount: null }],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), [{ rowCount: 1000 }]]])
        .dispatch(action)
        .silentRun(100);

      // Verify updateTables was called from slice
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction).toBeDefined();

      // Verify success action was dispatched
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should fetch database stats when DATABASE_ATTRIBUTES are in update", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Products",
          databaseName: "products_db",
          rowCount: 0,
        },
      });

      const action = updateTablesRequest({
        tableUpdates: [{ id: "t_1", rowCount: null }],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), [{ rowCount: 500 }]]])
        .dispatch(action)
        .silentRun(100);

      // Verify getTableStats was called
      const getTableStatsCall = effects.call.find(
        (effect) => effect.payload.fn === getTableStats
      );
      expect(getTableStatsCall).toBeDefined();
    });

    it("should handle multiple table updates", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          rowCount: 0,
        },
        t_2: {
          id: "t_2",
          name: "Products",
          databaseName: "products_db",
          rowCount: 0,
        },
      });

      const action = updateTablesRequest({
        tableUpdates: [
          { id: "t_1", rowCount: null },
          { id: "t_2", rowCount: null },
        ],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), [{ rowCount: 100 }]]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();

      // Verify changedPropertiesById includes both tables
      const changedPropertiesById =
        successAction.payload.action.payload.changedPropertiesById;
      expect(changedPropertiesById).toHaveProperty("t_1");
      expect(changedPropertiesById).toHaveProperty("t_2");
    });

    it("should track changed properties in success action", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Table1",
          databaseName: "table1_db",
          rowCount: 0,
        },
      });

      const action = updateTablesRequest({
        tableUpdates: [{ id: "t_1", rowCount: null }],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), [{ rowCount: 250 }]]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();

      const changedPropertiesById =
        successAction.payload.action.payload.changedPropertiesById;
      expect(changedPropertiesById.t_1).toContain("rowCount");
    });

    it("should handle sequential updateTablesRequest actions", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Table1",
          databaseName: "table1_db",
          rowCount: 0,
        },
        t_2: {
          id: "t_2",
          name: "Table2",
          databaseName: "table2_db",
          rowCount: 0,
        },
      });

      const action1 = updateTablesRequest({
        tableUpdates: [{ id: "t_1", rowCount: null }],
      });

      const action2 = updateTablesRequest({
        tableUpdates: [{ id: "t_2", rowCount: null }],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), [{ rowCount: 100 }]]])
        .dispatch(action1)
        .dispatch(action2)
        .silentRun(100);

      // Should have dispatched success twice
      const successActions = effects.put.filter(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successActions).toHaveLength(2);
    });

    it("should update non-database properties without fetching stats", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "OldName",
          databaseName: "table1_db",
          rowCount: 100,
        },
      });

      // Updating name - not a DATABASE_ATTRIBUTE
      const action = updateTablesRequest({
        tableUpdates: [{ id: "t_1", name: "NewName" }],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .dispatch(action)
        .silentRun(100);

      // Should not call getTableStats for non-database attributes
      const getTableStatsCall = effects.call?.find(
        (effect) => effect.payload.fn === getTableStats
      );
      expect(getTableStatsCall).toBeUndefined();

      // Should still dispatch success
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("action type matching", () => {
    it("should respond to updateTablesRequest action type", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Table1",
          databaseName: "table1_db",
          rowCount: 0,
        },
      });

      const action = {
        type: updateTablesRequest.type,
        payload: { tableUpdates: [{ id: "t_1", rowCount: null }] },
      };

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), [{ rowCount: 100 }]]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should not respond to unrelated action types", async () => {
      const mockState = createMockState();

      const action = { type: "UNRELATED_ACTION", payload: {} };

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .dispatch(action)
        .silentRun(100);

      // Should have no put effects
      expect(effects.put).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle empty tableUpdates array", async () => {
      const mockState = createMockState();

      const action = updateTablesRequest({
        tableUpdates: [],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .dispatch(action)
        .silentRun(100);

      // Should not dispatch success with empty updates
      const successAction = effects.put?.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeUndefined();
    });

    it("should handle mixed database and non-database attribute updates", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "OldName",
          databaseName: "table1_db",
          rowCount: 0,
        },
      });

      const action = updateTablesRequest({
        tableUpdates: [{ id: "t_1", name: "NewName", rowCount: null }],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), [{ rowCount: 500 }]]])
        .dispatch(action)
        .silentRun(100);

      // Should call getTableStats because rowCount is a DATABASE_ATTRIBUTE
      const getTableStatsCall = effects.call.find(
        (effect) => effect.payload.fn === getTableStats
      );
      expect(getTableStatsCall).toBeDefined();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();

      const changedProperties =
        successAction.payload.action.payload.changedPropertiesById.t_1;
      expect(changedProperties).toContain("name");
      expect(changedProperties).toContain("rowCount");
    });
  });

  describe("error handling", () => {
    it("should dispatch failure for failed updates", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Table1",
          databaseName: "table1_db",
          rowCount: 0,
        },
      });

      const action = updateTablesRequest({
        tableUpdates: [{ id: "t_1", rowCount: null }],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([
          [
            matchers.call.fn(getTableStats),
            Promise.reject(new Error("DB error")),
          ],
        ])
        .dispatch(action)
        .silentRun(100);

      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesFailure.type
      );
      expect(failureAction).toBeDefined();
    });

    it("should handle partial failures in batch updates", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Table1",
          databaseName: "table1_db",
          rowCount: 0,
        },
        t_2: {
          id: "t_2",
          name: "Table2",
          databaseName: "table2_db",
          rowCount: 0,
        },
      });

      // First table needs database fetch (will fail), second doesn't need database fetch (will succeed)
      const action = updateTablesRequest({
        tableUpdates: [
          { id: "t_1", rowCount: null }, // Needs getTableStats - will fail
          { id: "t_2", name: "UpdatedName" }, // Only name change - won't call getTableStats
        ],
      });

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([
          [
            matchers.call.fn(getTableStats),
            Promise.reject(new Error("DB error")),
          ],
        ])
        .dispatch(action)
        .silentRun(100);

      // t_1 fails (getTableStats throws), t_2 succeeds (no db call needed)
      // Should dispatch failure for t_1
      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesFailure.type
      );
      expect(failureAction).toBeDefined();
      expect(failureAction.payload.action.payload.tableIds).toContain("t_1");

      // Should dispatch success for t_2
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(
        successAction.payload.action.payload.changedPropertiesById
      ).toHaveProperty("t_2");
    });
  });

  describe("integration flow", () => {
    it("should complete full update flow from request to success", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Products",
          databaseName: "products_db",
          rowCount: 0,
          columnIds: ["c_1", "c_2"],
        },
      });

      const action = updateTablesRequest({
        tableUpdates: [{ id: "t_1", rowCount: null }],
      });

      const mockStats = { rowCount: 1500 };

      const { effects } = await expectSaga(updateTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(getTableStats), [mockStats]]])
        .dispatch(action)
        .silentRun(100);

      // Verify the flow: getTableStats -> updateTablesSlice -> updateTablesSuccess
      expect(effects.call.some((c) => c.payload.fn === getTableStats)).toBe(
        true
      );

      const sliceUpdate = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(sliceUpdate).toBeDefined();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(
        successAction.payload.action.payload.changedPropertiesById.t_1
      ).toContain("rowCount");
    });
  });
});
