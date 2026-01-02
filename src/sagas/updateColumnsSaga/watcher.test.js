/**
 * @fileoverview Tests for the update columns saga watcher.
 * @module sagas/updateColumnsSaga/watcher.test
 *
 * Comprehensive test suite for updateColumnsSaga (watcher) covering:
 * - Basic watcher functionality (updateColumnsRequest handling)
 * - Auto-fetching column stats on createColumnsSuccess
 * - Edge cases and action type matching
 *
 * Note: Since takeEvery directly invokes the worker (not via call effect),
 * we test by verifying the worker's output effects are produced.
 */
import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateColumnsSaga from "./watcher";
import {
  updateColumnsRequest,
  updateColumnsSuccess,
  updateColumnsFailure,
} from "./actions";
import { createColumnsSuccess } from "../createColumnsSaga/actions";
import {
  updateColumns as updateColumnsSlice,
  SUMMARY_ATTRIBUTES,
  TOP_VALUES_ATTR,
} from "../../slices/columnsSlice";
import {
  getColumnStats,
  getValueCounts,
  setColumnType,
} from "../../lib/duckdb";

/**
 * Helper to create a mock state with columns and tables
 */
const createMockState = (
  columnsById = {},
  tablesById = {},
  operationsById = {}
) => ({
  columns: {
    byId: columnsById,
    allIds: Object.keys(columnsById),
  },
  tables: {
    byId: tablesById,
    allIds: Object.keys(tablesById),
  },
  operations: {
    byId: operationsById,
    allIds: Object.keys(operationsById),
  },
});

