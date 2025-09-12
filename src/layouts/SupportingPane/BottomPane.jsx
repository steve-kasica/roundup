import {
  Box,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import TableView, { RawTableRows } from "../../components/TableView";
import { selectFocusedOperationId } from "../../slices/operationsSlice";
import TableViewContainer from "../../components/TableView/TableViewContainer";
import TableViewHeader from "../../components/TableView/TableViewHeader";
import { useState } from "react";
import TableColumnGrid from "../../components/TableView/TableColumnGrid";
import TableViewIcon from "../../components/TableView/TableViewIcon";

const TOGGLE_VALUES = {
  COLUMN_GRID: "column-grid",
  RAW_ROWS: "raw-rows",
};

const TOGGLE_LABELS = {
  [TOGGLE_VALUES.COLUMN_GRID]: "High",
  [TOGGLE_VALUES.RAW_ROWS]: "Low",
};

const BottomPane = () => {
  const tableId = useSelector((state) => {
    const focusedOperation = selectFocusedOperationId(state);
    if (!focusedOperation) return null;
    return state.operations.data[focusedOperation].children[0];
  });
  const [lod, setLod] = useState(TOGGLE_VALUES.COLUMN_GRID);

  if (tableId === null) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No table selected.
        </Typography>
      </Box>
    );
  }

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
        <Box
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
        </Box>
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
        {lod === TOGGLE_VALUES.RAW_ROWS && <RawTableRows id={tableId} />}
        {lod === TOGGLE_VALUES.COLUMN_GRID && <TableColumnGrid id={tableId} />}
      </Box>
    </Box>
  );
};

export default BottomPane;
