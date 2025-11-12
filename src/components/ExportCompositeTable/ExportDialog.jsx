/* eslint-disable react/prop-types */
import { useState } from "react";
import PropTypes from "prop-types";
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
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { ExportButton } from "./ExportButton";
import { useSelector } from "react-redux";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";

function ExportDialog({ name, id, onClose }) {
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
        {`Export ${name || id}`}
        <IconButton aria-label="close" onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
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
          operationId={id}
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
  const { name } = useSelector((state) =>
    isTableId(id)
      ? selectTablesById(state, id)
      : selectOperationsById(state, id)
  );

  return <ExportDialog {...props} name={name} />;
};

export { ExportDialog, EnhancedExportDialog };
