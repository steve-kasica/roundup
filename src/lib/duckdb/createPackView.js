/**
 * @fileoverview createPackView Module
 *
 * DuckDB utility for creating PACK (join) views between two tables. Generates SQL
 * queries for various join types and executes them against DuckDB.
 *
 * Features:
 * - Support for multiple join types (INNER, LEFT, RIGHT, FULL, CROSS)
 * - Column selection and aliasing
 * - Join predicate support (EQUALS, CONTAINS, STARTS_WITH, ENDS_WITH)
 * - View creation and query execution
 *
 * @module lib/duckdb/createPackView
 *
 * @example
 * const result = await createPackView({
 *   leftTable: 'customers',
 *   rightTable: 'orders',
 *   leftKey: 'id',
 *   rightKey: 'customer_id',
 *   joinType: 'LEFT'
 * });
 */

import { JOIN_TYPES } from "../../slices/operationsSlice";
import { getDuckDB } from "./duckdbClient";
import { escapeColumnName } from "./utilities";

// With these UNION ALL query, the view will take on the column names of the first child.
export async function createPackView(queryData, columnList = null) {
  const db = await getDuckDB();
  const conn = await db.connect();
  const query = formQuery(queryData, columnList);
  const response = await conn.query(query);
  await conn.close();
  return response;
}

export function formQuery(data, columnList = null) {
  const leftTable = data.children[0].tableName;
  const rightTable = data.children[1].tableName;
  const { joinType, leftKey, rightKey, joinPredicate } = data;

  // TODO: refactor to util file for DRY
  const predicates = {
    EQUALS: `${leftTable}.${escapeColumnName(
      leftKey
    )} = ${rightTable}.${escapeColumnName(rightKey)}`,
    CONTAINS: `contains(${leftTable}.${escapeColumnName(
      leftKey
    )}, ${rightTable}.${escapeColumnName(rightKey)})`,
    STARTS_WITH: `starts_with(${leftTable}.${escapeColumnName(
      leftKey
    )}, ${rightTable}.${escapeColumnName(rightKey)})`,
    ENDS_WITH: `ends_with(${leftTable}.${escapeColumnName(
      leftKey
    )}, ${rightTable}.${escapeColumnName(rightKey)})`,
  };

  let definition = "";
  if (joinType === JOIN_TYPES.LEFT_ANTI) {
    definition = `
      SELECT *
      FROM ${leftTable} 
      ANTI JOIN ${rightTable}
      ON ${predicates[joinPredicate]}
      `;
  } else if (joinType === JOIN_TYPES.RIGHT_ANTI) {
    // Right anti-join: return rows from right table that don't match left table
    // Swap table order and use ANTI JOIN
    const rightAntiPredicate = predicates[joinPredicate]
      .replace(`${leftTable}.${leftKey}`, `${rightTable}.${rightKey}`)
      .replace(`${rightTable}.${rightKey}`, `${leftTable}.${leftKey}`);
    definition = `
      SELECT *
      FROM ${rightTable} 
      ANTI JOIN ${leftTable}
      ON ${rightAntiPredicate}
    `;
  } else if (joinType === JOIN_TYPES.FULL_ANTI) {
    // Full anti-join: return rows from both tables that don't match
    // Use FULL OUTER JOIN approach to get combined schema, then filter out matches
    definition = `
      SELECT ${leftTable}.*, ${rightTable}.*
      FROM ${leftTable} 
      FULL OUTER JOIN ${rightTable}
      ON ${predicates[joinPredicate]}
      WHERE ${leftTable}.${escapeColumnName(
      leftKey
    )} IS NULL OR ${rightTable}.${escapeColumnName(rightKey)} IS NULL
    `;
  } else if (joinType === JOIN_TYPES.FULL) {
    // Full outer join with custom ordering:
    // 1. Matched rows (both sides have values)
    // 2. Left-only rows (right side is NULL)
    // 3. Right-only rows (left side is NULL)
    definition = `
      SELECT *
      FROM ${leftTable} 
      FULL OUTER JOIN ${rightTable}
      ON ${predicates[joinPredicate]}
      ORDER BY 
        CASE 
          WHEN ${leftTable}.${escapeColumnName(
      leftKey
    )} IS NOT NULL AND ${rightTable}.${escapeColumnName(
      rightKey
    )} IS NOT NULL THEN 1
          WHEN ${leftTable}.${escapeColumnName(
      leftKey
    )} IS NOT NULL AND ${rightTable}.${escapeColumnName(
      rightKey
    )} IS NULL THEN 2
          WHEN ${leftTable}.${escapeColumnName(
      leftKey
    )} IS NULL AND ${rightTable}.${escapeColumnName(
      rightKey
    )} IS NOT NULL THEN 3
        END
    `;
  } else {
    // DuckDB offers native support for other supported join types
    definition = `
      SELECT *
      FROM ${leftTable} 
      ${joinType} JOIN ${rightTable}
      ON ${predicates[joinPredicate]}
    `;
  }

  const columnSpec = columnList ? `(${columnList.join(", ")})` : "";
  const query = `
    CREATE OR REPLACE TABLE ${data.viewName}${columnSpec} AS
    ${definition}`;
  return query;
}
