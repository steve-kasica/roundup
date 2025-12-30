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
} from "@mui/material";
import { ExportButton } from "./ExportButton";
import { useSelector } from "react-redux";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";
import { ExportTableButton } from "../ui/buttons";

/**
 * ExportDialog Component
 *
 * Renders a dialog for configuring table export settings.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.name - Display name of the table/operation being exported
 * @param {string} props.databaseName - Internal database name for the export
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
function ExportDialog({ name, databaseName, onClose }) {
  const [format, setFormat] = useState("csv");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [exportName, setExportName] = useState(`${name || "export"}`);

  return (
    <>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {`Export ${name || "table"}`}
        <ExportTableButton onClick={onClose} />
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Export as <b>{(exportName || `table`) + "." + format}</b>:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="File Name"
            value={exportName.replace(/\.[^/.]+$/, "")} // Remove any existing extension for display
            onChange={(e) =>
              setExportName(
                `${e.target.value.replace(/\.[^/.]+$/, "").toLowerCase()}` // Append the correct extension
              )
            }
            fullWidth
            size="small"
            sx={{ mb: 1 }}
          />
          <TextField
            select
            label="Format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            SelectProps={{ native: true }}
            fullWidth
            size="small"
          >
            <option value="csv">CSV</option>
            <option value="tsv">TSV</option>
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
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <ExportButton
          databaseName={databaseName}
          exportName={exportName}
          format={format}
          includeHeaders={includeHeaders}
        />
      </DialogActions>
    </>
  );
}

const EnhancedExportDialog = (props) => {
  const { id } = props;
  const { name, databaseName } = useSelector((state) =>
    isTableId(id)
      ? selectTablesById(state, id)
      : selectOperationsById(state, id)
  );

  return <ExportDialog {...props} name={name} databaseName={databaseName} />;
};

export { ExportDialog, EnhancedExportDialog };
