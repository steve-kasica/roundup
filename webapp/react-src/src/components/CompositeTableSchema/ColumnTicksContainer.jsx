import { memo } from "react";
import { selectColumnIdsByTableId } from "../../data/slices/columnsSlice";
import { ColumnContainer } from "../Containers";
import { useSelector } from "react-redux";

const nbsp = "\u00A0";

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
        <ColumnContainer key={`${i}-${id}`} id={id} index={i} tableId={tableId}>
          <span>{nbsp}</span>
        </ColumnContainer>
      ))}
    </>
  );
});

export default ColumnTicksContainer;
