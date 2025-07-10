import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  selectTablesById,
  selectTableByColumnId,
  selectAllTablesData,
} from "./tableSelectors";

vi.mock("../columnsSlice", () => ({
  selectColumnById: vi.fn(),
}));
import { selectColumnById } from "../columnsSlice";

describe("tableSelectors", () => {
  const mockState = {
    tables: {
      data: {
        t1: { id: "t1", name: "Table 1" },
        t2: { id: "t2", name: "Table 2" },
      },
    },
  };

  describe("selectTablesById", () => {
    it("returns a table by single ID", () => {
      expect(selectTablesById(mockState, "t1")).toEqual({
        id: "t1",
        name: "Table 1",
      });
    });
    it("returns tables by array of IDs", () => {
      expect(selectTablesById(mockState, ["t1", "t2"])).toEqual([
        { id: "t1", name: "Table 1" },
        { id: "t2", name: "Table 2" },
      ]);
    });
  });

  describe("selectTableByColumnId", () => {
    beforeEach(() => {
      selectColumnById.mockImplementation((state, columnId) => {
        const map = { c1: { tableId: "t1" }, c2: { tableId: "t2" } };
        return map[columnId];
      });
    });
    afterEach(() => {
      vi.clearAllMocks();
    });
    it("returns a table for a single column ID", () => {
      expect(selectTableByColumnId(mockState, "c1")).toEqual({
        id: "t1",
        name: "Table 1",
      });
    });
    it("returns tables for an array of column IDs", () => {
      expect(selectTableByColumnId(mockState, ["c1", "c2"])).toEqual([
        { id: "t1", name: "Table 1" },
        { id: "t2", name: "Table 2" },
      ]);
    });
  });

  describe("selectAllTablesData", () => {
    it("returns all tables as an array", () => {
      expect(selectAllTablesData(mockState)).toEqual([
        { id: "t1", name: "Table 1" },
        { id: "t2", name: "Table 2" },
      ]);
    });
  });
});
