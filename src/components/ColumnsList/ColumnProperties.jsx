import { useState } from "react";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  Tooltip,
} from "@mui/material";
import { Settings2 } from "lucide-react";
import { COLUMN_PROPERTIES } from "./columnProperties";

const groups = [...new Set(COLUMN_PROPERTIES.map((p) => p.group))];

const ColumnProperties = ({ visibleProperties, onVisiblePropertiesChange }) => {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(visibleProperties);

  const handleOpen = () => {
    setDraft(new Set(visibleProperties));
    setOpen(true);
  };

  const handleToggle = (key) => {
    setDraft((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const handleApply = () => {
    onVisiblePropertiesChange(draft);
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <>
      <Tooltip title="Choose visible columns">
        <IconButton onClick={handleOpen} aria-label="Choose visible columns">
          <Settings2 size={20} strokeWidth={1.5} />
        </IconButton>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="xs"
        fullWidth
        aria-labelledby="column-properties-dialog-title"
      >
        <DialogTitle id="column-properties-dialog-title">
          Column Properties
        </DialogTitle>
        <DialogContent dividers>
          {groups.map((group) => (
            <div key={group}>
              <strong>{group}</strong>
              <FormGroup sx={{ ml: 1, mb: 1 }}>
                {COLUMN_PROPERTIES.filter((p) => p.group === group).map(
                  (prop) => (
                    <FormControlLabel
                      key={prop.key}
                      control={
                        <Checkbox
                          size="small"
                          checked={draft.has(prop.key)}
                          onChange={() => handleToggle(prop.key)}
                        />
                      }
                      label={prop.label}
                    />
                  ),
                )}
              </FormGroup>
            </div>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button
            onClick={handleApply}
            variant="contained"
            disabled={draft.size === 0}
          >
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ColumnProperties;
