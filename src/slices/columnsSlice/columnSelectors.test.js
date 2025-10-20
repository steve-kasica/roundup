import { describe, it, expect } from "vitest";
import {
  selectColumnIdsByTableId,
  selectColumnById,
  selectSelectedColumns,
  selectHoveredColumnId,
  selectLoadingColumns,
  selectDraggingColumns,
  selectColumnsByIndex,
  selectColumnValues,
} from "./columnSelectors";

const mockState = {
  columns: {
    idsByTable: {
      table1: ["col1", "col2"],
      table2: ["col3"],
    },
    data: {
      col1: { id: "col1", name: "A", values: [1, 2] },
      col2: { id: "col2", name: "B", values: [3, 4] },
      col3: { id: "col3", name: "C", values: [5, 6] },
    },
    selected: ["col1"],
    hovered: ["col2"],
    loading: ["col3"],
    dragging: ["col2"],
  },
};

describe("columnSelectors", () => {
  it("selectColumnIdsByTableId returns column IDs for a table", () => {
    expect(selectColumnIdsByTableId(mockState, "table1")).toEqual([
      "col1",
      "col2",
    ]);
    expect(selectColumnIdsByTableId(mockState, "table2")).toEqual(["col3"]);
  });

  it("selectColumnIdsByTableId returns [] for missing table", () => {
    expect(selectColumnIdsByTableId(mockState, "tableX")).toEqual([]);
  });

  it("selectColumnById returns the correct column object", () => {
    expect(selectColumnById(mockState, "col1")).toEqual({
      id: "col1",
      name: "A",
      values: [1, 2],
    });
    expect(selectColumnById(mockState, "col3")).toEqual({
      id: "col3",
      name: "C",
      values: [5, 6],
    });
  });

  it("selectColumnById returns null for missing column", () => {
    expect(selectColumnById(mockState, "colX")).toBeNull();
  });

  it("selectSelectedColumns returns selected column IDs", () => {
    expect(selectSelectedColumns(mockState)).toEqual(["col1"]);
  });

  it("selectHoveredColumnId returns hovered column IDs", () => {
    expect(selectHoveredColumnId(mockState)).toEqual(["col2"]);
  });

  it("selectLoadingColumns returns loading column IDs", () => {
    expect(selectLoadingColumns(mockState)).toEqual(["col3"]);
  });

  it("selectDraggingColumns returns dragging column IDs", () => {
    expect(selectDraggingColumns(mockState)).toEqual(["col2"]);
  });

  it("selectColumnsByIndex returns columns at given index for each table", () => {
    // index 0 for table1 and table2
    const result = selectColumnsByIndex(mockState, 0, ["table1", "table2"]);
    expect(result).toEqual([
      { id: "col1", name: "A", values: [1, 2] },
      { id: "col3", name: "C", values: [5, 6] },
    ]);
    // index 1 for table1 and table2 (table2 only has one column)
    const result2 = selectColumnsByIndex(mockState, 1, ["table1", "table2"]);
    expect(result2).toEqual([{ id: "col2", name: "B", values: [3, 4] }, null]);
  });

  it("selectColumnValues returns values for given column IDs", () => {
    expect(selectColumnValues(mockState, ["col1", "col3"])).toEqual({
      col1: [1, 2],
      col3: [5, 6],
    });
  });

  it("selectColumnValues omits missing columns", () => {
    expect(selectColumnValues(mockState, ["col1", "colX"])).toEqual({
      col1: [1, 2],
    });
  });

  it("selectColumnValues returns empty object for empty input", () => {
    expect(selectColumnValues(mockState, [])).toEqual({});
    expect(selectColumnValues(mockState, null)).toEqual({});
  });
});
