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
        border: "5px solid #ddd",
        boxSizing: "border-box",
        flexDirection: "row",
        alignItems: "stretch",
        position: "relative",
        // Visual indication of alerts
        ...(hasAlerts && {
          border: "2px solid",
          borderColor: "warning.main",
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
          position: "absolute",
          top: 4,
          left: 4,
          zIndex: 10,
          padding: "2px 6px",
          borderRadius: "4px",
          fontSize: "0.6rem",
          lineHeight: 1,
          pointerEvents: "none",
          backdropFilter: "blur(2px)",
          ...(hasAlerts && {
            color: "warning.dark",
            backgroundColor: "warning.light",
            fontWeight: "bold",
          }),
        }}
      >
        {name || id}
        {hasAlerts && `⚠`}
        <br />
        <small style={{ color: "#757575" }}>
          {columnCount.toLocaleString()} x {rowCount.toLocaleString()}
        </small>
      </Typography>
      {ticks.map((columnId, index) =>
        columnId === null ? (
          <ColumnTick
            key={`empty-${index}`} // Ensure unique key even when columnId is null
            id={null}
            sx={{
              outlineColor: "#f44336",
              backgroundColor: "rgb(253, 226, 224)",
            }}
          />
        ) : (
          <EnhancedColumnTick key={`${columnId}-${index}`} id={columnId} />
        )
      )}
    </Box>
  );
}

TableBlock.displayName = "TableBlock";

const EnhancedTableBlock = withTableData(TableBlock);

EnhancedTableBlock.displayName = "EnhancedTableBlock";

export { TableBlock, EnhancedTableBlock };
