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
 * - Graphically delimits column values in *chips* for readability, since we can't
 *   assume that a delimiting character will be present in the data itself.
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
import { Box, Typography, Menu, Chip, Tooltip, Divider } from "@mui/material";
import ColumnTypeIcon from "./ColumnTypeIcon";
import StyledColumnContainer from "./StyledColumnContainer";
import { ColumnContextMenuButton } from "../ui/buttons";
import { useCallback, useState } from "react";
import { EnhancedColumnContextMenuItems } from "./ColumnContextMenuItems/ColumnContextMenuItems";
import { IntegerNumber } from "../ui/text";

const breakpoints = {
  small: 55,
  medium: 120,
  large: 220,
};

/** Approximate pixel width per character at the bar label font size (0.65rem). */
const PIXELS_PER_CHAR = 7;
/** Extra horizontal padding (in pixels) added to the minimum bar width. */
const BAR_LABEL_PADDING = 10;

/**
 * Returns the operation color for the given index, falling back to the
 * orphaned-table background color defined in the theme.
 */
const getOperationColor = (theme, operationIndex) =>
  theme.palette.operationColors[operationIndex] ||
  theme.palette.orphanedTableBackgroundColor;

/**
 * Returns the contrast text color for the operation color.
 */
const getOperationContrastColor = (theme, operationIndex) =>
  theme.palette.getContrastText(getOperationColor(theme, operationIndex));

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
  completePercentage,
  approxUnique,
  uniquePercentage,
  hoverColumn,
  unhoverColumn,
  onClick,
  onDoubleClick,
  isSelected,
  isDragging,
  isOver,
  isDropTarget,
  isDraggable = false,
  isError = false,
  isFocused,
  isHovered,
  dragDropRef = null,
  handleInsertColumnLeft,
  handleInsertColumnRight,
  // Props pased from `withAssociatedAlerts` via `withColumnData` HOC
  totalCount,
  // Props passed directly from parent
  onContextMenu,
  onHideColumn = () => {},
  sx = {},
  elevation = 1,
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
          justifyContent: "space-between",
          flexDirection: "column",
          padding: 0.5,
        }}
      >
        {/* Header - Always visible */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            userSelect: "none",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              gap: 0.25,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <Tooltip title={name || databaseName || id} placement="top">
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 0.5,
                  minWidth: 0,
                  overflow: "hidden",
                }}
              >
                <Typography
                  variant="data-primary"
                  sx={{
                    whiteSpace: "nowrap",
                    fontWeight: "bold",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    minWidth: 0,
                  }}
                >
                  {name || databaseName || id}
                </Typography>
                <Typography
                  component={"small"}
                  variant="data-secondary"
                  sx={{
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    fontWeight: "100",
                  }}
                >
                  <IntegerNumber value={approxUnique} />
                </Typography>
              </Box>
            </Tooltip>
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
                color: "inherit",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.2s",
              }}
            />
          </Box>
        </Box>
        <ColumnTypeIcon columnType={columnType} />
        <Divider sx={{ my: 0.5 }} />
        <Box
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            maskImage:
              "linear-gradient(to bottom, black 95%, transparent 100%)",
            WebkitMaskImage:
              "linear-gradient(to bottom, black 95%, transparent 100%)",
          }}
        >
          <Box
            className="top-values-chips"
            sx={{
              opacity: 0,
              maxHeight: 0,
              overflow: "hidden",
              transition: "opacity 0.3s ease, max-height 0.3s ease",
              [`@container (min-height: ${breakpoints.small}px)`]: {
                opacity: 1,
                maxHeight: "500px",
              },
              [`@container (min-height: ${breakpoints.large}px)`]: {
                opacity: 0,
                maxHeight: 0,
              },
              display: "flex",
              flexWrap: "wrap",
              gap: "2px",
            }}
          >
            {topValues?.map(({ value }) => (
              <Chip
                key={value}
                label={`${value}`}
                title={`${value}`}
                size="small"
                sx={{
                  backgroundColor: (theme) =>
                    getOperationColor(theme, operationIndex),
                  color: (theme) =>
                    getOperationContrastColor(theme, operationIndex),
                  fontSize: "0.75rem",
                  borderRadius: "4px",
                  height: "16px",
                  "& .MuiChip-label": { padding: "0 4px" },
                }}
              />
            ))}
          </Box>
          <Box
            className="top-values-bars"
            sx={{
              mt: 0.5,
              opacity: 0,
              maxHeight: 0,
              overflow: "hidden",
              transition: "opacity 0.3s ease, max-height 0.3s ease",
              [`@container (min-height: ${breakpoints.large}px)`]: {
                opacity: 1,
                maxHeight: "500px",
              },
            }}
          >
            {(() => {
              const maxCount =
                topValues?.reduce((max, tv) => Math.max(max, tv.count), 0) || 1;
              return topValues?.map(({ value, count }) => {
                const pct = (count / maxCount) * 100;
                const minBarWidth = `${String(value).length * PIXELS_PER_CHAR + BAR_LABEL_PADDING}px`;
                return (
                  <Box
                    key={value}
                    sx={{
                      position: "relative",
                      mb: "2px",
                      height: 18,
                      width: "100%",
                      borderRadius: "2px",
                      overflow: "hidden",
                    }}
                  >
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: `max(${pct}%, ${minBarWidth})`,
                        height: "100%",
                        backgroundColor: (theme) =>
                          getOperationColor(theme, operationIndex),
                        borderRadius: "2px",
                        opacity: 0.7,
                        transition: "width 0.3s ease",
                      }}
                    />
                    <Box
                      component="span"
                      sx={{
                        position: "absolute",
                        top: "50%",
                        left: "2px",
                        transform: "translateY(-50%)",
                        maxWidth: `max(calc(${pct}% - 6px), calc(${minBarWidth} - 6px))`,
                        fontSize: "0.65rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        lineHeight: 1,
                        px: "1px",
                        py: "1px",
                        zIndex: 1,
                        borderRadius: "3px",
                        color: (theme) =>
                          getOperationContrastColor(theme, operationIndex),
                        fontFamily: "inherit",
                        fontWeight: "800",
                      }}
                      title={`${value}`}
                    >
                      {value}
                    </Box>
                    <Typography
                      variant="data-primary"
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: `max(${pct}%, ${minBarWidth})`,
                        height: "100%",
                        fontSize: "0.65rem",
                        whiteSpace: "nowrap",
                        lineHeight: "18px",
                        zIndex: 1,
                        color: (theme) =>
                          getOperationContrastColor(theme, operationIndex),
                        transform: "translateX(-100%)",
                        pr: "3px",
                        ...(pct < 30 && {
                          transform: "none",
                          pl: "3px",
                          pr: 0,
                          color: "text.primary",
                        }),
                      }}
                    >
                      {count}
                    </Typography>
                  </Box>
                );
              });
            })()}
          </Box>
        </Box>
      </Box>
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        aria-label="Column context menu"
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
  withColumnData(ColumnSummary),
);

EnhancedColumnSummary.displayName = "Enhanced Column Summary";

export { EnhancedColumnSummary, ColumnSummary };
