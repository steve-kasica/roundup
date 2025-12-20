/**
 * CompositeTableSchema.js
 * ------------------------------------------------------------------------------------------------
 * An interactive hierarchical visualization of the table tree
 */

import { useSelector } from "react-redux";
import {
  isOperationId,
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
import { selectAlertErrorCount } from "../../slices/alertsSlice";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import { stack } from "d3";

const gridColumns = 12;
const gridWidth = gridColumns - 1;
const stackDropTargetHeight = 50;

// Each root operation type condition also needs to catch
// the edge case where there are no children (e.g. all tables have been removed)
// A watcher for deleting operations will handle this cleanup after operation update
// request finishes.
export default function CompositeTableSchema() {
  const rootOperation = useSelector(selectRootOperation);
  const errorCount = useSelector((state) => {
    const focusedObjectId = selectFocusedObjectId(state);
    return isOperationId(focusedObjectId)
      ? selectAlertErrorCount(state, focusedObjectId)
      : null;
  });

  const isAddingOperationsDisabled =
    ((!rootOperation.isMaterialized || !rootOperation.isInSync) &&
      rootOperation.operationType !== OPERATION_TYPE_NO_OP) ||
    (errorCount && errorCount > 0);

  return (
    <Box
      className="CompositeTableSchema"
      display="flex"
      flexDirection="column"
      sx={{ height: "100%" }}
    >
      {rootOperation ? (
        <Box display="flex" flexDirection="row" width="100%" flex={1}>
          <Box
            flexGrow={1}
            sx={{ height: "100%" }}
            display={"flex"}
            flexDirection={"column"}
          >
            {rootOperation.childIds.length > 0 ? (
              <>
                <EnhancedOperationBlock
                  id={rootOperation.id}
                  sx={{ height: "100%", flexGrow: 1 }}
                />
                <TableDropTarget
                  disabled={isAddingOperationsDisabled}
                  operationType={OPERATION_TYPE_STACK}
                  sx={{
                    height: `${stackDropTargetHeight}px`,
                    marginTop: "3px",
                  }}
                >
                  <AddIcon />
                </TableDropTarget>
              </>
            ) : null}
          </Box>
          <Box
            height="100%"
            display="flex"
            alignItems="top"
            justifyContent="center"
            sx={{ marginTop: "0px", marginBottom: "3px", marginLeft: "3px" }}
          >
            <TableDropTarget
              disabled={isAddingOperationsDisabled}
              operationType={OPERATION_TYPE_PACK}
              sx={{
                height: `calc(100% - ${stackDropTargetHeight + 6}px)`,
                width: `${stackDropTargetHeight}px`,
              }}
            >
              <AddIcon />
            </TableDropTarget>
          </Box>
        </Box>
      ) : (
        <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
          <Typography>Drag to add a source table</Typography>
        </TableDropTarget>
      )}
    </Box>
  );
}
