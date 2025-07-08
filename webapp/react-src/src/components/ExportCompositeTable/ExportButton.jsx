import { useState } from "react";
import PropTypes from "prop-types";
import { exportTableToCSVStreamManual } from "../../lib/duckdb/exportTableToCSVStreamManual";
import "./ExportButton.css";

export function ExportButton({
  exportName,
  operationId,
  format,
  includeHeaders,
}) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const isDisabled = operationId === undefined;

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    try {
      const result = await exportTableToCSVStreamManual(
        operationId,
        `${exportName}.${format}`,
        {
          chunkSize: 1000,
          onProgress: (progressInfo) => {
            setProgress(progressInfo.percentage);
          },
          includeHeaders,
        }
      );

      console.log(`Successfully exported ${result.rowsExported} rows`);
      // } catch (error) {
      //   console.error("Export failed:", error);
      //   alert("Export failed: " + error.message);
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

ExportButton.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string,
  format: PropTypes.string.isRequired,
};
