import React, { useState } from "react";
import { getDuckDB } from "../../lib/duckdb/duckdbClient";
import { useDispatch } from "react-redux";
import { tableUploadSuccess } from "../../data/sagas/tableUploadSaga";

export default function DuckDBFileUpload({ onTableLoaded }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    setError(null);
    setLoading(true);
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      const db = await getDuckDB();
      const conn = await db.connect();
      for (const file of files) {
        const tableName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[^a-zA-Z0-9_]/g, "_");

        // Register the file in DuckDB's virtual FS
        const text = await file.text();
        await db.registerFileText(file.name, text);
        // Ingest the CSV into a DuckDB table
        await conn.query(
          `CREATE TABLE "${tableName}" AS SELECT * FROM read_csv_auto('${file.name}', AUTO_DETECT=TRUE, all_varchar=true)`
        );
        dispatch(
          tableUploadSuccess({
            source: "File upload",
            tableName,
            extension: file.name.split(".").pop().toLowerCase(),
            size: file.size, // inherited from Blob API
            mimeType: file.type, // inherited from Blob API
            lastModified: file.lastModified,
          })
        );
        if (onTableLoaded) onTableLoaded(tableName);
      }
      await conn.close();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <input
        type="file"
        accept=".csv,.parquet"
        onChange={handleFileChange}
        disabled={loading}
        multiple
      />
      {loading && <span>Loading...</span>}
      {error && <span style={{ color: "red" }}>{error}</span>}
    </div>
  );
}
