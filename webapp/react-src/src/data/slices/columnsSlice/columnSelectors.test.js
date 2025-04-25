import { describe, it, expect } from "vitest";
import {
  selectColumnIdsByTableId,
  selectColumnById,
  selectColumnLoadingStatus,
  selectColumnsByTable,
  selectColumnError,
  selectLoadingColumnsByTable,
  selectColumnIdsByIndex,
} from "./columnSelectors";

describe("columnSelectors", () => {
  const mockState = {
    columns: {
      idsByTable: {
        table1: ["col1", "col2"],
        table2: ["col3"],
      },
      data: {
        col1: { id: "col1", name: "Column 1", loading: false, error: null },
        col2: { id: "col2", name: "Column 2", loading: true, error: "Error" },
        col3: { id: "col3", name: "Column 3", loading: false, error: null },
      },
    },
  };

  it("selectColumnIdsByTableId should return column IDs for a specific table", () => {
    expect(selectColumnIdsByTableId(mockState, "table1")).toEqual([
      "col1",
      "col2",
    ]);
    expect(selectColumnIdsByTableId(mockState, "table2")).toEqual(["col3"]);
    expect(selectColumnIdsByTableId(mockState, "table3")).toBeUndefined();
  });

  it("selectColumnById should return a specific column by its ID", () => {
    expect(selectColumnById(mockState, "col1")).toEqual({
      id: "col1",
      name: "Column 1",
      loading: false,
      error: null,
    });
    expect(selectColumnById(mockState, "col4")).toBeUndefined();
  });

  it("selectColumnLoadingStatus should return the loading status of a column", () => {
    expect(selectColumnLoadingStatus(mockState, "col1")).toBe(false);
    expect(selectColumnLoadingStatus(mockState, "col2")).toBe(true);
    expect(selectColumnLoadingStatus(mockState, "col4")).toBe(false);
  });

  it("selectColumnsByTable should return all columns for a specific table", () => {
    expect(selectColumnsByTable(mockState, "table1")).toEqual([
      { id: "col1", name: "Column 1", loading: false, error: null },
      { id: "col2", name: "Column 2", loading: true, error: "Error" },
    ]);
    expect(selectColumnsByTable(mockState, "table2")).toEqual([
      { id: "col3", name: "Column 3", loading: false, error: null },
    ]);
  });

  it("selectColumnError should return the error message of a column", () => {
    expect(selectColumnError(mockState, "col1")).toBe(null);
    expect(selectColumnError(mockState, "col2")).toBe("Error");
    expect(selectColumnError(mockState, "col4")).toBe(null);
  });

  it("selectLoadingColumnsByTable should return all loading columns for a specific table", () => {
    expect(selectLoadingColumnsByTable(mockState, "table1")).toEqual([
      { id: "col2", name: "Column 2", loading: true, error: "Error" },
    ]);
    expect(selectLoadingColumnsByTable(mockState, "table2")).toEqual([]);
  });

  it("selectColumnIdsByIndex should return column IDs at a specific index across all tables", () => {
    expect(selectColumnIdsByIndex(mockState, 0)).toEqual(["col1", "col3"]);
    expect(selectColumnIdsByIndex(mockState, 1)).toEqual(["col2", null]);
    expect(selectColumnIdsByIndex(mockState, 2)).toEqual([null, null]);
  });
});
