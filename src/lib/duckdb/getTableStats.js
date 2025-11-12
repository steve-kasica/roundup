/**
 * getTableStats.js
 *
 * DuckDB utilities for retrieving table statistics including row counts and column metadata.
 *
 * This module provides two main functions:
 *
 * 1. getTableStats() - Processes tables individually with error resilience
 *    - Best for: Mixed table sources, unknown table validity, debugging
 *    - Pros: Graceful error handling, continues if individual tables fail
 *    - Cons: Multiple queries, slower for many tables
 *
 * 2. getTableStatsBatch() - Processes all tables in optimized batch queries
 *    - Best for: Known valid tables, performance-critical operations
 *    - Pros: Faster execution, fewer queries
 *    - Cons: All-or-nothing error handling
 *
 * Quick Start:
 *   import { getTableStats } from './getTableStats';
 *   const stats = await getTableStats(['users', 'orders']);
 *   // Returns: [{ tableId, rowCount, databaseNames }, ...]
 */

import { getDuckDB } from "./duckdbClient";

/**
 * Get statistics for multiple tables including row count and column names.
 *
 * @param {string|string[]} tableIds - Single table ID or array of table IDs
 * @returns {Promise<Array>} Array of objects with tableId, rowCount, and databaseNames
 *
 * @example
 * // Get stats for a single table
 * const singleTableStats = await getTableStats("customers");
 * // Returns: [{ tableId: "customers", rowCount: 1500, databaseNames: ["id", "name", "email"] }]
 *
 * @example
 * // Get stats for multiple tables
 * const multiTableStats = await getTableStats(["customers", "orders", "products"]);
 * // Returns: [
 * //   { tableId: "customers", rowCount: 1500, databaseNames: ["id", "name", "email", "created_at"] },
 * //   { tableId: "orders", rowCount: 3200, databaseNames: ["order_id", "customer_id", "amount", "order_date"] },
 * //   { tableId: "products", rowCount: 850, databaseNames: ["product_id", "name", "price", "category"] }
 * // ]
 *
 * @example
 * // Handle tables that might not exist (graceful error handling)
 * const statsWithErrors = await getTableStats(["valid_table", "nonexistent_table"]);
 * // Returns: [
 * //   { tableId: "valid_table", rowCount: 100, databaseNames: ["col1", "col2"] },
 * //   { tableId: "nonexistent_table", rowCount: 0, databaseNames: [], error: "Table not found" }
 * // ]
 *
 * @example
 * // Use in a React component or saga
 * const tableIds = ["users", "posts", "comments"];
 * const tableStatistics = await getTableStats(tableIds);
 *
 * tableStatistics.forEach(stat => {
 *   if (stat.error) {
 *     console.warn(`Failed to get stats for ${stat.tableId}: ${stat.error}`);
 *   } else {
 *     console.log(`Table ${stat.tableId} has ${stat.rowCount} rows and ${stat.databaseNames.length} columns`);
 *   }
 * });
 */
