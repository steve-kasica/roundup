import { useDragLayer } from "react-dnd";
import { DATA_TYPE as COLUMN } from "./data/slices/columnsSlice";
import { COLUMN_INDEX } from "./components/OperationDetail/StackDetail/ColumnIndex";

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
      case COLUMN_INDEX:
        return (
          <div
            style={{
              backgroundColor: "lightblue",
              width: `${blockWidth}px`,
              height: "20px",
              opacity: 0.5,
            }}
          ></div>
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
