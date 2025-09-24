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
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useState, useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { formatNumber } from "../../lib/utilities";

const StyledDataTypeTypography = styled(Typography)(() => ({
  textAlign: "right",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  width: "50%",
}));

const StyledStatLabel = styled(Typography)(() => ({
  fontWeight: "bold",
  width: "50%",
  textTransform: "capitalize", // Capitalizes first letter of each word
}));

const StyledHeaderContainer = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: "8px",
}));

const DraggableColumnSummary = styled(Box)(
  ({ theme, isDragging, isOver, canDropHere }) => ({
    minWidth: 200,
    padding: theme.spacing(1),
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

  const handleMenuClose = (callback) => {
    setMenuAnchorEl(null);
    if (callback) callback();
  };

  return (
    <DraggableColumnSummary
      ref={dragDropRef}
      isDragging={isDragging}
      isOver={isOver}
      canDropHere={canDropHere}
    >
      <StyledHeaderContainer>
        <h3 style={{ margin: 0, flex: 1 }}>
          {tableIndex}. {column.name}
        </h3>
        <IconButton size="small" onClick={handleMenuClick} sx={{ p: 0.5 }}>
          <MoreVert fontSize="small" />
        </IconButton>
      </StyledHeaderContainer>
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
        <MenuItem onClick={() => handleMenuClose(unselectColumn)}>
          Hide Column
        </MenuItem>
        <MenuItem onClick={() => handleMenuClose(focusColumn)}>
          Focus Column
        </MenuItem>
      </Menu>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Type
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {column.columnType}
        </StyledDataTypeTypography>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Count
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {formatNumber(completeCount)}
        </StyledDataTypeTypography>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Nulls
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {formatNumber(nullCount)}
        </StyledDataTypeTypography>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Unique
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {formatNumber(uniqueCount)}
        </StyledDataTypeTypography>
      </Stack>
      <Stack
        direction={"row"}
        spacing={2}
        sx={{ justifyContent: "space-between", mb: 0.5 }}
      >
        <StyledStatLabel variant="caption" color="text.secondary">
          Top
        </StyledStatLabel>
        <StyledDataTypeTypography variant="caption" color="text.secondary">
          {top}
        </StyledDataTypeTypography>
      </Stack>
    </DraggableColumnSummary>
  );
};

ColumnSummary.displayName = "ColumnSummary";

const EnhancedColumnSummary = withColumnData(ColumnSummary);

export { EnhancedColumnSummary as ColumnSummary };
