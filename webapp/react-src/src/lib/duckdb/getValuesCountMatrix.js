// See example here: https://observablehq.com/d/a57dc020b270136f#cell-18
import { getDuckDB } from "./duckdbClient";

export async function getValuesCountMatrix(columnIds, tableIds) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `
    SELECT
        VAL,
        ${tableIds
          .map(
            (tableId) =>
              `CAST(SUM((SOURCE_TABLE = '${tableId}')::INTEGER) AS INTEGER) AS ${tableId}`
          )
          .join(",\n        ")}
        -- Calculate degree as the sum of nonzero columns
        (${tableIds
          .map(
            (tableId) =>
              `CASE WHEN SUM((SOURCE_TABLE = '${tableId}')::INTEGER) > 0 THEN 1 ELSE 0 END`
          )
          .join(" + ")}) AS DEGREE
        FROM (
            ${tableIds
              .map(
                (tableId, i) =>
                  `SELECT ${columnIds[i]} AS VAL, '${tableId}' AS SOURCE_TABLE FROM ${tableId}`
              )
              .join("\n            UNION ALL\n            ")}
        ) AS combined
    GROUP BY VAL
    ORDER BY DEGREE DESC, VAL
  `;
  const result = await conn.query(query);
  await conn.close();

  const matrix = result.toArray().map((row) => Object.values(row)); // array of arrays (matrix)
  return matrix;
}
