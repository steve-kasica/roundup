/* eslint-disable no-unused-vars */
import {
  Box,
  IconButton,
  Chip,
  Divider,
  Menu,
  MenuItem,
  styled,
  Skeleton,
  CircularProgress,
  Badge,
  Tooltip,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Typography,
} from "@mui/material";
import withPackOperationData from "./withPackOperationData";
import { useCallback, useEffect, useState, useMemo } from "react";
import SchemaToolbar from "../ui/SchemaToolbar";
import { EnhancedPackOperationLabel } from "./PackOperationLabel";
import { EnhancedColumnName } from "../ColumnViews";
import {
  SwapHoriz as SwapIcon,
  KeyboardArrowLeft as InsertLeftIcon,
  KeyboardArrowRight as InsertRightIcon,
  Error,
} from "@mui/icons-material";
import HideIconButton from "../ui/HideIconButton";
import FocusIconButton from "../ui/icons/FocusIconButton";
import DeleteIconButton from "../ui/icons/DeleteIconButton";
import VennDiagram from "../ui/icons/VennDiagram";
import SelectToggleIconButton from "../ui/SelectToggleIconButton";
import { EnhancedTableName } from "../TableView/TableName";
import { isTableId } from "../../slices/tablesSlice";
import HiddenColumnsButton from "../ui/icons/HiddenColumnsButton";
import withGlobalInterfaceData from "../HOC/withGlobalInterfaceData";
import StyledBlockCell from "./StyledBlockCell";
import { JOIN_TYPES } from "../../slices/operationsSlice";
import PackOperationIcon from "./PackOperationIcon";

const yAxisLabelWidth = "50px";
const yAxisLabelPadding = "0px";
const vennFill = "#555";

