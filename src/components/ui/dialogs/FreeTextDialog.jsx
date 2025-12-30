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
