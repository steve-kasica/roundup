/**
 * CompositeTableSchema.js
 * ------------------------------------------------------------------------------------------------
 * An interactive hierarchical visualization of the table tree
 */

import { useSelector } from "react-redux";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectRootOperation,
} from "../../slices/operationsSlice";

import TableDropTarget from "./TableDropTarget";
import { Box, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import { EnhancedOperationBlock } from "../OperationView/OperationBlock";

const gridColumns = 12;
const gridWidth = gridColumns - 1;

// Each root operation type condition also needs to catch
// the edge case where there are no children (e.g. all tables have been removed)
// A watcher for deleting operations will handle this cleanup after operation update
// request finishes.
export default function CompositeTableSchema() {
  const rootOperation = useSelector(selectRootOperation);

  const isAddingOperationsDisabled =
    (!rootOperation.isMaterialized || !rootOperation.isInSync) &&
    rootOperation.operationType !== OPERATION_TYPE_NO_OP;

  return (
    <Box className="CompositeTableSchema" sx={{ height: "100%" }}>
      {rootOperation ? (
        <Grid container spacing={0} sx={{ height: "100%" }}>
          <Grid size={gridWidth}>
            {rootOperation.childIds.length > 0 ? (
              <EnhancedOperationBlock
                id={rootOperation.id}
                sx={{ height: "100%" }}
              />
            ) : null}
          </Grid>
          <Grid size={gridColumns - gridWidth}>
            <TableDropTarget
              disabled={isAddingOperationsDisabled}
              operationType={OPERATION_TYPE_PACK}
            >
              <AddIcon />
            </TableDropTarget>
          </Grid>
          <Grid size={gridWidth}>
            <TableDropTarget
              disabled={isAddingOperationsDisabled}
              operationType={OPERATION_TYPE_STACK}
            >
              <AddIcon />
            </TableDropTarget>
          </Grid>
        </Grid>
      ) : (
        <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
          <Typography>Drag to add a source table</Typography>
        </TableDropTarget>
      )}
    </Box>
  );
}
