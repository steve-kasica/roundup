/* eslint-disable react/prop-types */
import { withColumnData, withAssociatedAlerts } from "../HOC";
import { Box, Typography, Tooltip, Menu, Chip } from "@mui/material";
import { Info } from "@mui/icons-material";
import SingleBar from "../visualization/SingleBar";
import { scaleLinear } from "d3";
import ColumnTypeIcon from "./ColumnTypeIcon";
import StyledColumnCard from "./StyledColumnCard";
import { ColumnContextMenuButton } from "../ui/buttons";
import { useCallback, useState } from "react";
import { EnhancedColumnContextMenuItems } from "./ColumnContextMenuItems";

const ColumnSummary = ({
  topValues,
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
    <StyledColumnCard
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
          <Typography
            variant="caption"
            component="div"
            sx={{
              fontSize: "0.7rem",
              fontStyle: "italic",
              fontWeight: 300,
              overflow: "hidden",
              textAlign: "left",
              textOverflow: "ellipsis",
              color: "text.secondary",
              whiteSpace: "nowrap",
              maxWidth: "100%",
              width: "100%",
            }}
          >
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
    </StyledColumnCard>
  );
};

ColumnSummary.displayName = "Column Summary";

const EnhancedColumnSummary = withAssociatedAlerts(
  withColumnData(ColumnSummary)
);

EnhancedColumnSummary.displayName = "Enhanced Column Summary";

export { EnhancedColumnSummary, ColumnSummary };
