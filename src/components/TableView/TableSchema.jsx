/**
 * TableSchema Component
 *
 * A comprehensive table schema viewer that displays a table's columns as interactive cards
 * with a toolbar for performing bulk operations. This component provides a visual overview
 * of table structure and allows users to select, manipulate, and analyze columns.
 *
 * Features:
 * - Column selection (single, multi-select with Ctrl/Cmd, range selection with Shift)
 * - Bulk operations (select all, delete, focus, change column types)
 * - Interactive column cards showing statistics and data previews
 * - Horizontal scrolling for tables with many columns
 * - Real-time updates through Redux state management
 *
 * @component
 * @example
 * ```jsx
 * // Basic usage (typically wrapped with withTableData HOC)
 * <TableSchema
 *   table={tableObject}
 *   selectedColumnIds={[]}
 * />
 *
 * // Enhanced version with HOC (recommended usage)
 * <EnhancedTableSchema id="table-1" />
 * ```
 */

import {
  Box,
  Typography,
  Menu,
  MenuItem,
  IconButton,
  Divider,
  Tooltip,
} from "@mui/material";
import { withTableData, withAssociatedAlerts } from "../HOC";
import { useCallback, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setFocusedColumnIds } from "../../slices/uiSlice"; // TODO: this should be in HOC
import {
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_VARCHAR,
} from "../../slices/columnsSlice/Column";
import {
  EnhancedColumnContextMenuItems,
  EnhancedColumnSummary,
} from "../ColumnViews";
import ColumnDragContainer from "../ColumnViews/ColumnDragContainer";
import { HiddenColumnsButton } from "../ui/buttons";
import { EnhancedTableSchemaToolbar } from "./TableSchemaToolbar";

/**
 * TableSchema component renders a table's schema as a collection of interactive column cards
 *
 * @param {Object} props - Component props
 * @param {Object} props.table - Table object containing schema information
 * @param {string} props.name - Name of the table
 * @param {string[]} props.columnIds - Array of column IDs in the table
 * @param {number} [props.rowCount] - Number of rows in the table
 * @param {string[]} [props.selectedColumnIds=[]] - Array of currently selected column IDs
 * @returns {JSX.Element} The rendered TableSchema component
 */
