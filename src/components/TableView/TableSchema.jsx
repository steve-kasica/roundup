/**
 * @fileoverview TableSchema Component
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
 * - Integration with HOCs for table data
 *
 * @module components/TableView/TableSchema
 *
 * @example
 * <EnhancedTableSchema id={tableId} />
 */

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
  Divider,
  Table,
  TableBody,
  TableHead,
  TableRow,
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
import StyledTableCell from "../StackOperationView/StackSchemaView/StyledTableCell";

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
  hiddenColumnIds,
  swapColumns,
  selectColumns,
  insertColumn,
  unhideColumns,

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
  const [selectedAnchorColumnId, setSelectedAnchorColumnId] = useState(null);
  const columnContainerRef = useRef(null);

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
   * - Shift+click: Select range from anchor column to clicked column
   *
   * @param {Event} event - Click event containing modifier key information
   * @param {string} columnId - ID of the clicked column
   */
  const handleColumnClick = useCallback(
    (event, columnId) => {
      const isShift = event.shiftKey;
      const currentColumnIndex = columnIds.indexOf(columnId);

      if (isShift && selectedAnchorColumnId) {
        // Shift+click: Select range from anchor column to clicked column
        const anchorIndex = columnIds.indexOf(selectedAnchorColumnId);

        if (anchorIndex !== -1) {
          const startIndex = Math.min(currentColumnIndex, anchorIndex);
          const endIndex = Math.max(currentColumnIndex, anchorIndex);
          const rangeColumnIds = columnIds.slice(startIndex, endIndex + 1);

          selectColumns(rangeColumnIds);
        } else {
          // Fallback to single selection if anchor not found
          selectColumns([columnId]);
          setSelectedAnchorColumnId(columnId);
        }
      } else {
        // Regular click: Replace selection and set anchor
        selectColumns([columnId]);
        setSelectedAnchorColumnId(columnId);
      }
    },
    [columnIds, selectedAnchorColumnId, selectColumns],
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
    [dispatch],
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

  const handleColumnDrop = useCallback(
    (draggedItem, targetItem) => {
      swapColumns(targetItem.id, draggedItem.id);
    },
    [swapColumns],
  );

  return (
    <Box
      className="TableSchema"
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
      {/* Column Type Change Menu */}
      <Menu
        anchorEl={columnTypeMenuAnchor}
        open={Boolean(columnTypeMenuAnchor)}
        onClose={handleColumnTypeMenuClose}
        aria-label="Change column type"
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
        aria-label="Column actions"
      >
        {contextMenuColumnId && (
          <EnhancedColumnContextMenuItems
            id={contextMenuColumnId}
            handleCloseMenu={handleContextMenuClose}
            onInsertColumnLeftClick={({ name, fillValue }) =>
              insertColumn(
                columnIds.indexOf(contextMenuColumnId),
                name,
                fillValue,
              )
            }
            onInsertColumnRightClick={({ name, fillValue }) =>
              insertColumn(
                columnIds.indexOf(contextMenuColumnId) + 1,
                name,
                fillValue,
              )
            }
            onHideColumn={() => {
              // TODO
            }}
          />
        )}
      </Menu>

      {/* Column Cards Container - Table layout matching StackSchemaView */}
      <Box
        ref={columnContainerRef}
        className="data-container"
        sx={{
          flex: 1,
          overflow: "auto",
          borderRadius: 1,
          border: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: (theme) => theme.palette.background.paper,
        }}
      >
        <Table
          className="table-schema-table"
          sx={{
            borderCollapse: "separate",
            borderSpacing: "8px",
            width: "100%",
            height: "100%",
            tableLayout: "fixed",
            backgroundColor: "#fafafa",
          }}
        >
          <TableHead>
            <TableRow sx={{ background: "#fafafa" }}>
              {columnIds
                .reduce((acc, columnId, i) => {
                  const isVisible = !hiddenColumnIds.includes(columnId);
                  if (isVisible) {
                    acc.push({ type: "visible", columnId, index: i });
                  } else {
                    const prev = acc[acc.length - 1];
                    if (prev && prev.type === "hidden") {
                      prev.columnIds.push(columnId);
                      prev.indices.push(i);
                    } else {
                      acc.push({
                        type: "hidden",
                        columnIds: [columnId],
                        indices: [i],
                      });
                    }
                  }
                  return acc;
                }, [])
                .map((group, idx) => {
                  if (group.type === "visible") {
                    return (
                      <StyledTableCell
                        key={`h-${group.index}`}
                        sx={{
                          textAlign: "center",
                          cursor: "pointer",
                          minWidth: 125,
                          width: 125,
                          borderColor: "transparent",
                        }}
                      >
                        <Typography
                          variant="data-small"
                          sx={{ userSelect: "none" }}
                        >
                          {group.index + 1}
                        </Typography>
                      </StyledTableCell>
                    );
                  } else {
                    return (
                      <StyledTableCell
                        key={`h-hidden-${idx}`}
                        colSpan={group.indices.length}
                        sx={{
                          minWidth: "20px",
                          width: "20px",
                          textAlign: "center",
                          borderColor: "transparent",
                          cursor: "pointer",
                        }}
                        onClick={() => unhideColumns(group.columnIds)}
                      >
                        <HiddenColumnsButton count={group.indices.length} />
                      </StyledTableCell>
                    );
                  }
                })}
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              {columnIds
                .reduce((acc, columnId, i) => {
                  const isVisible = !hiddenColumnIds.includes(columnId);
                  if (isVisible) {
                    acc.push({ type: "visible", columnId, index: i });
                  } else {
                    const prev = acc[acc.length - 1];
                    if (prev && prev.type === "hidden") {
                      prev.columnIds.push(columnId);
                      prev.indices.push(i);
                    } else {
                      acc.push({
                        type: "hidden",
                        columnIds: [columnId],
                        indices: [i],
                      });
                    }
                  }
                  return acc;
                }, [])
                .map((group, idx) => {
                  if (group.type === "visible") {
                    const { columnId, index: colIndex } = group;
                    const isSelected = selectedColumnIds.includes(columnId);
                    return (
                      <StyledTableCell key={columnId} isSelected={isSelected}>
                        <ColumnDragContainer
                          id={columnId}
                          parentId={id}
                          columnIndex={colIndex}
                          canDrag={isSelected}
                          onDrop={handleColumnDrop}
                        >
                          <EnhancedColumnSummary
                            id={columnId}
                            onClick={(event) =>
                              handleColumnClick(event, columnId)
                            }
                            onDoubleClick={(event) =>
                              handleColumnDoubleClick(event, columnId)
                            }
                            onContextMenu={(event) =>
                              handleContextMenu(event, columnId)
                            }
                            isDraggable={isSelected}
                            handleInsertColumnLeft={(value) =>
                              insertColumn(colIndex, value)
                            }
                            handleInsertColumnRight={(value) =>
                              insertColumn(colIndex + 1, value)
                            }
                            sx={{
                              minHeight: 30,
                              backgroundColor: (theme) =>
                                theme.palette.background.paper,
                              color: (theme) =>
                                theme.palette.getContrastText(
                                  theme.palette.background.paper,
                                ),
                              borderRadius: 1,
                              backgroundImage:
                                "linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))",
                              transition:
                                "box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1)",
                              boxShadow: 1,
                              "&:hover": {
                                boxShadow: 3,
                              },
                            }}
                          />
                        </ColumnDragContainer>
                      </StyledTableCell>
                    );
                  } else {
                    return (
                      <StyledTableCell
                        key={`hidden-${idx}`}
                        colSpan={group.indices.length}
                        sx={{ borderColor: "transparent" }}
                      >
                        <Divider
                          orientation="vertical"
                          sx={{
                            marginLeft: "auto",
                            marginRight: "auto",
                          }}
                        />
                      </StyledTableCell>
                    );
                  }
                })}
            </TableRow>
          </TableBody>
        </Table>
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
