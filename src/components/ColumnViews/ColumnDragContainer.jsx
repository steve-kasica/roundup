/**
 * @fileoverview ColumnDragContainer Component
 *
 * A Higher-Order Component that adds drag-and-drop functionality to column components.
 * This container manages the drag state, drop targets, and hover interactions for
 * columns within a table, enabling column reordering and other drag-based operations.
 *
 * The component uses react-dnd for drag-and-drop functionality and integrates with
 * Redux to manage global UI state for dragging, hovering, and drop targeting.
 *
 * Key responsibilities:
 * - Enable drag functionality for columns
 * - Define valid drop targets (sibling columns)
 * - Track hover and drag states
 * - Dispatch Redux actions to update global UI state
 * - Pass dragDropRef to children for DOM manipulation
 *
 * @module components/ColumnViews/ColumnDragContainer
 *
 * @example
 * <ColumnDragContainer
 *   id="column-123"
 *   onDragEnd={handleDragEnd}
 *   onDrop={handleDrop}
 *   canDrag={true}
 * >
 *   <ColumnComponent />
 * </ColumnDragContainer>
 */

/* eslint-disable react/prop-types */

import {
  useRef,
  cloneElement,
  isValidElement,
  useEffect,
  useMemo,
} from "react";
import { useDrag, useDrop } from "react-dnd";
import { withColumnData } from "../HOC";
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
 * ColumnDragContainer Component
 *
 * A container that wraps column components to provide drag-and-drop functionality.
 * Manages drag state and passes a ref to children for DOM manipulation.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Column identifier
 * @param {string} props.parentId - ID of the parent table or operation
 * @param {React.ReactNode} props.children - Child component to wrap with drag functionality
 * @param {Function} [props.onDragEnd] - Callback when drag operation ends
 * @param {Function} [props.onDrop] - Callback when item is dropped on this column
 * @param {boolean} [props.canDrag=true] - Whether dragging is enabled
 *
 * @returns {React.ReactElement} Children with drag-drop capabilities
 *
 * @description
 * The component:
 * - Creates a unique drag type per parent table/operation
 * - Identifies sibling columns as potential drop targets
 * - Updates Redux state during drag lifecycle (start, hover, end)
 * - Passes dragDropRef to children via cloneElement
 * - Handles both drag and drop events
 *
 * Drag lifecycle:
 * 1. Drag start: Sets dragging state and identifies drop targets
 * 2. Drag over: Updates hover state
 * 3. Drag end: Clears all drag-related states
 * 4. Drop: Executes drop callback if provided
 */
const ColumnDragContainer = withColumnData(
  ({ id, parentId, children, onDragEnd, onDrop, canDrag = true }) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const dragType = `${parentId}_Column`; // Unique drag type per table

    // Get sibling column IDs (all columns in table except current one)
    // TODO: this selector is catywampus - needs to handle operations as parents too
    // TODO: is this selector just getting siblinings? There should be one selector
    // for that kind of selection that just deals with selecting from state
    const parentColumnIds = useSelector(
      (state) =>
        (isTableId(parentId)
          ? selectTablesById(state, parentId)
          : selectOperationsById(state, parentId)
        ).columnIds
    );
    const siblingColumnIds = useMemo(() => {
      return parentColumnIds.filter((cid) => cid !== id);
    }, [parentColumnIds, id]);

    const dropTargetColumnIds = useSelector((state) =>
      selectDropTargetColumnIds(state)
    );

    // Check if this column is a drop target
    const canDropHere = useMemo(
      () => dropTargetColumnIds.includes(id),
      [dropTargetColumnIds, id]
    );

    // Drag functionality
    const [{ isDragging }, drag] = useDrag({
      type: dragType,
      item: () => {
        // Dispatch action to add column to dragging state when item is created
        if (id) {
          dispatch(setDraggingColumnIds(id));

          // Set all sibling columns as drop targets
          console.log("Setting drop targets to siblings:", siblingColumnIds);
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
        if (id) {
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
        if (draggedItem.id === id) {
          return;
        }

        const dropResult = onDrop ? onDrop(draggedItem, column, monitor) : {};
        return { ...dropResult, droppedOn: column };
      },
      canDrop: (item) => item.id !== id, // Can't drop on self
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
      }),
    });

    useEffect(() => {
      // This effect runs whenever isOver changes
      if (isOver && id) {
        dispatch(addToHoveredColumnIds(id));
      } else if (!isOver && id) {
        // TODO: remove column from hover targets
        dispatch(removeFromHoveredColumnIds(id));
      }
    }, [isOver, id, dispatch]);
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
