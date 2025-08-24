import { useDragLayer } from "react-dnd";
import { DATA_TYPE as COLUMN } from "./slices/columnsSlice";
import {
  MODULE_NAME as COLUMN_INDEX,
  ColumnIndex,
} from "./components/StackOperationView/ColumnIndex";
import {
  CELL_DRAG_TYPE_PREFIX,
  ColumnMetaData,
} from "./components/StackOperationView/HighLevelView";
import {
  DRAG_TYPE as COLUMN_VALUES,
  default as ColumnValuesView,
} from "./components/StackOperationView/LowLevelView/ColumnView";

import { TABLE_ROW_VIEW_CLASS } from "./components/TableSelector/TableLayout/TableRowView";
import StackedTableDragPreview from "./components/ui/StackedTableDragPreview";
import { Box, Paper } from "@mui/material";

export default function CustomDragLayer() {
  const { item, itemType, currentOffset, initialOffset, isDragging } =
    useDragLayer((monitor) => ({
      item: monitor.getItem(),
      itemType: monitor.getItemType(),
      currentOffset: monitor.getSourceClientOffset(),
      initialOffset: monitor.getInitialSourceClientOffset(),
      isDragging: monitor.isDragging(),
    }));

  if (!isDragging || !currentOffset) {
    return null;
  }
  function x() {
    switch (itemType) {
      case COLUMN:
      case COLUMN_INDEX:
        // For COLUMN_INDEX, we want to center the drag preview
        return currentOffset.x - item.width / 2;
      case TABLE_ROW_VIEW_CLASS:
        // Center the table drag preview
        return currentOffset.x - 150; // Half of estimated preview width (300px)
      default:
        // Check if it's a HighLevelView drag type (COLUMN-tableId pattern)
        if (itemType && itemType.startsWith(CELL_DRAG_TYPE_PREFIX + "-")) {
          return currentOffset.x - 100; // Center the cell preview
        }
        return currentOffset.x;
    }
  }

  function y() {
    switch (itemType) {
      case COLUMN:
      case COLUMN_INDEX:
        return initialOffset.y; // Don't allow ghost to move vertically
      case TABLE_ROW_VIEW_CLASS:
        return currentOffset.y - 20; // Slightly offset above cursor
      default:
        // Check if it's a ColumnMetaData drag type (COLUMN-tableId pattern)
        if (itemType && itemType.startsWith(CELL_DRAG_TYPE_PREFIX + "-")) {
          return currentOffset.y - 10; // Slightly offset above cursor
        }
        return currentOffset.y - 1;
    }
  }

  // let { x: xOffset, y: yOffset } = currentOffset;
  // let { x: dx, y: dy } = deltaOffset;
  // let [x, y] = [stepX(), initialOffset.y];

  // function stepX() {
  //   const absDX = Math.abs(dx);
  //   const a = Math.round(absDX / blockWidth);
  //   if (absDX < blockWidth / 2) {
  //     return initialOffset.x;
  //   } else {
  //     return initialOffset.x + Math.sign(dx) * a * blockWidth;
  //   }
  // }

  // Render different effects based on the item type
  const renderDragPreview = () => {
    if (itemType.startsWith(COLUMN_VALUES)) {
      return (
        <Box sx={{ width: "200px", opacity: 0.75, cursor: "grabbing" }}>
          <ColumnValuesView id={item.id} />
        </Box>
      );
    } else if (itemType === COLUMN_INDEX) {
      return (
        <ColumnIndex
          index={item.index}
          columnIds={item.columnIds}
          columnName={item.columnName || `Column ${item.index + 1}`}
          maxColumnNameLength={item.maxColumnNameLength}
          hasSelected={item.hasSelected}
          hoverColumnVector={() => {}} // No-op
          unhoverColumnVector={() => {}} // No-op
          onCellClick={() => {}} // No-op
          onColumnClick={() => {}} // No-op
          undragColumnVector={() => {}} // No-op
          swapColumnVectors={() => {}} // No-op
          onHeaderChange={() => {}} // No-op
        />
      );
    } else if (itemType === TABLE_ROW_VIEW_CLASS) {
      // Handle both single table and multi-table drags
      if (
        item.type === "multiple-tables" &&
        item.tables &&
        item.tables.length > 1
      ) {
        return (
          <StackedTableDragPreview
            tables={item.tables}
            primaryTable={item.primaryTable || item.tables[0]}
          />
        );
      } else if (item.type === "table" || item.table) {
        // Single table drag - use the stacked preview for consistency
        const table = item.table || item;
        return (
          <StackedTableDragPreview tables={[table]} primaryTable={table} />
        );
      }
      return null;
    } else if (itemType && itemType.startsWith(CELL_DRAG_TYPE_PREFIX + "-")) {
      return (
        <Box sx={{ width: "200px", opacity: 0.75, cursor: "grabbing" }}>
          <ColumnMetaData id={item.id} />
        </Box>
      );
    } else {
      return null;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        pointerEvents: "none",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
        zIndex: 100,
      }}
    >
      {itemType === TABLE_ROW_VIEW_CLASS ||
      (itemType && itemType.startsWith(CELL_DRAG_TYPE_PREFIX + "-")) ? (
        // For table drags and cell drags, don't wrap in Paper as they handle their own styling
        <Box
          sx={{
            transform: `translate(${x()}px, ${y()}px)`,
            WebkitTransform: `translate(${x()}px, ${y()}px)`,
            maxWidth: itemType === TABLE_ROW_VIEW_CLASS ? "300px" : "auto", // Limit width for stacked preview
          }}
        >
          {renderDragPreview()}
        </Box>
      ) : (
        // For other drag types, use Paper wrapper
        <Paper
          elevation={3}
          sx={{
            transform: `translate(${x()}px, ${y()}px)`,
            WebkitTransform: `translate(${x()}px, ${y()}px)`,
            width: `${item.width || 100}px`,
          }}
        >
          {renderDragPreview()}
        </Paper>
      )}
    </div>
  );
}
