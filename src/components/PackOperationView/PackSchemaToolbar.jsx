/**
 * @fileoverview PackSchemaToolbar Component
 *
 * A specialized toolbar for PACK operation schema views providing controls for
 * column operations, match type filtering, table position swapping, and join type
 * configuration.
 *
 * This toolbar extends the base SchemaToolbar with PACK-specific features like
 * match filtering and table swapping.
 *
 * Features:
 * - Match type toggle buttons (matched, left-only, right-only)
 * - Swap tables button
 * - Column selection, focus, hide, delete operations
 * - Operation naming
 * - Join type configuration through match selection
 *
 * @module components/PackOperationView/PackSchemaToolbar
 *
 * @example
 * <EnhancedPackSchemaToolbar
 *   id="pack-operation-123"
 *   handleHideColumns={handleHide}
 *   areAnySelected={true}
 *   onSelectAllClick={handleSelectAll}
 * />
 */

import { EnhancedSchemaToolbar, OBJECT_TYPE_PACK } from "../ui/SchemaToolbar";
import { SwapTablesButton } from "../ui/buttons";
import { useCallback, useMemo } from "react";
import {
  withPackOperationData,
  withOperationData,
  withGlobalInterfaceData,
} from "../HOC";
import { Divider } from "@mui/material";
import { JOIN_TYPES } from "../../slices/operationsSlice";

const PackSchemaToolbar = ({
  // Props defined in `withGlobalInterfaceData.jsx` HOC
  focusColumns,
  clearSelectedColumns,
  selectedMatches,
  clearSelectedMatches,

  // Props passed via `withOperationData.jsx` HOC
  id,
  name,
  rowCount,
  columnCount,
  setOperationName,
  deleteColumns,
  swapTablePositions,
  selectedChildColumnIdsSet,

  // Props passed via `withPackOperationData.jsx` HOC
  matchStats,
  matchKeys,
  validMatchGroups,
  setJoinType,

  // Props passed via `withAssociatedAlerts.jsx` HOC
  errorCount,

  // Props passed directly from the parent component
  handleHideColumns,
  areAnySelected,
  onSelectAllClick,
}) => {
  // Check if at least one complete column is selected
  const isCompleteColumnSelected = useMemo(
    () =>
      selectedMatches.length > 0 &&
      selectedMatches.length === validMatchGroups.length,
    [selectedMatches, validMatchGroups],
  );

  /**
   * @function handleToggleMatchChange
   * Handle changes to the match category toggle buttons
   * @param {Event} _event - The change event
   * @param {Array} currentMatches - The currently selected match categories
   * @returns {void}
   */
  const handleToggleMatchChange = useCallback(
    (_event, currentMatches) => {
      const signature = matchKeys
        .sort((a, b) => a.localeCompare(b))
        .map((type) => (currentMatches.includes(type) ? "1" : "0"))
        .join("");

      const joinType = (function (sig) {
        switch (sig) {
          case "111":
            return JOIN_TYPES.FULL_OUTER;
          case "110":
            return JOIN_TYPES.LEFT_OUTER;
          case "101":
            return JOIN_TYPES.FULL_ANTI;
          case "100":
            return JOIN_TYPES.LEFT_ANTI;
          case "011":
            return JOIN_TYPES.RIGHT_OUTER;
          case "010":
            return JOIN_TYPES.INNER;
          case "001":
            return JOIN_TYPES.RIGHT_ANTI;
          case "000":
          default:
            return JOIN_TYPES.EMPTY;
        }
      })(signature);

      setJoinType(joinType);
      clearSelectedColumns();
      clearSelectedMatches();
    },
    [matchKeys, setJoinType, clearSelectedColumns, clearSelectedMatches],
  );

  /**
   * @function handleFocusColumns
   * Focus the selected columns in the pack operation
   * @returns {void}
   */
  const handleFocusColumns = useCallback(
    () => focusColumns([...selectedChildColumnIdsSet]),
    [focusColumns, selectedChildColumnIdsSet],
  );

  /**
   * @function handleDeleteColumns
   * Delete selected columns from the pack operation
   * @returns {void}
   */
  const handleDeleteColumns = useCallback(() => {
    deleteColumns([...selectedChildColumnIdsSet]);
    clearSelectedColumns();
    clearSelectedMatches();
  }, [
    deleteColumns,
    clearSelectedColumns,
    clearSelectedMatches,
    selectedChildColumnIdsSet,
  ]);

  /**
   * @function handleSwapTables
   * Swap the positions of the two tables in the pack operation
   * @returns {void}
   */
  const handleSwapTables = useCallback(() => {
    swapTablePositions(0, 1);
    clearSelectedColumns();
    clearSelectedMatches();
  }, [swapTablePositions, clearSelectedColumns, clearSelectedMatches]);

  /**
   * @function handleRenameConfirm
   * Handle confirming the rename of the operation
   * @param {string} newName - The new name for the operation
   * @returns {void}
   */
  const handleRenameConfirm = useCallback(
    (newName) => setOperationName(newName),
    [setOperationName],
  );

  return (
    <EnhancedSchemaToolbar
      id={id}
      title={name}
      rowCount={rowCount}
      columnCount={columnCount}
      objectType={OBJECT_TYPE_PACK}
      onFocusColumns={handleFocusColumns}
      onHideColumns={() => handleHideColumns()}
      onDeleteColumns={handleDeleteColumns}
      onRenameConfirm={handleRenameConfirm}
      onSelectToggleColumns={onSelectAllClick}
      isFocusedDisabled={
        !isCompleteColumnSelected || selectedChildColumnIdsSet.size > 2
      }
      isHideDisabled={
        !isCompleteColumnSelected || selectedChildColumnIdsSet.size < 2
      }
      isDeleteDisabled={!isCompleteColumnSelected}
      isSelectToggleSelected={areAnySelected}
      customMenuItems={
        <>
          {/* Match category filter buttons */}
          <Divider orientation="vertical" flexItem />
          <Divider orientation="vertical" flexItem />
          <SwapTablesButton onClick={handleSwapTables} />
        </>
      }
    />
  );
};

const EnhancedPackSchemaToolbar = withOperationData(
  withPackOperationData(withGlobalInterfaceData(PackSchemaToolbar)),
);

EnhancedPackSchemaToolbar.displayName = "Enhanced Pack Schema Toolbar";

export { PackSchemaToolbar, EnhancedPackSchemaToolbar };
