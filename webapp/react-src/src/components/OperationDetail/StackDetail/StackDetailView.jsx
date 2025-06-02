import { scaleBand } from "d3";
import { useDispatch, useSelector } from "react-redux";

import ColumnIndex from "./ColumnIndex";
import StackDetailToolbar from "./StackDetailToolbar";

import "./StackDetail.scss";
import { useEffect } from "react";
import {
  selectColumnIdsByTableIds,
  setColumnVisibleStatus,
} from "../../../data/slices/columnsSlice";
import { useRef } from "react";
import { selectTables } from "../../../data/slices/sourceTablesSlice/tablesSelector";
import {
  setHoveredTable,
  clearHoveredTable,
} from "../../../data/slices/uiSlice";

const yAxisLabel = "table name";
const xAxisLabel = "column index";
const cellSize = 50; // height and width of cells (in pixels)

export default function StackDetailView({ tableIds }) {
  const dispatch = useDispatch();

  const tables = useSelector(
    (state) => selectTables(state, tableIds) // Selector is memoized
  );
  const columnIdsByTable = useSelector(
    (state) => selectColumnIdsByTableIds(state, tableIds) // Selector is memoized
  );

  const maxColumnCount = Math.max(...columnIdsByTable.map((c) => c.length));
  const width = maxColumnCount * cellSize;
  const xScale = scaleBand(
    Array.from({ length: maxColumnCount }, (_, i) => i),
    [0, width]
  );

  // Use a ref to track the grid container
  const gridContainerRef = useRef();

  useEffect(() => {
    const gridContainer = gridContainerRef.current;
    const columnElements = gridContainer.querySelectorAll(".ColumnIndex");

    // Create an IntersectionObserver
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const columnIds = entry.target
            .getAttribute("data-columnids")
            .split(",");
          const isVisible = entry.isIntersecting;
          dispatch(setColumnVisibleStatus({ ids: columnIds, isVisible }));
        });
      },
      {
        root: gridContainer,
        threshold: 0.1, // Trigger when 10% of the element is visible
      }
    );

    columnElements.forEach((columnElement) => {
      observer.observe(columnElement);
    });
    return () => observer.disconnect();
  }, [dispatch]);

  return (
    <div>
      <StackDetailToolbar />
      <div className="StackDetail">
        <div className="left-panel">
          <div className="label">
            <span>{yAxisLabel}</span>
          </div>
          <div className="column-group">
            {/* TODO: not sure why `tables` has to be reversed */}
            {[...tables].reverse().map((child) => (
              // TODO: what if child is an operation?
              <div
                key={child.id}
                className="cell"
                onMouseEnter={() => dispatch(setHoveredTable(child.id))}
                onMouseLeave={() => dispatch(clearHoveredTable())}
              >
                {child.name}
              </div>
            ))}
          </div>
          <div className="column-group">
            {[...tables].reverse().map((child) => (
              <div className="cell" key={child.id}>
                {child.rowsExplored} / {child.rowCount}
              </div>
            ))}
          </div>
        </div>
        <div className="right-panel">
          <div className="x-axis label">{xAxisLabel}</div>
          <div ref={gridContainerRef} className="grid-container">
            {xScale.domain().map((j) => (
              <ColumnIndex
                key={j}
                index={j}
                tableIds={tables.map(({ id }) => id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
