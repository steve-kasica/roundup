/**
 * ColumnBlockView.jsx
 *
 * A view for Column instance data within the StackDetail component
 *
 * Notes:
 *  - *autofocus*: I had technical trouble trigger focus on input elements from the rename option in
 *    the context menu. Follow the useEffect-approach listed on [Stack Overflow](https://stackoverflow.com/a/79315636/3734991)
 *    was able to make the UI perform the desired behavior.
 *
 */

import { useState, useRef } from "react";
import {
  Popover,
  List,
  ListItemButton,
  Paper,
  Typography,
  styled,
} from "@mui/material";
import PropTypes from "prop-types";

import withColumnData from "../../../../HOC/withColumnData";
import EditableText from "../../../../ui/EditableText";
import ValuesSample from "./ValuesSample";
import Box from "@mui/material/Box";
import { DragIndicator } from "@mui/icons-material";
import ColumnTypeIcon from "../../../../ui/ColumnTypeIcon";
import { useDragAndDrop } from "./DragLayer";

// Styled component for the cell Paper creates a clear state hierarchy:
//
// - Selected cells: Most prominent with blue theme and strong effects
// - Hovered cells: Subtle feedback with light gray background and gentle shadow
// - Null cells: Always gray background regardless of other states
// - Normal cells: Default styling
const StyledCellPaper = styled(Paper)(
  ({ isNull, isSelected, isHovered, isDragging, isOver, isDropZone }) => ({
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "left",
    height: "auto",
    margin: "5px 0px",
    borderStyle: isNull
      ? "dashed"
      : isOver
      ? "dashed"
      : isDropZone
      ? "dashed"
      : "solid",
    borderWidth: isOver ? "2px" : isDropZone ? "1px" : "1px",
    cursor: "context-menu",
    backgroundColor: isNull
      ? "#f5f5f5"
      : isDragging
      ? "#fff3e0"
      : isOver
      ? "#e8f5e8"
      : isDropZone
      ? "#f0f8f0"
      : isSelected
      ? "#e3f2fd"
      : isHovered
      ? "#f5f5f5"
      : "inherit",
    borderColor: isDragging
      ? "#ff9800"
      : isOver
      ? "#4caf50"
      : isDropZone
      ? "#81c784"
      : isSelected
      ? "#2196f3"
      : isHovered
      ? "#9e9e9e"
      : undefined,
    boxShadow: isDragging
      ? "0 8px 16px rgba(255, 152, 0, 0.4)"
      : isOver
      ? "0 4px 12px rgba(76, 175, 80, 0.3)"
      : isDropZone
      ? "0 2px 6px rgba(129, 199, 132, 0.2), inset 0 0 0 1px rgba(129, 199, 132, 0.3)"
      : isSelected
      ? "0 2px 8px rgba(33, 150, 243, 0.3)"
      : isHovered
      ? "0 1px 4px rgba(0, 0, 0, 0.1)"
      : undefined,
    transform: isDragging
      ? "scale(1.05) rotate(2deg)"
      : isOver
      ? "scale(1.03)"
      : isDropZone
      ? "scale(1.01)"
      : isSelected
      ? "scale(1.02)"
      : isHovered
      ? "scale(1.01)"
      : "scale(1)",
    opacity: isDragging ? 0.8 : isDropZone ? 0.95 : 1,
    transition: "all 0.2s ease-in-out",
    zIndex: isDragging ? 1000 : isOver ? 100 : undefined,
  })
);

