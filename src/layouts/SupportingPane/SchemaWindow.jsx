import { Alert, Box, Typography } from "@mui/material";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectOperation,
  selectAllOperationIds,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { useSelector } from "react-redux";
import { selectAllTablesData } from "../../slices/tablesSlice";
import TableDropTarget from "../../components/CompositeTableSchema/TableDropTarget";
import StackSchemaView from "../../components/StackOperationView/StackSchemaView";
import PackSchemaView from "../../components/PackOperationView/PackSchemaView";
import { EnhancedTableSchema } from "../../components/TableView";

export default function SchemaWindow() {
  const focusedOperationId = useSelector((state) => {
    const id = state.operations.focused;
    return id;
  });
  const focusedOperation = useSelector((state) => {
    return selectOperation(state, focusedOperationId);
  });
  const tables = useSelector(selectAllTablesData);
  const operations = useSelector(selectAllOperationIds);

  const mode = (function () {
    if (tables.length === 0) {
      return "NO_TABLES";
    } else if (operations.length === 0) {
      return "NO_OPERATIONS";
    } else if (focusedOperation?.operationType === OPERATION_TYPE_STACK) {
      return "STACK_OPERATION";
    } else if (focusedOperation?.operationType === OPERATION_TYPE_PACK) {
      return "PACK_OPERATION";
    } else if (focusedOperation?.operationType === OPERATION_TYPE_NO_OP) {
      return "TABLE_VIEW";
    } else {
      return "UNSUPPORTED_OPERATION";
    }
  })();

  return (
    <>
      {mode === "NO_TABLES" ? (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <pre>No tables uploaded</pre>
        </Box>
      ) : mode === "NO_OPERATIONS" ? (
        <Box sx={{ flex: 1, height: "100%" }}>
          <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
            <Typography>Drag to add a source table</Typography>
          </TableDropTarget>
        </Box>
      ) : mode === "STACK_OPERATION" ? (
        <StackSchemaView id={focusedOperation.id} />
      ) : mode === "PACK_OPERATION" ? (
        <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
          <PackSchemaView id={focusedOperation.id} />
        </Box>
      ) : mode === "TABLE_VIEW" ? (
        <EnhancedTableSchema id={focusedOperation.children[0]} />
      ) : (
        <Box
          sx={{
            flex: 1,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box display={"flex"} flexDirection={"column"} mt={2}>
            <Alert severity="error">
              Unsupported operation type: {focusedOperation?.operationType}
              <Typography>Debug info:</Typography>
              <pre>
                {JSON.stringify(
                  {
                    focusedOperationId: focusedOperationId || null,
                    focusedOperation: focusedOperation || null,
                    allOperations: operations || null,
                  },
                  null,
                  2
                )}
              </pre>
            </Alert>
          </Box>
        </Box>
      )}
    </>
  );
}
