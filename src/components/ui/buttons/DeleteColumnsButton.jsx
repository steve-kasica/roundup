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
import { useCallback, useState } from "react";
import TooltipIconButton from "./TooltipIconButton";

const DeleteColumnsButton = ({
  onConfirm,
  tooltipText = "Delete columns",
  ...props
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const handleConfirm = () => {
    setDialogOpen(false);
    if (typeof onConfirm === "function") {
      onConfirm();
    }
  };

  const handleCancel = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <TooltipIconButton
        tooltipText={tooltipText}
        onClick={(event) => setDialogOpen(event.currentTarget)}
        {...props}
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
