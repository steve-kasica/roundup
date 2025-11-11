import { describe, it, expect, beforeEach } from "vitest";
import {
  selectTablesById,
  selectAllTablesData,
  selectTableColumnIds,
} from "./selectors";
import { initialState, Table } from "../tablesSlice";

describe("tableSelectors", () => {
  let mockState, table1, table2;
  beforeEach(() => {
    table1 = Table();
    table1.columnIds = ["c1", "c2"];
    table2 = Table();
    table2.columnIds = ["c3", "c4"];
    mockState = {
      tables: {
        ...initialState,
        byId: {
          [table1.id]: table1,
          [table2.id]: table2,
        },
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
      expect(selectTableColumnIds(mockState, table1.id)).toEqual(["c1", "c2"]);
    });
  });

  describe("selectAllTablesData", () => {
    it("returns all tables as an array", () => {
      expect(selectAllTablesData(mockState)).toEqual([table1, table2]);
    });
  });
});
