import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import TableView, { RawTableRows } from "../../components/TableView";
import { selectFocusedOperationId } from "../../slices/operationsSlice";
import TableViewContainer from "../../components/TableView/TableViewContainer";
import TableViewTitle from "../../components/TableView/TableViewTitle";
import { useState } from "react";
import TableColumnGrid from "../../components/TableView/TableColumnGrid";

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
    <Box sx={{ p: 2 }}>
      <Box display={"flex"} flexDirection="column">
        <Box
          display={"flex"}
          justifyContent="space-between"
          alignContent="center"
          mb={2}
        >
          <TableViewTitle id={tableId} />
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
      {lod === TOGGLE_VALUES.RAW_ROWS && <RawTableRows id={tableId} />}
      {lod === TOGGLE_VALUES.COLUMN_GRID && <TableColumnGrid id={tableId} />}
    </Box>
  );
};

export default BottomPane;
