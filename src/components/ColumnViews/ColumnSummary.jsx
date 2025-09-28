/* eslint-disable react/prop-types */
import withColumnData from "./withColumnData";
import {
  Box,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
  Card,
} from "@mui/material";
import { MoreVert, Info } from "@mui/icons-material";
import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import SingleBar from "../visualization/SingleBar";
import { scaleLinear } from "d3";
import ColumnValuesSample from "./ColumnValuesSample";
import ColumnTypeIcon from "./ColumnTypeIcon";

const ColumnSummary = ({
  column,
  nullCount,
  uniqueCount,
  completeCount,
  unselectColumn,
  focusColumn,
  onDrop,
  onDragEnd,
  onClick,
  onDoubleClick,
  isSelected,
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const ref = useRef(null);

  // Calculate values first
  const top = column?.max;
  const tableIndex = column.index + 1;

  // Drag functionality
  const [{ isDragging }, drag] = useDrag({
    type: "ColumnSummary",
    item: () => ({
      ...column,
      type: "ColumnSummary",
      tableIndex,
    }),
    canDrag: !!column,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (onDragEnd) {
        onDragEnd(item, dropResult, monitor.didDrop());
      }
    },
  });

  // Drop functionality
  const [{ isOver, canDropHere }, drop] = useDrop({
    accept: ["ColumnSummary", "ColumnCard"],
    drop: (draggedItem, monitor) => {
      // Prevent nested drops
      if (monitor.didDrop()) {
        return;
      }

      // Don't drop on self
      if (draggedItem.id === column?.id) {
        return;
      }

      const dropResult = onDrop ? onDrop(draggedItem, column, monitor) : {};
      return { ...dropResult, droppedOn: column };
    },
    canDrop: (item) => item.id !== column?.id, // Can't drop on self
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDropHere: monitor.canDrop(),
    }),
  });

  // Combine drag and drop refs
  const dragDropRef = (node) => {
    ref.current = node;
    drag(node);
    drop(node);
  };

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
    <Card
      sx={{
        p: 1,
        flex: "1 1 0",
        minHeight: "25px",
        display: "flex",
        flexDirection: "column",
        cursor: "pointer",
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        outline: isSelected ? "2px solid" : "none",
        outlineColor: isSelected ? "primary.main" : "transparent",
        backgroundColor: isSelected ? "action.selected" : "background.paper",
        "&:hover": {
          backgroundColor: isSelected ? "action.selected" : "action.hover",
        },
      }}
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
            <ColumnTypeIcon column={column} />
          </Box>
          <IconButton size="small" onClick={handleMenuClick} sx={{ p: 0.5 }}>
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
    </Card>
  );
};

ColumnSummary.displayName = "ColumnSummary";

const EnhancedColumnSummary = withColumnData(ColumnSummary);

export { EnhancedColumnSummary as ColumnSummary };
