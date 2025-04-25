/**
 * ColumnView.jsx
 *
 * A view for Column instance data within the StackDetail component
 *
 * Notes:
 *  - *autofocus*: I had technical trouble trigger focus on input elements from the rename option in
 *    the context menu. Follow the useEffect-approach listed on [Stack Overflow](https://stackoverflow.com/a/79315636/3734991)
 *    was able to make the UI perform the desired behavior.
 *
 */

import { useEffect, useState, useRef } from "react";
import { Popover, List, ListItemButton } from "@mui/material";
import {
  removeColumnRequest,
  renameColumnRequest,
} from "../../../data/slices/columnsSlice";
import { drag, select, selectAll } from "d3";
import {
  addToSelectedColumnIds,
  clearSelectedColumnIds,
  removeFromSelectedColumnIds,
  setHoverColumnId,
  toggleSelectedColumnIds,
  unsetHoverColumnId,
} from "../../../data/slices/uiSlice/uiSlice";

import { useDispatch } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

const delay = 500; // in ms for input changes
const OVERLAP_THRESHOLD = 0.5; // percent

export default function ColumnBlockView({ column, isSelected }) {
  const dispatch = useDispatch();
  const isNull = !column;
  const id = isNull ? "" : column.id;
  const tableId = isNull ? "" : column.tableId;
  const name = isNull ? "null" : column.name;
  const index = isNull ? 0 : column.index;

  // const isLastInTable = (position === columnCount);
  const isLastInTable = false; // TODO: implement logic
  const position = index + 1; // 1-indexed column indexes for user
  console.log(isSelected);

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: "column",
    canDrag: isSelected,
    item: () => {
      return { id, name, tableId, isNull, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [, dropRef] = useDrop({
    accept: "column",
    drop: (droppedItem) => {
      if (droppedItem.tableId === tableId && !isNull) {
        // Handle the drop logic here
        dispatch(clearSelectedColumnIds());
        // dispatch(swapColumns({ sourceId: droppedItem.id, targetId: id }));
      }
    },
  });

  // Disable the default drag preview
  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  // Keep hover persistent when context menu opens
  const hoverTimeoutRef = useRef(null);

  // Setup context menu
  //
  const [anchorEl, setAnchorEl] = useState(null);
  const isPopoverOpen = Boolean(anchorEl);
  const closePopover = () => {
    setAnchorEl(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    // Determine if we should still be hovering based on mouse position
    // This could be improved with a check if mouse is still over element
    // hoverTimeoutRef.current = setTimeout(handleColumnHover, 265);
  };

  // Input reference is necessary to trigger focus on column
  const inputRef = useRef(null);

  // Debounce input when modifying column attributes in the DOM
  const [value, setValue] = useState(name);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (name !== value) {
        dispatch(
          renameColumnRequest({
            projectId: tableId,
            oldColumnName: name,
            newColumnName: value,
            id,
          })
        );
      }
    }, delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  // Render ColumnView
  return (
    <div
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      // ref={columnDataRef}
      id={id}
      data-table-id={tableId}
      data-column-index={index}
    >
      <div
        className="screen"
        onContextMenu={(event) => {
          event.preventDefault();
          setAnchorEl(event.target);
        }}
        onMouseEnter={() => {
          dispatch(setHoverColumnId(id));
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
          }
        }}
        onMouseLeave={() => {
          if (!isPopoverOpen) {
            dispatch(unsetHoverColumnId());
          }
        }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onBlur={() => dispatch(removeFromSelectedColumnIds(id))}
          onFocus={() => dispatch(addToSelectedColumnIds(id))}
          minLength={1}
        />
      </div>
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
          <ListItemButton
            disabled={isNull} // can't remove null column
            onClick={() => {
              dispatch(removeColumnRequest(id));
              closePopover();
            }}
          >
            Remove column {name}
          </ListItemButton>
          <ListItemButton
            disabled={isLastInTable}
            onClick={() => {
              handleRemoveColumnsAfter();
              closePopover();
            }}
          >
            Remove all to the right
          </ListItemButton>
          <hr></hr>
          <ListItemButton
            disabled={isNull}
            onClick={() => {
              // TODO update
              // dispatch(setColumnProperty({
              //     column,
              //     property: "status",
              //     value: COLUMN_STATUS_NULLED
              // }));
              setValue("null");
              closePopover();
            }}
          >
            Null column at {position}
          </ListItemButton>
          <ListItemButton
            disabled={isNull} // can't rename null columns
            onClick={() => {
              closePopover();
              // Delay focus to allow menu to close first
              setTimeout(() => {
                inputRef.current?.focus();
              }, 100); // 50-100ms is usually enough
            }}
          >
            Rename
          </ListItemButton>
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
