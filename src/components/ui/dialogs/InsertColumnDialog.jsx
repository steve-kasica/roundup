import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
} from "@mui/material";

const InsertColumnDialog = ({ direction, onSubmit, onClose, ...props }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const formJson = Object.fromEntries(formData.entries());
    onSubmit(e, formJson);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit(e);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <Dialog {...props}>
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
        <Button onClick={onClose}>Cancel</Button>
        <Button type="submit" form="insert-column-form">
          Confirm
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InsertColumnDialog;
