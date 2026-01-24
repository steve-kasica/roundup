import { DeleteForever } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  ListItemIcon,
  ListItemText,
  MenuItem,
} from "@mui/material";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectSelectedTableIds } from "../../../../slices/uiSlice";

const DeleteTablesItem = ({ onConfirm, ...props }) => {
  const selectedTables = useSelector(selectSelectedTableIds);
  const [dialogOpen, setDialogOpen] = useState(false);

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
      <MenuItem onClick={onClick} {...props}>
        <ListItemIcon>
          <DeleteForever />
        </ListItemIcon>
        <ListItemText>Delete</ListItemText>
      </MenuItem>

      <Dialog open={dialogOpen} onClose={handleClose}>
        <DialogTitle>Delete Tables?</DialogTitle>
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
