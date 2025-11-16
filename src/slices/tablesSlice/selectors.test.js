import { describe, it, expect, beforeEach } from "vitest";
import {
  selectTablesById,
  selectAllTablesData,
  selectTableColumnIds,
  selectTableQueryData,
} from "./selectors";
import { initialState, Table } from "../tablesSlice";
import { Column } from "../columnsSlice";

describe("tableSelectors", () => {
  let mockState, table1, table2, column1, column2, column3, column4;
  beforeEach(() => {
    column1 = Column({
      databaseName: "kombucha",
    });
    column2 = Column({
      databaseName: "fixie",
    });
    column3 = Column({
      databaseName: "mullet",
    });
    column4 = Column({
      databaseName: "cargo_bike",
    });
    table1 = Table({
      databaseName: "bar",
    });
    table1.columnIds = [column1.id, column2.id];
    table2 = Table({
      databaseName: "foo",
    });
    table2.columnIds = [column3.id, column4.id];
    column1.parentId = table1.id;
    column2.parentId = table1.id;
    column3.parentId = table2.id;
    column4.parentId = table2.id;

    mockState = {
      columns: {
        byId: {
          [column1.id]: column1,
          [column2.id]: column2,
          [column3.id]: column3,
          [column4.id]: column4,
        },
        allIds: [column1.id, column2.id, column3.id, column4.id],
      },
      tables: {
        byId: {
          [table1.id]: table1,
          [table2.id]: table2,
        },
        allIds: [table1.id, table2.id],
      },
    };
  });

  describe("selectTablesById", () => {
    it("returns a table by single ID", () => {
      expect(selectTablesById(mockState, table1.id)).toEqual(table1);
    });
    it("returns tables by array of IDs", () => {
      expect(selectTablesById(mockState, [table1.id, table2.id])).toEqual([
        table1,
        table2,
      ]);
    });
  });

  describe("selectTableColumnIds", () => {
    it("returns column IDs for a given table ID", () => {
      expect(selectTableColumnIds(mockState, table1.id)).toEqual([
        column1.id,
        column2.id,
      ]);
    });
  });

  describe("selectAllTablesData", () => {
    it("returns all tables as an array", () => {
      expect(selectAllTablesData(mockState)).toEqual([table1, table2]);
    });
  });
  describe("selectTableQueryData", () => {
    it("should return the query data for a given table", () => {
      const expected = {
        tableName: table1.databaseName,
        columnNames: [column1.databaseName, column2.databaseName],
      };
      expect(selectTableQueryData(mockState, table1.id)).toEqual(expected);
    });
  });
});
