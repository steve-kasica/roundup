/* eslint-disable react/prop-types */
import withColumnData from "./withColumnData";
import { Box, Typography, IconButton, Menu, Tooltip } from "@mui/material";
import { MoreVert, Info } from "@mui/icons-material";
import { useState } from "react";
import SingleBar from "../visualization/SingleBar";
import { scaleLinear } from "d3";
import ColumnValuesSample from "./ColumnValuesSample";
import ColumnTypeIcon from "./ColumnTypeIcon";
import { EnhancedColumnContextMenuItems } from "./ColumnContextMenuItems";
import StyledColumnCard from "./StyledColumnCard";

const ColumnSummary = ({
  column,
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
  canDropHere,
  isDraggable = false,
  isError = false,
  dragDropRef = null,
  handleInsertColumnLeft,
  handleInsertColumnRight,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);

  if (!column) {
    return <div>No column data available.</div>;
  }

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
      ref={dragDropRef}
      isDragging={isDragging}
      isOver={isOver}
      canDropHere={canDropHere}
      isSelected={isSelected}
      isDraggable={isDraggable}
      isError={isError}
      onMouseEnter={hoverColumn}
      onMouseLeave={unhoverColumn}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
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
            id={column.id}
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
              }}
            >
              {column.name || column.columnName || column.id}
            </h3>
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
              <ColumnTypeIcon column={column} />
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
          <ColumnValuesSample id={column.id} />
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
