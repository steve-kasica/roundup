import { scaleBand } from "d3";
import { useDispatch, useSelector } from "react-redux";
import {
  hoverTable,
  unhoverTable,
  setHoverColumnIndex,
  unsetHoverColumnIndex,
} from "../../../data/uiSlice";
import {
  getOperationColumnIds,
  getTablesByOperationId,
} from "../../../data/selectors";
import { ColumnContainer } from "../../Containers";
import ColumnBlockView from "./ColumnBlockView";

import "./StackDetail.scss";

const yAxisLabel = "table name";
const xAxisLabel = "column index";
const cellSize = 50; // height and width of cells (in pixels)

function transposeAndBackfill(matrix) {
  const maxLength = Math.max(...matrix.map((row) => row.length));

  const transposed = [];

  for (let col = 0; col < maxLength; col++) {
    const newRow = matrix.map((row) =>
      row[col] !== undefined ? row[col] : null
    );
    transposed.push(newRow);
  }

  return transposed;
}

export default function StackDetailView({ id }) {
  const dispatch = useDispatch();

  const tables = useSelector((state) => getTablesByOperationId(state, id));
  const columnIdsByTable = useSelector((state) =>
    getOperationColumnIds(state, id)
  );
  const columnIdsByIndex = transposeAndBackfill(columnIdsByTable);

  const maxColumnCount = Math.max(...columnIdsByTable.map((c) => c.length));
  const width = maxColumnCount * cellSize;
  const xScale = scaleBand(
    Array.from({ length: maxColumnCount }, (_, i) => i),
    [0, width]
  );

  return (
    <div className="StackDetail">
      <div className="left-panel">
        <div className="label">
          <span>{yAxisLabel}</span>
        </div>
        <div className="ticks">
          {tables.map((child) => (
            // TODO: what if child is an operation?
            <div
              key={child.id}
              className="tick"
              onMouseEnter={() => dispatch(hoverTable(child.id))}
              onMouseLeave={() => dispatch(unhoverTable())}
            >
              {child.id}
            </div>
          ))}
        </div>
      </div>
      <div className="right-panel">
        <div className="x-axis label">{xAxisLabel}</div>
        <div className="grid-container">
          {xScale.domain().map((j) => (
            <form key={`index-${j}`}>
              <div
                className="index-label"
                onMouseEnter={() => dispatch(setHoverColumnIndex(j))}
                onMouseLeave={() => dispatch(unsetHoverColumnIndex())}
              >
                <label>{j + 1}</label>
              </div>
              {columnIdsByIndex[j].map((columnId, i) => (
                <ColumnContainer
                  key={columnId}
                  id={columnId}
                  index={j}
                  tableId={tables[i].id}
                >
                  <ColumnBlockView />
                </ColumnContainer>
              ))}
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
