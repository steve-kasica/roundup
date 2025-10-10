/* eslint-disable react/prop-types */
import { DragIndicator } from "@mui/icons-material";
import HighlightText from "../ui/HighlightText";
import { styled, Typography, Checkbox, Stack, Box } from "@mui/material";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Menu, MenuItem } from "@mui/material";
import { formatDate, formatNumber, formatBytes } from "../../lib/utilities";
import withTableData from "./withTableData";
import { useDrag } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export const TABLE_ROW_VIEW_CLASS = "TableRowSummary";

// Styled component for bar chart background in table cells
const BarChartCell = styled(Typography, {
  shouldForwardProp: (prop) => !["percentage", "isDisabled"].includes(prop),
})(({ percentage, isDisabled }) => ({
  position: "relative",
  backgroundImage: `linear-gradient(to right, ${
    isDisabled ? "rgba(0, 0, 0, 0.05)" : "rgba(25, 118, 210, 0.15)"
  } 0%, ${
    isDisabled ? "rgba(0, 0, 0, 0.05)" : "rgba(25, 118, 210, 0.15)"
  } ${percentage.toFixed(1)}%, transparent ${percentage.toFixed(1)}%)`,
  backgroundRepeat: "no-repeat",
  backgroundSize: "100% 100%",
  borderRight: "2px solid transparent",
  textWrap: "nowrap",
  borderTop: "2px solid transparent",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `linear-gradient(to right, ${
      isDisabled ? "rgba(0, 0, 0, 0.08)" : "rgba(25, 118, 210, 0.2)"
    } 0%, ${
      isDisabled ? "rgba(0, 0, 0, 0.08)" : "rgba(25, 118, 210, 0.2)"
    } ${percentage.toFixed(1)}%, transparent ${percentage.toFixed(1)}%)`,
    zIndex: -1,
    borderRadius: "2px",
  },
}));

// Styled table row component that handles all drag and drop states
const StyledTableRow = styled("tr", {
  shouldForwardProp: (prop) =>
    !["isDragging", "isDisabled", "isSelected", "isHovered"].includes(prop),
})(({ isDragging, isDisabled, isSelected, isHovered }) => {
  let styles = {
    transition: "all 0.15s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "context-menu",
    borderRadius: "6px",
    position: "relative",
    margin: "1px 0",
    userSelect: "none",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    // make drag handle visible when the whole row is hovered
    "&:hover .drag-icon": {
      opacity: 1,
      transition: "all 0.18s ease-in-out",
    },
  };

  // Base selected styles - blue theme for selection
  if (isSelected) {
    styles = {
      ...styles,
      backgroundColor: "rgba(25, 118, 210, 0.12)",
      boxShadow: "inset 3px 0 0 #1976d2, 0 1px 3px rgba(25, 118, 210, 0.15)",
    };
  }

  // Hover styles - subtle gray with shadow
  if (isHovered && !isDragging && !isSelected) {
    styles = {
      ...styles,
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
      transform: "translateY(-1px)",
    };
  }

  // Selected + Hovered - enhanced selected state
  if (isSelected && isHovered && !isDragging) {
    styles = {
      ...styles,
      backgroundColor: "rgba(25, 118, 210, 0.16)",
      boxShadow: "inset 3px 0 0 #1976d2, 0 2px 6px rgba(25, 118, 210, 0.2)",
      transform: "translateY(-1px)",
    };
  }

  // Dragging styles - orange theme with elevation
  if (isDragging) {
    styles = {
      ...styles,
      cursor: "grabbing",
      backgroundColor: "rgba(255, 152, 0, 0.15)",
      boxShadow: "inset 4px 0 0 #f57c00, 0 12px 24px rgba(255, 152, 0, 0.35)",
      zIndex: 1000,
      opacity: 0.95,
    };
  }

  // Disabled styles (highest priority) - maintains connection but muted
  if (isDisabled) {
    styles = {
      ...styles,
      opacity: 0.4,
      cursor: "not-allowed",
      backgroundColor: "rgba(0, 0, 0, 0.02)",
      transform: "none",
      boxShadow: "none",
    };
  }

  return styles;
});

