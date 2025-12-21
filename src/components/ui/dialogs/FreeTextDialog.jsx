import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { DialogContentText, TextField } from "@mui/material";
import { useState } from "react";

const confirmText = "Confirm";
const cancelText = "Cancel";

const FreeTextDialog = ({
  title,
  open,
  label = "Enter value",
  onClose,
  onConfirm,
  contentText = "",
}) => {
  const [value, setValue] = useState("");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{contentText}</DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          label={label}
          type="text"
          fullWidth
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onConfirm(e, value);
              setTimeout(() => onClose(), 100);
            } else if (e.key === "Escape") {
              onClose();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{cancelText}</Button>
        <Button
          onClick={(e) => onConfirm(e, value)}
          variant="contained"
          color="primary"
          disabled={!value.trim()}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FreeTextDialog;
