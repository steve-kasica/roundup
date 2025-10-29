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
  error,
  hoverColumn,
  unhoverColumn,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  alertIds,
  hasAlerts,
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
    isError={error}
    isVisible={isVisible}
    onMouseEnter={hoverColumn}
    onMouseLeave={unhoverColumn}
    sx={{
      borderRadius: 0,
      boxShadow: "none",
      cursor: "default",
      minWidth: "5px",
    }}
  />
);

ColumnTick.displayName = "ColumnTick";

const EnhancedColumnTick = withColumnData(ColumnTick);

EnhancedColumnTick.displayName = "EnhancedColumnTick";

export { ColumnTick, EnhancedColumnTick };
