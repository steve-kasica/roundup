import { DeleteForever } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { selectSelectedTableIds } from "../../../../slices/uiSlice";

const DeleteTablesItem = ({ onConfirm, ...props }) => {
  const selectedTables = useSelector(selectSelectedTableIds);
  const [dialogOpen, setDialogOpen] = useState(false);

  const isDisabled = useMemo(
    () => selectedTables.length === 0,
    [selectedTables],
  );

  const onClick = () => {
    setDialogOpen(true);
  };

  const handleClose = () => {
    setDialogOpen(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(selectedTables);
    }
    setDialogOpen(false);
  };

  return (
    <>
      <IconButton
        onClick={onClick}
        disabled={isDisabled}
        aria-label="Delete selected tables"
        {...props}
      >
        <DeleteForever />
      </IconButton>

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        aria-labelledby="delete-tables-dialog-title"
      >
        <DialogTitle id="delete-tables-dialog-title">
          Delete Tables?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedTables.length} table
            {selectedTables.length !== 1 ? "s" : ""}? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteTablesItem;
