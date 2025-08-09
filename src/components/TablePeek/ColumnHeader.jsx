import PropTypes from "prop-types";
import { useState, useRef } from "react";
import {
  IconButton,
  Popover,
  List,
  ListItemButton,
  Box,
  Typography,
  styled,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import withColumnData from "../HOC/withColumnData";

// Styled component for column header
const StyledColumnHeader = styled("th", {
  shouldForwardProp: (prop) =>
    !["isLoading", "isSelected", "isHovered", "isKey"].includes(prop),
})(({ isLoading, isSelected, isHovered, isKey }) => ({
  position: "relative",
  padding: "4px 8px !important",
  minWidth: "120px",
  whiteSpace: "nowrap",
  backgroundColor: isSelected ? "#e3f2fd" : isHovered ? "#f5f5f5" : "inherit",
  borderLeft: isKey ? "3px solid #1976d2" : "inherit",
  ...(isLoading && {
    fontStyle: "italic",
    color: "#999",
  }),
}));

function ColumnHeader({
  column,
  dragRef, // eslint-disable-line no-unused-vars
  dropRef, // eslint-disable-line no-unused-vars
  id, // eslint-disable-line no-unused-vars
  tableId, // eslint-disable-line no-unused-vars
  name,
  alias, // eslint-disable-line no-unused-vars
  index, // eslint-disable-line no-unused-vars
  columnType, // eslint-disable-line no-unused-vars
  values, // eslint-disable-line no-unused-vars
  isNull,
  // Interaction state props
  isSelected,
  isLoading,
  isHovered,
  isKey,
  isDragging, // eslint-disable-line no-unused-vars
  isOver, // eslint-disable-line no-unused-vars
  error, // eslint-disable-line no-unused-vars
  // Action handlers
  hoverColumn,
  unHoverColumn,
  renameColumn,
  unfocusColumn, // eslint-disable-line no-unused-vars
  dragColumn, // eslint-disable-line no-unused-vars
  unDragColumn, // eslint-disable-line no-unused-vars
  removeColumn,
  addColumnToSelection,
  selectSingleColumn,
  unselectColumn,
  spanSelectionToColumn, // eslint-disable-line no-unused-vars
  nullColumn, // eslint-disable-line no-unused-vars
}) {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isMenuIconVisible, setIsMenuIconVisible] = useState(false);
  const isMenuOpen = Boolean(menuAnchorEl);
  const headerRef = useRef(null);

  const menuItems = [
    // {
    //   label: "Sort Ascending",
    //   action: () => {
    //     // TODO: Implement sort ascending functionality
    //
    //     setMenuAnchorEl(null);
    //   },
    // },
    // {
    //   label: "Sort Descending",
    //   action: () => {
    //     // TODO: Implement sort descending functionality
    //
    //     setMenuAnchorEl(null);
    //   },
    // },
    // {
    //   label: "Filter",
    //   action: () => {
    //     // TODO: Implement filter functionality
    //
    //     setMenuAnchorEl(null);
    //   },
    // },
    // {
    //   label: isSelected ? "Remove from Selection" : "Add to Selection",
    //   action: () => {
    //     if (isSelected) {
    //       unselectColumn();
    //     } else {
    //       addColumnToSelection();
    //     }
    //     setMenuAnchorEl(null);
    //   },
    // },
    // {
    //   label: "Select Only This Column",
    //   action: () => {
    //     selectSingleColumn();
    //     setMenuAnchorEl(null);
    //   },
    // },
    {
      label: "Rename Column",
      action: () => {
        const newName = prompt("Enter new column name:", name || column?.name);
        if (newName && newName.trim() !== "") {
          renameColumn(newName);
        }
        setMenuAnchorEl(null);
      },
    },
    {
      label: "Remove Column",
      action: () => {
        if (
          true
          // confirm(
          //   `Are you sure you want to remove the column "${
          //     name || column?.name
          //   }"?`
          // )
        ) {
          removeColumn();
        }
        setMenuAnchorEl(null);
      },
    },
  ];

  if (isLoading || isNull || (!column && !name)) {
    return <StyledColumnHeader isLoading={true}>...</StyledColumnHeader>;
  }

  return (
    <StyledColumnHeader
      ref={headerRef}
      isLoading={isLoading}
      isSelected={isSelected}
      isHovered={isHovered}
      isKey={isKey}
      onMouseEnter={() => {
        setIsMenuIconVisible(true);
        // hoverColumn();
      }}
      onMouseLeave={() => {
        setIsMenuIconVisible(false);
        // unHoverColumn();
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "relative",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "medium" }}>
          {name || column?.name}
        </Typography>
        <IconButton
          size="small"
          sx={{
            opacity: isMenuIconVisible || isMenuOpen ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
            ml: 1,
          }}
          onClick={(event) => setMenuAnchorEl(event.currentTarget)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
      </Box>
      <Popover
        open={isMenuOpen}
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        onClose={() => setMenuAnchorEl(null)}
      >
        <List dense>
          {menuItems.map((item, index) => (
            <ListItemButton
              key={index}
              onClick={item.action}
              sx={{ px: 2, py: 1 }}
            >
              {item.label}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </StyledColumnHeader>
  );
}

ColumnHeader.propTypes = {
  column: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }),
  // Props from withColumnData HOC
  dragRef: PropTypes.func,
  dropRef: PropTypes.func,
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  tableId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  alias: PropTypes.string,
  index: PropTypes.number,
  columnType: PropTypes.string,
  values: PropTypes.array,
  isNull: PropTypes.bool,
  // Interaction state props
  isSelected: PropTypes.bool,
  isLoading: PropTypes.bool,
  isHovered: PropTypes.bool,
  isKey: PropTypes.bool,
  isDragging: PropTypes.bool,
  isOver: PropTypes.bool,
  error: PropTypes.any,
  // Action handlers
  hoverColumn: PropTypes.func,
  unHoverColumn: PropTypes.func,
  renameColumn: PropTypes.func,
  unfocusColumn: PropTypes.func,
  dragColumn: PropTypes.func,
  unDragColumn: PropTypes.func,
  removeColumn: PropTypes.func,
  addColumnToSelection: PropTypes.func,
  selectSingleColumn: PropTypes.func,
  unselectColumn: PropTypes.func,
  spanSelectionToColumn: PropTypes.func,
  nullColumn: PropTypes.func,
};

const EnhancedColumnHeader = withColumnData(ColumnHeader);

export default EnhancedColumnHeader;
