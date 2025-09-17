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

const TOGGLE_VALUES = {
  COLUMN_GRID: "column-grid",
  RAW_ROWS: "raw-rows",
};

const TOGGLE_LABELS = {
  [TOGGLE_VALUES.COLUMN_GRID]: "High",
  [TOGGLE_VALUES.RAW_ROWS]: "Low",
};

const SpreadsheetWindow = () => {
  const focusedOperationId = useSelector(selectFocusedOperationId);
  const focusedOperationType = useSelector((state) => {
    if (!focusedOperationId) return null;
    return selectOperation(state, focusedOperationId).operationType;
  });
  const focusedTableId = useSelector(selectFocusedTableId);
  // const [lod, setLod] = useState(TOGGLE_VALUES.COLUMN_GRID);

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
      <Divider />

      {/* Scrollable content section */}
      <Box
        flexGrow={1}
        minHeight={0}
        overflow="auto"
        width="100%"
        display="flex"
        flexDirection="column"
      >
        {focusedTableId === null && focusedOperationId === null ? (
          <TableDropTarget operationType={OPERATION_TYPE_NO_OP}>
            <Typography>Drag to add a source table</Typography>
          </TableDropTarget>
        ) : focusedOperationId === null && focusedTableId !== null ? (
          <RawTableRows id={focusedTableId} />
        ) : focusedOperationType === OPERATION_TYPE_STACK ? (
          <StackVirtualTableRows id={focusedOperationId} />
        ) : focusedOperationType === OPERATION_TYPE_PACK ? (
          <PackVirtualTable id={focusedOperationId} />
        ) : (
          <pre>Error: unsupported state</pre>
        )}

        {/* {lod === TOGGLE_VALUES.RAW_ROWS && <RawTableRows id={tableId} />}
            {lod === TOGGLE_VALUES.COLUMN_GRID && (
              <TableColumnGrid id={tableId} />
            )} */}
      </Box>
    </Box>
  );
};

export default SpreadsheetWindow;
