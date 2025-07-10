import { describe, it, expect } from "vitest";
import { formQuery } from "./createStackView";

describe("formQuery", () => {
  it("should generate a view with a single child", () => {
    const op = {
      id: "o1",
      children: [{ id: "t1", columnIds: ["c1", "c2"] }],
    };
    const viewName = "my_view";
    const query = formQuery(op, viewName);
    expect(query).toContain("CREATE OR REPLACE VIEW o1 AS SELECT * FROM");
    expect(query).toContain("SELECT c1, c2 FROM t1");
  });

  it("should join multiple children with UNION ALL", () => {
    const op = {
      children: [
        { id: "t1", columnIds: ["c1", "c2"] },
        { id: "t2", columnIds: ["c3", "c4"] },
      ],
    };
    const viewName = "union_view";
    const query = formQuery(op, viewName);
    expect(query).toContain("SELECT c1, c2 FROM t1");
    expect(query).toContain("SELECT c3, c4 FROM t2");
    expect(query).toContain("UNION ALL");
  });
});
