import { describe, it, expect } from "vitest";
import Column, {
  COLUMN_STATUS_VISABLE,
  COLUMN_STATUS_LOADING,
  isColumn,
} from "./Column";

describe("Column Factory Function", () => {
  it("should create a column with the correct properties", () => {
    const column = Column(
      "table-1",
      0,
      "Column Name",
      "text",
      COLUMN_STATUS_LOADING
    );

    expect(column).toEqual({
      id: expect.stringMatching(/^c-\d+$/), // ID should start with "c-" and have a unique number
      tableId: "table-1",
      name: "Column Name",
      index: 0,
      columnType: "text",
      status: COLUMN_STATUS_LOADING,
      error: null,
    });
  });

  it("should use default status if not provided", () => {
    const column = Column("table-1", 1, "Another Column", "number");

    expect(column.status).toBe(COLUMN_STATUS_VISABLE);
  });

  it("should throw an error if tableId is undefined", () => {
    expect(() => Column(undefined, 0, "Column Name", "text")).toThrow(
      "Param undefined `tableId`"
    );
  });

  it("should throw an error if index is undefined", () => {
    expect(() => Column("table-1", undefined, "Column Name", "text")).toThrow(
      "Param undefined, `index`"
    );
  });

  it("should increment the ID counter for each column created", () => {
    const column1 = Column("table-1", 0, "Column 1", "text");
    const column2 = Column("table-1", 1, "Column 2", "text");

    expect(column1.id).not.toBe(column2.id);
  });
});

describe("isColumn Function", () => {
  it("should return true for valid column objects", () => {
    const column = Column("table-1", 0, "Valid Column", "text");
    expect(isColumn(column)).toBe(true);
  });

  it("should return false for objects that are not columns", () => {
    const invalidColumn = {
      id: "c-1",
      tableId: "table-1",
      index: 0,
      columnType: "text",
      status: "loading",
    }; // Missing some properties
    expect(isColumn(invalidColumn)).toBe(false);
  });

  it("should return false for null or non-object values", () => {
    expect(isColumn(null)).toBe(false);
    expect(isColumn(undefined)).toBe(false);
    expect(isColumn("not-an-object")).toBe(false);
  });
});
