import { styled, TableCell } from "@mui/material";
import withColumnData from "./withColumnData";

const StyledTableCell = styled(TableCell)(
  ({
    isNull,
    isSelected,
    isHovered,
    isDragging,
    isOver,
    isDropZone,
    isDraggable,
  }) => ({
    cursor: isDraggable ? "grab" : "context-menu", // <-- USE isDraggable
    backgroundColor: isNull
      ? "#f5f5f5"
      : isDragging
      ? "#fff3e0"
      : isOver
      ? "#e8f5e8"
      : isDropZone
      ? "#f0f8f0"
      : isSelected
      ? "#e3f2fd"
      : isHovered
      ? "#f5f5f5"
      : "inherit",
    boxShadow: isDragging
      ? "0 8px 16px rgba(255, 152, 0, 0.4)"
      : isOver
      ? "0 4px 12px rgba(76, 175, 80, 0.3)"
      : isDropZone
      ? "0 2px 6px rgba(129, 199, 132, 0.2), inset 0 0 0 1px rgba(129, 199, 132, 0.3)"
      : undefined,
    transform: isDragging
      ? "scale(1.05) rotate(2deg)"
      : isOver
      ? "scale(1.03)"
      : isDropZone
      ? "scale(1.01)"
      : isSelected
      ? "scale(1.02)"
      : isHovered
      ? "scale(1.01)"
      : "scale(1)",
    opacity: isDragging ? 0.8 : isDropZone ? 0.95 : 1,
    transition: "all 0.2s ease-in-out",
    zIndex: isDragging ? 1000 : isOver ? 100 : undefined,
    // Optionally, add a visual indicator for draggable state:
    outline: isDraggable ? "2px dashed #2196f3" : undefined,
  })
);

const ColumnTableHeader = withColumnData(
  ({
    hoverColumn,
    unhoverColumn,
    isNull,
    isSelected,
    isHovered,
    isDragging,
    isOver,
    isDropZone,
    isDraggable,
    onClickHandler,
    children,
  }) => (
    <StyledTableCell
      isNull={isNull}
      isSelected={isSelected}
      isHovered={isHovered}
      isDragging={isDragging}
      isOver={isOver}
      isDropZone={isDropZone}
      isDraggable={isDraggable}
      onMouseEnter={hoverColumn}
      onMouseLeave={unhoverColumn}
      onClick={onClickHandler}
    >
      {children}
    </StyledTableCell>
  )
);

export default ColumnTableHeader;
