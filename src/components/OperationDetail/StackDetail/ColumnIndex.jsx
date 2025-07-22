import {
  Box,
  IconButton,
  Input,
  List,
  ListItemButton,
  OutlinedInput,
  Popover,
} from "@mui/material";
import { useState, useEffect } from "react";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { useRef } from "react";
import ColumnView from "./ColumnView";
import { isPointInBoundingBox } from "../../../lib/utilities";
import withColumnVectorData from "../../HOC/withColumnVectorData";
import PropTypes from "prop-types";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import TextField from "@mui/material/TextField";

export const COLUMN_INDEX = "COLUMN_INDEX";

export const WIDTH = 12; // in ch

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
  const [indexValue, setIndexValue] = useState(index + 1);

  // Update state when index prop changes
  useEffect(() => {
    setIndexValue(index + 1);
  }, [index]);

  // UI state and refs
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);
  const [isHeaderEditable, setIsHeaderEditable] = useState(false); // Add this state back

  const formRef = useRef(null);
  const inputRef = useRef(null); // Add this ref for the Input

  // Add useEffect to handle focus when isHeaderEditable changes
  useEffect(() => {
    if (isHeaderEditable && inputRef.current) {
      // For MUI Input, we need to focus the actual input element
      const inputElement =
        inputRef.current.querySelector("input") || inputRef.current;
      inputElement.focus();
      inputElement.select();
    }
  }, [isHeaderEditable]);

  const menuItems = [
    {
      label: "Rename column",
      action: () => {
        setIsHeaderEditable(true);
        setIsMenuIconVisible(false);
      },
    },
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
          hasSelected & (maxColumnNameLength > WIDTH)
            ? `${maxColumnNameLength + 5}ch`
            : `${WIDTH}ch`,
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
          <Input
            ref={inputRef}
            value={indexValue}
            readOnly={!isHeaderEditable}
            onChange={(e) => setIndexValue(e.target.value)}
            onBlur={() => setIsHeaderEditable(false)}
            endAdornment={
              isMenuIconVisable && (
                <IconButton
                  size="small"
                  sx={{ position: "absolute", right: 0 }}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuAnchorEl(event.currentTarget);
                    fetchColumnValues();
                  }}
                >
                  <ChevronDownIcon />
                </IconButton>
              )
            }
            fullWidth
            margin="dense"
            slotProps={{
              input: {
                sx: {
                  color: "#555",
                  fontFamily: "sans-serif",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  textAlign: "center",
                  cursor: "pointer",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                  whiteSpace: "nowrap",
                  width: `${indexValue.length + 4}ch`,
                },
              },
            }}
            // sx={{
            //   textAlign: "center",
            //   "& input": {
            //     textAlign: "center",
            //   },
            // }}
            type="text"
          />
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
