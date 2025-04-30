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
        <ColumnContainer key={`${i}-${id}`} id={id} index={i} tableId={tableId}>
          <ColumnTickView />
        </ColumnContainer>
      ))}
    </>
  );
});

/* This component only re-render upon data changes to Column instance
 * passed from ColumnContainer.
 * The nbsp; HTML entity is necessary in order to define width of the div,
 * no matter what percentage that width actually is.
 */
const ColumnTickView = memo(
  function ColumnView() {
    const nbsp = "\u00A0"; // Non-breaking space
    return <span>{nbsp}</span>;
  },
  (prevProps, nextProps) => prevProps.id === nextProps.id
);

export default ColumnTicksContainer;
