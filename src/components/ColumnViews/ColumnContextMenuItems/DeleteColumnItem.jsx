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
import { deleteColumnsRequest } from "../../../sagas/deleteColumnsSaga";
import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";

const DeleteColumnItem = ({ id, handleCloseMenu }) => {
  const dispatch = useDispatch();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeleteColumn = useCallback(() => {
    dispatch(deleteColumnsRequest([id]));
    setDialogOpen(false);
    if (handleCloseMenu) {
      handleCloseMenu();
    }
  }, [dispatch, id, handleCloseMenu]);

  const handleOpenDialog = useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setDialogOpen(false);
    if (handleCloseMenu) {
      handleCloseMenu();
    }
  }, [handleCloseMenu]);
  return (
    <>
      <MenuItem onClick={handleOpenDialog} sx={{}}>
        <ListItemIcon sx={{}}>
          <DeleteForever fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete Column</ListItemText>
      </MenuItem>
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        aria-labelledby="delete-column-dialog-title"
      >
        <DialogTitle id="delete-column-dialog-title">
          Delete Column?
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this column? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleDeleteColumn}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default DeleteColumnItem;
