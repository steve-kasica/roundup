import { useCallback, useState } from "react";
import {
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import {
  selectSelectedColumnIds,
  setSelectedColumnIds,
} from "../../slices/uiSlice";
import { deleteColumnsRequest } from "../../sagas/deleteColumnsSaga";

const DeleteItem = () => {
  const dispatch = useDispatch();
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleClick = useCallback((event) => {
    event.stopPropagation();
    setDialogOpen(true);
  }, []);

  const handleConfirm = useCallback(() => {
    dispatch(deleteColumnsRequest(selectedColumnIds));
    dispatch(setSelectedColumnIds([]));
    setDialogOpen(false);
  }, [dispatch, selectedColumnIds]);

  const handleCancel = useCallback(() => {
    setDialogOpen(false);
  }, []);

  return (
    <>
      <MenuItem disabled={selectedColumnIds.length === 0} onClick={handleClick}>
        Delete
      </MenuItem>
      <Dialog open={dialogOpen} onClose={handleCancel}>
        <DialogTitle>Delete Columns?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedColumnIds.length} column
            {selectedColumnIds.length !== 1 ? "s" : ""}? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteItem;
