import { beforeAll, describe, expect, it, vi } from "vitest";
import { deleteColumnsRequest } from "./actions";
import { state as mockState } from "./fixtures";
import { Column } from "../../slices/columnsSlice";
import { expectSaga } from "redux-saga-test-plan";
import { rootReducer } from "../../store";
import rootSaga from "../index";
import stackInsertState from "./fixtures/stackInsertState";

// Mock all duckdb functions at the module level
vi.mock("../../lib/duckdb", () => ({
  dropColumns: vi.fn().mockResolvedValue(undefined),
  createView: vi.fn().mockResolvedValue(undefined),
  dropView: vi.fn().mockResolvedValue(undefined),
  getTableDimensions: vi
    .fn()
    .mockResolvedValue({ rowCount: 100, columnCount: 1 }),
  insertColumn: vi.fn().mockResolvedValue(undefined),
  getTableStats: vi.fn().mockResolvedValue([{ rowCount: 100, columnCount: 1 }]),
}));

describe("DeleteColumnsSaga Integration Tests", () => {
  describe("Deleting columns from an orphaned table", () => {
    let finalState;
    beforeAll(async () => {
      // Mock window.alert
      vi.stubGlobal("alert", vi.fn());

      mockState.columns.allIds.forEach(() => Column()); // Need to increment the internal counter for generating IDs
      const action = deleteColumnsRequest(["c2", "c3", "c4"]);

      const { storeState } = await expectSaga(rootSaga)
        .withReducer(rootReducer, { ...mockState })
        .dispatch(action)
        .silentRun(1000);

      finalState = storeState;
    });
    describe("UI slice", () => {
      it("should remove the column IDs from selected columns in UI slice", () => {
        expect(finalState.ui.selectedColumnIds).toHaveLength(
          mockState.ui.selectedColumnIds.length - 3,
        );
        expect(finalState.ui.selectedColumnIds).not.toContain("c2");
        expect(finalState.ui.selectedColumnIds).not.toContain("c3");
        expect(finalState.ui.selectedColumnIds).not.toContain("c4");
      });
    });

    describe("column slice", () => {
      it("should remove the column IDs from `columns.allIds`", () => {
        expect(finalState.columns.allIds).toHaveLength(
          mockState.columns.allIds.length - 3,
        );
        expect(finalState.columns.allIds).not.toContain("c2");
        expect(finalState.columns.allIds).not.toContain("c3");
        expect(finalState.columns.allIds).not.toContain("c4");
      });

      it("should remove the column objects from `columns.byId`", () => {
        expect(finalState.columns.byId["c2"]).toBeUndefined();
        expect(finalState.columns.byId["c3"]).toBeUndefined();
        expect(finalState.columns.byId["c4"]).toBeUndefined();
      });
    });

    describe("table slice", () => {
      it("should remove the column IDs from the parent table's columnIds array", () => {
        const parentTable = finalState.tables.byId["t1"];
        expect(parentTable.columnIds).not.toContain("c2");
        expect(parentTable.columnIds).not.toContain("c3");
        expect(parentTable.columnIds).not.toContain("c4");
      });

      it("should update the parent table's columnCount", () => {
        const parentTable = finalState.tables.byId["t1"];
        const originalColumnCount =
          mockState.tables.byId["t1"].columnIds.length;
        expect(parentTable.columnCount).toEqual(originalColumnCount - 3);
      });
    });
  });

  describe("Deleting columns from a stack operation", () => {
    let finalState, initialState;
    const columnIdToDelete = "c73";
    const childColumnIdsDeleted = ["c7", "c52"];
    beforeAll(async () => {
      // Create a deep copy to avoid mutation
      initialState = JSON.parse(JSON.stringify(stackInsertState));

      const action = deleteColumnsRequest([columnIdToDelete]);
      const { storeState } = await expectSaga(rootSaga)
        .withReducer(rootReducer, initialState)
        .dispatch(action)
        .silentRun(1000);
      finalState = storeState;
    });
    describe("UI slice", () => {
      it("should not have the operation column ID from selected columns in UI slice", () => {
        expect(finalState.ui.selectedColumnIds).toHaveLength(
          initialState.ui.selectedColumnIds.length - 1,
        );
        expect(finalState.ui.selectedColumnIds).not.toContain(columnIdToDelete);
      });
    });
    describe("column slice", () => {
      it("should remove the operation column ID from `columns.allIds`", () => {
        expect(finalState.columns.allIds).toHaveLength(
          initialState.columns.allIds.length - 1,
        );
        expect(finalState.columns.allIds).not.toContain(columnIdToDelete);
      });

      it("should remove the child table column IDs from `columns.allIds`", () => {
        childColumnIdsDeleted.forEach((childColumnId) => {
          expect(finalState.columns.allIds).not.toContain(childColumnId);
        });
      });

      it("should remove the column object from `columns.byId`", () => {
        expect(finalState.columns.byId[columnIdToDelete]).toBeUndefined();
      });

      it("should remove the child table column objects from `columns.byId`", () => {
        childColumnIdsDeleted.forEach((childColumnId) => {
          expect(finalState.columns.byId[childColumnId]).toBeUndefined();
        });
      });
    });
    describe("operations slice", () => {
      it("should remove the column ID from the parent operation's columnIds array", () => {
        const parentOperation = finalState.operations.byId["o1"];
        expect(parentOperation.columnIds).not.toContain(columnIdToDelete);
      });
    });
    describe("table slice", () => {
      it("should remove the child table's columnIds from the table's .columnIds array", () => {
        const childTableIds = ["t1", "t2"];
        childTableIds.forEach((childTableId) => {
          const childTable = finalState.tables.byId[childTableId];
          expect(childTable.columnIds).not.toContain(columnIdToDelete);
        });
      });
    });
  });
});
