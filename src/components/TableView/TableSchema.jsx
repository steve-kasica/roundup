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

/* eslint-disable react/prop-types */

import {
  Box,
  Typography,
  IconButton,
  Toolbar,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  ClearAll,
  SelectAll,
  Delete,
  Visibility,
  TableChart,
  ArrowDropDown,
} from "@mui/icons-material";
import withTableData from "./withTableData";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import {
  setSelectedColumns,
  appendToSelectedColumns,
  removeFromSelectedColumns,
  clearSelectedColumns,
  dropColumns,
  setFocusedColumns,
  setColumnType,
} from "../../slices/columnsSlice";
import {
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_VARCHAR,
} from "../../slices/columnsSlice/Column";
import { EnhancedColumnSummary } from "../ColumnViews";

/**
 * TableSchema component renders a table's schema as a collection of interactive column cards
 *
 * @param {Object} props - Component props
 * @param {Object} props.table - Table object containing schema information
 * @param {string} props.table.name - Name of the table
 * @param {string[]} props.table.columnIds - Array of column IDs in the table
 * @param {number} [props.table.rowCount] - Number of rows in the table
 * @param {string[]} [props.selectedColumnIds=[]] - Array of currently selected column IDs
 * @returns {JSX.Element} The rendered TableSchema component
 */
