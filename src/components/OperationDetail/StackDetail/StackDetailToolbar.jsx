import { useState } from "react";
import PropTypes from "prop-types";

import { Box, IconButton, Menu, MenuItem, Tooltip } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ClearIcon from "@mui/icons-material/Clear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CompareIcon from "@mui/icons-material/Compare";
import { useDispatch, useSelector } from "react-redux";
import {
  clearSelectedColumns,
  selectSelectedColumns,
} from "../../../slices/columnsSlice";
import { removeColumnsAction } from "../../../sagas/removeColumnsSaga";
import { setShowColumnIndexDetails } from "../../../slices/uiSlice";

export default function StackDetailToolbar({
  setSelectionAnchorCell,
  setSelectionExtentCell,
}) {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState(null);
  const selectedColumnIds = useSelector(selectSelectedColumns);

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const menuItems = [
    {
      label: "Compare column values",
      icon: <CompareIcon />,
      disabled: selectedColumnIds.length < 2,
      action: () => {
        dispatch(setShowColumnIndexDetails(true));
        handleMenuClose();
      },
    },
    {
      label: "Remove selected columns",
      icon: <DeleteIcon />,
      disabled: selectedColumnIds.length === 0,
      action: () => {
        dispatch(removeColumnsAction(selectedColumnIds));
        handleMenuClose();
      },
    },
    {
      label: "Clear column selection",
      icon: <ClearIcon />,
      disabled: selectedColumnIds.length === 0,
      action: () => {
        setSelectionAnchorCell(null);
        setSelectionExtentCell(null);
        dispatch(clearSelectedColumns());
        dispatch(setShowColumnIndexDetails(false));
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
              disabled={item.disabled}
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
          <MenuItem key={index} onClick={item.action} disabled={item.disabled}>
            {item.icon}
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
}

StackDetailToolbar.propTypes = {
  setSelectionAnchorCell: PropTypes.func.isRequired,
  setSelectionExtentCell: PropTypes.func.isRequired,
};
