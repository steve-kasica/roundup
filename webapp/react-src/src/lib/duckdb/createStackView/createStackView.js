import { getDuckDB } from "../duckdbClient";

// With these UNION ALL query, the view will take on the column names of the first child.
export async function createStackView(opData) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = formQuery(opData);
  const response = await conn.query(query);
  await conn.close();
  return response;
}

export function formQuery(op) {
  return `CREATE OR REPLACE VIEW ${op.id} AS SELECT * FROM (
    ${op.children
      .map(
        (child) => `\nSELECT ${child.columnIds.join(", ")} FROM ${child.id}\n`
      )
      .join(" UNION ALL ")}
  )`;
}
