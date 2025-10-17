import { Box, Divider, Stack, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import {
  EnhancedTableLabel,
  EnhancedTableRows,
} from "../../components/TableView";
import { StackVirtualizedTable } from "../../components/StackOperationView";
import {
  selectColumnById,
  selectSelectedColumns,
} from "../../slices/columnsSlice";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectFocusedOperationId,
  selectOperation,
} from "../../slices/operationsSlice";
import { EnhancedPackVirtualTable } from "../../components/PackOperationView";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../../components/OperationView";
import { useMemo } from "react";

const TableWindow = () => {
  const focusedOperation = useSelector((state) => {
    const opId = selectFocusedOperationId(state);
    return opId ? selectOperation(state, opId) : null;
  });

  // Select the whole column objects for all selected columns
  const selectedColumns = useSelector(selectSelectedColumns);

  const selectedTableIds = useMemo(() => {
    return Array.from(new Set(selectedColumns.map(({ tableId }) => tableId)));
  }, [selectedColumns]);

  if (selectedTableIds.length > 1) {
    alert("Error: multiple tables selected! This is not yet supported.");
  }

  const viewMode = useSelector((state) => {
    if (selectedTableIds.length === 0) {
      return "UNKNOWN";
    }
    if (selectedTableIds.length > 1) {
      return "UNKNOWN"; // multiple tables selected, not supported
    }
    const tableId = selectedTableIds[0];
    if (isTableId(tableId)) {
      return "TABLE";
    } else if (
      isOperationId(tableId) &&
      selectOperation(state, tableId).operationType === OPERATION_TYPE_STACK
    ) {
      return "STACK";
    } else if (
      isOperationId(tableId) &&
      selectOperation(state, tableId).operationType === OPERATION_TYPE_PACK
    ) {
      return "PACK";
    } else {
      return "UNKNOWN";
    }
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      minHeight={0}
      width="100%"
      sx={{ overflowX: "auto" }}
    >
      {/* Fixed header section */}
      <Box
        display="flex"
        flexDirection="column"
        alignContent="center"
        flexShrink={0}
      >
        <Box
          display={"flex"}
          justifyContent="space-between"
          alignContent="center"
          padding={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {viewMode === "UNKNOWN" ? (
              <Typography
                variant="h6"
                component="div"
                sx={{ userSelect: "none" }}
              >
                No Table Selected
              </Typography>
            ) : viewMode === "TABLE" ? (
              <EnhancedTableLabel id={selectedTableIds[0]} />
            ) : viewMode === "STACK" || viewMode === "PACK" ? (
              <EnhancedOperationLabel id={selectedTableIds[0]} />
            ) : (
              <Typography
                variant="h6"
                component="div"
                sx={{ userSelect: "none" }}
              >
                Error: unsupported state!
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
      <Divider />
      <Box
        flexGrow={1}
        minHeight={0}
        overflow="auto"
        display="flex"
        flexDirection="column"
      >
        {viewMode === "UNKNOWN" ? (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            No columns selected. Please select columns from the schema window.
          </Typography>
        ) : viewMode === "TABLE" ? (
          <EnhancedTableRows id={selectedTableIds[0]} />
        ) : viewMode === "STACK" ? (
          <StackVirtualizedTable id={selectedTableIds[0]} />
        ) : viewMode === "PACK" ? (
          <EnhancedPackVirtualTable id={selectedTableIds[0]} />
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            Error: unsupported state!
            {JSON.stringify({ selectedTableIds, focusedOperation })}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TableWindow;
