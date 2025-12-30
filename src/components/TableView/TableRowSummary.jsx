/**
 * @fileoverview TableRowSummary Component
 *
 * A comprehensive table row component for displaying table summary information in a
 * tabular format. Includes selection checkboxes, drag indicators, context menus,
 * and bar chart visualizations for table statistics.
 *
 * Features:
 * - Checkbox selection
 * - Drag-and-drop indicators
 * - Context menu for actions
 * - Text highlighting for search
 * - Bar chart cells for visual statistics
 * - Date, number, and byte formatting
 * - Integration with table and alert data
 *
 * @module components/TableView/TableRowSummary
 *
 * @example
 * <EnhancedTableRowSummary
 *   id={tableId}
 *   isSelected={true}
 *   handleClick={handleRowClick}
 *   searchString="sales"
 * />
 */

import { DragIndicator } from "@mui/icons-material";
import HighlightText from "../ui/HighlightText";
import { Typography, Checkbox, Stack, Box } from "@mui/material";
import { useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { formatDate, formatNumber, formatBytes } from "../../lib/utilities";
import { withTableData, withAssociatedAlerts } from "../HOC";
import StyledTableRow from "./StyledTableRow";
import BarChartCell from "./BarChartCell";

export const TABLE_ROW_VIEW_CLASS = "TableRowSummary";

const TableRowSummary = ({
  // Props from withAssociatedAlerts
  totalCount,

  // props from withTableData
  id,
  name,
  mimeType,
  size,
  dateLastModified,
  rowCount,
  columnCount,
  isInSchema,

  setTableName,

  hoverTable,
  unhoverTable,
  dropTable,
  focusTable,
  isDisabled = false, // TODO: remove this, I don't think it's being set anywhere above

  // props passed from TableLayout.jsx
  onTrClick,
  searchString,
  rowMax,
  columnMax,
  bytesMax,
  isSelected,
  hasNameMatch, // does the table name match the search string?

  // Props from TableDragContainer
  dragDropRef,
}) => {
  if (import.meta.env.VITE_DEBUG_RENDER === "true") {
    console.debug("Rendering TableRowSummary for table:", id);
  }
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

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
        const newName = prompt("Enter new table name:", name);
        if (newName && newName.trim() !== "") {
          setTableName(newName);
        }
        handleMenuClose(event);
      },
    },
    {
      label: "Add to selection",
      isDisabled: isSelected || isDisabled || isInSchema,
      onClick: (event) => {
        console.log("Adding to selection (TODO)");
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
      isDragging={false} // TODO
      isDisabled={isDisabled || (searchString.length > 0 && !hasNameMatch)}
      isSelected={isSelected}
      isHovered={false} // TODO: Implement hover state if needed
      totalCount={totalCount}
      hasNameMatch={hasNameMatch}
      data-tableid={id}
      data-selected={isSelected}
      onMouseEnter={hoverTable}
      onMouseLeave={unhoverTable}
      // onContextMenu={handleMenuOpen}
      onClick={onTrClick}
      onDoubleClick={focusTable}
    >
      <Typography
        component="td"
        color={isDisabled ? "textDisabled" : "normal"}
        data-column="checkbox"
      >
        <Stack direction="row" alignItems="center" gap="1px">
          <Box
            ref={dragDropRef}
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
            checked={isInSchema}
            size="small"
            disabled
            sx={{
              padding: 0,
              pointerEvents: "none",
            }}
          />
        </Stack>
      </Typography>
      <Typography
        component="td"
        sx={{ fontSize: "13px" }}
        color={
          isDisabled ? "textDisabled" : totalCount ? "warning.dark" : "normal"
        }
        data-column="name"
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <HighlightText
            pattern={searchString}
            text={name}
            matchSx={{
              backgroundColor: "yellow",
            }}
          />
          {/* TODO signal errors on table */}
          {/* {totalCount && (
            <Badge
              badgeContent={alertIds.length}
              color="warning"
              sx={{ ml: 0.5 }}
            >
              <Warning color="warning" fontSize="small" />
            </Badge>
          )} */}
        </Stack>
      </Typography>
      <Typography
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
        data-column="mimeType"
      >
        {mimeType || "N/A"}
      </Typography>
      <BarChartCell
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
        percentage={(size / bytesMax) * 100}
        isDisabled={isDisabled}
        data-column="size"
      >
        {formatBytes(size)}
      </BarChartCell>
      <BarChartCell
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
        percentage={(rowCount / rowMax) * 100}
        isDisabled={isDisabled}
        data-column="rowCount"
      >
        {formatNumber(rowCount)}
      </BarChartCell>
      <BarChartCell
        component="td"
        sx={{ fontSize: "13px", padding: "0 4px" }}
        color={isDisabled ? "textDisabled" : "normal"}
        percentage={(columnCount / columnMax) * 100}
        isDisabled={isDisabled}
        data-column="columnCount"
      >
        {`${formatNumber(columnCount)}`}
      </BarChartCell>
      <Typography
        component="td"
        sx={{ fontSize: "13px" }}
        color={isDisabled ? "textDisabled" : "normal"}
        data-column="dateLastModified"
      >
        {formatDate(new Date(dateLastModified))}
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
};

const EnhancedTableRowSummary = withAssociatedAlerts(
  withTableData(TableRowSummary)
);
export { EnhancedTableRowSummary, TableRowSummary };
