import { useState } from "react";
import { Box, Typography, Slider } from "@mui/material";
import withOperationData from "../HOC/withOperationData";
import withPaginatedRows from "../HOC/withPaginatedRows";
import ColumnHeader from "./ColumnHeader";
import TableView from "./TableView";

const DEFAULT_ROWS_PER_TABLE = 10;
const MIN_ROWS_PER_TABLE = 1;
const MAX_ROWS_PER_TABLE = 50;

function StackOperationView({
  // props from withOperationData HOC
  operation,
  activeColumnIds,
}) {
  const [rowsPerTable, setRowsPerTable] = useState(DEFAULT_ROWS_PER_TABLE);
  const [scrollTop, setScrollTop] = useState(0);

  const handleRowsPerTableChange = (event, value) => {
    setRowsPerTable(value);
  };

  // Handler to sync scroll position
  const handleTableScroll = (newScrollTop) => {
    setScrollTop(newScrollTop);
  };

  return (
    <Box sx={{ p: 2, position: "relative" }}>
      <Typography variant="h5">{operation?.name}</Typography>
      <Box
        sx={{
          position: "absolute",
          top: 16,
          right: 16,
          display: "flex",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography component="label" htmlFor="rowsPerTable" fontWeight={500}>
          Rows per table:
        </Typography>
        <Slider
          id="rowsPerTable"
          min={MIN_ROWS_PER_TABLE}
          max={MAX_ROWS_PER_TABLE}
          value={rowsPerTable}
          onChange={handleRowsPerTableChange}
          sx={{ width: 120 }}
        />
        <Typography>{rowsPerTable}</Typography>
      </Box>

      {operation?.children && operation.children.length > 0 ? (
        <div
          style={{
            maxHeight: "calc(100vh - 100px)",
            border: "1px solid #ccc",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              position: "sticky",
              top: 0,
              zIndex: 1,
              background: "#f5f5f5",
            }}
          >
            {activeColumnIds.map((colId) => (
              <ColumnHeader key={colId} id={colId} />
            ))}
          </Box>
          {/* Each TableView gets scrollTop and a scroll handler */}
          {operation.children.map((childId) => (
            <TableView
              key={childId}
              id={childId}
              rowsPerTable={rowsPerTable}
              coordinatedScrollTop={scrollTop}
              onCoordinatedScroll={handleTableScroll}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f5f5f5",
            borderRadius: "4px",
            marginTop: "16px",
            textAlign: "center",
            color: "#666",
          }}
        >
          No child operations found
        </div>
      )}
    </Box>
  );
}

const EnhancedStackTable = withOperationData(StackOperationView);

export default EnhancedStackTable;
