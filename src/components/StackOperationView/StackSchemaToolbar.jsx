import { EnhancedSchemaToolbar } from "../ui/SchemaToolbar";
import { useCallback, useMemo } from "react";
import withStackOperationData from "./withStackOperationData";
import { Chip, Stack, Typography } from "@mui/material";
import { StackOperationIcon } from "../ui/icons";

const StackSchemaToolbar = ({
  // Props passed via `withOperationData.jsx` HOC
  rowCount,
  columnCount,
  name,
  id,
  selectedChildColumnIdsSet,
  deleteColumns, // Deletes columns globally
  focusColumns, // Sets focused column IDs globally
  selectColumns, // Sets global set of selected column IDs
  clearSelectedColumns, // Clears the global set of selected column IDs
  setOperationName,

  // Props passed via `withStackOperationData.jsx` HOC
  columnIdMatrix,
  m,
  activeColumnIds,

  // Props passed directly from the parent component
  handleHideColumns,
}) => {
  const isSelectionEmpty = useMemo(
    () => selectedChildColumnIdsSet.size === 0,
    [selectedChildColumnIdsSet]
  );

  const isCompleteColumnSelected = useCallback(() => {
    // Check if there's at least one column index where all cells are selected
    for (let colIndex = 0; colIndex < m; colIndex++) {
      const columnIds = columnIdMatrix
        .map((row) => row[colIndex])
        .filter((id) => id !== null);

      const allSelected = columnIds.every((id) =>
        selectedChildColumnIdsSet.has(id)
      );

      if (allSelected && columnIds.length > 0) {
        return true;
      }
    }
    return false;
  }, [columnIdMatrix, m, selectedChildColumnIdsSet]);

  const handleFocusColumns = useCallback(() => {
    console.log("Focusing columns:", selectedChildColumnIdsSet);
    focusColumns(Array.from(selectedChildColumnIdsSet));
  }, [focusColumns, selectedChildColumnIdsSet]);

  const handleDeleteColumns = useCallback(() => {
    deleteColumns(Array.from(selectedChildColumnIdsSet));
    selectColumns([]);
  }, [deleteColumns, selectColumns, selectedChildColumnIdsSet]);

  const handleSelectionAllColumns = useCallback(() => {
    if (isSelectionEmpty) {
      selectColumns(columnIdMatrix.flat());
    } else {
      clearSelectedColumns();
    }
  }, [isSelectionEmpty, selectColumns, columnIdMatrix, clearSelectedColumns]);

  const handleRenameConfirm = useCallback(
    (newName) => setOperationName(newName),
    [setOperationName]
  );

  return (
    <EnhancedSchemaToolbar
      id={id}
      columnIds={columnIdMatrix.flat()}
      columnCount={columnCount}
      rowCount={rowCount}
      title={name}
      onFocusColumns={handleFocusColumns}
      isFocusedDisabled={isSelectionEmpty}
      onHideColumns={handleHideColumns}
      isHideDisabled={!isCompleteColumnSelected()}
      onDeleteColumns={handleDeleteColumns}
      isDeleteDisabled={isSelectionEmpty}
      onSelectToggleColumns={handleSelectionAllColumns}
      isSelectToggleSelected={!isSelectionEmpty}
      onRenameConfirm={handleRenameConfirm}
    />
  );
};

const EnhancedStackSchemaToolbar = withStackOperationData(StackSchemaToolbar);
export { StackSchemaToolbar, EnhancedStackSchemaToolbar };
