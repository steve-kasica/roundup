/**
 * @fileoverview ColumnHeader Component
 *
 * Renders a compact column header with sorting capabilities, type indicators, and
 * a context menu for column operations. This component is typically used in table
 * views where space is limited and only essential column information is displayed.
 *
 * Features:
 * - Sortable column header with visual sort direction indicator
 * - Column type icon
 * - Context menu for column operations (rename, delete, convert type, etc.)
 * - Visual states for hover, selection, dragging, focus, and errors
 * - Alert/warning indicators for data quality issues
 *
 * @module components/ColumnViews/ColumnHeader
 *
 * @example
 * <EnhancedColumnHeader
 *   id="column-123"
 *   isActive={true}
 *   sortDirection="asc"
 *   onSort={handleSort}
 * />
 */

/* eslint-disable react/prop-types */
import { IconButton, Menu, TableSortLabel } from "@mui/material";
// import EditableText from "../ui/EditableText";
import { useCallback, useState } from "react";
import { MoreVert } from "@mui/icons-material";
import { withColumnData, withAssociatedAlerts } from "../../HOC";
// import { EnhancedColumnName } from "./ColumnName";
// import { EnhancedColumnContextMenuItems } from "./ColumnContextMenuItems";
// import StyledColumnContainer from "./StyledColumnContainer";
import { ColumnTypeIcon } from "../../ColumnViews";
import { StyledColumnContainer } from "../../ColumnViews";

/**
 * ColumnHeader Component
 *
 * A compact header representation of a column with sorting and context menu functionality.
 *
 * @component
 * @param {Object} props - Component props (many provided via HOCs)
 * @param {string} props.id - Column identifier
 * @param {string} props.columnType - DuckDB data type of the column
 * @param {boolean} props.isHovered - Whether the column is currently hovered
 * @param {boolean} props.isDragging - Whether the column is being dragged
 * @param {boolean} props.isDropTarget - Whether the column can accept a drop
 * @param {boolean} props.isSelected - Whether the column is selected
 * @param {boolean} props.isOver - Whether a dragged item is over this column
 * @param {boolean} props.isLoading - Whether the column is loading
 * @param {boolean} props.isFocused - Whether the column has focus
 * @param {boolean} props.isDraggable - Whether the column can be dragged
 * @param {number} props.totalCount - Count of associated alerts
 * @param {boolean} props.isActive - Whether this column is the active sort column
 * @param {Function} props.onSort - Callback function for sort actions
 * @param {('asc'|'desc')} props.sortDirection - Current sort direction
 *
 * @returns {React.ReactElement} A sortable column header with context menu
 */
const ColumnHeader = ({
  // Props pass via withColumnData HOC
  id,
  name,
  databaseName,
  columnType,
  // Props passed directly from parent
  isActive,
  onSort,
  sortDirection,
}) => {
  const displayValue = name || databaseName || id;

  // Handle column sorting
  const handleSort = useCallback(
    (event) => {
      onSort(event, id);
    },
    [onSort, id],
  );

  return (
    <>
      <TableSortLabel
        active={isActive}
        direction={isActive ? sortDirection : "asc"}
        onClick={handleSort}
        sx={{
          cursor: "pointer",
          flex: 1,
          "& .MuiTableSortLabel-icon": {
            opacity: isActive ? 1 : 0, // icon completely when not sorting
          },
          "&:hover .MuiTableSortLabel-icon": {
            opacity: isActive ? 1 : 0.6, // Show faded icon on hover
          },
        }}
      >
        {displayValue}
        <ColumnTypeIcon columnType={columnType} sx={{ ml: 1 }} />
      </TableSortLabel>
    </>
  );
};

ColumnHeader.displayName = "ColumnHeader";

const EnhancedColumnHeader = withAssociatedAlerts(withColumnData(ColumnHeader));

EnhancedColumnHeader.displayName = "EnhancedColumnHeader";

export { EnhancedColumnHeader, ColumnHeader };
