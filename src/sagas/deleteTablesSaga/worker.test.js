import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import { throwError } from "redux-saga-test-plan/providers";
import deleteTablesWorker from "./worker";
import { deleteTables as deleteTablesInSlice } from "../../slices/tablesSlice";
import { deleteColumns as deleteColumnsInSlice } from "../../slices/columnsSlice";
import { deleteTablesSuccess, deleteTablesFailure } from "./actions";
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

describe("deleteTablesWorker saga", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("successful table deletion", () => {
    it("deletes a single table and its columns from database and state", async () => {
      const action = {
        payload: {
          tableIds: ["t_1"],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          columnIds: ["c_1", "c_2", "c_3"],
        },
      });

      const { effects } = await expectSaga(deleteTablesWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .run();

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

      // Verify table was deleted from slice
      const deleteTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesInSlice.type
      );
      expect(deleteTablesAction).toBeDefined();

      // Verify success action was dispatched
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.tableIds).toContain("t_1");
    });

    it("deletes multiple tables", async () => {
      const action = {
        payload: {
          tableIds: ["t_1", "t_2"],
        },
      };

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

      const { effects } = await expectSaga(deleteTablesWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .run();

      // Should have two deleteColumns calls
      const deleteColumnsActions = effects.put.filter(
        (effect) => effect.payload.action.type === deleteColumnsInSlice.type
      );
      expect(deleteColumnsActions).toHaveLength(2);

      // Should have two deleteTables calls
      const deleteTablesActions = effects.put.filter(
        (effect) => effect.payload.action.type === deleteTablesInSlice.type
      );
      expect(deleteTablesActions).toHaveLength(2);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction.payload.action.payload.tableIds).toHaveLength(2);
    });
  });

  describe("failed table deletion", () => {
    it("dispatches failure action when database drop fails", async () => {
      const action = {
        payload: {
          tableIds: ["t_1"],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          columnIds: ["c_1"],
        },
      });

      const { effects } = await expectSaga(deleteTablesWorker, action)
        .withState(mockState)
        .provide([
          [matchers.call.fn(dropTable), throwError(new Error("Drop failed"))],
        ])
        .run();

      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesFailure.type
      );
      expect(failureAction).toBeDefined();
      expect(failureAction.payload.action.payload.tableIds).toContain("t_1");
    });
  });

  describe("partial success scenarios", () => {
    it("reports both successes and failures when some tables fail", async () => {
      const action = {
        payload: {
          tableIds: ["t_1", "t_2"],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Good",
          databaseName: "good_db",
          columnIds: ["c_1"],
        },
        t_2: {
          id: "t_2",
          name: "Bad",
          databaseName: "bad_db",
          columnIds: ["c_2"],
        },
      });

      let callCount = 0;
      const { effects } = await expectSaga(deleteTablesWorker, action)
        .withState(mockState)
        .provide({
          call(effect, next) {
            if (effect.fn === dropTable) {
              callCount++;
              if (callCount === 2) {
                throw new Error("Drop failed");
              }
              return undefined;
            }
            return next();
          },
        })
        .run();

      // Should have both success and failure
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      const failureAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesFailure.type
      );

      expect(successAction).toBeDefined();
      expect(failureAction).toBeDefined();
    });
  });

  describe("input normalization", () => {
    it("handles single tableId (not array)", async () => {
      const action = {
        payload: {
          tableIds: "t_1", // Single ID, not array
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Sales",
          databaseName: "sales_db",
          columnIds: ["c_1"],
        },
      });

      const { effects } = await expectSaga(deleteTablesWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("edge cases", () => {
    it("handles table with no columns", async () => {
      const action = {
        payload: {
          tableIds: ["t_1"],
        },
      };

      const mockState = createMockState({
        t_1: {
          id: "t_1",
          name: "Empty",
          databaseName: "empty_db",
          columnIds: [],
        },
      });

      const { effects } = await expectSaga(deleteTablesWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .run();

      const deleteColumnsAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteColumnsInSlice.type
      );
      expect(deleteColumnsAction.payload.action.payload).toEqual([]);

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });
});
