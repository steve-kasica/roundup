import { Remove } from "@mui/icons-material";
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";

const RemoveTablesItem = () => {
  const handleClick = () => console.log("Remove Tables button clicked");
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
