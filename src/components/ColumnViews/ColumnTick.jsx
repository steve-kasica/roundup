/* eslint-disable react/prop-types */
import { Box, styled } from "@mui/material";
import withColumnData from "./withColumnData";

const StyledTick = styled(Box)(
  ({
    isNull,
    isSelected,
    isLoading,
    isHovered,
    isDragging,
    isDropTarget,
    isOver,
    error,
  }) => ({
    pointerEvents: "none", // Disable all mouse events
    flex: "1 1 0",
    boxSizing: "border-box",
    display: "block",
    border: "none",
    transition: "all 0.2s ease-in-out",

    // Null state
    ...(isNull && {
      backgroundColor: "#ffebee",
      borderColor: "#f44336",
      opacity: 0.7,
      cursor: "default",
    }),

    // Selected state
    ...(isSelected && {
      backgroundColor: "#e3f2fd",
      borderColor: "#2196f3",
      boxShadow: "0 0 0 2px rgba(33, 150, 243, 0.2)",
    }),

    // Loading state
    ...(isLoading && {
      backgroundColor: "#fff3e0",
      borderColor: "#ff9800",
      animation: "pulse 1.5s ease-in-out infinite",
      "@keyframes pulse": {
        "0%": { opacity: 0.6 },
        "50%": { opacity: 1 },
        "100%": { opacity: 0.6 },
      },
    }),

    // Hovered state
    ...(isHovered && {
      backgroundColor: "#f3e5f5",
    }),

    // Dragging state
    ...(isDragging && {
      backgroundColor: "#e8f5e8",
      opacity: 0.8,
      transform: "rotate(5deg)",
    }),

    // Drop target state
    ...(isDropTarget && {
      backgroundColor: "#e8f5e8",
      borderColor: "#4caf50",
      borderStyle: "dashed",
      borderWidth: "2px",
      transform: "scale(1.1)",
      boxShadow: "0 2px 4px rgba(76, 175, 80, 0.3)",
    }),

    // Drop over state
    ...(isOver && {
      backgroundColor: "#fff8e1",
      borderColor: "#ffc107",
      borderStyle: "dashed",
      transform: "scale(1.2)",
    }),

    // Error state
    ...(error && {
      backgroundColor: "#ffebee",
      borderColor: "#f44336",
      borderWidth: 2,
      position: "relative",
      "&::after": {
        content: '"!"',
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: "#f44336",
        fontSize: 8,
        fontWeight: "bold",
      },
    }),
  })
);

const ColumnTick = (props) => <StyledTick {...props} />;

ColumnTick.displayName = "ColumnTick";

const EnhancedColumnTick = withColumnData(ColumnTick);

EnhancedColumnTick.displayName = "EnhancedColumnTick";

export { ColumnTick, EnhancedColumnTick };
