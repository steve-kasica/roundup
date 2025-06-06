import { scaleBand, transpose } from "d3";
import { useDispatch, useSelector } from "react-redux";

import ColumnIndex from "./ColumnIndex";
import StackDetailToolbar from "./StackDetailToolbar";
import { getValuesInRange, getIndexOfValue } from "./selectionUtils";

import "./StackDetail.scss";
import { useEffect, useState } from "react";
import {
  selectColumnIdsByTableId,
  setSelectedColumns,
} from "../../../data/slices/columnsSlice";
import { useRef } from "react";
import { selectTablesById } from "../../../data/slices/tablesSlice/tableSelectors";
import { useMemo } from "react";
import {
  setHoveredTable,
  clearHoveredTable,
  addToOpsDetailVisableColumns,
  removeFromOpsDetailVisableColumns,
} from "../../../data/slices/uiSlice";
import { isOperationId } from "../../../data/slices/operationsSlice";

const yAxisLabel = "table name";
const xAxisLabel = "column index";
const cellSize = 50; // height and width of cells (in pixels)

export default function StackDetailView({ childrenIds }) {
  const tableIds = childrenIds.filter((childId) => !isOperationId(childId)); // TODO: Make Open Roundup use internal table IDs
  const dispatch = useDispatch();

  const tables = useSelector((state) =>
    tableIds.map((tableId) => selectTablesById(state, tableId))
  );

  const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
  const [selectionExtentCell, setSelectionExtentCell] = useState(null);

  // TODO: this wouldn't be necessary if columnIds were stored in the table object
  // This is al ot just to get the max column count in a table
  const columnIdsByTable = useSelector((state) =>
    tableIds.map((id) => selectColumnIdsByTableId(state, id))
  );
  // Memoize to avoid returning a new array unless tableIds or columnIdsByTable change
  const memoizedColumnIdsByTable = useMemo(
    () => columnIdsByTable,
    [JSON.stringify(columnIdsByTable)]
  );
  const maxColumnCount = Math.max(
    ...memoizedColumnIdsByTable.map((c) => c.length)
  );
  const columnIdMatrix = memoizedColumnIdsByTable;

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
          if (isVisible) {
            dispatch(addToOpsDetailVisableColumns(columnIds));
          } else {
            dispatch(removeFromOpsDetailVisableColumns(columnIds));
          }
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
      <StackDetailToolbar
        selectionAnchorCell={selectionAnchorCell}
        setSelectionAnchorCell={setSelectionAnchorCell}
        setSelectionExtentCell={setSelectionExtentCell}
      />
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
                onCellClick={onCellClick}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function onCellClick(event, columnId) {
    let anchorIndex, extentIndex;
    if (event.shiftKey && selectionAnchorCell) {
      // Shift+Click: select range from anchor to extent
      extentIndex = getIndexOfValue(columnIdMatrix, columnId);
      anchorIndex = selectionAnchorCell;
      dispatch(
        setSelectedColumns(
          getValuesInRange(columnIdMatrix, anchorIndex, extentIndex)
        )
      );
    } else if (event.metaKey || event.ctrlKey) {
      // Cmd/Ctrl+Click: toggle selection
      // TODO: decide if we want to toggle selection
      // It kind of makes sense to just work on contiguous selections
      // in this context, so we might not need this
    } else {
      // Single click: select only this column, also handles initial shift clicks
      anchorIndex = getIndexOfValue(columnIdMatrix, columnId);
      extentIndex = anchorIndex;
      dispatch(setSelectedColumns(columnId));
    }
    setSelectionExtentCell(extentIndex);
    setSelectionAnchorCell(anchorIndex);
  }
}
