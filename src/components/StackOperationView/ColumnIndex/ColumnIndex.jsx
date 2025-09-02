import { Box, List, ListItemButton, Paper, Popover } from "@mui/material";
import withColumnVectorData from "../../HOC/withColumnVectorData";
import PropTypes from "prop-types";
import Header from "./Header";
import {
  useRef,
  useState,
  useCallback,
  useEffect,
  Children,
  isValidElement,
  cloneElement,
} from "react";

export function ColumnIndex({
  index,
  columnIds,
  headerId,
  hoverColumnVector,
  unhoverColumnVector,
  onCellClick,
  onColumnClick,
  children,
}) {
  const hoverTimeoutRef = useRef(null);
  const paperRef = useRef(null);

  const childRefs = useRef([]);
  // Clone children and attach refs
  const childrenWithRefs = Children.map(children, (child, i) =>
    isValidElement(child)
      ? cloneElement(child, {
          ref: (el) => (childRefs.current[i] = el),
        })
      : child
  );

  const isMouseOverChild = (event) =>
    childRefs.current.some((ref) => ref?.contains(event.target));

  const operationColumnNameRef = useRef(null); // Needed to focus the input element from context menu

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [isHeaderEditable, setIsHeaderEditable] = useState(false);
  const isMenuOpen = Boolean(menuAnchorEl);

  // Use mouseover/mouseout to handle transitions between child and parent
  const handleMouseOver = useCallback(
    (event) => {
      // Only fire if mouse is entering from outside the parent (not from a child)
      if (!isMouseOverChild(event)) {
        if (hoverTimeoutRef.current) {
          clearTimeout(hoverTimeoutRef.current);
        }
        hoverColumnVector();
      }
    },
    [hoverColumnVector]
  );

  const handleMouseOut = useCallback(
    (event) => {
      // Only fire if mouse is leaving to outside the parent (not to a child)
      if (!event.currentTarget.contains(event.relatedTarget)) {
        hoverTimeoutRef.current = setTimeout(() => {
          unhoverColumnVector();
        }, 50);
      }
    },
    [unhoverColumnVector]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const menuItems = [
    {
      label: "Rename column",
      action: () => {
        // Delay focus to allow menu to close first
        setIsHeaderEditable(true);
        setTimeout(() => {
          operationColumnNameRef.current?.focusAndSelect();
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

  return (
    <>
      <Paper
        ref={paperRef}
        sx={{
          minWidth: "200px", // width of the column index
          padding: "0px 7.5px",
          margin: "0px 0.25rem",
          position: "relative",
          transition: "width 0.3s ease-in-out",
          textAlign: "center",
          fontSize: "0.75rem",
          userSelect: "none",
          cursor: "context-menu",
        }}
        elevation={1}
        data-columnids={columnIds.join(",")}
        onMouseOver={handleMouseOver}
        onMouseOut={handleMouseOut}
        onClick={() => onColumnClick({ shiftKey: false }, index)}
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
            isHeaderEditable={isHeaderEditable}
            operationColumnNameRef={operationColumnNameRef}
            onHeaderEditableStateChange={setIsHeaderEditable}
          />
        </Box>
        {childrenWithRefs}
      </Paper>
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
  children: PropTypes.node,
};

const EnhancedColumnIndex = withColumnVectorData(ColumnIndex);
export default EnhancedColumnIndex;
