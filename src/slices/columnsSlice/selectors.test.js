import { describe, it, expect, beforeAll } from "vitest";
import {
  selectAllColumnIdsByParentId,
  selectColumnIdsByParentId,
  selectColumnIndexById,
  selectColumnNamesById,
  selectColumnsById,
  selectOrphanedColumnIds,
  selectSelectedColumnIdsByParentId,
  selectHiddenColumnIdsByParentId,
} from "./selectors";
import { initialState as columnsInitialState } from "./columnsSlice";
import Column from "./Column";
import { Table } from "../tablesSlice";
import { Operation } from "../operationsSlice";

describe("Column selectors", () => {
  let state,
    table1,
    table2,
    table3,
    column1,
    column2,
    column3,
    column4,
    column5,
    operation1;
  beforeAll(() => {
    table1 = Table();
    table2 = Table();
    table3 = Table();
    column1 = Column({ parentId: table1.id, index: 0, databaseName: "Name" });
    column2 = Column({ parentId: table1.id, index: 1, databaseName: "Age" });
    column3 = Column({ parentId: table2.id, index: 0, databaseName: "Email" });
    column4 = Column({ index: 0, databaseName: "Status" });
    column5 = Column({ index: 1, databaseName: "Score" });
    table1.columnIds = [column1.id, column2.id];
    table2.columnIds = [column3.id];
    operation1 = Operation({
      columnIds: [column4.id, column5.id],
    });
    column4.parentId = operation1.id;
    column5.parentId = operation1.id;
    state = {
      operations: {
        byId: {
          [operation1.id]: operation1,
        },
        allIds: [operation1.id],
      },
      tables: {
        byId: {
          [table1.id]: table1,
          [table2.id]: table2,
          [table3.id]: table3,
        },
        allIds: [table1.id, table2.id, table3.id],
      },
      columns: {
        ...columnsInitialState,
        byId: {
          [column1.id]: column1,
          [column2.id]: column2,
          [column3.id]: column3,
          [column4.id]: column4,
          [column5.id]: column5,
        },
      },
      ui: {
        selectedColumnIds: [column1.id, column3.id],
      },
    };
  });
  describe("selectColumnIdsByParentId", () => {
    it("should return column IDs for a single parent ID", () => {
      expect(selectColumnIdsByParentId(state, table1.id)).toEqual([
        column1.id,
        column2.id,
      ]);
      expect(selectColumnIdsByParentId(state, table2.id)).toEqual([column3.id]);
    });
    it("should return an empty array for a parent ID with no columns", () => {
      const table3 = Table();
      expect(selectColumnIdsByParentId(state, table3.id)).toEqual([]);
    });
    it("should return a matrix of ColumnIDs for multiple parent IDs", () => {
      expect(selectColumnIdsByParentId(state, [table1.id, table2.id])).toEqual([
        [column1.id, column2.id],
        [column3.id],
      ]);
    });
  });
  describe("selectColumnsById", () => {
    it("should return column objects for given IDs", () => {
      expect(selectColumnsById(state, [column1.id, column3.id])).toEqual([
        column1,
        column3,
      ]);
    });
    it("should return a single column object for a single ID", () => {
      expect(selectColumnsById(state, column2.id)).toEqual(column2);
    });
  });
  describe("selectColumnNamesById", () => {
    it("should return column names for given IDs", () => {
      expect(selectColumnNamesById(state, [column1.id, column3.id])).toEqual([
        "Name",
        "Email",
      ]);
    });
    it("should return null if columnIds are null", () => {
      expect(selectColumnNamesById(state, null)).toBeNull();
    });
  });

  describe("selectSelectedColumnIdsByParentId", () => {
    it("returns selected column IDs for a single table ID", () => {
      expect(selectSelectedColumnIdsByParentId(state, table1.id)).toEqual([
        column1.id,
      ]);
      expect(selectSelectedColumnIdsByParentId(state, table2.id)).toEqual([
        column3.id,
      ]);
    });
    it("returns an empty array if no columns are selected a single table ID", () => {
      expect(selectSelectedColumnIdsByParentId(state, table3.id)).toEqual([]);
    });
    it("returns selected column IDs for a single operation ID", () => {
      expect(
        selectSelectedColumnIdsByParentId(
          {
            ...state,
            ui: { selectedColumnIds: [column4.id] },
          },
          operation1.id,
        ),
      ).toEqual([column4.id]);
    });
    it("returns selected column IDs for multiple table IDs", () => {
      expect(
        selectSelectedColumnIdsByParentId(state, [table1.id, table2.id]),
      ).toEqual([[column1.id], [column3.id]]);
    });
    it("returns selected column IDs for multiple operation IDs", () => {
      expect(
        selectSelectedColumnIdsByParentId(
          {
            ...state,
            ui: { selectedColumnIds: [column4.id, column1.id] },
          },
          [operation1.id, table1.id],
        ),
      ).toEqual([[column4.id], [column1.id]]);
    });
  });
  describe("selectHiddenColumnIdsByParentId", () => {
    it("returns hidden column IDs for a single table ID", () => {
      const stateWithHidden = {
        ...state,
        ui: { hiddenColumnIds: [column1.id, column3.id] },
      };
      expect(
        selectHiddenColumnIdsByParentId(stateWithHidden, table1.id),
      ).toEqual([column1.id]);
      expect(
        selectHiddenColumnIdsByParentId(stateWithHidden, table2.id),
      ).toEqual([column3.id]);
    });
    it("returns an empty array if no columns are hidden for a single table ID", () => {
      const stateWithHidden = {
        ...state,
        ui: { hiddenColumnIds: [column1.id, column3.id] },
      };
      expect(
        selectHiddenColumnIdsByParentId(stateWithHidden, table3.id),
      ).toEqual([]);
    });
    it("returns hidden column IDs for a single operation ID", () => {
      const stateWithHidden = {
        ...state,
        ui: { hiddenColumnIds: [column4.id] },
      };
      expect(
        selectHiddenColumnIdsByParentId(stateWithHidden, operation1.id),
      ).toEqual([column4.id]);
    });
    it("returns hidden column IDs for multiple table IDs", () => {
      const stateWithHidden = {
        ...state,
        ui: { hiddenColumnIds: [column1.id, column3.id] },
      };
      expect(
        selectHiddenColumnIdsByParentId(stateWithHidden, [
          table1.id,
          table2.id,
        ]),
      ).toEqual([[column1.id], [column3.id]]);
    });
    it("returns hidden column IDs for multiple operation IDs", () => {
      const stateWithHidden = {
        ...state,
        ui: { hiddenColumnIds: [column4.id, column1.id] },
      };
      expect(
        selectHiddenColumnIdsByParentId(stateWithHidden, [
          operation1.id,
          table1.id,
        ]),
      ).toEqual([[column4.id], [column1.id]]);
    });
  });
  describe("selectColumnIdsByParentId", () => {
    it("should return active column IDs for a given table ID", () => {
      expect(selectColumnIdsByParentId(state, [table1.id, table2.id])).toEqual([
        [column1.id, column2.id],
        [column3.id],
      ]);
    });
    it("should return activeColumn IDs given multiple tableIDs", () => {
      expect(selectColumnIdsByParentId(state, [table1.id, table2.id])).toEqual([
        [column1.id, column2.id],
        [column3.id],
      ]);
    });
    it("should return active column IDs for a given operation ID", () => {
      expect(selectColumnIdsByParentId(state, operation1.id)).toEqual([
        column4.id,
        column5.id,
      ]);
    });
    it("Should return a matrix if given an array of one tableId", () => {
      expect(selectColumnIdsByParentId(state, [table2.id])).toEqual([
        [column3.id],
      ]);
    });
  });
  describe("selectColumnIndexById", () => {
    it("should return the correct index for a column ID within a table", () => {
      expect(selectColumnIndexById(state, column1.id)).toBe(0);
    });
    it("should return the correct index for a column ID within an operation", () => {
      expect(selectColumnIndexById(state, column5.id)).toBe(1);
    });
  });
  describe("selectOrphanedColumnIds", () => {
    it("should return orphaned column IDs for a given operation ID", () => {
      const localState = {
        ...state,
        operations: {
          byId: {
            [operation1.id]: {
              ...operation1,
              columnIds: [column4.id], // column5 is orphaned
            },
          },
          allIds: [operation1.id],
        },
      };
      const orphanedColumnIds = selectOrphanedColumnIds(
        localState,
        operation1.id,
      );
      expect(orphanedColumnIds).toEqual([column5.id]);
    });
  });
  describe("selectAllColumnIdsByParentId", () => {
    it("should return all column IDs (including orphaned) for a single parent ID", () => {
      const result = selectAllColumnIdsByParentId(state, table1.id);
      expect(result).toHaveLength(2);
      expect(result).toContain(column1.id);
      expect(result).toContain(column2.id);
    });
    it("should return an empty array for a parent ID with no columns", () => {
      expect(selectAllColumnIdsByParentId(state, table3.id)).toEqual([]);
    });
    it("should return a matrix of all column IDs for multiple parent IDs", () => {
      const result = selectAllColumnIdsByParentId(state, [
        table1.id,
        table2.id,
      ]);
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveLength(2);
      expect(result[0]).toContain(column1.id);
      expect(result[0]).toContain(column2.id);
      expect(result[1]).toHaveLength(1);
      expect(result[1]).toContain(column3.id);
    });
    it("should return all column IDs including orphaned columns for an operation", () => {
      const localState = {
        ...state,
        operations: {
          byId: {
            [operation1.id]: {
              ...operation1,
              columnIds: [column4.id], // column5 is orphaned but should still be returned
            },
          },
          allIds: [operation1.id],
        },
      };
      const result = selectAllColumnIdsByParentId(localState, operation1.id);
      expect(result).toHaveLength(2);
      expect(result).toContain(column4.id);
      expect(result).toContain(column5.id);
    });
    it("should return all column IDs for multiple operation IDs", () => {
      const result = selectAllColumnIdsByParentId(state, [operation1.id]);
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(2);
      expect(result[0]).toContain(column4.id);
      expect(result[0]).toContain(column5.id);
    });
  });
});
