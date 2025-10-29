/* eslint-disable react/prop-types */
import { useState } from "react";
import { DragIndicator, CheckCircle, Warning } from "@mui/icons-material";
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
  Badge,
} from "@mui/material";
import HighlightText from "../ui/HighlightText";
import {
  formatNumber,
  formatBytes,
  formatDate,
} from "../../lib/utilities/formaters";
import withTableData from "./withTableData";
import { useSelector } from "react-redux";

function TableListItemSummary({
  table,
  activeColumnIds,
  parentOperation,
  isInSchema,
  // Props passed from withAssociatedAlerts via withTableData
  alertIds,
  hasAlerts,
  // Removed columns
  removedColumnIds = [],
  // Props passed directly from parent component
  isDisabled = false,
  isSelected = false,
  searchString,
  onHover,
  onUnhover,
  onContextMenu,
  // Menu actions
  peekTable,
  renameTable,
  dropTable,
  setTableSelection,
}) {
  const [contextMenu, setContextMenu] = useState(null);

  // TODO: should this be in the HOC?
  const selectedTableIds = useSelector((state) => state.tables.selected || []);

  const columnCount = activeColumnIds.length;
  // Helper functions for styling based on state
  const getBackgroundColor = () => {
    if (hasAlerts) {
      return isSelected ? "rgba(255, 152, 0, 0.2)" : "rgba(255, 152, 0, 0.08)";
    }
    if (isSelected && isInSchema) {
      return "rgba(76, 175, 80, 0.1)"; // Light green for both
    } else if (isSelected) {
      return "rgba(25, 118, 210, 0.08)"; // Light blue for selected only
    } else if (isInSchema) {
      return "rgba(76, 175, 80, 0.05)"; // Very light green for schema only
    }
    return "transparent";
  };

  const getHoverBackgroundColor = () => {
    if (hasAlerts) {
      return "rgba(255, 152, 0, 0.15)";
    }
    if (isInSchema) {
      return "rgba(76, 175, 80, 0.15)";
    } else if (isSelected) {
      return "rgba(25, 118, 210, 0.12)";
    }
    return "action.hover";
  };

  const getBorderColor = () => {
    if (hasAlerts) {
      return "warning.main";
    }
    if (isInSchema) {
      return "success.main";
    }
    return "transparent";
  };

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

    if (event.shiftKey) {
      // For List items, we need to traverse differently
      const listItem = event.currentTarget;
      const listContainer = listItem.closest(".list-layout"); // Find the list container

      if (!listContainer) {
        // Fallback to regular selection if we can't find the container
        setTableSelection([table.id]);
        return;
      }

      // Get all list items within the container
      const allListItems = Array.from(
        listContainer.querySelectorAll("[data-tableid]")
      );

      const ids = allListItems.map((item) => item.getAttribute("data-tableid"));
      const clickedIndex = ids.indexOf(String(table.id));

      // Find all selected items
      const selectedItems = allListItems.filter(
        (item) => item.getAttribute("data-isSelected") === "true"
      );
      const selectedIndices = selectedItems.map((item) =>
        ids.indexOf(item.getAttribute("data-tableid"))
      );

      let anchorIndex;
      if (selectedIndices.length > 0) {
        // Use the last selected item as the anchor
        anchorIndex = selectedIndices[selectedIndices.length - 1];
      } else {
        anchorIndex = clickedIndex;
      }

      const [start, end] = [
        Math.min(anchorIndex, clickedIndex),
        Math.max(anchorIndex, clickedIndex),
      ];

      const rangeIds = ids.slice(start, end + 1);
      setTableSelection(rangeIds);
    } else if (event.ctrlKey || event.metaKey) {
      // Ctrl/Cmd click for multi-selection toggle
      if (isSelected) {
        // If already selected, remove from selection
        const currentSelection = selectedTableIds.filter(
          (id) => String(id) !== String(table.id)
        );
        setTableSelection(currentSelection);
      } else {
        // If not selected, add to selection
        setTableSelection([...selectedTableIds, table.id]);
      }
    } else {
      // Regular click - toggle selection if already selected, otherwise select
      if (isSelected && selectedTableIds.length === 1) {
        // If this is the only selected item, deselect it
        setTableSelection([]);
      } else if (isSelected && selectedTableIds.length > 1) {
        // If multiple items are selected and this is one of them, select only this one
        setTableSelection([table.id]);
      } else {
        // If not selected, select it
        setTableSelection([table.id]);
      }
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
        selected={false} // Don't use Material-UI's selected state
        onClick={handleItemClick}
        onMouseEnter={onHover}
        onMouseLeave={onUnhover}
        onContextMenu={handleContextMenu}
        data-tableid={table.id}
        data-isSelected={isSelected}
        data-multiselected={
          selectedTableIds.includes(table.id) && selectedTableIds.length > 1
        }
        data-selection-count={selectedTableIds.length}
        sx={{
          cursor: "context-menu",
          userSelect: "none",
          // Background colors for different states
          backgroundColor: getBackgroundColor(),
          // Border for schema inclusion (green left border) or alerts (orange)
          borderLeft:
            hasAlerts || isInSchema ? "4px solid" : "1px solid transparent",
          borderColor: getBorderColor(),
          // Selection outline (blue outline)
          outline: isSelected ? "2px solid" : "none",
          outlineColor: isSelected ? "primary.main" : "transparent",
          outlineOffset: "-2px",
          "&:hover": {
            backgroundColor: getHoverBackgroundColor(),
          },
          opacity: isDisabled ? 0.5 : 1,
          borderRadius: 1,
          mb: 0.5,
          // Additional visual feedback
          boxShadow: isSelected
            ? 1
            : hasAlerts
            ? "0 1px 3px rgba(255, 152, 0, 0.3)"
            : 0,
          // Ensure proper border spacing
          marginLeft: hasAlerts || isInSchema ? 0 : "4px",
          transition: "all 0.2s ease-in-out",
        }}
      >
        {/* Drag Handle, Schema Indicator, and Checkbox */}
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
              sx={{
                p: 0,
                color: isSelected ? "primary.main" : "text.secondary",
                "&.Mui-checked": {
                  color: "primary.main",
                },
              }}
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
                sx={{
                  fontWeight: isSelected ? 600 : 500,
                  transition: "font-weight 0.2s ease-in-out",
                  ...(hasAlerts && {
                    color: "warning.dark",
                  }),
                }}
              >
                <HighlightText pattern={searchString} text={table.name} />
              </Typography>

              {/* Alert Badge */}
              {hasAlerts && (
                <Badge
                  badgeContent={alertIds.length}
                  color="warning"
                  sx={{ ml: 1 }}
                >
                  <Warning color="warning" fontSize="small" />
                </Badge>
              )}

              {/* Table Type Chip */}
              <Chip
                label={table.mimeType || "Table"}
                size="small"
                variant={isInSchema ? "filled" : "outlined"}
                color={isInSchema ? "success" : "default"}
                sx={{
                  fontSize: "0.7rem",
                  height: "20px",
                  color: isDisabled ? "text.disabled" : undefined,
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
        {/* Schema status indicator */}
        {isInSchema && (
          <CheckCircle
            sx={{
              color: "success.main",
              fontSize: "1rem",
              marginRight: "8px",
            }}
            titleAccess="Included in schema"
          />
        )}
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

const EnhancedTableListItemSummary = withTableData(TableListItemSummary);
export { EnhancedTableListItemSummary, TableListItemSummary };
