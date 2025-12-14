import SchemaToolbar from "../ui/SchemaToolbar";
import FocusIconButton from "../ui/icons/FocusIconButton";
import HideIconButton from "../ui/HideIconButton";
import DeleteIconButton from "../ui/icons/DeleteIconButton";
import SelectToggleIconButton from "../ui/SelectToggleIconButton";
import { EnhancedStackOperationLabel } from "./StackOperationLabel";
import { useCallback } from "react";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";
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

  // Props passed via `withAssociatedAlerts.jsx` HOC
  alertIds,
  errorCount,
  totalCount,

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
    deleteColumns(selectedChildColumnIdsSet);
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
    <SchemaToolbar
      columnIds={columnIdMatrix.flat()}
      columnCount={activeColumnIds.length}
      rowCount={rowCount}
      name={name}
      objectId={id}
      alertIds={alertIds}
      errorCount={errorCount}
      totalCount={totalCount}
      customMenuItems={
        <>
          <FocusIconButton
            onClick={handleFocusColumns}
            disabled={isSelectionEmpty}
          />
          <HideIconButton
            onClick={handleHideColumns}
            disabled={!isCompleteColumnSelected(selectedChildColumnIdsSet)}
          />
          <DeleteIconButton
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
    </SchemaToolbar>
  );
};

const EnhancedStackSchemaToolbar = withAssociatedAlerts(
  withStackOperationData(StackSchemaToolbar)
);

export { StackSchemaToolbar, EnhancedStackSchemaToolbar };
