/**
 * CompositeTableSchema.js
 * ------------------------------------------------------------------------------------------------
 * An interactive hierarchical visualization of the table tree
 */

import "./CompositeTableSchema.scss";

import { useSelector } from "react-redux";
import { getMaxOperationDepth, getRootOperationId } from "../../data/selectors";

import TableDropTarget, {
  DROP_TARGET_EVENT_INITIALIZE,
  DROP_TARGET_EVENT_PACK,
  DROP_TARGET_EVENT_STACK,
} from "./TableDropTarget";
import { Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import PlusIcon from "@mui/icons-material/Add";
import { OperationContainer } from "../Containers";
import OperationBlockView from "./OperationBlockView";

const gridColumns = 12;
const gridWidth = gridColumns - 2;

export default function CompositeTableSchema() {
  const rootOperationId = useSelector(getRootOperationId);
  const maxOperationDepth = useSelector(getMaxOperationDepth);

  return (
    <div className="CompositeTableSchema">
      {maxOperationDepth > 0 ? (
        <Grid container spacing={0.5}>
          <Grid size={gridWidth}>
            <OperationContainer id={rootOperationId}>
              <OperationBlockView />
            </OperationContainer>
          </Grid>
          <Grid size={gridColumns - gridWidth}>
            <TableDropTarget dropTargetEvent={DROP_TARGET_EVENT_PACK}>
              <PlusIcon />
            </TableDropTarget>
          </Grid>
          <Grid size={gridWidth}>
            <TableDropTarget dropTargetEvent={DROP_TARGET_EVENT_STACK}>
              <PlusIcon />
            </TableDropTarget>
          </Grid>
        </Grid>
      ) : (
        <TableDropTarget dropTargetEvent={DROP_TARGET_EVENT_INITIALIZE}>
          <Typography>Add a source table</Typography>
        </TableDropTarget>
      )}
    </div>
  );
}
