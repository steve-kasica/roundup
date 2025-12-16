/* eslint-disable react/prop-types */
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import withStackOperationData from "../withStackOperationData";
import { Box, Typography } from "@mui/material";
import {
  getValuesInRange,
  getIndexOfValue,
} from "../selectionUtils/selectionUtils";
import { EnhancedTableLabel } from "../../TableView";
import { EnhancedColumnSummary, StyledColumnCard } from "../../ColumnViews";
import ColumnDragContainer from "../../ColumnViews/ColumnDragContainer";
import { isTableId } from "../../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../../OperationView/OperationLabel";
import { HiddenColumnsButton } from "../../ui/buttons";
import { EnhancedStackSchemaToolbar } from "../StackSchemaToolbar";
import StyledColumnsContainer from "./StyledColumnsContainer";

const topRowHeight = 25; // Fixed height for the top row (column headers)

const StackSchemaView = ({
  // Props passed via withOperationData
  childIds,
  id,
  selectedChildColumnIdsSet,
  selectColumns, // Sets global set of selected column IDs
  clearSelectedColumns, // Clears global set of selected column IDs
  focusColumns, // Sets global set of focused column IDs
  insertColumnIntoChildAtIndex,
  setVisibleColumns: setVisibleColumnsInSlice,

  // Props passed via withStackOperationData
  columnIdMatrix, // column IDs of child tables in a matrix
  m, // width of the matrix (# of columns)
  n, // height of the matrix (# of children)
  swapColumns,

  // Props passed via withAssociatedAlerts
  totalCount,
}) => {
  const [hiddenIndices, setHiddenIndices] = useState([]); // This array stores column indices that are hidden
  const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
  const columnContainerRef = useRef(null);
  const [visibleColumns, setVisibleColumns] = useState([]);

  // Sync local visible columns state to parent/slice whenver it changes
  useEffect(() => {
    setVisibleColumnsInSlice(visibleColumns);
  }, [visibleColumns, setVisibleColumnsInSlice]);

  /**
   * Set up scroll event listener on the column container
   */
  useEffect(() => {
    const container = columnContainerRef.current;

    if (!container) return;

    const handleScroll = () => {
      // Get all column elements within the container
      const columnElements = container.querySelectorAll("[data-column-id]");
      const containerRect = container.getBoundingClientRect();
      const currentlyVisibleColumnIds = [];

      columnElements.forEach((element) => {
        const elementRect = element.getBoundingClientRect();

        // Check if element is at least partially visible within the container (horizontal and vertical)
        const isVisible =
          elementRect.right > containerRect.left &&
          elementRect.left < containerRect.right &&
          elementRect.bottom > containerRect.top &&
          elementRect.top < containerRect.bottom;

        if (isVisible) {
          const columnId = element.getAttribute("data-column-id");
          currentlyVisibleColumnIds.push(columnId);
        }
      });

      if (
        JSON.stringify(currentlyVisibleColumnIds) !==
        JSON.stringify(visibleColumns)
      ) {
        setVisibleColumns(currentlyVisibleColumnIds);
      }
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [visibleColumns]);

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

        selectColumns(rangeColumnIds);
        // Don't update anchor cell on shift+click - keep the original anchor
      } else {
        // Single click: select only this cell (like Excel/Sheets)
        selectColumns([columnId]);
        // Update anchor for next shift+click operation
        setSelectionAnchorCell(currentPosition);
      }
    },
    [columnIdMatrix, selectColumns, selectionAnchorCell]
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

        selectColumns(columnIdsToSelect);
        // Don't update anchor on shift+click
      } else {
        // Single click: select only this entire row
        const columnIdsToSelect = columnIdMatrix[rowIndex].filter(
          (id) => id !== null
        );
        selectColumns(columnIdsToSelect);
        // Update anchor for next shift+click operation
        setSelectionAnchorCell([rowIndex, 0]);
      }
    },
    [columnIdMatrix, selectColumns, selectionAnchorCell]
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

        selectColumns(columnIdsToSelect);
        // Don't update anchor on shift+click
      } else {
        // Single click: select only this entire column
        const columnIdsToSelect = columnIdMatrix
          .map((row) => row[colIndex])
          .filter((id) => id !== null);

        selectColumns(columnIdsToSelect);
        // Update anchor for next shift+click operation
        setSelectionAnchorCell([0, colIndex]);
      }
    },
    [selectionAnchorCell, columnIdMatrix, selectColumns]
  );
  const onInsertColumnIntoChildTable = useCallback(
    (i, j) => {
      insertColumnIntoChildAtIndex(childIds[i], j);
    },
    [insertColumnIntoChildAtIndex, childIds]
  );

  const handleHideColumns = useCallback(() => {
    // Find all column indices where all cells are selected
    const indicesToHide = [];
    const columnIdsToDeselect = [];
    for (let colIndex = 0; colIndex < m; colIndex++) {
      const columnIds = columnIdMatrix
        .map((row) => row[colIndex])
        .filter((id) => id !== null);

      const allSelected = columnIds.every((id) =>
        selectedChildColumnIdsSet.has(id)
      );

      if (allSelected && columnIds.length > 0) {
        indicesToHide.push(colIndex);
        columnIdsToDeselect.push(...columnIds);
      }
    }

    setHiddenIndices((prev) =>
      Array.from(new Set([...prev, ...indicesToHide]))
    );
    const nextColumnSelection = [...selectedChildColumnIdsSet].filter(
      (columnId) => !columnIdsToDeselect.includes(columnId)
    );
    selectColumns(nextColumnSelection); // Remove from selection after hiding
  }, [columnIdMatrix, m, selectedChildColumnIdsSet, selectColumns]);

  return (
    <Box display={"flex"} flexDirection="column" height="100%">
      <EnhancedStackSchemaToolbar
        id={id}
        handleHideColumns={handleHideColumns}
      />
      <Box
        className="x-axis-container"
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
          marginLeft: `${30 + 2}px`,
        }}
      >
        {Array.from({ length: m }, (_, i) => i).map((colIndex) => (
          <Box
            key={colIndex}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              padding: "2px",
              flex: hiddenIndices.includes(colIndex) ? "0 0 auto" : 1,
              height: "100%",
              minWidth: hiddenIndices.includes(colIndex) ? "30px" : "100px",
              maxWidth: hiddenIndices.includes(colIndex) ? "30px" : undefined,
              alignItems: "center",
            }}
            onClick={(event) => onColumnLabelClick(event, colIndex)}
          >
            <Typography
              variant="caption"
              sx={{
                userSelect: "none",
                cursor: "pointer",
              }}
            >
              {colIndex + 1}
            </Typography>
          </Box>
        ))}
      </Box>
      {/* <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          // TODO: delete
          // width: "100%",
          // minHeight: "100%", // Take full height of parent when space is available
          gap: "4px",
        }}
      > */}
      {/* Left Column - Row Labels */}
      {/* <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            paddingLeft: 1,
            flexShrink: 0,
            minHeight: "100%", // Take full height
          }}
        >
          <Box
            sx={{
              height: `${topRowHeight}px`,
              flexShrink: 0,
            }}
          ></Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-evenly",
              gap: 1,
              flex: 1,
            }}
          >
            {childIds.map((childId, rowIndex) => (
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
                {isTableId(childId) ? (
                  <EnhancedTableLabel
                    id={childId}
                    onClick={(event) => onRowLabelClick(event, rowIndex)}
                    includeIcon={false}
                    includeDimensions={false}
                  />
                ) : (
                  <EnhancedOperationLabel
                    id={childId}
                    onClick={(event) => onRowLabelClick(event, rowIndex)}
                    includeIcon={false}
                    includeDimensions={false}
                  />
                )}
              </Box>
            ))}
          </Box>
        </Box> */}

      {/* Data Columns Container - Takes remaining space */}
      <Box
        className="data-container"
        ref={columnContainerRef}
        sx={{
          display: "flex",
          flexDirection: "row",
          flex: 1,
          flexGrow: 1,
          overflow: "auto",
          // minHeight: "100%", // Take full height
        }}
      >
        <Box
          className="y-axis-container"
          sx={{
            display: "flex",
          }}
        >
          <StyledColumnsContainer
            sx={{
              maxWidth: "30px",
              paddingRight: 0,
            }}
          >
            {childIds.map((childId, i) => {
              return (
                <Box
                  key={childId}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    cursor: "pointer",
                    padding: "4px",
                    minHeight: "25px",
                  }}
                >
                  {isTableId(childId) ? (
                    <EnhancedTableLabel
                      id={childId}
                      onClick={(event) => onRowLabelClick(event, i)}
                      includeIcon={false}
                      includeDimensions={false}
                    />
                  ) : (
                    <EnhancedOperationLabel
                      id={childId}
                      onClick={(event) => onRowLabelClick(event, i)}
                      includeIcon={false}
                      includeDimensions={false}
                    />
                  )}
                </Box>
              );
            })}
          </StyledColumnsContainer>
        </Box>
        <Box
          className="data-matrix-container"
          sx={{
            display: "flex",
            flexDirection: "row",
            flex: 1,
          }}
        >
          {Array.from({ length: m }, (_, i) => i)
            .reduce((acc, i) => {
              const isHidden = hiddenIndices.includes(i);
              const prev = acc[acc.length - 1];
              if (!isHidden) {
                acc.push({ colIndex: i, isHidden });
              } else {
                if (prev?.isHidden) {
                  prev.hiddenIndices.push(i);
                } else {
                  acc.push({ hiddenIndices: [i], isHidden });
                }
              }
              return acc;
            }, [])
            .map(({ colIndex, hiddenIndices, isHidden }, i) => {
              return (
                <>
                  {/* <Box
                  key={`column-${isHidden ? `hidden-${i}` : i}`}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    padding: "2px",
                    flex: isHidden ? "0 0 auto" : 1,
                    height: "100%",
                    minWidth: isHidden ? "30px" : "125px",
                    maxWidth: isHidden ? "30px" : undefined,
                    overflow: "hidden",
                  }}
                > */}
                  {/* Column Header */}
                  {/* <Box
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
                    {!isHidden ? (
                      colIndex + 1
                    ) : (
                      <HiddenColumnsButton
                        // TODO: make callback function
                        onClick={() => {
                          setHiddenIndices((prev) =>
                            prev.filter((idx) => !hiddenIndices.includes(idx))
                          );
                          clearSelectedColumns(); // Clear selection on unhide
                        }}
                      />
                    )}
                  </Box> */}
                  {!isHidden && (
                    <StyledColumnsContainer className="column-index-container">
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
                              canDrag={selectedChildColumnIdsSet.has(columnId)}
                              onDrop={(draggedItem, targetItem) =>
                                swapColumns(targetItem, draggedItem)
                              }
                            >
                              {/* Interactive Column Summary Card that includes [data-column-id] */}
                              <EnhancedColumnSummary
                                id={columnId}
                                onClick={(event) =>
                                  onCellClick(event, columnId)
                                }
                                onDoubleClick={(event) =>
                                  onCellDoubleClick(event, columnId)
                                }
                                isDraggable={selectedChildColumnIdsSet.has(
                                  columnId
                                )}
                                handleInsertColumnLeft={() =>
                                  onInsertColumnIntoChildTable(
                                    getIndexOfValue(
                                      columnIdMatrix,
                                      columnId
                                    )[0],
                                    colIndex
                                  )
                                }
                                handleInsertColumnRight={() =>
                                  onInsertColumnIntoChildTable(
                                    getIndexOfValue(
                                      columnIdMatrix,
                                      columnId
                                    )[0],
                                    colIndex + 1
                                  )
                                }
                              />
                            </ColumnDragContainer>
                          );
                        }
                      })}
                    </StyledColumnsContainer>
                  )}
                  {/* </Box> */}
                </>
              );
            })}
        </Box>
      </Box>
      {/* </Box> */}
    </Box>
  );
};

StackSchemaView.displayName = "Stack Schema View";

const EnhancedStackSchemaView = withStackOperationData(StackSchemaView);

EnhancedStackSchemaView.displayName = "Enhanced Stack Schema View";
export { EnhancedStackSchemaView, StackSchemaView };
