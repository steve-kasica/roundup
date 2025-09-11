import { Paper, styled } from "@mui/material";
// Styled component for the cell Paper creates a clear state hierarchy:
//
// - Selected cells: Most prominent with blue theme and strong effects
// - Hovered cells: Subtle feedback with light gray background and gentle shadow
// - Null cells: Always gray background regardless of other states
// - Normal cells: Default styling
const StyledPaper = styled(Paper)(
  ({
    isNull,
    isSelected,
    isHovered,
    isDragging,
    isOver,
    isDropZone,
    isDraggable,
  }) => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "left",
    height: "auto",
    margin: "5px 0px",
    borderStyle: isNull
      ? "dashed"
      : isOver
      ? "dashed"
      : isDropZone
      ? "dashed"
      : "solid",
    borderWidth: isOver ? "2px" : isDropZone ? "1px" : "1px",
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
    borderColor: isDragging
      ? "#ff9800"
      : isOver
      ? "#4caf50"
      : isDropZone
      ? "#81c784"
      : isSelected
      ? "#2196f3"
      : isHovered
      ? "#9e9e9e"
      : undefined,
    boxShadow: isDragging
      ? "0 8px 16px rgba(255, 152, 0, 0.4)"
      : isOver
      ? "0 4px 12px rgba(76, 175, 80, 0.3)"
      : isDropZone
      ? "0 2px 6px rgba(129, 199, 132, 0.2), inset 0 0 0 1px rgba(129, 199, 132, 0.3)"
      : isSelected
      ? "0 2px 8px rgba(33, 150, 243, 0.3)"
      : isHovered
      ? "0 1px 4px rgba(0, 0, 0, 0.1)"
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

export default StyledPaper;
