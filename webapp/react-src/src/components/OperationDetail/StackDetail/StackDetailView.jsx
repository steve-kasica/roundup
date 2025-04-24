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
import { Button } from "@mui/material";
import { removeColumns } from "../../../data/sagas/removeColumnsSaga";

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
  const focusedColumns = useSelector(selectSelectedColumnIds);

  const columnIdsByIndex = transposeAndBackfill(columnIdsByTable);

  const maxColumnCount = Math.max(...columnIdsByTable.map((c) => c.length));
  const width = maxColumnCount * cellSize;
  const xScale = scaleBand(
    Array.from({ length: maxColumnCount }, (_, i) => i),
    [0, width]
  );

  return (
    <div className="StackDetail">
      <Button
        disabled={focusedColumns.length === 0}
        variant="outlined"
        color="error"
        onClick={() => dispatch(clearSelectedColumnIds())}
      >
        Clear selection
      </Button>
      <Button
        disabled={focusedColumns.length === 0}
        variant="outlined"
        color="error"
        onClick={() => dispatch(removeColumns(focusedColumns))}
      >
        Remove selected columns
      </Button>
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
            <ColumnIndex key={j} jIndex={j} />
          ))}
        </div>
      </div>
    </div>
  );
}
