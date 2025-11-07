/* eslint-disable react/prop-types */

import { useRef, cloneElement, isValidElement, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import withColumnData from "./withColumnData";
import { useDispatch, useSelector } from "react-redux";
import {
  addColumnsToDragging,
  removeColumnsFromDragging,
  addColumnsToDropTargets,
  clearDropTargets,
  addColumnsToHoverTargets,
  removeColumnsFromHoverTargets,
  clearHoverTargets,
} from "../../slices/columnsSlice/columnsSlice";
import {
  selectIsColumnDropTarget,
  selectSiblingColumnIds,
} from "../../slices/columnsSlice/columnSelectors";

/**
 * ColumnDragContainer - A container component that handles drag functionality for columns
 * Passes dragDropRef to its children instead of wrapping them
 */
const ColumnDragContainer = withColumnData(
  ({ column, children, onDragEnd, onDrop, canDrag = true }) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const dragType = `${column.tableId}_Column`; // Unique drag type per table

    // Get sibling column IDs (all columns in table except current one)
    const siblingColumnIds = useSelector((state) =>
      selectSiblingColumnIds(state, column?.tableId, column?.id)
    );

    // Check if this column is a drop target
    const canDropHere = useSelector((state) =>
      selectIsColumnDropTarget(state, column?.id)
    );

    // Drag functionality
    const [{ isDragging }, drag] = useDrag({
      type: dragType,
      item: () => {
        // Dispatch action to add column to dragging state when item is created
        if (column?.id) {
          dispatch(addColumnsToDragging(column.id));

          // Set all sibling columns as drop targets
          if (siblingColumnIds.length > 0) {
            dispatch(addColumnsToDropTargets(siblingColumnIds));
          }
        }

        return {
          ...column,
          type: dragType,
        };
      },
      canDrag,
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        // Remove from dragging state when drag ends
        if (column?.id) {
          dispatch(removeColumnsFromDragging(column.id));
        }

        // Clear all drop targets and hover targets when drag ends
        dispatch(clearDropTargets());
        dispatch(clearHoverTargets());

        const dropResult = monitor.getDropResult();
        if (onDragEnd) {
          onDragEnd(item, dropResult, monitor.didDrop());
        }
      },
    });

    // Drop functionality
    const [{ isOver }, drop] = useDrop({
      accept: [dragType],
      drop: (draggedItem, monitor) => {
        // Prevent nested drops
        if (monitor.didDrop()) {
          return;
        }

        // Don't drop on self
        if (draggedItem.id === column?.id) {
          return;
        }

        const dropResult = onDrop ? onDrop(draggedItem, column, monitor) : {};
        return { ...dropResult, droppedOn: column };
      },
      canDrop: (item) => item.id !== column?.id, // Can't drop on self
      hover: (draggedItem) => {
        // Add this column to hover targets when hovered over
        if (draggedItem.id !== column?.id && column?.id) {
          //   dispatch(addColumnsToHoverTargets(column.id));
        }
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    });

    useEffect(() => {
      // This effect runs whenever isOver changes
      if (isOver && column?.id) {
        dispatch(addColumnsToHoverTargets(column.id));
      } else if (!isOver && column?.id) {
        dispatch(removeColumnsFromHoverTargets(column.id));
      }
    }, [isOver, column?.id, dispatch]);

    // Combine drag and drop refs
    const dragDropRef = (node) => {
      ref.current = node;
      drag(node);
      drop(node);
    };

    // Pass dragDropRef to children
    if (isValidElement(children)) {
      return cloneElement(children, {
        dragDropRef,
        canDropHere,
        ...children.props,
      });
    }

    // Fallback for multiple children or non-element children
    return children;
  }
);

export default ColumnDragContainer;
