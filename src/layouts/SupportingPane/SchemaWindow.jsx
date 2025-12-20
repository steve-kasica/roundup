import { Alert, Box, Typography } from "@mui/material";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectOperationsById,
  selectAllOperationIds,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { useSelector } from "react-redux";
import { isTableId, selectAllTableIds } from "../../slices/tablesSlice";
import TableDropTarget from "../../components/CompositeTableSchema/TableDropTarget";
import { EnhancedStackSchemaView } from "../../components/StackOperationView/StackSchemaView/StackSchemaView";
import PackSchemaView from "../../components/PackOperationView/PackSchemaView";
import { EnhancedTableSchema } from "../../components/TableView";
import { selectFocusedObjectId } from "../../slices/uiSlice";

export default function SchemaWindow() {
  const tablesUploaded = useSelector(selectAllTableIds);
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const isFocusedTable = isTableId(focusedObjectId);
  const focusedOperation = useSelector((state) =>
    isFocusedTable ? null : selectOperationsById(state, focusedObjectId)
  );
  const operations = useSelector(selectAllOperationIds);

  const areTablesUploaded = tablesUploaded.length > 0;

  return (
    <>
      {!areTablesUploaded ? (
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
      ) : isFocusedTable ? (
        <EnhancedTableSchema id={focusedObjectId} />
      ) : operations.length === 0 || focusedOperation?.childIds.length === 0 ? (
        <Box sx={{ flex: 1, height: "100%" }}>
          <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
            <Typography>Drag to add a source table</Typography>
          </TableDropTarget>
        </Box>
      ) : focusedOperation?.operationType === OPERATION_TYPE_STACK ? (
        <EnhancedStackSchemaView id={focusedObjectId} />
      ) : focusedOperation?.operationType === OPERATION_TYPE_PACK ? (
        <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
          <PackSchemaView id={focusedObjectId} />
        </Box>
      ) : focusedOperation?.operationType === OPERATION_TYPE_NO_OP ? (
        <EnhancedTableSchema id={focusedOperation.childIds[0]} />
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
                    focusedObjectId: focusedObjectId || null,
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
