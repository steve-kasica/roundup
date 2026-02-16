import { CenterFocusStrong } from "@mui/icons-material";
import { setFocusedColumnIds } from "../../../slices/uiSlice";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { useCallback } from "react";
import { useDispatch } from "react-redux";

const FocusColumnItem = ({ id, handleCloseMenu }) => {
  const dispatch = useDispatch();
  const handleClick = useCallback(() => {
    dispatch(setFocusedColumnIds([id]));
    if (handleCloseMenu) {
      handleCloseMenu();
    }
  }, [dispatch, handleCloseMenu, id]);
  const menuItemSx = {};
  const iconSx = {};
  return (
    <MenuItem onClick={handleClick} sx={menuItemSx}>
      <ListItemIcon sx={iconSx}>
        <CenterFocusStrong fontSize="small" />
      </ListItemIcon>
      <ListItemText>Focus Column</ListItemText>
    </MenuItem>
  );
};

export default FocusColumnItem;
