/* eslint-disable no-unused-vars */
import {
  Box,
  Typography,
  CircularProgress,
  Toolbar,
  IconButton,
  Chip,
  Divider,
  Badge,
} from "@mui/material";
import withPackOperationData from "./withPackOperationData";
import { useCallback, useEffect, useState, useMemo } from "react";
import { EnhancedTableLabel } from "../TableView";
import { JOIN_TYPES } from "../../slices/operationsSlice";
import SchemaToolbar from "../ui/SchemaToolbar";
import { EnhancedPackOperationLabel } from "./PackOperationLabel";
import { EnhancedColumnName } from "../ColumnViews";
import { SwapHoriz as SwapIcon } from "@mui/icons-material";
import ExcludeIconButton from "../ui/ExcludeIconButton";
import FocusIconButton from "../ui/FocusIconButton";
import SelectToggleIconButton from "../ui/SelectToggleIconButton";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedOperationLabel } from "../OperationView/OperationLabel";
import {
  extent,
  interpolateGreys,
  scaleOrdinal,
  scaleSequential,
  schemeGreys,
} from "d3";
import { EnhancedTableName } from "../TableView/TableName";
/*
        matchingRowCount={matchingRowCount}
        leftUnmatchedRowCount={leftUnmatchedRowCount}
        rightUnmatchedRowCount={rightUnmatchedRowCount}
*/
const matchLabels = new Map([
  ["matchingRowCount", "Matches"],
  ["leftUnmatchedRowCount", "Left Only"],
  ["rightUnmatchedRowCount", "Right Only"],
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
    matchStats,
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
    const colorScale = scaleSequential(interpolateGreys).domain(
      extent(Object.values(matchStats))
    );

    const matchTypes = Object.keys(matchStats);

    // Add hover state for coordinating between tables
    const [hoveredMatch, setHoveredMatch] = useState(null);

    // Add hover state for columns
    const [hoveredColumn, setHoveredColumn] = useState(null);

    // Add state for column selection across tables
    const [anchorColumn, setAnchorColumn] = useState(null);

    // Add toggle state for showing/hiding match types
    const [toggledMatches, setToggledMatches] = useState(() =>
      Object.entries(matchStats).reduce((acc, [key, count]) => {
        acc[key] = count > 0;
        return acc;
      }, {})
    );

    // Track which block cells have been clicked
    // Key format: `${columnId}:${matchLabel}`
    const [clickedBlockCells, setClickedBlockCells] = useState(new Set());

    // Track the last clicked cell for range selection
    const [lastClickedCell, setLastClickedCell] = useState(null);

    // Track the last clicked match label for range selection
    const [lastClickedMatch, setLastClickedMatch] = useState(null);

    // Track the last clicked column for range selection
    const [lastClickedColumn, setLastClickedColumn] = useState(null);

    // Call usePackStats hook and log results
    const data = matchStats;
    const loading = false;

    const areAnySelected = useMemo(() => {
      return clickedBlockCells.size > 0;
    }, [clickedBlockCells.size]);

    // Update toggle state when data changes
    // useEffect(() => {
    //   setToggledMatches((prev) => {
    //     const newState = { ...prev };
    //     if (!data) return newState;
    //     Object.entries(data).forEach(([key, count]) => {
    //       newState[key] = (count || 0) > 0;
    //     });
    //     return newState;
    //   });
    // }, [data]);

    // Update column selection when block cells change
    // useEffect(() => {
    //   const selectedColumnIds = new Set();

    //   // Extract unique column IDs from clicked block cells
    //   clickedBlockCells.forEach((cellKey) => {
    //     const [tableId, columnId] = cellKey.split(":");
    //     selectedColumnIds.add(columnId);
    //   });

    //   // Call selectColumns with array of column IDs
    //   if (selectedColumnIds.size > 0) {
    //     selectColumns(Array.from(selectedColumnIds));
    //   } else {
    //     clearSelectedColumns();
    //   }
    // }, [clearSelectedColumns, clickedBlockCells, selectColumns]);

    // Update match selection when block cells change
    // useEffect(() => {
    //   const selectedMatchCategories = new Set();

    //   // Extract unique match categories from clicked block cells
    //   clickedBlockCells.forEach((cellKey) => {
    //     const [, , matchLabel] = cellKey.split(":");
    //     selectedMatchCategories.add(matchLabel);
    //   });

    //   // Call setMatchSelection with array of match categories
    //   setMatchSelection(Array.from(selectedMatchCategories));
    // }, [clickedBlockCells, setMatchSelection]);

    // // Calculate join type based on toggled matchingRowCount
    // useEffect(() => {
    //   const signature = (function (
    //     matchingRowCount,
    //     leftUnmatchedRowCount,
    //     rightUnmatchedRowCount
    //   ) {
    //     let sig = "";
    //     sig += leftUnmatchedRowCount ? "1" : "0";
    //     sig += matchingRowCount ? "1" : "0";
    //     sig += rightUnmatchedRowCount ? "1" : "0";
    //     return sig;
    //   })(
    //     toggledMatches.matchingRowCount,
    //     toggledMatches.leftUnmatchedRowCount,
    //     toggledMatches.rightUnmatchedRowCount
    //   );

    //   const joinType = (function (sig) {
    //     switch (sig) {
    //       case "111":
    //         return JOIN_TYPES.FULL_OUTER;
    //       case "110":
    //         return JOIN_TYPES.LEFT_OUTER;
    //       case "101":
    //         return JOIN_TYPES.FULL_ANTI;
    //       case "100":
    //         return JOIN_TYPES.LEFT_ANTI;
    //       case "011":
    //         return JOIN_TYPES.RIGHT_OUTER;
    //       case "010":
    //         return JOIN_TYPES.INNER;
    //       case "001":
    //         return JOIN_TYPES.RIGHT_ANTI;
    //       case "000":
    //       default:
    //         return JOIN_TYPES.EMPTY;
    //     }
    //   })(signature);

    //   setJoinType(joinType);
    // }, [setJoinType, toggledMatches]);

    const handleBlockCellClick = useCallback(
      (event, tableId, columnId, matchLabel) => {
        event.stopPropagation();

        const cellKey = `${columnId}:${matchLabel}`;

        if (event.shiftKey && lastClickedCell) {
          // Shift click: Rectangular selection like a spreadsheet

          // Parse the last clicked cell
          const [lastColumnId, lastMatchLabel] = lastClickedCell.split(":");

          // Determine the bounds of the rectangle
          const allColumns = [...leftColumns, ...rightColumns];

          // Find column indices
          const lastColIndex = allColumns.indexOf(lastColumnId);
          const currentColIndex = allColumns.indexOf(columnId);
          const colStart = Math.min(lastColIndex, currentColIndex);
          const colEnd = Math.max(lastColIndex, currentColIndex);

          // Find match type indices
          const lastMatchIndex = matchTypes.indexOf(lastMatchLabel);
          const currentMatchIndex = matchTypes.indexOf(matchLabel);

          // Calculate match type range
          const matchStart = Math.min(lastMatchIndex, currentMatchIndex);
          const matchEnd = Math.max(lastMatchIndex, currentMatchIndex);

          // Build selection range
          const cellsInRange = new Set();

          for (let m = matchStart; m <= matchEnd; m++) {
            const match = matchTypes[m];
            for (let c = colStart; c <= colEnd; c++) {
              cellsInRange.add(`${allColumns[c]}:${match}`);
            }
          }

          setClickedBlockCells((prev) => {
            const newSet = new Set(prev);
            cellsInRange.forEach((key) => newSet.add(key));
            return newSet;
          });
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
      [lastClickedCell, leftColumns, rightColumns, matchTypes]
    );

    const handleMatchLabelClick = useCallback(
      (event, matchLabel) => {
        event.stopPropagation();

        if (event.shiftKey && lastClickedMatch) {
          // Shift click: Select range of match categories
          const lastMatchIndex = matchTypes.indexOf(lastClickedMatch);
          const currentMatchIndex = matchTypes.indexOf(matchLabel);

          if (lastMatchIndex !== -1 && currentMatchIndex !== -1) {
            const matchStart = Math.min(lastMatchIndex, currentMatchIndex);
            const matchEnd = Math.max(lastMatchIndex, currentMatchIndex);

            const cellsToSelect = new Set();

            // Select all cells for all match types in the range
            for (let m = matchStart; m <= matchEnd; m++) {
              const match = matchTypes[m];

              // Add all columns for this match
              [...leftColumns, ...rightColumns].forEach((columnId) => {
                cellsToSelect.add(`${columnId}:${match}`);
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

          // Add all columns for this match
          [...leftColumns, ...rightColumns].forEach((columnId) => {
            cellsToSelect.add(`${columnId}:${matchLabel}`);
          });

          setClickedBlockCells(cellsToSelect);
        }

        // Set last clicked match for future range operations
        setLastClickedMatch(matchLabel);

        // Set last clicked cell to first cell in this match
        setLastClickedCell(`${leftColumns[0]}:${matchLabel}`);
      },
      [lastClickedMatch, leftColumns, matchTypes, rightColumns]
    );

    const handleColumnClick = useCallback(
      (event, tableId, columnId) => {
        event.stopPropagation();

        if (event.shiftKey && lastClickedColumn) {
          // Shift click: Select range of columns
          const allColumns = [...leftColumns, ...rightColumns];
          const lastColIndex = allColumns.indexOf(lastClickedColumn);
          const currentColIndex = allColumns.indexOf(columnId);

          const colStart = Math.min(lastColIndex, currentColIndex);
          const colEnd = Math.max(lastColIndex, currentColIndex);

          const columnsToSelect = allColumns.slice(colStart, colEnd + 1);

          // Add all cells for selected columns across all match types
          setClickedBlockCells((prev) => {
            const newSet = new Set(prev);
            columnsToSelect.forEach((colId) => {
              matchTypes.forEach((match) => {
                newSet.add(`${colId}:${match}`);
              });
            });
            return newSet;
          });
        } else {
          // Regular click: Select all cells in this column across all match types
          const cellsToSelect = new Set();

          matchTypes.forEach((match) => {
            cellsToSelect.add(`${columnId}:${match}`);
          });

          setClickedBlockCells(cellsToSelect);
        }

        // Set last clicked column for future range operations
        setLastClickedColumn(columnId);

        // Set last clicked cell to first cell in this column
        setLastClickedCell(`${columnId}:${matchTypes[0]}`);
      },
      [lastClickedColumn, matchTypes, leftColumns, rightColumns]
    );

    const handleSelectAll = useCallback(() => {
      if (areAnySelected) {
        setClickedBlockCells(new Set());
        return;
      }
      const allCells = new Set();

      // Select all cells across all columns and match types
      matchTypes.forEach((match) => {
        [...leftColumns, ...rightColumns].forEach((columnId) => {
          allCells.add(`${columnId}:${match}`);
        });
      });

      setClickedBlockCells(allCells);
    }, [areAnySelected, matchTypes, leftColumns, rightColumns]);

    const handleToggleMatch = useCallback((matchKey) => {
      console.log("Toggling match:", matchKey);
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
              const [, matchLabel] = cellKey.split(":");
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

    // Check if at least one complete column is selected
    const hasCompleteColumnSelected = useMemo(() => {
      // Check each column in both tables
      const allColumns = [...leftColumns, ...rightColumns];

      for (const columnId of allColumns) {
        const allCellsSelected = matchTypes.every((matchLabel) => {
          const cellKey = `${columnId}:${matchLabel}`;
          return clickedBlockCells.has(cellKey);
        });
        if (allCellsSelected && matchTypes.length > 0) {
          return true;
        }
      }

      return false;
    }, [leftColumns, matchTypes, clickedBlockCells, rightColumns]);

    const yAxisLabelWidth = "70px";
    const yAxisLabelPadding = "4px";

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
                {Object.entries(matchStats).map(([key, count]) => (
                  <Chip
                    key={key}
                    label={matchLabels.get(key)}
                    disabled={count === 0}
                    size="small"
                    onClick={() => handleToggleMatch(key)}
                    color={toggledMatches[key] ? "primary" : "default"}
                    variant={toggledMatches[key] ? "filled" : "outlined"}
                    sx={{
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
              <FocusIconButton
                disabled={!hasCompleteColumnSelected}
                onClick={handleFocusColumns}
              />
              <ExcludeIconButton
                disabled={!hasCompleteColumnSelected}
                onClick={handleExcludeColumns}
              />
              <SelectToggleIconButton
                onClick={handleSelectAll}
                isSelected={areAnySelected}
              />
            </>
          }
        >
          <EnhancedPackOperationLabel id={id} />
        </SchemaToolbar>
        <Box
          display={"flex"}
          flexDirection={"column"}
          alignItems={"stretch"}
          justifyContent={"flex-start"}
          flex={1}
          gap={0.5}
          padding={1}
          sx={{
            backgroundColor: hasAlerts ? "error.lighter" : "transparent",
            overflow: "hidden",
          }}
        >
          <Box display="flex" flexDirection="column" minHeight="100%" gap="2px">
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"flex-start"}
            >
              <Box
                width={yAxisLabelWidth}
                minWidth={yAxisLabelWidth}
                padding={yAxisLabelPadding}
                alignItems={"center"}
                justifyContent={"center"}
                flexShrink={0}
              />
              {[
                { tableId: leftTableId, columnCount: leftColumns.length },
                { tableId: rightTableId, columnCount: rightColumns.length },
              ].map(({ tableId, columnCount }) => (
                <Box
                  key={tableId}
                  flex={columnCount}
                  minWidth={0}
                  textAlign={"center"}
                >
                  <EnhancedTableName
                    id={tableId}
                    sx={{
                      fontSize: "0.75rem",
                      userSelect: "none",
                      fontWeight: "none",
                    }}
                    onMouseEnter={() => setHoveredColumn(`${tableId}:`)}
                    onMouseLeave={() => setHoveredColumn(null)}
                  />
                </Box>
              ))}
            </Box>
            <Box
              display={"flex"}
              flexDirection={"row"}
              alignItems={"center"}
              justifyContent={"flex-start"}
              marginTop={"20px"}
            >
              <Box
                width={yAxisLabelWidth}
                minWidth={yAxisLabelWidth}
                padding={yAxisLabelPadding}
                alignItems={"center"}
                justifyContent={"center"}
                flexShrink={0}
              />
              {[...leftColumns, ...rightColumns].map((columnId) => {
                return (
                  <Box
                    key={columnId}
                    flex={1}
                    minWidth={0}
                    textAlign={"center"}
                    sx={{
                      position: "relative",
                      "&::after": {
                        content: '""',
                        position: "absolute",
                        bottom: 0,
                        left: "50%",
                        width: "1px",
                        height: "4px",
                        backgroundColor: "text.secondary",
                        transform: "translateX(-50%)",
                      },
                    }}
                  >
                    <EnhancedColumnName
                      id={columnId}
                      sx={{
                        fontSize: "0.6rem",
                        transform: "rotate(-45deg)",
                        transformOrigin: "left bottom",
                        marginLeft: "15px",
                        userSelect: "none",
                        width: "50px",
                        minWidth: "50px",
                        maxWidth: "50px",
                        textAlign: "left",
                      }}
                      onClick={handleColumnClick}
                    />
                  </Box>
                );
              })}
            </Box>
            {Object.entries(matchStats).map(([key, value], i, array) => {
              // Check if any cells in this match category are selected
              const hasSelectedCells = Array.from(clickedBlockCells).some(
                (cellKey) => {
                  const [, matchLabel] = cellKey.split(":");
                  return matchLabel === key;
                }
              );
              const label = matchLabels.get(key) || key;
              const isMatchDisabled = !toggledMatches[key];

              return (
                <Box
                  key={key}
                  flex={1}
                  minHeight={"60px"}
                  display={"flex"}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="flex-start"
                  textAlign={"right"}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{
                      width: yAxisLabelWidth,
                      minWidth: yAxisLabelWidth,
                      maxWidth: yAxisLabelWidth,
                      flexShrink: 0,
                      padding: yAxisLabelPadding,
                      textAlign: "right",
                      userSelect: "none",
                      cursor: "pointer",
                      opacity: hoveredMatch === key ? 1 : 0.8,
                      fontWeight:
                        hasSelectedCells || hoveredMatch === key
                          ? "bold"
                          : "normal",
                      color: hasSelectedCells ? "primary.dark" : "text.primary",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={() => setHoveredMatch(key)}
                    onMouseLeave={() => setHoveredMatch(null)}
                    onClick={(event) => handleMatchLabelClick(event, key)}
                  >
                    {label}
                    <br />({value})
                  </Typography>
                  {[...leftColumns, ...rightColumns].map((columnId, j) => {
                    // Check if this is a key column
                    const tableId =
                      j < leftColumns.length ? leftTableId : rightTableId;
                    const isKeyColumn =
                      columnId === leftKey || columnId === rightKey;
                    const cellKey = `${columnId}:${key}`;
                    const isClicked = clickedBlockCells.has(cellKey);
                    const isColumnHovered =
                      hoveredColumn === `${tableId}:${columnId}`;
                    const isRowHovered = hoveredMatch === key;

                    // Determine if cell is empty based on table and match type
                    const isEmpty =
                      (tableId === leftTableId &&
                        key === "rightUnmatchedRowCount") ||
                      (tableId === rightTableId &&
                        key === "leftUnmatchedRowCount");

                    // Calculate which borders to show for contiguous selection
                    let showTopBorder = false;
                    let showBottomBorder = false;
                    let showLeftBorder = false;
                    let showRightBorder = false;

                    if (isClicked) {
                      // Find the match type index for this row
                      const currentMatchIndex = matchTypes.indexOf(key);
                      const allColumns = [...leftColumns, ...rightColumns];
                      const currentColIndex = allColumns.indexOf(columnId);

                      // Check cell above (previous match type)
                      if (currentMatchIndex > 0) {
                        const matchAbove = matchTypes[currentMatchIndex - 1];
                        const cellKeyAbove = `${columnId}:${matchAbove}`;
                        showTopBorder = !clickedBlockCells.has(cellKeyAbove);
                      } else {
                        showTopBorder = true; // First row
                      }

                      // Check cell below (next match type)
                      if (currentMatchIndex < matchTypes.length - 1) {
                        const matchBelow = matchTypes[currentMatchIndex + 1];
                        const cellKeyBelow = `${columnId}:${matchBelow}`;
                        showBottomBorder = !clickedBlockCells.has(cellKeyBelow);
                      } else {
                        showBottomBorder = true; // Last row
                      }

                      // Check cell to the left
                      if (currentColIndex > 0) {
                        const colLeft = allColumns[currentColIndex - 1];
                        const cellKeyLeft = `${colLeft}:${key}`;
                        showLeftBorder = !clickedBlockCells.has(cellKeyLeft);
                      } else {
                        showLeftBorder = true; // First column
                      }

                      // Check cell to the right
                      if (currentColIndex < allColumns.length - 1) {
                        const colRight = allColumns[currentColIndex + 1];
                        const cellKeyRight = `${colRight}:${key}`;
                        showRightBorder = !clickedBlockCells.has(cellKeyRight);
                      } else {
                        showRightBorder = true; // Last column
                      }
                    }

                    const borderWidth = "2px";

                    // Check if the cell to the right is also selected
                    const allColumns = [...leftColumns, ...rightColumns];
                    const currentColIndex = allColumns.indexOf(columnId);
                    const hasRightNeighbor =
                      currentColIndex < allColumns.length - 1;
                    const colRight = hasRightNeighbor
                      ? allColumns[currentColIndex + 1]
                      : null;
                    const rightCellKey = colRight ? `${colRight}:${key}` : null;
                    const rightCellSelected = rightCellKey
                      ? clickedBlockCells.has(rightCellKey)
                      : false;

                    return (
                      <Box
                        key={columnId}
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          height: "100%",
                          backgroundColor: colorScale(value),
                          position: "relative",
                          boxShadow: (theme) => {
                            const shadows = [];

                            // Always show a subtle separator on the right
                            shadows.push(
                              "inset -1px 0 0 0 rgba(0, 0, 0, 0.05)"
                            );

                            // Add selection borders (these will overlay on top of separator)
                            if (isClicked) {
                              if (showTopBorder) {
                                shadows.push(
                                  `inset 0 ${borderWidth} 0 0 ${theme.palette.primary.main}`
                                );
                              }
                              if (showBottomBorder) {
                                shadows.push(
                                  `inset 0 -${borderWidth} 0 0 ${theme.palette.primary.main}`
                                );
                              }
                              if (showLeftBorder) {
                                shadows.push(
                                  `inset ${borderWidth} 0 0 0 ${theme.palette.primary.main}`
                                );
                              }
                              // Only show right selection border if it's truly an edge
                              // (not just because the next cell isn't selected)
                              if (showRightBorder) {
                                shadows.push(
                                  `inset -${borderWidth} 0 0 0 ${theme.palette.primary.main}`
                                );
                              }
                            }

                            return shadows.join(", ");
                          },
                          ...(isClicked && {
                            opacity: 0.8,
                          }),
                          ...(isMatchDisabled && {
                            backgroundColor: "grey.300",
                            cursor: "not-allowed",
                          }),
                          "&:hover": {
                            opacity: isMatchDisabled ? 1 : 0.8,
                          },
                        }}
                        onClick={(event) => {
                          if (!isMatchDisabled) {
                            handleBlockCellClick(event, tableId, columnId, key);
                          }
                        }}
                      ></Box>
                    );
                  })}
                </Box>
              );
            })}
          </Box>
          {/* <Box display={"flex"} flexDirection="row" overflow={"auto"}>
            {[
              {
                tableId: leftTableId,
                columns: leftColumns,
                margin: "marginRight",
              },
              {
                tableId: rightTableId,
                columns: rightColumns,
                margin: "marginLeft",
              },
            ].map(({ tableId, columns, margin }) => (
              <Box
                key={tableId}
                display="flex"
                flexDirection="column"
                overflow="auto"
                {...{ [margin]: "2.5px" }}
              >
                <Box
                  key={tableId}
                  marginRight="2.5px"
                  display={"flex"}
                  flexDirection={"column"}
                  justifyContent={"flex-end"}
                >
                  <Box display="flex" justifyContent="center">
                    {isTableId(tableId) ? (
                      <EnhancedTableLabel
                        id={tableId}
                        includeIcon={false}
                        sx={{ fontSize: "0.875rem" }}
                      />
                    ) : (
                      <EnhancedOperationLabel
                        id={tableId}
                        includeIcon={false}
                        sx={{ fontSize: "0.875rem" }}
                      />
                    )}
                  </Box>
                  <Box display="flex" alignItems="center">
                    {columns.map((columnId) => {
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
                            width: (1 / columns.length) * 100 + "%",
                            minWidth: "50px",
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
                    })}
                  </Box>
                </Box>
              </Box>
            ))}
          </Box> */}
        </Box>
      </Box>
    );
  }
);

export default PackSchemaView;
