import { memo } from "react";
import { selectColumnIdsByTableId } from "../../data/slices/columnsSlice";
import { useSelector } from "react-redux";
import withColumnData from "../HOC/withColumnData";

const ColumnTicksContainer = memo(function ColumnTicksContainer({
  tableId,
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

const EnhancedColumnTickView = withColumnData(ColumnTickView);

export default ColumnTicksContainer;
