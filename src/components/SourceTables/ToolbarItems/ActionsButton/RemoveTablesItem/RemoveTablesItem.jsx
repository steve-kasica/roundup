import { Remove } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";

const RemoveTablesItem = () => {
  const handleClick = () => {
    // todo: implement remove tables from operation logic
  };
  return (
    <MenuItem onClick={handleClick}>
      <ListItemIcon>
        <Remove />
      </ListItemIcon>
      <ListItemText>Remove from operation</ListItemText>
    </MenuItem>
  );
};

export default RemoveTablesItem;
