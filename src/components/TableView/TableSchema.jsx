/* eslint-disable react/prop-types */

import {
  Box,
  Card,
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
import { ColumnSummary } from "../ColumnViews/ColumnSummary";

const TableSchema = ({ table, selectedColumnIds = [] }) => {
  const dispatch = useDispatch();
  const [columnTypeMenuAnchor, setColumnTypeMenuAnchor] = useState(null);

  const handleClearSelection = useCallback(() => {
    dispatch(clearSelectedColumns());
  }, [dispatch]);

  const handleSelectAll = useCallback(() => {
    dispatch(setSelectedColumns(table.columnIds));
  }, [dispatch, table.columnIds]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedColumnIds.length > 0) {
      dispatch(dropColumns(selectedColumnIds));
      dispatch(clearSelectedColumns());
    }
  }, [dispatch, selectedColumnIds]);

  const handleFocusSelected = useCallback(() => {
    if (selectedColumnIds.length > 0 && selectedColumnIds.length <= 2) {
      dispatch(setFocusedColumns(selectedColumnIds));
    }
  }, [dispatch, selectedColumnIds]);

  const handleColumnTypeMenuOpen = useCallback((event) => {
    setColumnTypeMenuAnchor(event.currentTarget);
  }, []);

  const handleColumnTypeMenuClose = useCallback(() => {
    setColumnTypeMenuAnchor(null);
  }, []);

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

  const handleColumnDoubleClick = useCallback(
    (event, columnId) => {
      // Double-click: Focus on the column (same as focus button action)
      dispatch(setFocusedColumns([columnId]));
    },
    [dispatch]
  );
  return (
    <Box display="flex" flexDirection="column" height="100%">
      {/* Toolbar */}
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
        {/* Table Info */}
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

        {/* Actions */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton
            size="small"
            onClick={handleSelectAll}
            disabled={selectedColumnIds.length === table.columnIds.length}
            title="Select all columns"
          >
            <SelectAll fontSize="small" />
          </IconButton>
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
          <IconButton
            size="small"
            onClick={handleColumnTypeMenuOpen}
            disabled={selectedColumnIds.length === 0}
            title="Change column type"
          >
            <ArrowDropDown fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleDeleteSelected}
            disabled={selectedColumnIds.length === 0}
            title="Delete selected columns"
            color="error"
          >
            <Delete fontSize="small" />
          </IconButton>
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

      {/* Column Type Menu */}
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

      {/* Column Cards Container */}
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
        {/* Column Cards Grid */}
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
            <Typography
              variant="h6"
              textAlign="center"
              width="100%"
              gutterBottom
            >
              {i + 1}
            </Typography>
            <Card
              key={columnId}
              sx={{
                p: 1,
                flex: "1 1 0",
                minHeight: 0,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                overflow: "hidden",
                border: selectedColumnIds.includes(columnId)
                  ? "2px solid"
                  : "1px solid transparent",
                borderColor: selectedColumnIds.includes(columnId)
                  ? "primary.main"
                  : "divider",
                backgroundColor: selectedColumnIds.includes(columnId)
                  ? "action.selected"
                  : "background.paper",
                "&:hover": {
                  backgroundColor: selectedColumnIds.includes(columnId)
                    ? "action.selected"
                    : "action.hover",
                },
              }}
              onClick={(event) => handleColumnClick(event, columnId)}
              onDoubleClick={(event) =>
                handleColumnDoubleClick(event, columnId)
              }
            >
              <ColumnSummary id={columnId} />
            </Card>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

TableSchema.displayName = "TableSchema";

const EnhancedTableSchema = withTableData(TableSchema);

export { EnhancedTableSchema as TableSchema };
