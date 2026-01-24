import { KeyboardArrowDown } from "@mui/icons-material";
import { Button, Menu } from "@mui/material";
import { useState } from "react";

const ButtonWithMenu = ({ label = "button", children, ...props }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <Button
        variant="outlined"
        size="small"
        onClick={handleClick}
        endIcon={<KeyboardArrowDown />}
        sx={{ textTransform: "none" }}
        {...props}
      >
        {label}
      </Button>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <div onClick={handleClose}>{children}</div>
      </Menu>
    </>
  );
};

export default ButtonWithMenu;
