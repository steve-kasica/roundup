import { Alert, Box, Typography } from "@mui/material";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectFocusedOperationId,
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
    console.log(state.operations);
    const id = state.operations.focused;
    return id;
  });
  const focusedOperation = useSelector((state) => {
    return selectOperation(state, focusedOperationId);
  });
  const tables = useSelector(selectAllTablesData);
  const operations = useSelector(selectAllOperationIds);

  return (
    <>
      {tables.length === 0 ? (
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
      ) : operations.length === 0 ? (
        <Box sx={{ flex: 1, height: "100%" }}>
          <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
            <Typography>Drag to add a source table</Typography>
          </TableDropTarget>
        </Box>
      ) : focusedOperation?.operationType === OPERATION_TYPE_STACK ? (
        <StackSchemaView id={focusedOperation.id} />
      ) : focusedOperation?.operationType === OPERATION_TYPE_PACK ? (
        <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
          <PackSchemaView id={focusedOperation.id} />
        </Box>
      ) : focusedOperation?.operationType === OPERATION_TYPE_NO_OP ? (
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
