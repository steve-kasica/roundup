/**
 * CompositeTableSchema.js
 * ------------------------------------------------------------------------------------------------
 * An interactive hierarchical visualization of the table tree
 */

import "./CompositeTableSchema.scss";

import { useSelector } from "react-redux";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectMaxOperationDepth,
  selectRootOperation,
} from "../../slices/operationsSlice";

import TableDropTarget from "./TableDropTarget";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import OperationView from "./OperationView";
import ExportCompositeTable from "../ExportCompositeTable/ExportCompositeTable";
import { useState } from "react";
import Button from "@mui/material/Button";
import { ExportButton } from "../ExportCompositeTable/ExportButton";

const gridColumns = 12;
const gridWidth = gridColumns - 2;

export default function CompositeTableSchema() {
  const rootOperationId = useSelector(selectRootOperation);
  const maxOperationDepth = useSelector(selectMaxOperationDepth);
  const [exportOpen, setExportOpen] = useState(false);

  // Example: get the table name from somewhere, or use a placeholder
  const tableName = rootOperationId
    ? `composite_table_${rootOperationId}`
    : "composite_table";

  return (
    <div className="CompositeTableSchema">
      <Button
        variant="outlined"
        disabled={rootOperationId === null}
        sx={{ mb: 2 }}
        onClick={() => setExportOpen(true)}
        data-testid="export-table-btn"
      >
        Export
      </Button>
      <ExportCompositeTable
        open={exportOpen}
        id={rootOperationId}
        onClose={() => setExportOpen(false)}
        onExport={() => setExportOpen(false)}
        tableName={tableName}
      />
      {maxOperationDepth >= 0 ? (
        <Grid container spacing={0}>
          <Grid size={gridWidth}>
            <OperationView id={rootOperationId} />
          </Grid>
          <Grid size={gridColumns - gridWidth}>
            <TableDropTarget operationType={OPERATION_TYPE_PACK}>
              <AddIcon />
            </TableDropTarget>
          </Grid>
          <Grid size={gridWidth}>
            <TableDropTarget operationType={OPERATION_TYPE_STACK}>
              <AddIcon />
            </TableDropTarget>
          </Grid>
        </Grid>
      ) : (
        <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
          <Typography>Add a source table</Typography>
        </TableDropTarget>
      )}
    </div>
  );
}
