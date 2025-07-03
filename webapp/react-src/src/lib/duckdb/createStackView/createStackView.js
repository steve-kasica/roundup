import { getDuckDB } from "../duckdbClient";
import { getTableDimensions } from "../getTableDimensions";
// With these UNION ALL query, the view will take on the column names of the first child.

export async function createStackView(queryData) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = formQuery(queryData);
  await conn.query(query);
  const dimensions = await getTableDimensions(queryData.name);
  await conn.close();
  return dimensions;
}

export function formQuery(op) {
  return `CREATE OR REPLACE VIEW ${op.name} AS SELECT * FROM (
    ${op.children
      .map(
        (child) =>
          `\nSELECT ${child.columnNames.join(", ")} FROM ${child.tableName}\n`
      )
      .join(" UNION ALL ")}
  )`;
}
