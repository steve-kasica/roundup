import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Tooltip,
} from "@mui/material";
import { DeleteForever } from "@mui/icons-material";
import { useState } from "react";

const DeleteIconButton = ({
  onConfirm,
  title = "Delete",
  disabled,
  ...props
}) => {
  const [open, setOpen] = useState(false);

  const handleClick = (e) => {
    e.stopPropagation();
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    if (typeof onConfirm === "function") {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title={title} disableHoverListener={disabled}>
        <span>
          <IconButton
            size="small"
            {...props}
            title="Delete columns"
            color="error"
            onClick={handleClick}
            disabled={disabled}
          >
            <DeleteForever fontSize="small" />
          </IconButton>
        </span>
      </Tooltip>

      <Dialog
        open={open}
        onClose={handleCancel}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this? This action cannot be undone.
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

export default DeleteIconButton;
