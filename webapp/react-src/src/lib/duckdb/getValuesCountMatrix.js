// See example here: https://observablehq.com/d/a57dc020b270136f#cell-18
import { getDuckDB } from "./duckdbClient";

export async function getValuesCountMatrix(columnNames, tableNames) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `
    SELECT
        COLUMN_VALUE,
        ${tableNames
          .map(
            (name) =>
              `CAST(SUM((SOURCE_TABLE = '${name}')::INTEGER) AS INTEGER) AS COUNT_IN_${name}`
          )
          .join(",\n        ")}
        FROM (
            ${tableNames
              .map(
                (name, i) =>
                  `SELECT ${columnNames[i]} AS COLUMN_VALUE, '${name}' AS SOURCE_TABLE FROM ${name}`
              )
              .join("\n            UNION ALL\n            ")}
        ) AS combined
    GROUP BY COLUMN_VALUE
  `;
  const result = await conn.query(query);
  await conn.close();
  return result.toArray();
}
