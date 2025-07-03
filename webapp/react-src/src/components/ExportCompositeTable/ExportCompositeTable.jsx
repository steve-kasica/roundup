import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

/**
 * ExportCompositeTable
 * Modal dialog for exporting a table (CSV, JSON, etc.)
 * Props:
 *   open: boolean - whether the modal is open
 *   onClose: function - called when dialog is closed
 *   onExport: function - called with export options when export is confirmed
 *   tableName: string - name of the table to export
 */
export default function ExportCompositeTable({
  open,
  onClose,
  onExport,
  tableName,
}) {
  const [format, setFormat] = useState("csv");
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [fileName, setFileName] = useState(
    tableName ? `${tableName}.csv` : "export.csv"
  );

  useEffect(() => {
    if (tableName) setFileName(`${tableName}.${format}`);
  }, [tableName, format]);

  const handleExport = () => {
    onExport && onExport({ format, includeHeaders, fileName });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        Export Table
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography gutterBottom>
          Export <b>{tableName || "table"}</b> as:
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="File Name"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
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
            <option value="json">JSON</option>
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
        <Button onClick={handleExport} variant="contained" color="primary">
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}

ExportCompositeTable.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onExport: PropTypes.func,
  tableName: PropTypes.string,
};
