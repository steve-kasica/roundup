import { Box, darken, lighten, styled } from "@mui/system";

const StyledColumnContainer = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      "isHovered",
      "isDragging",
      "isLoading",
      "isFocused",
      "isDropTarget",
      "isSelected",
      "isOver",
      "isVisible",
      "isNull",
      "isDraggable",
      "isError",
      "operationIndex",
    ].includes(prop),
})(
  ({
    theme,
    isHovered,
    isDragging,
    isDropTarget,
    isSelected,
    isOver,
    isLoading,
    isVisible,
    isNull,
    isFocused,
    isDraggable,
    isError,
    operationIndex,
  }) => ({
    flex: "1 1 0",
    // minHeight: "25px",
    minWidth: "100px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 0,
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",

    // Define column container default styles
    cursor: "pointer",
    backgroundColor: lighten(
      operationIndex !== null && operationIndex >= 0
        ? theme.palette.operationColors[operationIndex]
        : theme.palette.orphanedTableBackgroundColor,
      theme.effects.defaultLighten,
    ),
    color: theme.palette.getContrastText(
      operationIndex !== null && operationIndex >= 0
        ? theme.palette.operationColors[operationIndex]
        : theme.palette.orphanedTableBackgroundColor,
    ),
    borderColor: theme.palette.getContrastText(
      operationIndex !== null && operationIndex >= 0
        ? theme.palette.operationColors[operationIndex]
        : theme.palette.orphanedTableBackgroundColor,
    ),
    boxShadow: "none",
    transform: "scale(1)",
    opacity: 1,
    // Column is hovered state
    ...(isHovered && {
      backgroundColor: lighten(
        operationIndex !== null && operationIndex >= 0
          ? theme.palette.operationColors[operationIndex]
          : theme.palette.orphanedTableBackgroundColor,
        theme.effects.hoveredLighten,
      ),
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    }),
    // Column is selected state
    ...(isSelected && {
      backgroundColor: lighten(
        operationIndex !== null && operationIndex >= 0
          ? theme.palette.operationColors[operationIndex]
          : theme.palette.orphanedTableBackgroundColor,
        theme.effects.selectedLighten,
      ),
    }),
    ...(isDraggable && {
      cursor: "grab",
    }),
    // Column is drop target state
    ...(isDropTarget === true
      ? {
          outline: `2px dashed ${darken(
            operationIndex !== null && operationIndex >= 0
              ? theme.palette.operationColors[operationIndex]
              : theme.palette.orphanedTableBackgroundColor,
            theme.effects.dropTargetDarken,
          )}`,
          outlineOffset: "-2px",
          opacity: 1,
        }
      : isDropTarget === false
        ? {
            opacity: theme.effects.nonDropTargetOpacity,
            filter: `blur(${theme.effects.nonDropTargetBlur}px)`,
          }
        : {}),
    // Column is over a drop target state
    ...(isOver && {
      transform: "scale(1.03)",
    }),
    // Define loading styles
    ...(isLoading && {
      animation: "pulse 1.5s ease-in-out infinite",
      "@keyframes pulse": {
        "0%, 100%": {
          backgroundColor:
            operationIndex !== null && operationIndex >= 0
              ? theme.palette.operationColors[operationIndex]
              : theme.palette.orphanedTableBackgroundColor,
        },
        "50%": {
          backgroundColor: lighten(
            operationIndex !== null && operationIndex >= 0
              ? theme.palette.operationColors[operationIndex]
              : theme.palette.orphanedTableBackgroundColor,
            0.2,
          ),
        },
      },
    }),
    // Column is being dragged state
    ...(isDragging && {
      opacity: theme.effects.isDraggingOpacity,
      cursor: "grabbing",
    }),
    ...(isError && {}),
    // Define focus vs unfocus styles
    ...(isFocused === true
      ? {
          opacity: theme.effects.focusedOpacity,
        }
      : isFocused === false
        ? {
            opacity: theme.effects.unfocusedOpacity,
            filter: `blur(${theme.effects.unfocusedBlur}px)`,
          }
        : {}),
    ...(isNull && {
      backgroundImage: `
        repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0, 0, 0, 0.15) 3px, rgba(0, 0, 0, 0.15) 4px),
        repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0, 0, 0, 0.15) 3px, rgba(0, 0, 0, 0.15) 4px)`,
    }),
  }),
);

export default StyledColumnContainer;
