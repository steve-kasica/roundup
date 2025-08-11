import { useDragLayer } from "react-dnd";
import { DATA_TYPE as COLUMN } from "./slices/columnsSlice";
import {
  MODULE_NAME as COLUMN_INDEX,
  ColumnIndex,
} from "./components/OperationDetail/StackDetail/ColumnIndex";
import { Paper } from "@mui/material";

export default function CustomDragLayer() {
  const {
    item,
    itemType,
    currentOffset,
    deltaOffset,
    initialOffset,
    isDragging,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    deltaOffset: monitor.getDifferenceFromInitialOffset(),
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
      default:
        return currentOffset.x;
    }
  }

  function y() {
    switch (itemType) {
      case COLUMN:
      case COLUMN_INDEX:
        return initialOffset.y; // Don't allow ghost to move vertically
      default:
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
    switch (itemType) {
      case COLUMN:
        return (
          <div
            style={{
              backgroundColor: "lightblue",
              width: `${item.width || 100}px`,
              height: "37px",
              opacity: 0.5,
            }}
          ></div>
        );
      case COLUMN_INDEX:
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
      default:
        return null;
        // <div
        //   style={{
        //     backgroundColor: "lightgray",
        //     width: `${item.width || 100}px`,
        //     height: "100px",
        //     opacity: 0.5,
        //   }}
        // ></div>
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
    </div>
  );
}
