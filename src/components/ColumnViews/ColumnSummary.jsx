/* eslint-disable react/prop-types */
import withColumnData from "./withColumnData";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Card,
  styled,
} from "@mui/material";
import { MoreVert, Info } from "@mui/icons-material";
import { useState } from "react";
import SingleBar from "../visualization/SingleBar";
import { scaleLinear } from "d3";
import ColumnValuesSample from "./ColumnValuesSample";
import ColumnTypeIcon from "./ColumnTypeIcon";

const StyledColumnCard = styled(Card)(
  ({ isDragging, canDropHere, isSelected, isOver }) => ({
    padding: 8,
    flex: "1 1 0",
    minHeight: "25px",
    minWidth: "100px",
    display: "flex",
    flexDirection: "column",
    cursor: isDragging ? "grabbing" : "pointer",
    overflow: "hidden",
    border: "1px solid",
    borderColor: isOver
      ? "#2196f3" // primary.main (blue for active hover)
      : canDropHere
      ? "#4caf50" // success.main
      : isDragging
      ? "#ff9800" // warning.main
      : "#e0e0e0", // divider
    borderStyle: isOver ? "dashed" : canDropHere ? "dashed" : "solid",
    borderWidth: isOver || canDropHere || isDragging ? "2px" : "1px",
    outline: isSelected ? "2px solid" : "none",
    outlineColor: isSelected ? "#1976d2" : "transparent", // primary.main
    backgroundColor: isOver
      ? "#e3f2fd" // primary.50 (light blue for active hover)
      : isDragging
      ? "#fff3e0" // warning.50
      : canDropHere
      ? "#e8f5e8" // success.50
      : isSelected
      ? "rgba(0, 0, 0, 0.08)" // action.selected
      : "#ffffff", // background.paper
    transform: isOver
      ? "scale(1.05)"
      : isDragging
      ? "scale(0.95) rotate(2deg)"
      : canDropHere
      ? "scale(1.02)"
      : "scale(1)",
    transition: "all 0.2s ease-in-out",
    boxShadow: isOver
      ? "0 6px 12px rgba(33, 150, 243, 0.4)" // Blue glow for active hover
      : isDragging
      ? "0 8px 16px rgba(255, 152, 0, 0.3)"
      : canDropHere
      ? "0 4px 8px rgba(76, 175, 80, 0.2)"
      : "none",
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : "auto",
    "&:hover": {
      backgroundColor: isOver
        ? "#bbdefb" // primary.100 (darker blue for hover over isOver)
        : isDragging
        ? "#ffe0b2" // warning.100
        : canDropHere
        ? "#c8e6c9" // success.100
        : isSelected
        ? "rgba(0, 0, 0, 0.08)" // action.selected
        : "rgba(0, 0, 0, 0.04)", // action.hover
    },
  })
);

const ColumnSummary = ({
  column,
  nullCount,
  uniqueCount,
  completeCount,
  unselectColumn,
  focusColumn,
  hoverColumn,
  unhoverColumn,
  onClick,
  onDoubleClick,
  isSelected,
  isDragging,
  isOver,
  canDropHere,
  dragDropRef = null,
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
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "right",
          }}
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
        >
          <MenuItem onClick={(event) => handleMenuClose(event, unselectColumn)}>
            Hide Column
          </MenuItem>
          <MenuItem onClick={(event) => handleMenuClose(event, focusColumn)}>
            Focus Column
          </MenuItem>
          <MenuItem
            onClick={(event) =>
              handleMenuClose(event, () =>
                console.log("Change Column Type (TODO)")
              )
            }
          >
            Change Column Type
          </MenuItem>
          <MenuItem
            onClick={(event) =>
              handleMenuClose(event, () =>
                console.log("Insert column to the left (TODO)")
              )
            }
          >
            Insert column to the left
          </MenuItem>
          <MenuItem
            onClick={(event) =>
              handleMenuClose(event, () =>
                console.log("Insert column to the right (TODO)")
              )
            }
          >
            Insert column to the right
          </MenuItem>
          <MenuItem
            onClick={(event) =>
              handleMenuClose(event, () => console.log("Drag column (TODO)"))
            }
          >
            Reposition column
          </MenuItem>
          <MenuItem
            onClick={(event) =>
              handleMenuClose(event, () => console.log("Rename column (TODO)"))
            }
          >
            Rename column
          </MenuItem>
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
              {column.name}
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
