import { describe, it, expect } from "vitest";
import { formQuery } from "./createStackView";

describe("formQuery", () => {
  it("should generate a view with a single child", () => {
    const op = {
      children: [{ tableName: "table1", columnNames: ["col1", "col2"] }],
    };
    const viewName = "my_view";
    const query = formQuery(op, viewName);
    expect(query).toContain("CREATE OR REPLACE VIEW my_view AS SELECT * FROM");
    expect(query).toContain("SELECT * FROM col1, col2 FROM table1");
  });

  it("should join multiple children with UNION ALL", () => {
    const op = {
      children: [
        { tableName: "table1", columnNames: ["a", "b"] },
        { tableName: "table2", columnNames: ["x", "y"] },
      ],
    };
    const viewName = "union_view";
    const query = formQuery(op, viewName);
    expect(query).toContain("SELECT a, b FROM table1");
    expect(query).toContain("SELECT x, y FROM table2");
    expect(query).toContain("UNION ALL");
  });

  it("should escape column names with commas in names", () => {
    const op = {
      children: [{ tableName: "t", columnNames: ["foo,bar", "baz"] }],
    };
    const viewName = "comma_col_view";
    const query = formQuery(op, viewName);
    expect(query).toContain("SELECT foo,bar, baz FROM t");
  });
});