const PackSchemaView = withPackOperationData(
  withGlobalInterfaceData(
    ({
      // Props defined in `withGlobalInterfaceData`
      focusColumns,
      // Props defined in `withOperationData`
      id,
      name,
      selectColumns,
      clearSelectedColumns,
      swapTablePositions,
      deleteColumns,
      isLoading,
      // Pack-specific props
      joinPredicate,
      joinType,
      setJoinType,
      setMatchSelection,
      clearMatchSelection,
      insertColumnIntoChildAtIndex,
      rowCount,
      columnCount,
      // Left table props (via withPackOperationData)
      setLeftTableJoinKey,
      leftTableId,
      leftColumnIds,
      leftKey,
      // Right table props (via withPackOperationData)
      setRightTableJoinKey,
      rightTableId,
      rightKey,
      rightColumnIds,
      matchStats,
      matchKeys,
      matchLabels,
      // Props defined in `withAssociatedAlerts`
      alertIds,
      totalCount,
      errorCount,
    }) => {
      // Add hover state for coordinating between tables
      const [hoveredMatch, setHoveredMatch] = useState(null);

      // Add hover state for columns
      const [hoveredColumn, setHoveredColumn] = useState(null);

      const [hiddenColumns, setHiddenColumns] = useState(new Set());
      const [toggledMatches, setToggledMatches] = useState(() => [
        "matches",
        "left_unmatched",
        "right_unmatched",
      ]);

      // Track which block cells have been clicked
      // Key format: `${columnId}:${matchLabel}`
      const [clickedBlockCells, setClickedBlockCells] = useState(new Set());

      // Track the last clicked cell for range selection
      const [lastClickedCell, setLastClickedCell] = useState(null);

      // Track the last clicked match label for range selection
      const [lastClickedMatch, setLastClickedMatch] = useState(null);

      // Track the last clicked column for range selection
      const [lastClickedColumn, setLastClickedColumn] = useState(null);

      // Track context menu state
      const [contextMenu, setContextMenu] = useState(null);
      const [contextMenuColumnId, setContextMenuColumnId] = useState(null);

      const allColumns = useMemo(
        () => [...leftColumnIds, ...rightColumnIds],
        [leftColumnIds, rightColumnIds]
      );

      const colorScale = useMemo(() => {
        return () => "#ddd";
        // const values = Object.values(matchStats || {});
        // const [min, max] = extent(values);
        // return scaleSequential(interpolateGreys).domain([min, max]);
      }, []);

      const areAnySelected = useMemo(() => {
        return clickedBlockCells.size > 0;
      }, [clickedBlockCells.size]);

      // Auto-disable toggledMatches for any match type that has zero count
      useEffect(() => {
        if (!Object.values(matchStats).filter(Boolean).length > 0 || isLoading)
          return;

        setToggledMatches((prev) => {
          const updated = [...prev];
          let hasChanges = false;

          Object.keys(matchStats).forEach((key) => {
            if (matchStats[key] === 0 && prev.includes(key)) {
              updated.splice(updated.indexOf(key), 1);
              hasChanges = true;
            } else if (matchStats[key] > 0 && !prev.includes(key)) {
              updated.push(key);
              hasChanges = true;
            }
          });

          return hasChanges ? updated : prev;
        });
      }, [matchStats, isLoading]);

      // Update column selection when block cells change
      useEffect(() => {
        const selectedColumnIds = new Set();
        const selectedMatchCategories = new Set();

        // Extract unique column IDs from clicked block cells
        clickedBlockCells.forEach((cellKey) => {
          const [columnId, matchType] = cellKey.split(":");
          selectedColumnIds.add(columnId);
          selectedMatchCategories.add(matchType);
        });

        // Call selectColumns with array of column IDs
        if (selectedColumnIds.size > 0) {
          selectColumns(Array.from(selectedColumnIds));
        } else {
          clearSelectedColumns();
        }

        if (selectedMatchCategories.size > 0) {
          setMatchSelection(Array.from(selectedMatchCategories));
        } else {
          clearMatchSelection();
        }
      }, [
        clearSelectedColumns,
        clickedBlockCells,
        selectColumns,
        clearMatchSelection,
        setMatchSelection,
      ]);

      // Calculate join type based on toggled matchingRowCount
      useEffect(() => {
        const signature = matchKeys
          .map((type) => (toggledMatches.includes(type) ? "1" : "0"))
          .join("");

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
      }, [matchKeys, setJoinType, toggledMatches]);

      const handleBlockCellClick = useCallback(
        (event, tableId, columnId, matchLabel) => {
          event.stopPropagation();

          const cellKey = `${columnId}:${matchLabel}`;

          if (event.shiftKey && lastClickedCell) {
            // Shift click: Rectangular selection like a spreadsheet

            // Parse the last clicked cell
            const [lastColumnId, lastMatchLabel] = lastClickedCell.split(":");

            // Find column indices
            const lastColIndex = allColumns.indexOf(lastColumnId);
            const currentColIndex = allColumns.indexOf(columnId);
            const colStart = Math.min(lastColIndex, currentColIndex);
            const colEnd = Math.max(lastColIndex, currentColIndex);

            // Find match type indices
            const lastMatchIndex = matchKeys.indexOf(lastMatchLabel);
            const currentMatchIndex = matchKeys.indexOf(matchLabel);

            // Calculate match type range
            const matchStart = Math.min(lastMatchIndex, currentMatchIndex);
            const matchEnd = Math.max(lastMatchIndex, currentMatchIndex);

            // Build selection range
            const cellsInRange = new Set();

            for (let m = matchStart; m <= matchEnd; m++) {
              const match = matchKeys[m];
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
        [lastClickedCell, leftColumnIds, rightColumnIds, matchKeys]
      );

      const handleMatchLabelClick = useCallback(
        (event, matchLabel) => {
          event.stopPropagation();

          if (event.shiftKey && lastClickedMatch) {
            // Shift click: Select range of match categories
            const lastMatchIndex = matchKeys.indexOf(lastClickedMatch);
            const currentMatchIndex = matchKeys.indexOf(matchLabel);

            if (lastMatchIndex !== -1 && currentMatchIndex !== -1) {
              const matchStart = Math.min(lastMatchIndex, currentMatchIndex);
              const matchEnd = Math.max(lastMatchIndex, currentMatchIndex);

              const cellsToSelect = new Set();

              // Select all cells for all match types in the range
              for (let m = matchStart; m <= matchEnd; m++) {
                const match = matchKeys[m];

                // Add all columns for this match
                allColumns.forEach((columnId) => {
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
            allColumns.forEach((columnId) => {
              cellsToSelect.add(`${columnId}:${matchLabel}`);
            });

            setClickedBlockCells(cellsToSelect);
          }

          // Set last clicked match for future range operations
          setLastClickedMatch(matchLabel);

          // Set last clicked cell to first cell in this match
          setLastClickedCell(`${leftColumnIds[0]}:${matchLabel}`);
        },
        [lastClickedMatch, leftColumnIds, matchKeys, rightColumnIds]
      );

      const handleColumnContextMenu = useCallback((event, columnId) => {
        event.preventDefault();
        event.stopPropagation();
        setContextMenu({
          mouseX: event.clientX + 2,
          mouseY: event.clientY - 6,
        });
        setContextMenuColumnId(columnId);
      }, []);

      const handleCloseContextMenu = useCallback(() => {
        setContextMenu(null);
        setContextMenuColumnId(null);
      }, []);

      const handleInsertColumn = useCallback(
        (mode) => {
          const columnId = contextMenuColumnId;

          // Determine which child table/operation this column belongs to
          const columnIndex = allColumns.indexOf(columnId);

          let childId;
          let indexInChild;

          if (columnIndex < leftColumnIds.length) {
            // Column is in the left child
            childId = leftTableId;
            indexInChild = columnIndex;
          } else {
            // Column is in the right child
            childId = rightTableId;
            indexInChild = columnIndex - leftColumnIds.length;
          }

          const insertionIndex =
            mode === "left" ? indexInChild : indexInChild + 1;

          insertColumnIntoChildAtIndex(childId, insertionIndex);
          handleCloseContextMenu();
        },
        [
          contextMenuColumnId,
          allColumns,
          leftColumnIds.length,
          insertColumnIntoChildAtIndex,
          handleCloseContextMenu,
          leftTableId,
          rightTableId,
        ]
      );

      const handleColumnClick = useCallback(
        (event, columnId) => {
          if (event.shiftKey && lastClickedColumn) {
            // Shift click: Select range of columns
            const lastColIndex = allColumns.indexOf(lastClickedColumn);
            const currentColIndex = allColumns.indexOf(columnId);

            const colStart = Math.min(lastColIndex, currentColIndex);
            const colEnd = Math.max(lastColIndex, currentColIndex);

            const columnsToSelect = allColumns.slice(colStart, colEnd + 1);

            // Add all cells for selected columns across all match types
            setClickedBlockCells((prev) => {
              const newSet = new Set(prev);
              columnsToSelect.forEach((colId) => {
                matchKeys.forEach((match) => {
                  newSet.add(`${colId}:${match}`);
                });
              });
              return newSet;
            });
          } else {
            // Regular click: Select all cells in this column across all match types
            const cellsToSelect = new Set();

            matchKeys.forEach((match) => {
              cellsToSelect.add(`${columnId}:${match}`);
            });

            setClickedBlockCells(cellsToSelect);
          }

          // Set last clicked column for future range operations
          setLastClickedColumn(columnId);

          // Set last clicked cell to first cell in this column
          setLastClickedCell(`${columnId}:${matchKeys[0]}`);
        },
        [lastClickedColumn, matchKeys, allColumns]
      );

      const handleSelectAll = useCallback(() => {
        if (areAnySelected) {
          setClickedBlockCells(new Set());
          return;
        }
        const allCells = new Set();

        // Select all cells across all columns and match types
        matchKeys.forEach((match) => {
          allColumns.forEach((columnId) => {
            allCells.add(`${columnId}:${match}`);
          });
        });

        setClickedBlockCells(allCells);
      }, [areAnySelected, matchKeys, allColumns]);

      const handleToggleMatch = useCallback(
        (event, newValue) => {
          if (newValue === null || newValue.length === 0) {
            // Don't allow deselecting all buttons
            return;
          }

          setToggledMatches(newValue);

          // Deselect cells for any match types that were toggled off
          setClickedBlockCells((prevCells) => {
            const newCells = new Set(prevCells);
            Array.from(newCells).forEach((cellKey) => {
              const [, matchLabel] = cellKey.split(":");
              if (!newValue.includes(matchLabel)) {
                newCells.delete(cellKey);
              }
            });
            return newCells;
          });
        },
        [toggledMatches]
      );

      const handleHideColumns = useCallback(
        (columnId) => {
          if (columnId) {
            setHiddenColumns((prev) => new Set(prev).add(columnId));
          } else {
            const columnsToHide = new Set();
            clickedBlockCells.forEach((cellKey) => {
              const [columnId] = cellKey.split(":");
              columnsToHide.add(columnId);
            });
            setHiddenColumns((prev) => new Set([...prev, ...columnsToHide]));
          }
        },
        [clickedBlockCells]
      );

      const handleSetAsKeyClick = useCallback(
        (columnId) => {
          // Determine which child table/operation this column belongs to
          if (leftColumnIds.includes(columnId)) {
            setLeftTableJoinKey(columnId);
          } else {
            setRightTableJoinKey(columnId);
          }
        },
        [leftColumnIds, setLeftTableJoinKey, setRightTableJoinKey]
      );

      const handleDeleteColumns = useCallback(
        (columnId) => {
          const columnsToDelete = new Set();
          if (columnId) {
            columnsToDelete.add(columnId);
          } else {
            clickedBlockCells.forEach((cellKey) => {
              const [columnId] = cellKey.split(":");
              columnsToDelete.add(columnId);
            });
          }
          deleteColumns(Array.from(columnsToDelete));
        },
        [clickedBlockCells, deleteColumns]
      );

      const handleFocusColumns = useCallback(() => {
        focusColumns(
          Array.from(
            Array.from(clickedBlockCells).reduce((acc, cellKey) => {
              const [columnId] = cellKey.split(":");
              acc.add(columnId);
              return acc;
            }, new Set())
          )
        );
      }, [clickedBlockCells, focusColumns]);

      const handleSwapTables = useCallback(() => {
        swapTablePositions(0, 1);
      }, [swapTablePositions]);

      // Check if at least one complete column is selected
      const hasCompleteColumnSelected = useMemo(() => {
        // Check each column in both tables

        for (const columnId of allColumns) {
          const allCellsSelected = matchKeys.every((matchLabel) => {
            const cellKey = `${columnId}:${matchLabel}`;
            return clickedBlockCells.has(cellKey);
          });
          if (allCellsSelected && matchKeys.length > 0) {
            return true;
          }
        }

        return false;
      }, [allColumns, matchKeys, clickedBlockCells]);

      // This memoized variable groups columns into contiguous visible/hidden segments
      const columnIdVisibilityGroups = useMemo(
        () =>
          allColumns.reduce((acc, columnId, i) => {
            const isHidden = hiddenColumns.has(columnId);
            const prev = acc[acc.length - 1];
            if (!isHidden) {
              acc.push({ columnIds: [columnId], isHidden });
            } else {
              if (prev?.isHidden) {
                prev.columnIds.push(columnId);
              } else {
                acc.push({
                  isHidden: true,
                  columnIds: [columnId],
                });
              }
            }
            return acc;
          }, []),
        [allColumns, hiddenColumns]
      );

      return (
        <Box display={"flex"} flexDirection="column" height="100%">
          <SchemaToolbar
            objectId={id}
            columnIds={[]}
            alertIds={alertIds}
            errorCount={errorCount}
            totalCount={totalCount}
            customMenuItems={
              <>
                {/* Match category filter buttons */}
                <Box sx={{ overflow: "hidden", flexShrink: 0 }}>
                  <ToggleButtonGroup
                    value={toggledMatches}
                    exclusive={false}
                    aria-label="Toggle match categories"
                    size="small"
                    sx={{
                      flexWrap: "nowrap",
                      "& .MuiToggleButton-root": {
                        fontSize: "0.75rem",
                        textTransform: "none",
                        px: 1.5,
                        whiteSpace: "nowrap",
                      },
                      "& .MuiToggleButton-root:first-of-type": {
                        borderTopLeftRadius: "16px",
                        borderBottomLeftRadius: "16px",
                      },
                      "& .MuiToggleButton-root:last-of-type": {
                        borderTopRightRadius: "16px",
                        borderBottomRightRadius: "16px",
                      },
                    }}
                    onChange={handleToggleMatch}
                  >
                    <Tooltip title={`${joinType} join`}>
                      {Array.from(matchLabels.keys()).map((key) => (
                        <ToggleButton
                          key={key}
                          value={key}
                          aria-label={matchLabels.get(key)}
                          disabled={matchStats[key] === 0 || errorCount > 0}
                        >
                          {matchLabels.get(key).replace("Only", "").trim()}
                        </ToggleButton>
                      ))}
                    </Tooltip>
                  </ToggleButtonGroup>
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
                <HideIconButton
                  disabled={!hasCompleteColumnSelected}
                  onClick={() => handleHideColumns()}
                />
                <DeleteIconButton
                  disabled={!hasCompleteColumnSelected}
                  onConfirm={handleDeleteColumns}
                />
                <SelectToggleIconButton
                  onClick={handleSelectAll}
                  isSelected={areAnySelected}
                />
              </>
            }
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <PackOperationIcon />
              <Box sx={{}}>
                <Typography
                  variant="h6"
                  component="div"
                  sx={{
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                    whiteSpace: "nowrap",
                    userSelect: "none",
                    color: totalCount ? "error.main" : "inherit",
                    fontWeight: totalCount ? 600 : "inherit",
                  }}
                >
                  {name || id}{" "}
                </Typography>
              </Box>
              <Tooltip
                title={`${columnCount.toLocaleString()} columns x ${rowCount.toLocaleString()} rows`}
              >
                <Chip
                  size="small"
                  label={`${columnCount.toLocaleString()} x ${rowCount.toLocaleString()}`}
                />
              </Tooltip>
            </Stack>
            {/* <EnhancedPackOperationLabel id={id} /> */}
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
              backgroundColor: totalCount ? "error.lighter" : "transparent",
              overflow: "hidden",
            }}
          >
            <Box
              display="flex"
              flexDirection="column"
              minHeight="100%"
              gap="2px"
            >
              <Box
                className="table-labels"
                display="flex"
                flexDirection="row"
                alignItems="center"
                justifyContent="flex-start"
              >
                <Box
                  className="blank-cell"
                  width={yAxisLabelWidth}
                  minWidth={yAxisLabelWidth}
                  padding={yAxisLabelPadding}
                  alignItems={"center"}
                  justifyContent={"center"}
                  flexShrink={0}
                />
                {[
                  { childId: leftTableId, columnCount: leftColumnIds.length },
                  { childId: rightTableId, columnCount: rightColumnIds.length },
                ].map(({ childId, columnCount }) => (
                  <Box
                    key={childId}
                    flex={columnCount}
                    minWidth={0}
                    textAlign="center"
                  >
                    <Box>
                      {isTableId(childId) ? (
                        <EnhancedTableName
                          id={childId}
                          sx={{
                            fontSize: "0.75rem",
                            userSelect: "none",
                            fontWeight: "none",
                          }}
                          onMouseEnter={() => setHoveredColumn(`${childId}:`)}
                          onMouseLeave={() => setHoveredColumn(null)}
                        />
                      ) : (
                        <p>{childId}</p>
                        // TODO
                        // <EnhancedOperationName
                        //   id={childId}
                        //   sx={{
                        //     fontSize: "0.75rem",
                        //     userSelect: "none",
                        //     fontWeight: "none",
                        //   }}
                        //   onMouseEnter={() => setHoveredColumn(`${childId}:`)}
                        //   onMouseLeave={() => setHoveredColumn(null)}
                        // />
                      )}
                    </Box>
                  </Box>
                ))}
              </Box>
              <Box
                className="column-labels"
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
                {columnIdVisibilityGroups.map(({ columnIds, isHidden }) => {
                  return (
                    <Box
                      key={columnIds.join("-")}
                      flex={isHidden ? "0 0 auto" : 1}
                      minWidth={0}
                      textAlign={"center"}
                      sx={{
                        position: "relative",
                        ...(!isHidden && {
                          "&::after": {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: "50%",
                            width: "1px",
                            height: "4px",
                            backgroundColor: "text.secondary",
                            transform: "translateX(-50%)",
                            cursor: "context-menu",
                          },
                        }),
                      }}
                      onContextMenu={(event) =>
                        !isHidden
                          ? handleColumnContextMenu(event, columnIds[0])
                          : null
                      }
                    >
                      {isHidden ? (
                        <HiddenColumnsButton
                          count={columnIds.length}
                          onClick={() => {
                            setHiddenColumns((prev) => {
                              const nextSet = new Set(prev);
                              columnIds.forEach((colId) =>
                                nextSet.delete(colId)
                              );
                              return nextSet;
                            });
                          }}
                          sx={{ width: "10px", height: "20px" }}
                        />
                      ) : (
                        <EnhancedColumnName
                          id={columnIds[0]}
                          containerSx={{
                            containerType: "inline-size",
                          }}
                          sx={{
                            fontSize: "0.6rem",
                            userSelect: "none",
                            // Multiple transform commands should be space-separated in a single string
                            transform: "rotate(0deg)",
                            transformOrigin: "left bottom",
                            textAlign: "center",
                            ...(columnIds[0] === leftKey ||
                            columnIds[0] === rightKey
                              ? {
                                  fontWeight: "bold",
                                  textDecoration: "underline",
                                  textDecorationThickness: "2px",
                                  textUnderlineOffset: "2px",
                                }
                              : {}),
                            marginBottom: "1px",
                            marginTop: 0,
                            "@container (width < 50px)": {
                              textAlign: "left",
                              transform: `rotate(-10deg) translateX(${20}px)`,
                              marginTop: "2.5px",
                            },
                            "@container (width < 45px)": {
                              transform:
                                "rotate(-20deg) translateX(20px) translateY(5px)",
                              textAlign: "left",
                              marginTop: "5px",
                            },
                            "@container (width < 40px)": {
                              transform:
                                "rotate(-30deg) translateX(20px) translateY(8px)",
                              textAlign: "left",
                              marginTop: "7.5px",
                            },
                            "@container (width < 35px)": {
                              transform:
                                "rotate(-40deg) translateX(12px) translateY(9px)",
                              textAlign: "left",
                              marginTop: "10px",
                            },
                            "@container (width < 30px)": {
                              transform:
                                "rotate(-50deg) translateX(12px) translateY(10px)",
                              textAlign: "left",
                              marginTop: "12.5px",
                            },
                          }}
                          onClick={handleColumnClick}
                        />
                      )}
                    </Box>
                  );
                })}
              </Box>
              {Object.entries(matchStats).map(([key, value]) => {
                // Check if any cells in this match category are selected
                const hasSelectedCells = Array.from(clickedBlockCells).some(
                  (cellKey) => {
                    const [, matchLabel] = cellKey.split(":");
                    return matchLabel === key;
                  }
                );
                const label = matchLabels.get(key) || key;
                const isMatchDisabled = !toggledMatches.includes(key);

                return (
                  <Box
                    key={key}
                    flex={1}
                    minHeight={"60px"}
                    height={"100%"}
                    display={"flex"}
                    flexDirection="row"
                    alignItems="center"
                    justifyContent="flex-start"
                    textAlign={"right"}
                  >
                    <Box
                      sx={{
                        height: "100%",
                        width: yAxisLabelWidth,
                        minWidth: yAxisLabelWidth,
                        maxWidth: yAxisLabelWidth,
                        flexShrink: 0,
                        padding: yAxisLabelPadding,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                        justifyContent: "center",
                        userSelect: "none",
                        cursor: isMatchDisabled ? "not-allowed" : "pointer",
                        opacity: hoveredMatch === key ? 1 : 0.8,
                      }}
                      onMouseEnter={() => setHoveredMatch(key)}
                      onMouseLeave={() => setHoveredMatch(null)}
                      onClick={(event) =>
                        isMatchDisabled
                          ? null
                          : handleMatchLabelClick(event, key)
                      }
                    >
                      {/* <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.5rem",
                          fontWeight:
                            hasSelectedCells || hoveredMatch === key
                              ? "bold"
                              : "normal",
                          color: hasSelectedCells
                            ? "primary.dark"
                            : "text.primary",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          width: "100%",
                          textAlign: "center",
                        }}
                      >
                        {label}
                      </Typography> */}
                      <VennDiagram
                        label={label}
                        size={yAxisLabelWidth.replace("px", "")}
                        disabled={isMatchDisabled}
                        leftFill={
                          key === "left_unmatched" ? vennFill : "transparent"
                        }
                        rightFill={
                          key === "right_unmatched" ? vennFill : "transparent"
                        }
                        overlapFill={key === "matches" ? vennFill : "white"}
                      />
                      <Box
                        display="flex"
                        justifyContent="center"
                        width={"100%"}
                      >
                        {isLoading ? (
                          <CircularProgress size={15} />
                        ) : errorCount > 0 ? (
                          <Error color="error" />
                        ) : (
                          <Badge
                            color={isMatchDisabled ? "default" : "info"}
                            badgeContent={value.toLocaleString()}
                            max={Number.MAX_SAFE_INTEGER}
                          />
                        )}
                      </Box>
                    </Box>
                    {columnIdVisibilityGroups.map(
                      ({ columnIds, isHidden }, j) => {
                        if (isHidden) {
                          return (
                            <Box
                              key={columnIds.join("-")}
                              flex={"0 0 auto"}
                              minWidth={"10px"}
                              display={"flex"}
                              justifyContent={"center"}
                              height="100%"
                            >
                              <Divider orientation="vertical" flexItem />
                            </Box>
                          );
                        } else if (isLoading) {
                          return (
                            <Skeleton
                              variant="rectangular"
                              key={j}
                              flex={1}
                              height={"100%"}
                              animation="pulse"
                              width={"100%"}
                              sx={{ outline: "1px solid white" }}
                            />
                          );
                        }

                        // If not hidden, there will only be one columnId
                        const columnId = columnIds[0];
                        const isLastLeftColumn = j === leftColumnIds.length - 1;
                        const tableId =
                          j < leftColumnIds.length ? leftTableId : rightTableId;
                        const cellKey = `${columnId}:${key}`;
                        const isClicked = clickedBlockCells.has(cellKey);

                        // Calculate which borders to show for contiguous selection
                        let showTopBorder = false;
                        let showBottomBorder = false;
                        let showLeftBorder = false;
                        let showRightBorder = false;

                        if (isClicked) {
                          // Find the match type index for this row
                          const currentMatchIndex = matchKeys.indexOf(key);
                          const currentColIndex = allColumns.indexOf(columnId);

                          // Check cell above (previous match type)
                          if (currentMatchIndex > 0) {
                            const matchAbove = matchKeys[currentMatchIndex - 1];
                            const cellKeyAbove = `${columnId}:${matchAbove}`;
                            showTopBorder =
                              !clickedBlockCells.has(cellKeyAbove);
                          } else {
                            showTopBorder = true; // First row
                          }

                          // Check cell below (next match type)
                          if (currentMatchIndex < matchKeys.length - 1) {
                            const matchBelow = matchKeys[currentMatchIndex + 1];
                            const cellKeyBelow = `${columnId}:${matchBelow}`;
                            showBottomBorder =
                              !clickedBlockCells.has(cellKeyBelow);
                          } else {
                            showBottomBorder = true; // Last row
                          }

                          // Check cell to the left
                          if (currentColIndex > 0) {
                            const colLeft = allColumns[currentColIndex - 1];
                            const cellKeyLeft = `${colLeft}:${key}`;
                            showLeftBorder =
                              !clickedBlockCells.has(cellKeyLeft);
                          } else {
                            showLeftBorder = true; // First column
                          }

                          // Check cell to the right
                          if (currentColIndex < allColumns.length - 1) {
                            const colRight = allColumns[currentColIndex + 1];
                            const cellKeyRight = `${colRight}:${key}`;
                            showRightBorder =
                              !clickedBlockCells.has(cellKeyRight);
                          } else {
                            showRightBorder = true; // Last column
                          }
                        }

                        // const borderWidth = "2px";

                        // Check if the cell to the right is also selected
                        // const currentColIndex = allColumns.indexOf(columnId);
                        // const hasRightNeighbor =
                        //   currentColIndex < allColumns.length - 1;
                        // const colRight = hasRightNeighbor
                        //   ? allColumns[currentColIndex + 1]
                        //   : null;

                        return (
                          <StyledBlockCell
                            key={columnId}
                            isClicked={isClicked}
                            disabled={isMatchDisabled}
                            isLastLeftColumn={isLastLeftColumn}
                            showTopBorder={showTopBorder}
                            showBottomBorder={showBottomBorder}
                            showLeftBorder={showLeftBorder}
                            showRightBorder={showRightBorder}
                            borderWidth={"2px"}
                            backgroundColor={colorScale(value)}
                            onClick={(event) => {
                              if (!isMatchDisabled) {
                                handleBlockCellClick(
                                  event,
                                  tableId,
                                  columnId,
                                  key
                                );
                              }
                            }}
                          />
                        );
                      }
                    )}
                  </Box>
                );
              })}
            </Box>
          </Box>
          <Menu
            open={contextMenu !== null}
            onClose={handleCloseContextMenu}
            anchorReference="anchorPosition"
            anchorPosition={
              contextMenu !== null
                ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                : undefined
            }
          >
            <MenuItem onClick={() => handleInsertColumn("left")}>
              Insert Column Left
            </MenuItem>
            <MenuItem onClick={() => handleInsertColumn("right")}>
              Insert Column Right
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleDeleteColumns(contextMenuColumnId);
                handleCloseContextMenu();
              }}
            >
              Delete Column
            </MenuItem>
            <MenuItem onClick={handleCloseContextMenu}>Rename Column</MenuItem>
            <MenuItem
              onClick={() => {
                handleHideColumns(contextMenuColumnId);
                handleCloseContextMenu();
              }}
            >
              Hide Column
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleSetAsKeyClick(contextMenuColumnId);
                handleCloseContextMenu();
              }}
            >
              Set as key
            </MenuItem>
          </Menu>
        </Box>
      );
    }
  )
);

export default PackSchemaView;
