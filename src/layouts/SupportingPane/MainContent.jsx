import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from "@mui/material";
import { useState } from "react";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectFocusedOperationId,
  selectOperation,
  selectAllOperationIds,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { useSelector } from "react-redux";
import StackOperationView from "../../components/StackOperationView";
import PackOperationView from "../../components/PackOperationView";
import { selectAllTablesData } from "../../slices/tablesSlice";
import TableDropTarget from "../../components/CompositeTableSchema/TableDropTarget";
import TableView from "../../components/TableView";

export default function MainContent() {
  const focusedOperation = useSelector((state) => {
    const id = selectFocusedOperationId(state);
    return selectOperation(state, id);
  });
  const tables = useSelector(selectAllTablesData);
  const operations = useSelector(selectAllOperationIds);
  const resolution = useSelector((state) => state.ui.levelOfDetail);

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        background: "#fff",
      }}
    >
      <Box
        sx={{
          height: "100%",
          padding: 2,
          boxSizing: "border-box",
          overflow: "auto",
        }}
      >
        {tables.length === 0 ? (
          <Box sx={{ width: "100%", textAlign: "center" }}>
            <pre>No tables uploaded to Roundup</pre>
          </Box>
        ) : operations.length === 0 ? (
          <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
            <Typography>Drag to add a source table</Typography>
          </TableDropTarget>
        ) : focusedOperation?.operationType === OPERATION_TYPE_NO_OP ? (
          <TableView
            resolution={resolution}
            id={focusedOperation.children[0]} // Just display it's only table child
          />
        ) : focusedOperation?.operationType === OPERATION_TYPE_STACK ? (
          <StackOperationView
            resolution={resolution}
            id={focusedOperation.id}
          />
        ) : focusedOperation?.operationType === OPERATION_TYPE_PACK ? (
          <PackOperationView resolution={resolution} id={focusedOperation.id} />
        ) : (
          <pre>Error: unsupported state</pre>
        )}
      </Box>
    </Box>
  );
}
