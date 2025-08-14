import { styled } from "@mui/material/styles";
import { DragIndicator } from "@mui/icons-material";
import { useState, forwardRef } from "react";
import PropTypes from "prop-types";

// Styled table row component that handles all drag and drop states
const StyledTableRow = styled("tr", {
  shouldForwardProp: (prop) =>
    ![
      "isDragging",
      "isOver",
      "canDropHere",
      "isDisabled",
      "isSelected",
      "isHovered",
    ].includes(prop),
})(({ isDragging, isOver, canDropHere, isDisabled, isSelected, isHovered }) => {
  let styles = {
    transition: "all 0.2s ease-in-out",
    cursor: "pointer",
  };

  // Base selected styles (lowest priority)
  if (isSelected) {
    styles = {
      ...styles,
      backgroundColor: "rgba(25, 118, 210, 0.08)",
      borderLeft: "4px solid #1976d2",
    };
  }

  // Hover styles
  if (isHovered && !isDragging && !isOver) {
    styles = {
      ...styles,
      backgroundColor: "rgba(0, 0, 0, 0.04)",
    };
  }

  // Drag and drop states (higher priority)
  if (isDragging) {
    styles = {
      ...styles,
      cursor: "grabbing",
      backgroundColor: "rgba(255, 152, 0, 0.1)",
      border: "2px solid #ff9800",
      transform: "scale(1.02) rotate(1deg)",
      boxShadow: "0 8px 16px rgba(255, 152, 0, 0.4)",
      zIndex: 1000,
      opacity: 0.8,
    };
  } else if (isOver) {
    styles = {
      ...styles,
      backgroundColor: "rgba(76, 175, 80, 0.1)",
      border: "2px solid #4caf50",
      transform: "scale(1.01)",
      boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
    };
  } else if (canDropHere) {
    styles = {
      ...styles,
      backgroundColor: "rgba(129, 199, 132, 0.05)",
      border: "1px dashed #81c784",
      opacity: 0.95,
    };
  }

  // Disabled styles (highest priority)
  if (isDisabled) {
    styles = {
      ...styles,
      opacity: 0.5,
      cursor: "not-allowed",
    };
  }

  return styles;
});

// Styled drag handle cell
const StyledDragHandle = styled("td", {
  shouldForwardProp: (prop) => !["isDisabled", "isHovered"].includes(prop),
})(({ isDisabled, isHovered }) => ({
  textAlign: "center",
  cursor: isDisabled ? "not-allowed" : "grab",
  backgroundColor: isHovered ? "#ddd" : "#eee",
  padding: "8px",
  borderRight: "1px solid #e0e0e0",
  transition: "all 0.2s ease-in-out",
  opacity: isDisabled ? 0.3 : 1,
  "&:hover": {
    backgroundColor: isDisabled ? "#eee" : "#ddd",
  },
}));

// Styled drag indicator icon
const StyledDragIndicator = styled(DragIndicator, {
  shouldForwardProp: (prop) =>
    !["isDragging", "isOver", "canDropHere", "isDisabled"].includes(prop),
})(({ theme, isDragging, isOver, canDropHere, isDisabled }) => ({
  opacity: isDragging ? 1 : isOver ? 0.8 : canDropHere ? 0.6 : 0.5,
  color: isDragging
    ? "#ff6f00"
    : isOver
    ? "#2e7d32"
    : canDropHere
    ? "#66bb6a"
    : theme.palette.action.disabled,
  cursor: isDragging ? "grabbing" : isDisabled ? "not-allowed" : "grab",
  transform: isDragging
    ? "scale(1.2)"
    : canDropHere
    ? "scale(1.05)"
    : "scale(1)",
  transition: "all 0.2s ease-in-out",
}));

// Main component that combines everything
const StyledDraggableRow = forwardRef(
  (
    {
      children,
      isDragging = false,
      isOver = false,
      canDropHere = false,
      isDisabled = false,
      isSelected = false,
      isHovered = false,
      showDragHandle = true,
      dragHandleRef,
      onDragHandleMouseEnter,
      onDragHandleMouseLeave,
      className = "",
      ...props
    },
    ref
  ) => {
    const [isDragHandleHovered, setIsDragHandleHovered] = useState(false);

    const handleDragHandleMouseEnter = (e) => {
      setIsDragHandleHovered(true);
      onDragHandleMouseEnter?.(e);
    };

    const handleDragHandleMouseLeave = (e) => {
      setIsDragHandleHovered(false);
      onDragHandleMouseLeave?.(e);
    };

    const combinedClassName = [
      "StyledDraggableRow",
      isDragging ? "dragging" : "",
      isOver ? "drag-over" : "",
      canDropHere ? "can-drop" : "",
      isDisabled ? "disabled" : "",
      isSelected ? "selected" : "",
      isHovered ? "hovered" : "",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <StyledTableRow
        ref={ref}
        className={combinedClassName}
        isDragging={isDragging}
        isOver={isOver}
        canDropHere={canDropHere}
        isDisabled={isDisabled}
        isSelected={isSelected}
        isHovered={isHovered}
        {...props}
      >
        {showDragHandle && (
          <StyledDragHandle
            ref={dragHandleRef}
            className="drag-handle"
            isDisabled={isDisabled}
            isHovered={isDragHandleHovered}
            onMouseEnter={handleDragHandleMouseEnter}
            onMouseLeave={handleDragHandleMouseLeave}
          >
            <StyledDragIndicator
              isDragging={isDragging}
              isOver={isOver}
              canDropHere={canDropHere}
              isDisabled={isDisabled}
            />
          </StyledDragHandle>
        )}
        {children}
      </StyledTableRow>
    );
  }
);

StyledDraggableRow.displayName = "StyledDraggableRow";

StyledDraggableRow.propTypes = {
  children: PropTypes.node.isRequired,
  isDragging: PropTypes.bool,
  isOver: PropTypes.bool,
  canDropHere: PropTypes.bool,
  isDisabled: PropTypes.bool,
  isSelected: PropTypes.bool,
  isHovered: PropTypes.bool,
  showDragHandle: PropTypes.bool,
  dragHandleRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  onDragHandleMouseEnter: PropTypes.func,
  onDragHandleMouseLeave: PropTypes.func,
  className: PropTypes.string,
};

export default StyledDraggableRow;
