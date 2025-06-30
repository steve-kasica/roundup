// See example here: https://observablehq.com/d/a57dc020b270136f#cell-18
import { getDuckDB } from "./duckdbClient";

export async function getValuesCountMatrix(columnNames, tableNames) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `
    SELECT
        VAL,
        ${tableNames
          .map(
            (name) =>
              `CAST(SUM((SOURCE_TABLE = '${name}')::INTEGER) AS INTEGER) AS ${name}`
          )
          .join(",\n        ")}
        FROM (
            ${tableNames
              .map(
                (name, i) =>
                  `SELECT ${columnNames[i]} AS VAL, '${name}' AS SOURCE_TABLE FROM ${name}`
              )
              .join("\n            UNION ALL\n            ")}
        ) AS combined
    GROUP BY VAL
  `;
  const result = await conn.query(query);
  await conn.close();

  const matrix = result.toArray().map((row) => Object.values(row)); // array of arrays (matrix)
  return matrix;
}
