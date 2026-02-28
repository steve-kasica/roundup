import { describe, it, expect } from "vitest";

/**
 * Tests for the column header sanitization logic in exportTableToStreamManual.
 * The main function requires a DuckDB connection, so we test the sanitization
 * regex pattern directly.
 */
describe("exportTableToStreamManual", () => {
  describe("column header newline sanitization", () => {
    // This regex matches the one used in exportTableToStreamManual.js
    const sanitize = (name) => name.replace(/\r?\n|\r/g, " ");

    it("should replace Unix newlines with spaces", () => {
      expect(sanitize("CONF\nMAILING")).toBe("CONF MAILING");
    });

    it("should replace Windows newlines with spaces", () => {
      expect(sanitize("CONF\r\nMAILING")).toBe("CONF MAILING");
    });

    it("should replace old Mac carriage returns with spaces", () => {
      expect(sanitize("CONF\rMAILING")).toBe("CONF MAILING");
    });

    it("should handle multiple newlines", () => {
      expect(sanitize("A\nB\nC")).toBe("A B C");
    });

    it("should handle leading newlines", () => {
      expect(sanitize("\nCOLUMN")).toBe(" COLUMN");
    });

    it("should handle trailing newlines", () => {
      expect(sanitize("COLUMN\n")).toBe("COLUMN ");
    });

    it("should not modify names without newlines", () => {
      expect(sanitize("CONF MAILING")).toBe("CONF MAILING");
    });

    it("should handle empty strings", () => {
      expect(sanitize("")).toBe("");
    });
  });
});
