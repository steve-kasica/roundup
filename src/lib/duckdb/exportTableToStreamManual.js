/**
 * @fileoverview exportTableToStreamManual Module
 *
 * DuckDB utility for exporting tables to CSV/TSV with streaming and progress callbacks.
 * Provides chunked export with progress reporting for large datasets.
 *
 * Features:
 * - CSV and TSV export formats
 * - Chunked streaming for large tables
 * - Progress callback with row counts
 * - Configurable chunk size
 * - Header inclusion options
 * - File download trigger
 *
 * @module lib/duckdb/exportTableToStreamManual
 *
 * @example
 * await exportTableToStreamManual('my_table', 'export.csv', {
 *   chunkSize: 1000,
 *   delimiter: ',',
 *   includeHeaders: true
 * });
 */

import { getDuckDB } from "./duckdbClient";

/**
 * Export a table/view to CSV/TSV with manual streaming and progress callback
 */
export default async function exportTableToStreamManual(
  tableName,
  filename = "export.csv",
  options = {},
) {
  const {
    chunkSize = 1000, // Number of rows per chunk
    onProgress = null, // Progress callback function
    delimiter = ",", // Can be "," for CSV or "\t" for TSV
    includeHeaders = true,
    columns = null, // Array of column objects with name and databaseName properties
  } = options;

  const db = await getDuckDB();
  const conn = await db.connect();

  try {
    // Get total row count for progress tracking
    const countResult = await conn.query(
      `SELECT COUNT(*) as count FROM "${tableName}"`,
    );
    const totalRows = Number(countResult.toArray()[0].count);

    // Get column information
    const columnsResult = await conn.query(`DESCRIBE "${tableName}"`);
    const columnDatabaseNames = columnsResult
      .toArray()
      .map((col) => col.column_name);

    // Create column headers using name property, falling back to databaseName
    // Strip newline characters to prevent corrupted CSV/TSV output
    const columnHeaders = columns
      ? columnDatabaseNames.map((dbName) => {
          const colInfo = columns.find((c) => c.databaseName === dbName);
          const header = colInfo?.name || colInfo?.databaseName || dbName;
          return header.replace(/\r?\n|\r/g, " ");
        })
      : columnDatabaseNames.map((name) => name.replace(/\r?\n|\r/g, " "));

    const chunks = [];
    let processedRows = 0;

    // Determine MIME type based on delimiter
    const mimeType =
      delimiter === "\t" ? "text/tab-separated-values" : "text/csv";

    // Add headers if requested
    if (includeHeaders) {
      chunks.push(columnHeaders.join(delimiter) + "\n");
    }

    // Process data in chunks
    while (processedRows < totalRows) {
      const result = await conn.query(`
        SELECT * FROM "${tableName}" 
        LIMIT ${chunkSize} 
        OFFSET ${processedRows}
      `);

      const rows = result.toArray();
      if (rows.length === 0) break;

      // Convert rows to CSV/TSV format
      const csvChunk =
        rows
          .map((row) =>
            columnDatabaseNames
              .map((col) => formatValue(row[col], delimiter))
              .join(delimiter),
          )
          .join("\n") + "\n";

      chunks.push(csvChunk);
      processedRows += rows.length;

      // Call progress callback if provided
      if (onProgress) {
        onProgress({
          processedRows,
          totalRows,
          percentage: Math.round((processedRows / totalRows) * 100),
        });
      }
    }

    // Create and download the file
    const blob = new Blob(chunks, { type: mimeType });
    downloadBlob(blob, filename);

    return {
      success: true,
      rowsExported: processedRows,
      fileSize: blob.size,
    };
  } finally {
    await conn.close();
  }
}

/**
 * Format a value for CSV/TSV output, handling escaping
 */
function formatValue(value, delimiter = ",") {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // For TSV, we handle tabs differently - replace with spaces or escape
  if (delimiter === "\t") {
    // For TSV, replace tabs in data with spaces and handle newlines
    const tsvValue = stringValue
      .replace(/\t/g, " ") // Replace tabs with spaces
      .replace(/\r?\n/g, " "); // Replace newlines with spaces

    // TSV typically doesn't use quotes, but we can quote if there are problematic characters
    if (tsvValue.includes('"')) {
      return tsvValue.replace(/"/g, '""'); // Escape quotes by doubling
    }

    return tsvValue;
  }

  // Standard CSV handling
  const needsQuotes =
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes("\n") ||
    stringValue.includes("\r");

  if (needsQuotes) {
    // Escape existing quotes by doubling them
    const escapedValue = stringValue.replace(/"/g, '""');
    return `"${escapedValue}"`;
  }

  return stringValue;
}

/**
 * Helper function to trigger file download
 */
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
