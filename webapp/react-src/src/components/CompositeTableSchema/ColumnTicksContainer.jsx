import { getColumnIdsByTableId } from "../../data/selectors";
import { ColumnContainer } from "../Containers";
import { useSelector } from "react-redux";

const nbsp = "\u00A0";

export default function ColumnTicksContainer({ tableId, ticksCount }) {
  const columnIds = useSelector((state) =>
    getColumnIdsByTableId(state, tableId)
  );
  const ticks = Array.from({ length: ticksCount }, (_, i) =>
    i < columnIds.length ? columnIds[i] : null
  );
  console.log("ticks", ticksCount);

  return (
    <>
      {ticks.map((id, i) => (
        <ColumnContainer key={`${i}-${id}`} id={id}>
          <span>{nbsp}</span>
        </ColumnContainer>
      ))}
    </>
  );
}
