import { useState } from "react";
import exportTableToStreamManual from "../../lib/duckdb/exportTableToStreamManual";
import "./ExportButton.css";

export function ExportButton({
  exportName,
  databaseName,
  format,
  includeHeaders,
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const isDisabled = databaseName === undefined;

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      await exportTableToStreamManual(databaseName, `${exportName}.${format}`, {
        chunkSize: 1000,
        onProgress: (progressInfo) => {
          setProgress(progressInfo.percentage);
        },
        delimiter: format === "tsv" ? "\t" : ",",
        includeHeaders,
      });
    } finally {
      setIsExporting(false);
      setProgress(0);
    }
  };

  return (
    <div className="export-container">
      <button
        onClick={handleExport}
        disabled={isExporting || isDisabled}
        className="export-button"
      >
        {isExporting ? "Exporting..." : `Export to ${format}`}
      </button>

      {isExporting && (
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-text">{progress}%</span>
        </div>
      )}
    </div>
  );
}
