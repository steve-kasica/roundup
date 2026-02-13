/**
 * @fileoverview PackSchemaView Component
 *
 * An interactive schema visualization for PACK (join) operations showing how columns
 * from two tables are combined. Displays a grid where rows represent match groups
 * (matched, left-only, right-only) and columns represent the combined column set.
 *
 * This is one of the most complex visualizations in the application, providing:
 * - Visual join key indicators
 * - Match type coloring and selection
 * - Column selection and hiding
 * - Context menus for column operations
 * - Venn diagram match statistics
 * - Range selection support
 *
 * The component uses a block-based grid layout similar to UpSet plots to show
 * which values appear in which match categories.
 *
 * @module components/PackOperationView/PackSchemaView
 *
 * @example
 * <EnhancedPackSchemaView id="pack-operation-123" />
 */

/* eslint-disable no-unused-vars */
import {
  Box,
  Divider,
  Menu,
  MenuItem,
  Skeleton,
  CircularProgress,
  Badge,
  Stack,
  IconButton,
  Typography,
} from "@mui/material";
import {
  withOperationData,
  withPackOperationData,
  withAssociatedAlerts,
  withGlobalInterfaceData,
} from "../HOC";
import { useCallback, useState, useMemo } from "react";
import { Error } from "@mui/icons-material";
import VennDiagram from "../ui/icons/VennDiagram";
import { EnhancedTableName } from "../TableView/TableName";
import { isTableId } from "../../slices/tablesSlice";
import HiddenColumnsLabel from "./HiddenColumnsLabel";
import StyledBlockCell from "./StyledBlockCell";
import {
  JOIN_TYPES,
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
} from "../../slices/operationsSlice";
import { EnhancedColumnLabel } from "./ColumnLabel";
import { IntegerNumber } from "../ui/text";

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
  hiddenChildColumnIds,
  selectColumns,
  clearSelectedColumns,
  isLoading,
  colorScale,
  depth,
  operationIndex,
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
          colEnd + 1,
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
    ],
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
    ],
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
    ],
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
          colEnd + 1,
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
    ],
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

  const handleSetAsKeyClick = useCallback(
    (columnId) => {
      // Determine which child table/operation this column belongs to
      if (leftColumnIds.includes(columnId)) {
        setLeftTableJoinKey(columnId);
      } else {
        setRightTableJoinKey(columnId);
      }
    },
    [leftColumnIds, setLeftTableJoinKey, setRightTableJoinKey],
  );

  // This memoized variable groups columns into contiguous visible/hidden segments
  const columnIdVisibilityGroups = useMemo(() => {
    const hiddenChildColumnsSet = new Set(hiddenChildColumnIds.flat());
    return combinedChildColumnIds.reduce((acc, columnId, i) => {
      const isHidden = hiddenChildColumnsSet.has(columnId);
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
    }, []);
  }, [combinedChildColumnIds, hiddenChildColumnIds]);

  return (
    <Box display={"flex"} flexDirection="column" height="100%">
      <Box
        display={"flex"}
        flexDirection={"column"}
        alignItems={"stretch"}
        justifyContent={"flex-start"}
        flex={1}
        gap={0.5}
        padding={1}
        sx={{
          backgroundColor: "background.paper",
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
              {
                childId: leftTableId,
                columnCount:
                  leftColumnIds.length - hiddenChildColumnIds[0]?.length || 0,
              },
              {
                childId: rightTableId,
                columnCount:
                  rightColumnIds.length - hiddenChildColumnIds[1]?.length || 0,
              },
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
                      }}
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
                    <HiddenColumnsLabel columnIds={columnIds} />
                  ) : (
                    <EnhancedColumnLabel
                      id={columnIds[0]}
                      onClick={(event) =>
                        handleColumnLabelClick(event, columnIds[0])
                      }
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
                    alignItems: "center",
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
                  <IconButton disabled={isMatchDisabled} size="small">
                    <VennDiagram
                      label={label}
                      size={yAxisLabelWidth.replace("px", "")}
                      joinType={
                        key === MATCH_TYPE_LEFT_UNMATCHED
                          ? JOIN_TYPES.LEFT_ANTI
                          : key === MATCH_TYPE_RIGHT_UNMATCHED
                            ? JOIN_TYPES.RIGHT_ANTI
                            : JOIN_TYPES.INNER
                      }
                    />
                  </IconButton>
                  <Box display="flex" justifyContent="center" width={"100%"}>
                    {isLoading ? (
                      <CircularProgress size={15} />
                    ) : errorCount > 0 ? (
                      <Error color="error" />
                    ) : (
                      <Typography
                        variant="data-small"
                        sx={{
                          opacity: isMatchDisabled ? 0.5 : 1,
                        }}
                      >
                        <IntegerNumber value={value} />
                      </Typography>
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
                  const isLastLeftColumn =
                    j ===
                    leftColumnIds.length -
                      1 -
                      (hiddenChildColumnIds[0]?.length || 0);
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

                  if (isClicked) {
                    const currentMatchIndex = matchKeys.indexOf(key);
                    const currentColIndex =
                      combinedChildColumnIds.indexOf(columnId);

                    // Check cell above
                    if (currentMatchIndex > 0) {
                      const matchAbove = matchKeys[currentMatchIndex - 1];
                      highlightTopBorder =
                        !selectedMatches.includes(matchAbove);
                    } else {
                      highlightTopBorder = true;
                    }

                    // Check cell below
                    if (currentMatchIndex < matchKeys.length - 1) {
                      const matchBelow = matchKeys[currentMatchIndex + 1];
                      highlightBottomBorder =
                        !selectedMatches.includes(matchBelow);
                    } else {
                      highlightBottomBorder = true;
                    }

                    // Check cell to the left
                    if (currentColIndex > 0) {
                      const colLeft =
                        combinedChildColumnIds[currentColIndex - 1];
                      highlightLeftBorder =
                        !selectedChildColumnIdsSet.has(colLeft);
                    } else {
                      highlightLeftBorder = true;
                    }

                    // Check cell to the right
                    if (currentColIndex < combinedChildColumnIds.length - 1) {
                      const colRight =
                        combinedChildColumnIds[currentColIndex + 1];
                      highlightRightBorder =
                        !selectedChildColumnIdsSet.has(colRight);
                    } else {
                      highlightRightBorder = true;
                    }
                  }

                  return (
                    <Box
                      key={columnId}
                      sx={{
                        flex: 1,
                        minWidth: 0,
                        height: "100%",
                        border: "1px solid white",
                        marginRight: isLastLeftColumn
                          ? `${childTablesSeparatorWidth}px`
                          : 0,
                        borderTopColor: highlightTopBorder ? "black" : "white",
                        borderBottomColor: highlightBottomBorder
                          ? "black"
                          : "white",
                        borderLeftColor: highlightLeftBorder
                          ? "black"
                          : "white",
                        borderRightColor: highlightRightBorder
                          ? "black"
                          : "white",
                      }}
                    >
                      <StyledBlockCell
                        isSelected={isClicked}
                        isDisabled={isMatchDisabled}
                        isNull={
                          (key === MATCH_TYPE_LEFT_UNMATCHED &&
                            j >= leftColumnIds.length) ||
                          (key === MATCH_TYPE_RIGHT_UNMATCHED &&
                            j < leftColumnIds.length)
                        }
                        onClick={(event) => {
                          if (!isMatchDisabled) {
                            handleCellClick(event, columnId, key);
                          }
                        }}
                        operationIndex={
                          isTableId(tableId)
                            ? operationIndex
                            : operationIndex - 1
                        }
                      />
                    </Box>
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
            // handleDeleteColumns(contextMenuColumnId);
            handleCloseContextMenu();
          }}
        >
          Delete Column
        </MenuItem>
        <MenuItem onClick={handleCloseContextMenu}>Rename Column</MenuItem>
        <MenuItem
          onClick={() => {
            // handleHideColumns(contextMenuColumnId);
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
    withPackOperationData(withGlobalInterfaceData(PackSchemaView)),
  ),
);

EnhancedPackSchemaView.displayName = "Enhanced Pack Schema View";

export default EnhancedPackSchemaView;
