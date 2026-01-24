/**
 * @fileoverview AddStackOperationButton Component
 *
 * A specialized button for creating STACK (union) operations. Wraps TooltipIconButton
 * with a StackOperationIcon to provide consistent UI for adding union operations.
 *
 * Features:
 * - Stack operation icon
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/AddStackOperationButton
 *
 * @example
 * <AddStackOperationButton
 *   onClick={handleAddStack}
 *   tooltipText="Create new union operation"
 * />
 */

import StackOperationIcon from "../../../../ui/icons/StackOperationIcon";
import TooltipIconButton from "../../../../ui/buttons/TooltipIconButton";
import { useDispatch, useSelector } from "react-redux";
import {
  isOperationId,
  OPERATION_TYPE_STACK,
  selectOperationsById,
  selectRootOperationId,
} from "../../../../../slices/operationsSlice";
import { createOperationsRequest } from "../../../../../sagas/createOperationsSaga/actions";
import {
  clearSelectedTableIds,
  selectFocusedObjectId,
  selectSelectedTableIds,
} from "../../../../../slices/uiSlice";
import {
  isTableId,
  selectAddedTableIds,
  selectTablesById,
} from "../../../../../slices/tablesSlice";
import { useMemo } from "react";
import { MenuItem } from "@mui/material";

const AddOperationButton = ({ onClick, children, ...props }) => {
  // const selectedTableIds = useSelector(selectSelectedTableIds);
  // const addedTableIds = useSelector(selectAddedTableIds);
  // const focusedObject = useSelector((state) => {
  //   const focusedObjectId = selectFocusedObjectId(state);
  //   if (!focusedObjectId) {
  //     return null;
  //   } else if (isTableId(focusedObjectId)) {
  //     return selectTablesById(state, focusedObjectId);
  //   } else {
  //     return selectOperationsById(state, focusedObjectId);
  //   }
  // });

  // const selectedNotAdded = useMemo(() => {
  //   const addedSet = new Set(addedTableIds);
  //   return selectedTableIds.filter((id) => !addedSet.has(id));
  // }, [selectedTableIds, addedTableIds]);

  // const isDisabled = useMemo(() => {
  //   return (
  //     selectedTableIds.length === 0 || // No tables selected
  //     selectedNotAdded.length === 0 || // Everything selected has been added
  //     (isOperationId(focusedObject?.id) && !focusedObject.isMaterialized) || // Focused operation not materialized
  //     (isOperationId(focusedObject?.id) && !focusedObject.isInSync) // Focused operation not in sync
  //   );
  // }, [selectedTableIds.length, selectedNotAdded.length, focusedObject]);

  // const handleClick = () => {
  //   const childIds = (rootOperationId ? [rootOperationId] : []).concat(
  //     selectedNotAdded,
  //   );

  //   dispatch(
  //     createOperationsRequest({
  //       operationData: { operationType: OPERATION_TYPE_STACK, childIds },
  //     }),
  //   );
  //   dispatch(clearSelectedTableIds());
  // };

  return (
    <MenuItem onClick={onClick} {...props}>
      {children}
    </MenuItem>
  );
};

export default AddOperationButton;
