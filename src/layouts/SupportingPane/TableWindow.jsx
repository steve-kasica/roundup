import { Alert, Box, Divider, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  EnhancedTableLabel,
  EnhancedTableRows,
} from "../../components/TableView";
import { selectSelectedColumns } from "../../slices/columnsSlice";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperation,
} from "../../slices/operationsSlice";
import { EnhancedPackVirtualTable } from "../../components/PackOperationView";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../../components/OperationView";
import { EnhancedStackVirtualizedTable } from "../../components/StackOperationView/StackVirtualizedTable";

const VIEW_EMPTY = "EMPTY_SELECTION";
const VIEW_TABLE = "TABLE";
const VIEW_STACK = "STACK";
const VIEW_PACK = "PACK";
const VIEW_NO_OP = "NO_OP";
const VIEW_UNKNOWN = "UNKNOWN";

const TableWindow = () => {
  const focusedObjectId = useSelector((state) => state.ui.focusedObject);
  const isFocusedTable = isTableId(focusedObjectId);
  const focusedOperation = useSelector((state) =>
    isFocusedTable ? null : selectOperation(state, focusedObjectId)
  );
  const selectedColumns = useSelector(selectSelectedColumns);

  const viewMode = (function (opType, areSelectedColumns) {
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
  })(focusedOperation?.operationType, selectedColumns.length > 0);

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
          <EnhancedTableRows id={focusedObjectId} />
        ) : viewMode === VIEW_NO_OP ? (
          <EnhancedTableRows id={focusedOperation.children[0]} />
        ) : viewMode === VIEW_STACK ? (
          <EnhancedStackVirtualizedTable id={focusedObjectId} />
        ) : viewMode === VIEW_PACK ? (
          <EnhancedPackVirtualTable id={focusedObjectId} />
        ) : (
          <Alert severity="error">
            <pre>
              {JSON.stringify(
                {
                  viewMode: viewMode || null,
                  focusedOperation: focusedOperation || null,
                  focusedObjectId: focusedObjectId || null,
                },
                null,
                2
              )}
            </pre>
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default TableWindow;
