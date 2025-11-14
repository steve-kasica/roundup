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
  columnType,
  name,
  databaseName,
  excludeColumn,
  setColumnType,
  focusColumn,
  onInsertColumnLeftClick,
  onInsertColumnRightClick,
  renameColumn,
  // Props passed directly from parent component
  closeMenu,
  includeInsert = true,
  isError = false,
}) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [columnTypeDialogOpen, setColumnTypeDialogOpen] = useState(false);
  const [selectedColumnType, setSelectedColumnType] = useState(
    columnType || ""
  );

  const handleRenameColumn = useCallback(() => {
    setNewColumnName(name || databaseName || ""); // Pre-fill with current name
    setRenameDialogOpen(true);
  }, [name, databaseName]);

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

  // TODO: address later
  // const handleExcludeColumn = useCallback(
  //   (event) => {
  //     excludeColumn();
  //     closeMenu(event);
  //   },
  //   [closeMenu, excludeColumn]
  // );

  const handleSetColumnType = useCallback(() => {
    setSelectedColumnType(columnType || "");
    setColumnTypeDialogOpen(true);
  }, [columnType]);

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

  const menuItemSx = isError
    ? {
        color: "error.main",
        backgroundColor: "error.lighter",
        "&:hover": {
          backgroundColor: "error.light",
        },
      }
    : {};

  const iconSx = isError
    ? {
        color: "error.main",
      }
    : {};

  return (
    <>
      <MenuItem onClick={handleRenameColumn} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <Edit fontSize="small" />
        </ListItemIcon>
        <ListItemText>Rename column</ListItemText>
      </MenuItem>
      {/* <MenuItem onClick={handleExcludeColumn} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <Delete fontSize="small" />
        </ListItemIcon>
        <ListItemText>Exclude column</ListItemText>
      </MenuItem> */}
      <MenuItem onClick={handleSetColumnType} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <SwapHoriz fontSize="small" />
        </ListItemIcon>
        <ListItemText>Change column type</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleFocusColumn} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <CenterFocusStrong fontSize="small" />
        </ListItemIcon>
        <ListItemText>Focus column</ListItemText>
      </MenuItem>
      {includeInsert && (
        <>
          <MenuItem onClick={handleInsertColumnLeft} sx={menuItemSx}>
            <ListItemIcon sx={iconSx}>
              <KeyboardArrowLeft fontSize="small" />
            </ListItemIcon>
            <ListItemText>Insert column to the left</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleInsertColumnRight} sx={menuItemSx}>
            <ListItemIcon sx={iconSx}>
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
