import { useState } from "react";
import { useDispatch } from "react-redux";
import { uploadTablesAction } from "../../data/sagas/uploadTablesSaga";
import { registerFiles } from "../../lib/duckdb";

export default function DuckDBFileUpload() {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleFileChange(e) {
    setError(null);
    setLoading(true);
    const files = Array.from(e.target.files);
    if (!files.length) return;
    try {
      await registerFiles(files);
      dispatch(
        uploadTablesAction({
          filesInfo: files.map((f) => ({
            name: f.name,
            size: f.size,
            type: f.type,
            lastModified: f.lastModified,
          })),
          source: "duckdb",
        })
      );
    } catch (err) {
      alert("Error uploading files: " + err.message);
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
