/**
 * @fileoverview Table/operation rows view window component.
 * @module layouts/SupportingPane/TableWindow
 *
 * Displays the appropriate row view based on the focused object type
 * (table, stack operation, pack operation, or no-op).
 *
 * Features:
 * - Table rows view for focused tables
 * - Stack rows view for STACK operations
 * - Pack rows view for PACK operations
 * - Empty state for NO_OP operations
 * - Error alert for unknown view modes
 *
 * @example
 * <TableWindow id="t1" />
 */
/* eslint-disable react/prop-types */
import { Alert, Box } from "@mui/material";
import { useSelector } from "react-redux";
import { EnhancedTableRows } from "../../components/TableView";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationsById,
} from "../../slices/operationsSlice";
import { EnhancedPackRows } from "../../components/PackOperationView";
import { isTableId } from "../../slices/tablesSlice";
import EnhancedStackRows from "../../components/StackRows";

const VIEW_TABLE = "TABLE";
const VIEW_STACK = "STACK";
const VIEW_PACK = "PACK";
const VIEW_NO_OP = "NO_OP";
const VIEW_UNKNOWN = "UNKNOWN";

const TableWindow = ({ id }) => {
  const isFocusedTable = isTableId(id);
  const focusedOperation = useSelector((state) =>
    isFocusedTable ? null : selectOperationsById(state, id),
  );

  const viewMode = (function (opType) {
    if (isFocusedTable) {
      return VIEW_TABLE;
    } else if (opType === OPERATION_TYPE_STACK) {
      return VIEW_STACK;
    } else if (opType === OPERATION_TYPE_PACK) {
      return VIEW_PACK;
    } else if (opType === OPERATION_TYPE_NO_OP) {
      return VIEW_NO_OP;
    } else {
      return VIEW_UNKNOWN;
    }
  })(focusedOperation?.operationType);

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      minHeight={0}
      width="100%"
      sx={{ overflowX: "auto" }}
    >
      <Box
        flexGrow={1}
        minHeight={0}
        overflow="auto"
        display="flex"
        flexDirection="column"
      >
        {viewMode === VIEW_TABLE ? (
          <EnhancedTableRows id={id} />
        ) : viewMode === VIEW_NO_OP ? (
          <EnhancedTableRows id={focusedOperation.childIds[0]} />
        ) : viewMode === VIEW_STACK ? (
          <EnhancedStackRows id={id} />
        ) : viewMode === VIEW_PACK ? (
          <EnhancedPackRows id={id} />
        ) : (
          <Alert severity="error">
            <pre>
              {JSON.stringify(
                {
                  viewMode: viewMode || null,
                  focusedOperation: focusedOperation || null,
                  id: id || null,
                },
                null,
                2,
              )}
            </pre>
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default TableWindow;
