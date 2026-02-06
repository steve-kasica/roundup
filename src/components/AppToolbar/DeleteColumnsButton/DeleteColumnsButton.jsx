/**
 * @fileoverview DeleteColumnsButton Component
 *
 * A button for deleting columns or tables with confirmation dialog. Provides
 * safety confirmation before performing destructive operations.
 *
 * Features:
 * - Delete icon button
 * - Confirmation dialog
 * - Customizable tooltip and dialog text
 * - Support for deleting columns or tables
 * - Disabled state support
 *
 * @module components/ui/buttons/DeleteColumnsButton
 *
 * @example
 * <DeleteColumnsButton
 *   onClick={handleDelete}
 *   tooltipText="Delete 3 columns"
 *   disabled={false}
 *   objectType="column"
 * />
 */

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useMemo, useState } from "react";
import { TooltipIconButton } from "../../ui/buttons";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFocusedObjectId,
  selectSelectedColumnIds,
} from "../../../slices/uiSlice";
import { isTableId, selectTablesById } from "../../../slices/tablesSlice";
import { deleteColumnsRequest } from "../../../sagas/deleteColumnsSaga/actions";
import {
  isOperationId,
  selectOperationsById,
  selectRootOperationId,
} from "../../../slices/operationsSlice";
import { selectColumnIdsByParentId } from "../../../slices/columnsSlice";

const DeleteColumnsButton = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);

  const rootOperationId = useSelector(selectRootOperationId);

  const focusedObject = useSelector((state) => {
    const focusedObjectId = selectFocusedObjectId(state);
    if (focusedObjectId === null) {
      return null;
    } else if (isTableId(focusedObjectId)) {
      return selectTablesById(state, focusedObjectId);
    } else {
      return selectOperationsById(state, focusedObjectId);
    }
  });

  const selectedColumnIds = useSelector(selectSelectedColumnIds);

  const objectColumnIds = useSelector((state) => {
    if (!focusedObject) {
      return [];
    } else if (isTableId(focusedObject.id)) {
      return focusedObject.columnIds;
    } else {
      // Focused object is an operation
      // Get selected columns that belong to the operation's child tables
      return selectColumnIdsByParentId(state, focusedObject.childIds);
    }
  });

  const selectedObjectColumns = useMemo(() => {
    if (!focusedObject) return [];
    return objectColumnIds
      .flat()
      .filter((colId) => selectedColumnIds.includes(colId));
  }, [focusedObject, objectColumnIds, selectedColumnIds]);

  const tooltipText = useMemo(() => {
    return `Delete ${selectedObjectColumns.length} column${
      selectedObjectColumns.length !== 1 ? "s" : ""
    }`;
  }, [selectedObjectColumns.length]);

  const isDisabled = useMemo(
    () =>
      selectedObjectColumns.length === 0 ||
      // Disabl is focused object is an non-root operation
      (isOperationId(focusedObject?.id) &&
        focusedObject.id !== rootOperationId) ||
      // Disable is table's parent operation is a non-root operation
      (isTableId(focusedObject?.id) &&
        focusedObject.parentId !== rootOperationId),
    [selectedObjectColumns.length, focusedObject, rootOperationId],
  );

  const handleConfirm = () => {
    setDialogOpen(false);
    dispatch(deleteColumnsRequest(selectedObjectColumns));
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <TooltipIconButton
        tooltipText={tooltipText}
        onClick={() => setDialogOpen(true)}
        disabled={isDisabled}
      >
        <DeleteForever />
      </TooltipIconButton>
      <Dialog
        open={dialogOpen}
        onClose={handleCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel} color="primary">
            Cancel
          </Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteColumnsButton;
