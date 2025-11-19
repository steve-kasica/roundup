import { DragIndicator, Warning } from "@mui/icons-material";
import HighlightText from "../ui/HighlightText";
import { Typography, Checkbox, Stack, Box, Badge } from "@mui/material";
import { memo, useState } from "react";
import { Menu, MenuItem } from "@mui/material";
import { formatDate, formatNumber, formatBytes } from "../../lib/utilities";
import withTableData from "./withTableData";
import StyledTableRow from "./StyledTableRow";
import BarChartCell from "./BarChartCell";

export const TABLE_ROW_VIEW_CLASS = "TableRowSummary";

const TableRowSummary = ({
  // props from withTableData
  // Props from withAssociatedAlerts via withTableData
  alertIds,
  hasAlerts,

  id,
  name,
  mimeType,
  size,
  dateLastModified,
  rowCount,
  columnCount,
  removedColumnCount,
  isInSchema,

  setTableName,

  hoverTable,
  unhoverTable,
  dropTable,
  focusTable,
  isDisabled = false,

  // props passed from TableLayout.jsx
  onTrClick,
  searchString,
  rowMax,
  columnMax,
  bytesMax,
  isSelected,

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

  console.log({ columnCount, columnMax });

  return (
    <StyledTableRow
      isDragging={false} // TODO
      isDisabled={isDisabled}
      isSelected={isSelected}
      isHovered={false} // TODO: Implement hover state if needed
      hasAlerts={hasAlerts}
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
          isDisabled ? "textDisabled" : hasAlerts ? "warning.dark" : "normal"
        }
        data-column="name"
      >
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <HighlightText pattern={searchString} text={name} />
          {hasAlerts && (
            <Badge
              badgeContent={alertIds.length}
              color="warning"
              sx={{ ml: 0.5 }}
            >
              <Warning color="warning" fontSize="small" />
            </Badge>
          )}
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
        <sup style={{ display: removedColumnCount > 0 ? "inline" : "none" }}>
          *
        </sup>
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

const EnhancedTableRowSummary = memo(
  withTableData(TableRowSummary),
  (prevProps, nextProps) => {
    // Return true if props are equal (should NOT re-render)
    // Only compare props that TableRowSummary actually uses
    return true;
    return (
      prevProps.id === nextProps.id &&
      prevProps.name === nextProps.name &&
      prevProps.mimeType === nextProps.mimeType &&
      prevProps.size === nextProps.size &&
      prevProps.dateLastModified === nextProps.dateLastModified &&
      prevProps.rowCount === nextProps.rowCount &&
      prevProps.columnCount === nextProps.columnCount &&
      prevProps.removedColumnCount === nextProps.removedColumnCount &&
      prevProps.isInSchema === nextProps.isInSchema &&
      prevProps.isDisabled === nextProps.isDisabled &&
      prevProps.searchString === nextProps.searchString &&
      prevProps.rowMax === nextProps.rowMax &&
      prevProps.columnMax === nextProps.columnMax &&
      prevProps.bytesMax === nextProps.bytesMax &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.hasAlerts === nextProps.hasAlerts &&
      prevProps.alertIds === nextProps.alertIds
    );
  }
);
export { EnhancedTableRowSummary, TableRowSummary };
