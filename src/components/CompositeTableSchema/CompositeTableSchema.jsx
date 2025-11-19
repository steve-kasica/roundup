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
import { EnhancedStackOperationBlock } from "../StackOperationView/StackOperationBlock";
import { EnhancedPackOperationBlock } from "../PackOperationView/PackOperationBlock";
import { EnhancedTableBlock } from "../TableView";

const gridColumns = 12;
const gridWidth = gridColumns - 1;

// Each root operation type condition also needs to catch
// the edge case where there are no children (e.g. all tables have been removed)
// A watcher for deleting operations will handle this cleanup after operation update
// request finishes.
export default function CompositeTableSchema() {
  const rootOperation = useSelector(selectRootOperation);

  return (
    <Box className="CompositeTableSchema" sx={{ height: "100%" }}>
      {rootOperation ? (
        <Grid container spacing={0} sx={{ height: "100%" }}>
          <Grid size={gridWidth}>
            {rootOperation.operationType === OPERATION_TYPE_STACK &&
            rootOperation.childIds.length > 0 ? (
              <EnhancedStackOperationBlock
                id={rootOperation.id}
                sx={{ height: "100%" }}
              />
            ) : rootOperation.operationType === OPERATION_TYPE_PACK &&
              rootOperation.childIds.length > 0 ? (
              <EnhancedPackOperationBlock
                id={rootOperation.id}
                sx={{ height: "100%" }}
              />
            ) : rootOperation.operationType === OPERATION_TYPE_NO_OP &&
              rootOperation.childIds.length > 0 ? (
              <EnhancedTableBlock
                id={rootOperation.childIds[0]}
                sx={{ height: "100%" }}
              />
            ) : null}
          </Grid>
          <Grid size={gridColumns - gridWidth}>
            <TableDropTarget
              disabled={!rootOperation.isMaterialized}
              operationType={OPERATION_TYPE_PACK}
            >
              <AddIcon />
            </TableDropTarget>
          </Grid>
          <Grid size={gridWidth}>
            <TableDropTarget
              disabled={!rootOperation.isMaterialized}
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
