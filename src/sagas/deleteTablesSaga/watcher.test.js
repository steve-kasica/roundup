/**
 * @fileoverview Tests for the delete tables saga watcher.
 * @module sagas/deleteTablesSaga/watcher.test
 *
 * Comprehensive test suite for deleteTablesSagaWatcher covering:
 * - Basic watcher functionality (deleteTablesRequest handling)
 * - Auto-deletion of tables with empty columnIds (updateTablesSuccess handling)
 * - Edge cases and action type matching
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import deleteTablesSagaWatcher from "./watcher";
import { deleteTablesRequest, deleteTablesSuccess } from "./actions";
import { deleteTables as deleteTablesInSlice } from "../../slices/tablesSlice";
import { deleteColumns as deleteColumnsInSlice } from "../../slices/columnsSlice";
import { updateTablesSuccess } from "../updateTablesSaga";
import { dropTable } from "../../lib/duckdb";

/**
 * Helper to create a mock state with tables
 */
const createMockState = (tablesById = {}) => ({
  tables: {
    byId: tablesById,
    allIds: Object.keys(tablesById),
  },
});

describe("deleteTablesSagaWatcher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("deleteTablesRequest handling", () => {
    it("should invoke worker and delete table from state", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          columnIds: ["c_1", "c_2"],
        },
      });

      const action = deleteTablesRequest({
        tableIds: ["t_1"],
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      // Verify deleteTables was called from slice
      const deleteTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesInSlice.type
      );
      expect(deleteTablesAction).toBeDefined();

      // Verify success action was dispatched
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should delete table columns along with the table", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Products",
          databaseName: "products_db",
          columnIds: ["c_1", "c_2", "c_3"],
        },
      });

      const action = deleteTablesRequest({
        tableIds: ["t_1"],
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      // Verify columns were deleted from slice
      const deleteColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteColumnsInSlice.type
      );
      expect(deleteColumnsAction).toBeDefined();
      expect(deleteColumnsAction.payload.action.payload).toEqual([
        "c_1",
        "c_2",
        "c_3",
      ]);
    });

    it("should delete multiple tables", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          columnIds: ["c_1"],
        },
        t_2: {
          id: "t_2",
          name: "Products",
          databaseName: "products_db",
          columnIds: ["c_2"],
        },
      });

      const action = deleteTablesRequest({
        tableIds: ["t_1", "t_2"],
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.tableIds).toContain("t_1");
      expect(successAction.payload.action.payload.tableIds).toContain("t_2");
    });

    it("should handle sequential deleteTablesRequest actions", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          columnIds: ["c_1"],
        },
        t_2: {
          id: "t_2",
          name: "Products",
          databaseName: "products_db",
          columnIds: ["c_2"],
        },
      });

      const action1 = deleteTablesRequest({
        tableIds: ["t_1"],
      });

      const action2 = deleteTablesRequest({
        tableIds: ["t_2"],
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action1)
        .dispatch(action2)
        .silentRun(100);

      // Should have dispatched success twice
      const successActions = effects.put.filter(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successActions).toHaveLength(2);
    });
  });

  describe("auto-deletion of tables with empty columnIds", () => {
    it("should dispatch deleteTablesRequest when table has empty columnIds", async () => {
      // Need to have the table in state so the worker can look it up
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "EmptyTable",
          databaseName: "empty_table_db",
          columnIds: [],
        },
      });

      const action = updateTablesSuccess({
        changedPropertiesById: {
          t_1: {
            columnIds: [], // Empty columnIds
          },
        },
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      // Should dispatch deleteTablesRequest for table with empty columnIds
      const deleteRequest = effects.put.find(
        (effect) => effect.payload?.action?.type === deleteTablesRequest.type
      );
      expect(deleteRequest).toBeDefined();
      expect(deleteRequest.payload.action.payload.tableIds).toContain("t_1");
    });

    it("should not delete table if columnIds is not empty", async () => {
      const action = updateTablesSuccess({
        changedPropertiesById: {
          t_1: {
            columnIds: ["c_1", "c_2"], // Has columns
          },
        },
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(createMockState())
        .dispatch(action)
        .silentRun(100);

      // Should not dispatch deleteTablesRequest
      const deleteRequest = effects.put?.find(
        (effect) => effect.payload?.action?.type === deleteTablesRequest.type
      );
      expect(deleteRequest).toBeUndefined();
    });

    it("should not trigger deletion when columnIds is not in changed properties", async () => {
      const action = updateTablesSuccess({
        changedPropertiesById: {
          t_1: {
            name: "New Name",
            rowCount: 100,
          },
        },
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(createMockState())
        .dispatch(action)
        .silentRun(100);

      // Should not dispatch deleteTablesRequest
      const deleteRequest = effects.put?.find(
        (effect) => effect.payload?.action?.type === deleteTablesRequest.type
      );
      expect(deleteRequest).toBeUndefined();
    });

    it("should handle multiple tables with empty columnIds", async () => {
      // Need to have both tables in state so the worker can look them up
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "EmptyTable1",
          databaseName: "empty_table_1_db",
          columnIds: [],
        },
        t_2: {
          id: "t_2",
          name: "EmptyTable2",
          databaseName: "empty_table_2_db",
          columnIds: [],
        },
      });

      const action = updateTablesSuccess({
        changedPropertiesById: {
          t_1: {
            columnIds: [],
          },
          t_2: {
            columnIds: [],
          },
        },
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      const deleteRequest = effects.put.find(
        (effect) => effect.payload?.action?.type === deleteTablesRequest.type
      );
      expect(deleteRequest).toBeDefined();
      expect(deleteRequest.payload.action.payload.tableIds).toContain("t_1");
      expect(deleteRequest.payload.action.payload.tableIds).toContain("t_2");
    });

    it("should only delete tables with empty columnIds when mixed", async () => {
      // Need all tables in state so the worker can look them up
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "EmptyTable1",
          databaseName: "empty_table_1_db",
          columnIds: [],
        },
        t_2: {
          id: "t_2",
          name: "TableWithColumns",
          databaseName: "table_with_cols_db",
          columnIds: ["c_1"],
        },
        t_3: {
          id: "t_3",
          name: "EmptyTable2",
          databaseName: "empty_table_2_db",
          columnIds: [],
        },
      });

      const action = updateTablesSuccess({
        changedPropertiesById: {
          t_1: {
            columnIds: [], // Empty - should be deleted
          },
          t_2: {
            columnIds: ["c_1"], // Has columns - should not be deleted
          },
          t_3: {
            columnIds: [], // Empty - should be deleted
          },
        },
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      const deleteRequest = effects.put.find(
        (effect) => effect.payload?.action?.type === deleteTablesRequest.type
      );
      expect(deleteRequest).toBeDefined();
      expect(deleteRequest.payload.action.payload.tableIds).toContain("t_1");
      expect(deleteRequest.payload.action.payload.tableIds).toContain("t_3");
      expect(deleteRequest.payload.action.payload.tableIds).not.toContain(
        "t_2"
      );
    });
  });

  describe("action type matching", () => {
    it("should only respond to deleteTablesRequest action type", async () => {
      const unrelatedAction = { type: "UNRELATED_ACTION", payload: {} };

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(createMockState())
        .dispatch(unrelatedAction)
        .silentRun(100);

      // Should not have dispatched any delete-related actions
      const deleteAction = effects.put?.find(
        (effect) => effect.payload?.action?.type === deleteTablesInSlice.type
      );

      expect(deleteAction).toBeUndefined();
    });

    it("should not respond to deleteTablesSuccess action for worker triggering", async () => {
      const successAction = deleteTablesSuccess({
        tableIds: ["t_1"],
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(createMockState())
        .dispatch(successAction)
        .silentRun(100);

      // Should not have dispatched deleteTables from slice
      const deleteAction = effects.put?.find(
        (effect) => effect.payload?.action?.type === deleteTablesInSlice.type
      );

      expect(deleteAction).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle table with no columns", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Empty Table",
          databaseName: "empty_db",
          columnIds: [],
        },
      });

      const action = deleteTablesRequest({
        tableIds: ["t_1"],
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      // Should still delete columns (empty array)
      const deleteColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteColumnsInSlice.type
      );
      expect(deleteColumnsAction).toBeDefined();
      expect(deleteColumnsAction.payload.action.payload).toEqual([]);

      // Should delete table
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should handle single table ID not in array format", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          columnIds: ["c_1"],
        },
      });

      // Worker normalizes single ID to array
      const action = deleteTablesRequest({
        tableIds: "t_1",
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("integration flow", () => {
    it("should complete full flow from request to success", async () => {
      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Test Table",
          databaseName: "test_db",
          columnIds: ["c_1", "c_2", "c_3"],
        },
      });

      const action = deleteTablesRequest({
        tableIds: ["t_1"],
      });

      const { effects } = await expectSaga(deleteTablesSagaWatcher)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .dispatch(action)
        .silentRun(100);

      // Verify the complete flow:
      // 1. deleteColumns was called
      const deleteColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteColumnsInSlice.type
      );
      expect(deleteColumnsAction).toBeDefined();

      // 2. deleteTables was called
      const deleteTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesInSlice.type
      );
      expect(deleteTablesAction).toBeDefined();

      // 3. success was dispatched
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });
});
