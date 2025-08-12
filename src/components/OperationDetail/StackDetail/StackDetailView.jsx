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
  childIds,
  columnIdMatrix,
  m,
  n,
  columnIds,
  renameOperationColumn,
}) {
  const dispatch = useDispatch(); // TODO: remove redux from View

  const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
  // TODO is this necessary?
  const [selectionExtentCell, setSelectionExtentCell] = useState(null);

  const tables = useSelector((state) =>
    childIds.map((childId) => selectTablesById(state, childId))
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
          <Box
            sx={{
              marginTop: `${69}px`,
              marginLeft: "20px",
              position: "relative",
              "&::before": {
                content: `"${yAxisLabel}"`,
                position: "absolute",
                left: "-50px",
                top: "50%",
                transform: "translateY(-50%) rotate(-90deg)",
                transformOrigin: "center",
                fontSize: "0.75rem",
                fontFamily: "inherit",
                fontWeight: 400,
                color: "#555",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
                opacity: 0.8,
                userSelect: "none",
                pointerEvents: "none",
              },
            }}
          >
            <Box>
              {childIds.map((childId) => (
                <TableView key={childId} id={childId} />
              ))}
            </Box>
          </Box>
        </div>
        <div className="right-panel">
          <Box style={{ textAlign: "center" }}>
            <Typography variant="subtitle1">{xAxisLabel}</Typography>
          </Box>
          <div
            ref={gridContainerRef}
            className="grid-container"
            style={{ backgroundColor: "#ddd", padding: "10px" }}
          >
            {xScale.domain().map((j) => (
              <ColumnIndex
                key={j}
                index={j}
                columnIds={columnIdMatrix.map((row) => row[j])}
                headerId={columnIds[j]}
                childIds={tables.map(({ id }) => id)}
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
  childIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  columnIdMatrix: PropTypes.arrayOf(
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, PropTypes.number]))
  ).isRequired,
  m: PropTypes.number.isRequired,
  n: PropTypes.number.isRequired,
};

const StackDetailViewWithData = withStackOperationData(StackDetailView);
export default StackDetailViewWithData;
