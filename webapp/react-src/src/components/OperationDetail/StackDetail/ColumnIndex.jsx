import { Box, IconButton, List, ListItemButton, Popover } from "@mui/material";
import { useState, useEffect } from "react";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { useRef } from "react";
import ColumnView from "./ColumnView";
import { isPointInBoundingBox } from "../../../lib/utilities";
import withColumnVectorData from "../../HOC/withColumnVectorData";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

export const COLUMN_INDEX = "COLUMN_INDEX";

function ColumnIndex({
  index,
  columnIds,
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
}) {
  const index1 = index + 1;

  // UI state and refs
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);

  const formRef = useRef(null);

  const menuItems = [
    {
      label: "Select columns at index",
      action: () => onColumnClick({ shiftKey: false }, index),
    },
    {
      label: "Select all columns to the right",
      action: () => onColumnClick({ shiftKey: false }, index, true),
    },
    {
      label: "Compare unique values",
      action: compareVectorValues,
    },
  ];

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

  const defaultFormWidth = 10;
  const headerRef = useRef(null);
  const className = [
    "ColumnIndex",
    isDragging ? "dragging" : "",
    isHovered ? "hovered" : "",
  ].filter(Boolean);

  return (
    <form
      ref={formRef}
      className={className.join(" ")}
      data-columnids={columnIds.join(",")}
      style={{
        width:
          hasSelected & (maxColumnNameLength > defaultFormWidth)
            ? `${maxColumnNameLength + 5}ch`
            : `${defaultFormWidth}ch`,
        transition: "width 0.3s ease-in-out",
      }}
    >
      <Box
        ref={(node) => {
          dragRef(dropRef(node));
        }}
        className="index-label"
        onMouseEnter={() => {
          setIsMenuIconVisible(true);
          hoverColumnVector();
        }}
        onMouseLeave={() => {
          setIsMenuIconVisible(false);
          unhoverColumnVector();
        }}
        onClick={(event) => {
          // Select column vector on header click
          if (!isMenuOpen) {
            onColumnClick(event, index);
          }
        }}
      >
        <div ref={headerRef}>
          <label>{index1}</label>
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              right: 0,
              padding: 0,
              top: 4,
              opacity: isMenuIconVisable ? 1 : 0,
            }}
            onClick={(event) => {
              // Prevent paraent onClick event from firing (column selection)
              event.stopPropagation();

              // Open the menu on icon button click
              setMenuAnchorEl(event.currentTarget);

              // Dispatch request for column values
              fetchColumnValues();
            }}
          >
            <ChevronDownIcon />
          </IconButton>
        </div>
        <Popover
          open={isMenuOpen}
          anchorEl={menuAnchorEl}
          anchorOrigin={{
            vertical: "bottom",
            horizontal: "left",
          }}
          onClose={({ clientX, clientY }) => {
            // use headerRef since currentTarget is the modal background
            const bbox = headerRef.current.getBoundingClientRect();
            const isMouseOverHeader = isPointInBoundingBox(
              { x: clientX, y: clientY },
              bbox
            );

            if (!isMouseOverHeader) {
              unhoverColumnVector();
              setIsMenuIconVisible(false);
            }
            setMenuAnchorEl(null);
          }}
        >
          <List>
            {menuItems.map((item, index) => (
              <ListItemButton
                key={index}
                onClick={() => {
                  item.action();
                  setMenuAnchorEl(null);
                }}
              >
                {item.label}
              </ListItemButton>
            ))}
          </List>
        </Popover>
      </Box>
      {columnIds.map((columnId, i) => (
        <ColumnView
          key={`${i}-${columnId}`} // columnId === null for all empty (null) columns
          isDraggable={true}
          id={columnId}
          onCellClick={onCellClick}
        />
      ))}
    </form>
  );
}

ColumnIndex.propTypes = {
  index: PropTypes.number.isRequired,
  columnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
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
