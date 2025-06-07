import { memo } from "react";
import withColumnData from "../HOC/withColumnData";
import PropTypes from "prop-types";

const ColumnTicksContainer = memo(function ColumnTicksContainer({
  columnIds,
  ticksCount,
}) {
  // TODO: verify that if a table state changes, this does not cause unnecessary re-renders
  const ticks = Array.from({ length: ticksCount }, (_, i) =>
    i < columnIds.length ? columnIds[i] : null
  );

  return (
    <>
      {ticks.map((id, i) => (
        <EnhancedColumnTickView
          key={`${i}-${id}`} // id === "null" for all empty (null) ticks
          id={id}
          isDraggable={false}
        />
      ))}
    </>
  );
});

ColumnTicksContainer.propTypes = {
  columnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  ticksCount: PropTypes.number.isRequired,
};

function ColumnTickView({
  isNull,
  isSelected,
  isLoading,
  isHovered,
  isDragging,
  isOver,
  error,
}) {
  const className = [
    "ColumnView",
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

ColumnTickView.propTypes = {
  isNull: PropTypes.bool,
  isSelected: PropTypes.bool,
  isLoading: PropTypes.bool,
  isHovered: PropTypes.bool,
  isDragging: PropTypes.bool,
  isOver: PropTypes.bool,
  error: PropTypes.any,
};

const EnhancedColumnTickView = withColumnData(ColumnTickView);

export default ColumnTicksContainer;
