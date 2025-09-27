/* eslint-disable react/prop-types */
import withColumnData from "./withColumnData";
import {
  Box,
  Stack,
  Typography,
  styled,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
  Divider,
} from "@mui/material";
import { MoreVert, Info } from "@mui/icons-material";
import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { formatNumber } from "../../lib/utilities";
import ProportionBar from "../visualization/ProportionBar";
import SingleBar from "../visualization/SingleBar";
import { scaleLinear } from "d3";
import ColumnValuesSample from "./ColumnValuesSample";
import ColumnTypeIcon from "./ColumnTypeIcon";

const StyledDataTypeTypography = styled(Typography)(() => ({
  textAlign: "right",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "50%",
  userSelect: "none", // Prevent text selection
}));

const StyledStatLabel = styled(Typography)(() => ({
  fontWeight: "bold",
  width: "50%",
  textTransform: "capitalize", // Capitalizes first letter of each word
  userSelect: "none", // Prevent text selection
}));

const DraggableColumnSummary = styled(Box)(
  ({ theme, isDragging, isOver, canDropHere }) => ({
    minWidth: 200,
    border: `2px solid ${
      isOver && canDropHere
        ? theme.palette.primary.main
        : isDragging
        ? theme.palette.action.disabled
        : "transparent"
    }`,
    borderRadius: theme.shape.borderRadius,
    backgroundColor:
      isOver && canDropHere
        ? theme.palette.action.hover
        : isDragging
        ? theme.palette.action.selected
        : "transparent",
    cursor: isDragging ? "grabbing" : "grab",
    opacity: isDragging ? 0.5 : 1,
    transition: "all 0.2s ease",
    "&:hover": {
      backgroundColor: theme.palette.action.hover,
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
  onDrop,
  onDragEnd,
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
    if (callback) callback();
  };

  return (
    <>
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          userSelect: "none", // Prevent text selection
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flex: 1 }}>
          <h3 style={{ margin: 0, marginRight: "5px" }}>{column.name}</h3>
          <ColumnTypeIcon column={column} />
        </Box>
        <IconButton size="small" onClick={handleMenuClick} sx={{ p: 0.5 }}>
          <MoreVert fontSize="small" />
        </IconButton>
      </Box>
      <ColumnValuesSample id={column.id} />
      <Divider sx={{ my: 1 }} />
      <Box sx={{ userSelect: "none" /* Prevent text selection */ }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.5 }}>
          <Typography variant="body2" color="text.secondary">
            Null values
          </Typography>
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
        <SingleBar
          value={nullCount}
          xAxisScale={scaleLinear().domain([0, completeCount])}
          height={20}
          color="#424242"
          backgroundColor="#eee"
          showPercentage={true}
          maxValue={completeCount}
        />
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Duplicate values
          </Typography>
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
    </>
  );
};

ColumnSummary.displayName = "ColumnSummary";

const EnhancedColumnSummary = withColumnData(ColumnSummary);

export { EnhancedColumnSummary as ColumnSummary };
