/**
 * @fileoverview DuckDB stack view creation utility.
 * @module lib/duckdb/createStackView/createStackView
 *
 * Provides functionality to create stacked (UNION ALL) views from multiple tables.
 * Combines rows from multiple child tables into a single unified view.
 *
 * Features:
 * - Creates views using UNION ALL operations
 * - Supports custom column name specifications
 * - Column names inherited from first child table
 * - Dynamic query generation based on child table configuration
 * - Replaces existing view if one exists
 *
 * @example
 * import { createStackView } from './createStackView';
 * await createStackView({
 *   viewName: 'all_orders',
 *   children: [
 *     { tableName: 'orders_2022', columnNames: ['id', 'amount'] },
 *     { tableName: 'orders_2023', columnNames: ['id', 'amount'] }
 *   ]
 * });
 */
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
