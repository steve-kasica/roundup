/**
 * @fileoverview DropZone Component
 *
 * A styled drop zone component providing visual feedback for drag-and-drop operations.
 * Supports multiple variants (default, outline, solid) and sizes with state-based
 * styling for hover, drag-over, and can-drop states.
 *
 * Features:
 * - Multiple visual variants (default, outline, solid)
 * - Size options (small, medium, large)
 * - State-based styling (isOver, canDrop)
 * - Ref forwarding for react-dnd integration
 * - Theme-aware colors and transitions
 * - Flexible layout with centering
 *
 * @module components/ui/DropZone
 *
 * @example
 * <DropZone
 *   ref={dropRef}
 *   isOver={isOver}
 *   canDrop={canDrop}
 *   variant="outline"
 *   size="large"
 * >
 *   Drop tables here
 * </DropZone>
 */

import { styled } from "@mui/material/styles";
import { Box } from "@mui/material";
import { forwardRef } from "react";

// Styled drop zone component with visual feedback for drag states
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
    border: "2px dashed",
    borderColor: theme.palette.divider,
    backgroundColor: "transparent",
    color: theme.palette.text.secondary,
    transition: "all 0.2s ease-in-out",
    borderRadius: theme.spacing(1),
    position: "relative",
  };

  // Size variants
  const sizeStyles = {
    small: {
      padding: theme.spacing(2),
      minHeight: "60px",
      fontSize: "0.875rem",
    },
    medium: {
      padding: theme.spacing(3),
      minHeight: "120px",
      fontSize: "1rem",
    },
    large: {
      padding: theme.spacing(4),
      minHeight: "200px",
      fontSize: "1.125rem",
    },
    auto: {
      padding: theme.spacing(2),
      minHeight: "auto",
    },
  };

  // Color variants
  const colorStyles = {
    default: {
      borderColor: theme.palette.divider,
      color: theme.palette.text.secondary,
    },
    primary: {
      borderColor: theme.palette.primary.main,
      color: theme.palette.primary.main,
    },
    secondary: {
      borderColor: theme.palette.secondary.main,
      color: theme.palette.secondary.main,
    },
    success: {
      borderColor: theme.palette.success.main,
      color: theme.palette.success.main,
    },
    warning: {
      borderColor: theme.palette.warning.main,
      color: theme.palette.warning.main,
    },
    error: {
      borderColor: theme.palette.error.main,
      color: theme.palette.error.main,
    },
  };

  // Apply size and variant styles
  Object.assign(styles, sizeStyles[size] || sizeStyles.medium);
  Object.assign(styles, colorStyles[variant] || colorStyles.default);

  // Drag state styles
  if (canDrop && isOver) {
    styles.borderColor = theme.palette.primary.main;
    styles.backgroundColor = theme.palette.primary.main + "08"; // 8% opacity
    styles.color = theme.palette.primary.main;
    styles.borderStyle = "solid";
    styles.transform = "scale(1.02)";
  } else if (canDrop) {
    styles.borderColor = theme.palette.primary.light;
    styles.backgroundColor = theme.palette.primary.main + "04"; // 4% opacity
  } else if (isOver && !canDrop) {
    styles.borderColor = theme.palette.error.main;
    styles.backgroundColor = theme.palette.error.main + "08";
    styles.color = theme.palette.error.main;
  }

  return styles;
});

// Main DropZone component
const DropZone = forwardRef(
  (
    {
      children,
      isOver = false,
      canDrop = true,
      variant = "default",
      size = "medium",
      ...props
    },
    ref
  ) => {
    return (
      <StyledDropZone
        ref={ref}
        isOver={isOver}
        canDrop={canDrop}
        variant={variant}
        size={size}
        {...props}
      >
        {children}
      </StyledDropZone>
    );
  }
);

DropZone.displayName = "DropZone";

export default DropZone;
