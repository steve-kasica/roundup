import {
  Box,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useSelector } from "react-redux";
import {
  EnhancedTableLabel,
  EnhancedTableRows,
} from "../../components/TableView";
import { StackVirtualizedTable } from "../../components/StackOperationView";
import {
  selectColumnById,
  selectSelectedColumns,
} from "../../slices/columnsSlice";
import { group } from "d3";
import { useState } from "react";
import {
  isOperationId,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectFocusedOperationId,
  selectOperation,
} from "../../slices/operationsSlice";
import { EnhancedPackVirtualTable } from "../../components/PackOperationView";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../../components/OperationView";

// const TOGGLE_VALUES = {
//   LOW: "Low",
//   HIGH: "High",
// };

const TableWindow = () => {
  // const [lod, setLod] = useState(TOGGLE_VALUES.LOW); // Sets low as default
  // const [viewsSynced, setViewsSynced] = useState(true); // Default to synced views
  // TODO: I'm not doing the selectedTableIds any more
  // Rather this component just need to know if it show show a table, a stack table, or a
  // pack table.
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
  const focusedOperation = useSelector((state) => {
    const opId = selectFocusedOperationId(state);
    return opId ? selectOperation(state, opId) : null;
  });

  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow={1}
      minHeight={0}
      overflowX="auto"
      width="100%"
    >
      {/* Fixed header section */}
      <Box
        display="flex"
        flexDirection="column"
        alignContent="center"
        flexShrink={0}
      >
        <Box
          display={"flex"}
          justifyContent="space-between"
          alignContent="center"
          padding={1}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedTableIds === null || selectedTableIds.length === 0 ? (
              <Typography
                variant="h6"
                component="div"
                sx={{ userSelect: "none" }}
              >
                No Table Selected
              </Typography>
            ) : isTableId(selectedTableIds?.[0]?.tableId) ? (
              <EnhancedTableLabel id={selectedTableIds[0].tableId} />
            ) : isOperationId(selectedTableIds?.[0]?.tableId) ? (
              <EnhancedOperationLabel id={selectedTableIds[0].tableId} />
            ) : null}
          </Stack>
          {/* <Stack direction="row" spacing={2} alignItems="center">
            <ToggleButtonGroup
              size="small"
              exclusive
              value={lod}
              onChange={(e, val) => setLod(val)}
            >
              {Object.entries(TOGGLE_VALUES).map(([key, label]) => (
                <ToggleButton key={key} value={label} disabled={key === "HIGH"}>
                  {label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>

            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={viewsSynced}
                  disabled={
                    selectedTableIds === null || selectedTableIds.length <= 1
                  }
                  onChange={(e) => setViewsSynced(e.target.checked)}
                />
              }
              label="Sync"
              sx={{
                mr: 0,
                "& .MuiFormControlLabel-label": {
                  fontSize: "0.875rem",
                  userSelect: "none",
                },
              }}
            />
          </Stack> */}
        </Box>
      </Box>
      <Divider />
      <Box
        flexGrow={1}
        minHeight={0}
        overflow="auto"
        display="flex"
        flexDirection="column"
      >
        {selectedTableIds === null || selectedTableIds.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            No columns selected. Please select columns from the schema window.
          </Typography>
        ) : selectedTableIds.length === 1 && !focusedOperation ? (
          <EnhancedTableRows id={selectedTableIds[0].tableId} />
        ) : selectedTableIds.length > 0 &&
          focusedOperation.operationType === OPERATION_TYPE_STACK ? (
          <StackVirtualizedTable id={focusedOperation.id} />
        ) : selectedTableIds.length > 0 &&
          focusedOperation.operationType === OPERATION_TYPE_PACK ? (
          <EnhancedPackVirtualTable id={focusedOperation.id} />
        ) : (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            Error: unsupported state!
            {JSON.stringify({ selectedTableIds, focusedOperation })}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default TableWindow;
