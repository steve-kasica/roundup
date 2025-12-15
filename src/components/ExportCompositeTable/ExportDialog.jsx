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