export async function getTableStats(tableIds) {
  const db = await getDuckDB();
  const conn = await db.connect();

  // Normalize tableIds to always be an array
  const normalizedTableIds = Array.isArray(tableIds) ? tableIds : [tableIds];

  try {
    const results = [];

    // Process each table individually to handle potential errors gracefully
    // This approach ensures that if one table fails, others can still be processed
    for (const tableId of normalizedTableIds) {
      try {
        // Build a query that gets both row count and column names for each table
        // Uses CTEs (Common Table Expressions) for clarity and efficiency
        const query = `
          WITH table_info AS (
            -- Get the total row count for this specific table
            SELECT 
              '${tableId}' as table_id,
              (SELECT COUNT(*) FROM "${tableId}") as row_count
          ),
          column_info AS (
            -- Get all column names in the correct order using ordinal_position
            -- array_agg() collects all column names into a single array
            SELECT 
              '${tableId}' as table_id,
              array_agg(column_name ORDER BY ordinal_position) as column_names
            FROM information_schema.columns 
            WHERE table_name = '${tableId}'
          )
          -- Join the row count and column information together
          SELECT 
            ti.table_id,
            ti.row_count,
            ci.column_names
          FROM table_info ti
          JOIN column_info ci ON ti.table_id = ci.table_id;
        `;

        const result = await conn.query(query);
        // Convert the DuckDB result to a standard JavaScript object
        const tableData = result.toArray().map((row) => row.toJSON())[0];

        if (tableData) {
          // Structure the result in a consistent format
          results.push({
            tableId: tableData.table_id,
            rowCount: Number(tableData.row_count), // Ensure it's a JavaScript number
            databaseNames: Array.isArray(tableData.column_names)
              ? tableData.column_names
              : Array.from(tableData.column_names), // Ensure it's a JS array
          });
        }
      } catch (tableError) {
        // Individual table error - log warning but continue processing other tables
        console.warn(
          `Error getting stats for table ${tableId}:`,
          tableError.message
        );
        // Add a record with error information so the caller knows what failed
        results.push({
          tableId: tableId,
          rowCount: 0,
          databaseNames: [],
          error: tableError.message,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Error in getTableStats:", error);
    throw error;
  } finally {
    await conn.close();
  }
}

/**
 * Get statistics for multiple tables using a single optimized query.
 * This is more efficient for large numbers of tables but less error-resilient.
 *
 * @param {string[]} tableIds - Array of table IDs
 * @returns {Promise<Array>} Array of objects with tableId, rowCount, and databaseNames
 *
 * @example
 * // Efficiently process many tables at once
 * const manyTables = ["table1", "table2", "table3", "table4", "table5"];
 * const batchStats = await getTableStatsBatch(manyTables);
 * // Returns: [
 * //   { tableId: "table1", rowCount: 1000, databaseNames: ["id", "data"] },
 * //   { tableId: "table2", rowCount: 2500, databaseNames: ["key", "value", "timestamp"] },
 * //   ... // results for all tables
 * // ]
 *
 * @example
 * // Use when you have many tables and performance is critical
 * const allUserTables = await getAllUserTableNames(); // hypothetical function
 * const allStats = await getTableStatsBatch(allUserTables);
 *
 * // Process results
 * const totalRows = allStats.reduce((sum, stat) => sum + stat.rowCount, 0);
 * const avgColumnsPerTable = allStats.reduce((sum, stat) => sum + stat.databaseNames.length, 0) / allStats.length;
 *
 * console.log(`Total rows across all tables: ${totalRows}`);
 * console.log(`Average columns per table: ${avgColumnsPerTable.toFixed(1)}`);
 *
 * @example
 * // Note: Less error resilient - if any table fails, the whole operation may fail
 * try {
 *   const stats = await getTableStatsBatch(["good_table", "bad_table"]);
 * } catch (error) {
 *   // The entire operation failed, unlike getTableStats which handles individual errors
 *   console.error("Batch operation failed:", error.message);
 *   // Fallback to individual processing
 *   const stats = await getTableStats(["good_table", "bad_table"]);
 * }
 */
export async function getTableStatsBatch(tableIds) {
  const db = await getDuckDB();
  const conn = await db.connect();

  // Ensure tableIds is an array
  const normalizedTableIds = Array.isArray(tableIds) ? tableIds : [tableIds];

  try {
    // Build a single query that processes all tables
    // This approach is more efficient but less error-resilient than individual queries

    // First get column information for all tables in one query
    const columnQuery = `
      SELECT 
        table_name as table_id,
        array_agg(column_name ORDER BY ordinal_position) as column_names
      FROM information_schema.columns 
      WHERE table_name IN (${normalizedTableIds
        .map((id) => `'${id}'`)
        .join(", ")})
      GROUP BY table_name;
    `;

    const columnResult = await conn.query(columnQuery);
    const columnData = columnResult.toArray().map((row) => row.toJSON());

    // Build row count queries for each table and execute them as a single UNION query
    // This is more efficient than executing separate COUNT queries
    const rowCountQueries = normalizedTableIds.map(
      (tableId) =>
        `SELECT '${tableId}' as table_id, COUNT(*) as row_count FROM "${tableId}"`
    );

    const combinedRowCountQuery = rowCountQueries.join(" UNION ALL ");
    const rowCountResult = await conn.query(combinedRowCountQuery);
    const rowCountData = rowCountResult.toArray().map((row) => row.toJSON());

    // Combine the results from both queries
    // Match each table's column info with its row count
    const results = columnData.map((colInfo) => {
      const rowInfo = rowCountData.find(
        (row) => row.table_id === colInfo.table_id
      );
      return {
        tableId: colInfo.table_id,
        rowCount: rowInfo ? Number(rowInfo.row_count) : 0,
        databaseNames: colInfo.column_names || [], // Fallback to empty array
      };
    });

    return results;
  } catch (error) {
    console.error("Error in getTableStatsBatch:", error);
    throw error;
  } finally {
    await conn.close();
  }
}

/*
 * Example test usage (for development/debugging):
 *
 * // Test with sample data
 * async function testTableStats() {
 *   try {
 *     // Assuming you have tables named 'customers' and 'orders'
 *     const stats = await getTableStats(['customers', 'orders']);
 *     console.log('Individual processing:', stats);
 *
 *     const batchStats = await getTableStatsBatch(['customers', 'orders']);
 *     console.log('Batch processing:', batchStats);
 *
 *     // Test error handling
 *     const mixedStats = await getTableStats(['customers', 'nonexistent_table']);
 *     console.log('Mixed results:', mixedStats);
 *   } catch (error) {
 *     console.error('Test failed:', error);
 *   }
 * }
 *
 * // Uncomment to run test:
 * // testTableStats();
 */
