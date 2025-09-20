/* eslint-disable react/prop-types */
import { useCallback, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { Box } from "@mui/material";
import ColumnHeader from "../ColumnViews/ColumnHeader";
import ColumnValuesSample from "../ColumnViews/ColumnValuesSample";
import {
  getValuesInRange,
  getIndexOfValue,
} from "./selectionUtils/selectionUtils";
import TableLabel from "../TableView/TableLabel";
import { ColumnCard } from "../ColumnViews";

const topRowHeight = 50; // Fixed height for the top row (column headers)

const StackSchemaView = withStackOperationData(
  ({
    operation,
    columnIdMatrix,
    m,
    selectColumns,
    selectedColumns,
    swapColumns,
  }) => {
    const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
    // TODO is this necessary?
    const [selectionExtentCell, setSelectionExtentCell] = useState(null);

    const onCellClick = useCallback(
      (event, columnId) => {
        let anchorIndex, extentIndex;
        if (event.shiftKey && selectionAnchorCell) {
          // Shift+Click: select range from anchor to extent
          extentIndex = getIndexOfValue(columnIdMatrix, columnId);
          anchorIndex = selectionAnchorCell;
          selectColumns(
            getValuesInRange(columnIdMatrix, anchorIndex, extentIndex)
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
          selectColumns(columnId);
        }
        setSelectionExtentCell(extentIndex);
        setSelectionAnchorCell(anchorIndex);
      },
      [columnIdMatrix, selectionAnchorCell, selectColumns]
    );

    const onRowLabelClick = useCallback(
      (event, rowIndex) => {
        let anchorIndex, extentIndex;
        if (event.shiftKey && selectionAnchorCell !== null) {
          // Shift+Click: select range from anchor to extent
          extentIndex = rowIndex;
          anchorIndex = selectionAnchorCell;
          selectColumns(
            getValuesInRange(columnIdMatrix, anchorIndex, extentIndex)
          );
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection
          //   selectColumns(columnId);
        } else {
          // Single click: select only this column, also handles initial shift clicks
          selectColumns(columnIdMatrix[rowIndex]);
        }
        setSelectionExtentCell(extentIndex);
        setSelectionAnchorCell(anchorIndex);
      },
      [columnIdMatrix, selectionAnchorCell, selectColumns]
    );

    const onColumnLabelClick = useCallback(
      (event, colIndex) => {
        let anchorIndex, extentIndex;
        if (event.shiftKey && selectionAnchorCell !== null) {
          // Shift+Click: select range from anchor to extent
          extentIndex = colIndex;
          anchorIndex = selectionAnchorCell;
          // selectColumns(getValuesInRange(columnIds, anchorIndex, extentIndex));
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection
          //   selectColumns(columnId);
        } else {
          // Single click: select only this column, also handles initial shift clicks
          selectColumns(columnIdMatrix.map((row) => [row[colIndex]]).flat());
        }
        setSelectionExtentCell(extentIndex);
        setSelectionAnchorCell(anchorIndex);
      },
      [selectionAnchorCell, selectColumns, columnIdMatrix]
    );

    return (
      <Box
        className="stack-schema-view"
        sx={{
          height: "100%",
          overflow: "hidden", // Prevent scrolling on the main container
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "100%", // Take full height of parent
            gap: "4px",
            overflow: "hidden", // Prevent overflow
          }}
        >
          {/* Left Column - Row Labels */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              width: `${topRowHeight}px`,
              flexShrink: 0,
              height: "100%", // Take full height
              overflow: "hidden", // Prevent overflow
            }}
          >
            {/* Empty space for top-left corner */}
            <Box
              sx={{
                height: `${topRowHeight}px`,
                flexShrink: 0,
              }}
            ></Box>
            {/* Row labels container with scroll */}
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-evenly",
                gap: "4px",
                flex: 1,
                overflowY: "auto", // Allow scrolling for row labels if needed
              }}
            >
              {operation.children.map((childId, rowIndex) => (
                <Box
                  key={childId}
                  sx={{
                    fontWeight: "bold",
                    border: "1px solid #fff",
                    display: "flex",
                    alignItems: "center",
                    height: "100%", // Match column card height
                    cursor: "pointer",
                  }}
                >
                  <TableLabel
                    id={childId}
                    onClick={(event) => onRowLabelClick(event, rowIndex)}
                  />
                </Box>
              ))}
            </Box>
          </Box>

          {/* Data Columns Container - Takes remaining space */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flex: 1,
              gap: "4px",
              height: "100%", // Take full height
              overflow: "hidden", // Prevent overflow on container
            }}
          >
            {Array.from({ length: m }).map((_, colIndex) => (
              <Box
                key={colIndex}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  flex: 1,
                  height: "100%", // Take full height
                  overflow: "hidden", // Prevent overflow
                }}
              >
                {/* Column Header */}
                <Box
                  sx={{
                    fontWeight: "bold",
                    display: "flex",
                    height: `${topRowHeight}px`,
                    flexShrink: 0,
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={(e) => onColumnLabelClick(e, colIndex)}
                >
                  {colIndex + 1}
                </Box>
                {/* Column Cards Container with scroll */}
                <Box
                  selectedColumns={selectedColumns} // Pass selected columns
                  columnIdMatrix={columnIdMatrix} // Pass the matrix
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    gap: "4px",
                    flex: 1,
                    overflowY: "auto",
                    padding: "0 2px",
                  }}
                >
                  {columnIdMatrix.map((row) => {
                    return (
                      <ColumnCard
                        key={row[colIndex]}
                        id={row[colIndex]}
                        onClick={(e) => onCellClick(e, row[colIndex])}
                        onDrop={(draggedColumn, droppedColumn) => {
                          swapColumns(draggedColumn.id, droppedColumn.id);
                        }}
                        sx={{ height: "100%" }}
                      >
                        <ColumnHeader id={row[colIndex]} />
                        <ColumnValuesSample id={row[colIndex]} />
                      </ColumnCard>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    );
  }
);

export default StackSchemaView;
