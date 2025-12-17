import { useCallback, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { DriveFileRenameOutline as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const RenameObjectButton = ({
  //   color = "info",
  tooltipText = "Rename",
  currentName = "",
  dialogTitle = "Rename",
  inputLabel = "Name",
  onConfirm,
  ...props
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const openDialog = useCallback(() => {
    setNewName(currentName || "");
    setDialogOpen(true);
  }, [currentName]);

  const handleClose = useCallback(() => {
    setDialogOpen(false);
  }, []);

  const handleConfirm = useCallback(() => {
    const next = newName.trim();
    if (next && typeof onConfirm === "function") {
      onConfirm(next);
    }
    setDialogOpen(false);
  }, [newName, onConfirm]);

  return (
    <>
      <TooltipIconButton
        tooltipText={tooltipText}
        onClick={openDialog}
        {...props}
      >
        <Icon />
      </TooltipIconButton>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{dialogTitle}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label={inputLabel}
            fullWidth
            variant="outlined"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleConfirm();
              } else if (e.key === "Escape") {
                handleClose();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            variant="contained"
            disabled={!newName.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RenameObjectButton;
