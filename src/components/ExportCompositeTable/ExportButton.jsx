/**
 * @fileoverview ExportButton Component
 *
 * Provides a button for exporting table data to CSV or TSV format with progress tracking.
 * The component streams data in chunks for efficient handling of large datasets and
 * displays real-time export progress to the user.
 *
 * Features:
 * - Chunked streaming export for memory efficiency
 * - Progress bar with percentage indicator
 * - Support for CSV and TSV formats
 * - Optional header inclusion
 * - Disabled state handling
 *
 * @module components/ExportCompositeTable/ExportButton
 *
 * @example
 * <ExportButton
 *   exportName="my_data"
 *   databaseName="table_123"
 *   format="csv"
 *   includeHeaders={true}
 * />
 */

import { useState } from "react";
import exportTableToStreamManual from "../../lib/duckdb/exportTableToStreamManual";
import "./ExportButton.css";

/**
 * ExportButton Component
 *
 * A button that triggers table export with progress indication.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.exportName - Base name for the exported file (extension added automatically)
 * @param {string} props.databaseName - Internal database table name to export
 * @param {('csv'|'tsv')} props.format - Export format (CSV or TSV)
 * @param {boolean} props.includeHeaders - Whether to include column headers in export
 *
 * @returns {React.ReactElement} Export button with progress indicator
 *
 * @description
 * Export process:
 * 1. Initiates chunked streaming export (1000 rows per chunk)
 * 2. Updates progress bar as chunks are processed
 * 3. Downloads file automatically when complete
 * 4. Resets UI state after export
 *
 * The button is disabled when databaseName is undefined or during active export.
 */
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
