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
import { TableSchema } from "../../components/TableView";
import {
  selectColumnById,
  selectSelectedColumns,
} from "../../slices/columnsSlice";
import { group } from "d3";

export default function SchemaWindow() {
  const focusedOperation = useSelector((state) => {
    const id = selectFocusedOperationId(state);
    return selectOperation(state, id);
  });
  const currentSelection = useSelector((state) => {
    const selectedColumnIds = selectSelectedColumns(state); // TODO: rename to selectSelectedColumnIds
    const selectedColumns = selectedColumnIds.map((colId) =>
      selectColumnById(state, colId)
    );
    return group(selectedColumns, (col) => col.tableId);
  });
  const tables = useSelector(selectAllTablesData);
  const operations = useSelector(selectAllOperationIds);

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        width: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevent overflow from parent
      }}
    >
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
        <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
          <StackSchemaView id={focusedOperation.id} />
        </Box>
      ) : focusedOperation?.operationType === OPERATION_TYPE_PACK ? (
        <Box sx={{ flex: 1, height: "100%", overflow: "hidden" }}>
          <PackSchemaView id={focusedOperation.id} />
        </Box>
      ) : focusedOperation?.operationType === OPERATION_TYPE_NO_OP ? (
        <TableSchema id={focusedOperation.children[0]} />
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
                    focusedOperation: focusedOperation || null,
                  },
                  null,
                  2
                )}
              </pre>
            </Alert>
          </Box>
        </Box>
      )}
    </Box>
  );
}
