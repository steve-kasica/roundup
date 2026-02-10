/**
 * @fileoverview FreeTextDialog Component
 *
 * A reusable dialog component for collecting free text input from users. Provides
 * a simple interface with title, description, input field, and confirm/cancel buttons.
 *
 * Features:
 * - Customizable title and description
 * - Text input field with label
 * - Confirm and cancel buttons
 * - Callback on submission
 * - Controlled open state
 *
 * @module components/ui/dialogs/FreeTextDialog
 *
 * @example
 * <FreeTextDialog
 *   title="Rename Table"
 *   description="Enter a new name for the table"
 *   label="Table name"
 *   open={dialogOpen}
 *   onClose={handleClose}
 *   onSubmit={handleSubmit}
 * />
 */

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import { DialogContentText, TextField } from "@mui/material";
import { useCallback, useState } from "react";

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

  const handleClose = useCallback(() => {
    if (typeof onClose === "function") {
      onClose();
    }
    setValue("");
  }, [onClose]);

  const handleConfirm = useCallback(
    (event) => {
      if (typeof onConfirm === "function") {
        onConfirm(event, value);
      }
      handleClose();
    },
    [onConfirm, handleClose, value],
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
              handleConfirm(e);
              setTimeout(() => handleClose(), 100);
            } else if (e.key === "Escape") {
              handleClose();
            } else {
              // Prevent keyboard shortcuts from triggering buttons behind the dialog
              // See https://stackoverflow.com/a/56285545/3734991
              e.stopPropagation();
            }
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{cancelText}</Button>
        <Button
          onClick={handleConfirm}
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
