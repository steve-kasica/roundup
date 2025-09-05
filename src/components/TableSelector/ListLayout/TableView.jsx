import { useState, useMemo } from "react";
import { DragIndicator } from "@mui/icons-material";
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Chip,
  Stack,
  Menu,
  MenuItem,
  Checkbox,
} from "@mui/material";
import HighlightText from "../../ui/HighlightText";
import {
  formatNumber,
  formatBytes,
  formatDate,
} from "../../../lib/utilities/formaters";
import withTableData from "../../HOC/withTableData";
import PropTypes from "prop-types";

function TableView({
  table,
  activeColumnIds,
  removedColumnIds = [],
  parentOperation,
  isDisabled = false,
  isSelected = false,
  isHovered = false,
  searchString,
  onSelect,
  onHover,
  onUnhover,
  onContextMenu,
  // Menu actions
  peekTable,
  removeTableFromSchema,
  renameTable,
  dropTable,
  addTableToSchema,
  isInSchema = false,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  const columnCount = useMemo(() => {
    return activeColumnIds.length - removedColumnIds.length;
  }, [activeColumnIds.length, removedColumnIds.length]);

  const handleContextMenu = (event) => {
    event.preventDefault();
    event.stopPropagation();

    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null
    );

    // Call the parent's onContextMenu if provided
    if (onContextMenu) {
      onContextMenu(event);
    }
  };

  const handleContextMenuClose = () => {
    setContextMenu(null);
  };

  const handleItemClick = (event) => {
    event.stopPropagation();
    if (onSelect) {
      onSelect(event);
    }
  };

  const menuItems = [
    {
      label: "Peek Table",
      onClick: () => {
        peekTable?.(table);
        handleContextMenuClose();
      },
      isDisabled: false,
    },
    {
      label: "Rename Table",
      onClick: () => {
        renameTable?.(table);
        handleContextMenuClose();
      },
      isDisabled: false,
    },
    {
      label: isInSchema ? "Remove from Schema" : "Add to Schema",
      onClick: () => {
        if (isInSchema) {
          removeTableFromSchema?.(table.id);
        } else {
          addTableToSchema?.(table);
        }
        handleContextMenuClose();
      },
      isDisabled: false,
    },
    {
      label: "Drop Table",
      onClick: () => {
        dropTable?.(table.id);
        handleContextMenuClose();
      },
      isDisabled: false,
    },
  ];

  return (
    <>
      <ListItem
        disablePadding
        selected={isSelected}
        onClick={handleItemClick}
        onMouseEnter={onHover}
        onMouseLeave={onUnhover}
        onContextMenu={handleContextMenu}
        sx={{
          cursor: "context-menu",
          backgroundColor: isSelected ? "action.selected" : "transparent",
          "&:hover": {
            backgroundColor: "action.hover",
          },
          opacity: isDisabled ? 0.5 : 1,
          borderRadius: 1,
          mb: 0.5,
          border: isHovered ? "1px solid" : "1px solid transparent",
          borderColor: isHovered ? "primary.main" : "transparent",
        }}
      >
        {/* Drag Handle and Checkbox */}
        <ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <DragIndicator
              sx={{
                color: "text.secondary",
                fontSize: "1rem",
                cursor: "grab",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            />
            <Checkbox
              checked={isSelected}
              size="small"
              sx={{ p: 0 }}
              onClick={(e) => e.stopPropagation()}
              disabled
            />
          </Stack>
        </ListItemIcon>

        {/* Main Content */}
        <ListItemText
          primary={
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}
            >
              <Typography
                variant="body2"
                color={isDisabled ? "text.disabled" : "text.primary"}
                sx={{ fontWeight: 500 }}
              >
                <HighlightText pattern={searchString} text={table.name} />
              </Typography>

              {/* Table Type Chip */}
              <Chip
                label={table.mimeType || "Table"}
                size="small"
                variant="outlined"
                sx={{
                  fontSize: "0.7rem",
                  height: "20px",
                  color: isDisabled ? "text.disabled" : "text.secondary",
                }}
              />
            </Box>
          }
          secondary={
            <Stack spacing={0.5}>
              {/* Dimensions and Size */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Typography
                  variant="caption"
                  color={isDisabled ? "text.disabled" : "text.secondary"}
                >
                  <strong>{formatNumber(table.rowCount)}</strong> rows ×{" "}
                  <strong>{formatNumber(columnCount)}</strong> cols
                  {removedColumnIds.length > 0 && (
                    <span style={{ color: "orange" }}>*</span>
                  )}
                </Typography>

                <Typography
                  variant="caption"
                  color={isDisabled ? "text.disabled" : "text.secondary"}
                >
                  {formatBytes(table.size)}
                </Typography>
              </Box>

              {/* Parent Operation and Date */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                {parentOperation && (
                  <Typography
                    variant="caption"
                    color={isDisabled ? "text.disabled" : "text.secondary"}
                  >
                    Source: {parentOperation.name}
                  </Typography>
                )}

                <Typography
                  variant="caption"
                  color={isDisabled ? "text.disabled" : "text.secondary"}
                >
                  Modified: {formatDate(new Date(table.dateLastModified))}
                </Typography>
              </Box>
            </Stack>
          }
        />
      </ListItem>

      {/* Right-click Context Menu */}
      <Menu
        open={contextMenu !== null}
        onClose={handleContextMenuClose}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
        slotProps={{
          paper: {
            sx: {
              boxShadow: 3,
            },
          },
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.label}
            disabled={item.isDisabled || isDisabled}
            onClick={item.onClick}
          >
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

TableView.propTypes = {
  table: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
    size: PropTypes.number.isRequired,
    mimeType: PropTypes.string,
    dateLastModified: PropTypes.string.isRequired,
    columnIds: PropTypes.array.isRequired,
  }).isRequired,
  activeColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  removedColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  parentOperation: PropTypes.shape({
    name: PropTypes.string,
  }),
  // Selection and interaction props
  isDisabled: PropTypes.bool,
  isSelected: PropTypes.bool,
  isHovered: PropTypes.bool,
  isInSchema: PropTypes.bool,
  searchString: PropTypes.string,
  // Event handlers
  onSelect: PropTypes.func,
  onHover: PropTypes.func,
  onUnhover: PropTypes.func,
  onContextMenu: PropTypes.func,
  // Action handlers
  peekTable: PropTypes.func,
  removeTableFromSchema: PropTypes.func,
  renameTable: PropTypes.func,
  dropTable: PropTypes.func,
  addTableToSchema: PropTypes.func,
};

const EnhancedTableView = withTableData(TableView);
export default EnhancedTableView;
