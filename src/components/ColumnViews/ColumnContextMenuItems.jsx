/* eslint-disable react/prop-types */
import {
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import {
  Edit,
  Delete,
  SwapHoriz,
  CenterFocusStrong,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { useCallback, useState } from "react";
import withColumnData from "./withColumnData";

const ColumnContextMenu = ({
  // Props passed via `withColumnData` HOC
  column,
  excludeColumn,
  changeColumnType,
  focusColumn,
  insertColumnLeft,
  insertColumnRight,
  // action dispatch functions passed via `withColumnData` HOC
  renameColumn,
  // Props passed directly from parent component
  closeMenu,
}) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const handleRenameColumn = useCallback(() => {
    setNewColumnName(column.name || column.columnName || ""); // Pre-fill with current name
    setRenameDialogOpen(true);
    closeMenu();
  }, [closeMenu, column.name, column.columnName]);

  const handleRenameDialogClose = useCallback(() => {
    setRenameDialogOpen(false);
    setNewColumnName("");
  }, []);

  const handleRenameConfirm = useCallback(() => {
    if (newColumnName.trim() && renameColumn) {
      renameColumn(newColumnName.trim());
    }
    handleRenameDialogClose();
  }, [newColumnName, renameColumn, handleRenameDialogClose]);

  const handleRenameCancel = useCallback(() => {
    handleRenameDialogClose();
  }, [handleRenameDialogClose]);

  const handleExcludeColumn = useCallback(() => {
    excludeColumn();
    closeMenu();
  }, [closeMenu, excludeColumn]);

  const handleChangeColumnType = useCallback(() => {
    changeColumnType();
    closeMenu();
  }, [changeColumnType, closeMenu]);

  const handleFocusColumn = useCallback(() => {
    focusColumn();
    closeMenu();
  }, [closeMenu, focusColumn]);

  const handleInsertColumnLeft = useCallback(() => {
    insertColumnLeft();
    closeMenu();
  }, [closeMenu, insertColumnLeft]);

  const handleInsertColumnRight = useCallback(() => {
    insertColumnRight();
    closeMenu();
  }, [closeMenu, insertColumnRight]);

  return (
    <>
      <MenuItem onClick={handleRenameColumn}>
        <ListItemIcon>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Rename column</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleExcludeColumn}>
        <ListItemIcon>
          <Delete fontSize="small" />
        </ListItemIcon>
        <ListItemText>Exclude column</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleChangeColumnType}>
        <ListItemIcon>
          <SwapHoriz fontSize="small" />
        </ListItemIcon>
        <ListItemText>Change column type</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleFocusColumn}>
        <ListItemIcon>
          <CenterFocusStrong fontSize="small" />
        </ListItemIcon>
        <ListItemText>Focus column</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleInsertColumnLeft}>
        <ListItemIcon>
          <KeyboardArrowLeft fontSize="small" />
        </ListItemIcon>
        <ListItemText>Insert column to the left</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleInsertColumnRight}>
        <ListItemIcon>
          <KeyboardArrowRight fontSize="small" />
        </ListItemIcon>
        <ListItemText>Insert column to the right</ListItemText>
      </MenuItem>

      {/* Rename Column Dialog */}
      <Dialog
        open={renameDialogOpen}
        onClose={handleRenameCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Rename Column</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Column Name"
            fullWidth
            variant="outlined"
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleRenameConfirm();
              } else if (e.key === "Escape") {
                handleRenameCancel();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRenameCancel}>Cancel</Button>
          <Button
            onClick={handleRenameConfirm}
            variant="contained"
            disabled={!newColumnName.trim()}
          >
            Rename
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ColumnContextMenu.displayName = "ColumnContextMenu";

const EnhancedColumnContextMenuItems = withColumnData(ColumnContextMenu);

EnhancedColumnContextMenuItems.displayName = "EnhancedColumnContextMenuItems";

export { EnhancedColumnContextMenuItems, ColumnContextMenu };
