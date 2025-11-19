/* eslint-disable react/prop-types */

import {
  useRef,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
} from "react";
import { useDrag, useDrop } from "react-dnd";
import withColumnData from "./withColumnData";
import { useDispatch, useSelector } from "react-redux";
import {
  addToHoveredColumnIds,
  removeFromHoveredColumnIds,
  setDraggingColumnIds,
  setDropTargetColumnIds,
  selectDropTargetColumnIds,
  setHoveredColumnIds,
} from "../../slices/uiSlice";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";

/**
 * ColumnDragContainer - A container component that handles drag functionality for columns
 * Passes dragDropRef to its children instead of wrapping them
 */
const ColumnDragContainer = withColumnData(
  ({ column, children, onDragEnd, onDrop, canDrag = true }) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const dragType = `${column.parentId}_Column`; // Unique drag type per table

    // Get sibling column IDs (all columns in table except current one)
    // TODO: this selector is catywampus - needs to handle operations as parents too
    // TODO: is this selector just getting siblinings? There should be one selector
    // for that kind of selection that just deals with selecting from state
    const parentColumnIds = useSelector(
      (state) =>
        (isTableId(column.parentId)
          ? selectTablesById(state, column.parentId)
          : selectOperationsById(state, column.parentId)
        ).columnIds
    );
    const siblingColumnIds = useMemo(() => {
      return parentColumnIds.filter((id) => id !== column.id);
    }, [parentColumnIds, column.id]);

    const dropTargetColumnIds = useSelector((state) =>
      selectDropTargetColumnIds(state)
    );

    // Check if this column is a drop target
    const canDropHere = useMemo(
      () => dropTargetColumnIds.includes(column?.id),
      [dropTargetColumnIds, column?.id]
    );

    // Drag functionality
    const [{ isDragging }, drag] = useDrag({
      type: dragType,
      item: () => {
        // Dispatch action to add column to dragging state when item is created
        if (column?.id) {
          dispatch(setDraggingColumnIds(column.id));

          // Set all sibling columns as drop targets
          if (siblingColumnIds.length > 0) {
            dispatch(setDropTargetColumnIds(siblingColumnIds));
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
          dispatch(setDraggingColumnIds([]));
        }

        // Clear all drop targets and hover targets when drag ends
        dispatch(setDropTargetColumnIds([]));
        dispatch(setHoveredColumnIds([]));

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
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    });

    useEffect(() => {
      // This effect runs whenever isOver changes
      if (isOver && column?.id) {
        dispatch(addToHoveredColumnIds(column.id));
      } else if (!isOver && column?.id) {
        // TODO: remove column from hover targets
        dispatch(removeFromHoveredColumnIds(column.id));
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
