/**
 * @fileoverview ColumnTick Component
 *
 * A styled container component that represents a single column in a minimal,
 * "tick" or marker format. This component provides visual feedback for various
 * column states including hover, selection, dragging, focus, loading, and errors.
 *
 * The component uses MUI's styled API to create a responsive visual system that
 * adapts to different interaction states, making it suitable for compact column
 * representations in schema views or column lists.
 *
 * @module components/ColumnViews/ColumnTick
 *
 * @example
 * <EnhancedColumnTick
 *   id="column-123"
 *   isHovered={false}
 *   isSelected={true}
 * />
 */

/* eslint-disable react/prop-types */
import { Box, styled } from "@mui/material";
import { withColumnData } from "../HOC";

/**
 * StyledColumnTick
 *
 * A styled Box component that provides visual states for column markers.
 * Uses theme palette values to maintain consistent styling across the application.
 *
 * @component
 * @param {Object} props - Component props
 * @param {boolean} props.isHovered - Column is being hovered
 * @param {boolean} props.isDragging - Column is being dragged
 * @param {boolean} props.isLoading - Column data is loading
 * @param {boolean} props.isFocused - Column has focus
 * @param {boolean} props.isDropTarget - Column can accept drops
 * @param {boolean} props.isSelected - Column is selected
 * @param {boolean} props.isOver - Dragged item is over this column
 * @param {boolean} props.isVisible - Column is visible (false for hidden columns)
 * @param {boolean} props.isNull - Column contains null value
 * @param {boolean} props.isDraggable - Column can be dragged
 * @param {boolean} props.isError - Column has errors
 *
 * @description
 * Visual state hierarchy (applied in order):
 * 1. Default state from theme.palette.column.default
 * 2. Hovered state
 * 3. Selected state
 * 4. Dragging state
 * 5. Drop target state
 * 6. Over drop target state
 * 7. Loading state
 * 8. Error state
 * 9. Focused state
 * 10. Hidden state
 * 11. Null value state
 */
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
    display: "flex",
    flexDirection: "column",
    paddingLeft: "5px",
    boxSizing: "border-box",
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
  // hoverColumn,
  // unhoverColumn,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  totalCount,
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
    isError={totalCount}
    isVisible={isVisible}
    // onMouseEnter={hoverColumn}
    // onMouseLeave={unhoverColumn}
    sx={sx}
  />
);

ColumnTick.displayName = "ColumnTick";

const EnhancedColumnTick = withColumnData(ColumnTick);

EnhancedColumnTick.displayName = "EnhancedColumnTick";

export { ColumnTick, EnhancedColumnTick, StyledColumnTick };
