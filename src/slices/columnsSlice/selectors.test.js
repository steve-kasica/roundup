import { describe, it, expect, beforeAll } from "vitest";
import {
  selectActiveColumnIdsByParentId,
  selectColumnIdsByParentId,
  selectColumnIndexById,
  selectColumnNamesById,
  selectColumnsById,
  selectSelectedColumnIdsByParentId,
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
          operation1.id
        )
      ).toEqual([column4.id]);
    });
    it("returns selected column IDs for multiple table IDs", () => {
      expect(
        selectSelectedColumnIdsByParentId(state, [table1.id, table2.id])
      ).toEqual([[column1.id], [column3.id]]);
    });
    it("returns selected column IDs for multiple operation IDs", () => {
      expect(
        selectSelectedColumnIdsByParentId(
          {
            ...state,
            ui: { selectedColumnIds: [column4.id, column1.id] },
          },
          [operation1.id, table1.id]
        )
      ).toEqual([[column4.id], [column1.id]]);
    });
  });
  describe("selectActiveColumnIdsByParentId", () => {
    it("should return active column IDs for a given table ID", () => {
      expect(
        selectActiveColumnIdsByParentId(state, [table1.id, table2.id])
      ).toEqual([[column1.id, column2.id], [column3.id]]);
    });
    it("should return activeColumn IDs given multiple tableIDs", () => {
      expect(
        selectActiveColumnIdsByParentId(state, [table1.id, table2.id])
      ).toEqual([[column1.id, column2.id], [column3.id]]);
    });
    it("should return active column IDSfor a given operation ID", () => {
      expect(selectActiveColumnIdsByParentId(state, operation1.id)).toEqual([
        column4.id,
        column5.id,
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
});
