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

import { withColumnData } from "../HOC";
import { StyledColumnContainer } from "../ColumnViews";

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
  operationIndex,
  sx = {},
}) => {
  console.log("Rendering ColumnTick:", { operationIndex, sx });
  return (
    <StyledColumnContainer
      className={"ColumnTick"}
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
      operationIndex={operationIndex}
      // onMouseEnter={hoverColumn}
      // onMouseLeave={unhoverColumn}
      sx={{
        minWidth: "1px",
        ...sx,
      }}
    />
  );
};

ColumnTick.displayName = "ColumnTick";

const EnhancedColumnTick = withColumnData(ColumnTick);

EnhancedColumnTick.displayName = "EnhancedColumnTick";

export { ColumnTick, EnhancedColumnTick };
