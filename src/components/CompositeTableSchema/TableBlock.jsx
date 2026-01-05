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
 * @module components/CompositeTableSchema/TableBlock
 *
 * @example
 * <EnhancedTableBlock id={tableId} />
 */

import { ColumnTick, EnhancedColumnTick } from "../ColumnViews/index.js";
import { OPERATION_TYPE_STACK } from "../../slices/operationsSlice/Operation.js";
import { withTableData, withAssociatedAlerts } from "../HOC/index.js";
import { Box, Typography } from "@mui/material";
import { BLOCK_BREAKPOINTS } from "./settings.js";

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
  parentRowCount,
  sx = {},
}) {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableBlock for table:", id);
  }
  console.log("TableBlock render:", {
    id,
    name,
    columnCount,
    rowCount,
    parentRowCount,
  });
  const height = (rowCount / parentRowCount) * 100; // height as percentage of parent operation's row count
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
        height: `${height}%`,
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
          // Inherit color to adapt to background changes
          color: "inherit",
          fontWeight: "bold",
          position: "absolute",
          top: 4,
          left: 4,
          textAlign: "left",
          whiteSpace: "nowrap",
          wordBreak: "keep-all",
          transition: "opacity 0.3s ease",
          [`@container (max-height: ${BLOCK_BREAKPOINTS.HEIGHT.SMALL}px)`]: {
            opacity: "0",
          },
        }}
      >
        {name || id}
      </Typography>
      <Typography
        variant="data-small"
        component="small"
        sx={{
          position: "absolute",
          top: 14,
          left: 4,
          whiteSpace: "nowrap",
          color: "inherit",
          wordBreak: "keep-all",
          transition: "opacity 0.3s ease",
          [`@container (max-height: ${BLOCK_BREAKPOINTS.HEIGHT.MEDIUM}px)`]: {
            opacity: "0",
          },
          [`@container (max-width: ${BLOCK_BREAKPOINTS.WIDTH.SMALL}px)`]: {
            opacity: "0",
          },
        }}
      >
        {`${columnCount.toLocaleString()} x ${rowCount.toLocaleString()}`}
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
