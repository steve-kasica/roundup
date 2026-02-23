/**
 * @fileoverview SelectAllColumnsButton Component
 *
 * A button for toggling selection state (select all/deselect all). Displays
 * appropriate icon based on current selection state.
 *
 * Features:
 * - Toggle between select all and deselect icons
 * - State-based icon rendering
 * - Automatic tooltip text based on state
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/SelectAllColumnsButtonButton
 *
 * @example
 * <SelectAllColumnsButtonButton
 *   isSelected={true}
 *   onClick={handleToggleSelect}
 * />
 */
import { Deselect, SelectAll } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";
import { TooltipIconButton } from "../../ui/buttons";
import {
  selectFocusedObjectId,
  selectSelectedColumnIds,
  setSelectedColumnIds,
  setSelectedMatches,
} from "../../../slices/uiSlice";
import { isTableId, selectTablesById } from "../../../slices/tablesSlice";
import {
  MATCH_TYPE_LEFT_UNMATCHED,
  MATCH_TYPE_MATCHES,
  MATCH_TYPE_RIGHT_UNMATCHED,
  OPERATION_TYPE_PACK,
  selectOperationsById,
} from "../../../slices/operationsSlice";
import { selectColumnIdsByParentId } from "../../../slices/columnsSlice";

const SelectAllColumnsButtonButton = () => {
  const dispatch = useDispatch();
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const isTable = useMemo(() => {
    return focusedObjectId ? isTableId(focusedObjectId) : false;
  }, [focusedObjectId]);
  const focusedObject = useSelector((state) => {
    if (!focusedObjectId) {
      return null;
    } else if (isTable) {
      return selectTablesById(state, focusedObjectId);
    } else {
      return selectOperationsById(state, focusedObjectId);
    }
  });

  const isPackOperation = useMemo(
    () => focusedObject?.operationType === OPERATION_TYPE_PACK,
    [focusedObject],
  );

  const allColumns = useSelector((state) => {
    if (!focusedObject) {
      return [];
    } else if (!isTable) {
      return selectColumnIdsByParentId(state, focusedObject.childIds);
    } else {
      return focusedObject.columnIds;
    }
  });

  const onSelectAll = useCallback(() => {
    dispatch(setSelectedColumnIds(allColumns.flat()));
    if (isPackOperation) {
      dispatch(
        setSelectedMatches([
          MATCH_TYPE_LEFT_UNMATCHED,
          MATCH_TYPE_MATCHES,
          MATCH_TYPE_RIGHT_UNMATCHED,
        ]),
      );
    }
  }, [allColumns, dispatch, isPackOperation]);

  const onDeselectAll = useCallback(() => {
    dispatch(setSelectedColumnIds([]));
    if (isPackOperation) {
      dispatch(setSelectedMatches([]));
    }
  }, [dispatch, isPackOperation]);

  const isDisabled = focusedObjectId === null;

  return (
    <>
      {selectedColumnIds.length === 0 ? (
        <TooltipIconButton
          tooltipText="Select all columns"
          onClick={onSelectAll}
          disabled={isDisabled}
        >
          <SelectAll />
        </TooltipIconButton>
      ) : (
        <TooltipIconButton
          tooltipText="Deselect all columns"
          onClick={onDeselectAll}
          disabled={isDisabled}
        >
          <Deselect />
        </TooltipIconButton>
      )}
    </>
  );
};
export default SelectAllColumnsButtonButton;
