import { Box, styled } from "@mui/system";

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
  }) => ({
    // padding: 4,
    flex: "1 1 0",
    minHeight: "25px",
    minWidth: "100px",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    borderRadius: 0,
    ...theme.palette.column.default,
    cursor: isDragging ? "grabbing" : isDraggable ? "grab" : "pointer",
    // Column is hovered state
    ...(isHovered && {
      ...theme.palette.column.hovered,
    }),
    // Column is selected state
    ...(isSelected && {
      ...theme.palette.column.selected,
    }),
    // Column is being dragged state
    ...(isDragging && {
      ...theme.palette.column.dragging,
    }),
    // Column is a valid drop target state
    ...(isDropTarget && {
      ...theme.palette.column.dropTarget,
    }),
    // Column is over a drop target state
    ...(isOver && {
      ...theme.palette.column.overDropTarget,
    }),
    ...(isLoading && {
      ...theme.palette.column.loading,
    }),
    ...(isError && {
      ...theme.palette.column.error,
    }),
    ...(isFocused && {
      ...theme.palette.column.focused,
    }),
    ...(isVisible === false && {
      ...theme.palette.column.hidden,
    }),
    ...(isNull && {
      fontStyle: "italic",
      color: theme.palette.text.disabled,
    }),
  })
);

export default StyledColumnCard;
