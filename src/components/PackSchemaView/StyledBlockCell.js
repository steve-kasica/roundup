import { Box, lighten, styled } from "@mui/material";

const StyledBlockCell = styled(Box, {
  shouldForwardProp: (prop) =>
    ![
      // "isHovered",
      // "isDragging",
      // "isLoading",
      // "isFocused",
      // "isDropTarget",
      // "isOver",
      // "isVisible",
      // "isNull",
      // "isDraggable",
      // "isError",
      // "operationIndex",
      "isDisabled",
      "isEmpty",
      "isSelected",
      "isLastLeftColumn",
      "highlightTopBorder",
      "highlightBottomBorder",
      "highlightLeftBorder",
      "highlightRightBorder",
      "borderWidth",
      "backgroundColor",
      "operationIndex",
    ].includes(prop),
})(
  ({
    theme,
    // isHovered,
    // isDragging,
    // isDropTarget,
    isSelected,
    isDisabled,
    // isOver,
    // isLoading,
    // isVisible,
    isNull,
    // isFocused,
    // isDraggable,
    // isError,
    // operationIndex,
    isLoading,
    operationIndex = 0,
  }) => ({
    flex: 1,
    minWidth: 0,
    height: "100%",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
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
    "&:hover": {
      backgroundColor: lighten(
        operationIndex !== null && operationIndex >= 0
          ? theme.palette.operationColors[operationIndex]
          : theme.palette.orphanedTableBackgroundColor,
        theme.effects.hoveredLighten,
      ),
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    },
    // Column is selected state
    ...(isSelected && {
      backgroundColor: lighten(
        operationIndex !== null && operationIndex >= 0
          ? theme.palette.operationColors[operationIndex]
          : theme.palette.orphanedTableBackgroundColor,
        theme.effects.selectedLighten,
      ),
    }),
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
    ...(isNull && {
      backgroundImage: `
        repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(0, 0, 0, 0.15) 3px, rgba(0, 0, 0, 0.15) 4px),
        repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0, 0, 0, 0.15) 3px, rgba(0, 0, 0, 0.15) 4px)`,
      backgroundColor: theme.palette.grey[100],
    }),
    ...(isDisabled && {
      cursor: "not-allowed",
      backgroundColor: theme.palette.action.disabledBackground,
      color: theme.palette.action.disabled,
    }),
  }),
);

export default StyledBlockCell;
