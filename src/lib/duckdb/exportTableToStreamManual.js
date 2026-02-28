/**
 * @fileoverview exportTableToStreamManual Module
 *
 * DuckDB utility for exporting tables to CSV/TSV/JSON/Parquet/SQL with streaming and progress callbacks.
 * Provides chunked export with progress reporting for large datasets.
 *
 * Features:
 * - CSV, TSV, JSON, Parquet, and SQL export formats
 * - Chunked streaming for large tables (CSV/TSV/SQL)
 * - Native DuckDB COPY TO for JSON and Parquet
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
 *
 * @example
 * await exportTableToStreamManual('my_table', 'export.parquet', {
 *   format: 'parquet'
 * });
 */

import { getDuckDB } from "./duckdbClient";

/**
 * Export a table/view to CSV/TSV/JSON/Parquet with manual streaming and progress callback
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
    format = "csv", // "csv", "tsv", "json", "parquet", or "sql"
  } = options;

  // Use DuckDB native COPY TO for JSON and Parquet
  if (format === "json" || format === "parquet") {
    return exportWithCopyTo(tableName, filename, {
      format,
      columns,
      onProgress,
    });
  }

  // Use SQL export for .sql files
  if (format === "sql") {
    return exportToSQL(tableName, filename, { chunkSize, columns, onProgress });
  }

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
    const columnHeaders = columns
      ? columnDatabaseNames.map((dbName) => {
          const colInfo = columns.find((c) => c.databaseName === dbName);
          return colInfo?.name || colInfo?.databaseName || dbName;
        })
      : columnDatabaseNames;

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
 * Export a table using DuckDB's native COPY TO for JSON and Parquet formats.
 * Uses an in-memory file system buffer, then triggers a browser download.
 */
async function exportWithCopyTo(tableName, filename, options = {}) {
  const { format, columns = null, onProgress = null } = options;

  const db = await getDuckDB();
  const conn = await db.connect();

  try {
    // Get total row count for progress reporting
    const countResult = await conn.query(
      `SELECT COUNT(*) as count FROM "${tableName}"`,
    );
    const totalRows = Number(countResult.toArray()[0].count);

    // Build column selection with optional renaming
    let selectClause = "*";
    if (columns) {
      const columnsResult = await conn.query(`DESCRIBE "${tableName}"`);
      const columnDatabaseNames = columnsResult
        .toArray()
        .map((col) => col.column_name);

      const colExpressions = columnDatabaseNames.map((dbName) => {
        const colInfo = columns.find((c) => c.databaseName === dbName);
        const displayName = colInfo?.name || colInfo?.databaseName || dbName;
        if (displayName !== dbName) {
          return `"${dbName}" AS "${displayName}"`;
        }
        return `"${dbName}"`;
      });
      selectClause = colExpressions.join(", ");
    }

    // Report initial progress
    if (onProgress) {
      onProgress({ processedRows: 0, totalRows, percentage: 0 });
    }

    // Use DuckDB's COPY TO with virtual file system
    const virtualPath = `/${filename}`;
    const formatOption = format === "parquet" ? "PARQUET" : "JSON";

    await conn.query(`
      COPY (SELECT ${selectClause} FROM "${tableName}")
      TO '${virtualPath}' (FORMAT ${formatOption})
    `);

    // Read the file from DuckDB's virtual file system
    const fileBuffer = await db.copyFileToBuffer(virtualPath);

    // Report completion
    if (onProgress) {
      onProgress({ processedRows: totalRows, totalRows, percentage: 100 });
    }

    // Determine MIME type
    const mimeType =
      format === "parquet" ? "application/octet-stream" : "application/json";

    const blob = new Blob([fileBuffer], { type: mimeType });
    downloadBlob(blob, filename);

    // Clean up virtual file
    await db.dropFile(virtualPath);

    return {
      success: true,
      rowsExported: totalRows,
      fileSize: blob.size,
    };
  } finally {
    await conn.close();
  }
}

/**
 * Export a table as a SQL file with CREATE TABLE and INSERT INTO statements.
 * Uses chunked streaming with progress reporting.
 */
