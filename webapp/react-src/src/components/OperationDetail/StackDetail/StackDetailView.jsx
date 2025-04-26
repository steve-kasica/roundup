import { scaleBand } from "d3";
import { useDispatch, useSelector } from "react-redux";
import {
  setHoverTableId,
  unsetHoverTableId,
  clearSelectedColumnIds,
  selectSelectedColumnIds,
} from "../../../data/slices/uiSlice";
import {
  getOperationColumnIds,
  getTablesByOperationId,
} from "../../../data/selectors";

import ColumnIndex from "./ColumnIndex";
import StackDetailToolbar from "./StackDetailToolbar";

import "./StackDetail.scss";

const yAxisLabel = "table name";
const xAxisLabel = "column index";
const cellSize = 50; // height and width of cells (in pixels)

export default function StackDetailView({ id }) {
  const dispatch = useDispatch();

  const tables = useSelector((state) => getTablesByOperationId(state, id));
  const columnIdsByTable = useSelector((state) =>
    getOperationColumnIds(state, id)
  );

  const maxColumnCount = Math.max(...columnIdsByTable.map((c) => c.length));
  const width = maxColumnCount * cellSize;
  const xScale = scaleBand(
    Array.from({ length: maxColumnCount }, (_, i) => i),
    [0, width]
  );

  return (
    <div>
      <StackDetailToolbar />
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
                onMouseEnter={() => dispatch(setHoverTableId(child.id))}
                onMouseLeave={() => dispatch(unsetHoverTableId())}
              >
                {child.name}
              </div>
            ))}
          </div>
        </div>
        <div className="right-panel">
          <div className="x-axis label">{xAxisLabel}</div>
          <div className="grid-container">
            {xScale.domain().map((j) => (
              <ColumnIndex
                key={j}
                jIndex={j}
                tableIds={tables.map(({ id }) => id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
