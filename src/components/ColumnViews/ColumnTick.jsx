/* eslint-disable react/prop-types */
import StyledColumnCard from "./StyledColumnCard";
import withColumnData from "./withColumnData";

const ColumnTick = (props) => (
  <StyledColumnCard
    isHovered={props.isHovered}
    isDragging={props.isDragging}
    isDropTarget={props.isDropTarget}
    isSelected={props.isSelected}
    isOver={props.isOver}
    isLoading={props.isLoading}
    isFocused={props.isFocused}
    isDraggable={props.isDraggable}
    isNull={props.isNull}
    isError={props.error}
    onMouseEnter={props.hoverColumn}
    onMouseLeave={props.unhoverColumn}
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
