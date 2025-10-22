/* eslint-disable react/prop-types */
import { useCallback, useEffect, useState } from "react";
import withStackOperationData from "./withStackOperationData";
import { Box, Typography } from "@mui/material";
import {
  getValuesInRange,
  getIndexOfValue,
} from "./selectionUtils/selectionUtils";
import { EnhancedTableLabel } from "../TableView";
import { EnhancedColumnSummary, StyledColumnCard } from "../ColumnViews";
import ColumnDragContainer from "../ColumnViews/ColumnDragContainer";
import SchemaToolbar from "../ui/SchemaToolbar";

const topRowHeight = 25; // Fixed height for the top row (column headers)

const StackSchemaView = withStackOperationData(
  ({
    operation,
    activeColumnIds,
    columnIdMatrix, // column IDs of child tables in a matrix
    m, // width of the matrix (# of columns)
    // selectedColumnIndices,
    selectColumns,
    focusColumns,
    swapColumns,
    insertColumnIntoChildAtIndex,
  }) => {
    const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
    const [selectedTableColumnIds, setSelectedTableColumnIds] = useState([]);

    // Call selectColumns whenever selectedTableColumnIds changes
    useEffect(() => {
      selectColumns(selectedTableColumnIds);
    }, [selectedTableColumnIds, selectColumns]);

    const onCellClick = useCallback(
      (event, columnId) => {
        const currentPosition = getIndexOfValue(columnIdMatrix, columnId);
        if (!currentPosition) return; // Column not found in matrix

        if (event.shiftKey && selectionAnchorCell) {
          // Shift+Click: select rectangular range from anchor to current position (like Excel/Sheets)
          const rangeColumnIds = getValuesInRange(
            columnIdMatrix,
            selectionAnchorCell,
            currentPosition
          ).filter((id) => id !== null);

          setSelectedTableColumnIds(rangeColumnIds);
          // Don't update anchor cell on shift+click - keep the original anchor
        } else if (event.metaKey || event.ctrlKey) {
          // Ctrl/Meta+Click: toggle individual cell in selection (like Excel/Sheets)
          setSelectedTableColumnIds((prev) => {
            if (prev.includes(columnId)) {
              // Remove from selection (unselect)
              return prev.filter((id) => id !== columnId);
            } else {
              // Add to selection (select)
              return [...prev, columnId];
            }
          });
          // Update anchor for next shift+click operation
          setSelectionAnchorCell(currentPosition);
        } else {
          // Single click: select only this cell (like Excel/Sheets)
          setSelectedTableColumnIds([columnId]);
          // Update anchor for next shift+click operation
          setSelectionAnchorCell(currentPosition);
        }
      },
      [columnIdMatrix, selectionAnchorCell]
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
        if (
          event.shiftKey &&
          selectionAnchorCell !== null &&
          Array.isArray(selectionAnchorCell)
        ) {
          // Shift+Click: select rectangular range from anchor row to current row (all columns in between)
          const [anchorRow] = selectionAnchorCell;
          const startRow = Math.min(anchorRow, rowIndex);
          const endRow = Math.max(anchorRow, rowIndex);

          const columnIdsToSelect = columnIdMatrix
            .slice(startRow, endRow + 1)
            .flat()
            .filter((id) => id !== null);

          setSelectedTableColumnIds(columnIdsToSelect);
          // Don't update anchor on shift+click
        } else if (event.metaKey || event.ctrlKey) {
          // Ctrl/Meta+Click: toggle all cells in this row
          const rowColumnIds = columnIdMatrix[rowIndex].filter(
            (id) => id !== null
          );

          setSelectedTableColumnIds((prev) => {
            // Check if all cells in this row are already selected
            const allRowCellsSelected = rowColumnIds.every((id) =>
              prev.includes(id)
            );

            if (allRowCellsSelected) {
              // Remove all cells from this row
              return prev.filter((id) => !rowColumnIds.includes(id));
            } else {
              // Add all cells from this row (that aren't already selected)
              const newIds = rowColumnIds.filter((id) => !prev.includes(id));
              return [...prev, ...newIds];
            }
          });
          // Update anchor for next shift+click operation
          setSelectionAnchorCell([rowIndex, 0]);
        } else {
          // Single click: select only this entire row
          const columnIdsToSelect = columnIdMatrix[rowIndex].filter(
            (id) => id !== null
          );
          setSelectedTableColumnIds(columnIdsToSelect);
          // Update anchor for next shift+click operation
          setSelectionAnchorCell([rowIndex, 0]);
        }
      },
      [columnIdMatrix, selectionAnchorCell]
    );

    const onColumnLabelClick = useCallback(
      (event, colIndex) => {
        if (
          event.shiftKey &&
          selectionAnchorCell !== null &&
          Array.isArray(selectionAnchorCell)
        ) {
          // Shift+Click: select rectangular range from anchor column to current column (all rows in between)
          const [, anchorCol] = selectionAnchorCell;
          const startCol = Math.min(anchorCol, colIndex);
          const endCol = Math.max(anchorCol, colIndex);

          const columnIdsToSelect = columnIdMatrix
            .map((row) => row.slice(startCol, endCol + 1))
            .flat()
            .filter((id) => id !== null);

          setSelectedTableColumnIds(columnIdsToSelect);
          // Don't update anchor on shift+click
        } else if (event.metaKey || event.ctrlKey) {
          // Ctrl/Meta+Click: toggle all cells in this column
          const colColumnIds = columnIdMatrix
            .map((row) => row[colIndex])
            .filter((id) => id !== null);

          setSelectedTableColumnIds((prev) => {
            // Check if all cells in this column are already selected
            const allColCellsSelected = colColumnIds.every((id) =>
              prev.includes(id)
            );

            if (allColCellsSelected) {
              // Remove all cells from this column
              return prev.filter((id) => !colColumnIds.includes(id));
            } else {
              // Add all cells from this column (that aren't already selected)
              const newIds = colColumnIds.filter((id) => !prev.includes(id));
              return [...prev, ...newIds];
            }
          });
          // Update anchor for next shift+click operation
          setSelectionAnchorCell([0, colIndex]);
        } else {
          // Single click: select only this entire column
          const columnIdsToSelect = columnIdMatrix
            .map((row) => row[colIndex])
            .filter((id) => id !== null);

          setSelectedTableColumnIds(columnIdsToSelect);
          // Update anchor for next shift+click operation
          setSelectionAnchorCell([0, colIndex]);
        }
      },
      [columnIdMatrix, selectionAnchorCell]
    );
    const onInsertColumnIntoChildTable = useCallback(
      (i, j) => {
        insertColumnIntoChildAtIndex(operation.children[i], j);
      },
      [insertColumnIntoChildAtIndex, operation.children]
    );

    return (
      <Box display={"flex"} flexDirection="column" height="100%">
        <SchemaToolbar
          columnIds={columnIdMatrix.flat()}
          columnCount={activeColumnIds.length}
          rowCount={operation.rowCount}
          name={operation.name}
          objectId={operation.id}
        />
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
              overflowX: "auto",
              overflowY: "auto",
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
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-evenly",
                    padding: "2px", // Has to match border thickness in ColumnSummary
                    gap: 1,
                    flex: 1,
                    overflow: "hidden",
                    transition: "all 0.2s ease-in-out", // Follows ColumnSummary.jsx
                    // ...(selectedColumnIndices.includes(colIndex) && {
                    //   backgroundColor: "rgba(0, 0, 0, 0.1)",
                    //   outline: "2px solid blue", // This has to match padding above
                    //   outlineColor: "#1976d2",
                    //   borderRadius: "4px",
                    // }),
                    // userSelect: "none",
                  }}
                >
                  {columnIdMatrix.map((row) => {
                    const columnId = row[colIndex];
                    if (columnId === null) {
                      return (
                        <StyledColumnCard
                          key={`empty-${colIndex}`}
                          isError={true}
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            // minHeight: "120px",
                          }}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{
                                fontWeight: "medium",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                fontSize: "0.7rem",
                              }}
                            >
                              Schema Mismatch
                            </Typography>
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                fontSize: "0.75rem",
                                lineHeight: 1.3,
                                maxWidth: "90%",
                              }}
                            >
                              Column structure
                              <br />
                              inconsistency detected
                            </Typography>
                          </Box>
                        </StyledColumnCard>
                      );
                    } else {
                      return (
                        <ColumnDragContainer
                          key={columnId}
                          id={columnId}
                          columnIndex={colIndex}
                          canDrag={selectedTableColumnIds.includes(columnId)}
                          onDrop={(draggedItem, targetItem) =>
                            swapColumns(targetItem, draggedItem)
                          }
                        >
                          <EnhancedColumnSummary
                            id={columnId}
                            onClick={(event) => onCellClick(event, columnId)}
                            onDoubleClick={(event) =>
                              onCellDoubleClick(event, columnId)
                            }
                            isDraggable={selectedTableColumnIds.includes(
                              columnId
                            )}
                            handleInsertColumnLeft={() =>
                              onInsertColumnIntoChildTable(
                                getIndexOfValue(columnIdMatrix, columnId)[0],
                                colIndex
                              )
                            }
                            handleInsertColumnRight={() =>
                              onInsertColumnIntoChildTable(
                                getIndexOfValue(columnIdMatrix, columnId)[0],
                                colIndex + 1
                              )
                            }
                          />
                        </ColumnDragContainer>
                      );
                    }
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

StackSchemaView.displayName = "StackSchemaView";

export default StackSchemaView;
