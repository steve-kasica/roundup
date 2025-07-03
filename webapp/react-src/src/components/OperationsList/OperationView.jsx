import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { setFocusedOperation } from "../../data/slices/operationsSlice";
import { useDispatch } from "react-redux";
import withOperationData from "../HOC/withOperationData";
import PropTypes from "prop-types";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import React from "react";

export const LAYOUT_ID = "operationListItem";

function OperationListItemView({ operation, childrenIds, index, peekTable }) {
  const { id, name, columnCount, operationType } = operation;
  const dispatch = useDispatch();

  const label = operationType.charAt(0).toUpperCase() + operationType.slice(1);
  const position = index + 1;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <ListItem
      secondaryAction={
        <>
          <IconButton edge="end" aria-label="menu" onClick={handleMenuOpen}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "left" }}
          >
            <MenuItem
              onClick={(event) => {
                peekTable();
                handleMenuClose(event);
              }}
            >
              Peek at table
            </MenuItem>
            {/* TODO: delete operation from this menu */}
            {/* <MenuItem onClick={handleMenuClose}>Delete</MenuItem> */}
          </Menu>
        </>
      }
      disablePadding
    >
      <ListItemButton onClick={() => dispatch(setFocusedOperation({ id }))}>
        <ListItemText
          primary={`${position}. ${name} (${columnCount})`}
          secondary={`${label}: ${childrenIds.join(", ")}`}
        />
      </ListItemButton>
    </ListItem>
  );
}

OperationListItemView.propTypes = {
  operation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    columnCount: PropTypes.number,
    operationType: PropTypes.string.isRequired,
  }).isRequired,
  childrenIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  index: PropTypes.number.isRequired,
};

const EnhancedOperationListItemView = withOperationData(OperationListItemView);
export default EnhancedOperationListItemView;
