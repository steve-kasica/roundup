import { ColumnTick, EnhancedColumnTick } from "../ColumnViews";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import withTableData from "./withTableData.jsx";
import { Box, Typography } from "@mui/material";

function TableBlock({
  // Props from withAssociatedAlerts via withTableData
  totalCount,
  // props via withTableData
  id,
  name,
  activeColumnIds,
  activeColumnsCount,
  rowCount = 0,
  columnCount = 0,
  // Props passed directly from parent
  parentOperationType,
  parentColumnCount,
  backgroundColor,
  sx = {},
}) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableBlock for table:", id);
  }
  const ticks = Array.from(
    {
      length:
        parentOperationType === OPERATION_TYPE_STACK
          ? parentColumnCount
          : activeColumnsCount,
    },
    (_, i) => (i < activeColumnsCount ? activeColumnIds[i] : null)
  );

  return (
    <Box
      data-table="table-block" // Added className for easier targeting during debugging
      sx={{
        display: "flex",
        boxSizing: "border-box",
        flexDirection: "row",
        alignItems: "stretch",
        position: "relative",
        // Visual indication of alerts
        ...(totalCount && {
          backgroundColor: "warning.light",
          opacity: 0.9,
        }),
        ...sx,
      }}
    >
      <Typography variant="treemap label">
        {name || id}
        {totalCount && `⚠`}
        <br />
        <small style={{ color: "#555" }}>
          {columnCount.toLocaleString()} x {rowCount.toLocaleString()}
        </small>
      </Typography>
      {ticks.map((columnId, index) => {
        const childSx = {
          backgroundColor, // apply background color defined in operation
          ...(index === 0 && {
            paddingLeft: "0", // no border on the first tick, as it's the left edge
          }),
        };
        return columnId === null ? (
          <ColumnTick
            key={`empty-${index}`} // Ensure unique key even when columnId is null
            id={null}
            sx={{
              ...childSx,
              background:
                "repeating-linear-gradient(45deg, #666, #666 10px, #888 10px, #888 20px)",
            }}
          />
        ) : (
          <EnhancedColumnTick
            key={`${columnId}-${index}`}
            id={columnId}
            sx={childSx}
          />
        );
      })}
    </Box>
  );
}

TableBlock.displayName = "TableBlock";

const EnhancedTableBlock = withTableData(TableBlock);

EnhancedTableBlock.displayName = "EnhancedTableBlock";

export { TableBlock, EnhancedTableBlock };
