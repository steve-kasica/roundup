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
  IconButton,
  styled,
  Chip,
  Stack,
  Tooltip,
  Divider,
} from "@mui/material";
import PropTypes from "prop-types";

import withColumnData from "../../../HOC/withColumnData";
import EditableText from "../../../ui/EditableText";
import ValuesSample from "./ValuesSample";
import Box from "@mui/material/Box";
import { DragIndicator, Key as KeyIcon } from "@mui/icons-material";
import ColumnTypeIcon from "../../../ui/ColumnTypeIcon";
import {
  approxNumber,
  formatNumber,
} from "../../../../lib/utilities/formaters";

// Styled component for the cell Paper creates a clear state hierarchy:
//
// - Selected cells: Most prominent with blue theme and strong effects
// - Hovered cells: Subtle feedback with light gray background and gentle shadow
// - Null cells: Always gray background regardless of other states
// - Normal cells: Default styling
const StyledCellPaper = styled(Paper)(({ isNull, isSelected, isHovered }) => ({
  display: "flex",
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "left",
  height: "auto",
  margin: "5px 0px",
  borderStyle: isNull ? "dashed" : "solid",
  cursor: "context-menu",
  backgroundColor: isNull
    ? "#f5f5f5"
    : isSelected
    ? "#e3f2fd"
    : isHovered
    ? "#f5f5f5"
    : "inherit",
  borderColor: isSelected ? "#2196f3" : isHovered ? "#9e9e9e" : undefined,
  // borderWidth: "2px",
  boxShadow: isSelected
    ? "0 2px 8px rgba(33, 150, 243, 0.3)"
    : isHovered
    ? "0 1px 4px rgba(0, 0, 0, 0.1)"
    : undefined,
  transform: isSelected
    ? "scale(1.02)"
    : isHovered
    ? "scale(1.01)"
    : "scale(1)",
  transition: "all 0.2s ease-in-out",
}));

function Cell({
  dragRef,
  dropRef,
  column,

  // Props for column interaction state
  isNull,
  isSelected,
  isLoading,
  isHovered,
  isDragging,
  isOver,
  error,

  // Functions for dispatching actions
  hoverColumn,
  unHoverColumn,
  nullColumn,
  removeColumn,
  renameColumn,
  onCellClick,
}) {
  // Additional variables derived from props
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
        closePopover();
        // Delay focus to allow menu to close first
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100); // 50-100ms is usually enough
      },
    },
  ];

  const nullCount = column?.totalRows - column?.nonNullValues;
  const uniqueCount = column?.uniqueValues;

  if (isNull) {
    return (
      <StyledCellPaper
        elevation={0}
        variant="outlined"
        isNull={isNull}
        isSelected={isSelected}
        isHovered={isHovered}
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
        ref={(node) => {
          dragRef(node);
          dropRef(node);
        }}
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
          sx={{
            display: "flex",
            alignItems: "center",
            background: "linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)",
            borderRight: "1px solid #d0d0d0",
            transition: "all 0.2s ease-in-out",
            "&:hover": {
              background: "linear-gradient(135deg, #e8e8e8 0%, #dcdcdc 100%)",
              borderRight: "1px solid #bbb",
              "& .MuiSvgIcon-root": {
                opacity: 0.7,
                transform: "scale(1.1)",
              },
            },
            cursor: "grab",
          }}
        >
          <DragIndicator sx={{ opacity: 0.5 }} />
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
            ref={inputRef}
            initialValue={column?.name}
            placeholder={`Column ${column?.index + 1}`}
            fontSize="1rem"
            onChange={renameColumn}
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
  dragRef: PropTypes.func.isRequired,
  dropRef: PropTypes.func.isRequired,
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
function getPercentOverlap(a, b) {
  const { right: aRight, left: aLeft, width } = a.getBoundingClientRect();
  const { right: bRight, left: bLeft } = b.getBoundingClientRect();
  const overlap = 1 - Math.abs(aRight - bRight) / width;
  return Math.max(0, overlap);
}

const EnhancedCell = withColumnData(Cell);
export default EnhancedCell;