function Cell({
  // Props from withColumnData HOC
  column,
  isNull,
  isSelected,
  isHovered,
  hoverColumn,
  unHoverColumn,
  nullColumn,
  removeColumn,
  renameColumn,
  onCellClick,
  swapColumnsWithinTable,
}) {
  // Separate drag and drop functionality
  const dragType = `COLUMN-${column?.tableId}`; // Only drag and drop within the same table
  const {
    dropRef: dropReference,
    isOver,
    canDropHere,
  } = useDragAndDrop({
    dragType,
    dropType: dragType,
    canDrag: () => false, // Disable dragging on the main cell
    canDrop: (draggedItem) => draggedItem.id !== column?.id,
    onDrop: (draggedColumn) => {
      const droppedColumn = column;
      swapColumnsWithinTable(draggedColumn.id, droppedColumn.id);
    },
  });

  // Drag functionality only for the drag handle
  const {
    dragRef: dragHandleRef,
    isDragging,
    dragPreviewRef,
  } = useDragAndDrop({
    dragType,
    dropType: "", // Handle doesn't accept drops (DnD package needs it to be a string)
    getDragItem: () => ({
      id: column?.id,
      name: column?.name,
      index: column?.index,
    }),
    canDrag: () => true, // Enable dragging only on handle
    canDrop: () => false, // Handle doesn't accept drops
  });

  const cellRef = useRef(null);
  const [isColumnNameEditable, setIsColumnNameEditable] = useState(false);

  // Combine refs for the main cell (drop target + drag preview)
  const setCellRef = (element) => {
    cellRef.current = element;
    dropReference(element);
    dragPreviewRef(element);
  };

  // Check if this is a drop zone (something is being dragged but not over this element)
  const isDropZone = canDropHere && !isOver && !isDragging;

  const isLastInTable = false; // TODO: implement logic to determine if this is the last column in the table  // // Context menu
  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);
  const hoverTimeoutRef = useRef(null);

  const closePopover = () => {
    setAnchorEl(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Unhover the column when the popover closes
    unHoverColumn();
  };

  // Input reference is necessary to trigger focus on column
  const inputRef = useRef(null);

  const menuItems = [
    {
      label: `Remove ${column?.name}`,
      disabled: isNull,
      onClick: () => {
        removeColumn();
        closePopover();
      },
    },
    {
      label: "Remove all to the right",
      disabled: isLastInTable,
      onClick: () => {
        // TODO: implement logic to remove all columns to the right
        // handleRemoveColumnsAfter();
        closePopover();
      },
    },
    {
      label: "Null column",
      disabled: isNull,
      onClick: () => {
        nullColumn();
        closePopover();
      },
    },
    {
      label: "Rename",
      disabled: isNull,
      onClick: () => {
        setIsColumnNameEditable(true);
        closePopover();
        // Delay focus to allow menu to close first
        setTimeout(() => {
          inputRef.current?.focusAndSelect();
        }, 100); // 50-100ms is usually enough
      },
    },
  ];

  if (isNull) {
    return (
      <StyledCellPaper
        elevation={0}
        variant="outlined"
        isNull={isNull}
        isSelected={isSelected}
        isHovered={isHovered}
        isDragging={isDragging}
        isOver={isOver}
        isDropZone={isDropZone}
      >
        <Typography
          variant="h5"
          sx={{ color: "text.secondary", opacity: 0.5, fontStyle: "italic" }}
        >
          null
        </Typography>
      </StyledCellPaper>
    );
  }
  return (
    <>
      <StyledCellPaper
        elevation={0}
        variant="outlined"
        isNull={isNull}
        isSelected={isSelected}
        isHovered={isHovered}
        isDragging={isDragging}
        isOver={isOver}
        isDropZone={isDropZone}
        ref={setCellRef}
        data-table-id={column?.tableId}
        data-column-index={column?.index}
        onClick={(event) =>
          !isPopoverOpen ? onCellClick(event, column?.id) : null
        }
        onContextMenu={(event) => {
          event.preventDefault();
          event.stopPropagation(); // Prevent event from bubbling up to parent
          setAnchorEl(event.currentTarget);
        }}
        onMouseEnter={hoverColumn}
        onMouseLeave={() => {
          // Only unhover if the popover is not open
          if (!isPopoverOpen) {
            unHoverColumn();
          }
        }}
      >
        <Box
          ref={dragHandleRef}
          sx={{
            display: "flex",
            alignItems: "center",
            background: isDragging
              ? "linear-gradient(135deg, #ffcc80 0%, #ffb74d 100%)"
              : isOver
              ? "linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 100%)"
              : isDropZone
              ? "linear-gradient(135deg, #f1f8e9 0%, #e8f5e8 100%)"
              : "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
            borderRight: isDragging
              ? "2px solid #ff9800"
              : isOver
              ? "2px solid #4caf50"
              : isDropZone
              ? "1px solid #a5d6a7"
              : "1px solid #d0d0d0",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              background: isDragging
                ? "linear-gradient(135deg, #ffb74d 0%, #ffa726 100%)"
                : isOver
                ? "linear-gradient(135deg, #a5d6a7 0%, #81c784 100%)"
                : isDropZone
                ? "linear-gradient(135deg, #e8f5e8 0%, #dcedc8 100%)"
                : "linear-gradient(135deg, #e8e8e8 0%, #dcdcdc 100%)",
              borderRight: isDragging
                ? "2px solid #f57c00"
                : isOver
                ? "2px solid #388e3c"
                : isDropZone
                ? "1px solid #81c784"
                : "1px solid #bbb",
              "& .MuiSvgIcon-root": {
                opacity: 0.7,
                transform: "scale(1.1)",
              },
            },
            cursor: isDragging ? "grabbing" : "grab",
          }}
        >
          <DragIndicator
            sx={{
              opacity: isDragging ? 1 : isOver ? 0.8 : isDropZone ? 0.6 : 0.5,
              color: isDragging
                ? "#ff6f00"
                : isOver
                ? "#2e7d32"
                : isDropZone
                ? "#66bb6a"
                : undefined,
              transform: isDragging
                ? "scale(1.2)"
                : isDropZone
                ? "scale(1.05)"
                : undefined,
              transition: "all 0.2s ease-in-out",
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "flex-start",
            padding: "2.5px 5px",
            flexGrow: 1,
            maxWidth: "100%",
            width: "90%",
            overflow: "hidden",
          }}
        >
          <EditableText
            inputRef={inputRef}
            initialValue={column?.name}
            placeholder={`Column ${column?.index + 1}`}
            onChange={renameColumn}
            isReadOnly={true}
            isEditable={isColumnNameEditable}
            onEditingStateChange={(isEditable) =>
              setIsColumnNameEditable(isEditable)
            }
            fontSize="1rem"
          />
          <ValuesSample values={Object.keys(column?.values || {})} />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "50px",
            borderRadius: "inherit",
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          }}
        >
          <ColumnTypeIcon column={column} />
        </Box>
      </StyledCellPaper>

      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{
          vertical: "center",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "center",
          horizontal: "left",
        }}
        slotProps={{
          paper: {
            sx: {
              overflow: "visible",
              "&::before": {
                content: '""',
                position: "absolute",
                left: 0,
                top: "50%",
                width: 0,
                height: 0,
                borderTop: "8px solid transparent",
                borderBottom: "8px solid transparent",
                borderRight: "8px solid #fff",
                transform: "translateX(-100%) translateY(-50%)",
                filter: "drop-shadow(-1px 0px 1px rgba(0,0,0,0.1))",
              },
            },
          },
        }}
      >
        <List>
          {menuItems.map((item) => (
            <ListItemButton
              key={item.label}
              disabled={item.disabled}
              onClick={item.onClick}
            >
              {item.label}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
}

Cell.propTypes = {
  column: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  isNull: PropTypes.bool,
  isSelected: PropTypes.bool,
  isLoading: PropTypes.bool,
  isHovered: PropTypes.bool,
  isDragging: PropTypes.bool,
  isOver: PropTypes.bool,
  error: PropTypes.any,
  hoverColumn: PropTypes.func.isRequired,
  unHoverColumn: PropTypes.func.isRequired,
  nullColumn: PropTypes.func.isRequired,
  removeColumn: PropTypes.func.isRequired,
  renameColumn: PropTypes.func.isRequired,
  onCellClick: PropTypes.func.isRequired,
  swapColumnsWithinTable: PropTypes.func.isRequired,
};

/**
 * getPercentOverlap
 *
 * Get the percentage of overlap between two element along the x-axis, left to right.
 *
 * @param {DOM} a
 * @param {DOM} b
 *
 * Note that `right` and `left` are relative from the viewport, see [`getBoundingClientRect`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect)
 */
// eslint-disable-next-line no-unused-vars
function getPercentOverlap(a, b) {
  const { right: aRight, width } = a.getBoundingClientRect();
  const { right: bRight } = b.getBoundingClientRect();
  const overlap = 1 - Math.abs(aRight - bRight) / width;
  return Math.max(0, overlap);
}

const EnhancedCell = withColumnData(Cell);
export default EnhancedCell;
