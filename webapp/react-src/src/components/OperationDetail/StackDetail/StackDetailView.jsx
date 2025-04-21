import { scaleBand } from "d3";
import { useDispatch, useSelector } from "react-redux";
import {
  hoverTable,
  hoverColumnIndex,
  unhoverTable,
  unhoverColumnIndex,
} from "../../../data/uiSlice";
import { getChildrenData } from "../../../data/selectors";
import { isSourceTable } from "../../../data/slices/sourceTablesSlice";
import ColumnContainer, { COLUMN_LAYOUT_BLOCK } from "../../ColumnContainer";

import "./StackDetail.scss";

const yAxisLabel = "table name";
const xAxisLabel = "column index";
const cellSize = 50; // height and width of cells (in pixels)

export default function StackDetailView({
  id,
  parentId,
  operationType,
  children,
  depth,
  columnCount,
  isFocused,
}) {
  const dispatch = useDispatch();
  const width = columnCount * cellSize;
  const xScale = scaleBand(
    Array.from({ length: columnCount }, (_, i) => i),
    [0, width]
  );
  const childrenData = useSelector((state) => getChildrenData(state, children));
  return (
    <div className="StackDetail">
      <div className="left-panel">
        <div className="label">
          <span>{yAxisLabel}</span>
        </div>
        <div className="ticks">
          {children.map((child) => (
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
                onMouseEnter={() => dispatch(hoverColumnIndex(j))}
                onMouseLeave={() => dispatch(unhoverColumnIndex())}
              >
                <label>{j + 1}</label>
              </div>
              {childrenData.map((childData) => {
                if (isSourceTable(childData)) {
                  return (
                    <ColumnContainer
                      key={`${childData.id}-${j}`}
                      tableId={childData.id}
                      index={j}
                      layout={COLUMN_LAYOUT_BLOCK}
                    />
                  );
                } else {
                  // child is an operation
                }
              })}
            </form>
          ))}
        </div>
      </div>
    </div>
  );
}
