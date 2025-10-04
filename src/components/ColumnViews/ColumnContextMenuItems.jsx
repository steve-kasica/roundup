/* eslint-disable react/prop-types */
import { MenuItem, ListItemIcon, ListItemText } from "@mui/material";
import {
  Edit,
  Delete,
  SwapHoriz,
  CenterFocusStrong,
  KeyboardArrowLeft,
  KeyboardArrowRight,
} from "@mui/icons-material";
import { useCallback } from "react";
import withColumnData from "./withColumnData";

const ColumnContextMenu = ({
  // Props passed via `withColumnData` HOC
  excludeColumn,
  changeColumnType,
  focusColumn,
  insertColumnLeft,
  insertColumnRight,
  // Props passed directly from parent component
  closeMenu,
}) => {
  const handleRenameColumn = useCallback(() => {
    // TODO: Implement rename functionality
    closeMenu();
  }, [closeMenu]);

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
    </>
  );
};

ColumnContextMenu.displayName = "ColumnContextMenu";

const EnhancedColumnContextMenuItems = withColumnData(ColumnContextMenu);

EnhancedColumnContextMenuItems.displayName = "EnhancedColumnContextMenuItems";

export { EnhancedColumnContextMenuItems, ColumnContextMenu };
