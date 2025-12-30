/**
 * @fileoverview StyledDropZone Component
 *
 * A versatile styled drop zone component with multiple visual variants and size options.
 * Provides consistent drag-and-drop visual feedback across the application with support
 * for different UI contexts (default, outline, solid styles).
 *
 * Features:
 * - Multiple visual variants (default, outline, solid)
 * - Size options (small, medium, large)
 * - State-based styling (isOver, canDrop)
 * - Ref forwarding for react-dnd
 * - Theme-aware colors and transitions
 * - Flexible layout with centering
 * - Border animations on hover/drag
 *
 * @module components/ui/StyledDropZone
 *
 * @example
 * <StyledDropZone
 *   ref={dropRef}
 *   isOver={isOver}
 *   canDrop={canDrop}
 *   variant="outline"
 *   size="large"
 * >
 *   Drop content here
 * </StyledDropZone>
 */

import { Box, styled } from "@mui/material";
import { forwardRef } from "react";

const ForwardedBox = forwardRef((props, ref) => <Box ref={ref} {...props} />);
ForwardedBox.displayName = "ForwardedBox";

const StyledDropZone = styled(ForwardedBox, {
  shouldForwardProp: (prop) =>
    !["isOver", "canDrop", "variant", "size"].includes(prop),
})(({ theme, isOver, canDrop, variant = "default", size = "medium" }) => {
  // Base styles
  let styles = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    border: "2px dashed #000",
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
      minHeight: "20px",
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

export default StyledDropZone;
