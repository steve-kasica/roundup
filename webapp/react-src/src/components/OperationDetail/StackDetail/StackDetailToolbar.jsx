import { useState } from "react";

import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedColumns,
  selectSelectedColumns,
} from "../../../data/slices/columnsSlice";
import { removeColumnsAction } from "../../../data/sagas/removeColumnsSaga";

export default function StackDetailToolbar() {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const selectedColumnIds = useSelector(selectSelectedColumns);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      label: "Remove selected columns",
      icon: <DeleteIcon />,
      action: () => {
        dispatch(removeColumnsAction(selectedColumnIds));
        handleMenuClose();
      },
    },
    {
      label: "Clear column selection",
      icon: <ClearIcon />,
      action: () => {
        dispatch(clearSelectedColumns());
        handleMenuClose();
      },
    },
  ];

  return (
    <Box
      className="toolbar"
      sx={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        padding: "8px",
        border: "1px solid #ccc",
        borderTopLeftRadius: "4px",
        borderTopRightRadius: "4px",
      }}
    >
      {menuItems.map((item, index) => (
        <Tooltip key={index} title={item.label} arrow placement="top">
          <span>
            <IconButton
              disabled={selectedColumnIds.length === 0}
              aria-label={item.label}
              variant="outlined"
              size="small"
              onClick={item.action}
            >
              {item.icon}
            </IconButton>
          </span>
        </Tooltip>
      ))}
      <Tooltip title="More options" arrow placement="top">
        <IconButton
          aria-label="More options"
          size="small"
          onClick={(event) => setAnchorEl(event.currentTarget)}
        >
          <MoreVertIcon />
        </IconButton>
      </Tooltip>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuItems.map((item, index) => (
          <MenuItem key={index} onClick={item.action}>
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}
