/**
 * @fileoverview HideColumnsButton Component
 *
 * A button for hiding columns. Displays a visibility-off icon to hide selected
 * or specified columns from view.
 *
 * Features:
 * - Visibility off icon
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/HideColumnsButton
 *
 * @example
 * <HideColumnsButton />
 */

import { Visibility, VisibilityOff } from "@mui/icons-material";
import { TooltipIconButton } from "../../ui/buttons";
import { useDispatch, useSelector } from "react-redux";
import {
  addToHiddenColumnIds,
  removeFromHiddenColumnIds,
  selectFocusedObjectId,
  selectHiddenColumnIds,
  selectSelectedColumnIds,
  setSelectedColumnIds,
} from "../../../slices/uiSlice";
import { isTableId, selectTablesById } from "../../../slices/tablesSlice";
import {
  isOperationId,
  OPERATION_TYPE_STACK,
  selectOperationsById,
} from "../../../slices/operationsSlice";
import { useCallback, useMemo } from "react";
import { selectColumnIdsByParentId } from "../../../slices/columnsSlice";

const HideColumnsButton = () => {
  const dispatch = useDispatch();

  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const hiddenColumnIds = useSelector(selectHiddenColumnIds);

  const focusedObject = useSelector((state) => {
    const focusedObjectId = selectFocusedObjectId(state);
    if (!focusedObjectId) {
      return null;
    } else if (isTableId(focusedObjectId)) {
      return selectTablesById(state, focusedObjectId);
    } else {
      return selectOperationsById(state, focusedObjectId);
    }
  });

  // The columns that are relevant to the focused object
  const relevantColumnIds = useSelector((state) => {
    if (!focusedObject) {
      return [];
    } else if (isTableId(focusedObject.id)) {
      return focusedObject.columnIds;
    } else {
      return selectColumnIdsByParentId(state, focusedObject.childIds);
    }
  });

  const relevantColumnData = useMemo(() => {
    if (!focusedObject) {
      return [];
    } else if (isTableId(focusedObject.id)) {
      return relevantColumnIds.map((id, index) => ({
        id,
        index,
        parentId: focusedObject.id,
      }));
    } else {
      // focused object is an operation
      return relevantColumnIds
        .map((columnIds, parentIndex) =>
          columnIds.map((id, index) => ({
            id,
            index,
            parentId: focusedObject.childIds[parentIndex],
          })),
        )
        .flat();
    }
  }, [focusedObject, relevantColumnIds]);

  const selectedColumnData = useMemo(() => {
    return relevantColumnData.filter(({ id }) =>
      selectedColumnIds.includes(id),
    );
  }, [relevantColumnData, selectedColumnIds]);

  const selectedTables = useMemo(
    () => new Set(selectedColumnData.map(({ parentId }) => parentId)),
    [selectedColumnData],
  );

  const hiddenColumnData = useMemo(() => {
    return relevantColumnData.filter(({ id }) => hiddenColumnIds.includes(id));
  }, [relevantColumnData, hiddenColumnIds]);

  const hideSelectedColumns = useCallback(() => {
    dispatch(addToHiddenColumnIds(selectedColumnData.map(({ id }) => id)));
    dispatch(setSelectedColumnIds([]));
  }, [dispatch, selectedColumnData]);

  const unhideHiddenColumns = useCallback(() => {
    dispatch(removeFromHiddenColumnIds(hiddenColumnData.map(({ id }) => id)));
    dispatch(setSelectedColumnIds([]));
  }, [dispatch, hiddenColumnData]);

  const isHideMode = useMemo(() => {
    return selectedColumnData.length > 0;
  }, [selectedColumnData]);

  const isDisabled = useMemo(() => {
    return (
      !focusedObject || // no focused object
      (selectedColumnData.length === 0 && hiddenColumnData.length === 0) || // no selected or hidden columns
      // Selection is only within one table on a stack operation (and we're in hide mode, not unhide mode)
      (isOperationId(focusedObject.id) &&
        focusedObject.operationType === OPERATION_TYPE_STACK &&
        selectedColumnData.length > 0 &&
        selectedTables.size === 1 &&
        hiddenColumnData.length === 0) // Only disable if there are no hidden columns to unhide
    );
  }, [
    focusedObject,
    selectedColumnData.length,
    hiddenColumnData.length,
    selectedTables.size,
  ]);

  return (
    <>
      {isHideMode ? (
        <TooltipIconButton
          tooltipText={`Hide ${selectedColumnData.length} selected column${
            selectedColumnData.length !== 1 ? "s" : ""
          }`}
          disabled={isDisabled}
          onClick={hideSelectedColumns}
        >
          <VisibilityOff />
        </TooltipIconButton>
      ) : (
        <TooltipIconButton
          tooltipText={`Unhide ${hiddenColumnData.length} hidden column${
            hiddenColumnData.length !== 1 ? "s" : ""
          }`}
          disabled={isDisabled}
          onClick={unhideHiddenColumns}
        >
          <Visibility />
        </TooltipIconButton>
      )}
    </>
  );
};
export default HideColumnsButton;
