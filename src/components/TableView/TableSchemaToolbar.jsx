import { useCallback } from "react";
import { EnhancedSchemaToolbar } from "../ui/SchemaToolbar";
import withTableData from "./withTableData";
import { TableLabel } from "./TableLabel";
import { Chip, Stack, Typography } from "@mui/material";
import { TableIcon } from "../ui/icons";

const TableSchemaToolbar = ({
  id,
  // Props passed via `withTableData.jsx` HOC
  name,
  rowCount,
  columnCount,
  focusColumns, // Sets focused column IDs globally
  hideColumns, // Hides columns globally
  deleteColumns, // Deletes columns globally
  selectColumns, // Sets global set of selected column IDs
  activeColumnIds,
  selectedColumnIds,
  setTableName, // Sets the table name globally
}) => {
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

  const handleRenameConfirm = useCallback(
    (newName) => setTableName(newName),
    [id]
  );

  return (
    <EnhancedSchemaToolbar
      id={id}
      title={name}
      rowCount={rowCount}
      columnCount={columnCount}
      onFocusColumns={handleFocusColumns}
      onHideColumns={handleHideColumns}
      onDeleteColumns={handleDeleteColumns}
      onSelectToggleColumns={handleSelectAllColumns}
      onRenameConfirm={handleRenameConfirm}
      isFocusedDisabled={selectedColumnIds.length === 0}
      isHideDisabled={selectedColumnIds.length === 0}
      isDeleteDisabled={selectedColumnIds.length === 0}
      isSelectToggleSelected={
        selectedColumnIds.length === activeColumnIds.length &&
        activeColumnIds.length > 0
      }
    />
  );
};

const EnhancedTableSchemaToolbar = withTableData(TableSchemaToolbar);

export { TableSchemaToolbar, EnhancedTableSchemaToolbar };
