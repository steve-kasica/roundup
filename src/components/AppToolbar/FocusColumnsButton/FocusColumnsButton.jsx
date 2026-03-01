/**
 * @fileoverview FocusIconButton Component
 *
 * A button for focusing selected columns. Displays a center focus icon to
 * bring selected columns into detail view.
 *
 * Features:
 * - Center focus icon
 * - Customizable tooltip text
 * - Small icon size
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/FocusIconButton
 *
 * @example
 * <FocusIconButton
 *   onClick={handleFocus}
 *   tooltipText="Focus 2 columns"
 * />
 */

import { CenterFocusStrong } from "@mui/icons-material";
import { TooltipIconButton } from "../../ui/buttons";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFocusedObjectId,
  selectSelectedColumnIds,
  setFocusedColumnIds,
} from "../../../slices/uiSlice";
import { isTableId } from "../../../slices/tablesSlice";
import { useCallback, useMemo } from "react";
import { selectColumnIdsByParentId } from "../../../slices/columnsSlice";
import { isOperationId } from "../../../slices/operationsSlice";

const FocusColumnsButton = () => {
  const dispatch = useDispatch();
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const focusedObject = useSelector((state) => {
    if (focusedObjectId === null) {
      return null;
    } else if (isTableId(focusedObjectId)) {
      return state.tables.byId[focusedObjectId];
    } else {
      return state.operations.byId[focusedObjectId];
    }
  });

  const selectedColumnIds = useSelector(selectSelectedColumnIds);

  // const selectedObjectColumns = useMemo(() => {
  //   if (!focusedObject) return [];
  //   return focusedObject.columnIds.filter((colId) =>
  //     selectedColumnIds.includes(colId),
  //   );
  // }, [focusedObject, selectedColumnIds]);
  const focusedObjectColumns = useSelector((state) => {
    if (!focusedObject) {
      return [];
    } else if (isTableId(focusedObject?.id)) {
      return focusedObject.columnIds;
    } else {
      return selectColumnIdsByParentId(state, focusedObject.childIds);
    }
  });

  const selectedFocusedColumnIds = useMemo(() => {
    if (!focusedObject) {
      return [];
    } else if (isTableId(focusedObject.id)) {
      return focusedObjectColumns
        .map((id, index) => ({ id, index, parentId: focusedObject.id }))
        .filter(({ id }) => selectedColumnIds.includes(id));
    } else {
      // focused object is an operation
      return focusedObjectColumns
        .map((columnIds, parentIndex) =>
          columnIds
            .map((id, index) => ({
              id,
              index,
              parentId: focusedObject.childIds[parentIndex],
            }))
            .filter(({ id }) => selectedColumnIds.includes(id)),
        )
        .flat();
    }
  }, [focusedObject, focusedObjectColumns, selectedColumnIds]);

  const isSelectionWithinIndex = useMemo(() => {
    if (selectedFocusedColumnIds.length <= 1) return true;
    const indices = selectedFocusedColumnIds.map((col) => col.index);
    return new Set(indices).size === 1;
  }, [selectedFocusedColumnIds]);

  const isDisabled = useMemo(
    () =>
      !focusedObject || // No focused object
      selectedFocusedColumnIds.length === 0 || // No selected columnIds in focused object
      (isTableId(focusedObject.id) && selectedFocusedColumnIds.length > 1) || // multiple indices selected in table
      (isOperationId(focusedObject.id) &&
        selectedFocusedColumnIds.length > 2) || // more than 2 columns selected in operation
      (isOperationId(focusedObject.id) &&
        selectedFocusedColumnIds.length === 2 &&
        !isSelectionWithinIndex), // two columns selected but from different tables in operation
    [focusedObject, isSelectionWithinIndex, selectedFocusedColumnIds.length],
  );

  const tooltipText = useMemo(() => {
    return `Focus ${selectedFocusedColumnIds.length} column${
      selectedFocusedColumnIds.length !== 1 ? "s" : ""
    }`;
  }, [selectedFocusedColumnIds.length]);

  const handleOnClick = useCallback(() => {
    dispatch(
      setFocusedColumnIds(selectedFocusedColumnIds.map((col) => col.id)),
    );
  }, [dispatch, selectedFocusedColumnIds]);

  return (
    <TooltipIconButton
      tooltipText={tooltipText}
      disabled={isDisabled}
      onClick={handleOnClick}
    >
      <CenterFocusStrong fontSize="small" />
    </TooltipIconButton>
  );
};

export default FocusColumnsButton;
