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
    selectedColumnIndices,
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
        const currentPosition = getIndexOfValue(columnIdMatrix, columnId);
        if (!currentPosition) return; // Column not found in matrix

        const [currentRow] = currentPosition;
        let anchorPosition, extentPosition;

        if (event.shiftKey && selectionAnchorCell) {
          // Shift+Click: select range from anchor to extent, but only within the same table (row)
          const [anchorRow] = selectionAnchorCell;

          // Only allow shift selection within the same row (same table)
          if (anchorRow === currentRow) {
            anchorPosition = selectionAnchorCell;
            extentPosition = currentPosition;
            selectColumns(
              getValuesInRange(columnIdMatrix, anchorPosition, extentPosition)
            );
          } else {
            // Different row/table: treat as single click
            anchorPosition = currentPosition;
            extentPosition = currentPosition;
            selectColumns(columnId);
          }
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: not allowed for cross-table selection
          // Treat as single click instead
          anchorPosition = currentPosition;
          extentPosition = currentPosition;
          selectColumns(columnId);
        } else {
          // Single click: select only this column, also handles initial shift clicks
          anchorPosition = currentPosition;
          extentPosition = currentPosition;
          selectColumns(columnId);
        }
        setSelectionExtentCell(extentPosition);
        setSelectionAnchorCell(anchorPosition);
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
        const isLastTable = rowIndex === columnIdMatrix.length - 1;

        if (event.shiftKey && selectionAnchorCell !== null) {
          // Special case: if shift-clicking on the last table, select all columns
          if (isLastTable) {
            const allColumns = columnIdMatrix.flat();
            selectColumns(allColumns);
            setSelectionAnchorCell(rowIndex);
            setSelectionExtentCell(rowIndex);
          } else {
            // For other tables, treat shift-click as single click (no cross-table selection)
            selectColumns(currentRowGroup);
            setSelectionAnchorCell(rowIndex);
            setSelectionExtentCell(rowIndex);
          }
        } else if (event.metaKey || event.ctrlKey) {
          // For all tables, treat ctrl/cmd-click as single click (no cross-table selection)
          selectColumns(currentRowGroup);
          setSelectionAnchorCell(rowIndex);
          setSelectionExtentCell(rowIndex);
        } else {
          // Single click: select only this row group for all tables
          selectColumns(currentRowGroup);
          setSelectionAnchorCell(rowIndex);
          setSelectionExtentCell(rowIndex);
        }
      },
      [columnIdMatrix, selectionAnchorCell, selectColumns]
    );

    const onColumnLabelClick = useCallback(
      (event, colIndex) => {
        const currentColumnGroup = columnIdMatrix.map((row) => row[colIndex]);

        if (event.shiftKey && selectionAnchorCell !== null) {
          // // Shift+Click: select range of column groups from anchor to extent
          // const anchorIndex = selectionAnchorCell;
          // const extentIndex = colIndex;
          // const startIndex = Math.min(anchorIndex, extentIndex);
          // const endIndex = Math.max(anchorIndex, extentIndex);
          // // Collect all columns in the range of column groups
          // const rangeColumns = [];
          // for (let i = startIndex; i <= endIndex; i++) {
          //   rangeColumns.push(...columnIdMatrix.map((row) => row[i]));
          // }
          // selectColumns(rangeColumns);
          // setSelectionExtentCell(extentIndex);
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection of this column group
          // const currentlySelectedColumns = selectedColumns || [];
          // const isGroupSelected = currentColumnGroup.every((colId) =>
          //   currentlySelectedColumns.includes(colId)
          // );
          // if (isGroupSelected) {
          //   // Remove this column group from selection
          //   const newSelection = currentlySelectedColumns.filter(
          //     (colId) => !currentColumnGroup.includes(colId)
          //   );
          //   selectColumns(newSelection);
          // } else {
          //   // Add this column group to selection
          //   const newSelection = [
          //     ...new Set([...currentlySelectedColumns, ...currentColumnGroup]),
          //   ];
          //   selectColumns(newSelection);
          // }
          // setSelectionAnchorCell(colIndex);
          // setSelectionExtentCell(colIndex);
        } else {
          // Single click: select only this column group, also handles initial shift clicks
          selectColumns(operation.columnIds[colIndex]);
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
                padding: "2px", // This has to mach outline thickness in ColumnSummary
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
              <Box
                selectedColumns={selectedColumns} // Pass selected columns
                columnIdMatrix={columnIdMatrix} // Pass the matrix
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-evenly",
                  padding: "2px", // Has to match border thickness in ColumnSummary
                  gap: 1,
                  flex: 1,
                  overflow: "hidden",
                  transition: "all 0.2s ease-in-out", // Follows ColumnSummary.jsx
                  ...(selectedColumnIndices.includes(colIndex) && {
                    backgroundColor: "rgba(0, 0, 0, 0.1)",
                    outline: "2px solid blue", // This has to match padding above
                    outlineColor: "#1976d2",
                    borderRadius: "4px",
                  }),
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
                      onDrop={(draggedItem, targetItem) =>
                        swapColumns(targetItem.id, draggedItem.id)
                      }
                    >
                      <EnhancedColumnSummary
                        id={columnId}
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
