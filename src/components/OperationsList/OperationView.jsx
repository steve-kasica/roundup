import {
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Tooltip,
  styled,
} from "@mui/material";
import { setFocusedOperation } from "../../slices/operationsSlice";
import { useDispatch } from "react-redux";
import withOperationData from "../HOC/withOperationData";
import PropTypes from "prop-types";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import React from "react";
import { rename } from "fs";

export const LAYOUT_ID = "operationListItem";

const StyledListItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "hasError",
})(({ theme, hasError }) => ({
  ...(hasError && {
    backgroundColor: theme.palette.error.main,
    borderLeft: `4px solid ${theme.palette.error.dark}`,
    "& .MuiListItemText-primary, .MuiListItemText-secondary": {
      color: theme.palette.error.contrastText,
    },
  }),
}));

function OperationView({
  operation,
  childrenIds,
  index,
  peekTable,
  renameOperation,
}) {
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

  // Parse error message if it's a JSON string
  const getErrorMessage = () => {
    if (!operation.error) return "";

    if (typeof operation.error === "string") {
      try {
        const parsedError = JSON.parse(operation.error);
        return parsedError.message || operation.error;
      } catch {
        return operation.error;
      }
    }

    return operation.error.message || "An error occurred";
  };

  const listItemContent = (
    <StyledListItem
      hasError={Boolean(operation.error)}
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
            <MenuItem
              onClick={() => {
                const newName = prompt("Enter new operation name:", name);
                if (newName && newName.trim() && newName.trim() !== name) {
                  renameOperation(newName.trim());
                }
                handleMenuClose();
              }}
            >
              Rename
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
    </StyledListItem>
  );

  return operation.error ? (
    <Tooltip title={getErrorMessage()} arrow placement="right">
      {listItemContent}
    </Tooltip>
  ) : (
    listItemContent
  );
}

OperationView.propTypes = {
  operation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    columnCount: PropTypes.number,
    operationType: PropTypes.string.isRequired,
    error: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.string,
      PropTypes.bool,
    ]),
  }).isRequired,
  childrenIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  index: PropTypes.number.isRequired,
  peekTable: PropTypes.func.isRequired,
  renameOperation: PropTypes.func.isRequired,
};

const EnhancedOperationView = withOperationData(OperationView);
export default EnhancedOperationView;
