import { describe, it, expect } from "vitest";
import { Table, isTable, isTableId } from "./Table";

// Helper to create valid table args
const validArgs = [
  "user upload", // source
  "Test Table", // name
  "csv", // extension
  1024, // size in bytes
  "text/csv", // mimeType
  6, // columnCount
  10, // rowCount
  "2024-01-02T00:00:00Z", // dateLastModified (string, not Date)
];

describe("Table factory", () => {
  it("creates a valid table object", () => {
    const table = Table(...validArgs);
    expect(table).toHaveProperty("id");
    expect(table.source).toBe(validArgs[0]);
    expect(table.name).toBe(validArgs[1]);
    expect(table.extension).toBe(validArgs[2]);
    expect(table.size).toBe(validArgs[3]);
    expect(table.mimeType).toBe(validArgs[4]);
    expect(table.columnCount).toBe(validArgs[5]);
    expect(table.rowCount).toBe(validArgs[6]);
    expect(table.dateLastModified).toBe(validArgs[7]);
    expect(table.rowsExplored).toBe(0);
    expect(Array.isArray(table.columnIds)).toBe(true);
    expect(table.columnIds.length).toBe(validArgs[5]);
    expect(Array.isArray(table.originalColumnIds)).toBe(true);
    expect(table.originalColumnIds.length).toBe(validArgs[5]);
  });

  it("throws if rowCount is not integer", () => {
    expect(() =>
      Table(
        "user upload",
        "Test Table",
        "csv",
        1024,
        "text/csv",
        6,
        "not-an-int",
        "2024-01-02T00:00:00Z"
      )
    ).toThrow("`rowCount` must be an integer");
  });

  it("throws if dateLastModified is a Date instance", () => {
    expect(() =>
      Table(
        "user upload",
        "Test Table",
        "csv",
        1024,
        "text/csv",
        6,
        10,
        new Date()
      )
    ).toThrow(
      "`dateLastCreated` cannot be a Date instance for serializability"
    );
  });
});

describe("isTable", () => {
  it("returns true for valid table", () => {
    const table = Table(...validArgs);
    expect(isTable(table)).toBe(true);
  });

  it("returns false for object missing required keys", () => {
    expect(isTable({})).toBe(false);
    expect(isTable({ id: "t-1" })).toBe(false);
  });
});

describe("isTableId", () => {
  it("returns true for non-operation id", () => {
    expect(isTableId("t-123")).toBe(true);
  });

  it("returns false for operation id (mock)", () => {
    // isOperationId is imported from operationsSlice, so we assume it returns true for something like 'op-1'
    expect(isTableId("op-1")).toBe(false);
  });
});
