import { Box, Paper } from "@mui/material";
import { useState, useEffect } from "react";
import { useRef } from "react";
import ColumnView from "./ColumnView";
import withColumnVectorData from "../../../HOC/withColumnVectorData";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import IndexHeader from "./IndexHeader";
import { DragHandleOutlined, DragIndicator } from "@mui/icons-material";

export const COLUMN_INDEX = "COLUMN_INDEX";

export const WIDTH = 20; // in ch

function ColumnIndex({
  index,
  columnIds,
  columnName,
  maxColumnNameLength,
  hasSelected,
  hoverColumnVector,
  unhoverColumnVector,
  compareVectorValues,
  onCellClick,
  onColumnClick,
  fetchColumnValues,
  undragColumnVector,
  swapColumnVectors,
  onHeaderChange,
}) {
  // const [operationColumnName, setOperationColumnName] = useState(
  //   columnName || `Column ${index + 1}`
  // );

  // // Update state when index prop changes
  // useEffect(() => {
  //   setOperationColumnName(columnName || `Column ${index + 1}`);
  // }, [columnName, index]);

  const formRef = useRef(null);
  const inputRef = useRef(null); // Add this ref for the Input

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: COLUMN_INDEX,
    item: () => {
      return { columnIds, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
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
    accept: COLUMN_INDEX,
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

  return (
    <Box
      //   ref={(node) => {
      //     dragRef(dropRef(node));
      //   }}
      ref={formRef}
      className={className.join(" ")}
      data-columnids={columnIds.join(",")}
      sx={{
        width:
          hasSelected & (maxColumnNameLength > WIDTH)
            ? `${maxColumnNameLength + 10}ch`
            : `${WIDTH}ch`,
        transition: "width 0.3s ease-in-out",
        margin: "0 0.05rem",
      }}
      onMouseEnter={hoverColumnVector}
      onMouseLeave={unhoverColumnVector}
    >
      <DragIndicator sx={{ transform: "rotate(90deg)", cursor: "grab" }} />
      <IndexHeader
        title={columnName}
        index={index}
        onColumnClick={onColumnClick}
        onInputChange={(newName) => onHeaderChange(index, newName)}
      />

      {columnIds.map((columnId, i) => (
        <Paper
          key={`${i}-${columnId}`} // columnId === null for all empty (null) columns
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
};

const EnhancedColumnIndex = withColumnVectorData(ColumnIndex);
export default EnhancedColumnIndex;
