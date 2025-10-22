import { Alert, Box, Typography } from "@mui/material";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectOperation,
  selectAllOperationIds,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { useSelector } from "react-redux";
import { isTableId } from "../../slices/tablesSlice";
import TableDropTarget from "../../components/CompositeTableSchema/TableDropTarget";
import StackSchemaView from "../../components/StackOperationView/StackSchemaView";
import PackSchemaView from "../../components/PackOperationView/PackSchemaView";
import { EnhancedTableSchema } from "../../components/TableView";

export default function SchemaWindow() {
  const areTablesUploaded = useSelector(
    (state) => Object.keys(state.tables.data).length > 0
  );
  const focusedObjectId = useSelector((state) => state.ui.focusedObject);
  const isFocusedTable = isTableId(focusedObjectId);
  const focusedOperation = useSelector((state) =>
    isFocusedTable ? null : selectOperation(state, focusedObjectId)
  );
  const operations = useSelector(selectAllOperationIds);

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
      ) : operations.length === 0 || focusedOperation?.children.length === 0 ? (
        <Box sx={{ flex: 1, height: "100%" }}>
          <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
            <Typography>Drag to add a source table</Typography>
          </TableDropTarget>
        </Box>
      ) : focusedOperation?.operationType === OPERATION_TYPE_STACK ? (
        <StackSchemaView id={focusedObjectId} />
      ) : focusedOperation?.operationType === OPERATION_TYPE_PACK ? (
        <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
          <PackSchemaView id={focusedObjectId} />
        </Box>
      ) : focusedOperation?.operationType === OPERATION_TYPE_NO_OP ? (
        <EnhancedTableSchema id={focusedOperation.children[0]} />
      ) : isFocusedTable ? (
        <EnhancedTableSchema id={focusedObjectId} />
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
