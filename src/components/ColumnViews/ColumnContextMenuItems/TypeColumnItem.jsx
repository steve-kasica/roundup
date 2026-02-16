import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import { useCallback } from "react";

const TypeColumnItem = ({ id, onClick }) => {
  const handleClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const menuItemSx = {};
  const iconSx = {};
  return (
    <>
      <MenuItem onClick={handleClick} sx={menuItemSx}>
        <ListItemIcon sx={iconSx}>
          <SwapHoriz fontSize="small" />
        </ListItemIcon>
        <ListItemText>Change Column Type</ListItemText>
      </MenuItem>
    </>
  );
};

export default TypeColumnItem;
