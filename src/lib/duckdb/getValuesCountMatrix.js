/**
 * @fileoverview getValuesCountMatrix Module
 *
 * DuckDB utility for creating a value count matrix across multiple columns/tables.
 * Returns a matrix showing value presence and counts across different data sources,
 * useful for UpSet plots and column comparison views.
 *
 * Features:
 * - Cross-table value comparison
 * - Count per column per value
 * - Degree calculation (tables containing value)
 * - Signature for sorting
 * - Matrix result format
 *
 * @module lib/duckdb/getValuesCountMatrix
 *
 * @example
 * const matrix = await getValuesCountMatrix(
 *   ['col1', 'col2'],
 *   ['table1', 'table2']
 * );
 */

// See example here: https://observablehq.com/d/a57dc020b270136f#cell-18
import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

// Returns a matrix of value counts for the specified columns across multiple tables.
// In each row:
// - First column is the value (uniqueValue)
// - Next N columns are the counts for each table in tableDatabaseNames
// - Second to last column is the degree (number of tables the value appears in)
// - Last column is a signature string for sorting
export async function getValuesCountMatrix(
  columnDatabaseNames,
  tableDatabaseNames
) {
  if (
    !Array.isArray(columnDatabaseNames) ||
    !Array.isArray(tableDatabaseNames)
  ) {
    throw new Error(
      "Both columnDatabaseNames and tableDatabaseNames must be arrays"
    );
  } else if (columnDatabaseNames.length !== tableDatabaseNames.length) {
    throw new Error(
      "columnDatabaseNames and tableDatabaseNames must have the same length"
    );
  }

  const db = await getDuckDB();
  const conn = await db.connect();
  const query = `
    SELECT
        VAL,
        ${tableDatabaseNames
          .map(
            (tableDatabaseName) =>
              `CAST(SUM((SOURCE_TABLE = '${tableDatabaseName}')::INTEGER) AS INTEGER) AS ${tableDatabaseName}`
          )
          .join(",\n        ")},
        -- Calculate degree as the sum of nonzero columns
        (${tableDatabaseNames
          .map(
            (tableDatabaseName) =>
              `CASE WHEN SUM((SOURCE_TABLE = '${tableDatabaseName}')::INTEGER) > 0 THEN 1 ELSE 0 END`
          )
          .join(" + ")}) AS DEGREE,
        --- Create a signature string for sorting
        (${tableDatabaseNames
          .map(
            (tableDatabaseName) =>
              `CASE WHEN SUM((SOURCE_TABLE = '${tableDatabaseName}')::INTEGER) > 0 THEN '1' ELSE '0' END`
          )
          .join(" || ")}) AS SIGNATURE
        FROM (
            ${tableDatabaseNames
              .map(
                (tableDatabaseName, i) =>
                  `SELECT ${escapeColumnName(
                    columnDatabaseNames[i]
                  )} AS VAL, '${tableDatabaseName}' AS SOURCE_TABLE FROM ${tableDatabaseName}`
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
