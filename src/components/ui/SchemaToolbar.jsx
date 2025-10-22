/* eslint-disable react/prop-types */
import {
  ArrowDropDown,
  ClearAll,
  Delete as ExcludeIcon,
  SelectAll,
  TableView,
  Visibility,
} from "@mui/icons-material";
import { IconButton, Toolbar, Typography, Box } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import {
  excludeColumnFromTable,
  selectSelectedColumnIds,
  setFocusedColumnIds,
  setSelectedColumnIds,
} from "../../slices/columnsSlice";
import { useCallback } from "react";
import { TableIcon } from "lucide-react";
import { isTableId } from "../../slices/tablesSlice";
import { EnhancedTableLabel } from "../TableView";
import { EnhancedOperationLabel } from "../OperationView/OperationLabel";

const SchemaToolbar = ({ columnIds, objectId }) => {
  const dispatch = useDispatch();
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const areAllColumnsSelected =
    columnIds.length > 0 && selectedColumnIds.length === columnIds.length;

  const handleSelectAll = useCallback(() => {
    dispatch(setSelectedColumnIds(columnIds));
  }, [dispatch, columnIds]);

  const handleExcludeSelected = useCallback(() => {
    dispatch(excludeColumnFromTable(selectedColumnIds));
  }, [dispatch, selectedColumnIds]);

  const handleFocusSelected = useCallback(() => {
    dispatch(setFocusedColumnIds(selectedColumnIds));
  }, [dispatch, selectedColumnIds]);

  const handleClearSelection = useCallback(() => {
    dispatch(setSelectedColumnIds([]));
  }, [dispatch]);

  return (
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isTableId(objectId) ? (
          <EnhancedTableLabel id={objectId} />
        ) : (
          <EnhancedOperationLabel id={objectId} />
        )}
      </Box>

      {/* Action Buttons Section - Bulk operations for selected columns */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {/* Select All Columns */}
        <IconButton
          size="small"
          onClick={handleSelectAll}
          disabled={areAllColumnsSelected}
          title="Select all columns"
        >
          <SelectAll fontSize="small" />
        </IconButton>

        {/* Focus Selected Columns (max 2 for comparison) */}
        <IconButton
          size="small"
          onClick={handleFocusSelected}
          disabled={selectedColumnIds.length === 0}
          title="Focus on selected columns (1-2 columns only)"
          color="primary"
        >
          <Visibility fontSize="small" />
        </IconButton>

        {/* Change Column Type Dropdown */}
        {/* TODO when addressing column types */}
        {/* <IconButton
          size="small"
          // onClick={handleColumnTypeMenuOpen}
          //   disabled={selectedTableColumnIds.length === 0}
          title="Change column type"
        >
          <ArrowDropDown fontSize="small" />
        </IconButton> */}

        {/* Exclude Selected Columns */}
        <IconButton
          size="small"
          onClick={handleExcludeSelected}
          disabled={selectedColumnIds.length === 0}
          title="Exclude selected columns"
          color="error"
        >
          <ExcludeIcon fontSize="small" />
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
  );
};

export default SchemaToolbar;
