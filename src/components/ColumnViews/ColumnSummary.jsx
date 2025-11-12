/* eslint-disable react/prop-types */
import withColumnData from "./withColumnData";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  Tooltip,
  Badge,
} from "@mui/material";
import { MoreVert, Info, Warning } from "@mui/icons-material";
import { useState } from "react";
import SingleBar from "../visualization/SingleBar";
import { scaleLinear } from "d3";
import ColumnTypeIcon from "./ColumnTypeIcon";
import { EnhancedColumnContextMenuItems } from "./ColumnContextMenuItems";
import StyledColumnCard from "./StyledColumnCard";

const ColumnSummary = ({
  topValues,
  name,
  databaseName,
  id,
  nullCount,
  uniqueCount,
  completeCount,
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
  hasAlerts,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  const handleMenuClick = (event) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = (event, callback) => {
    event.stopPropagation();
    setMenuAnchorEl(null);
    if (callback && typeof callback === "function") callback();
  };

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
      isError={isError || hasAlerts}
      onMouseEnter={hoverColumn}
      onMouseLeave={unhoverColumn}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      sx={{
        ...(hasAlerts && {
          borderColor: "warning.main",
          borderWidth: 2,
          backgroundColor: "warning.light",
          opacity: 0.95,
        }),
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
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={(event) => handleMenuClose(event)}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <EnhancedColumnContextMenuItems
            id={id}
            closeMenu={handleMenuClose}
            onInsertColumnLeftClick={handleInsertColumnLeft}
            onInsertColumnRightClick={handleInsertColumnRight}
          />
        </Menu>

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
              gap: 0.5,
              flex: 1,
              minWidth: 0,
              overflow: "hidden",
            }}
          >
            <h3
              style={{
                margin: 0,
                marginRight: "5px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                minWidth: 0,
                flex: 1,
                ...(hasAlerts && {
                  color: "#e65100", // warning.dark
                }),
              }}
            >
              {name || databaseName || id}
            </h3>
            {hasAlerts && (
              <Badge
                badgeContent={alertIds.length}
                color="warning"
                sx={{ mr: 0.5 }}
              >
                <Warning color="warning" fontSize="small" />
              </Badge>
            )}
            <Box
              sx={{
                "@container (min-width: 150px)": {
                  display: "block",
                },
                "@container (max-width: 149px)": {
                  display: "none",
                },
              }}
            >
              {/* TODO */}
              {/* <ColumnTypeIcon column={column} /> */}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{
              p: 0.5,
              "@container (min-width: 100px)": {
                display: "inline-flex",
              },
              "@container (max-width: 99px)": {
                display: "none",
              },
            }}
          >
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>

        {/* Sample Values - Hidden when height < 200px */}
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
            {topValues && (topValues.length || 0) > 10 ? ", ..." : ""}
          </Typography>
        </Box>

        {/* Null Values - Hidden when height < 150px */}
        <Box
          sx={{
            "@container (min-height: 90px)": {
              display: "block",
            },
            "@container (max-height: 89px)": {
              display: "none",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mb: 0.5,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Null values
            </Typography>
            <Box>
              <Tooltip
                title="Shows the proportion of non-null values versus null/missing values in this column. Higher completeness indicates fewer missing values."
                placement="top"
                arrow
              >
                <Info
                  fontSize="small"
                  sx={{
                    fontSize: 12,
                    color: "text.disabled",
                    cursor: "help",
                    "&:hover": {
                      color: "text.secondary",
                    },
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ width: "100%", overflow: "hidden" }}>
            <SingleBar
              value={nullCount}
              xAxisScale={scaleLinear().domain([0, completeCount])}
              height={20}
              color="#424242"
              backgroundColor="#eee"
              showPercentage={true}
              maxValue={completeCount}
            />
          </Box>
        </Box>

        {/* Duplicate Values - Hidden when height < 175px */}
        <Box
          sx={{
            "@container (min-height: 140px)": {
              display: "block",
            },
            "@container (max-height: 139px)": {
              display: "none",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              mt: 1,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Duplicate values
            </Typography>
            <Box>
              <Tooltip
                title="Shows the proportion of unique values versus duplicate values in this column. Higher uniqueness indicates more distinct values."
                placement="top"
                arrow
              >
                <Info
                  fontSize="small"
                  sx={{
                    fontSize: 12,
                    color: "text.disabled",
                    cursor: "help",
                    "&:hover": {
                      color: "text.secondary",
                    },
                  }}
                />
              </Tooltip>
            </Box>
          </Box>
          <Box sx={{ width: "100%", overflow: "hidden" }}>
            <SingleBar
              value={completeCount - uniqueCount}
              xAxisScale={scaleLinear().domain([0, completeCount])}
              height={20}
              color="#424242"
              backgroundColor="#eee"
              showPercentage={true}
              maxValue={completeCount}
            />
          </Box>
        </Box>
      </Box>
    </StyledColumnCard>
  );
};

ColumnSummary.displayName = "ColumnSummary";

const EnhancedColumnSummary = withColumnData(ColumnSummary);

export { EnhancedColumnSummary, ColumnSummary };
