import { Box, IconButton, List, ListItemButton, Popover } from "@mui/material";
import { useState } from "react";
import ChevronDownIcon from "@mui/icons-material/ExpandMore";
import { useRef } from "react";
import ColumnBlockView from "./ColumnBlockView";
import { isPointInBoundingBox } from "../../../lib/utilities";
import withColumnVectorData from "../../HOC/withColumnVectorData";

function ColumnIndex({
  index,
  columnIds,
  columnNames,
  isDragging,
  isHovered,
  dropRef,
  dragRef,
  hasSelected,
  hoverColumnVector,
  unhoverColumnVector,
  selectColumnVector,
  compareVectorValues,
  onCellClick,
}) {
  // Variables derived from props
  const maxColumnNameLength = Math.max(
    ...columnNames.map((name) => name.length),
    0
  );
  const index1 = index + 1;

  // UI state and refs
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);
  const [isMenuIconVisable, setIsMenuIconVisible] = useState(false);

  const formRef = useRef(null);

  const menuItems = [
    {
      // TODO
      // label: "Select all columns to the right",
      // action: () => dispatch(setColumnSelectedStatusAfterIndex({ index })),
    },
    {
      label: "Compare unique values",
      action: compareVectorValues,
    },
  ];

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
        onClick={() => {
          // Select column vector on header click
          if (!isMenuOpen) {
            selectColumnVector();
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
      {/* TODO: not sure why this has to be reversed */}
      {[...columnIds].reverse().map((columnId) => (
        <ColumnBlockView
          key={columnId}
          isDraggable={true}
          id={columnId}
          onCellClick={onCellClick}
        />
      ))}
    </form>
  );
}

const EnhancedColumnIndex = withColumnVectorData(ColumnIndex);
export default EnhancedColumnIndex;
