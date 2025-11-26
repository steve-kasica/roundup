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

import { Box, Typography, Menu, MenuItem } from "@mui/material";
import withTableData from "./withTableData";
import { useCallback, useRef, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setFocusedColumnIds } from "../../slices/uiSlice"; // TODO: this should be in HOC
import {
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_VARCHAR,
} from "../../slices/columnsSlice/Column";
import { EnhancedColumnSummary } from "../ColumnViews";
import ColumnDragContainer from "../ColumnViews/ColumnDragContainer";
import SchemaToolbar from "../ui/SchemaToolbar";
import FocusIconButton from "../ui/FocusIconButton";
import HideIconButton from "../ui/HideIconButton";
import SelectToggleIconButton from "../ui/SelectToggleIconButton";
import { TableLabel } from "./TableLabel";
import DeleteIconButton from "../ui/icons/DeleteIconButton";

/**
 * TableSchema component renders a table's schema as a collection of interactive column cards
 *
 * @param {Object} props - Component props
 * @param {Object} props.table - Table object containing schema information
 * @param {string} props.name - Name of the table
 * @param {string[]} props.activeColumnIds - Array of column IDs in the table
 * @param {number} [props.rowCount] - Number of rows in the table
 * @param {string[]} [props.selectedColumnIds=[]] - Array of currently selected column IDs
 * @returns {JSX.Element} The rendered TableSchema component
 */
const TableSchema = ({
  id,
  rowCount,
  name,
  activeColumnIds,
  selectedColumnIds,
  columnCount,
  swapColumns,
  selectColumns,
  hideColumns,
  deleteColumns,
  focusColumns,
  insertColumn,
  setVisibleColumns: setVisibleColumnsInSlice,

  // Props from withAssociatedAlerts via withTableData
  alertIds, // eslint-disable-line no-unused-vars
  hasAlerts,
}) => {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableSchema for table:", id);
  }
  const dispatch = useDispatch();
  const [columnTypeMenuAnchor, setColumnTypeMenuAnchor] = useState(null);
  const columnContainerRef = useRef(null);
  const [visibleColumns, setVisibleColumns] = useState([]);

  /**
   * Sync local visible columns state to parent/slice whenever it changes
   */
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

        // Check if element is at least partially visible within the container
        const isVisible =
          elementRect.left > containerRect.left &&
          elementRect.right < containerRect.right;

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
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      const currentColumnIndex = activeColumnIds.indexOf(columnId);

      if (isShift && selectedColumnIds.length > 0) {
        // Shift+click: Select range from last selected column to clicked column
        const lastSelectedColumnId = selectedColumnIds[0];
        const lastSelectedIndex = activeColumnIds.indexOf(lastSelectedColumnId);

        if (lastSelectedIndex !== -1) {
          const startIndex = Math.min(currentColumnIndex, lastSelectedIndex);
          const endIndex = Math.max(currentColumnIndex, lastSelectedIndex);
          const rangeColumnIds = activeColumnIds.slice(
            startIndex,
            endIndex + 1
          );

          // Add the range to selection (keeping existing selection)
          selectColumns(rangeColumnIds);
        } else {
          // Fallback to single selection if last selected column not found
          selectColumns([columnId]);
        }
      } else if (isCtrlOrCmd) {
        // Ctrl/Cmd+click: Toggle selection
        if (selectedColumnIds.includes(columnId)) {
          selectColumns(selectedColumnIds.filter((id) => id !== columnId));
        } else {
          selectColumns([...selectedColumnIds, columnId]);
        }
      } else {
        // Regular click: Replace selection
        selectColumns([columnId]);
      }
    },
    [activeColumnIds, selectedColumnIds, selectColumns]
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

  const handleFocusColumns = useCallback(() => {
    focusColumns(selectedColumnIds);
  }, [focusColumns, selectedColumnIds]);

  const handleHideColumns = useCallback(() => {
    hideColumns(selectedColumnIds);
  }, [hideColumns, selectedColumnIds]);

  const handleDeleteColumns = useCallback(() => {
    deleteColumns(selectedColumnIds);
  }, [deleteColumns, selectedColumnIds]);

  const handleSelectAllColumns = useCallback(() => {
    if (selectedColumnIds.length > 0) {
      // All selected - deselect all
      selectColumns([]);
    } else {
      // Not all selected - select all
      selectColumns(activeColumnIds);
    }
  }, [activeColumnIds, selectedColumnIds, selectColumns]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      sx={{
        ...(hasAlerts && {
          border: "3px solid",
          borderColor: "warning.main",
          backgroundColor: "warning.light",
          borderRadius: 1,
        }),
      }}
    >
      {/* Toolbar with table info and action buttons */}
      <SchemaToolbar
        columnIds={activeColumnIds}
        columnCount={columnCount}
        rowCount={rowCount}
        name={name}
        objectId={id}
        alertIds={alertIds}
        customMenuItems={
          <>
            <FocusIconButton
              disabled={selectedColumnIds.length === 0}
              onClick={handleFocusColumns}
            />
            {/* TODO: implement Hide */}
            <DeleteIconButton
              disabled={selectedColumnIds.length === 0}
              onConfirm={handleDeleteColumns}
            />
            {/* <HideIconButton
              disabled={selectedColumnIds.length === 0}
              onClick={handleHideColumns}
            /> */}
            <SelectToggleIconButton
              isSelected={selectedColumnIds.length > 0}
              onClick={handleSelectAllColumns}
            />
          </>
        }
      >
        <TableLabel
          name={name}
          rowCount={rowCount}
          columnCount={activeColumnIds.length}
        />
      </SchemaToolbar>

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
        {activeColumnIds.map((columnId, i) => (
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

            <ColumnDragContainer
              id={columnId}
              columnIndex={i}
              canDrag={selectedColumnIds.includes(columnId)}
              onDrop={(draggedItem, targetItem) => {
                swapColumns(targetItem.id, draggedItem.id);
              }}
            >
              {/* Interactive Column Summary Card that includes [data-column-id] */}
              <EnhancedColumnSummary
                id={columnId}
                onClick={(event) => handleColumnClick(event, columnId)}
                onDoubleClick={(event) =>
                  handleColumnDoubleClick(event, columnId)
                }
                isDraggable={selectedColumnIds.includes(columnId)}
                handleInsertColumnLeft={() => insertColumn(i)}
                handleInsertColumnRight={() => insertColumn(i + 1)}
              />
            </ColumnDragContainer>
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

EnhancedTableSchema.displayName = "EnhancedTableSchema";

export { EnhancedTableSchema, TableSchema };
