import { current } from "@reduxjs/toolkit";
import { useDragLayer } from "react-dnd";
import { DATA_TYPE as COLUMN } from "./data/slices/columnsSlice";
import { ColumnView } from "./components/OperationDetail/StackDetail/ColumnBlockView";

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

  // console.log(item);
  const blockWidth = 84.9; // Assuming this is the width of a block
  let { x: dx, y: dy } = deltaOffset;
  let [x, y] = [stepX(), initialOffset.y];

  function stepX() {
    const absDX = Math.abs(dx);
    const a = Math.round(absDX / blockWidth);
    if (absDX < blockWidth / 2) {
      return initialOffset.x;
    } else {
      return initialOffset.x + Math.sign(dx) * a * blockWidth;
    }
  }

  // Render different effects based on the item type
  const renderDragPreview = () => {
    switch (itemType) {
      case COLUMN:
        return (
          <div
            style={{
              backgroundColor: "lightblue",
              width: `${blockWidth}px`,
              height: "37px",
              opacity: 0.5,
            }}
          ></div>
        );
      case "row":
        return (
          <div
            style={{
              padding: "8px",
              backgroundColor: "lightgreen",
              border: "1px solid green",
            }}
          >
            Dragging Row: {item.rowId}
          </div>
        );
      default:
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
      <div
        style={{
          transform: `translate(${x}px, ${y}px)`,
          WebkitTransform: `translate(${x}px, ${y}px)`,
        }}
      >
        {renderDragPreview()}
      </div>
    </div>
  );
}

function step(x) {
  return Math.round(x / 75) * 75;
}
