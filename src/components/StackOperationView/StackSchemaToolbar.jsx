import { EnhancedSchemaToolbar } from "../ui/SchemaToolbar";
import {
  SelectToggleIconButton,
  FocusIconButton,
  DeleteColumnsButton,
  HideIconButton,
} from "../ui/buttons";
import { EnhancedStackOperationLabel } from "./StackOperationLabel";
import { useCallback } from "react";
import withStackOperationData from "./withStackOperationData";

const StackSchemaToolbar = ({
  // Props passed via `withOeprationData.jsx` HOC
  rowCount,
  name,
  id,
  selectedChildColumnIdsSet,
  deleteColumns, // Deletes columns globally
  focusColumns, // Sets focused column IDs globally
  selectColumns, // Sets global set of selected column IDs
  clearSelectedColumns, // Clears the global set of selected column IDs

  // Props passed via `withStackOperationData.jsx` HOC
  columnIdMatrix,
  m,
  activeColumnIds,

  // Props passed directly from the parent component
  handleHideColumns,
}) => {
  const isSelectionEmpty = selectedChildColumnIdsSet.size === 0;
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
    focusColumns(selectedChildColumnIdsSet);
    // Implementation for handling focus columns
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

  return (
    <EnhancedSchemaToolbar
      id={id}
      columnIds={columnIdMatrix.flat()}
      columnCount={activeColumnIds.length}
      rowCount={rowCount}
      name={name}
      customMenuItems={
        <>
          <FocusIconButton
            onClick={handleFocusColumns}
            disabled={isSelectionEmpty}
          />
          <HideIconButton
            onClick={handleHideColumns}
            disabled={!isCompleteColumnSelected()}
          />
          <DeleteColumnsButton
            onConfirm={handleDeleteColumns}
            disabled={isSelectionEmpty}
          />
          <SelectToggleIconButton
            onClick={handleSelectionAllColumns}
            isSelected={!isSelectionEmpty}
          />
        </>
      }
    >
      <EnhancedStackOperationLabel id={id} />
    </EnhancedSchemaToolbar>
  );
};

const EnhancedStackSchemaToolbar = withStackOperationData(StackSchemaToolbar);
export { StackSchemaToolbar, EnhancedStackSchemaToolbar };
