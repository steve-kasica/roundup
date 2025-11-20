import { ColumnTick, EnhancedColumnTick } from "../ColumnViews";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import withTableData from "./withTableData.jsx";
import { Box, Typography } from "@mui/material";

function TableBlock({
  // Props from withAssociatedAlerts via withTableData
  hasAlerts,
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
        ...(hasAlerts && {
          backgroundColor: "warning.light",
          opacity: 0.9,
        }),
        ...sx,
      }}
    >
      <Typography
        variant="caption"
        className="table-id"
        sx={{
          userSelect: "none",
          position: "absolute",
          top: 4,
          left: 4,
          zIndex: 100,
          padding: "1px 1px",
          fontSize: "0.6rem",
          lineHeight: 1,
          pointerEvents: "none",
          background: "transparent",
          ...(hasAlerts && {
            fontWeight: "bold",
          }),
        }}
      >
        {name || id}
        {hasAlerts && `⚠`}
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
