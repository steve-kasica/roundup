/* eslint-disable no-unused-vars */
import {
  Box,
  Divider,
  Menu,
  MenuItem,
  Skeleton,
  CircularProgress,
  Badge,
} from "@mui/material";
import {
  withOperationData,
  withPackOperationData,
  withAssociatedAlerts,
  withGlobalInterfaceData,
} from "../HOC";
import { useCallback, useState, useMemo } from "react";
import { EnhancedColumnName } from "../ColumnViews";
import { Error } from "@mui/icons-material";
import VennDiagram from "../ui/icons/VennDiagram";
import { EnhancedTableName } from "../TableView/TableName";
import { isTableId } from "../../slices/tablesSlice";
import { HiddenColumnsButton } from "../ui/buttons";
import StyledBlockCell from "./StyledBlockCell";
import {
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
} from "../../slices/operationsSlice";
import { EnhancedPackSchemaToolbar } from "./PackSchemaToolbar";

const yAxisLabelWidth = "50px";
const yAxisLabelPadding = "0px";
const vennFill = "#555";
const childTablesSeparatorWidth = 5; // in pixels
const cellBorderColor = "rgba(0, 0, 255, 0.05)";

const PackSchemaView = ({
  // Props defined in `withOperationData`
  id,
  selectedColumnIds,
  selectedChildColumnIdsSet,
  selectColumns,
  clearSelectedColumns,
  isLoading,
  colorScale,
  depth,
  // Props defined in `withPackOperationData`
  insertColumnIntoChildAtIndex,
  validMatchGroups,
  setLeftTableJoinKey,
  leftTableId,
  leftColumnIds,
  leftKey,
  setRightTableJoinKey,
  rightTableId,
  rightKey,
  rightColumnIds,
  matchStats,
  matchKeys,
  matchLabels,
  combinedChildColumnIds,
  // Props defined in `withAssociatedAlerts`
  totalCount,
  errorCount,

  // Props defined in `withGlobalInterfaceData`
  selectedMatches,
  selectMatches,
  clearSelectedMatches,
}) => {
  // Add hover state for coordinating between tables
  const [hoveredMatch, setHoveredMatch] = useState(null);

  const [hiddenColumns, setHiddenColumns] = useState(new Set());

  // Track the last clicked cell for range selection
  const [selectionAnchor, setSelectionAnchor] = useState(null);

  // Track the last clicked match label for range selection
  const [lastClickedMatch, setLastClickedMatch] = useState(null);

  // Track the last clicked column for range selection
  const [lastClickedColumn, setLastClickedColumn] = useState(null);

  // Track context menu state
  const [contextMenu, setContextMenu] = useState(null);
  const [contextMenuColumnId, setContextMenuColumnId] = useState(null);

  const areAnySelected = useMemo(() => {
    return selectedChildColumnIdsSet.size > 0;
  }, [selectedChildColumnIdsSet.size]);

  /**
   * @function handleCellClick
   * Handles click on a block cell to select/deselect it
   * @param {Object} event - The click event
   * @param {string} columnId - The column ID of the clicked cell, e.g. `c1`, `c2`, etc
   * @param {string} matchLabel - The match label of the clicked cell
   * @return {void}
   */
  const handleCellClick = useCallback(
    (event, columnId, matchKey) => {
      event.stopPropagation();

      if (event.shiftKey && selectionAnchor) {
        // Shift click: Select range of cells
        const [anchorColumnId, anchorMatchLabel] = selectionAnchor.split(":");

        // Find indices for both dimensions
        const anchorColIndex = combinedChildColumnIds.indexOf(anchorColumnId);
        const currentColIndex = combinedChildColumnIds.indexOf(columnId);
        const anchorMatchIndex = matchKeys.indexOf(anchorMatchLabel);
        const currentMatchIndex = matchKeys.indexOf(matchKey);

        // Calculate the rectangular range
        const colStart = Math.min(anchorColIndex, currentColIndex);
        const colEnd = Math.max(anchorColIndex, currentColIndex);
        const matchStart = Math.min(anchorMatchIndex, currentMatchIndex);
        const matchEnd = Math.max(anchorMatchIndex, currentMatchIndex);

        // Collect all column IDs and match labels in the range
        const columnsToSelect = combinedChildColumnIds.slice(
          colStart,
          colEnd + 1
        );
        const matchesToSelect = matchKeys
          .slice(matchStart, matchEnd + 1)
          .filter((match) => validMatchGroups.includes(match));

        // Select the range
        selectColumns(columnsToSelect);
        selectMatches(matchesToSelect);
      } else {
        // Is a single click
        selectColumns(columnId);
        selectMatches(matchKey);

        const cellKey = `${columnId}:${matchKey}`;
        setSelectionAnchor(cellKey);
      }
    },
    [
      selectionAnchor,
      combinedChildColumnIds,
      matchKeys,
      selectColumns,
      selectMatches,
      validMatchGroups,
    ]
  );

  /**
   * @function handleMatchLabelClick
   * Handles click on a match label to select/deselect it
   * @param {Object} event - The click event
   * @param {string} matchKey - The match key of the clicked label
   * @return {void}
   */
  const handleMatchLabelClick = useCallback(
    (event, matchKey) => {
      event.stopPropagation();

      if (event.shiftKey && lastClickedMatch) {
        // Shift click: Select range of matches
        const anchorMatchIndex = matchKeys.indexOf(lastClickedMatch);
        const currentMatchIndex = matchKeys.indexOf(matchKey);

        const matchStart = Math.min(anchorMatchIndex, currentMatchIndex);
        const matchEnd = Math.max(anchorMatchIndex, currentMatchIndex);

        const matchesToSelect = matchKeys
          .slice(matchStart, matchEnd + 1)
          .filter((match) => validMatchGroups.includes(match));

        selectColumns(combinedChildColumnIds);
        selectMatches(matchesToSelect);
      } else {
        // Regular click: Select this match
        selectColumns(combinedChildColumnIds);
        selectMatches([matchKey]);

        setLastClickedMatch(matchKey);
      }

      // Set last clicked cell to first cell in this match
      setSelectionAnchor(`${leftColumnIds[0]}:${matchKey}`);
    },
    [
      combinedChildColumnIds,
      lastClickedMatch,
      leftColumnIds,
      matchKeys,
      selectColumns,
      selectMatches,
      validMatchGroups,
    ]
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
      const columnIndex = combinedChildColumnIds.indexOf(columnId);

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

      const insertionIndex = mode === "left" ? indexInChild : indexInChild + 1;

      insertColumnIntoChildAtIndex(childId, insertionIndex);
      handleCloseContextMenu();
    },
    [
      contextMenuColumnId,
      combinedChildColumnIds,
      leftColumnIds.length,
      insertColumnIntoChildAtIndex,
      handleCloseContextMenu,
      leftTableId,
      rightTableId,
    ]
  );

  /**
   * @function handleColumnLabelClick
   * Handles click on a column label to select/deselect it
   * @param {Object} event - The click event
   * @param {string} columnId - The column ID of the clicked label
   * @return {void}
   */
  const handleColumnLabelClick = useCallback(
    (event, columnId) => {
      if (event.shiftKey && lastClickedColumn) {
        // Shift click: Select range of columns
        const anchorColIndex =
          combinedChildColumnIds.indexOf(lastClickedColumn);
        const currentColIndex = combinedChildColumnIds.indexOf(columnId);

        const colStart = Math.min(anchorColIndex, currentColIndex);
        const colEnd = Math.max(anchorColIndex, currentColIndex);

        const columnsToSelect = combinedChildColumnIds.slice(
          colStart,
          colEnd + 1
        );

        selectColumns(columnsToSelect);
        selectMatches(validMatchGroups);
      } else {
        // Regular click: Select this column
        selectColumns(columnId);
        selectMatches(validMatchGroups);

        setLastClickedColumn(columnId);
      }
    },
    [
      combinedChildColumnIds,
      lastClickedColumn,
      selectColumns,
      selectMatches,
      validMatchGroups,
    ]
  );

  /**
   * @function handleSelectAll
   * Handles select all / clear all button click
   * @return {void}
   */
  const handleSelectAll = useCallback(() => {
    if (areAnySelected) {
      clearSelectedColumns();
      clearSelectedMatches();
    } else {
      selectColumns(combinedChildColumnIds);
      selectMatches(validMatchGroups);
    }
  }, [
    areAnySelected,
    clearSelectedColumns,
    clearSelectedMatches,
    selectColumns,
    combinedChildColumnIds,
    selectMatches,
    validMatchGroups,
  ]);

  /**
   * @function handleHideColumns
   * Handles hiding columns
   * @param {string} [columnId] - Optional column ID to hide; if not provided, hides all selected columns
   */
  const handleHideColumns = useCallback(
    (columnId) => {
      if (columnId) {
        setHiddenColumns((prev) => new Set(prev).add(columnId));
      } else {
        setHiddenColumns(selectedChildColumnIdsSet);
      }
      clearSelectedColumns();
      clearSelectedMatches();
    },
    [clearSelectedColumns, clearSelectedMatches, selectedChildColumnIdsSet]
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

  // This memoized variable groups columns into contiguous visible/hidden segments
  const columnIdVisibilityGroups = useMemo(
    () =>
      combinedChildColumnIds.reduce((acc, columnId, i) => {
        const isHidden = hiddenColumns.has(columnId);
        if (!isHidden) {
          acc.push({ columnIds: [columnId], isHidden });
        } else {
          const prev = acc[acc.length - 1];
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
    [combinedChildColumnIds, hiddenColumns]
  );

  return (
    <Box display={"flex"} flexDirection="column" height="100%">
      <EnhancedPackSchemaToolbar
        id={id}
        // clickedBlockCells={clickedBlockCells}
        clickedBlockCells={new Set()}
        areAnySelected={areAnySelected}
        onSelectAllClick={handleSelectAll}
        handleHideColumns={handleHideColumns}
      />
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
        <Box display="flex" flexDirection="column" minHeight="100%">
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
                <Box
                  textOverflow={"ellipsis"}
                  overflow={"hidden"}
                  whiteSpace={"nowrap"}
                >
                  {isTableId(childId) ? (
                    <EnhancedTableName
                      id={childId}
                      sx={{
                        fontSize: "0.75rem",
                        userSelect: "none",
                        fontWeight: "none",
                        // borderRight: `${childTablesSeparatorWidth}px solid ${cellBorderColor}`,
                      }}
                      // onMouseEnter={() => setHoveredColumn(`${childId}:`)}
                      // onMouseLeave={() => setHoveredColumn(null)}
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
                        height: "5px",
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
                          columnIds.forEach((colId) => nextSet.delete(colId));
                          return nextSet;
                        });
                      }}
                      sx={{
                        width: "10px",
                        height: "20px",
                      }}
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
                            }
                          : {}),
                        marginBottom: "2.5px",
                        marginTop: 0,
                        "@container (width < 50px)": {
                          textAlign: "left",
                          transform: `rotate(-10deg) translateX(20px)`,
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
                      onClick={handleColumnLabelClick}
                    />
                  )}
                </Box>
              );
            })}
          </Box>
          {matchKeys.map((key) => {
            const value = matchStats[key];
            // Check if any cells in this match category are selected
            const label = matchLabels.get(key) || key;
            const isMatchDisabled = !validMatchGroups.includes(key);

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
                    isMatchDisabled ? null : handleMatchLabelClick(event, key)
                  }
                >
                  <VennDiagram
                    label={label}
                    size={yAxisLabelWidth.replace("px", "")}
                    disabled={isMatchDisabled}
                    leftFill={
                      key === MATCH_TYPE_LEFT_UNMATCHED
                        ? vennFill
                        : "transparent"
                    }
                    rightFill={
                      key === MATCH_TYPE_RIGHT_UNMATCHED
                        ? vennFill
                        : "transparent"
                    }
                    overlapFill={
                      key === MATCH_TYPE_MATCHES ? vennFill : "white"
                    }
                  />
                  <Box display="flex" justifyContent="center" width={"100%"}>
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
                {columnIdVisibilityGroups.map(({ columnIds, isHidden }, j) => {
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
                  // const cellKey = `${columnId}:${key}`;
                  // const isClicked = clickedBlockCells.has(cellKey);
                  const isClicked =
                    selectedChildColumnIdsSet.has(columnId) &&
                    selectedMatches.includes(key);

                  // Calculate which borders to show for contiguous selection
                  let highlightTopBorder = false;
                  let highlightBottomBorder = false;
                  let highlightLeftBorder = false;
                  let highlightRightBorder = false;

                  // if (isClicked) {
                  //   // Find the match type index for this row
                  //   const currentMatchIndex = matchKeys.indexOf(key);
                  //   const currentColIndex =
                  //     combinedChildColumnIds.indexOf(columnId);

                  //   // Check cell above (previous match type)
                  //   if (currentMatchIndex > 0) {
                  //     const matchAbove = matchKeys[currentMatchIndex - 1];
                  //     const cellKeyAbove = `${columnId}:${matchAbove}`;
                  //     highlightTopBorder = !clickedBlockCells.has(cellKeyAbove);
                  //   } else {
                  //     highlightTopBorder = true; // First row
                  //   }

                  //   // Check cell below (next match type)
                  //   if (currentMatchIndex < matchKeys.length - 1) {
                  //     const matchBelow = matchKeys[currentMatchIndex + 1];
                  //     const cellKeyBelow = `${columnId}:${matchBelow}`;
                  //     highlightBottomBorder =
                  //       !clickedBlockCells.has(cellKeyBelow);
                  //   } else {
                  //     highlightBottomBorder = true; // Last row
                  //   }

                  //   // Check cell to the left
                  //   if (currentColIndex > 0) {
                  //     const colLeft =
                  //       combinedChildColumnIds[currentColIndex - 1];
                  //     const cellKeyLeft = `${colLeft}:${key}`;
                  //     highlightLeftBorder = !clickedBlockCells.has(cellKeyLeft);
                  //   } else {
                  //     highlightLeftBorder = true; // First column
                  //   }

                  //   // Check cell to the right
                  //   if (currentColIndex < combinedChildColumnIds.length - 1) {
                  //     const colRight =
                  //       combinedChildColumnIds[currentColIndex + 1];
                  //     const cellKeyRight = `${colRight}:${key}`;
                  //     highlightRightBorder =
                  //       !clickedBlockCells.has(cellKeyRight);
                  //   } else {
                  //     highlightRightBorder = true; // Last column
                  //   }
                  // }

                  // const borderWidth = "2px";

                  // Check if the cell to the right is also selected
                  // const currentColIndex = combinedChildColumnIds.indexOf(columnId);
                  // const hasRightNeighbor =
                  //   currentColIndex < combinedChildColumnIds.length - 1;
                  // const colRight = hasRightNeighbor
                  //   ? combinedChildColumnIds[currentColIndex + 1]
                  //   : null;

                  return (
                    <StyledBlockCell
                      key={columnId}
                      disabled={isMatchDisabled}
                      isEmpty={
                        (key === MATCH_TYPE_LEFT_UNMATCHED &&
                          j >= leftColumnIds.length) ||
                        (key === MATCH_TYPE_RIGHT_UNMATCHED &&
                          j < leftColumnIds.length)
                      }
                      isLastLeftColumn={isLastLeftColumn}
                      highlightTopBorder={highlightTopBorder}
                      highlightBottomBorder={highlightBottomBorder}
                      highlightLeftBorder={highlightLeftBorder}
                      highlightRightBorder={highlightRightBorder}
                      backgroundColor={colorScale(depth + 1)}
                      tableBorderWidth={childTablesSeparatorWidth}
                      defaultBorderColor={cellBorderColor}
                      isSelected={isClicked}
                      onClick={(event) => {
                        if (!isMatchDisabled) {
                          handleCellClick(event, columnId, key);
                        }
                      }}
                    />
                  );
                })}
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
            // TODO
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
};

PackSchemaView.displayName = "Pack Schema View";

const EnhancedPackSchemaView = withOperationData(
  withAssociatedAlerts(
    withPackOperationData(withGlobalInterfaceData(PackSchemaView))
  )
);

EnhancedPackSchemaView.displayName = "Enhanced Pack Schema View";

export default EnhancedPackSchemaView;
