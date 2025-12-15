import { getDuckDB } from "../duckdbClient";

// With these UNION ALL query, the view will take on the column names of the first child.
export async function createStackView(queryData, columnList = null) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = formQuery(queryData, columnList);
  const response = await conn.query(query);
  await conn.close();
  return response;
}

export function formQuery(queryData, columnList = null) {
  const columnSpec = columnList
    ? `(${columnList.map((databaseName) => `"${databaseName}"`).join(", ")})`
    : "";
  return `CREATE OR REPLACE TABLE ${
    queryData.viewName
  }${columnSpec} AS SELECT * FROM (
    ${queryData.children
      .map(
        (child) =>
          `\nSELECT ${child.columnNames
            .map((databaseName) => `"${databaseName}"`)
            .join(", ")} FROM ${child.tableName}\n`
      )
      .join(" UNION ALL ")}
  )`;
}
