/**
 * @fileoverview ExportDialog Component
 *
 * A dialog component for configuring and executing table exports. Provides user interface
 * for selecting export format, filename, and options before triggering the export process.
 *
 * The component comes in two variants:
 * - ExportDialog: Base component accepting props directly
 * - EnhancedExportDialog: Redux-connected version that fetches table/operation data
 *
 * @module components/ExportCompositeTable/ExportDialog
 *
 * @example
 * // Using the enhanced version (recommended)
 * <EnhancedExportDialog id="table-123" onClose={handleClose} />
 *
 * @example
 * // Using the base component
 * <ExportDialog
 *   name="my_table"
 *   databaseName="table_db_123"
 *   onClose={handleClose}
 * />
 */

/* eslint-disable react/prop-types */
import { useState } from "react";
import {
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import { useSelector } from "react-redux";
import { isTableId, selectTablesById } from "../../../slices/tablesSlice";
import { selectOperationsById } from "../../../slices/operationsSlice";
import { selectColumnsById } from "../../../slices/columnsSlice";
import exportTableToStreamManual from "../../../lib/duckdb/exportTableToStreamManual";

/**
 * ExportDialog Component
 *
 * Renders a dialog for configuring table export settings.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Display name of the table/operation being exported
 * @param {string} props.databaseName - Internal database name for the export
 * @param {Array} props.columns - Array of column objects with name and databaseName properties
 * @param {Function} props.onClose - Callback to close the dialog
 *
 * @returns {React.ReactElement} A dialog with export configuration options
 *
 * @description
 * Configuration options:
 * - File name (automatically lowercased, extension auto-appended)
 * - Format selection (CSV or TSV)
 * - Include headers checkbox
 *
 * The dialog displays a preview of the final filename and provides
 * Cancel and Export buttons.
 */
function ExportDialog({ name, databaseName, columns, onClose }) {
  const [format, setFormat] = useState("csv");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [exportName, setExportName] = useState(`${name || "export"}`);
  const [progress, setProgress] = useState(0);

  const onExport = async () => {
    setIsExporting(true);
    setProgress(0);
    setShowProgress(false);

    // Only show progress indicator if export takes longer than 300ms
    const showProgressTimeout = setTimeout(() => {
      setShowProgress(true);
    }, 300);

    try {
      await exportTableToStreamManual(databaseName, `${exportName}.${format}`, {
        chunkSize: 1000,
        onProgress: (progressInfo) => {
          setProgress(progressInfo.percentage);
        },
        delimiter: format === "tsv" ? "\t" : ",",
        includeHeaders,
        columns,
      });
    } finally {
      clearTimeout(showProgressTimeout);
      setIsExporting(false);
      setShowProgress(false);
      setProgress(0);
      onClose();
    }
  };

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {`Export ${exportName}.${format}`}
      </DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            fullWidth
            size="small"
            value={exportName.replace(/\.[^/.]+$/, "")} // Remove any existing extension for display
            onChange={(e) =>
              setExportName(
                `${e.target.value.replace(/\.[^/.]+$/, "").toLowerCase()}`, // Append the correct extension
              )
            }
            sx={{ mb: 1 }}
          />

          <TextField
            select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            fullWidth
            size="small"
          >
            <MenuItem value="csv">CSV</MenuItem>
            <MenuItem value="tsv">TSV</MenuItem>
          </TextField>

          <FormControlLabel
            control={
              <Checkbox
                checked={includeHeaders}
                onChange={(e) => setIncludeHeaders(e.target.checked)}
                color="primary"
              />
            }
            label="Include column headers"
          />
        </Box>
      </DialogContent>
      <DialogActions
        sx={{
          display: "flex",
          justifyContent: "center",
          // alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="outlined" onClick={onExport} disabled={isExporting}>
            Export
          </Button>
        </Box>
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mt: 1,
          }}
        >
          {showProgress && (
            <Box
              sx={{
                width: "100%",
                mr: 2,
                position: "relative",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: "primary.light",
                  opacity: 0.3,
                  borderRadius: 1,
                  transition: "width 0.2s ease-in-out",
                }}
              />
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{ position: "relative", zIndex: 1, p: 0.5 }}
              >
                Exporting... {progress.toFixed(2)}%
              </Typography>
            </Box>
          )}
        </Box>
      </DialogActions>
    </>
  );
}

const EnhancedExportDialog = (props) => {
  const { id } = props;
  const { name, databaseName, columnIds } = useSelector((state) =>
    isTableId(id)
      ? selectTablesById(state, id)
      : selectOperationsById(state, id),
  );

  const columns = useSelector((state) => selectColumnsById(state, columnIds));

  return (
    <ExportDialog
      {...props}
      name={name}
      databaseName={databaseName}
      columns={columns}
    />
  );
};

export { ExportDialog, EnhancedExportDialog };
