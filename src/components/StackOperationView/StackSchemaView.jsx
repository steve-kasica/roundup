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

        const [currentRow] = currentPosition;

        if (event.shiftKey && selectionAnchorCell) {
          // Shift+Click: select range from anchor to extent, but only within the same table (row)
          const [anchorRow] = selectionAnchorCell;

          // Only allow shift selection within the same row (same table)
          if (anchorRow === currentRow) {
            const rangeColumnIds = getValuesInRange(
              columnIdMatrix,
              selectionAnchorCell,
              currentPosition
            ).filter((id) => id !== null);

            setSelectedTableColumnIds(rangeColumnIds);
          } else {
            // Different row/table: treat as single click
            setSelectedTableColumnIds([columnId]);
          }
        } else if (event.metaKey || event.ctrlKey) {
          // Ctrl/Meta+Click: toggle selection of this table column
          setSelectedTableColumnIds((prev) => {
            if (prev.includes(columnId)) {
              // Remove from selection (unselect)
              return prev.filter((id) => id !== columnId);
            } else {
              // Add to selection (select)
              return [...prev, columnId];
            }
          });
        } else {
          // Single click: select only this column from columnIdMatrix
          setSelectedTableColumnIds([columnId]);
        }

        setSelectionAnchorCell(currentPosition);
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
        let columnIdsToSelect, columnIdsToUnselect;

        // Single click: select only this row group for all tables
        columnIdsToSelect = columnIdMatrix[rowIndex];
        columnIdsToUnselect = [
          ...columnIdMatrix.filter((_, i) => i !== rowIndex).flat(),
          // ...selectedTableColumnIds,
        ];
        setSelectionAnchorCell(rowIndex);

        selectColumns(columnIdsToSelect, columnIdsToUnselect);
      },
      [columnIdMatrix, selectColumns]
    );

    const onColumnLabelClick = useCallback(
      (event, colIndex) => {
        let columnIdsToSelect, columnIdsToUnselect;
        if (event.shiftKey && selectionAnchorCell !== null) {
          // Shift+Click: select range of operation column indices from anchor to extent
          const anchorIndex = selectionAnchorCell;
          const extentIndex = colIndex;
          const startIndex = Math.min(anchorIndex, extentIndex);
          const endIndex = Math.max(anchorIndex, extentIndex);

          columnIdsToSelect = activeColumnIds.slice(startIndex, endIndex + 1);
          // .filter((id) => selectedTableColumnIds.indexOf(id) === -1); // Only select new columns
          columnIdsToUnselect = activeColumnIds.filter(
            (_, i) => i < startIndex || i > endIndex
          );
        } else if (event.metaKey || event.ctrlKey) {
          // Cmd/Ctrl+Click: toggle selection of this operation column
          // if (selectedTableColumnIds.includes(activeColumnIds[colIndex])) {
          //   columnIdsToSelect = []; // Don't select any new columns
          //   columnIdsToUnselect = [activeColumnIds[colIndex]];
          // } else {
          //   columnIdsToSelect = [activeColumnIds[colIndex]];
          //   columnIdsToUnselect = [];
          // }

          setSelectionAnchorCell(colIndex);
        } else {
          // Single click: select only this column group, also handles initial shift clicks
          // if (selectedTableColumnIds.includes(activeColumnIds[colIndex])) {
          //   columnIdsToSelect = []; // Don't select any new columns
          //   columnIdsToUnselect = selectedTableColumnIds.filter(
          //     (id) => id !== activeColumnIds[colIndex]
          //   );
          //   setSelectionAnchorCell(colIndex);
          // } else {
          //   columnIdsToSelect = [activeColumnIds[colIndex]];
          //   columnIdsToUnselect = [
          //     ...selectedTableColumnIds,
          //     ...columnIdMatrix.flat(), // if clicking for table column selection to opeation column selection
          //   ];
          // }

          setSelectionAnchorCell(colIndex);
        }

        selectColumns(columnIdsToSelect, columnIdsToUnselect);
      },
      [selectionAnchorCell, selectColumns, activeColumnIds, columnIdMatrix]
    );

    return (
      <Box display={"flex"} flexDirection="column" height="100%">
        <SchemaToolbar
          name={operation.name}
          rowCount={operation.rowCount}
          columnCount={activeColumnIds.length}
          columnIds={columnIdMatrix.flat()}
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