const TableSchema = ({ table, selectedColumnIds = [] }) => {
  const dispatch = useDispatch();
  const [columnTypeMenuAnchor, setColumnTypeMenuAnchor] = useState(null);

  /**
   * Clears all selected columns
   */
  const handleClearSelection = useCallback(() => {
    dispatch(clearSelectedColumns());
  }, [dispatch]);

  /**
   * Selects all columns in the table
   */
  const handleSelectAll = useCallback(() => {
    dispatch(setSelectedColumns(table.columnIds));
  }, [dispatch, table.columnIds]);

  /**
   * Deletes the currently selected columns and clears the selection
   */
  const handleDeleteSelected = useCallback(() => {
    if (selectedColumnIds.length > 0) {
      dispatch(dropColumns(selectedColumnIds));
      dispatch(clearSelectedColumns());
    }
  }, [dispatch, selectedColumnIds]);

  /**
   * Sets focus on selected columns for detailed view (limited to 1-2 columns)
   */
  const handleFocusSelected = useCallback(() => {
    if (selectedColumnIds.length > 0 && selectedColumnIds.length <= 2) {
      dispatch(setFocusedColumns(selectedColumnIds));
    }
  }, [dispatch, selectedColumnIds]);

  /**
   * Opens the column type dropdown menu
   * @param {Event} event - Click event from the dropdown button
   */
  const handleColumnTypeMenuOpen = useCallback((event) => {
    setColumnTypeMenuAnchor(event.currentTarget);
  }, []);

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
  const handleColumnTypeChange = useCallback(
    (columnType) => {
      if (selectedColumnIds.length > 0) {
        dispatch(
          setColumnType({ ids: selectedColumnIds, columnTypes: columnType })
        );
      }
      handleColumnTypeMenuClose();
    },
    [dispatch, selectedColumnIds, handleColumnTypeMenuClose]
  );

  /**
   * Handles column selection with support for multiple selection modes:
   * - Regular click: Replace current selection with clicked column
   * - Ctrl/Cmd+click: Toggle clicked column in selection
   * - Shift+click: Select range from last selected column to clicked column
   *
   * @param {Event} event - Click event containing modifier key information
   * @param {string} columnId - ID of the clicked column
   */
  const handleColumnClick = useCallback(
    (event, columnId) => {
      const columnIds = table.columnIds;
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const currentColumnIndex = columnIds.indexOf(columnId);

      if (isShift && selectedColumnIds.length > 0) {
        // Shift+click: Select range from last selected column to clicked column
        const lastSelectedColumnId =
          selectedColumnIds[selectedColumnIds.length - 1];
        const lastSelectedIndex = columnIds.indexOf(lastSelectedColumnId);

        if (lastSelectedIndex !== -1) {
          const startIndex = Math.min(currentColumnIndex, lastSelectedIndex);
          const endIndex = Math.max(currentColumnIndex, lastSelectedIndex);
          const rangeColumnIds = columnIds.slice(startIndex, endIndex + 1);

          // Add the range to selection (keeping existing selection)
          dispatch(
            setSelectedColumns([
              ...selectedColumnIds,
              ...rangeColumnIds.filter((id) => !selectedColumnIds.includes(id)),
            ])
          );
        } else {
          // Fallback to single selection if last selected column not found
          dispatch(setSelectedColumns([columnId]));
        }
      } else if (isCtrlOrCmd) {
        // Ctrl/Cmd+click: Toggle selection
        if (selectedColumnIds.includes(columnId)) {
          dispatch(removeFromSelectedColumns([columnId]));
        } else {
          dispatch(appendToSelectedColumns([columnId]));
        }
      } else {
        // Regular click: Replace selection
        dispatch(setSelectedColumns([columnId]));
      }
    },
    [dispatch, table.columnIds, selectedColumnIds]
  );

  /**
   * Handles double-click on a column to focus it for detailed viewing
   * @param {Event} event - Double-click event
   * @param {string} columnId - ID of the double-clicked column
   */
  const handleColumnDoubleClick = useCallback(
    (event, columnId) => {
      // Double-click: Focus on the column (same as focus button action)
      dispatch(setFocusedColumns([columnId]));
    },
    [dispatch]
  );

  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Toolbar with table info and action buttons */}
      <Toolbar
        variant="dense"
        sx={{
          minHeight: 48,
          px: 1,
          borderBottom: 1,
          borderColor: "divider",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        {/* Table Information Section - Shows table name and dimensions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <TableChart fontSize="small" color="action" />
          <Typography
            variant="subtitle2"
            fontWeight="bold"
            color="text.primary"
          >
            {table.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {table.columnIds.length} x {table.rowCount?.toLocaleString() || 0}
          </Typography>
        </Box>

        {/* Action Buttons Section - Bulk operations for selected columns */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {/* Select All Columns */}
          <IconButton
            size="small"
            onClick={handleSelectAll}
            disabled={selectedColumnIds.length === table.columnIds.length}
            title="Select all columns"
          >
            <SelectAll fontSize="small" />
          </IconButton>

          {/* Focus Selected Columns (max 2 for comparison) */}
          <IconButton
            size="small"
            onClick={handleFocusSelected}
            disabled={
              selectedColumnIds.length === 0 || selectedColumnIds.length > 1
            }
            title="Focus on selected columns (1-2 columns only)"
            color="primary"
          >
            <Visibility fontSize="small" />
          </IconButton>

          {/* Change Column Type Dropdown */}
          <IconButton
            size="small"
            onClick={handleColumnTypeMenuOpen}
            disabled={selectedColumnIds.length === 0}
            title="Change column type"
          >
            <ArrowDropDown fontSize="small" />
          </IconButton>

          {/* Delete Selected Columns */}
          <IconButton
            size="small"
            onClick={handleDeleteSelected}
            disabled={selectedColumnIds.length === 0}
            title="Delete selected columns"
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>

          {/* Clear Selection */}
          <IconButton
            size="small"
            onClick={handleClearSelection}
            disabled={selectedColumnIds.length === 0}
            title="Clear selection"
          >
            <ClearAll fontSize="small" />
          </IconButton>
        </Box>
      </Toolbar>

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

      {/* Column Cards Container - Horizontally scrollable grid of column summaries */}
      <Box
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
        {table.columnIds.map((columnId, i) => (
          <Box
            key={columnId}
            sx={{
              display: "flex",
              flexDirection: "column",
              flex: "0 0 auto",
              minWidth: 200,
              width: 200,
              userSelect: "none",
            }}
          >
            {/* Column Number Header */}
            <Typography
              variant="h6"
              textAlign="center"
              width="100%"
              gutterBottom
            >
              {i + 1}
            </Typography>

            {/* Interactive Column Summary Card */}
            <EnhancedColumnSummary
              id={columnId}
              onClick={(event) => handleColumnClick(event, columnId)}
              onDoubleClick={(event) =>
                handleColumnDoubleClick(event, columnId)
              }
            />
          </Box>
        ))}
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
const EnhancedTableSchema = withTableData(TableSchema);

export { EnhancedTableSchema, TableSchema };