const TableSchema = ({
  id,
  columnIds,
  selectedColumnIds,
  swapColumns,
  selectColumns,
  insertColumn,

  // Props from withAssociatedAlerts via withTableData
  totalCount,
}) => {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableSchema for table:", id);
  }
  const dispatch = useDispatch();
  const [columnTypeMenuAnchor, setColumnTypeMenuAnchor] = useState(null);
  const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
  const [contextMenuColumnId, setContextMenuColumnId] = useState(null);
  const columnContainerRef = useRef(null);
  //  const [visibleColumns, setVisibleColumns] = useState([]);
  const [hiddenColumnIds, setHiddenColumnIds] = useState([]);

  /**
   * Sync local visible columns state to parent/slice whenever it changes
   */
  // useEffect(() => {
  //   setVisibleColumnsInSlice(visibleColumns);
  // }, [visibleColumns, setVisibleColumnsInSlice]);

  /**
   * Set up scroll event listener on the column container
   */
  // useEffect(() => {
  //   const container = columnContainerRef.current;

  //   if (!container) return;

  //   const handleScroll = () => {
  //     // Get all column elements within the container
  //     const columnElements = container.querySelectorAll("[data-column-id]");
  //     const containerRect = container.getBoundingClientRect();
  //     const currentlyVisibleColumnIds = [];

  //     columnElements.forEach((element) => {
  //       const elementRect = element.getBoundingClientRect();

  //       // Check if element is at least partially visible within the container
  //       const isVisible =
  //         elementRect.left > containerRect.left &&
  //         elementRect.right < containerRect.right;

  //       if (isVisible) {
  //         const columnId = element.getAttribute("data-column-id");
  //         currentlyVisibleColumnIds.push(columnId);
  //       }
  //     });

  //     if (
  //       JSON.stringify(currentlyVisibleColumnIds) !==
  //       JSON.stringify(visibleColumns)
  //     ) {
  //       setVisibleColumns(currentlyVisibleColumnIds);
  //     }
  //   };

  //   container.addEventListener("scroll", handleScroll);

  //   return () => {
  //     container.removeEventListener("scroll", handleScroll);
  //   };
  // }, [visibleColumns]);

  /**
   * Closes the column type dropdown menu
   */
  const handleColumnTypeMenuClose = useCallback(() => {
    setColumnTypeMenuAnchor(null);
  }, []);

  /**
   * Changes the type of selected columns
   * @param {string|null} columnType - The new column type to apply, or null for auto-detect
   */
  const handleColumnTypeChange = useCallback(() => {
    if (selectedColumnIds.length > 0) {
      // TODO: why is this here? shouldn't it be in columns
      // dispatch(
      //   setColumnType({ ids: selectedColumnIds, columnTypes: columnType })
      // );
    }
    handleColumnTypeMenuClose();
  }, [selectedColumnIds, handleColumnTypeMenuClose]);

  /**
   * Handles column selection with support for contiguous selection only:
   * - Regular click: Replace current selection with clicked column
   * - Shift+click: Select range from last selected column to clicked column
   *
   * @param {Event} event - Click event containing modifier key information
   * @param {string} columnId - ID of the clicked column
   */
  const handleColumnClick = useCallback(
    (event, columnId) => {
      const isShift = event.shiftKey;
      const currentColumnIndex = columnIds.indexOf(columnId);

      if (isShift && selectedColumnIds.length > 0) {
        // Shift+click: Select range from last selected column to clicked column
        const lastSelectedColumnId = selectedColumnIds[0];
        const lastSelectedIndex = columnIds.indexOf(lastSelectedColumnId);

        if (lastSelectedIndex !== -1) {
          const startIndex = Math.min(currentColumnIndex, lastSelectedIndex);
          const endIndex = Math.max(currentColumnIndex, lastSelectedIndex);
          const rangeColumnIds = columnIds.slice(startIndex, endIndex + 1);

          // Add the range to selection (keeping existing selection)
          selectColumns(rangeColumnIds);
        } else {
          // Fallback to single selection if last selected column not found
          selectColumns([columnId]);
        }
      } else {
        // Regular click: Replace selection
        selectColumns([columnId]);
      }
    },
    [columnIds, selectedColumnIds, selectColumns]
  );

  /**
   * Handles double-click on a column to focus it for detailed viewing
   * @param {Event} event - Double-click event
   * @param {string} columnId - ID of the double-clicked column
   */
  const handleColumnDoubleClick = useCallback(
    (event, columnId) => {
      // Double-click: Focus on the column (same as focus button action)
      dispatch(setFocusedColumnIds([columnId]));
    },
    [dispatch]
  );

  const handleContextMenu = useCallback((event, columnId) => {
    event.preventDefault();
    setContextMenuAnchor({ left: event.clientX, top: event.clientY });
    setContextMenuColumnId(columnId);
  }, []);

  const handleContextMenuClose = useCallback(() => {
    setContextMenuAnchor(null);
    setContextMenuColumnId(null);
  }, []);

  const handleHideColumns = useCallback(() => {
    setHiddenColumnIds([...hiddenColumnIds, ...selectedColumnIds]);
  }, [hiddenColumnIds, selectedColumnIds]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      sx={{
        ...(totalCount && {
          border: "3px solid",
          borderColor: "warning.main",
          backgroundColor: "warning.light",
          borderRadius: 1,
        }),
      }}
    >
      {/* Toolbar with table info and action buttons */}
      <EnhancedTableSchemaToolbar id={id} hideColumns={handleHideColumns} />

      {/* Column Type Change Menu */}
      <Menu
        anchorEl={columnTypeMenuAnchor}
        open={Boolean(columnTypeMenuAnchor)}
        onClose={handleColumnTypeMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handleColumnTypeChange(COLUMN_TYPE_NUMERICAL)}>
          Numerical
        </MenuItem>
        <MenuItem
          onClick={() => handleColumnTypeChange(COLUMN_TYPE_CATEGORICAL)}
        >
          Categorical
        </MenuItem>
        <MenuItem onClick={() => handleColumnTypeChange(COLUMN_TYPE_VARCHAR)}>
          Text (VARCHAR)
        </MenuItem>
        <MenuItem onClick={() => handleColumnTypeChange(null)}>
          Auto-detect
        </MenuItem>
      </Menu>

      {/* Context Menu for Column */}
      <Menu
        open={Boolean(contextMenuAnchor)}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={contextMenuAnchor}
      >
        {contextMenuColumnId && (
          <EnhancedColumnContextMenuItems
            id={contextMenuColumnId}
            handleCloseMenu={handleContextMenuClose}
            onInsertColumnLeftClick={({ name, fillValue }) =>
              insertColumn(
                columnIds.indexOf(contextMenuColumnId),
                name,
                fillValue
              )
            }
            onInsertColumnRightClick={({ name, fillValue }) =>
              insertColumn(
                columnIds.indexOf(contextMenuColumnId) + 1,
                name,
                fillValue
              )
            }
            onHideColumn={() =>
              setHiddenColumnIds([...hiddenColumnIds, contextMenuColumnId])
            }
          />
        )}
      </Menu>

      {/* Column Cards Container - Horizontally scrollable grid of column summaries */}
      <Box
        ref={columnContainerRef}
        p={1}
        display={"flex"}
        flexDirection="row"
        alignContent={"flex-start"}
        flex="1 1 auto"
        gap={1}
        sx={{
          overflowX: "auto",
          overflowY: "hidden",
        }}
      >
        {/* Individual Column Cards - Each column rendered as a numbered card with summary */}
        {columnIds
          .reduce((acc, columnId, i) => {
            const isVisible = !hiddenColumnIds.includes(columnId);
            if (isVisible) {
              acc.push({ columnIds: [columnId], indices: [i], isVisible });
            } else {
              if (acc[acc.length - 1] && !acc[acc.length - 1].isVisible) {
                acc[acc.length - 1].columnIds.push(columnId);
                acc[acc.length - 1].indices.push(i);
              } else {
                acc.push({ columnIds: [columnId], indices: [i], isVisible });
              }
            }
            return acc;
          }, [])
          .map(({ columnIds, indices, isVisible }, i) => {
            return (
              <Box
                key={columnIds.join("-")}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  userSelect: "none",
                  ...(isVisible
                    ? {
                        flex: "1",
                      }
                    : {
                        flex: "0 0 auto",
                        width: "20px",
                      }),
                }}
              >
                <IconButton
                  size="small"
                  onClick={() => {
                    !isVisible
                      ? // TODO
                        setHiddenColumnIds((prev) =>
                          prev.filter((hid) => !columnIds.includes(hid))
                        )
                      : null;
                  }}
                  sx={{ borderRadius: 0 }}
                >
                  <Tooltip
                    title={
                      isVisible
                        ? `Column #${indices[0] + 1}`
                        : `Hidden columns at ${
                            indices[0] + 1
                          }. Click to unhide.`
                    }
                    arrow
                  >
                    <Box
                      width="100%"
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      {isVisible ? (
                        <Typography
                          variant="h6"
                          textAlign="center"
                          width="100%"
                          fontSize={"0.75rem"}
                          height="20px"
                          gutterBottom
                        >
                          {indices[0] + 1}
                        </Typography>
                      ) : (
                        <HiddenColumnsButton />
                      )}
                    </Box>
                  </Tooltip>
                </IconButton>
                {isVisible ? (
                  <>
                    <ColumnDragContainer
                      id={columnIds[0]}
                      columnIndex={i}
                      canDrag={
                        selectedColumnIds.includes(columnIds[0]) && isVisible
                      }
                      onDrop={(draggedItem, targetItem) => {
                        swapColumns(targetItem.id, draggedItem.id);
                      }}
                    >
                      {/* Interactive Column Summary Card that includes [data-column-id] */}
                      <EnhancedColumnSummary
                        id={columnIds[0]}
                        onClick={(event) =>
                          handleColumnClick(event, columnIds[0])
                        }
                        onDoubleClick={(event) =>
                          handleColumnDoubleClick(event, columnIds[0])
                        }
                        onContextMenu={(event) =>
                          handleContextMenu(event, columnIds[0])
                        }
                        isDraggable={selectedColumnIds.includes(columnIds[0])}
                        handleInsertColumnLeft={(value) =>
                          insertColumn(i, value)
                        }
                        handleInsertColumnRight={(value) =>
                          insertColumn(i + 1, value)
                        }
                        sx={{
                          backgroundColor: "#fff",
                        }}
                      />
                    </ColumnDragContainer>
                  </>
                ) : (
                  <Divider
                    orientation="vertical"
                    sx={{
                      marginLeft: "auto",
                      marginRight: "auto",
                    }}
                  />
                )}
              </Box>
            );
          })}
      </Box>
    </Box>
  );
};

// Set display name for debugging
TableSchema.displayName = "TableSchema";

/**
 * Enhanced TableSchema component wrapped with the withTableData HOC
 * This is the recommended export that automatically provides table data from Redux state
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Table ID to load data for
 * @returns {JSX.Element} The enhanced TableSchema component with automatic data loading
 */
const EnhancedTableSchema = withAssociatedAlerts(withTableData(TableSchema));

EnhancedTableSchema.displayName = "EnhancedTableSchema";

export { EnhancedTableSchema, TableSchema };
