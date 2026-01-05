/**
 * @fileoverview CompositeTableSchema Component
 *
 * This component serves as the main entry point for the module. It renders the
 * hierarchical schema visualization, including drop targets for adding tables
 * via STACK or PACK operations.
 *
 * @module components/CompositeTableSchema/CompositeTableSchema
 *
 * @description
 * Layout structure:
 * - Left/main area: Operation blocks showing the current schema hierarchy
 * - Bottom drop zone: Add tables via STACK operation (vertical union)
 * - Right drop zone: Add tables via PACK operation (horizontal join)
 * - Center drop zone: Initial drop zone when no tables exist (NO_OP)
 *
 * Operation constraints:
 * - Adding operations is disabled when:
 *   - Root operation is not materialized
 *   - Root operation is out of sync
 *   - There are existing errors in the schema
 *
 * Edge cases:
 * - Empty state (no children): Shows only the appropriate drop target
 * - Single table: Can evolve to STACK or PACK when another table is added
 * - Errors: Drop zones are disabled until errors are resolved
 *
 * @example
 * <CompositeTableSchema />
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
import AddIcon from "@mui/icons-material/Add";
import { EnhancedOperationBlock } from "./OperationBlock";
import { selectAlertErrorCount } from "../../slices/alertsSlice";
import { selectFocusedObjectId } from "../../slices/uiSlice";

const stackDropTargetHeight = 50;

/**
 * CompositeTableSchema Component
 *
 * Renders the main schema visualization with drop targets for adding tables
 * through STACK or PACK operations.
 *
 * @component
 * @returns {React.ReactElement} The complete schema visualization with drop zones
 *
 */
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
