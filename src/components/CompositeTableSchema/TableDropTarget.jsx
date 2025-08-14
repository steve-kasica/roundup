/**
 * TableDropTarget.jsx
 *
 * Notes:
 *  - Table instance in the SourceTables component dispatch actions,
 *    only operationTypes are defined in this component
 */
import PropTypes from "prop-types";
import { forwardRef } from "react";
import { useDrop } from "react-dnd";
import { TABLE_ROW_VIEW_CLASS } from "../TableSelector/TableLayout/TableRowView";
import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";

const ForwardedBox = forwardRef((props, ref) => <Box ref={ref} {...props} />);
ForwardedBox.displayName = "ForwardedBox";

const DropZone = styled(ForwardedBox, {
  shouldForwardProp: (prop) =>
    !["isOver", "canDrop", "variant", "size"].includes(prop),
})(({ theme, isOver, canDrop, variant = "default", size = "medium" }) => {
  // Base styles
  let styles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "1px dashed #000",
    color: "#999",
    transition: "all 0.2s ease-in-out",
    position: "relative",
    overflow: "hidden",
  };

  // Size variations
  const sizeStyles = {
    small: {
      height: "60px",
      minHeight: "60px",
    },
    medium: {
      height: "100px",
      minHeight: "100px",
    },
    large: {
      height: "150px",
      minHeight: "150px",
    },
    auto: {
      height: "100%",
      minHeight: "30px",
    },
  };

  // Apply size styles
  styles = { ...styles, ...sizeStyles[size] };

  // Variant styles
  const variantStyles = {
    default: {
      backgroundColor: "inherit",
      borderColor: "#ddd",
    },
    primary: {
      backgroundColor: "rgba(25, 118, 210, 0.05)",
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
    secondary: {
      backgroundColor: "rgba(156, 39, 176, 0.05)",
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
    },
    success: {
      backgroundColor: "rgba(76, 175, 80, 0.05)",
      borderColor: "#4caf50",
      color: "#2e7d32",
    },
    warning: {
      backgroundColor: "rgba(255, 152, 0, 0.05)",
      borderColor: "#ff9800",
      color: "#f57c00",
    },
    error: {
      backgroundColor: "rgba(244, 67, 54, 0.05)",
      borderColor: "#f44336",
      color: "#d32f2f",
    },
  };

  // Apply variant styles
  styles = { ...styles, ...variantStyles[variant] };

  // Can drop state styles (when something is being dragged and can be dropped)
  if (canDrop && !isOver) {
    styles = {
      ...styles,
      borderColor:
        variant === "default" ? "#1976d2" : variantStyles[variant].borderColor,
      borderStyle: "dashed",
      borderWidth: "2px",
      backgroundColor:
        variant === "default"
          ? "rgba(25, 118, 210, 0.02)"
          : `${variantStyles[variant].borderColor}08`,
      color: variant === "default" ? "#1976d2" : variantStyles[variant].color,
    };
  }

  // Active state styles (when dragging over)
  if (canDrop && isOver) {
    styles = {
      ...styles,
      backgroundColor: "tomato",
      // variant === "default"
      //   ? "tomato"
      //   : `${variantStyles[variant].borderColor}20`,
      borderColor:
        variant === "default" ? "tomato" : variantStyles[variant].borderColor,
      borderStyle: "solid",
      borderWidth: "2px",
      transform: "scale(1.02)",
      boxShadow: `0 4px 12px ${
        variant === "default"
          ? "rgba(255, 99, 71, 0.3)"
          : `${variantStyles[variant].borderColor}40`
      }`,
      color: variant === "default" ? "#fff" : variantStyles[variant].color,
    };
  }

  return styles;
});

export default function TableDropTarget({ operationType, children }) {
  const [{ isOver, canDrop }, dropRef] = useDrop({
    accept: TABLE_ROW_VIEW_CLASS,
    drop: (draggedItem, monitor) => {
      if (monitor.didDrop()) {
        return; // Already handled by a nested drop target
      }
      return { accepted: true, operationType };
    },
    canDrop: () => true,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  return (
    <DropZone
      ref={dropRef}
      isOver={isOver}
      canDrop={canDrop}
      variant="default"
      size="auto"
    >
      {children}
    </DropZone>
  );
}

TableDropTarget.propTypes = {
  operationType: PropTypes.string.isRequired,
  children: PropTypes.node,
};
