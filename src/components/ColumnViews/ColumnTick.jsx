/* eslint-disable react/prop-types */
import withColumnData from "./withColumnData";

function ColumnTick({
  isNull,
  isSelected,
  isLoading,
  isHovered,
  isDragging,
  isOver,
  error,
}) {
  const className = [
    "ColumnTick",
    isNull ? "null" : undefined,
    isSelected ? "selected" : undefined,
    isLoading ? "loading" : undefined,
    isHovered ? "hover" : undefined,
    isDragging ? "dragged" : undefined,
    isOver ? "over" : undefined,
    error ? "error" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  return <div className={className}></div>;
}

const EnhancedColumnTick = withColumnData(ColumnTick);
export { ColumnTick, EnhancedColumnTick };