function TableRowSummary({
  // props from withTableData
  table,
  removedColumnIds,
  columnCount,
  isHovered,
  parentOperation,
  // Props drilled down from withTableData
  rowMax,
  columnMax,
  bytesMax,
  // depth,
  // parentOperation,
  // functions to dispatch actions
  peekTable,
  hoverTable,
  unhoverTable,
  setTableSelection,
  renameTable,
  dropTable,
  isInSchema,
  isSelected,

  // props from parent component
  isDisabled = false,
  searchString,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  // TODO: Should this be in the HOC?
  const selectedTableIds = useSelector((state) => state.tables.selected || []);
  const selectedTables = useSelector((state) =>
    selectedTableIds.map((id) => state.tables.data[id]).filter(Boolean)
  );

  // Set up drag functionality for table rows
  const [{ isDragging }, dragRef, dragPreview] = useDrag({
    type: TABLE_ROW_VIEW_CLASS,
    item: () => {
      // If this table is selected and there are multiple selected tables,
      // drag all selected tables as a group
      const isCurrentTableSelected = selectedTableIds.includes(table.id);

      if (isCurrentTableSelected && selectedTableIds.length > 1) {
        const item = {
          id: selectedTableIds, // Array of IDs for multi-select
          tables: selectedTables, // Array of table objects
          count: selectedTables.length,
          type: "multiple-tables",
          primaryTable: table, // The table being dragged
        };
        return item;
      } else {
        // Single table drag
        const item = {
          id: table.id,
          name: table.name,
          type: "table",
          tables: [table], // Consistent array format
          count: 1,
        };
        return item;
      }
    },
    canDrag: () => !isDisabled,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();

      // Only process if we have a valid drop result and it was accepted
      // TODO: how does the new architecture handle drops with multiple tables?
      // if (dropResult && dropResult.accepted) {
      //   if (item.type === "multiple-tables") {
      //     // addSelectedTablesToSchema(dropResult.operationType);
      //   } else if (item.type === "table") {
      //     // addTableToSchema(dropResult.operationType);
      //   }
      // }
      // If no drop result or drop was rejected, the drag operation just ends
      // without any action - this prevents the freeze issue
    },
  });

  // Remove default drag preview
  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  const handleMenuOpen = (event) => {
    event.preventDefault(); // Prevent default context menu
    event.stopPropagation(); // Prevent row click from firing
    setAnchorEl({
      clientX: event.clientX,
      clientY: event.clientY,
    });
  };

  const handleMenuClose = (event) => {
    if (event) {
      event.stopPropagation(); // Prevent row click from firing
    }
    setAnchorEl(null);
  };

  const menuItems = [
    {
      label: "Rename table",
      isDisabled: false,
      onClick: (event) => {
        const newName = prompt("Enter new table name:", table.name);
        if (newName && newName.trim() !== "") {
          renameTable(newName);
        }
        handleMenuClose(event);
      },
    },
    {
      label: "Peek at table",
      isDisabled: false,
      onClick: (event) => {
        peekTable();
        handleMenuClose(event);
      },
    },
    {
      label: "Add to selection",
      isDisabled: isSelected || isDisabled || isInSchema,
      onClick: (event) => {
        setTableSelection();
        handleMenuClose(event);
      },
    },
    {
      label: `Remove from schema`,
      isDisabled: !isInSchema,
      onClick: (event) => {
        // TODO
        handleMenuClose(event);
      },
    },
    {
      label: "Delete table",
      isDisabled: false,
      onClick: (event) => {
        dropTable();
        handleMenuClose(event);
      },
    },
  ];

  return (
    <StyledTableRow
      isDragging={isDragging}
      isDisabled={isDisabled}
      isSelected={isSelected}
      isHovered={isHovered}
      data-tableid={table.id}
      data-selected={isSelected}
      data-multiselected={
        selectedTableIds.includes(table.id) && selectedTableIds.length > 1
      }
      data-selection-count={selectedTableIds.length}
      onMouseEnter={hoverTable}
      onMouseLeave={unhoverTable}
      onContextMenu={handleMenuOpen}
      onClick={(event) => {
        event.stopPropagation();

        if (event.shiftKey) {
          const tr = event.currentTarget;
          const rows = Array.from(tr.parentNode.children);
          const ids = rows.map((row) => row.getAttribute("data-tableid"));
          const clickedIndex = ids.indexOf(table.id);
          // Find all selected rows in DOM order
          const selectedRows = rows.filter(
            (row) => row.getAttribute("data-selected") === "true"
          );
          const selectedIndices = selectedRows.map((row) =>
            ids.indexOf(row.getAttribute("data-tableid"))
          );

          let anchorIndex;
          if (selectedIndices.length > 0) {
            // Use the last selected row as the anchor
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
              (id) => id !== table.id
            );
            setTableSelection(currentSelection);
          } else {
            // If not selected, add to selection
            setTableSelection([...selectedTableIds, table.id]);
          }
        } else {
          // Regular click - toggle selection if already selected, otherwise select
          if (isSelected && selectedTableIds.length === 1) {
            // If this is the only selected row, deselect it
            setTableSelection([]);
          } else if (isSelected && selectedTableIds.length > 1) {
            // If multiple rows are selected and this is one of them, select only this one
            setTableSelection(table.id);
          } else {
            // If not selected, select it
            setTableSelection(table.id);
          }
        }
      }}
    >
      <Typography component="td" color={isDisabled ? "textDisabled" : "normal"}>
        <Stack direction="row" alignItems="center" gap="1px">
          <Box
            ref={dragRef}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "grab",
              "&:hover .drag-icon": {
                color: "#ff9800",
                transform: "scale(1.1)",
                filter: "drop-shadow(0 2px 4px rgba(255, 152, 0, 0.3))",
              },
              "&:active .drag-icon": {
                cursor: "grabbing",
                transform: "scale(0.95)",
                color: "#f57c00",
              },
            }}
          >
            <DragIndicator
              className="drag-icon"
              sx={{
                color: "text.secondary",
                opacity: 0.1,
                transition: "all 0.2s ease-in-out",
              }}
            />
          </Box>
          <Checkbox
            checked={isSelected}
            disabled
            size="small"
            sx={{ padding: 0 }}
          />
        </Stack>
      </Typography>
      <Typography
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
      >
        <HighlightText pattern={searchString} text={table.name} />
      </Typography>
      <Typography
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
      >
        {table.mimeType || "N/A"}
      </Typography>
      <Typography
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
      >
        {parentOperation?.name || "N/A"}
      </Typography>
      <BarChartCell
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
        percentage={(table.size / bytesMax) * 100}
        isDisabled={isDisabled}
      >
        {formatBytes(table.size)}
      </BarChartCell>
      <BarChartCell
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
        percentage={(table.rowCount / rowMax) * 100}
        isDisabled={isDisabled}
      >
        {formatNumber(table.rowCount)}
      </BarChartCell>
      <BarChartCell
        component="td"
        sx={{ fontSize: "13px", padding: "0 4px" }}
        color={isDisabled ? "textDisabled" : "normal"}
        percentage={(columnCount / columnMax) * 100}
        isDisabled={isDisabled}
      >
        {`${formatNumber(table.columnIds.length)}`}
        <sup
          style={{ display: removedColumnIds.length > 0 ? "inline" : "none" }}
        >
          *
        </sup>
      </BarChartCell>
      <Typography
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
      >
        {formatDate(new Date(table.dateLastModified))}
      </Typography>
      <td className="more-options">
        <Menu
          anchorEl={null}
          open={open}
          onClose={handleMenuClose}
          anchorReference="anchorPosition"
          anchorPosition={
            anchorEl !== null
              ? { top: anchorEl.clientY, left: anchorEl.clientX }
              : undefined
          }
        >
          {menuItems.map((item) => (
            <MenuItem
              key={item.label}
              disabled={item.isDisabled}
              onClick={item.onClick}
            >
              {item.label}
            </MenuItem>
          ))}
        </Menu>
      </td>
    </StyledTableRow>
  );
}

const EnhancedTableRowSummary = withTableData(TableRowSummary);
export { EnhancedTableRowSummary, TableRowSummary };
