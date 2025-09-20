import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import {
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  selectFocusedOperationId,
  selectOperation,
  selectAllOperationIds,
  OPERATION_TYPE_NO_OP,
} from "../../slices/operationsSlice";
import { useDispatch, useSelector } from "react-redux";
import StackOperationView from "../../components/StackOperationView";
import PackOperationView from "../../components/PackOperationView";
import { selectAllTablesData } from "../../slices/tablesSlice";
import TableDropTarget from "../../components/CompositeTableSchema/TableDropTarget";
import TableView from "../../components/TableView";
import StackSchemaView from "../../components/StackOperationView/StackSchemaView";
import PackSchemaView from "../../components/PackOperationView/PackSchemaView";

export default function SchemaWindow() {
  const dispatch = useDispatch();
  const lod = useSelector((state) => state.ui.levelOfDetail);
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
        width: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden", // Prevent overflow from parent
      }}
    >
      <Typography variant="window-label">Schema window</Typography>
      {/* <Box
          display={"flex"}
          alignItems="center"
          justifyContent={"space-between"}
        >
          <ToggleButtonGroup
            value={lod}
            exclusive
            onChange={(event, lod) => dispatch(setLevelOfDetail(lod))}
            aria-label="view mode"
            size="small"
            sx={{ ml: 2 }}
          >
            <ToggleButton value={LOD.LOW} aria-label="low view">
              Low
            </ToggleButton>
            <ToggleButton value={LOD.HIGH} aria-label="high view">
              High
            </ToggleButton>
          </ToggleButtonGroup>
        </Box> */}

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
          <pre>No tables uploaded to Roundup</pre>
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
          <pre>Error: unsupported state</pre>
        </Box>
      )}
    </Box>
  );
}
