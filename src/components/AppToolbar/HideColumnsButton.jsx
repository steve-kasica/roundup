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
import { TooltipIconButton } from "../ui/buttons";
import { useDispatch, useSelector } from "react-redux";
import {
  addToHiddenColumnIds,
  removeFromHiddenColumnIds,
  selectFocusedObjectId,
  selectSelectedColumnIds,
  setSelectedColumnIds,
} from "../../slices/uiSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";
import { useCallback } from "react";

const HideColumnsButton = () => {
  const dispatch = useDispatch();
  const tooltipText = "Hide columns";
  const selectedColumnIds = useSelector(selectSelectedColumnIds);

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

  const selectedObjectColumns = selectedColumnIds.filter((colId) =>
    focusedObject ? focusedObject.columnIds.includes(colId) : false
  );

  const hiddenObjectColumns = useSelector((state) => {
    const hiddenColumnIds = state.ui.hiddenColumnIds;
    return selectedObjectColumns.filter((colId) =>
      hiddenColumnIds.includes(colId)
    );
  });

  const hideSelectedColumns = useCallback(() => {
    dispatch(addToHiddenColumnIds(selectedObjectColumns));
    dispatch(setSelectedColumnIds([]));
  }, [dispatch, selectedObjectColumns]);

  const unhideSelectedColumns = useCallback(() => {
    dispatch(removeFromHiddenColumnIds(selectedObjectColumns));
    dispatch(setSelectedColumnIds([]));
  }, [dispatch, selectedObjectColumns]);

  return (
    <>
      {hiddenObjectColumns.length === 0 ? (
        <TooltipIconButton
          tooltipText={`Hide ${selectedObjectColumns.length} selected column${
            selectedObjectColumns.length !== 1 ? "s" : ""
          }`}
          disabled={selectedColumnIds.length === 0}
          onClick={hideSelectedColumns}
        >
          <VisibilityOff />
        </TooltipIconButton>
      ) : (
        <TooltipIconButton
          tooltipText={`Unhide ${hiddenObjectColumns.length} hidden column${
            hiddenObjectColumns.length !== 1 ? "s" : ""
          }`}
          onClick={unhideSelectedColumns}
        >
          <Visibility />
        </TooltipIconButton>
      )}
    </>
  );
};
export default HideColumnsButton;
