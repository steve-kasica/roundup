import PropTypes from "prop-types";
import {
  TableCell,
  Box,
  Typography,
  IconButton,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Menu,
  Divider,
  Stack,
} from "@mui/material";
import {
  ArrowUpward,
  ArrowDownward,
  UnfoldMore,
  VisibilityOff as RemoveIcon,
  DriveFileRenameOutline as RenameIcon,
  MoreVert,
} from "@mui/icons-material";
import withColumnData from "../../HOC/withColumnData";
import { useRef, useState } from "react";
import EditableText from "../../ui/EditableText";

const ColumnHeader = ({
  column,
  sortBy,
  sortDirection,
  onSort,
  index = 0,
  removeColumn,
  renameColumn,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const columnNameRef = useRef(null);
  const [isHeaderEditable, setIsHeaderEditable] = useState(false);
  const handleSort = (newDirection = "asc") => {
    if (!onSort) return;

    // If this column is already sorted, toggle direction
    if (sortBy === column.id) {
      newDirection = sortDirection === "asc" ? "desc" : "asc";
    }

    onSort(column.id, newDirection);
  };

  const getSortIcon = () => {
    if (sortBy !== column.id) {
      return <UnfoldMore fontSize="small" />;
    }

    return sortDirection === "asc" ? (
      <ArrowUpward fontSize="small" />
    ) : (
      <ArrowDownward fontSize="small" />
    );
  };

  const getSortIconColor = () => {
    return sortBy === column.id ? "primary" : "disabled";
  };

  return (
    <>
      <TableCell
        sx={{
          fontWeight: 600,
          backgroundColor: "grey.50",
          minWidth: 120,
          padding: 0.5,
          whiteSpace: "nowrap",
          cursor: "default",
          userSelect: "none",
          "&:hover": onSort
            ? {
                backgroundColor: "grey.100",
              }
            : {},
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 1,
          }}
        >
          <Typography
            variant="subtitle2"
            sx={{
              fontWeight: 600,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            <EditableText
              inputRef={columnNameRef}
              initialValue={column?.name}
              placeholder={`Column ${index + 1}`}
              onChange={renameColumn}
              isReadOnly={true}
              isEditable={isHeaderEditable}
              onEditingStateChange={() =>
                setIsHeaderEditable(!isHeaderEditable)
              }
              fontSize="1rem"
            />
            {column.columnType && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.7rem",
                  display: "block",
                  lineHeight: 1,
                }}
              >
                {column.columnType}
              </Typography>
            )}
          </Typography>

          {onSort && (
            <Stack
              direction="row"
              spacing={0} // Adjust spacing as needed
              alignItems="center"
            >
              <IconButton
                size="small"
                onClick={handleSort}
                sx={{
                  p: 0,
                  color: getSortIconColor(),
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
                disableRipple
              >
                {getSortIcon()}
              </IconButton>
              <IconButton
                size="small"
                onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                sx={{
                  p: 0,
                  color: "text.secondary",
                  "&:hover": {
                    backgroundColor: "action.hover",
                    color: "text.primary",
                  },
                }}
              >
                <MoreVert fontSize="small" />
              </IconButton>
            </Stack>
          )}
        </Box>
      </TableCell>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: {
            minWidth: 200,
            boxShadow: 3,
          },
        }}
      >
        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            removeColumn();
          }}
        >
          <ListItemIcon>
            <RemoveIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Remove Column</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            setMenuAnchorEl(null);
            // Delay focus to allow menu to close first
            setIsHeaderEditable(true);
            setTimeout(() => {
              columnNameRef.current?.focusAndSelect();
            }, 100); // 50-100ms is usually enough
          }}
        >
          <ListItemIcon>
            <RenameIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename Column</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleSort("asc");
            setMenuAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <ArrowUpward fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sort Ascending</ListItemText>
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleSort("desc");
            setMenuAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <ArrowDownward fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sort Descending</ListItemText>
        </MenuItem>

        <Divider />

        {/* TODO   */}
        {/* <MenuItem onClick={() => console.log("info")}>
          <ListItemIcon>
            <Info fontSize="small" />
          </ListItemIcon>
          <ListItemText>Column Info</ListItemText>
        </MenuItem> */}
      </Menu>
    </>
  );
};

ColumnHeader.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    column_name: PropTypes.string,
    columnType: PropTypes.string,
  }).isRequired,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf(["asc", "desc"]),
  onSort: PropTypes.func,
  index: PropTypes.number,
  removeColumn: PropTypes.func.isRequired,
  renameColumn: PropTypes.func.isRequired,
};

const EnhancedColumnHeader = withColumnData(ColumnHeader);
export default EnhancedColumnHeader;
