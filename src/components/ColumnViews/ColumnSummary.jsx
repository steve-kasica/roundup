/**
 * @fileoverview ColumnSummary Component
 *
 * Provides a compact, card-based summary view of a column displaying key statistics,
 * top values, and visual indicators for data quality. This component is designed for
 * grid or list views where multiple columns need to be shown simultaneously.
 *
 * Features:
 * - Visual data quality indicators (completeness, uniqueness)
 * - Top value frequency bars
 * - Context menu for column operations
 * - Multiple interactive states (hover, drag, select, focus)
 * - Alert/error highlighting
 * - Drag-and-drop support
 *
 * @module components/ColumnViews/ColumnSummary
 *
 * @example
 * <EnhancedColumnSummary
 *   id="column-123"
 *   onClick={handleClick}
 *   onDoubleClick={handleDoubleClick}
 *   isDraggable={true}
 * />
 */

/* eslint-disable react/prop-types */
import { withColumnData, withAssociatedAlerts } from "../HOC";
import { Box, Typography, Menu, Chip } from "@mui/material";
import ColumnTypeIcon from "./ColumnTypeIcon";
import StyledColumnContainer from "./StyledColumnContainer";
import { ColumnContextMenuButton } from "../ui/buttons";
import { useCallback, useState } from "react";
import { EnhancedColumnContextMenuItems } from "./ColumnContextMenuItems";

/**
 * ColumnSummary Component
 *
 * A compact card displaying column statistics, top values, and interactive controls.
 *
 * @component
 * @param {Object} props - Component props (many provided via HOCs)
 * @param {Array} props.topValues - Array of most frequent values with counts
 * @param {string} props.name - Display name of the column
 * @param {string} props.databaseName - Internal database name
 * @param {string} props.columnType - DuckDB data type
 * @param {string} props.id - Column identifier
 * @param {number} props.nullCount - Number of null values
 * @param {number} props.approxUnique - Approximate count of unique values
 * @param {number} props.nonNullCount - Count of non-null values
 * @param {Function} props.hoverColumn - Hover enter handler from HOC
 * @param {Function} props.unhoverColumn - Hover leave handler from HOC
 * @param {Function} props.onClick - Click handler
 * @param {Function} props.onDoubleClick - Double-click handler
 * @param {boolean} props.isSelected - Selection state
 * @param {boolean} props.isDragging - Drag state
 * @param {boolean} props.isOver - Drop hover state
 * @param {boolean} props.isDropTarget - Can accept drops
 * @param {boolean} [props.isDraggable=false] - Can be dragged
 * @param {boolean} [props.isError=false] - Has errors
 * @param {boolean} props.isFocused - Has focus
 * @param {boolean} props.isHovered - Is hovered
 * @param {React.Ref} props.dragDropRef - Ref for drag-drop functionality
 * @param {Function} props.handleInsertColumnLeft - Insert left handler
 * @param {Function} props.handleInsertColumnRight - Insert right handler
 * @param {Array} props.alertIds - Associated alert IDs
 * @param {number} props.totalCount - Total alert count
 * @param {Function} props.onContextMenu - Context menu handler
 * @param {Function} [props.onHideColumn] - Hide column handler
 * @param {Object} [props.sx={}] - Additional styling
 *
 * @returns {React.ReactElement} A styled card with column summary information
 */
const ColumnSummary = ({
  topValues,
  operationIndex,
  name,
  databaseName,
  columnType,
  id,
  nullCount,
  approxUnique,
  nonNullCount,
  hoverColumn,
  unhoverColumn,
  onClick,
  onDoubleClick,
  isSelected,
  isDragging,
  isOver,
  canDropHere: isDropTarget,
  isDraggable = false,
  isError = false,
  isFocused,
  isHovered,
  dragDropRef = null,
  handleInsertColumnLeft,
  handleInsertColumnRight,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  alertIds,
  totalCount,
  // Props passed directly from parent
  onContextMenu,
  onHideColumn = () => {},
  sx = {},
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMenuOpen = useCallback((event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuAnchorEl(null);
  }, []);
  return (
    <StyledColumnContainer
      data-column-id={id}
      ref={dragDropRef}
      isHovered={isHovered}
      isDragging={isDragging}
      isOver={isOver}
      isDropTarget={isDropTarget}
      isSelected={isSelected}
      isDraggable={isDraggable}
      isFocused={isFocused}
      isError={isError || totalCount}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      // TODO: why does this cause a re-render when it's not used?
      onMouseEnter={hoverColumn}
      onMouseLeave={unhoverColumn}
      operationIndex={operationIndex}
      sx={{
        cursor: isSelected ? "grab" : "pointer",
        boxShadow: 0,
        height: "100%",
        ...(totalCount && {
          borderColor: "warning.main",
          borderWidth: 2,
          backgroundColor: "warning.light",
          opacity: 0.95,
        }),
        ...sx,
      }}
    >
      <Box
        sx={{
          flex: "1 1 0",
          overflow: "hidden",
          containerType: "size",
          display: "flex",
          justifyContent: "space-evenly",
          flexDirection: "column",
          width: "100%",
        }}
      >
        {/* Header - Always visible */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            userSelect: "none",
            //   mb: 1,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 0.5,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
              }}
            >
              {name || databaseName || id}
            </Typography>
            <ColumnTypeIcon columnType={columnType} />
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <ColumnContextMenuButton
              size="small"
              onClick={handleMenuOpen}
              sx={{
                height: "30px",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            />
          </Box>
        </Box>

        <Box
          sx={{
            "@container (min-height: 50px)": {
              display: "block",
            },
            "@container (max-height: 49px)": {
              display: "none",
            },
          }}
        >
          <Typography variant="data-small" component="div">
            {/* TODO: should I use Chips instead of comma b/c values may include commas */}
            {topValues ? topValues.map(({ value }) => value).join(", ") : ""}
            {(topValues && topValues.length) || 0 > 10 ? ", ..." : ""}
          </Typography>
        </Box>
        <Box
          sx={{
            "@container (min-height: 75px)": {
              display: "block",
            },
            "@container (max-height: 74px)": {
              display: "none",
            },
          }}
        >
          <Chip
            label={`${nullCount || 0} nulls`}
            size="small"
            color={nullCount && nullCount > 0 ? "error" : "default"}
            sx={{ marginTop: 0.5, fontSize: "0.6rem" }}
          />
          <Chip
            label={`${approxUnique || 0} uniq.`}
            size="small"
            color={approxUnique && approxUnique < 2 ? "error" : "default"}
            sx={{ marginTop: 0.5, fontSize: "0.6rem" }}
          />
        </Box>
      </Box>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <EnhancedColumnContextMenuItems
          id={id}
          handleCloseMenu={handleMenuClose}
          onInsertColumnLeftClick={handleInsertColumnLeft}
          onInsertColumnRightClick={handleInsertColumnRight}
          onHideColumn={onHideColumn}
        />
      </Menu>
    </StyledColumnContainer>
  );
};

ColumnSummary.displayName = "Column Summary";

const EnhancedColumnSummary = withAssociatedAlerts(
  withColumnData(ColumnSummary)
);

EnhancedColumnSummary.displayName = "Enhanced Column Summary";

export { EnhancedColumnSummary, ColumnSummary };
