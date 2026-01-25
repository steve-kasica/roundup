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

  describe("successful single table deletion", () => {
    let result;
    beforeEach(async () => {
      const mockState = createMockState({
        t1: {
          id: "t1",
          databaseName: "t1_db",
          columnIds: ["c1", "c2", "c3"],
        },
      });
      const action = {
        payload: {
          tableIds: ["t1"],
        },
      };

      result = await expectSaga(deleteTablesWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .run();
    });
    it("dispatches a single deleteTables action", async () => {
      const { effects } = result;
      // Verify the slice delete action was dispatched
      const deleteTablesActions = effects.put.filter(
        (effect) => effect.payload.action.type === deleteTablesInSlice.type,
      );
      expect(deleteTablesActions).toHaveLength(1);
      expect(deleteTablesActions[0].payload.action.payload).toBe("t1");
    });
    it("dispatches a removeFromSelectedTableIds action", async () => {
      const { effects } = result;
      // Verify the UI slice action was dispatched
      const removeSelectedActions = effects.put.filter(
        (effect) =>
          effect.payload.action.type === "ui/removeFromSelectedTableIds",
      );
      expect(removeSelectedActions).toHaveLength(1);
      expect(removeSelectedActions[0].payload.action.payload).toBe("t1");
    });
    it("dispatches a deleteTablesSuccess action", async () => {
      const { effects } = result;
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type,
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.tableIds).toContain("t1");
    });
  });

  describe("successful multiple table deletion", () => {
    let result;
    beforeEach(async () => {
      const mockState = createMockState({
        t1: {
          id: "t1",
          databaseName: "t1_db",
          columnIds: ["c1", "c2", "c3"],
        },
        t2: {
          id: "t2",
          databaseName: "t2_db",
          columnIds: ["c4", "c5"],
        },
      });
      const action = {
        payload: {
          tableIds: ["t1", "t2"],
        },
      };

      result = await expectSaga(deleteTablesWorker, action)
        .withState(mockState)
        .provide([[matchers.call.fn(dropTable), undefined]])
        .run();
    });
    it("dispatches multiple deleteTables actions", async () => {
      const { effects } = result;
      // Verify the slice delete action was dispatched
      const deleteTablesActions = effects.put.filter(
        (effect) => effect.payload.action.type === deleteTablesInSlice.type,
      );
      expect(deleteTablesActions).toHaveLength(2);
      expect(deleteTablesActions[0].payload.action.payload).toEqual("t1");
      expect(deleteTablesActions[1].payload.action.payload).toEqual("t2");
    });
    it("dispatches a removeFromSelectedTableIds action for each table", async () => {
      const { effects } = result;
      // Verify the UI slice action was dispatched
      const removeSelectedActions = effects.put.filter(
        (effect) =>
          effect.payload.action.type === "ui/removeFromSelectedTableIds",
      );
      expect(removeSelectedActions).toHaveLength(2);
      expect(removeSelectedActions[0].payload.action.payload).toEqual("t1");
      expect(removeSelectedActions[1].payload.action.payload).toEqual("t2");
    });
    it("dispatches a deleteTablesSuccess action", async () => {
      const { effects } = result;
      const successAction = effects.put.find(
        (effect) => effect.payload.action.type === deleteTablesSuccess.type,
      );
      expect(successAction).toBeDefined();
      expect(successAction.payload.action.payload.tableIds).toEqual([
        "t1",
        "t2",
      ]);
    });
  });
});
