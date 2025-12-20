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
      className="TableBlock"
      sx={{
        display: "flex",
        boxSizing: "border-box",
        flexDirection: "row",
        alignItems: "stretch",
        position: "relative",
        backgroundColor,
        containerType: "size",
        // Visual indication of alerts
        ...(totalCount && {
          backgroundColor: "warning.light",
          opacity: 0.9,
        }),
        ...sx,
      }}
    >
      <Typography
        variant="treemap label"
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          width: "100%",
          "@container (min-height: 15px)": {
            display: "block",
          },
          "@container (max-height: 14px)": {
            display: "none",
          },
          "@container (max-width: 15px)": {
            display: "none",
          },
        }}
      >
        {name || id}
        {totalCount.length > 0 ? `⚠` : ""}
        <br />
        <Box
          component="small"
          sx={{
            color: "#555",
            "@container (min-height: 40px)": {
              display: "inline",
            },
            "@container (max-height: 39px)": {
              display: "none",
            },
          }}
        >
          {columnCount.toLocaleString()} x {rowCount.toLocaleString()}
        </Box>
      </Typography>
      {ticks.map((columnId, index) => {
        const childSx = {
          borderLeft: "1px dotted rgba(0, 0, 0, 0.1)",
          ...(index === 0 && {
            borderLeft: "none", // no border on the first tick, as it's the left edge
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
