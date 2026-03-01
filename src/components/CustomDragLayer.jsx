/* eslint-disable no-unused-vars */
import { useDragLayer } from "react-dnd";
import { Box, ListItemIcon, Typography } from "@mui/material";
import { DragIndicator, TableChart, AccountTree } from "@mui/icons-material";

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
    return currentOffset ? currentOffset.x : 0;
  }

  function y() {
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
