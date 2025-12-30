/**
 * @fileoverview CompositeTableSchema Component
 *
 * An interactive hierarchical visualization of the table operation tree, displaying
 * how tables are combined through operations like STACK (union) and PACK (join).
 * This component serves as the main schema editor where users can add, remove, and
 * reorganize tables to build complex data transformations.
 *
 * The schema tree starts with a root operation that can be:
 * - NO_OP: Single table with no operations
 * - STACK: Multiple tables stacked vertically (union)
 * - PACK: Multiple tables packed horizontally (join)
 *
 * Features:
 * - Visual representation of operation hierarchy
 * - Drag-and-drop zones for adding tables
 * - Automatic layout management
 * - Error state handling (disables operations when errors exist)
 * - Material sync state awareness
 *
 * @module components/CompositeTableSchema/CompositeTableSchema
 *
 * @example
 * <CompositeTableSchema />
 */

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

/**
 * CompositeTableSchema Component
 *
 * Renders the main schema visualization with drop targets for adding tables
 * through STACK or PACK operations.
 *
 * @component
 * @returns {React.ReactElement} The complete schema visualization with drop zones
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
