/* eslint-disable react/prop-types */
import StyledColumnCard from "./StyledColumnCard";
import withColumnData from "./withColumnData";

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
  <StyledColumnCard
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
    sx={{
      borderRadius: 0,
      boxShadow: "none",
      cursor: "default",
      minWidth: 0,
      ...sx,
    }}
  />
);

ColumnTick.displayName = "ColumnTick";

const EnhancedColumnTick = withColumnData(ColumnTick);

EnhancedColumnTick.displayName = "EnhancedColumnTick";

export { ColumnTick, EnhancedColumnTick };
