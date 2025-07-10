// See example here: https://observablehq.com/d/a57dc020b270136f#cell-18
import { getDuckDB } from "./duckdbClient";

export async function getValuesCountMatrix(columnIds, tableIds) {
  if (!Array.isArray(columnIds) || !Array.isArray(tableIds)) {
    throw new Error("Both columnIds and tableIds must be arrays");
  } else if (columnIds.length !== tableIds.length) {
    throw new Error("columnIds and tableIds must have the same length");
  }

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
          .join(",\n        ")},
        -- Calculate degree as the sum of nonzero columns
        (${tableIds
          .map(
            (tableId) =>
              `CASE WHEN SUM((SOURCE_TABLE = '${tableId}')::INTEGER) > 0 THEN 1 ELSE 0 END`
          )
          .join(" + ")}) AS DEGREE,
        --- Create a signature string for sorting
        (${tableIds
          .map(
            (tableId) =>
              `CASE WHEN SUM((SOURCE_TABLE = '${tableId}')::INTEGER) > 0 THEN '1' ELSE '0' END`
          )
          .join(" || ")}) AS SIGNATURE
        FROM (
            ${tableIds
              .map(
                (tableId, i) =>
                  `SELECT ${columnIds[i]} AS VAL, '${tableId}' AS SOURCE_TABLE FROM ${tableId}`
              )
              .join("\n            UNION ALL\n            ")}
        ) AS combined
    GROUP BY VAL
    ORDER BY DEGREE DESC, SIGNATURE, VAL
  `;
  const result = await conn.query(query);
  await conn.close();

  const matrix = result.toArray().map((row) => Object.values(row)); // array of arrays (matrix)
  return matrix;
}
