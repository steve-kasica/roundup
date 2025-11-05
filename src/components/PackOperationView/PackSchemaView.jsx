/* eslint-disable no-unused-vars */
import {
  Box,
  Typography,
  CircularProgress,
  Toolbar,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import withPackOperationData from "./withPackOperationData";
import { useCallback, useEffect, useState, useMemo } from "react";
import { usePackStats } from "../../hooks/usePackStats";
import { EnhancedTableLabel } from "../TableView";
import { JOIN_TYPES } from "../../slices/operationsSlice";
import SchemaToolbar from "../ui/SchemaToolbar";
import { EnhancedPackOperationLabel } from "./PackOperationLabel";
import { EnhancedColumnName } from "../ColumnViews";
import {
  CenterFocusStrong as FocusIcon,
  VisibilityOff as ExcludeIcon,
  Deselect as DeselectAllIcon,
  SelectAll as SelectAllIcon,
  SwapHoriz as SwapIcon,
} from "@mui/icons-material";

const matchLabels = new Map([
  ["matches", "Match"],
  ["left_unmatched", "Left Only"],
  ["right_unmatched", "Right Only"],
]);

const PackSchemaView = withPackOperationData(
  ({
    // General operation props
    id,
    selectColumns,
    clearSelectedColumns,
    swapTablePositions,
    // Pack-specific props
    joinPredicate,
    setJoinType,
    setMatchSelection,
    // Left table props (via withPackOperationData)
    leftTableId,
    leftColumns,
    leftKey,
    leftKeyColumnName,
    // Right table props (via withPackOperationData)
    rightTableId,
    rightKey,
    rightKeyColumnName,
    rightColumns,
    // Props defined in `withAssociatedAlerts`
    alertIds,
    hasAlerts,
  }) => {
    // Add hover state for coordinating between tables
    const [hoveredMatch, setHoveredMatch] = useState(null);

    // Add hover state for columns
    const [hoveredColumn, setHoveredColumn] = useState(null);

    // Add state for column selection across tables
    const [anchorColumn, setAnchorColumn] = useState(null);

    // Add toggle state for showing/hiding match types
    const [toggledMatches, setToggledMatches] = useState({
      matches: true,
      left_unmatched: true,
      right_unmatched: true,
    });

    // Track which block cells have been clicked
    // Key format: `${tableId}:${columnId}:${matchLabel}`
    const [clickedBlockCells, setClickedBlockCells] = useState(new Set());

    // Track the last clicked cell for range selection
    const [lastClickedCell, setLastClickedCell] = useState(null);

    // Track the last clicked match label for range selection
    const [lastClickedMatch, setLastClickedMatch] = useState(null);

    // Track the last clicked column for range selection
    const [lastClickedColumn, setLastClickedColumn] = useState(null);

    // Call usePackStats hook and log results
    const { data, loading, error } = usePackStats(
      leftTableId,
      rightTableId,
      leftKeyColumnName,
      rightKeyColumnName,
      joinPredicate
    );

    // Update toggle state when data changes
    useEffect(() => {
      setToggledMatches((prev) => {
        const newState = { ...prev };
        if (!data) return newState;
        Object.entries(data).forEach(([key, count]) => {
          newState[key] = (count || 0) > 0;
        });
        return newState;
      });
    }, [data]);

    // Update column selection when block cells change
    useEffect(() => {
      const selectedColumnIds = new Set();

      // Extract unique column IDs from clicked block cells
      clickedBlockCells.forEach((cellKey) => {
        const [tableId, columnId] = cellKey.split(":");
        selectedColumnIds.add(columnId);
      });

      // Call selectColumns with array of column IDs
      if (selectedColumnIds.size > 0) {
        selectColumns(Array.from(selectedColumnIds));
      } else {
        clearSelectedColumns();
      }
    }, [clearSelectedColumns, clickedBlockCells, selectColumns]);

    // Update match selection when block cells change
    useEffect(() => {
      const selectedMatchCategories = new Set();

      // Extract unique match categories from clicked block cells
      clickedBlockCells.forEach((cellKey) => {
        const [, , matchLabel] = cellKey.split(":");
        selectedMatchCategories.add(matchLabel);
      });

      // Call setMatchSelection with array of match categories
      setMatchSelection(Array.from(selectedMatchCategories));
    }, [clickedBlockCells, setMatchSelection]);

    // Calculate join type based on toggled matches
    useEffect(() => {
      const signature = (function (matches, left_unmatched, right_unmatched) {
        let sig = "";
        sig += left_unmatched ? "1" : "0";
        sig += matches ? "1" : "0";
        sig += right_unmatched ? "1" : "0";
        return sig;
      })(
        toggledMatches.matches,
        toggledMatches.left_unmatched,
        toggledMatches.right_unmatched
      );

      const joinType = (function (sig) {
        switch (sig) {
          case "111":
            return JOIN_TYPES.FULL_OUTER;
          case "110":
            return JOIN_TYPES.LEFT_OUTER;
          case "101":
            return JOIN_TYPES.FULL_ANTI;
          case "100":
            return JOIN_TYPES.LEFT_ANTI;
          case "011":
            return JOIN_TYPES.RIGHT_OUTER;
          case "010":
            return JOIN_TYPES.INNER;
          case "001":
            return JOIN_TYPES.RIGHT_ANTI;
          case "000":
          default:
            return JOIN_TYPES.EMPTY;
        }
      })(signature);

      setJoinType(joinType);
    }, [setJoinType, toggledMatches]);

    const getVisibleMatches = useCallback(() => {
      if (hasAlerts || !data) return {};
      return Object.fromEntries(
        Object.entries(data).filter(([label, count]) => count > 0)
      );
    }, [hasAlerts, data]);

    const handleBlockCellClick = useCallback(
      (event, tableId, columnId, matchLabel) => {
        event.stopPropagation();

        const cellKey = `${tableId}:${columnId}:${matchLabel}`;

        if (event.shiftKey && lastClickedCell) {
          // Shift click: Rectangular selection like a spreadsheet
          const visibleMatches =
            hasAlerts || !data
              ? {}
              : Object.fromEntries(
                  Object.entries(data).filter(([label, count]) => count > 0)
                );
          const matchTypes = Object.keys(visibleMatches);

          // Parse the last clicked cell
          const [lastTableId, lastColumnId, lastMatchLabel] =
            lastClickedCell.split(":");

          // Determine the bounds of the rectangle
          const leftTableColumns = leftColumns;
          const rightTableColumns = rightColumns;

          // Find column indices within each table
          const getColumnIndex = (tId, colId) => {
            return tId === leftTableId
              ? leftTableColumns.indexOf(colId)
              : rightTableColumns.indexOf(colId);
          };

          // Find match type indices
          const lastMatchIndex = matchTypes.indexOf(lastMatchLabel);
          const currentMatchIndex = matchTypes.indexOf(matchLabel);

          // Calculate match type range
          const matchStart = Math.min(lastMatchIndex, currentMatchIndex);
          const matchEnd = Math.max(lastMatchIndex, currentMatchIndex);

          // Determine if we're selecting within one table or across tables
          const cellsInRange = new Set();

          if (lastTableId === tableId) {
            // Selection within the same table
            const lastColIndex = getColumnIndex(lastTableId, lastColumnId);
            const currentColIndex = getColumnIndex(tableId, columnId);
            const colStart = Math.min(lastColIndex, currentColIndex);
            const colEnd = Math.max(lastColIndex, currentColIndex);

            const columns =
              tableId === leftTableId ? leftTableColumns : rightTableColumns;

            for (let m = matchStart; m <= matchEnd; m++) {
              const match = matchTypes[m];
              for (let c = colStart; c <= colEnd; c++) {
                cellsInRange.add(`${tableId}:${columns[c]}:${match}`);
              }
            }
          } else {
            // Selection across tables - select from first cell to end of first table,
            // then all of second table up to current cell
            const lastColIndex = getColumnIndex(lastTableId, lastColumnId);
            const currentColIndex = getColumnIndex(tableId, columnId);

            // Determine which table comes first
            const isLeftToRight = lastTableId === leftTableId;

            if (isLeftToRight) {
              // From left table to right table
              const leftCols = leftTableColumns;
              const rightCols = rightTableColumns;

              for (let m = matchStart; m <= matchEnd; m++) {
                const match = matchTypes[m];

                // All columns from lastColIndex to end in left table
                for (let c = lastColIndex; c < leftCols.length; c++) {
                  cellsInRange.add(`${leftTableId}:${leftCols[c]}:${match}`);
                }

                // All columns from start to currentColIndex in right table
                for (let c = 0; c <= currentColIndex; c++) {
                  cellsInRange.add(`${rightTableId}:${rightCols[c]}:${match}`);
                }
              }
            } else {
              // From right table to left table
              const leftCols = leftTableColumns;
              const rightCols = rightTableColumns;

              for (let m = matchStart; m <= matchEnd; m++) {
                const match = matchTypes[m];

                // All columns from lastColIndex to end in right table
                for (let c = lastColIndex; c < rightCols.length; c++) {
                  cellsInRange.add(`${rightTableId}:${rightCols[c]}:${match}`);
                }

                // All columns from start to currentColIndex in left table
                for (let c = 0; c <= currentColIndex; c++) {
                  cellsInRange.add(`${leftTableId}:${leftCols[c]}:${match}`);
                }
              }
            }
          }

          setClickedBlockCells((prev) => {
            const newSet = new Set(prev);
            cellsInRange.forEach((key) => newSet.add(key));
            return newSet;
          });
        } else if (event.ctrlKey || event.metaKey) {
          // Ctrl/Cmd click: Toggle selection without clearing others
          setClickedBlockCells((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(cellKey)) {
              newSet.delete(cellKey);
            } else {
              newSet.add(cellKey);
            }
            return newSet;
          });
          setLastClickedCell(cellKey);
        } else {
          // Regular click: Toggle single cell, clear others
          setClickedBlockCells((prev) => {
            const newSet = new Set();
            if (!prev.has(cellKey)) {
              newSet.add(cellKey);
            }
            return newSet;
          });
          setLastClickedCell(cellKey);
        }
      },
      [
        lastClickedCell,
        leftTableId,
        rightTableId,
        leftColumns,
        rightColumns,
        data,
        hasAlerts,
      ]
    );

    const handleMatchLabelClick = useCallback(
      (event, matchLabel) => {
        event.stopPropagation();

        const visibleMatches =
          hasAlerts || !data
            ? {}
            : Object.fromEntries(
                Object.entries(data).filter(([label, count]) => count > 0)
              );
        const matchTypes = Object.keys(visibleMatches);

        if (event.shiftKey && lastClickedMatch) {
          // Shift click: Select range of match categories
          const lastMatchIndex = matchTypes.indexOf(lastClickedMatch);
          const currentMatchIndex = matchTypes.indexOf(matchLabel);

          if (lastMatchIndex !== -1 && currentMatchIndex !== -1) {
            const matchStart = Math.min(lastMatchIndex, currentMatchIndex);
            const matchEnd = Math.max(lastMatchIndex, currentMatchIndex);

            const cellsToSelect = new Set();

            // Select all cells for all matches in the range
            for (let m = matchStart; m <= matchEnd; m++) {
              const match = matchTypes[m];

              // Add all left table columns for this match
              leftColumns.forEach((columnId) => {
                cellsToSelect.add(`${leftTableId}:${columnId}:${match}`);
              });

              // Add all right table columns for this match
              rightColumns.forEach((columnId) => {
                cellsToSelect.add(`${rightTableId}:${columnId}:${match}`);
              });
            }

            // Add to existing selection
            setClickedBlockCells((prev) => {
              const newSet = new Set(prev);
              cellsToSelect.forEach((cell) => newSet.add(cell));
              return newSet;
            });
          }
        } else {
          // Regular click: Replace selection with this match category
          const cellsToSelect = new Set();

          // Add all left table columns for this match
          leftColumns.forEach((columnId) => {
            cellsToSelect.add(`${leftTableId}:${columnId}:${matchLabel}`);
          });

          // Add all right table columns for this match
          rightColumns.forEach((columnId) => {
            cellsToSelect.add(`${rightTableId}:${columnId}:${matchLabel}`);
          });

          setClickedBlockCells(cellsToSelect);
        }

        // Set last clicked match for future range operations
        setLastClickedMatch(matchLabel);

        // Set last clicked cell to first cell in this match
        setLastClickedCell(`${leftTableId}:${leftColumns[0]}:${matchLabel}`);
      },
      [
        leftTableId,
        rightTableId,
        leftColumns,
        rightColumns,
        lastClickedMatch,
        data,
        hasAlerts,
      ]
    );

    const handleColumnClick = useCallback(
      (event, tableId, columnId) => {
        event.stopPropagation();

        const visibleMatches =
          hasAlerts || !data
            ? {}
            : Object.fromEntries(
                Object.entries(data).filter(([label, count]) => count > 0)
              );
        const matchTypes = Object.keys(visibleMatches);

        // Create a unique key for the column click
        const columnKey = `${tableId}:${columnId}`;

        if (event.shiftKey && lastClickedColumn) {
          // Shift click: Select range of columns
          const [lastTableId, lastColumnId] = lastClickedColumn.split(":");

          // Get the appropriate column arrays
          const leftCols = leftColumns;
          const rightCols = rightColumns;

          let columnsToSelect = [];

          if (lastTableId === tableId) {
            // Range within the same table
            const columns = tableId === leftTableId ? leftCols : rightCols;
            const lastColIndex = columns.indexOf(lastColumnId);
            const currentColIndex = columns.indexOf(columnId);

            const colStart = Math.min(lastColIndex, currentColIndex);
            const colEnd = Math.max(lastColIndex, currentColIndex);

            columnsToSelect = columns
              .slice(colStart, colEnd + 1)
              .map((colId) => ({
                tableId,
                columnId: colId,
              }));
          } else {
            // Range across tables - wrap around
            const isLeftToRight = lastTableId === leftTableId;

            if (isLeftToRight) {
              // From left to right table
              const lastColIndex = leftCols.indexOf(lastColumnId);
              const currentColIndex = rightCols.indexOf(columnId);

              // All columns from lastColIndex to end in left table
              for (let i = lastColIndex; i < leftCols.length; i++) {
                columnsToSelect.push({
                  tableId: leftTableId,
                  columnId: leftCols[i],
                });
              }

              // All columns from start to currentColIndex in right table
              for (let i = 0; i <= currentColIndex; i++) {
                columnsToSelect.push({
                  tableId: rightTableId,
                  columnId: rightCols[i],
                });
              }
            } else {
              // From right to left table
              const lastColIndex = rightCols.indexOf(lastColumnId);
              const currentColIndex = leftCols.indexOf(columnId);

              // All columns from lastColIndex to end in right table
              for (let i = lastColIndex; i < rightCols.length; i++) {
                columnsToSelect.push({
                  tableId: rightTableId,
                  columnId: rightCols[i],
                });
              }

              // All columns from start to currentColIndex in left table
              for (let i = 0; i <= currentColIndex; i++) {
                columnsToSelect.push({
                  tableId: leftTableId,
                  columnId: leftCols[i],
                });
              }
            }
          }

          // Add all cells for selected columns across all match types
          setClickedBlockCells((prev) => {
            const newSet = new Set(prev);
            columnsToSelect.forEach(({ tableId: tId, columnId: colId }) => {
              matchTypes.forEach((match) => {
                newSet.add(`${tId}:${colId}:${match}`);
              });
            });
            return newSet;
          });
        } else {
          // Regular click: Select all cells in this column across all match types
          const cellsToSelect = new Set();

          matchTypes.forEach((match) => {
            cellsToSelect.add(`${tableId}:${columnId}:${match}`);
          });

          setClickedBlockCells(cellsToSelect);
        }

        // Set last clicked column for future range operations
        setLastClickedColumn(columnKey);

        // Set last clicked cell to first cell in this column
        setLastClickedCell(`${tableId}:${columnId}:${matchTypes[0]}`);
      },
      [
        leftTableId,
        rightTableId,
        leftColumns,
        rightColumns,
        lastClickedColumn,
        data,
        hasAlerts,
      ]
    );

    const handleSelectAll = useCallback(() => {
      const visibleMatches = getVisibleMatches();
      const matchTypes = Object.keys(visibleMatches);
      const allCells = new Set();

      // Select all cells across all tables, columns, and match types
      matchTypes.forEach((match) => {
        leftColumns.forEach((columnId) => {
          allCells.add(`${leftTableId}:${columnId}:${match}`);
        });
        rightColumns.forEach((columnId) => {
          allCells.add(`${rightTableId}:${columnId}:${match}`);
        });
      });

      setClickedBlockCells(allCells);
    }, [
      getVisibleMatches,
      leftColumns,
      rightColumns,
      leftTableId,
      rightTableId,
    ]);

    const handleDeselectAll = useCallback(() => {
      setClickedBlockCells(new Set());
    }, []);

    const handleToggleMatch = useCallback((matchKey) => {
      setToggledMatches((prev) => {
        const newState = {
          ...prev,
          [matchKey]: !prev[matchKey],
        };

        // If toggling off, deselect all cells for this match type
        if (!newState[matchKey]) {
          setClickedBlockCells((prevCells) => {
            const newCells = new Set(prevCells);
            Array.from(newCells).forEach((cellKey) => {
              const [, , matchLabel] = cellKey.split(":");
              if (matchLabel === matchKey) {
                newCells.delete(cellKey);
              }
            });
            return newCells;
          });
        }

        return newState;
      });
    }, []);

    const handleExcludeColumns = useCallback(() => {}, []);

    const handleFocusColumns = useCallback(() => {}, []);

    const handleSwapTables = useCallback(() => {
      swapTablePositions(0, 1);
    }, [swapTablePositions]);

    const totalRows = Object.values(data || {}).reduce(
      (sum, count) => sum + (count || 0),
      0
    );

    const areAnySelected = useMemo(() => {
      return clickedBlockCells.size > 0;
    }, [clickedBlockCells.size]);

    // Check if at least one complete column is selected
    const hasCompleteColumnSelected = useMemo(() => {
      const visibleMatches = getVisibleMatches();
      const matchTypes = Object.keys(visibleMatches);

      // Check each column in left table
      for (const columnId of leftColumns) {
        const allCellsSelected = matchTypes.every((matchLabel) => {
          const cellKey = `${leftTableId}:${columnId}:${matchLabel}`;
          return clickedBlockCells.has(cellKey);
        });
        if (allCellsSelected && matchTypes.length > 0) {
          return true;
        }
      }

      // Check each column in right table
      for (const columnId of rightColumns) {
        const allCellsSelected = matchTypes.every((matchLabel) => {
          const cellKey = `${rightTableId}:${columnId}:${matchLabel}`;
          return clickedBlockCells.has(cellKey);
        });
        if (allCellsSelected && matchTypes.length > 0) {
          return true;
        }
      }

      return false;
    }, [
      getVisibleMatches,
      leftColumns,
      rightColumns,
      leftTableId,
      rightTableId,
      clickedBlockCells,
    ]);

    return (
      <Box display={"flex"} flexDirection="column" height="100%">
        <SchemaToolbar
          objectId={id}
          columnIds={[]}
          alertIds={alertIds}
          customMenuItems={
            <>
              {/* Match category filter chips */}
              <Box display="flex" gap={0.5} alignItems="center">
                {Object.entries(getVisibleMatches()).map(([key, count]) => (
                  <Chip
                    key={key}
                    label={matchLabels.get(key)}
                    size="small"
                    onClick={() => handleToggleMatch(key)}
                    color={toggledMatches[key] ? "primary" : "default"}
                    variant={toggledMatches[key] ? "filled" : "outlined"}
                    sx={{
                      height: 24,
                      fontSize: "0.75rem",
                      cursor: "pointer",
                    }}
                  />
                ))}
              </Box>
              <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />
              {/* Swap tables */}
              <IconButton
                size="small"
                onClick={handleSwapTables}
                title="Swap table positions"
              >
                <SwapIcon fontSize="small" />
              </IconButton>
              {/* Focus columns */}
              <IconButton
                size="small"
                disabled={!hasCompleteColumnSelected}
                onClick={handleFocusColumns}
                title="Focus columns"
              >
                <FocusIcon fontSize="small" />
              </IconButton>{" "}
              {/* Exclude columns */}
              <IconButton
                size="small"
                disabled={!hasCompleteColumnSelected}
                onClick={handleExcludeColumns}
                title="Exclude columns"
                color="error"
              >
                <ExcludeIcon fontSize="small" />
              </IconButton>{" "}
              {/* Select/Deselect All */}
              {!areAnySelected ? (
                <IconButton
                  size="small"
                  onClick={handleSelectAll}
                  title="Select all"
                >
                  <SelectAllIcon fontSize="small" />
                </IconButton>
              ) : (
                <IconButton
                  size="small"
                  onClick={handleDeselectAll}
                  title="Deselect all"
                >
                  <DeselectAllIcon fontSize="small" />
                </IconButton>
              )}
            </>
          }
        >
          <EnhancedPackOperationLabel id={id} />
        </SchemaToolbar>
        <Box
          display={"flex"}
          flex={1}
          gap={0.5}
          sx={{
            backgroundColor: hasAlerts ? "error.lighter" : "transparent",
          }}
        >
          {/* This loading state should be reflected in the table blocks themselves */}
          {loading && !data && (
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              width="10%"
            >
              <CircularProgress size={24} />
            </Box>
          )}
          <Box marginTop="59px">
            {Object.entries(getVisibleMatches()).map(([key, value]) => {
              // Check if any cells in this match category are selected
              const hasSelectedCells = Array.from(clickedBlockCells).some(
                (cellKey) => {
                  const [, , matchLabel] = cellKey.split(":");
                  return matchLabel === key;
                }
              );

              return (
                <Box
                  key={key}
                  height={(value / totalRows) * 100 + "%"}
                  display={"flex"}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Typography
                    variant="caption"
                    sx={{
                      height: "24px",
                      userSelect: "none",
                      cursor: "pointer",
                      opacity: hoveredMatch === key ? 1 : 0.8,
                      fontWeight:
                        hasSelectedCells || hoveredMatch === key
                          ? "bold"
                          : "normal",
                      color: hasSelectedCells ? "primary.dark" : "text.primary",
                    }}
                    onMouseEnter={() => setHoveredMatch(key)}
                    onMouseLeave={() => setHoveredMatch(null)}
                    onClick={(event) => handleMatchLabelClick(event, key)}
                  >
                    {matchLabels.get(key)}
                  </Typography>
                </Box>
              );
            })}
          </Box>
          <Box
            display={"flex"}
            flexDirection="column"
            width="100%"
            height={"100%"}
          >
            {/* Table headers */}
            <Box display="flex" width="100%">
              {[leftTableId, rightTableId].map((tableId) => (
                <Box
                  key={tableId}
                  width="50%"
                  marginRight="2.5px"
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"flex-end"}
                >
                  <Box display="flex" justifyContent="center">
                    <EnhancedTableLabel
                      id={tableId}
                      includeIcon={false}
                      sx={{ fontSize: "0.875rem" }}
                    />
                  </Box>
                  <Box
                    display="flex"
                    alignItems="center"
                    overflow="hidden"
                    borderBottom={"1px solid black"}
                  >
                    {(tableId === leftTableId ? leftColumns : rightColumns).map(
                      (columnId, index, array) => {
                        // Check if any cells in this column are selected
                        const hasSelectedCells = Array.from(
                          clickedBlockCells
                        ).some((cellKey) => {
                          const [tId, colId] = cellKey.split(":");
                          return tId === tableId && colId === columnId;
                        });

                        // Check if this is a key column
                        const isKeyColumn =
                          (tableId === leftTableId && columnId === leftKey) ||
                          (tableId === rightTableId && columnId === rightKey);

                        return (
                          <Box
                            key={columnId}
                            sx={{
                              width: (1 / array.length) * 100 + "%",
                              cursor: "pointer",
                              "&:hover": {
                                backgroundColor: hasSelectedCells
                                  ? "primary.main"
                                  : "action.hover",
                              },
                            }}
                            onClick={(event) =>
                              handleColumnClick(event, tableId, columnId)
                            }
                            onMouseEnter={() =>
                              setHoveredColumn(`${tableId}:${columnId}`)
                            }
                            onMouseLeave={() => setHoveredColumn(null)}
                          >
                            <EnhancedColumnName
                              id={columnId}
                              sx={{
                                fontSize: "0.75rem",
                                fontWeight: hasSelectedCells
                                  ? "700"
                                  : isKeyColumn
                                  ? "700"
                                  : "600",
                                cursor: "pointer",
                                textTransform: "uppercase",
                                letterSpacing: "0.5px",
                                padding: "0px 1px",
                                color: hasSelectedCells
                                  ? "primary.dark"
                                  : isKeyColumn
                                  ? "primary.main"
                                  : "text.primary",
                                userSelect: "none",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                fontStyle: isKeyColumn ? "italic" : "normal",
                                textDecoration: isKeyColumn
                                  ? "underline"
                                  : "none",
                              }}
                            />
                          </Box>
                        );
                      }
                    )}
                  </Box>
                </Box>
              ))}
            </Box>

            {/* Iterate by match type first */}
            {Object.entries(getVisibleMatches()).map(([label, matchCount]) => {
              const isMatchDisabled = !toggledMatches[label];

              return (
                <Box
                  key={label}
                  display="flex"
                  flex={matchCount / totalRows}
                  width="100%"
                  borderTop="1px solid #ccc"
                >
                  {/* Left table columns for this match type */}
                  <Box display="flex" width="50%" marginRight="2.5px">
                    {leftColumns.map((columnId) => {
                      const cellKey = `${leftTableId}:${columnId}:${label}`;
                      const isClicked = clickedBlockCells.has(cellKey);
                      const isColumnHovered =
                        hoveredColumn === `${leftTableId}:${columnId}`;
                      const isRowHovered = hoveredMatch === label;
                      // Left side is empty for right_unmatched
                      const isEmpty = label === "right_unmatched";

                      return (
                        <Box
                          key={columnId}
                          sx={{
                            width: (1 / leftColumns.length) * 100 + "%",
                            height: "100%",
                            border: isEmpty
                              ? "1px dashed #ccc"
                              : "1px solid #fff",
                            backgroundColor: isEmpty
                              ? isClicked
                                ? "primary.light"
                                : isColumnHovered || isRowHovered
                                ? "#999"
                                : "transparent"
                              : isMatchDisabled
                              ? "#e0e0e0"
                              : isClicked
                              ? "primary.main"
                              : isColumnHovered || isRowHovered
                              ? "#999"
                              : "#ccc",
                            cursor: isEmpty
                              ? "pointer"
                              : isMatchDisabled
                              ? "not-allowed"
                              : "pointer",
                            opacity: isEmpty
                              ? isClicked
                                ? 0.6
                                : 0.3
                              : isMatchDisabled
                              ? 0.5
                              : isClicked
                              ? 0.8
                              : 1,
                            "&:hover": {
                              backgroundColor: isEmpty
                                ? isClicked
                                  ? "primary.dark"
                                  : "#999"
                                : isMatchDisabled
                                ? "#e0e0e0"
                                : isClicked
                                ? "primary.dark"
                                : "#999",
                            },
                          }}
                          onClick={(event) => {
                            if (!isMatchDisabled) {
                              handleBlockCellClick(
                                event,
                                leftTableId,
                                columnId,
                                label
                              );
                            }
                          }}
                        ></Box>
                      );
                    })}
                  </Box>

                  {/* Right table columns for this match type */}
                  <Box display="flex" width="50%" marginLeft="2.5px">
                    {rightColumns.map((columnId) => {
                      const cellKey = `${rightTableId}:${columnId}:${label}`;
                      const isClicked = clickedBlockCells.has(cellKey);
                      const isColumnHovered =
                        hoveredColumn === `${rightTableId}:${columnId}`;
                      const isRowHovered = hoveredMatch === label;
                      // Right side is empty for left_unmatched
                      const isEmpty = label === "left_unmatched";

                      return (
                        <Box
                          key={columnId}
                          sx={{
                            width: (1 / rightColumns.length) * 100 + "%",
                            height: "100%",
                            border: isEmpty
                              ? "1px dashed #ccc"
                              : "1px solid #fff",
                            backgroundColor: isEmpty
                              ? isClicked
                                ? "primary.light"
                                : isColumnHovered || isRowHovered
                                ? "#999"
                                : "transparent"
                              : isMatchDisabled
                              ? "#e0e0e0"
                              : isClicked
                              ? "primary.main"
                              : isColumnHovered || isRowHovered
                              ? "#999"
                              : "#ccc",
                            cursor: isEmpty
                              ? "pointer"
                              : isMatchDisabled
                              ? "not-allowed"
                              : "pointer",
                            opacity: isEmpty
                              ? isClicked
                                ? 0.6
                                : 0.3
                              : isMatchDisabled
                              ? 0.5
                              : isClicked
                              ? 0.8
                              : 1,
                            "&:hover": {
                              backgroundColor: isEmpty
                                ? isClicked
                                  ? "primary.dark"
                                  : "#999"
                                : isMatchDisabled
                                ? "#e0e0e0"
                                : isClicked
                                ? "primary.dark"
                                : "#999",
                            },
                          }}
                          onClick={(event) => {
                            if (!isMatchDisabled) {
                              handleBlockCellClick(
                                event,
                                rightTableId,
                                columnId,
                                label
                              );
                            }
                          }}
                        ></Box>
                      );
                    })}
                  </Box>
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>
    );
  }
);

export default PackSchemaView;
