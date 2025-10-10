import { Card } from "@mui/material";
import { styled } from "@mui/system";

const StyledColumnCard = styled(Card, {
  shouldForwardProp: (prop) =>
    ![
      "isDragging",
      "canDropHere",
      "isSelected",
      "isOver",
      "isDraggable",
      "isError",
    ].includes(prop),
})(({ isDragging, canDropHere, isSelected, isOver, isDraggable, isError }) => ({
  padding: 4,
  flex: "1 1 0",
  minHeight: "25px",
  minWidth: "100px",
  display: "flex",
  flexDirection: "column",
  cursor: isDragging ? "grabbing" : isDraggable ? "grab" : "pointer",
  overflow: "hidden",
  border: "1px solid",
  borderColor: isError
    ? "#f44336" // error.main (red for error state)
    : isOver
    ? "#2196f3" // primary.main (blue for active hover)
    : canDropHere
    ? "#4caf50" // success.main
    : isDragging
    ? "#ff9800" // warning.main
    : isDraggable
    ? "#9e9e9e" // grey.500 (subtle indicator for draggable)
    : "#e0e0e0", // divider
  borderStyle: isError
    ? "solid"
    : isOver
    ? "dashed"
    : canDropHere
    ? "dashed"
    : isDraggable
    ? "dotted"
    : "solid",
  borderWidth: isError || isOver || canDropHere || isDragging ? "2px" : "1px",
  outline: isSelected ? "2px solid" : "none",
  outlineColor: isSelected ? "#1976d2" : "transparent", // primary.main
  backgroundColor: isError
    ? "#ffebee" // error.50 (light red for error background)
    : isOver
    ? "#e3f2fd" // primary.50 (light blue for active hover)
    : isDragging
    ? "#fff3e0" // warning.50
    : canDropHere
    ? "#e8f5e8" // success.50
    : isSelected
    ? "rgba(0, 0, 0, 0.08)" // action.selected
    : isDraggable
    ? "#fafafa" // grey.50 (subtle background for draggable)
    : "#ffffff", // background.paper
  transform: isOver
    ? "scale(1.05)"
    : isDragging
    ? "scale(0.95) rotate(2deg)"
    : canDropHere
    ? "scale(1.02)"
    : "scale(1)",
  transition: "all 0.2s ease-in-out",
  boxShadow: isError
    ? "0 4px 8px rgba(244, 67, 54, 0.3)" // Red glow for error state
    : isOver
    ? "0 6px 12px rgba(33, 150, 243, 0.4)" // Blue glow for active hover
    : isDragging
    ? "0 8px 16px rgba(255, 152, 0, 0.3)"
    : canDropHere
    ? "0 4px 8px rgba(76, 175, 80, 0.2)"
    : isDraggable
    ? "0 2px 6px rgba(0, 0, 0, 0.1)" // Subtle shadow for draggable
    : "none",
  opacity: isDragging ? 0.8 : 1,
  zIndex: isDragging ? 1000 : "auto",
  position: "relative",
  "&:hover": {
    backgroundColor: isError
      ? "#ffcdd2" // error.100 (darker red on hover for error)
      : isOver
      ? "#bbdefb" // primary.100 (darker blue for hover over isOver)
      : isDragging
      ? "#ffe0b2" // warning.100
      : canDropHere
      ? "#c8e6c9" // success.100
      : isSelected
      ? "rgba(0, 0, 0, 0.08)" // action.selected
      : isDraggable
      ? "#f5f5f5" // grey.100 (slightly darker on hover for draggable)
      : "rgba(0, 0, 0, 0.04)", // action.hover
    transform: isOver
      ? "scale(1.05)"
      : isDragging
      ? "scale(0.95) rotate(2deg)"
      : canDropHere
      ? "scale(1.02)"
      : isDraggable
      ? "scale(1.01)" // Slight scale on hover for draggable
      : "scale(1)",
  },
  // Add a subtle drag indicator pattern when draggable
  "&::before": isDraggable
    ? {
        content: '""',
        position: "absolute",
        top: "4px",
        right: "4px",
        width: "8px",
        height: "8px",
        background:
          "repeating-linear-gradient(45deg, #bdbdbd 0px, #bdbdbd 1px, transparent 1px, transparent 3px)",
        borderRadius: "2px",
        opacity: 0.6,
      }
    : {},
}));

export default StyledColumnCard;
