import { Box, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useRef } from "react";
import ColumnView from "./ColumnView";
import withColumnVectorData from "../../../HOC/withColumnVectorData";
import PropTypes from "prop-types";
import { useDrag, useDragLayer, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import IndexHeader from "./IndexHeader";
import { DragHandleOutlined, DragIndicator } from "@mui/icons-material";
import { MODULE_NAME } from ".";

export const WIDTH = 20; // in ch

export function ColumnIndex({
  index,
  columnIds,
  columnName,
  maxColumnNameLength,
  hasSelected,
  hoverColumnVector,
  unhoverColumnVector,
  onCellClick,
  onColumnClick,
  undragColumnVector,
  swapColumnVectors,
  onHeaderChange,
}) {
  // Use useDragLayer to monitor global drag state
  const boxRef = useRef(null);
  const { isDraggingColumnIndex } = useDragLayer((monitor) => ({
    isDraggingColumnIndex:
      monitor.isDragging() && monitor.getItemType() === MODULE_NAME,
  }));

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: MODULE_NAME,
    item: () => {
      const width = boxRef.current?.getBoundingClientRect().width || WIDTH;
      return {
        columnIds,
        index,
        columnName,
        maxColumnNameLength,
        hasSelected,
        width,
      };
    },
    collect: (monitor) => {
      return {
        isDragging: monitor.isDragging(),
      };
    },
    end: () => {
      // Dispatch certain actions when the drag operation ends,
      // regardless of whether or it reached a drop target
      undragColumnVector();
      unhoverColumnVector();
    },
  });

  // This useEffect is to make the isDragging state available globally
  // TODO: causing an infinite loop
  // useEffect(() => {
  //   console.log("Column vector drag state changed:", isDragging, columnIds);
  //   if (isDragging) {
  //     // dispatch(addColumnsToDragging(columnIds));
  //   } else {
  //     // dispatch(removeFromHoveredColumns(columnIds));
  //   }
  // }, [isDragging, columnIds, dispatch]);

  const [{ isHovered }, dropRef] = useDrop({
    accept: MODULE_NAME,
    drop: (droppedItem) => {
      // Remember, in this context `droppedItem.columnIds` === `columnIds` in useDrag
      if (droppedItem.index !== index) {
        swapColumnVectors(droppedItem.columnIds);
      }
    },
    collect: (monitor) => ({
      isHovered: monitor.isOver(),
    }),
  });

  // Disable the default drag preview
  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  const className = [
    "ColumnIndex",
    isDragging ? "dragging" : "",
    isHovered ? "hovered" : "",
  ].filter(Boolean);

  const isPotentialDropZone = isDraggingColumnIndex && !isDragging;

  return (
    <Box
      ref={(node) => {
        dropRef(node); // Drop target for the column index
        boxRef.current = node; // Reference to the box for width calculation
      }} // Drop target on the container
      className={className.join(" ")}
      data-columnids={columnIds.join(",")}
      sx={{
        width:
          hasSelected & (maxColumnNameLength > WIDTH)
            ? `${maxColumnNameLength + 10}ch`
            : `${WIDTH}ch`,
        transition: "width 0.3s ease-in-out",
        margin: "0 0.05rem",
        // Apply well style when this specific column is being dragged
        ...(isDragging && {
          backgroundColor: "#f5f5f5",
          border: "2px inset #ddd",
          borderRadius: "8px",
          opacity: 0.7,
          "& > *": { opacity: 0 }, // Hide all chidren while dragging
        }),
        // Apply drop zone styles when any other column is being dragged
        ...(isPotentialDropZone && {
          border: "2px dashed #3f51b5",
          backgroundColor: "rgba(63, 81, 181, 0.1)",
        }),
        // Apply hover styles when being hovered over during drag
        ...(isHovered &&
          !isDragging && {
            border: "2px solid #3f51b5",
            backgroundColor: "rgba(63, 81, 181, 0.15)",
          }),
        // Default border when not in any drag state
        ...(!isDragging &&
          !isPotentialDropZone &&
          !isHovered && {
            border: "2px dashed #fff",
            backgroundColor: "transparent",
          }),
        textAlign: "center",
        lineHeight: "normal",
        fontSize: "0.75rem",
        userSelect: "none",
      }}
      onMouseEnter={hoverColumnVector}
      onMouseLeave={unhoverColumnVector}
    >
      <div
        ref={dragRef} // Wrap the icon in a div for proper ref forwarding
        style={{
          display: "inline-block",
          cursor: isDragging ? "grabbing" : "grab",
        }}
      >
        <DragIndicator
          sx={{
            transform: "rotate(90deg)",
            "&:hover": {
              color: "primary.main",
            },
          }}
        />
      </div>
      <IndexHeader
        title={columnName}
        index={index}
        onColumnClick={onColumnClick}
        onInputChange={(newName) => onHeaderChange(index, newName)}
      />

      {columnIds.map((columnId, i) => (
        <Paper
          key={`${i}-${columnId}`}
          elevation={1}
          sx={{
            margin: "0.25rem",
            border: "0.5px solid #ccc",
            borderRadius: "4px",
          }}
        >
          <ColumnView
            isDraggable={true}
            id={columnId}
            onCellClick={onCellClick}
          />
        </Paper>
      ))}
    </Box>
  );
}

ColumnIndex.propTypes = {
  index: PropTypes.number.isRequired,
  columnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  columnName: PropTypes.string,
  hasSelected: PropTypes.bool.isRequired,
  hoverColumnVector: PropTypes.func.isRequired,
  unhoverColumnVector: PropTypes.func.isRequired,
  compareVectorValues: PropTypes.func.isRequired,
  onCellClick: PropTypes.func.isRequired,
  onColumnClick: PropTypes.func.isRequired,
  fetchColumnValues: PropTypes.func.isRequired,
  undragColumnVector: PropTypes.func.isRequired,
  swapColumnVectors: PropTypes.func.isRequired,
  maxColumnNameLength: PropTypes.number.isRequired,
  onHeaderChange: PropTypes.func.isRequired,
};

const EnhancedColumnIndex = withColumnVectorData(ColumnIndex);
export default EnhancedColumnIndex;
