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
    backgroundColor:
      operationIndex !== null && operationIndex >= 0
        ? theme.palette.operationColors[operationIndex]
        : theme.palette.orphanedTableBackgroundColor,
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
        0.3,
      ),
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    }),
    // Column is selected state
    ...(isSelected && {
      backgroundColor: lighten(
        operationIndex !== null && operationIndex >= 0
          ? theme.palette.operationColors[operationIndex]
          : theme.palette.orphanedTableBackgroundColor,
        0.4,
      ),
    }),
    ...(isDraggable && {
      cursor: "grab",
    }),
    // Column is being dragged state
    ...(isDragging && {
      opacity: 0,
      cursor: "grabbing",
    }),
    // Column is drop target state
    ...(isDropTarget === true && {
      outline: `2px solid ${darken(
        theme.palette.operationColors[operationIndex] ||
          theme.palette.orphanedTableBackgroundColor,
        0.2,
      )}`,
    }),
    ...(isDropTarget === false && {
      opacity: 0.5,
    }),
    // Column is over a drop target state
    ...(isOver && {
      transform: "scale(1.03)",
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
    ...(isError && {}),
    ...(isFocused === true && {
      outlineWidth: "2px",
      outlineStyle: "solid",
      outlineColor:
        theme.palette.operationColors[operationIndex] ||
        theme.palette.orphanedTableBackgroundColor,
      zIndex: 1000,
    }),
    ...(isFocused === false && {
      opacity: 0.5,
    }),
    ...(isVisible === false && {}),
    ...(isNull && {
      backgroundColor: "black",
      fontStyle: "italic",
      color: theme.palette.text.disabled,
    }),
  }),
);

export default StyledColumnContainer;
