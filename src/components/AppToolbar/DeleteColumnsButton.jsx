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
  Tooltip,
} from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useCallback, useMemo, useState } from "react";
import { TooltipIconButton } from "../ui/buttons";
import { useDispatch, useSelector } from "react-redux";
import {
  selectFocusedObjectId,
  selectSelectedColumnIds,
} from "../../slices/uiSlice";
import { isTableId } from "../../slices/tablesSlice";
import { deleteColumns } from "../../slices/columnsSlice";
import { deleteColumnsRequest } from "../../sagas/deleteColumnsSaga/actions";

const DeleteColumnsButton = () => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const selectedColumns = useSelector(selectSelectedColumnIds);

  const selectedObjectColumns = useMemo(() => {
    if (!focusedObject) return [];
    return focusedObject.columnIds.filter((colId) =>
      selectedColumns.includes(colId)
    );
  }, [focusedObject, selectedColumns]);

  const tooltipText = useMemo(() => {
    return `Delete ${selectedObjectColumns.length} column${
      selectedObjectColumns.length !== 1 ? "s" : ""
    }`;
  }, [selectedObjectColumns.length]);

  const handleConfirm = () => {
    setDialogOpen(false);
    dispatch(
      deleteColumnsRequest({
        columnIds: selectedObjectColumns,
        recurse: true,
        deleteFromDatabase: true,
      })
    );
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <TooltipIconButton
        tooltipText={tooltipText}
        onClick={(event) => setDialogOpen(event.currentTarget)}
        disabled={selectedObjectColumns.length === 0}
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
