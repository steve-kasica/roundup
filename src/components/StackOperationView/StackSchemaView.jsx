/* eslint-disable react/prop-types */
import { useCallback, useRef, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { Box } from "@mui/material";
import {
  getValuesInRange,
  getIndexOfValue,
} from "./selectionUtils/selectionUtils";
import { EnhancedTableLabel } from "../TableView";
import { EnhancedColumnSummary } from "../ColumnViews";
import { useDrag } from "react-dnd";
import ColumnDragContainer from "../ColumnViews/ColumnDragContainer";

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
        const currentRowGroup = columnIdMatrix[rowIndex];

        if (event.shiftKey && selectionAnchorCell !== null) {
          // Shift+Click: select range of row groups from anchor to extent
          const anchorIndex = selectionAnchorCell;
          const extentIndex = rowIndex;
          const startIndex = Math.min(anchorIndex, extentIndex);
          const endIndex = Math.max(anchorIndex, extentIndex);

          // Collect all columns in the range of row groups
          const rangeColumns = [];
          for (let i = startIndex; i <= endIndex; i++) {
            rangeColumns.push(...columnIdMatrix[i]);
          }

          selectColumns(rangeColumns);
          setSelectionExtentCell(extentIndex);
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection of this row group
          const currentlySelectedColumns = selectedColumns || [];
          const isRowGroupSelected = currentRowGroup.every((colId) =>
            currentlySelectedColumns.includes(colId)
          );

          if (isRowGroupSelected) {
            // Remove this row group from selection
            const newSelection = currentlySelectedColumns.filter(
              (colId) => !currentRowGroup.includes(colId)
            );
            selectColumns(newSelection);
          } else {
            // Add this row group to selection
            const newSelection = [
              ...new Set([...currentlySelectedColumns, ...currentRowGroup]),
            ];
            selectColumns(newSelection);
          }

          setSelectionAnchorCell(rowIndex);
          setSelectionExtentCell(rowIndex);
        } else {
          // Single click: select only this row group, also handles initial shift clicks
          selectColumns(currentRowGroup);
          setSelectionAnchorCell(rowIndex);
          setSelectionExtentCell(rowIndex);
        }
      },
      [columnIdMatrix, selectionAnchorCell, selectColumns, selectedColumns]
    );

    const onColumnLabelClick = useCallback(
      (event, colIndex) => {
        const currentColumnGroup = columnIdMatrix.map((row) => row[colIndex]);

        if (event.shiftKey && selectionAnchorCell !== null) {
          // Shift+Click: select range of column groups from anchor to extent
          const anchorIndex = selectionAnchorCell;
          const extentIndex = colIndex;
          const startIndex = Math.min(anchorIndex, extentIndex);
          const endIndex = Math.max(anchorIndex, extentIndex);

          // Collect all columns in the range of column groups
          const rangeColumns = [];
          for (let i = startIndex; i <= endIndex; i++) {
            rangeColumns.push(...columnIdMatrix.map((row) => row[i]));
          }

          selectColumns(rangeColumns);
          setSelectionExtentCell(extentIndex);
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection of this column group
          const currentlySelectedColumns = selectedColumns || [];
          const isGroupSelected = currentColumnGroup.every((colId) =>
            currentlySelectedColumns.includes(colId)
          );

          if (isGroupSelected) {
            // Remove this column group from selection
            const newSelection = currentlySelectedColumns.filter(
              (colId) => !currentColumnGroup.includes(colId)
            );
            selectColumns(newSelection);
          } else {
            // Add this column group to selection
            const newSelection = [
              ...new Set([...currentlySelectedColumns, ...currentColumnGroup]),
            ];
            selectColumns(newSelection);
          }

          setSelectionAnchorCell(colIndex);
          setSelectionExtentCell(colIndex);
        } else {
          // Single click: select only this column group, also handles initial shift clicks
          selectColumns(currentColumnGroup);
          setSelectionAnchorCell(colIndex);
          setSelectionExtentCell(colIndex);
        }
      },
      [selectionAnchorCell, selectColumns, columnIdMatrix, selectedColumns]
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
                  minHeight: "27px", // Adjust manually to match ColumnSummary
                  padding: "8px 0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  height: "100%", // Match column card height
                  cursor: "pointer",
                }}
              >
                <EnhancedTableLabel
                  id={childId}
                  onClick={(event) => onRowLabelClick(event, rowIndex)}
                  includeIcon={false}
                  includeDimensions={false}
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
            userSelect: "none",
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
                    <ColumnDragContainer
                      key={columnId}
                      id={columnId}
                      columnIndex={colIndex}
                      onDragEnd={() => {
                        console.log("Drag End");
                      }}
                      onDrop={(draggedItem, targetItem) => {
                        // Only handle swaps within the same stack operation
                        console.log("Dropped", { draggedItem, targetItem });
                      }}
                    >
                      <EnhancedColumnSummary
                        id={columnId}
                        isSelected={isSelected(columnId)}
                        onClick={(event) => onCellClick(event, columnId)}
                        onDoubleClick={(event) =>
                          onCellDoubleClick(event, columnId)
                        }
                      />
                    </ColumnDragContainer>
                  );
                })}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    );
  }
);

export default StackSchemaView;
