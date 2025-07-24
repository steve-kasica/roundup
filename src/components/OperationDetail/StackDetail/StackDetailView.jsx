import { scaleBand } from "d3";
import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";

import ColumnIndex from "./ColumnIndex";
import StackDetailToolbar from "./StackDetailToolbar";
import { getValuesInRange, getIndexOfValue } from "./selectionUtils";
import withStackOperationData from "./withStackOperationData";

import "./StackDetail.scss";
import { useState } from "react";
import { setSelectedColumns } from "../../../slices/columnsSlice";
import { useRef } from "react";
import { selectTablesById } from "../../../slices/tablesSlice/tableSelectors";
import TableView from "./TableView";
import { Box, Typography } from "@mui/material";

const yAxisLabel = "table name";
const xAxisLabel = "column index";
const cellSize = 50; // height and width of cells (in pixels)

function StackDetailView({
  tableIds,
  columnIdMatrix,
  m,
  n,
  columnNames,
  renameOperationColumn,
}) {
  const dispatch = useDispatch(); // TODO: remove redux from View

  const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
  // TODO is this necessary?
  const [selectionExtentCell, setSelectionExtentCell] = useState(null);

  const tables = useSelector((state) =>
    tableIds.map((tableId) => selectTablesById(state, tableId))
  );

  const width = m * cellSize;
  const xScale = scaleBand(
    Array.from({ length: m }, (_, i) => i),
    [0, width]
  );

  // Use a ref to track the grid container
  const gridContainerRef = useRef();

  // useEffect(() => {
  //   const gridContainer = gridContainerRef.current;
  //   const columnElements = gridContainer.querySelectorAll(".ColumnIndex");

  // TODO: sync visable columns with the store
  //   // Create an IntersectionObserver
  //   const observer = new IntersectionObserver(
  //     (entries) => {
  //       entries.forEach((entry) => {
  //         const columnIds = entry.target
  //           .getAttribute("data-columnids")
  //           .split(",");
  //         const isVisible = entry.isIntersecting;
  //         if (isVisible) {
  //           dispatch(addToOpsDetailVisableColumns(columnIds));
  //         } else {
  //           dispatch(removeFromOpsDetailVisableColumns(columnIds));
  //         }
  //       });
  //     },
  //     {
  //       root: gridContainer,
  //       threshold: 0.1, // Trigger when 10% of the element is visible
  //     }
  //   );

  //   columnElements.forEach((columnElement) => {
  //     observer.observe(columnElement);
  //   });
  //   return () => observer.disconnect();
  // }, [dispatch]);

  return (
    <div>
      <StackDetailToolbar
        selectionAnchorCell={selectionAnchorCell}
        setSelectionAnchorCell={setSelectionAnchorCell}
        setSelectionExtentCell={setSelectionExtentCell}
      />
      <div className="StackDetail">
        <div className="left-panel">
          <div className="label" style={{ textAlign: "center" }}>
            <span>{yAxisLabel}</span>
          </div>
          <div
            className="column-group"
            style={{
              display: "grid",
              gridTemplateRows: `repeat(${tableIds.length + 1}, 1fr)`,
              gap: "0.25rem", // Match the margin from ColumnView Papers
              alignItems: "center",
            }}
          >
            {/* Add spacer to account for x-axis header */}
            <div style={{ height: "2rem" }}></div>{" "}
            {/* Match the height of Typography variant="subtitle1" */}
            {tableIds.map((tableId) => (
              <TableView key={tableId} id={tableId} />
            ))}
          </div>
        </div>
        <div className="right-panel">
          <Box style={{ textAlign: "center" }}>
            <Typography variant="subtitle1">{xAxisLabel}</Typography>
          </Box>
          <div ref={gridContainerRef} className="grid-container">
            {xScale.domain().map((j) => (
              <ColumnIndex
                key={j}
                index={j}
                columnIds={columnIdMatrix.map((row) => row[j])}
                columnName={columnNames[j]}
                tableIds={tables.map(({ id }) => id)}
                onCellClick={onCellClick}
                onColumnClick={onColumnClick}
                onHeaderChange={renameOperationColumn}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  function onColumnClick(event, index, afterIndex = false) {
    if (event.shiftKey && selectionAnchorCell !== null) {
      // Shift+Click: select range from anchor to extent
      const anchorIndex = selectionAnchorCell;
      const extentIndex = [n, index];
      dispatch(
        setSelectedColumns(
          getValuesInRange(columnIdMatrix, anchorIndex, extentIndex)
        )
      );
    } else if (afterIndex) {
      // Click after a column: select range from anchor to this column
      const anchorIndex = [0, index];
      const extentIndex = [n, m];
      dispatch(
        setSelectedColumns(
          getValuesInRange(columnIdMatrix, anchorIndex, extentIndex)
        )
      );
      setSelectionExtentCell(extentIndex);
      setSelectionAnchorCell(anchorIndex);
    } else {
      // Single click: select only this column, also handles initial shift clicks
      const anchorIndex = [0, index];
      const extentIndex = [n, index];
      dispatch(
        setSelectedColumns(
          getValuesInRange(columnIdMatrix, anchorIndex, extentIndex)
        )
      );
      setSelectionExtentCell(extentIndex);
      setSelectionAnchorCell(anchorIndex);
    }
  }

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

StackDetailView.propTypes = {
  tableIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  columnIdMatrix: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
  m: PropTypes.number.isRequired,
  n: PropTypes.number.isRequired,
  columnNames: PropTypes.arrayOf(PropTypes.string).isRequired,
};

const StackDetailViewWithData = withStackOperationData(StackDetailView);
export default StackDetailViewWithData;
