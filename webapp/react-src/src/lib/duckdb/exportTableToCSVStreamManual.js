import { getDuckDB } from "./duckdbClient";

/**
 * Export a table/view to CSV with manual streaming and progress callback
 */
export async function exportTableToCSVStreamManual(
  operationId,
  filename = "export.csv",
  options = {}
) {
  const {
    chunkSize = 1000, // Number of rows per chunk
    onProgress = null, // Progress callback function
    delimiter = ",",
    includeHeaders = true,
  } = options;

  const db = await getDuckDB();
  const conn = await db.connect();

  try {
    // Get total row count for progress tracking
    const countResult = await conn.query(
      `SELECT COUNT(*) as count FROM "${operationId}"`
    );
    const totalRows = Number(countResult.toArray()[0].count);

    // Get column information
    const columnsResult = await conn.query(`DESCRIBE "${operationId}"`);
    const columns = columnsResult.toArray().map((col) => col.column_name); // TODO: column_names are IDs, not names

    const chunks = [];
    let processedRows = 0;

    // Add headers if requested
    if (includeHeaders) {
      chunks.push(columns.join(delimiter) + "\n");
    }

    // Process data in chunks
    while (processedRows < totalRows) {
      const result = await conn.query(`
        SELECT * FROM "${operationId}" 
        LIMIT ${chunkSize} 
        OFFSET ${processedRows}
      `);

      const rows = result.toArray();
      if (rows.length === 0) break;

      // Convert rows to CSV format
      const csvChunk =
        rows
          .map((row) =>
            columns
              .map((col) => formatCSVValue(row[col], delimiter))
              .join(delimiter)
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
    const blob = new Blob(chunks, { type: "text/csv" });
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
 * Format a value for CSV output, handling escaping
 */
function formatCSVValue(value, delimiter = ",") {
  if (value === null || value === undefined) {
    return "";
  }

  const stringValue = String(value);

  // Check if the value needs to be quoted
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
