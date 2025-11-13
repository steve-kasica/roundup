import StyledPaper from "./StyledPaper";
import { useRef, useState } from "react";
import useDragAndDrop from "../../../hooks/useDragAndDrop";
import { Box, List, ListItemButton, Popover } from "@mui/material";

function ColumnContainer({
  column,
  name,
  id,
  index,
  tableId,
  isDraggable = false,
  dragType,
  handleOnDrop = () => {},
  handleOnClick = () => {},
  handleOnSwapClick = () => {},
  handleOnRemoveClick = () => {},
  handleOnNullClick = () => {},
  handleOnRenameClick = () => {},
  handleOnPopoverClose = () => {},
  handleOnMouseEnter = () => {},
  handleOnMouseLeave = () => {},
  isSelected = false,
  isHovered = false,
  isNull = false,
  children,
}) {
  const {
    dropRef: dropReference,
    isOver,
    canDropHere,
  } = useDragAndDrop({
    dragType,
    dropType: dragType,
    canDrag: () => false, // Disable dragging on the main cell
    canDrop: ({ id: draggedId }) => draggedId !== id,
    onDrop: handleOnDrop,
  });

  // Drag functionality only for the drag handle
  const { dragRef, isDragging } = useDragAndDrop({
    dragType,
    dropType: "", // Handle doesn't accept drops (DnD package needs it to be a string)
    hideDefaultPreview: true, // Use custom drag layer instead
    getDragItem: () => column,
    canDrag: () => isDraggable,
    canDrop: () => false, // Handle doesn't accept drops
  });
  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);

  const cellRef = useRef(null);
  // Combine refs for the main cell (drop target only, drag preview handled by CustomDragLayer)
  const setCellRef = (element) => {
    cellRef.current = element;
    dropReference(element);
  };

  // Check if this is a drop zone (something is being dragged but not over this element)
  const isDropZone = canDropHere && !isOver && !isDragging;

  const hoverTimeoutRef = useRef(null);
  const closePopover = (event) => {
    if (event) {
      event.stopPropagation();
    }
    setAnchorEl(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    handleOnPopoverClose();
  };

  const menuItems = [
    {
      label: "Swap column positions",
      disabled: false,
      onClick: () => {
        handleOnSwapClick();
      },
    },
    {
      label: `Remove ${name}`,
      disabled: isNull,
      onClick: () => {
        handleOnRemoveClick();
      },
    },
    // {
    //   label: "Remove all to the right",
    //   disabled: true,
    //   onClick: () => {
    //     // TODO: implement logic to remove all columns to the right
    //     // handleRemoveColumnsAfter();
    //     return null;
    //   },
    // },
    // {
    //   label: "Null column",
    //   disabled: isNull,
    //   onClick: () => {
    //     handleOnNullClick();
    //   },
    // },
    {
      label: "Rename",
      disabled: isNull,
      onClick: () => {
        handleOnRenameClick();
      },
    },
  ];

  return (
    <>
      <StyledPaper
        elevation={0}
        variant="outlined"
        isNull={isNull}
        isSelected={isSelected}
        isHovered={isHovered}
        isDragging={isDragging}
        isDraggable={isDraggable}
        isOver={isOver}
        isDropZone={isDropZone}
        ref={setCellRef}
        data-table-id={tableId}
        data-column-index={index}
        onClick={(event) => {
          event.stopPropagation(); // Prevent event from bubbling up to parent
          !isPopoverOpen ? handleOnClick(event) : null;
        }}
        onContextMenu={(event) => {
          event.preventDefault(); // Prevent browser's context menu
          event.stopPropagation(); // Prevent event from bubbling up to parent
          setAnchorEl(event.currentTarget); // Open popover
          handleOnClick(event); // Select column on right-click as well
        }}
        onMouseEnter={() => {
          handleOnMouseEnter();
        }}
        onMouseLeave={() => !isPopoverOpen && handleOnMouseLeave()}
      >
        <Box
          ref={dragRef} // somehow can't pass dragRef in a styled component (TODO)
          sx={{
            width: "100%",
            cursor: isDraggable ? "grab" : "default",
          }}
        >
          {children}
        </Box>
      </StyledPaper>
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={(event, reason) => {
          if (event && reason === "backdropClick") {
            event.stopPropagation();
          }
          closePopover(event);
        }}
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
              onClick={(event) => {
                event.stopPropagation();
                item.onClick();
                closePopover();
              }}
            >
              {item.label}
            </ListItemButton>
          ))}
        </List>
      </Popover>
    </>
  );
}

ColumnContainer.defaultProps = {
  isDraggable: false,
  handleOnDrop: () => {},
  handleOnClick: () => {},
  handleOnSwapClick: () => {},
  handleOnRemoveClick: () => {},
  handleOnNullClick: () => {},
  handleOnRenameClick: () => {},
  handleOnPopoverClose: () => {},
  handleOnMouseEnter: () => {},
  handleOnMouseLeave: () => {},
  isSelected: false,
  isHovered: false,
  isNull: false,
};

export default ColumnContainer;
