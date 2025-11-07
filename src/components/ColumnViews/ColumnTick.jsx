/* eslint-disable react/prop-types */
import { Box, styled } from "@mui/material";
import withColumnData from "./withColumnData";

const StyledColumnTick = styled(Box, {
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
    flex: "1 1 0",
    minHeight: "25px",
    display: "flex",
    flexDirection: "column",
    outlineWidth: "1px",
    outlineStyle: "solid",
    overflow: "hidden",
    borderRadius: 0,
    boxShadow: "none",
    ...theme.palette.column.default,
    cursor: isDragging ? "grabbing" : isDraggable ? "grab" : "default",
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

const ColumnTick = ({
  isHovered,
  isDragging,
  isDropTarget,
  isSelected,
  isOver,
  isLoading,
  isFocused,
  isDraggable,
  isNull,
  isVisible,
  hoverColumn,
  unhoverColumn,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  hasAlerts,
  sx = {},
}) => (
  <StyledColumnTick
    isHovered={isHovered}
    isDragging={isDragging}
    isDropTarget={isDropTarget}
    isSelected={isSelected}
    isOver={isOver}
    isLoading={isLoading}
    isFocused={isFocused}
    isDraggable={isDraggable}
    isNull={isNull}
    isError={hasAlerts}
    isVisible={isVisible}
    onMouseEnter={hoverColumn}
    onMouseLeave={unhoverColumn}
    sx={sx}
  />
);

ColumnTick.displayName = "ColumnTick";

const EnhancedColumnTick = withColumnData(ColumnTick);

EnhancedColumnTick.displayName = "EnhancedColumnTick";

export { ColumnTick, EnhancedColumnTick, StyledColumnTick };
