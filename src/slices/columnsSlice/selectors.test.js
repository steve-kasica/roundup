import { describe, it, expect, beforeAll } from "vitest";
import {
  selectColumnIdsByParentId,
  selectColumnNamesById,
  selectColumnsById,
  selectSelectedColumnIdsByParentId,
} from "./selectors";
import { initialState as columnsInitialState } from "./columnsSlice";
import Column from "./Column";
import { Table } from "../tablesSlice";

describe("Column selectors", () => {
  let state, table1, table2, column1, column2, column3;
  beforeAll(() => {
    table1 = Table();
    table2 = Table();
    column1 = Column({ parentId: table1.id, index: 0, databaseName: "Name" });
    column2 = Column({ parentId: table1.id, index: 1, databaseName: "Age" });
    column3 = Column({ parentId: table2.id, index: 0, databaseName: "Email" });
    table1.columnIds = [column1.id, column2.id];
    table2.columnIds = [column3.id];
    state = {
      tables: {
        byId: {
          [table1.id]: table1,
          [table2.id]: table2,
        },
      },
      columns: {
        ...columnsInitialState,
        byId: {
          [column1.id]: column1,
          [column2.id]: column2,
          [column3.id]: column3,
        },
      },
      ui: {
        selectedColumnIds: [column1.id, column3.id],
      },
    };
  });
  describe("selectColumnIdsByParentId", () => {
    it("should return column IDs for a given table ID", () => {
      expect(selectColumnIdsByParentId(state, table1.id)).toEqual([
        column1.id,
        column2.id,
      ]);
      expect(selectColumnIdsByParentId(state, table2.id)).toEqual([column3.id]);
    });
    it("should return an empty array for a table ID with no columns", () => {
      const table3 = Table();
      expect(selectColumnIdsByParentId(state, table3.id)).toEqual([]);
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
    it("should return selected column IDs for a given table ID", () => {
      expect(selectSelectedColumnIdsByParentId(state, table1.id)).toEqual([
        column1.id,
      ]);
      expect(selectSelectedColumnIdsByParentId(state, table2.id)).toEqual([
        column3.id,
      ]);
    });
  });
});
