import { getColumnCount, getRowCount, getColumnIdMatrix } from "./utilities";
import { describe, it, expect } from "vitest";

describe("withStackOperationData utility functions", () => {
  describe("columnIdMatrix", () => {
    describe("when child tables are of the same column length", () => {
      it("does not contain any null values", () => {});
    });
    describe("when child tables are of varying column lengths", () => {
      it("returns a backfilled matrix of column IDs for each child table", () => {});
    });
  });

  describe("getColumnCount", () => {
    describe("when columnCount arg is not null ", () => {
      it("returns the operation's columnCount", () => {});
    });
    describe("when columnCount arg is null", () => {
      it("returns the max length of its columnIds array", () => {});
    });
  });

  describe("getRowCount", () => {
    describe("when the operation has a rowCount property", () => {
      it("returns the operation's rowCount", () => {});
    });
    describe("when the operation does not have a rowCount property", () => {
      it("returns the sum of its child tables' rowCounts", () => {});
    });
  });
});
