import { Box, darken, lighten, styled } from "@mui/system";

const StyledColumnCard = styled(Box, {
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
    // padding: 4,
    flex: "1 1 0",
    minHeight: "25px",
    minWidth: "100px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 0,
    cursor: isDragging ? "grabbing" : isDraggable ? "grab" : "pointer",
    transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
    opacity: 1,

    // Define column container default styles
    backgroundColor:
      operationIndex !== undefined
        ? theme.palette.operationColors[operationIndex]
        : theme.palette.orphanedTableBackgroundColor,
    // Column is hovered state
    ...(isHovered && {
      backgroundColor: lighten(
        operationIndex !== undefined
          ? theme.palette.operationColors[operationIndex]
          : theme.palette.orphanedTableBackgroundColor,
        0.3
      ),
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
    }),
    // Column is selected state
    ...(isSelected && {
      backgroundColor: lighten(
        operationIndex !== undefined
          ? theme.palette.operationColors[operationIndex]
          : theme.palette.orphanedTableBackgroundColor,
        0.4
      ),
    }),
    // Column is being dragged state
    ...(isDragging && {
      opacity: 0,
    }),
    ...(isDropTarget && {
      outline: `2px solid ${darken(
        theme.palette.operationColors[operationIndex] ||
          theme.palette.orphanedTableBackgroundColor,
        0.2
      )}`,
      animation: "pulse 1.5s ease-in-out infinite",
      "@keyframes pulse": {
        "0%, 100%": {
          backgroundColor:
            operationIndex !== undefined
              ? theme.palette.operationColors[operationIndex]
              : theme.palette.orphanedTableBackgroundColor,
        },
        "50%": {
          backgroundColor: lighten(
            operationIndex !== undefined
              ? theme.palette.operationColors[operationIndex]
              : theme.palette.orphanedTableBackgroundColor,
            0.2
          ),
        },
      },
    }),
    // Column is over a drop target state
    ...(isOver && {
      transform: "scale(1.03)",
    }),
    ...(isLoading && {
      ...theme.palette.column.loading,
    }),
    ...(isError && {
      ...theme.palette.column.error,
    }),
    ...(isFocused && {
      outline: "2px solid #000",
      transform: "scale(1.05)",
      zIndex: 1000,
    }),
    ...(isVisible === false && {
      ...theme.palette.column.hidden,
    }),
    ...(isNull && {
      backgroundColor: "black",
      fontStyle: "italic",
      color: theme.palette.text.disabled,
    }),
  })
);

export default StyledColumnCard;
