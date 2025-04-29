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
} from "../../data/slices/operationsSlice";

import TableDropTarget, {
  DROP_TARGET_EVENT_INITIALIZE,
  DROP_TARGET_EVENT_PACK,
  DROP_TARGET_EVENT_STACK,
} from "./TableDropTarget";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import AddIcon from "@mui/icons-material/Add";
import { OperationContainer } from "../Containers";
import OperationBlockView from "./OperationBlockView";
import {
  selectOperationColumnCount,
  selectSchemaColumnCount,
} from "../../data/selectors";

const gridColumns = 12;
const gridWidth = gridColumns - 2;

export default function CompositeTableSchema() {
  const rootOperationId = useSelector(selectRootOperationId);
  const maxOperationDepth = useSelector(selectMaxOperationDepth);
  const totalColumnCount = useSelector((state) =>
    selectOperationColumnCount(state, rootOperationId)
  );

  return (
    <div className="CompositeTableSchema">
      {maxOperationDepth > 0 ? (
        <Grid container spacing={0}>
          <Grid size={gridWidth}>
            <OperationContainer id={rootOperationId}>
              <OperationBlockView parentColumnCount={totalColumnCount} />
            </OperationContainer>
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
