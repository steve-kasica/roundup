import { useCallback } from "react";
import { EnhancedSchemaToolbar, OBJECT_TYPE_TABLE } from "../ui/SchemaToolbar";
import { withTableData } from "../HOC";

const TableSchemaToolbar = ({
  id,
  // Props passed via `withTableData.jsx` HOC
  name,
  rowCount,
  columnCount,
  focusColumns,
  deleteColumns,
  selectColumns,
  columnIds,
  selectedColumnIds,
  setTableName,

  // Props passed directly from parent component (TableSchema.jsx)
  hideColumns,
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
      selectColumns(columnIds);
    }
  }, [columnIds, selectedColumnIds, selectColumns]);

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
      objectType={OBJECT_TYPE_TABLE}
      onFocusColumns={handleFocusColumns}
      onHideColumns={handleHideColumns}
      onDeleteColumns={handleDeleteColumns}
      onSelectToggleColumns={handleSelectAllColumns}
      onRenameConfirm={handleRenameConfirm}
      isFocusedDisabled={selectedColumnIds.length === 0}
      isHideDisabled={selectedColumnIds.length === 0}
      isDeleteDisabled={selectedColumnIds.length === 0}
      isSelectToggleSelected={
        selectedColumnIds.length === columnIds.length && columnIds.length > 0
      }
    />
  );
};

const EnhancedTableSchemaToolbar = withTableData(TableSchemaToolbar);

export { TableSchemaToolbar, EnhancedTableSchemaToolbar };
