import { getDuckDB } from "../duckdbClient";

// With these UNION ALL query, the view will take on the column names of the first child.
export async function createStackView(operation, columnList = null) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = formQuery(operation, columnList);
  const response = await conn.query(query);
  await conn.close();
  return response;
}

export function formQuery(operation, columnList = null) {
  const columnSpec = columnList ? `(${columnList.join(", ")})` : "";
  return `CREATE OR REPLACE VIEW ${operation.id}${columnSpec} AS SELECT * FROM (
    ${operation.childIds
      .map(
        (child) =>
          `\nSELECT ${child.databaseNames.join(", ")} FROM ${child.id}\n`
      )
      .join(" UNION ALL ")}
  )`;
}
