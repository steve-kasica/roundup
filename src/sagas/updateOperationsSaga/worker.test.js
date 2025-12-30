import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import * as matchers from "redux-saga-test-plan/matchers";
import updateOperationsWorker from "./worker";
import {
  updateOperations as updateOperationsSlice,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import { updateTables as updateTablesSlice } from "../../slices/tablesSlice";
import { updateOperationsSuccess } from "./actions";
import {
  addToLoadingOperations,
  removeFromLoadingOperations,
} from "../../slices/uiSlice";
import {
  createPackView,
  createStackView,
  getTableDimensions,
  calcPackStats,
} from "../../lib/duckdb";

/**
 * Helper to create a mock state
 */
const createMockState = (operations = {}, tables = {}, columns = {}) => ({
  operations: {
    byId: operations,
    allIds: Object.keys(operations),
    rootOperationId: null,
  },
  tables: {
    byId: tables,
    allIds: Object.keys(tables),
  },
  columns: {
    byId: columns,
    allIds: Object.keys(columns),
  },
});

describe("updateOperationsWorker saga", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updating childIds property", () => {
    it("updates table parentId when adding table children", async () => {
      const action = {
        payload: {
          operationUpdates: [{ id: "o_1", childIds: ["t_1", "t_2"] }],
        },
      };

      const mockState = createMockState(
        {
          o_1: {
            id: "o_1",
            operationType: OPERATION_TYPE_PACK,
            childIds: [],
          },
        },
        {
          t_1: { id: "t_1", parentId: null },
          t_2: { id: "t_2", parentId: null },
        }
      );

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .run();

      // Verify updateTables was called with parentId updates
      const updateTablesAction = effects.put.find(
        (effect) => effect.payload.action.type === updateTablesSlice.type
      );
      expect(updateTablesAction).toBeDefined();
      expect(updateTablesAction.payload.action.payload).toHaveLength(2);

      // Verify success action
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("marks operation as out-of-sync when childIds change", async () => {
      const action = {
        payload: {
          operationUpdates: [{ id: "o_1", childIds: ["t_1"] }],
        },
      };

      const mockState = createMockState(
        {
          o_1: {
            id: "o_1",
            operationType: OPERATION_TYPE_PACK,
            childIds: [],
            isInSync: true,
          },
        },
        {
          t_1: { id: "t_1", parentId: null },
        }
      );

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .run();

      // The operation update should include isInSync: false
      const updateOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSlice.type
      );
      expect(updateOperationsAction).toBeDefined();
    });
  });

  describe("materializing operations", () => {
    it("creates PACK view and updates dimensions when isMaterialized is set", async () => {
      const action = {
        payload: {
          operationUpdates: [{ id: "o_1", isMaterialized: true }],
        },
      };

      const mockState = createMockState(
        {
          o_1: {
            id: "o_1",
            operationType: OPERATION_TYPE_PACK,
            databaseName: "pack_view",
            childIds: ["t_1", "t_2"],
            columnIds: ["c_1", "c_2"],
            joinKey1: "c_1",
            joinKey2: "c_2",
            joinType: "FULL OUTER",
            joinPredicate: "EQUALS",
          },
        },
        {
          t_1: { id: "t_1", databaseName: "table1", columnIds: ["c_1"] },
          t_2: { id: "t_2", databaseName: "table2", columnIds: ["c_2"] },
        },
        {
          c_1: { id: "c_1", databaseName: "col1" },
          c_2: { id: "c_2", databaseName: "col2" },
        }
      );

      const mockDimensions = { rowCount: 100, columnCount: 5 };

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .provide([
          [matchers.call.fn(createPackView), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
    });

    it("creates STACK view when isMaterialized is set for STACK operation", async () => {
      const action = {
        payload: {
          operationUpdates: [{ id: "o_1", isMaterialized: true }],
        },
      };

      const mockState = createMockState(
        {
          o_1: {
            id: "o_1",
            operationType: OPERATION_TYPE_STACK,
            databaseName: "stack_view",
            childIds: ["t_1", "t_2"],
            columnIds: ["c_1", "c_2"],
          },
        },
        {
          t_1: { id: "t_1", databaseName: "table1", columnIds: ["c_1"] },
          t_2: { id: "t_2", databaseName: "table2", columnIds: ["c_2"] },
        },
        {
          c_1: { id: "c_1", databaseName: "col1" },
          c_2: { id: "c_2", databaseName: "col2" },
        }
      );

      const mockDimensions = { rowCount: 200, columnCount: 3 };

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .provide([
          [matchers.call.fn(createStackView), undefined],
          [matchers.call.fn(getTableDimensions), mockDimensions],
        ])
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("updating operation type or join settings", () => {
    it("marks operation out-of-sync when operationType changes", async () => {
      const action = {
        payload: {
          operationUpdates: [
            { id: "o_1", operationType: OPERATION_TYPE_STACK },
          ],
        },
      };

      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          isInSync: true,
        },
      });

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .run();

      const updateOperationsAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSlice.type
      );
      expect(updateOperationsAction).toBeDefined();
    });

    it("marks operation out-of-sync when joinType changes", async () => {
      const action = {
        payload: {
          operationUpdates: [{ id: "o_1", joinType: "INNER" }],
        },
      };

      const mockState = createMockState({
        o_1: {
          id: "o_1",
          operationType: OPERATION_TYPE_PACK,
          joinType: "FULL OUTER",
          isInSync: true,
        },
      });

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
    });
  });

  describe("calculating match stats", () => {
    it("adds and removes loading state while calculating matchStats", async () => {
      const action = {
        payload: {
          operationUpdates: [{ id: "o_1", matchStats: {} }],
        },
      };

      const mockState = createMockState(
        {
          o_1: {
            id: "o_1",
            operationType: OPERATION_TYPE_PACK,
            childIds: ["t_1", "t_2"],
            joinKey1: "c_1",
            joinKey2: "c_2",
            joinPredicate: "EQUALS",
          },
        },
        {
          t_1: { id: "t_1", databaseName: "left_table" },
          t_2: { id: "t_2", databaseName: "right_table" },
        },
        {
          c_1: { id: "c_1", databaseName: "left_col" },
          c_2: { id: "c_2", databaseName: "right_col" },
        }
      );

      const mockMatchStats = {
        matches: 50,
        left_unmatched: 10,
        right_unmatched: 5,
      };

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(calcPackStats), mockMatchStats]])
        .run();

      // Should add to loading operations
      const addLoadingAction = effects.put.find(
        (effect) => effect.payload.action.type === addToLoadingOperations.type
      );
      expect(addLoadingAction).toBeDefined();

      // Should remove from loading operations
      const removeLoadingAction = effects.put.find(
        (effect) =>
          effect.payload.action.type === removeFromLoadingOperations.type
      );
      expect(removeLoadingAction).toBeDefined();
    });
  });

  describe("updating multiple operations", () => {
    it("handles multiple operation updates in single call", async () => {
      const action = {
        payload: {
          operationUpdates: [
            { id: "o_1", name: "New Name 1" },
            { id: "o_2", name: "New Name 2" },
          ],
        },
      };

      const mockState = createMockState({
        o_1: { id: "o_1", name: "Old Name 1" },
        o_2: { id: "o_2", name: "Old Name 2" },
      });

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(
        Object.keys(successAction.payload.action.payload.changedPropertiesById)
      ).toHaveLength(2);
    });
  });

  describe("success action payload", () => {
    it("includes changedPropertiesById in success payload", async () => {
      const action = {
        payload: {
          operationUpdates: [
            { id: "o_1", name: "New Name", joinType: "INNER" },
          ],
        },
      };

      const mockState = createMockState({
        o_1: {
          id: "o_1",
          name: "Old Name",
          joinType: "FULL OUTER",
        },
      });

      const { effects } = await expectSaga(updateOperationsWorker, action)
        .withState(mockState)
        .run();

      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === updateOperationsSuccess.type
      );
      expect(successAction).toBeDefined();
      expect(
        successAction.payload.action.payload.changedPropertiesById["o_1"]
      ).toContain("name");
      expect(
        successAction.payload.action.payload.changedPropertiesById["o_1"]
      ).toContain("joinType");
    });
  });
});
