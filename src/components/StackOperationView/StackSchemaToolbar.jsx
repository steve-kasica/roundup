/**
 * @fileoverview StackSchemaToolbar Component
 *
 * A specialized toolbar for STACK operation schema views providing controls for
 * column operations across multiple stacked tables. Handles operations that affect
 * columns across all child tables in the stack.
 *
 * Features:
 * - Column selection across all stacked tables
 * - Focus, hide, and delete operations
 * - Complete column detection (columns present in all stacked tables)
 * - Operation renaming
 *
 * @module components/StackOperationView/StackSchemaToolbar
 *
 * @example
 * <EnhancedStackSchemaToolbar
 *   id="stack-operation-123"
 *   handleHideColumns={handleHide}
 * />
 */

import { EnhancedSchemaToolbar, OBJECT_TYPE_STACK } from "../ui/SchemaToolbar";
import { useCallback, useMemo } from "react";
import { withOperationData, withStackOperationData } from "../HOC";

/**
 * StackSchemaToolbar Component
 *
 * Toolbar for managing columns in STACK operations.
 *
 * @component
 * @param {Object} props - Component props (provided via HOCs)
 * @param {number} props.rowCount - Total row count
 * @param {number} props.columnCount - Total column count
 * @param {string} props.name - Operation name
 * @param {string} props.id - Operation ID
 * @param {Set} props.selectedChildColumnIdsSet - Set of selected column IDs
 * @param {Function} props.deleteColumns - Delete columns globally
 * @param {Function} props.focusColumns - Set focused column IDs globally
 * @param {Function} props.selectColumns - Set selected column IDs
 * @param {Function} props.clearSelectedColumns - Clear selection
 * @param {Function} props.setOperationName - Update operation name
 * @param {Array[]} props.columnIdMatrix - 2D array of column IDs by position
 * @param {number} props.m - Number of columns in matrix
 * @param {Function} props.handleHideColumns - Hide columns callback
 *
 * @returns {React.ReactElement} A toolbar with stack-specific operations
 */
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

  // Props passed directly from the parent component
  handleHideColumns,
}) => {
  const isSelectionEmpty = useMemo(
    () => selectedChildColumnIdsSet.size === 0,
    [selectedChildColumnIdsSet],
  );

  const isCompleteColumnSelected = useCallback(() => {
    // Check if there's at least one column index where all cells are selected
    for (let colIndex = 0; colIndex < m; colIndex++) {
      const columnIds = columnIdMatrix
        .map((row) => row[colIndex])
        .filter((id) => id !== null);

      const allSelected = columnIds.every((id) =>
        selectedChildColumnIdsSet.has(id),
      );

      if (allSelected && columnIds.length > 0) {
        return true;
      }
    }
    return false;
  }, [columnIdMatrix, m, selectedChildColumnIdsSet]);

  const handleFocusColumns = useCallback(() => {
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
    [setOperationName],
  );

  return (
    <EnhancedSchemaToolbar
      id={id}
      objectType={OBJECT_TYPE_STACK}
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

StackSchemaToolbar.displayName = "Stack Schema Toolbar";

const EnhancedStackSchemaToolbar = withOperationData(
  withStackOperationData(StackSchemaToolbar),
);

EnhancedStackSchemaToolbar.displayName = "Enhanced Stack Schema Toolbar";

export { StackSchemaToolbar, EnhancedStackSchemaToolbar };
