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

import { useState, useRef, useEffect } from "react";
import { Popover, List, ListItemButton } from "@mui/material";

import "./ColumnBlockView.scss";
import withColumnData from "../../HOC/withColumnData";

const delay = 500; // in ms for input changes

function ColumnBlockView({
  dragRef,
  dropRef,
  id,
  tableId,
  name,
  index,
  columnType,
  values,
  isNull,
  isSelected,
  isLoading,
  isHovered,
  isDragging,
  isOver,
  error,
  hoverColumn,
  unHoverColumn,
  nullColumn,
  removeColumn,
  renameColumn,
  toggleColumnSelected,
  spanSelectionToColumn,
  selectSingleColumn,
  addColumnToSelection,
  unselectColumn,
}) {
  // Additional variables derived from props
  const isLastInTable = false; // TODO: implement logic to determine if this is the last column in the table
  const position = index + 1; // 1-indexed column indexes for user

  // Context menu
  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);
  const hoverTimeoutRef = useRef(null);
  const closePopover = () => {
    setAnchorEl(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Determine if we should still be hovering based on mouse position
    // This could be improved with a check if mouse is still over element
    hoverTimeoutRef.current = setTimeout(unHoverColumn, 235);
  };

  // Input reference is necessary to trigger focus on column
  const inputRef = useRef(null);

  // Debounce input when modifying column attributes in the DOM
  const [value, setValue] = useState(name);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (name !== value) {
        renameColumn(value);
      }
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  const menuItems = [
    {
      label: `Remove ${name}`,
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

  const className = [
    "cell",
    isLoading ? "loading" : undefined,
    isNull ? "null" : undefined,
    isSelected ? "selected" : undefined,
    isHovered ? "hover" : undefined,
    isDragging ? "dragged" : undefined,
    isOver ? "over" : undefined,
    error ? "error" : undefined,
    columnType ? `type-${columnType}` : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const style = {};
  if (isSelected && value.length > 10) {
    style.width = `${value.length + 5}ch`;
  }

  // Render ColumnView
  return (
    <div
      className={className}
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      data-table-id={tableId}
      data-column-index={index}
      onClick={(event) => {
        if (!isPopoverOpen) {
          if (event.shiftKey) {
            spanSelectionToColumn();
          } else if (event.metaKey) {
            // Command/Windows key
            addColumnToSelection();
          } else {
            // Regular click
            selectSingleColumn();
          }
        }
      }}
      onContextMenu={(event) => {
        event.preventDefault();
        setAnchorEl(event.currentTarget);
      }}
      onMouseEnter={hoverColumn}
      onMouseLeave={() => {
        if (!isPopoverOpen) {
          unHoverColumn();
        }
      }}
    >
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        // TODO: implement logic to rename column
        // onBlur={() => dispatch(removeFromSelectedColumnIds(id))}
        // onFocus={selectColumn}
        minLength={1}
      />
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorEl}
        onClose={closePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
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
    </div>
  );
}

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

const EnhancedColumnBlockView = withColumnData(ColumnBlockView);
export default EnhancedColumnBlockView;
