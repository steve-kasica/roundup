import { Box, Divider, Typography } from "@mui/material";
import { useSelector } from "react-redux";
import { RawTableRows } from "../../components/TableView";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectFocusedOperationId,
  selectOperation,
} from "../../slices/operationsSlice";
import TableDropTarget from "../../components/CompositeTableSchema/TableDropTarget"; // TODO: move to other area
import { selectFocusedTableId } from "../../slices/tablesSlice";
import StackVirtualTableRows from "../../components/StackOperationView/StackVirtualTableRows";
import PackVirtualTable from "../../components/PackOperationView/PackVirtualTable";
import {
  selectColumnById,
  selectSelectedColumns,
} from "../../slices/columnsSlice";
import { group } from "d3";

const TOGGLE_VALUES = {
  COLUMN_GRID: "column-grid",
  RAW_ROWS: "raw-rows",
};

const TOGGLE_LABELS = {
  [TOGGLE_VALUES.COLUMN_GRID]: "High",
  [TOGGLE_VALUES.RAW_ROWS]: "Low",
};

const SpreadsheetWindow = () => {
  const focusedOperation = useSelector((state) => {
    const id = selectFocusedOperationId(state);
    return selectOperation(state, id);
  });
  const selectedTableIds = useSelector((state) => {
    const selectedColumnIds = selectSelectedColumns(state);
    const columns = selectedColumnIds.map((columnId) =>
      selectColumnById(state, columnId)
    );
    if (columns.length === 0) return null;
    return Array.from(
      group(columns, (c) => c.tableId),
      ([tableId, columns]) => ({
        tableId,
        columnIds: columns.map((c) => c.id),
      })
    );
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      minHeight={0}
      overflowX="auto"
      width="100%"
      padding={1}
    >
      {/* Fixed header section */}
      <Box display="flex" flexDirection="column" flexShrink={0}>
        {/* <Box
          display={"flex"}
          justifyContent="space-between"
          alignContent="center"
          mb={2}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <TableViewIcon id={tableId} />
            <TableViewHeader id={tableId} />
          </Stack>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={lod}
            onChange={(e, val) => setLod(val)}
          >
            <ToggleButton value={TOGGLE_VALUES.RAW_ROWS}>
              {TOGGLE_LABELS[TOGGLE_VALUES.RAW_ROWS]}
            </ToggleButton>
            <ToggleButton value={TOGGLE_VALUES.COLUMN_GRID}>
              {TOGGLE_LABELS[TOGGLE_VALUES.COLUMN_GRID]}
            </ToggleButton>
          </ToggleButtonGroup>
        </Box> */}
      </Box>
      {/* <Divider /> */}
      <Box
        flexGrow={1}
        minHeight={0}
        overflow="auto"
        width="100%"
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
      >
        {selectedTableIds === null || selectedTableIds.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            No columns selected. Please select columns from the schema window.
          </Typography>
        ) : selectedTableIds.length === 1 ? (
          <RawTableRows id={selectedTableIds[0].tableId} />
        ) : selectedTableIds.length > 1 &&
          focusedOperation.operationType === OPERATION_TYPE_STACK ? (
          <StackVirtualTableRows
            tableIds={selectedTableIds.map((t) => t.tableId)}
          />
        ) : selectedTableIds.length > 1 &&
          focusedOperation.operationType === OPERATION_TYPE_PACK ? (
          <PackVirtualTable tableIds={selectedTableIds.map((t) => t.tableId)} />
        ) : (
          <pre>
            Error: unsupported state
            {JSON.stringify(selectedTableIds)}
          </pre>
        )}
      </Box>
    </Box>
  );
};

export default SpreadsheetWindow;
