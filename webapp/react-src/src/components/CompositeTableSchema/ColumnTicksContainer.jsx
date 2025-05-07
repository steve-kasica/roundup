import { memo } from "react";
import { selectColumnIdsByTableId } from "../../data/slices/columnsSlice";
import { ColumnContainer } from "../Containers";
import { useDispatch, useSelector } from "react-redux";

const ColumnTicksContainer = memo(function ColumnTicksContainer({
  tableId,
  ticksCount,
}) {
  const columnIds = useSelector((state) =>
    selectColumnIdsByTableId(state, tableId)
  );

  const ticks = Array.from({ length: ticksCount }, (_, i) =>
    i < columnIds.length ? columnIds[i] : null
  );

  return (
    <>
      {ticks.map((id, i) => (
        <ColumnContainer
          key={`${i}-${id}`}
          id={id}
          index={i}
          tableId={tableId}
          isDraggable={false}
        ></ColumnContainer>
      ))}
    </>
  );
});

export default ColumnTicksContainer;
