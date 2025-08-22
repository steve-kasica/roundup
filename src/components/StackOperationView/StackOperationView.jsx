// import HighLevelView from "./HighLevelView";
// import LowLevelView from "./LowLevelView";
import withStackOperationData from "./withStackOperationData";
import Toolbar from "./Toolbar";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useRef, useState } from "react";
import { selectTablesById } from "../../slices/tablesSlice";
import { scaleBand } from "d3";
import { setSelectedColumns } from "../../slices/columnsSlice";
import {
  getValuesInRange,
  getIndexOfValue,
} from "./selectionUtils/selectionUtils";
import { Box, Typography } from "@mui/material";
import { ColumnIndex } from "./ColumnIndex";
import TableView from "./TableView";
import HighLevelView from "./HighLevelView";
import LowLevelView from "./LowLevelView";

const yAxisLabel = "table name";
const xAxisLabel = "column index";
const cellSize = 50; // height and width of cells (in pixels)

function StackOperationView(props) {
  const dispatch = useDispatch(); // TODO: remove redux from View
  const {
    resolution,
    childIds,
    m,
    n,
    columnIdMatrix,
    columnIds,
    renameOperationColumn,
  } = props;

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

  const onColumnClick = useCallback(
    (event, index, afterIndex = false) => {
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
    },
    [dispatch, columnIdMatrix, selectionAnchorCell]
  );

  const onCellClick = useCallback((event, columnId) => {
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
  });

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

  // Use a ref to track the grid container
  const gridContainerRef = useRef();
  return (
    <>
      <Toolbar
        setSelectionAnchorCell={setSelectionAnchorCell}
        setSelectionExtentCell={setSelectionExtentCell}
      />
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          border: "1px solid #aaa",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minWidth: "80px",
            borderRight: "1px solid #aaa",
            background: "#eee",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "right",
              background: "#eee",
              marginTop: "56px", // manually adjust until labels look centered
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
            {childIds.map((childId) => (
              <TableView key={childId} id={childId} />
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            flexBasis: 0,
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflowX: "auto",
          }}
        >
          <Box
            sx={{
              height: "25px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 500,
              fontSize: "1rem",
              color: "#555",
              textTransform: "uppercase",
              borderBottom: "1px solid #aaa",
              background: "#f9f9f9",
            }}
          >
            <Typography variant="subtitle1">{xAxisLabel}</Typography>
          </Box>
          <Box
            ref={gridContainerRef}
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "nowrap",
              overflowX: "auto",
              height: "100%",
              backgroundColor: "#ddd",
              padding: "10px",
              borderLeft: "1px solid #aaa",
              borderRight: "1px solid #aaa",
            }}
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
              >
                {resolution === "high" ? (
                  <HighLevelView
                    columnIds={columnIdMatrix.map((row) => row[j]).flat()}
                    tableIds={childIds}
                    onCellClick={onCellClick}
                  />
                ) : resolution === "low" ? (
                  <LowLevelView
                    columnIds={columnIdMatrix.map((row) => row[j]).flat()}
                    tableIds={childIds}
                    onCellClick={onCellClick}
                  />
                ) : null}
              </ColumnIndex>
            ))}
          </Box>
        </Box>
      </Box>
    </>
  );
}

const EnhancedStackOperationView = withStackOperationData(StackOperationView);

export default EnhancedStackOperationView;
