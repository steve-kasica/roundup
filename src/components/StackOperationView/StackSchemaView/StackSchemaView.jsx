import { useCallback, useMemo, useRef, useState } from "react";
import { withOperationData, withStackOperationData } from "../../HOC";
import {
  Box,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import {
  getValuesInRange,
  getIndexOfValue,
} from "../selectionUtils/selectionUtils";
import { EnhancedTableLabel } from "../../TableView";
import {
  EnhancedColumnSummary,
  StyledColumnContainer,
} from "../../ColumnViews";
import ColumnDragContainer from "../../ColumnViews/ColumnDragContainer";
import { isTableId } from "../../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../../OperationView/OperationLabel";
import StyledTableCell from "./StyledTableCell";
import { NumberIcon } from "../../ui/icons";
import HiddenIndicesHeader from "./HiddenIndicesHeader";

const topRowHeight = 5; // Fixed height for the top row (column headers)
const leftMarginWidth = 25; // Fixed width for the left margin (row headers)

const StackSchemaView = ({
  // Props passed via withOperationData
  childIds,
  selectedChildColumnIdsSet,
  selectColumns, // Sets global set of selected column IDs
  focusColumns, // Sets global set of focused column IDs
  hiddenChildColumnIds, // Matrix of hidden column IDs for child tables
  insertColumnIntoChildAtIndex,

  // Props passed via withStackOperationData
  columnIdMatrix, // column IDs of child tables in a matrix
  m, // width of the matrix (# of columns)
  swapColumns,
}) => {
  const [selectionAnchorCell, setSelectionAnchorCell] = useState(null);
  const columnContainerRef = useRef(null);

  const hiddenIndices = useMemo(() => {
    // Determine which column indices are hidden based on hiddenChildColumnIds
    if (!hiddenChildColumnIds || hiddenChildColumnIds.length === 0) {
      return new Set();
    } else {
      const hiddenIndices = columnIdMatrix
        .map((row, i) =>
          row.reduce((acc, colId, j) => {
            if (hiddenChildColumnIds[i].includes(colId)) {
              acc.push(j);
            }
            return acc;
          }, []),
        )
        .flat();
      return new Set(hiddenIndices);
    }
  }, [columnIdMatrix, hiddenChildColumnIds]);

  const onCellClick = useCallback(
    (event, columnId) => {
      const currentPosition = getIndexOfValue(columnIdMatrix, columnId);
      if (!currentPosition) return; // Column not found in matrix

      if (event.shiftKey && selectionAnchorCell) {
        // Shift+Click: select rectangular range from anchor to current position (like Excel/Sheets)
        const rangeColumnIds = getValuesInRange(
          columnIdMatrix,
          selectionAnchorCell,
          currentPosition,
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
    [columnIdMatrix, selectColumns, selectionAnchorCell],
  );

  const onCellDoubleClick = useCallback(
    (event, columnId) => {
      // Double-click: Focus on the column (same as focus button action)
      focusColumns([columnId]);
    },
    [focusColumns],
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
          (id) => id !== null,
        );
        selectColumns(columnIdsToSelect);
        // Update anchor for next shift+click operation
        setSelectionAnchorCell([rowIndex, 0]);
      }
    },
    [columnIdMatrix, selectColumns, selectionAnchorCell],
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
    [selectionAnchorCell, columnIdMatrix, selectColumns],
  );
  const onInsertColumnIntoChildTable = useCallback(
    (i, j) => {
      insertColumnIntoChildAtIndex(childIds[i], j);
    },
    [insertColumnIntoChildAtIndex, childIds],
  );

  // Build header groups to render visible columns and runs of hidden columns
  //
  const headerGroups = Array.from({ length: m }, (_, i) => i).reduce(
    (acc, i) => {
      const isHidden = hiddenIndices.has(i);
      const prev = acc[acc.length - 1];
      if (isHidden) {
        if (prev && prev.type === "hidden") {
          prev.indices.push(i);
        } else {
          acc.push({ type: "hidden", indices: [i] });
        }
      } else {
        acc.push({ type: "visible", colIndex: i });
      }
      return acc;
    },
    [],
  );

  return (
    <Box display={"flex"} flexDirection="column" height="100%">
      {/* Scroll container for the table */}
      <Box
        className="data-container"
        ref={columnContainerRef}
        sx={{
          flex: 1,
          overflow: "auto",
          borderRadius: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Table
          className="stack-schema-table"
          sx={{
            borderCollapse: "separate",
            borderSpacing: 0,
            width: "100%",
            height: "100%",
            tableLayout: "fixed",
          }}
        >
          <TableHead className="x-axis-container">
            <TableRow sx={{ background: "white" }}>
              {/* Sticky top-left corner cell for the row labels column */}
              <StyledTableCell
                sx={{
                  position: "sticky",
                  top: 0,
                  left: 0,
                  zIndex: 3,
                  height: `${topRowHeight}px`,
                  width: `${leftMarginWidth}px`,
                  minWidth: `${leftMarginWidth}px`,
                  boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.1)",
                  background: "inherit",
                }}
              />
              {headerGroups.map((group, idx) => {
                if (group.type === "visible") {
                  const colIndex = group.colIndex;
                  return (
                    <StyledTableCell
                      key={`h-${colIndex}`}
                      onClick={(e) => onColumnLabelClick(e, colIndex)}
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        background: "inherit",
                        height: `${topRowHeight}px`,
                        fontWeight: 500,
                        textAlign: "center",
                        cursor: "pointer",
                        minWidth: 125,
                        width: 125,
                        boxShadow: "inset -1px -1px 0 rgba(0,0,0,0.08)",
                      }}
                    >
                      <Typography
                        variant="data-small"
                        sx={{ userSelect: "none" }}
                      >
                        {colIndex + 1}
                      </Typography>
                    </StyledTableCell>
                  );
                } else {
                  // Hidden run header cell with colSpan
                  const runLen = group.indices.length;
                  return (
                    <StyledTableCell
                      key={`h-hidden-${idx}`}
                      colSpan={runLen}
                      sx={{
                        position: "sticky",
                        top: 0,
                        zIndex: 2,
                        background: "inherit",
                        height: `${topRowHeight}px`,
                        minWidth: "20px",
                        width: "20px",
                        textAlign: "center",
                      }}
                    >
                      <HiddenIndicesHeader
                        indices={group.indices}
                        columnIds={group.indices
                          .map((index) =>
                            columnIdMatrix.map((row) => row[index]),
                          )
                          .flat()}
                      />
                    </StyledTableCell>
                  );
                }
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {childIds.map((childId, rowIndex) => (
              <TableRow key={childId}>
                {/* Sticky first column: row label */}
                <StyledTableCell
                  className="y-axis-container"
                  sx={{
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    background: "white",
                    cursor: "pointer",
                  }}
                  onClick={(event) => onRowLabelClick(event, rowIndex)}
                >
                  <Stack direction="column" alignItems="center" spacing={1}>
                    <NumberIcon
                      number={rowIndex + 1}
                      tooltipText={
                        isTableId(childId) ? (
                          <EnhancedTableLabel
                            id={childId}
                            includeIcon={false}
                            includeDimensions={false}
                            sx={{ justifyContent: "flex-end" }}
                          />
                        ) : (
                          <EnhancedOperationLabel
                            id={childId}
                            includeIcon={false}
                            includeDimensions={false}
                          />
                        )
                      }
                    />
                  </Stack>
                </StyledTableCell>

                {/* Data cells */}
                {headerGroups.map(({ colIndex, indices, type }, idx) => {
                  if (type === "visible") {
                    const columnId = columnIdMatrix[rowIndex][colIndex];
                    if (columnId) {
                      // Calculate which borders to highlight based on selected columns
                      const highlightLeftBorder =
                        selectedChildColumnIdsSet.has(columnId) &&
                        (colIndex === 0 ||
                          !selectedChildColumnIdsSet.has(
                            columnIdMatrix[rowIndex][colIndex - 1],
                          ));
                      const highlightRightBorder =
                        selectedChildColumnIdsSet.has(columnId) &&
                        (colIndex === m - 1 ||
                          !selectedChildColumnIdsSet.has(
                            columnIdMatrix[rowIndex][colIndex + 1],
                          ));
                      const highlightTopBorder =
                        selectedChildColumnIdsSet.has(columnId) &&
                        (rowIndex === 0 ||
                          !selectedChildColumnIdsSet.has(
                            columnIdMatrix[rowIndex - 1][colIndex],
                          ));
                      const highlightBottomBorder =
                        selectedChildColumnIdsSet.has(columnId) &&
                        (rowIndex === childIds.length - 1 ||
                          !selectedChildColumnIdsSet.has(
                            columnIdMatrix[rowIndex + 1][colIndex],
                          ));

                      return (
                        <StyledTableCell
                          key={columnId}
                          isSelected={selectedChildColumnIdsSet.has(columnId)}
                          highlightLeftBorder={highlightLeftBorder}
                          highlightRightBorder={highlightRightBorder}
                          highlightTopBorder={highlightTopBorder}
                          highlightBottomBorder={highlightBottomBorder}
                        >
                          <ColumnDragContainer
                            id={columnId}
                            columnIndex={colIndex}
                            canDrag={selectedChildColumnIdsSet.has(columnId)}
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
                              isDraggable={selectedChildColumnIdsSet.has(
                                columnId,
                              )}
                              handleInsertColumnLeft={(data) =>
                                onInsertColumnIntoChildTable(
                                  getIndexOfValue(columnIdMatrix, columnId)[0],
                                  colIndex,
                                  data,
                                )
                              }
                              handleInsertColumnRight={(data) =>
                                onInsertColumnIntoChildTable(
                                  getIndexOfValue(columnIdMatrix, columnId)[0],
                                  colIndex + 1,
                                  data,
                                )
                              }
                            />
                          </ColumnDragContainer>
                        </StyledTableCell>
                      );
                    } else if (columnId === null) {
                      // Column is Empty
                      return (
                        <StyledTableCell key={`null-${rowIndex}-${colIndex}`}>
                          <StyledColumnContainer
                            isNull={true}
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              textAlign: "center",
                              height: "100%",
                              "::after": {
                                content: '"EMPTY"',
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform:
                                  "translate(-50%, -50%) rotate(-15deg)",
                                fontSize: 30,
                                fontWeight: "medium",
                                color: "#555",
                                opacity: 0.7,
                                pointerEvents: "none",
                              },
                            }}
                          >
                            {/* <Typography
                              variant="caption"
                              sx={{
                                fontWeight: "medium",
                                fontSize: 20,
                                p: 0,
                                textTransform: "uppercase",
                                transform: "rotate(-15deg)",
                                color: "white",
                              }}
                            >
                              Error
                            </Typography> */}
                          </StyledColumnContainer>
                        </StyledTableCell>
                      );
                    } else {
                      throw new Error("Unknown column ID value");
                    }
                  } else if (type === "hidden") {
                    return (
                      <StyledTableCell
                        key={`empty-${rowIndex}-${idx}`}
                        colSpan={indices.length}
                        sx={
                          {
                            // width: 30,
                            // minWidth: 30,
                          }
                        }
                      />
                    );
                  } else {
                    throw new Error("Unknown header group type");
                  }
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
};

StackSchemaView.displayName = "Stack Schema View";

const EnhancedStackSchemaView = withOperationData(
  withStackOperationData(StackSchemaView),
);

EnhancedStackSchemaView.displayName = "Enhanced Stack Schema View";
export { EnhancedStackSchemaView, StackSchemaView };
