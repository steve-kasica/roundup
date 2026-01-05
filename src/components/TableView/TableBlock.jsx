/**
 * @fileoverview TableBlock Component
 *
 * A compact block visualization component for displaying table information in the
 * tree/schema view. Shows table metadata, column ticks for visual representation,
 * and integrates with alert and table data systems.
 *
 * Features:
 * - Table name and metadata display
 * - Column tick visualization
 * - Alert count display
 * - Integration with HOCs for data
 * - Compact tree node representation
 *
 * @module components/TableView/TableBlock
 *
 * @example
 * <EnhancedTableBlock id={tableId} />
 */

import { ColumnTick, EnhancedColumnTick } from "../ColumnViews";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import { withTableData, withAssociatedAlerts } from "../HOC";
import { Box, Typography } from "@mui/material";

function TableBlock({
  // Props from withAssociatedAlerts via withTableData
  totalCount,
  // props via withTableData
  id,
  name,
  columnIds,
  columnCount,
  rowCount,
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
          : columnCount,
    },
    (_, i) => (i < columnCount ? columnIds[i] : null)
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
        containerType: "size",
        ...sx,
        // Visual indication of alerts
        ...(totalCount && {
          backgroundColor: "warning.light",
          opacity: 0.9,
        }),
      }}
    >
      <Typography
        variant="data-small"
        sx={{
          // Float in top-left without affecting layout
          position: "absolute",
          top: 2,
          left: 2,
          zIndex: 1,
          // Inherit color to adapt to background changes
          color: "inherit",
          fontWeight: "bold",
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
          fontWeight={"normal"}
          sx={{
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
        return columnId === null ? (
          <ColumnTick
            key={`empty-${index}`} // Ensure unique key even when columnId is null
            id={null}
            sx={{
              background: (theme) => theme.palette.error.main,
              // background:
              //   "repeating-linear-gradient(45deg, #666, #666 10px, #888 10px, #888 20px)",
            }}
          />
        ) : (
          <EnhancedColumnTick key={`${columnId}-${index}`} id={columnId} />
        );
      })}
    </Box>
  );
}

TableBlock.displayName = "TableBlock";

const EnhancedTableBlock = withAssociatedAlerts(withTableData(TableBlock));

EnhancedTableBlock.displayName = "EnhancedTableBlock";

export { TableBlock, EnhancedTableBlock };
