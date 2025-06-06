import { describe, it, expect } from "vitest";
import { Table, isTable, isTableId } from "./Table";

// Helper to create valid table args
const validArgs = [
  "remote-1", // remoteId
  "openrefine", // source
  "Test Table", // name
  6, // columnCount
  10, // rowCount
  "2024-01-01T00:00:00Z", // dateCreated (string, not Date)
  "2024-01-02T00:00:00Z", // dateLastModified (string, not Date)
  ["tag1", "tag2"], // tags
];

describe("Table factory", () => {
  it("creates a valid table object", () => {
    const table = Table(...validArgs);
    expect(table).toHaveProperty("id");
    expect(table.remoteId).toBe(validArgs[0]);
    expect(table.source).toBe(validArgs[1]);
    expect(table.name).toBe(validArgs[2]);
    expect(table.columnCount).toBe(validArgs[3]);
    expect(table.rowCount).toBe(validArgs[4]);
    expect(table.dateCreated).toBe(validArgs[5]);
    expect(table.dateLastModified).toBe(validArgs[6]);
    expect(table.tags).toEqual(validArgs[7]);
    expect(table.rowsExplored).toBe(0);
  });

  it("throws if remoteId is missing", () => {
    expect(() => Table(undefined, ...validArgs.slice(1))).toThrow(
      "`remoteId` is undefined"
    );
  });

  it("throws if rowCount is not integer", () => {
    expect(() =>
      Table("remote-2", "openrefine", "Name", 6, "not-an-int", "2024", "2024")
    ).toThrow("`rowCount` must be an integer");
  });

  it("throws if dateCreated is a Date instance", () => {
    expect(() =>
      Table("remote-3", "openrefine", "Name", 6, 1, new Date(), "2024")
    ).toThrow("`dateCreated` cannot be a Date instance for serializability");
  });

  it("throws if dateLastModified is a Date instance", () => {
    expect(() =>
      Table("remote-4", "openrefine", "Name", 6, 1, "2024", new Date())
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
