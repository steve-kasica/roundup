import {
  Box,
  Collapse,
  IconButton,
  ListItem,
  ListItemText,
  Tooltip,
  styled,
} from "@mui/material";
import withOperationData from "../HOC/withOperationData";
import PropTypes from "prop-types";
import React from "react";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import StackOperationParams from "./StackOperationParams";
import PackOperationParams from "./PackOperationParams/PackOperationParams";

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
  columnCount,
  isFocused,
  index,
  // peekTable,
  // renameOperation,
  focusOperation,
}) {
  const label =
    operation.operationType.charAt(0).toUpperCase() +
    operation.operationType.slice(1);
  const position = index + 1;

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
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
    <>
      <ListItem
        onClick={() => {
          focusOperation();
          setDetailsOpen(!detailsOpen);
        }}
        secondaryAction={
          <IconButton edge="end" aria-label="menu" onClick={handleMenuOpen}>
            {detailsOpen ? <ExpandMore /> : <ExpandLess />}
          </IconButton>
        }
        sx={{
          backgroundColor: isFocused ? "primary.light" : "inherit", // Highlight background when focused
          borderLeft: isFocused ? "4px solid" : "none", // Add a left border when focused
          borderColor: isFocused ? "primary.main" : "transparent", // Border color for focus
          "& .MuiListItemText-primary": {
            fontWeight: isFocused ? "bold" : "normal", // Bold text when focused
          },
          "&:hover": {
            backgroundColor: "action.hover", // Add hover effect
          },
        }}
      >
        <ListItemText
          primary={`${position}. ${operation.name} (${columnCount})`}
          secondary={`${label}: ${childrenIds.join(", ")}`}
        />
      </ListItem>

      <Collapse in={detailsOpen} timeout="auto" unmountOnExit>
        <Box>
          {operation.operationType === OPERATION_TYPE_STACK && (
            <StackOperationParams />
          )}
          {operation.operationType === OPERATION_TYPE_PACK && (
            <PackOperationParams id={operation.id} />
          )}
        </Box>
      </Collapse>
    </>
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
  columnCount: PropTypes.number,
  isFocused: PropTypes.bool,
  index: PropTypes.number.isRequired,
  peekTable: PropTypes.func.isRequired,
  renameOperation: PropTypes.func.isRequired,
  focusOperation: PropTypes.func.isRequired,
};

const EnhancedOperationView = withOperationData(OperationView);
export default EnhancedOperationView;

/**
 *     // <StyledListItem
    //   hasError={Boolean(operation.error)}
    //   secondaryAction={
    //     <>
    //       {/* <IconButton edge="end" aria-label="menu" onClick={handleMenuOpen}>
    //         <MoreVertIcon />
    //       </IconButton>
    //       <Menu
    //         anchorEl={anchorEl}
    //         open={open}
    //         onClose={handleMenuClose}
    //         anchorOrigin={{ vertical: "top", horizontal: "right" }}
    //         transformOrigin={{ vertical: "top", horizontal: "left" }}
    //       >
    //         <MenuItem
    //           onClick={(event) => {
    //             peekTable();
    //             handleMenuClose(event);
    //           }}
    //         >
    //           Peek at table
    //         </MenuItem>
    //         <MenuItem
    //           onClick={() => {
    //             const newName = prompt(
    //               "Enter new operation name:",
    //               operation.name
    //             );
    //             if (
    //               newName &&
    //               newName.trim() &&
    //               newName.trim() !== operation.name
    //             ) {
    //               renameOperation(newName.trim());
    //             }
    //             handleMenuClose();
    //           }}
    //         >
    //           Rename
    //         </MenuItem>
    //       </Menu> 
    //     </>
    //   }
    //   disablePadding
    // >
 */
