/**
 * @module CustomDragLayer
 * @description
 * Custom drag layer component for react-dnd, providing custom drag previews for different draggable item types
 * such as columns and stack table orders. Integrates with Material-UI for styled previews and icons.
 *
 * OpenRoundup utilize drag-n-drop functionality to specify the order of child objects, e.g. tables within an operation or columns within a table,
 * in multiple places throughout the app. Using a CustomDragLayer allows OpenRoundup to specify drag previews, a.k.a drag ghosts,
 * styled differently than the dragging rendered object. It also allows us to control the position of
 * the drag preview, e.g. locking the horizontal position for column drags so the preview stays
 * within its container, only moves vertically or horizontally (depending on context),
 * and doesn't jump around relative to the cursor.

 */

/**
 * Drag type for source table.
 * @constant
 * @type {string}
 */

import { useDragLayer } from "react-dnd";
import { Box, Typography } from "@mui/material";
import { DragIndicator, TableChart, AccountTree } from "@mui/icons-material";
import { EnhancedColumnSummary } from "./ColumnViews/ColumnSummary";

export const DRAG_TYPE_SOURCE_TABLE = "SOURCE_TABLE";
export const DRAG_TYPE_SOURCE_TABLE_ROW = "SOURCE_TABLE_ROW";
export const DRAG_TYPE_SOURCE_TABLE_ITEM = "SOURCE_TABLE_ITEM";

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

  // Render different effects based on the item type
  const renderDragPreview = () => {
    if (typeof itemType === "string" && itemType.endsWith("-column")) {
      const width = item?.dragBounds?.width;
      const height = item?.dragBounds?.height;
      const previewSx = item?.dragPreviewSx || {};

      return (
        <EnhancedColumnSummary
          id={item?.id}
          sx={{
            ...(previewSx || {}),
            width: width || 160,
            height: height || 40,
          }}
          isDragging={true}
          isHovered={false}
          isOver={false}
          isDropTarget={false}
          isSelected={false}
          isDraggable={false}
          isFocused={true}
          onClick={undefined}
          onDoubleClick={undefined}
          onContextMenu={undefined}
          hoverColumn={undefined}
          unhoverColumn={undefined}
        />
      );
    }

    if (
      typeof itemType === "string" &&
      itemType.startsWith("STACK_TABLE_ORDER_")
    ) {
      return (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 2,
            py: 1,
            borderRadius: 1,
            border: "1px solid",
            borderColor: "divider",
            backgroundColor: "background.paper",
            boxShadow: 3,
            minWidth: 180,
            maxWidth: 320,
          }}
        >
          <DragIndicator fontSize="small" color="action" />
          {item.isTable ? (
            <TableChart fontSize="small" />
          ) : (
            <AccountTree fontSize="small" />
          )}
          <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
            {item.name || "Untitled"}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {item.index + 1}
          </Typography>
        </Box>
      );
    }
    return null;
  };

  function x() {
    // Lock horizontal position for stack table reorder drags
    if (
      typeof itemType === "string" &&
      itemType.startsWith("STACK_TABLE_ORDER_")
    ) {
      return initialOffset ? initialOffset.x : 0;
    }

    // Clamp left boundary for column drags so the preview stays within its container
    if (typeof itemType === "string" && itemType.endsWith("-column")) {
      const containerLeft = item?.dragBounds?.containerLeft ?? 0;
      return currentOffset ? Math.max(containerLeft, currentOffset.x) : 0;
    }

    return currentOffset ? currentOffset.x : 0;
  }

  function y() {
    // Lock vertical position for column drags
    if (typeof itemType === "string" && itemType.endsWith("-column")) {
      return initialOffset ? initialOffset.y : 0;
    }

    return currentOffset ? currentOffset.y : 0;
  }

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
      <Box
        sx={{
          transform: `translate(${x()}px, ${y()}px)`,
          WebkitTransform: `translate(${x()}px, ${y()}px)`,
          //   maxWidth: itemType === TABLE_ROW_VIEW_CLASS ? "300px" : "auto", // Limit width for stacked preview
        }}
      >
        {renderDragPreview()}
      </Box>
    </div>
  );
}
