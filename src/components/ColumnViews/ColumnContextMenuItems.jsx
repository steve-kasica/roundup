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
  Divider,
} from "@mui/material";
import {
  Edit,
  SwapHoriz,
  CenterFocusStrong,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  VisibilityOff,
  Delete,
  DeleteForever,
} from "@mui/icons-material";
import { useCallback, useState } from "react";
import withColumnData from "./withColumnData";
import {
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_DATE,
  COLUMN_TYPE_NUMERICAL,
  COLUMN_TYPE_VARCHAR,
} from "../../slices/columnsSlice";
import { RoundupToDuckDBTypes } from "../../lib/duckdb";

const ColumnContextMenu = ({
  // Props passed via `withColumnData` HOC
  columnType,
  name,
  databaseName,
  setColumnType,
  focusColumn,

  deleteColumn,
  renameColumn,
  // Props passed directly from parent component
  includeInsert = true,
  isError = false,
  onHideColumn,
  onInsertColumnLeftClick,
  onInsertColumnRightClick,
  handleCloseMenu,
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
      handleCloseMenu(event);
    },
    [handleCloseMenu]
  );

  const handleRenameConfirm = useCallback(
    (event) => {
      if (newColumnName.trim() && renameColumn) {
        renameColumn(newColumnName.trim());
      }
      handleRenameDialogClose();
      handleCloseMenu(event);
    },
    [newColumnName, renameColumn, handleRenameDialogClose, handleCloseMenu]
  );

  const handleRenameCancel = useCallback(
    (event) => {
      handleRenameDialogClose();
      handleCloseMenu(event);
    },
    [handleRenameDialogClose, handleCloseMenu]
  );

  const handleColumnTypeDialogClose = useCallback(
    (event) => {
      setColumnTypeDialogOpen(false);
      setSelectedColumnType("");
      handleCloseMenu(event);
    },
    [handleCloseMenu]
  );

  const handleColumnTypeConfirm = useCallback(
    (event) => {
      if (selectedColumnType && setColumnType) {
        setColumnType(selectedColumnType);
      }
      handleColumnTypeDialogClose();
      handleCloseMenu(event);
    },
    [
      selectedColumnType,
      setColumnType,
      handleColumnTypeDialogClose,
      handleCloseMenu,
    ]
  );

  const handleColumnTypeCancel = useCallback(
    (event) => {
      handleColumnTypeDialogClose();
      handleCloseMenu(event);
    },
    [handleColumnTypeDialogClose, handleCloseMenu]
  );

  const handleHideColumn = useCallback(
    (event) => {
      onHideColumn();
      handleCloseMenu(event);
    },
    [handleCloseMenu, onHideColumn]
  );

  const handleDeleteColumn = useCallback(
    (event) => {
      deleteColumn();
      handleCloseMenu(event);
    },
    [handleCloseMenu, deleteColumn]
  );

  const handleSetColumnType = useCallback(() => {
    setSelectedColumnType(columnType || "");
    setColumnTypeDialogOpen(true);
  }, [columnType]);

  const handleFocusColumn = useCallback(
    (event) => {
      focusColumn();
      handleCloseMenu(event);
    },
    [handleCloseMenu, focusColumn]
  );

  const handleInsertColumnLeft = useCallback(
    (event) => {
      onInsertColumnLeftClick();
      handleCloseMenu(event);
    },
    [handleCloseMenu, onInsertColumnLeftClick]
  );

  const handleInsertColumnRight = useCallback(
    (event) => {
      onInsertColumnRightClick();
      handleCloseMenu(event);
    },
    [handleCloseMenu, onInsertColumnRightClick]
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
        <ListItemText>Rename Column</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleSetColumnType} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <SwapHoriz fontSize="small" />
        </ListItemIcon>
        <ListItemText>Change Column Type</ListItemText>
      </MenuItem>
      <Divider orientation="horizontal" />
      <MenuItem onClick={handleHideColumn} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <VisibilityOff fontSize="small" />
        </ListItemIcon>
        <ListItemText>Hide Column</ListItemText>
      </MenuItem>
      <MenuItem onClick={handleDeleteColumn} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <DeleteForever fontSize="small" />
        </ListItemIcon>
        <ListItemText>Delete Column</ListItemText>
      </MenuItem>
      <Divider orientation="horizontal" />
      <MenuItem onClick={handleFocusColumn} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <CenterFocusStrong fontSize="small" />
        </ListItemIcon>
        <ListItemText>Focus Column</ListItemText>
      </MenuItem>
      {onInsertColumnLeftClick && onInsertColumnRightClick && (
        <Divider orientation="horizontal" />
      )}
      {onInsertColumnLeftClick && (
        <MenuItem onClick={handleInsertColumnLeft} sx={menuItemSx}>
          <ListItemIcon sx={iconSx}>
            <KeyboardArrowLeft fontSize="small" />
          </ListItemIcon>
          <ListItemText>Insert Column To The Left</ListItemText>
        </MenuItem>
      )}
      {onInsertColumnRightClick && (
        <MenuItem onClick={handleInsertColumnRight} sx={menuItemSx}>
          <ListItemIcon sx={iconSx}>
            <KeyboardArrowRight fontSize="small" />
          </ListItemIcon>
          <ListItemText>Insert Column To The Right</ListItemText>
        </MenuItem>
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
              value={RoundupToDuckDBTypes(COLUMN_TYPE_CATEGORICAL)}
              control={<Radio />}
              label={
                COLUMN_TYPE_CATEGORICAL.charAt(0).toUpperCase() +
                COLUMN_TYPE_CATEGORICAL.slice(1).toLocaleLowerCase()
              }
            />
            <FormControlLabel
              value={RoundupToDuckDBTypes(COLUMN_TYPE_NUMERICAL)}
              control={<Radio />}
              label={
                COLUMN_TYPE_NUMERICAL.charAt(0).toUpperCase() +
                COLUMN_TYPE_NUMERICAL.slice(1).toLocaleLowerCase()
              }
            />
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
