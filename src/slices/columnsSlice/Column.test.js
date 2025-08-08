import { describe, it, expect } from "vitest";
import Column, {
  isColumn,
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_CATEGORICAL,
} from "./Column";

describe("Column Factory Function", () => {
  it("should create a column with the correct properties", () => {
    const column = Column("table-1", 0, "Column Name", COLUMN_TYPE_NUMERICAL);

    expect(column).toEqual({
      id: expect.stringMatching(/^c\d+$/), // ID should start with "c-" and have a unique number
      tableId: "table-1",
      name: "Column Name",
      alias: null, // Default value for alias
      index: 0,
      columnType: COLUMN_TYPE_NUMERICAL,
      values: {},
    });
  });

  it("should throw an error if tableId is undefined", () => {
    expect(() =>
      Column(undefined, 0, "Column Name", COLUMN_TYPE_NUMERICAL)
    ).toThrow("Param undefined `tableId`");
  });

  it("should throw an error if index is undefined", () => {
    expect(() =>
      Column("table-1", undefined, "Column Name", COLUMN_TYPE_NUMERICAL)
    ).toThrow("Param undefined, `index`");
  });

  it("should throw an error if columnType is undefined", () => {
    expect(() => Column("table-1", 0, "Column Name", undefined)).toThrow(
      "Param undefined, `columnType`"
    );
  });

  it("should throw an error if columnType is not a valid enum value", () => {
    expect(() => Column("table-1", 0, "Column Name", "INVALID_TYPE")).toThrow(
      "Invalid columnType"
    );
  });

  it("should increment the ID counter for each column created", () => {
    const column1 = Column("table-1", 0, "Column 1", COLUMN_TYPE_NUMERICAL);
    const column2 = Column("table-1", 1, "Column 2", COLUMN_TYPE_CATEGORICAL);

    expect(column1.id).not.toBe(column2.id);
    expect(Number(column1.id.replace("c-", "")) + 1).toEqual(
      Number(column2.id.replace("c-", ""))
    );
  });
});

describe("isColumn Function", () => {
  it("should return true for valid column objects", () => {
    const column = Column("table-1", 0, "Valid Column", COLUMN_TYPE_NUMERICAL);
    expect(isColumn(column)).toBe(true);
  });

  it("should return false for objects that are not columns", () => {
    const invalidColumn = {
      id: "c1",
      tableId: "table-1",
      index: 0,
      columnType: COLUMN_TYPE_NUMERICAL,
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