describe("updateColumnsSaga", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updateColumnsRequest handling", () => {
    it("should invoke worker and update column in state", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "Price",
            databaseName: "price_col",
            columnType: "DOUBLE",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Products",
            databaseName: "products_db",
          },
        }
      );

      const action = updateColumnsRequest({
        columnUpdates: [{ id: "c_1", columnType: "INTEGER" }],
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([
          [matchers.call.fn(setColumnType), undefined],
          [
            matchers.call.fn(getColumnStats),
            [{ columnType: "INTEGER", count: 100 }],
          ],
        ])
        .dispatch(action)
        .silentRun(100);

      // Verify updateColumns was called from slice
      const updateColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSlice.type
      );
      expect(updateColumnsAction).toBeDefined();

      // Verify success action was dispatched
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should fetch column stats when SUMMARY_ATTRIBUTES keys are in update", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "Count",
            databaseName: "count_col",
            columnType: "INTEGER",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Metrics",
            databaseName: "metrics_db",
          },
        }
      );

      const action = updateColumnsRequest({
        columnUpdates: [{ id: "c_1", min: null, max: null }],
      });

      const mockStats = {
        min: 0,
        max: 1000,
        avg: 500,
        count: 100,
      };

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([[matchers.call.fn(getColumnStats), [mockStats]]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should fetch top values when TOP_VALUES_ATTR is in update", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "Category",
            databaseName: "category_col",
            columnType: "VARCHAR",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Products",
            databaseName: "products_db",
          },
        }
      );

      const action = updateColumnsRequest({
        columnUpdates: [{ id: "c_1", [TOP_VALUES_ATTR]: null }],
      });

      const mockTopValues = [
        { value: "Electronics", count: 50 },
        { value: "Clothing", count: 30 },
      ];

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([[matchers.call.fn(getValueCounts), mockTopValues]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should update column type in DuckDB when columnType changes", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "Amount",
            databaseName: "amount_col",
            columnType: "VARCHAR",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Transactions",
            databaseName: "transactions_db",
          },
        }
      );

      const action = updateColumnsRequest({
        columnUpdates: [{ id: "c_1", columnType: "DOUBLE" }],
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([
          [matchers.call.fn(setColumnType), undefined],
          [matchers.call.fn(getColumnStats), [{ columnType: "DOUBLE" }]],
        ])
        .dispatch(action)
        .silentRun(100);

      // Verify setColumnType was called
      const setColumnTypeCall = effects.call.find(
        (effect) => effect.payload.fn === setColumnType
      );
      expect(setColumnTypeCall).toBeDefined();
    });

    it("should handle multiple column updates", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "Price",
            databaseName: "price_col",
            columnType: "DOUBLE",
          },
          c_2: {
            id: "c_2",
            parentId: "t_1",
            name: "Quantity",
            databaseName: "quantity_col",
            columnType: "INTEGER",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Orders",
            databaseName: "orders_db",
          },
        }
      );

      const action = updateColumnsRequest({
        columnUpdates: [
          { id: "c_1", min: null },
          { id: "c_2", max: null },
        ],
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([[matchers.call.fn(getColumnStats), [{ min: 0, max: 100 }]]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should handle columns belonging to operations", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "op_1", // Operation parent
            name: "Result",
            databaseName: "result_col",
            columnType: "INTEGER",
          },
        },
        {},
        {
          op_1: {
            id: "op_1",
            name: "Stack Operation",
            databaseName: "stack_op_db",
          },
        }
      );

      const action = updateColumnsRequest({
        columnUpdates: [{ id: "c_1", min: null }],
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([[matchers.call.fn(getColumnStats), [{ min: 0 }]]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("auto-update on createColumnsSuccess", () => {
    it("should dispatch updateColumnsRequest when columns are created", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "NewColumn",
            databaseName: "new_col",
            columnType: "VARCHAR",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Table1",
            databaseName: "table1_db",
          },
        }
      );

      const action = createColumnsSuccess({
        columnIds: ["c_1"],
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([
          [matchers.call.fn(getColumnStats), [{}]],
          [matchers.call.fn(getValueCounts), []],
        ])
        .dispatch(action)
        .silentRun(100);

      // Should dispatch updateColumnsRequest with column updates
      const updateRequest = effects.put.find(
        (effect) => effect.payload?.action?.type === updateColumnsRequest.type
      );
      expect(updateRequest).toBeDefined();

      // Verify columnUpdates includes SUMMARY_ATTRIBUTES (except columnType) and TOP_VALUES_ATTR
      const columnUpdates = updateRequest.payload.action.payload.columnUpdates;
      expect(columnUpdates).toHaveLength(1);
      expect(columnUpdates[0].id).toBe("c_1");
      expect(columnUpdates[0]).toHaveProperty(TOP_VALUES_ATTR);
    });

    it("should handle multiple columns in createColumnsSuccess", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "Column1",
            databaseName: "col1",
            columnType: "VARCHAR",
          },
          c_2: {
            id: "c_2",
            parentId: "t_1",
            name: "Column2",
            databaseName: "col2",
            columnType: "INTEGER",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Table1",
            databaseName: "table1_db",
          },
        }
      );

      const action = createColumnsSuccess({
        columnIds: ["c_1", "c_2"],
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([
          [matchers.call.fn(getColumnStats), [{}]],
          [matchers.call.fn(getValueCounts), []],
        ])
        .dispatch(action)
        .silentRun(100);

      const updateRequest = effects.put.find(
        (effect) => effect.payload?.action?.type === updateColumnsRequest.type
      );
      expect(updateRequest).toBeDefined();

      const columnUpdates = updateRequest.payload.action.payload.columnUpdates;
      expect(columnUpdates).toHaveLength(2);
      expect(columnUpdates.map((u) => u.id)).toContain("c_1");
      expect(columnUpdates.map((u) => u.id)).toContain("c_2");
    });

    it("should include all SUMMARY_ATTRIBUTES except columnType in updates", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "TestColumn",
            databaseName: "test_col",
            columnType: "INTEGER",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Table1",
            databaseName: "table1_db",
          },
        }
      );

      const action = createColumnsSuccess({
        columnIds: ["c_1"],
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([
          [matchers.call.fn(getColumnStats), [{}]],
          [matchers.call.fn(getValueCounts), []],
        ])
        .dispatch(action)
        .silentRun(100);

      const updateRequest = effects.put.find(
        (effect) => effect.payload?.action?.type === updateColumnsRequest.type
      );
      const columnUpdate =
        updateRequest.payload.action.payload.columnUpdates[0];

      // Should have all SUMMARY_ATTRIBUTES except columnType
      const expectedAttrs = SUMMARY_ATTRIBUTES.filter(
        (attr) => attr !== "columnType"
      );
      for (const attr of expectedAttrs) {
        expect(columnUpdate).toHaveProperty(attr);
      }
      // Should NOT have columnType
      expect(columnUpdate).not.toHaveProperty("columnType");
    });
  });

  describe("action type matching", () => {
    it("should respond to updateColumnsRequest action type", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "TestCol",
            databaseName: "test_col",
            columnType: "VARCHAR",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Table1",
            databaseName: "table1_db",
          },
        }
      );

      const action = {
        type: updateColumnsRequest.type,
        payload: { columnUpdates: [{ id: "c_1", min: null }] },
      };

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([[matchers.call.fn(getColumnStats), [{ min: 0 }]]])
        .dispatch(action)
        .silentRun(100);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("should respond to createColumnsSuccess action type", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "TestCol",
            databaseName: "test_col",
            columnType: "VARCHAR",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Table1",
            databaseName: "table1_db",
          },
        }
      );

      const action = {
        type: createColumnsSuccess.type,
        payload: { columnIds: ["c_1"] },
      };

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([
          [matchers.call.fn(getColumnStats), [{}]],
          [matchers.call.fn(getValueCounts), []],
        ])
        .dispatch(action)
        .silentRun(100);

      const updateRequest = effects.put.find(
        (effect) => effect.payload?.action?.type === updateColumnsRequest.type
      );
      expect(updateRequest).toBeDefined();
    });

    it("should not respond to unrelated action types", async () => {
      const mockState = createMockState();

      const action = { type: "UNRELATED_ACTION", payload: {} };

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .dispatch(action)
        .silentRun(100);

      // Should have no put effects
      expect(effects.put).toBeUndefined();
    });
  });

  describe("edge cases", () => {
    it("should handle empty columnUpdates array", async () => {
      const mockState = createMockState();

      const action = updateColumnsRequest({
        columnUpdates: [],
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .dispatch(action)
        .silentRun(100);

      // Should not dispatch success with empty updates
      const successAction = effects.put?.find(
        (effect) => effect.payload.action.type === updateColumnsSuccess.type
      );
      expect(successAction).toBeUndefined();
    });

    it("should handle single columnId in createColumnsSuccess (not array)", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "SingleCol",
            databaseName: "single_col",
            columnType: "VARCHAR",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Table1",
            databaseName: "table1_db",
          },
        }
      );

      // Send single string instead of array
      const action = createColumnsSuccess({
        columnIds: "c_1",
      });

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([
          [matchers.call.fn(getColumnStats), [{}]],
          [matchers.call.fn(getValueCounts), []],
        ])
        .dispatch(action)
        .silentRun(100);

      const updateRequest = effects.put.find(
        (effect) => effect.payload?.action?.type === updateColumnsRequest.type
      );
      expect(updateRequest).toBeDefined();
    });
  });

  describe("integration flow", () => {
    it("should complete full update flow from request to success", async () => {
      const mockState = createMockState(
        {
          c_1: {
            id: "c_1",
            parentId: "t_1",
            name: "Price",
            databaseName: "price_col",
            columnType: "DOUBLE",
          },
        },
        {
          t_1: {
            id: "t_1",
            name: "Products",
            databaseName: "products_db",
          },
        }
      );

      const action = updateColumnsRequest({
        columnUpdates: [
          { id: "c_1", columnType: "INTEGER", min: null, max: null },
        ],
      });

      const mockStats = {
        columnType: "INTEGER",
        min: 0,
        max: 1000,
        avg: 500,
      };

      const { effects } = await expectSaga(updateColumnsSaga)
        .withState(mockState)
        .provide([
          [matchers.call.fn(setColumnType), undefined],
          [matchers.call.fn(getColumnStats), [mockStats]],
        ])
        .dispatch(action)
        .silentRun(100);

      // Verify the flow: setColumnType -> getColumnStats -> updateColumnsSlice -> updateColumnsSuccess
      expect(effects.call.some((c) => c.payload.fn === setColumnType)).toBe(
        true
      );
      expect(effects.call.some((c) => c.payload.fn === getColumnStats)).toBe(
        true
      );

      const sliceUpdate = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSlice.type
      );
      expect(sliceUpdate).toBeDefined();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateColumnsSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });
});
