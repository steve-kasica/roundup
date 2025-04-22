import { memo } from "react";
import { getColumnIdsByTableId } from "../../data/selectors";
import { ColumnContainer } from "../Containers";
import { useSelector } from "react-redux";

const nbsp = "\u00A0";

const ColumnTicksContainer = memo(function ColumnTicksContainer({
  tableId,
  ticksCount,
}) {
  const columnIds = useSelector((state) =>
    getColumnIdsByTableId(state, tableId)
  );
  console.log("columnIds", columnIds);
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
