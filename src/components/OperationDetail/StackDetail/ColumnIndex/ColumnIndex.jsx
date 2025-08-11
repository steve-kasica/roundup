import {
  Box,
  IconButton,
  List,
  ListItemButton,
  Paper,
  Popover,
  Typography,
  styled,
} from "@mui/material";
// import { useEffect } from "react";
// import { useRef } from "react";
import Cell from "./Cell/Cell";
import withColumnVectorData from "../../../HOC/withColumnVectorData";
import PropTypes from "prop-types";
// import { useDrag, useDragLayer, useDrop } from "react-dnd";
// import { getEmptyImage } from "react-dnd-html5-backend";
import Header from "./Header";
import { DragIndicator } from "@mui/icons-material";
import { useRef, useState } from "react";
// import { MODULE_NAME } from ".";

// Styled component for the ColumnIndex Paper
const StyledColumnIndexPaper = styled(Paper)(() => ({
  minWidth: "200px", // width of the column index
  padding: "0px 7.5px",
  margin: "0px 0.25rem",
  position: "relative",
  transition: "width 0.3s ease-in-out",
  textAlign: "center",
  fontSize: "0.75rem",
  userSelect: "none",
  cursor: "context-menu",
}));

export function ColumnIndex({
  index,
  columnIds,
  // columnName,
  headerId,
  // maxColumnNameLength,
  // hasSelected,
  hoverColumnVector,
  unhoverColumnVector,
  onCellClick,
  onColumnClick,
  // undragColumnVector,
  // swapColumnVectors,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);
  const hoverTimeoutRef = useRef(null);

  const operationColumnNameRef = useRef(null); // Needed to focus the input element from context menu

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const menuItems = [
    {
      label: "Rename column",
      action: () => {
        // Delay focus to allow menu to close first
        setTimeout(() => {
          operationColumnNameRef.current?.focus();
          operationColumnNameRef.current?.select();
        }, 100); // 50-100ms is usually enough
      },
    },
    {
      label: "Select columns at index",
      action: () => onColumnClick({ shiftKey: false }, index),
    },
    {
      label: "Remove all columns at index",
      action: () => null, // TODO: implement remove columns at index
    },
    {
      label: "Select all columns to the right",
      action: () => onColumnClick({ shiftKey: false }, index, true),
    },
  ];
  // Use useDragLayer to monitor global drag state
  // const boxRef = useRef(null);
  // const { isDraggingColumnIndex } = useDragLayer((monitor) => ({
  //   isDraggingColumnIndex:
  //     monitor.isDragging() && monitor.getItemType() === MODULE_NAME,
  // }));

  // const [{ isDragging }, dragRef, previewRef] = useDrag({
  //   type: MODULE_NAME,
  //   item: () => {
  //     const width = boxRef.current?.getBoundingClientRect().width || WIDTH;
  //     return {
  //       columnIds,
  //       index,
  //       columnName,
  //       maxColumnNameLength,
  //       hasSelected,
  //       width,
  //     };
  //   },
  //   collect: (monitor) => {
  //     return {
  //       isDragging: monitor.isDragging(),
  //     };
  //   },
  //   end: () => {
  //     // Dispatch certain actions when the drag operation ends,
  //     // regardless of whether or it reached a drop target
  //     undragColumnVector();
  //     unhoverColumnVector();
  //   },
  // });

  // This useEffect is to make the isDragging state available globally
  // TODO: causing an infinite loop
  // useEffect(() => {
  //   if (isDragging) {
  //     // dispatch(addColumnsToDragging(columnIds));
  //   } else {
  //     // dispatch(removeFromHoveredColumns(columnIds));
  //   }
  // }, [isDragging, columnIds, dispatch]);

  // const [{ isHovered }, dropRef] = useDrop({
  //   accept: MODULE_NAME,
  //   drop: (droppedItem) => {
  //     // Remember, in this context `droppedItem.columnIds` === `columnIds` in useDrag
  //     if (droppedItem.index !== index) {
  //       swapColumnVectors(droppedItem.columnIds);
  //     }
  //   },
  //   collect: (monitor) => ({
  //     isHovered: monitor.isOver(),
  //   }),
  // });

  // // Disable the default drag preview
  // useEffect(() => {
  //   previewRef(getEmptyImage(), { captureDraggingState: true });
  // }, [previewRef]);

  // const isPotentialDropZone = isDraggingColumnIndex && !isDragging;

  return (
    <>
      <StyledColumnIndexPaper
        elevation={1}
        // ref={(node) => {
        //   dropRef(node); // Drop target for the column index
        //   boxRef.current = node; // Reference to the box for width calculation
        // }} // Drop target on the container
        data-columnids={columnIds.join(",")}
        onMouseEnter={hoverColumnVector}
        onMouseLeave={unhoverColumnVector}
        onContextMenu={(event) => {
          event.preventDefault();
          setMenuAnchorEl(event.currentTarget);
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            padding: "2px 5px",
          }}
        >
          <Header
            id={headerId}
            index={index}
            onColumnClick={onColumnClick}
            operationColumnNameRef={operationColumnNameRef}
          />
        </Box>
        {columnIds.map((columnId, i) => (
          <Cell
            key={`${i}-${columnId}`}
            id={columnId}
            onCellClick={onCellClick}
          />
        ))}
      </StyledColumnIndexPaper>
      <Popover
        open={isMenuOpen}
        anchorEl={menuAnchorEl}
        anchorOrigin={{
          vertical: -10,
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        slotProps={{
          paper: {
            sx: {
              overflow: "visible",
              "&::before": {
                content: '""',
                position: "absolute",
                bottom: 0,
                left: "50%",
                width: 0,
                height: 0,
                borderLeft: "8px solid transparent",
                borderRight: "8px solid transparent",
                borderTop: "8px solid #fff",
                transform: "translateX(-50%) translateY(100%)",
                filter: "drop-shadow(0px 1px 1px rgba(0,0,0,0.1))",
              },
            },
          },
        }}
        onClose={() => {
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
    </>
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
  onCellClick: PropTypes.func.isRequired,
  onColumnClick: PropTypes.func.isRequired,
  fetchColumnValues: PropTypes.func.isRequired,
  undragColumnVector: PropTypes.func.isRequired,
  swapColumnVectors: PropTypes.func.isRequired,
  maxColumnNameLength: PropTypes.number.isRequired,
  headerId: PropTypes.string.isRequired,
};

const EnhancedColumnIndex = withColumnVectorData(ColumnIndex);
export default EnhancedColumnIndex;
