/* eslint-disable no-unused-vars */
import { useDragLayer } from "react-dnd";
import { Box } from "@mui/material";

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
    return null;
  };

  function x() {
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
