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
  RadioGroup,
  FormControlLabel,
  Radio,
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
import { COLUMN_TYPE_VARCHAR } from "../../slices/columnsSlice";

const ColumnContextMenu = ({
  // Props passed via `withColumnData` HOC
  column,
  excludeColumn,
  setColumnType,
  focusColumn,
  onInsertColumnLeftClick,
  onInsertColumnRightClick,
  // action dispatch functions passed via `withColumnData` HOC
  renameColumn,
  // Props passed directly from parent component
  closeMenu,
  includeInsert = true,
}) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [columnTypeDialogOpen, setColumnTypeDialogOpen] = useState(false);
  const [selectedColumnType, setSelectedColumnType] = useState(
    column.columnType || ""
  );

  const handleRenameColumn = useCallback(() => {
    setNewColumnName(column.name || column.columnName || ""); // Pre-fill with current name
    setRenameDialogOpen(true);
  }, [column.name, column.columnName]);

  const handleRenameDialogClose = useCallback(
    (event) => {
      setRenameDialogOpen(false);
      setNewColumnName("");
      closeMenu(event);
    },
    [closeMenu]
  );

  const handleRenameConfirm = useCallback(
    (event) => {
      if (newColumnName.trim() && renameColumn) {
        renameColumn(newColumnName.trim());
      }
      handleRenameDialogClose();
      closeMenu(event);
    },
    [newColumnName, renameColumn, handleRenameDialogClose, closeMenu]
  );

  const handleRenameCancel = useCallback(
    (event) => {
      handleRenameDialogClose();
      closeMenu(event);
    },
    [handleRenameDialogClose, closeMenu]
  );

  const handleColumnTypeDialogClose = useCallback(
    (event) => {
      setColumnTypeDialogOpen(false);
      setSelectedColumnType("");
      closeMenu(event);
    },
    [closeMenu]
  );

  const handleColumnTypeConfirm = useCallback(
    (event) => {
      if (selectedColumnType && setColumnType) {
        setColumnType(selectedColumnType);
      }
      handleColumnTypeDialogClose();
      closeMenu(event);
    },
    [selectedColumnType, setColumnType, handleColumnTypeDialogClose, closeMenu]
  );

  const handleColumnTypeCancel = useCallback(
    (event) => {
      handleColumnTypeDialogClose();
      closeMenu(event);
    },
    [handleColumnTypeDialogClose, closeMenu]
  );

  const handleExcludeColumn = useCallback(
    (event) => {
      excludeColumn();
      closeMenu(event);
    },
    [closeMenu, excludeColumn]
  );

  const handleSetColumnType = useCallback(() => {
    setSelectedColumnType(column.columnType || "");
    setColumnTypeDialogOpen(true);
  }, [column.columnType]);

  const handleFocusColumn = useCallback(
    (event) => {
      focusColumn();
      closeMenu(event);
    },
    [closeMenu, focusColumn]
  );

  const handleInsertColumnLeft = useCallback(
    (event) => {
      onInsertColumnLeftClick();
      closeMenu(event);
    },
    [closeMenu, onInsertColumnLeftClick]
  );

  const handleInsertColumnRight = useCallback(
    (event) => {
      onInsertColumnRightClick();
      closeMenu(event);
    },
    [closeMenu, onInsertColumnRightClick]
  );

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
      <MenuItem onClick={handleSetColumnType}>
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
      {includeInsert && (
        <>
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
        </>
      )}

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

      {/* Change Column Type Dialog */}
      <Dialog
        open={columnTypeDialogOpen}
        onClose={handleColumnTypeCancel}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Change Column Type</DialogTitle>
        <DialogContent>
          <RadioGroup
            value={selectedColumnType}
            onChange={(e) => setSelectedColumnType(e.target.value)}
          >
            <FormControlLabel
              value={COLUMN_TYPE_VARCHAR}
              control={<Radio />}
              label="VARCHAR"
            />
            {/* <FormControlLabel
              value={COLUMN_TYPE_NUMERICAL}
              control={<Radio />}
              label="Numerical"
            />
            <FormControlLabel
              value={COLUMN_TYPE_DATE}
              control={<Radio />}
              label="Date"
            /> */}
          </RadioGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleColumnTypeCancel}>Cancel</Button>
          <Button
            onClick={handleColumnTypeConfirm}
            variant="contained"
            disabled={!selectedColumnType}
          >
            Change Type
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
