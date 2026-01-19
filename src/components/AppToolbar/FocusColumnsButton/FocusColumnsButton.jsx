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

const FocusColumnsButton = () => {
  const dispatch = useDispatch();
  const focusedObjectId = useSelector(selectFocusedObjectId);
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const focusedObject = useSelector((state) => {
    if (focusedObjectId === null) {
      return null;
    } else if (isTableId(focusedObjectId)) {
      return state.tables.byId[focusedObjectId];
    } else {
      return state.operations.byId[focusedObjectId];
    }
  });

  const selectedObjectColumns = useMemo(() => {
    if (!focusedObject) return [];
    return focusedObject.columnIds.filter((colId) =>
      selectedColumnIds.includes(colId),
    );
  }, [focusedObject, selectedColumnIds]);

  const allColumns = useSelector((state) => state.columns.byId);

  const isSameIndex = useMemo(() => {
    if (selectedObjectColumns.length <= 1) return true;
    const databaseNames = selectedObjectColumns.map(
      (colId) => allColumns[colId]?.databaseName,
    );
    return new Set(databaseNames).size === 1;
  }, [selectedObjectColumns, allColumns]);

  const isDisabled = useMemo(
    () => selectedObjectColumns.length === 0 || !isSameIndex,
    [selectedObjectColumns, isSameIndex],
  );

  const tooltipText = useMemo(() => {
    return `Focus ${selectedObjectColumns.length} column${
      selectedObjectColumns.length !== 1 ? "s" : ""
    }`;
  }, [selectedObjectColumns.length]);

  const handleOnClick = useCallback(() => {
    dispatch(setFocusedColumnIds(selectedObjectColumns));
  }, [dispatch, selectedObjectColumns]);

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
