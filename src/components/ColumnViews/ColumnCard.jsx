import withColumnData from "./withColumnData";
import { styled } from "@mui/system";
import { Paper } from "@mui/material";
import { useDrag, useDrop } from "react-dnd";
import { useRef } from "react";

const StyledPaper = styled(Paper)(
  ({
    isNull,
    isSelected,
    isHovered,
    isDragging,
    isOver,
    isDropZone,
    isDraggable,
  }) => ({
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
    cursor: isDragging
      ? "grabbing"
      : isDraggable && !isNull
      ? "grab"
      : isSelected
      ? "pointer"
      : "pointer",
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

const ColumnCard = withColumnData(
  ({
    column,
    isHovered,
    isSelected,
    isNull,
    hoverColumn,
    unhoverColumn,
    children,
    onClick,
    sx,
    onDrop, // Add callback for when something is dropped on this card
    onDragEnd, // Add callback for when dragging ends
  }) => {
    const ref = useRef(null);

    const [{ isDragging }, drag] = useDrag({
      type: "ColumnCard",
      item: () => ({
        ...column,
        type: "ColumnCard",
      }),
      canDrag: !isNull, // Allow dragging if not null (remove isSelected requirement)
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

    const [{ isOver, isDropZone }, drop] = useDrop({
      accept: "ColumnCard",
      drop: (draggedColumn, monitor) => {
        // Prevent nested drops
        if (monitor.didDrop()) {
          return;
        }

        // Don't drop on self
        if (draggedColumn.id === column?.id) {
          return;
        }

        const dropResult = {
          id: column?.id,
          column: column,
          type: "ColumnCard",
        };

        if (onDrop) {
          onDrop(draggedColumn, dropResult);
        }

        return dropResult;
      },
      canDrop: (draggedColumn) => {
        // Can't drop on self or null cards
        return (
          !isNull &&
          draggedColumn.id !== column?.id &&
          draggedColumn.tableId === column?.tableId
        );
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        isDropZone: monitor.canDrop(),
      }),
    });

    // Combine drag and drop refs
    const attachRef = (node) => {
      ref.current = node;
      drag(node);
      drop(node);
    };

    return (
      <>
        <StyledPaper
          ref={attachRef}
          elevation={1}
          isNull={isNull}
          isSelected={isSelected}
          isHovered={isHovered}
          isDragging={isDragging}
          isOver={isOver}
          isDropZone={isDropZone}
          isDraggable={isSelected}
          sx={{
            display: "flex",
            flexDirection: "column",
            padding: 1,
            userSelect: "none",
            ...sx,
          }}
          onClick={!isNull ? onClick : undefined}
          onMouseEnter={hoverColumn}
          onMouseLeave={unhoverColumn}
        >
          {children}
        </StyledPaper>
      </>
    );
  }
);

export default ColumnCard;
