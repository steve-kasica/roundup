import { describe, it, expect, beforeEach, vi } from "vitest";
import { expectSaga } from "redux-saga-test-plan";
import deleteColumnsWorker from "./worker";
import { deleteColumns as deleteColumnsFromSlice } from "../../slices/columnsSlice";
import { deleteColumnsSuccess, deleteColumnsFailure } from "./actions";
import { updateTablesRequest } from "../updateTablesSaga";

// Mock dropColumns at module level since worker uses `yield dropColumns()` instead of `yield call(dropColumns)`
vi.mock("../../lib/duckdb", () => ({
  dropColumns: vi.fn(() => Promise.resolve()),
}));

import { dropColumns } from "../../lib/duckdb";

/**
 * Helper to create a mock state with tables
 */
const createMockState = (tablesById = {}) => ({
  tables: {
    byId: tablesById,
    allIds: Object.keys(tablesById),
  },
});

describe("deleteColumnsWorker saga", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset to default successful behavior
    dropColumns.mockResolvedValue(undefined);
  });

  describe("Deleting table columns", () => {
    const mockState = {
      operations: {
        byId: {},
        allIds: [],
      },
      tables: {
        byId: {
          t1: {
            id: "t1",
            databaseName: "table_1",
            columnIds: ["c1", "c2", "c3"],
          },
        },
        allIds: ["t1"],
      },
      columns: {
        byId: {
          c1: { id: "c1", parentId: "t1", databaseName: "col_a" },
          c2: { id: "c2", parentId: "t1", databaseName: "col_b" },
          c3: { id: "c3", parentId: "t1", databaseName: "col_c" },
        },
        allIds: ["c1", "c2", "c3"],
      },
    };

    const columnsToDelete = [
      { id: "c1", parentId: "t1" },
      { id: "c2", parentId: "t1" },
    ];
    it("should delete columns from database and dispatch success actions", async () => {
      await expectSaga(deleteColumnsWorker, columnsToDelete, true)
        .withState(mockState)
        .put(deleteColumnsFromSlice(["c1", "c2"]))
        .put(deleteColumnsSuccess(columnsToDelete))
        .run();

      expect(dropColumns).toHaveBeenCalledWith("table_1", ["col_a", "col_b"]);
    });
  });

  // describe("deleting columns from database", () => {
  //   it("deletes a single column from database and state", async () => {
  //     const tablesToAlter = [
  //       {
  //         tableId: "t_1",
  //         columnsToDelete: [{ id: "c_1", databaseName: "col_a" }],
  //         deleteFromDatabase: true,
  //       },
  //     ];

  //     const { effects } = await expectSaga(deleteColumnsWorker, tablesToAlter)
  //       .withState(mockState)
  //       .run();

  //     // Verify dropColumns was called
  //     expect(dropColumns).toHaveBeenCalledWith("table_1", ["col_a"]);

  //     // Verify deleteColumns was called from slice
  //     const deleteColumnsAction = effects.put.find(
  //       (effect) => effect.payload.action.type === deleteColumnsFromSlice.type
  //     );
  //     expect(deleteColumnsAction).toBeDefined();
  //     expect(deleteColumnsAction.payload.action.payload).toContain("c_1");

  //     // Verify success action was dispatched
  //     const successAction = effects.put.find(
  //       (effect) => effect.payload.action.type === deleteColumnsSuccess.type
  //     );
  //     expect(successAction).toBeDefined();

  //     // Verify updateTablesRequest was dispatched to update columnIds
  //     const updateTablesAction = effects.put.find(
  //       (effect) => effect.payload.action.type === updateTablesRequest.type
  //     );
  //     expect(updateTablesAction).toBeDefined();
  //     expect(
  //       updateTablesAction.payload.action.payload.tableUpdates[0].columnIds
  //     ).toEqual(["c_2", "c_3"]);
  //   });

  //   it("deletes multiple columns from same table", async () => {
  //     const tablesToAlter = [
  //       {
  //         tableId: "t_1",
  //         columnsToDelete: [
  //           { id: "c_1", databaseName: "col_a" },
  //           { id: "c_2", databaseName: "col_b" },
  //         ],
  //         deleteFromDatabase: true,
  //       },
  //     ];

  //     const mockState = createMockState({
  //       t_1: {
  //         id: "t_1",
  //         databaseName: "table_1",
  //         columnIds: ["c_1", "c_2", "c_3"],
  //       },
  //     });

  //     const { effects } = await expectSaga(deleteColumnsWorker, tablesToAlter)
  //       .withState(mockState)
  //       .run();

  //     const deleteColumnsAction = effects.put.find(
  //       (effect) => effect.payload.action.type === deleteColumnsFromSlice.type
  //     );
  //     expect(deleteColumnsAction).toBeDefined();
  //     expect(deleteColumnsAction.payload.action.payload).toContain("c_1");
  //     expect(deleteColumnsAction.payload.action.payload).toContain("c_2");

  //     const updateTablesAction = effects.put.find(
  //       (effect) => effect.payload.action.type === updateTablesRequest.type
  //     );
  //     expect(
  //       updateTablesAction.payload.action.payload.tableUpdates[0].columnIds
  //     ).toEqual(["c_3"]);
  //   });
  // });

  // describe("deleting columns from state only", () => {
  //   it("deletes columns from state without database call", async () => {
  //     const tablesToAlter = [
  //       {
  //         tableId: "t_1",
  //         columnsToDelete: [{ id: "c_1", databaseName: "col_a" }],
  //         deleteFromDatabase: false,
  //       },
  //     ];

  //     const { effects } = await expectSaga(
  //       deleteColumnsWorker,
  //       tablesToAlter
  //     ).run();

  //     // Verify dropColumns was NOT called
  //     expect(dropColumns).not.toHaveBeenCalled();

  //     // Verify deleteColumns was called
  //     const deleteColumnsAction = effects.put.find(
  //       (effect) => effect.payload.action.type === deleteColumnsFromSlice.type
  //     );
  //     expect(deleteColumnsAction).toBeDefined();

  //     // Verify success action was dispatched
  //     const successAction = effects.put.find(
  //       (effect) => effect.payload.action.type === deleteColumnsSuccess.type
  //     );
  //     expect(successAction).toBeDefined();

  //     // No updateTablesRequest should be dispatched for state-only deletion
  //     const updateTablesAction = effects.put?.find(
  //       (effect) => effect.payload.action.type === updateTablesRequest.type
  //     );
  //     expect(updateTablesAction).toBeUndefined();
  //   });
  // });

  // describe("multiple tables", () => {
  //   it("handles deleting columns from multiple tables", async () => {
  //     const tablesToAlter = [
  //       {
  //         tableId: "t_1",
  //         columnsToDelete: [{ id: "c_1", databaseName: "col_a" }],
  //         deleteFromDatabase: true,
  //       },
  //       {
  //         tableId: "t_2",
  //         columnsToDelete: [{ id: "c_3", databaseName: "col_c" }],
  //         deleteFromDatabase: true,
  //       },
  //     ];

  //     const mockState = createMockState({
  //       t_1: {
  //         id: "t_1",
  //         databaseName: "table_1",
  //         columnIds: ["c_1", "c_2"],
  //       },
  //       t_2: {
  //         id: "t_2",
  //         databaseName: "table_2",
  //         columnIds: ["c_3", "c_4"],
  //       },
  //     });

  //     const { effects } = await expectSaga(deleteColumnsWorker, tablesToAlter)
  //       .withState(mockState)
  //       .run();

  //     const deleteColumnsAction = effects.put.find(
  //       (effect) => effect.payload.action.type === deleteColumnsFromSlice.type
  //     );
  //     expect(deleteColumnsAction.payload.action.payload).toHaveLength(2);
  //   });
  // });

  // describe("edge cases", () => {
  //   it("handles empty tablesToAlter array", async () => {
  //     const tablesToAlter = [];

  //     const { effects } = await expectSaga(
  //       deleteColumnsWorker,
  //       tablesToAlter
  //     ).run();

  //     // No actions should be dispatched
  //     expect(effects.put).toBeUndefined();
  //   });
  // });
});
