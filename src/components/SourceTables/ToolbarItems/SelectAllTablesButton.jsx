/**
 * @fileoverview SelectAllTablesButton Component
 *
 * A button for toggling selection state of source tables (select all/deselect all).
 * Displays appropriate icon based on current selection state.
 *
 * Features:
 * - Toggle between select all and deselect icons
 * - State-based icon rendering
 * - Automatic tooltip text based on state
 *
 * @module components/SourceTables/ToolbarItems/SelectAllTablesButton
 *
 * @example
 * <SelectAllTablesButton />
 */
import { Deselect, SelectAll } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { useCallback } from "react";
import { TooltipIconButton } from "../../ui/buttons";
import {
  selectSelectedTableIds,
  setSelectedTableIds,
  clearSelectedTableIds,
} from "../../../slices/uiSlice";
import { selectAllTableIds } from "../../../slices/tablesSlice";

const SelectAllTablesButton = () => {
  const dispatch = useDispatch();
  const selectedTableIds = useSelector(selectSelectedTableIds);
  const allTableIds = useSelector(selectAllTableIds);

  const onSelectAll = useCallback(() => {
    dispatch(setSelectedTableIds(allTableIds));
  }, [allTableIds, dispatch]);

  const onDeselectAll = useCallback(() => {
    dispatch(clearSelectedTableIds());
  }, [dispatch]);

  const isDisabled = allTableIds.length === 0;

  return selectedTableIds.length === 0 ? (
    <TooltipIconButton
      tooltipText="Select all tables"
      onClick={onSelectAll}
      disabled={isDisabled}
    >
      <SelectAll />
    </TooltipIconButton>
  ) : (
    <TooltipIconButton
      tooltipText="Deselect all tables"
      onClick={onDeselectAll}
      disabled={isDisabled}
    >
      <Deselect />
    </TooltipIconButton>
  );
};

export default SelectAllTablesButton;
