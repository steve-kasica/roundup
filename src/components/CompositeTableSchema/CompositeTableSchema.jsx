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
  selectRootOperationId,
} from "../../slices/operationsSlice";

import TableDropTarget from "./TableDropTarget";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import { EnhancedStackOperationBlock } from "../StackOperationView/StackOperationBlock";
import { EnhancedPackOperationBlock } from "../PackOperationView/PackOperationBlock";
import { EnhancedTableBlock } from "../TableView";

const gridColumns = 12;
const gridWidth = gridColumns - 2;

// Each root operation type condition also needs to catch
// the edge case where there are no children (e.g. all tables have been removed)
// A watcher for deleting operations will handle this cleanup after operation update
// request finishes.
export default function CompositeTableSchema() {
  const root = useSelector(selectRootOperationId);
  const maxOperationDepth = useSelector(selectMaxOperationDepth);

  return (
    <div className="CompositeTableSchema">
      {maxOperationDepth >= 0 ? (
        <Grid container spacing={0}>
          <Grid size={gridWidth}>
            {root.operationType === OPERATION_TYPE_STACK &&
            root.children.length > 0 ? (
              <EnhancedStackOperationBlock id={root.id} />
            ) : root.operationType === OPERATION_TYPE_PACK &&
              root.children.length > 0 ? (
              <EnhancedPackOperationBlock id={root.id} />
            ) : root.operationType === OPERATION_TYPE_NO_OP &&
              root.children.length > 0 ? (
              <EnhancedTableBlock id={root.children[0]} />
            ) : null}
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
          <Typography>Drag to add a source table</Typography>
        </TableDropTarget>
      )}
    </div>
  );
}
