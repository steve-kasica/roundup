import {
  Box,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useSelector } from "react-redux";
import TableView from "../../components/TableView";
import { TableLabel, TableSummary } from "../../components/TableView";
import {
  selectColumnById,
  selectSelectedColumns,
} from "../../slices/columnsSlice";
import { group } from "d3";
import { useState } from "react";

const TOGGLE_VALUES = {
  LOW: "Low",
  HIGH: "High",
};

const TableWindow = () => {
  const [lod, setLod] = useState(TOGGLE_VALUES.LOW); // Sets low as default
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
            ) : (
              <TableLabel id={selectedTableIds?.[0]?.tableId} />
            )}
          </Stack>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={lod}
            onChange={(e, val) => setLod(val)}
          >
            {Object.entries(TOGGLE_VALUES).map(([key, label]) => (
              <ToggleButton key={key} value={label}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Box>
      <Divider />
      <Box
        flexGrow={1}
        minHeight={0}
        overflow="auto"
        width="100%"
        display="flex"
        flexDirection="column"
      >
        {selectedTableIds === null || selectedTableIds.length === 0 ? (
          <Typography variant="h6" align="center" sx={{ mt: 2 }}>
            No columns selected. Please select columns from the schema window.
          </Typography>
        ) : selectedTableIds.length === 1 && lod === TOGGLE_VALUES.LOW ? (
          <TableView id={selectedTableIds[0].tableId} objectType={"table"} />
        ) : selectedTableIds.length === 1 && lod === TOGGLE_VALUES.HIGH ? (
          <TableSummary id={selectedTableIds[0].tableId} />
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

export default TableWindow;
