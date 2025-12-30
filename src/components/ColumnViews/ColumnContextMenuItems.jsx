/**
 * @fileoverview ColumnContextMenuItems Component
 *
 * Provides a comprehensive context menu for column operations, allowing users to
 * perform various actions on table columns including renaming, type conversion,
 * column insertion, hiding, deletion, and focusing.
 *
 * The component manages multiple dialog states for different operations and integrates
 * with Redux state through the withColumnData HOC to access column properties and
 * dispatch actions.
 *
 * Available operations:
 * - Rename column
 * - Convert column type (categorical/numerical)
 * - Insert new column (left/right)
 * - Hide column from view
 * - Delete column
 * - Focus on column
 *
 * @module components/ColumnViews/ColumnContextMenuItems
 *
 * @example
 * <EnhancedColumnContextMenuItems
 *   includeInsert={true}
 *   isError={false}
 *   onHideColumn={handleHide}
 *   onInsertColumnLeftClick={handleInsertLeft}
 *   onInsertColumnRightClick={handleInsertRight}
 *   handleCloseMenu={handleClose}
 * />
 */

import {
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  DeleteForever,
} from "@mui/icons-material";
import { useCallback, useState } from "react";
import { withColumnData } from "../HOC";
import {
  COLUMN_TYPE_CATEGORICAL,
  COLUMN_TYPE_NUMERICAL,
} from "../../slices/columnsSlice";
import { RoundupToDuckDBTypes } from "../../lib/duckdb";
import { FreeTextDialog, InsertColumnDialog } from "../ui/dialogs";

/**
 * ColumnContextMenu Component
 *
 * Renders a context menu with various column operations, including dialogs
 * for complex interactions like renaming and type conversion.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.columnType - Current column type from withColumnData HOC
 * @param {Function} props.setColumnType - Function to update column type from HOC
 * @param {Function} props.focusColumn - Function to focus on this column from HOC
 * @param {Function} props.deleteColumn - Function to delete this column from HOC
 * @param {Function} props.renameColumn - Function to rename this column from HOC
 * @param {boolean} [props.includeInsert=true] - Whether to show insert column options
 * @param {boolean} [props.isError=false] - Whether the column has errors
 * @param {Function} props.onHideColumn - Callback to hide the column
 * @param {Function} props.onInsertColumnLeftClick - Callback for inserting column to the left
 * @param {Function} props.onInsertColumnRightClick - Callback for inserting column to the right
 * @param {Function} props.handleCloseMenu - Callback to close the context menu
 *
 * @returns {React.ReactElement} Menu items with associated dialogs
 */
const ColumnContextMenu = ({
  // Props passed via `withColumnData` HOC
  columnType,
  setColumnType,
  focusColumn,

  deleteColumn,
  renameColumn,
  // Props passed directly from parent component
  // eslint-disable-next-line no-unused-vars
  includeInsert = true,
  isError = false,
  onHideColumn,
  onInsertColumnLeftClick,
  onInsertColumnRightClick,
  handleCloseMenu,
}) => {
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [insertDialogOpen, setInsertDialogOpen] = useState(false);
  const [insertDirection, setInsertDirection] = useState(null);
  const [columnTypeDialogOpen, setColumnTypeDialogOpen] = useState(false);

  const [selectedColumnType, setSelectedColumnType] = useState(
    columnType || ""
  );

  // Callback for handling column rename
  const handleRenameColumnClick = useCallback(() => {
    setRenameDialogOpen(true);
  }, []);

  const handleRenameConfirm = useCallback(
    (event, newColumnName) => {
      if (newColumnName.trim() && renameColumn) {
        renameColumn(newColumnName.trim());
      }
      setRenameDialogOpen(false);
      handleCloseMenu(event);
    },
    [handleCloseMenu, renameColumn]
  );

  const handleRenameCancel = useCallback(
    (event) => {
      setRenameDialogOpen(false);
      handleCloseMenu(event);
    },
    [handleCloseMenu]
  );

  // Callback for handling column type change
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

  const handleInsertColumnLeft = useCallback(() => {
    setInsertDirection("left");
    setInsertDialogOpen(true);
  }, []);

  const handleInsertColumnRight = useCallback(() => {
    setInsertDirection("right");
    setInsertDialogOpen(true);
  }, []);

  const handleInsertConfirm = useCallback(
    (event, data) => {
      if (insertDirection === "left" && onInsertColumnLeftClick) {
        onInsertColumnLeftClick(data);
      } else if (insertDirection === "right" && onInsertColumnRightClick) {
        onInsertColumnRightClick(data);
      }
      setInsertDialogOpen(false);
      setInsertDirection(null);
      handleCloseMenu(event);
    },
    [
      handleCloseMenu,
      insertDirection,
      onInsertColumnLeftClick,
      onInsertColumnRightClick,
    ]
  );

  const handleInsertCancel = useCallback(
    (event) => {
      setInsertDialogOpen(false);
      setInsertDirection(null);
      handleCloseMenu(event);
    },
    [handleCloseMenu]
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
      <MenuItem onClick={handleRenameColumnClick} sx={menuItemSx}>
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
      <FreeTextDialog
        title="Rename Column"
        open={renameDialogOpen}
        onClose={handleRenameCancel}
        onConfirm={handleRenameConfirm}
        label="Column Name"
      />

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

      <InsertColumnDialog
        direction={insertDirection}
        open={insertDialogOpen}
        onClose={handleInsertCancel}
        onSubmit={handleInsertConfirm}
      />
    </>
  );
};

ColumnContextMenu.displayName = "ColumnContextMenu";

const EnhancedColumnContextMenuItems = withColumnData(ColumnContextMenu);

EnhancedColumnContextMenuItems.displayName = "EnhancedColumnContextMenuItems";

export { EnhancedColumnContextMenuItems, ColumnContextMenu };