async function exportToSQL(tableName, filename, options = {}) {
  const { chunkSize = 1000, columns = null, onProgress = null } = options;

  const db = await getDuckDB();
  const conn = await db.connect();

  try {
    // Get total row count
    const countResult = await conn.query(
      `SELECT COUNT(*) as count FROM "${tableName}"`,
    );
    const totalRows = Number(countResult.toArray()[0].count);

    // Get column info with types
    const columnsResult = await conn.query(`DESCRIBE "${tableName}"`);
    const columnInfo = columnsResult.toArray().map((col) => ({
      databaseName: col.column_name,
      type: col.column_type,
    }));

    // Build display names
    const columnNames = columnInfo.map(({ databaseName }) => {
      const colInfo = columns?.find((c) => c.databaseName === databaseName);
      return colInfo?.name || colInfo?.databaseName || databaseName;
    });

    const chunks = [];
    let processedRows = 0;

    // Emit CREATE TABLE statement
    const exportTableName = filename.replace(/\.sql$/, "");
    const columnDefs = columnInfo
      .map((col, i) => `  "${columnNames[i]}" ${mapDuckDBTypeToSQL(col.type)}`)
      .join(",\n");
    chunks.push(`CREATE TABLE "${exportTableName}" (\n${columnDefs}\n);\n\n`);

    // Process data in chunks
    while (processedRows < totalRows) {
      const result = await conn.query(`
        SELECT * FROM "${tableName}"
        LIMIT ${chunkSize}
        OFFSET ${processedRows}
      `);

      const rows = result.toArray();
      if (rows.length === 0) break;

      const insertRows = rows
        .map(
          (row) =>
            "(" +
            columnInfo
              .map(({ databaseName }) => formatSQLValue(row[databaseName]))
              .join(", ") +
            ")",
        )
        .join(",\n");

      const colList = columnNames.map((n) => `"${n}"`).join(", ");
      chunks.push(
        `INSERT INTO "${exportTableName}" (${colList}) VALUES\n${insertRows};\n\n`,
      );

      processedRows += rows.length;

      if (onProgress) {
        onProgress({
          processedRows,
          totalRows,
          percentage: Math.round((processedRows / totalRows) * 100),
        });
      }
    }

    const blob = new Blob(chunks, { type: "application/sql" });
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
 * Map DuckDB column types to standard SQL types
 */
function mapDuckDBTypeToSQL(duckdbType) {
  const upper = duckdbType.toUpperCase();
  const mapping = {
    BOOLEAN: "BOOLEAN",
    BOOL: "BOOLEAN",
    TINYINT: "SMALLINT",
    SMALLINT: "SMALLINT",
    INTEGER: "INTEGER",
    INT: "INTEGER",
    INT4: "INTEGER",
    BIGINT: "BIGINT",
    INT8: "BIGINT",
    HUGEINT: "NUMERIC",
    FLOAT: "REAL",
    REAL: "REAL",
    FLOAT4: "REAL",
    DOUBLE: "DOUBLE PRECISION",
    FLOAT8: "DOUBLE PRECISION",
    DECIMAL: "NUMERIC",
    VARCHAR: "TEXT",
    TEXT: "TEXT",
    STRING: "TEXT",
    DATE: "DATE",
    TIME: "TIME",
    TIMESTAMP: "TIMESTAMP",
    DATETIME: "TIMESTAMP",
    BLOB: "BLOB",
    UUID: "UUID",
    JSON: "JSON",
  };
  // Handle parameterized types like DECIMAL(10,2) or VARCHAR(255)
  const baseType = upper.replace(/\(.*\)/, "").trim();
  return mapping[baseType] || "TEXT";
}

/**
 * Format a value for SQL INSERT statements
 */
function formatSQLValue(value) {
  if (value === null || value === undefined) {
    return "NULL";
  }
  if (typeof value === "boolean") {
    return value ? "TRUE" : "FALSE";
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (typeof value === "bigint") {
    return String(value);
  }
  // Escape single quotes by doubling them
  const escaped = String(value).replace(/'/g, "''");
  return `'${escaped}'`;
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
