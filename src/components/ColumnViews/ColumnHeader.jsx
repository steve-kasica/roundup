import {
  Box,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import EditableText from "../ui/EditableText";
import PropTypes from "prop-types";
import ColumnTypeIcon from "./ColumnTypeIcon";
import { useRef, useState } from "react";
import {
  DriveFileRenameOutline as RenameIcon,
  DeleteForever as RemoveIcon,
  MoreVert,
  PanTool as RearrangeIcon,
  Done as SelectIcon,
} from "@mui/icons-material";
import withColumnData from "./withColumnData";

const ColumnHeader = withColumnData(
  ({
    column,
    isNull,
    isReadOnly = true,
    renameColumn,
    removeColumn,
    selectSingleColumn,
    sx,
  }) => {
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [isEditable, setIsEditable] = useState(false);
    const headerInputRef = useRef(null);
    const menuItems = [
      {
        label: "Rename",
        icon: RenameIcon,
        action: () => {
          // Delay focus to allow menu to close first
          setIsEditable(true);
          setTimeout(() => {
            headerInputRef.current?.focusAndSelect();
          }, 100); // 50-100ms is usually enough
        },
      },
      {
        label: "Remove",
        icon: RemoveIcon,
        action: removeColumn,
      },
      {
        label: "Rearrange",
        icon: RearrangeIcon,
        action: () => console.log("Rearrange clicked"),
      },
      {
        label: "Select",
        icon: SelectIcon,
        action: selectSingleColumn,
      },
    ];
    return (
      <>
        <Box
          display="flex"
          flexDirection="row"
          alignItems="center"
          sx={{ gap: 0, ...sx }}
        >
          <Box
            backgroundColor="#ddd"
            borderRadius="25%"
            padding="1px 3px"
            height="25px"
            width="25px"
            display="flex"
            alignItems="center"
            justifyContent="center"
            marginRight={1}
          >
            <ColumnTypeIcon column={column} placement="top" />
          </Box>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="left"
            justifyContent="center"
            padding={1}
            overflow="hidden"
          >
            {isNull ? (
              <Typography color="error">NULL</Typography>
            ) : (
              <EditableText
                inputRef={headerInputRef}
                initialValue={column?.name}
                placeholder={`Column ${column?.index + 1}`}
                onChange={(newName) => renameColumn(newName)}
                isReadOnly={isReadOnly}
                isEditable={isEditable}
                onEditingStateChange={() => console.log("Editing state change")}
                fontSize="1rem"
              />
            )}
          </Box>
          <IconButton
            size="small"
            sx={{ p: 0, ml: "auto" }}
            onClick={(event) => {
              event.stopPropagation();
              setMenuAnchorEl(event.currentTarget);
            }}
          >
            <MoreVert />
          </IconButton>
        </Box>
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
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              onClick={() => {
                setMenuAnchorEl(null);
                item.action();
              }}
            >
              <ListItemIcon>
                <item.icon fontSize="small" />
              </ListItemIcon>
              <ListItemText>{item.label}</ListItemText>
            </MenuItem>
          ))}
        </Menu>
      </>
    );
  }
);

ColumnHeader.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    index: PropTypes.number.isRequired,
  }).isRequired,
  headerInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  isHeaderEditable: PropTypes.bool,
  isReadOnly: PropTypes.bool,
  renameColumn: PropTypes.func.isRequired,
};

export default ColumnHeader;
