/* eslint-disable react/prop-types */
import { useCallback, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { Box } from "@mui/material";
import {
  getValuesInRange,
  getIndexOfValue,
} from "./selectionUtils/selectionUtils";
import { TableName } from "../TableView";
import { ColumnSummary } from "../ColumnViews/ColumnSummary";

const topRowHeight = 25; // Fixed height for the top row (column headers)

const StackSchemaView = withStackOperationData(
  ({
    operation,
    columnIdMatrix,
    m,
    selectColumns,
    selectedColumns,
    focusColumns,
    swapColumns,
  }) => {
    const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
    // TODO is this necessary?
    const [selectionExtentCell, setSelectionExtentCell] = useState(null);

    // Function to determine if a columnId is selected
    const isSelected = useCallback(
      (columnId) => {
        return selectedColumns && selectedColumns.includes(columnId);
      },
      [selectedColumns]
    );

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
    const onCellDoubleClick = useCallback(
      (event, columnId) => {
        // Double-click: Focus on the column (same as focus button action)
        focusColumns([columnId]);
      },
      [focusColumns]
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
      // <Box
      //   className="stack-schema-view"
      //   sx={{
      //     height: "100%",
      //     overflow: "hidden", // Prevent scrolling on the main container
      //     display: "flex",
      //     flexDirection: "column",
      //     userSelect: "none",
      //   }}
      // >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          width: "100%",
          minHeight: "100%", // Take full height of parent when space is available
          gap: "4px",
        }}
      >
        {/* Left Column - Row Labels */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            paddingLeft: 1,
            flexShrink: 0,
            minHeight: "100%", // Take full height
          }}
        >
          {/* Empty space for top-left corner */}
          <Box
            sx={{
              height: `${topRowHeight}px`,
              flexShrink: 0,
            }}
          ></Box>
          {/* Row labels container */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              gap: 1,
              flex: 1,
            }}
          >
            {operation.children.map((childId, rowIndex) => (
              <Box
                key={childId}
                sx={{
                  fontWeight: "bold",
                  minHeight: "26px", // Adjust manually to match ColumnSummary
                  border: "1px solid #fff",
                  padding: "8px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "100%", // Match column card height
                  cursor: "pointer",
                }}
              >
                <TableName
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
            minHeight: "100%", // Take full height
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
                minWidth: "125px",
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
                  gap: 1,
                  flex: 1,
                  overflow: "hidden",
                  // minWidth: "85px",
                  padding: "2px",
                  // userSelect: "none",
                }}
              >
                {columnIdMatrix.map((row) => {
                  const columnId = row[colIndex];
                  return (
                    <ColumnSummary
                      key={columnId}
                      id={columnId}
                      isSelected={isSelected(columnId)}
                      onClick={(event) => onCellClick(event, columnId)}
                      onDoubleClick={(event) =>
                        onCellDoubleClick(event, columnId)
                      }
                    />
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
      // </Box>
    );
  }
);

export default StackSchemaView;
