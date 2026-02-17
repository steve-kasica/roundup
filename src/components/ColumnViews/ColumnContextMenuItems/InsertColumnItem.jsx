import { KeyboardArrowRight } from "@mui/icons-material";
import {
  ListItemIcon,
  ListItemText,
  MenuItem,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";
import { useCallback, useState } from "react";

const InsertColumnItem = ({ direction, index, onSubmit, onCancel }) => {
  const [insertDialogOpen, setInsertDialogOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    setInsertDialogOpen(false);
    onSubmit(e, formValues);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "Escape") {
      setInsertDialogOpen(false);
      onCancel();
    } else {
      // See https://stackoverflow.com/a/56285545/3734991
      e.stopPropagation();
    }
  };

  const handleOnCancel = () => {
    setInsertDialogOpen(false);
    onCancel();
  };

  return (
    <>
      <MenuItem onClick={() => setInsertDialogOpen(true)}>
        <ListItemIcon>
          {direction === "left" ? (
            <KeyboardArrowRight
              fontSize="small"
              style={{ transform: "rotate(180deg)" }}
            />
          ) : (
            <KeyboardArrowRight fontSize="small" />
          )}
        </ListItemIcon>
        <ListItemText>
          {direction === "left" ? "Insert Column Left" : "Insert Column Right"}
        </ListItemText>
      </MenuItem>

      <Dialog open={insertDialogOpen} onClose={handleOnCancel}>
        <DialogTitle>Insert New Column ({direction})</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Specify a value to fill the inserting column. Blank values will be
            rendered as null
          </DialogContentText>
          <form
            onSubmit={handleSubmit}
            id="insert-column-form"
            onKeyDown={handleKeyDown}
          >
            <TextField
              autoFocus
              required
              margin="dense"
              id="name"
              name="name"
              label="Column name"
              fullWidth
              variant="standard"
            />
            <TextField
              margin="dense"
              id="fillValue"
              name="fillValue"
              label="Fill Value"
              type="text"
              placeholder="null"
              fullWidth
              variant="standard"
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleOnCancel}>Cancel</Button>
          <Button type="submit" form="insert-column-form">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InsertColumnItem;
