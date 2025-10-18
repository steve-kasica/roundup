/* eslint-disable react/prop-types */

import { useRef, cloneElement, isValidElement, useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import withTableData from "./withTableData";
import { useDispatch } from "react-redux";

/**
 * TableDragContainer - A container component that handles drag functionality for columns
 * Passes dragDropRef to its children instead of wrapping them
 */
const TableDragContainer = ({
  table,
  children,
  tableIds = [],
  onDragEnd,
  onDrop,
  dragType,
  canDrag = true,
}) => {
  const dispatch = useDispatch();
  const ref = useRef(null);

  // Drag functionality
  const [{ isDragging }, drag, preview] = useDrag({
    type: dragType,
    item: () => {
      return {
        tableIds: Array.from(new Set([table.id, ...tableIds])),
        type: dragType,
      };
    },
    canDrag,
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult();
      if (onDragEnd) {
        onDragEnd(item, dropResult, monitor.didDrop());
      }
    },
  });

  // Disable default drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  // Drop functionality
  const [{ isOver }, drop] = useDrop({
    accept: [dragType],
    drop: (draggedItem, monitor) => {
      console.log("Dropped item:", draggedItem);
      // Prevent nested drops
      if (monitor.didDrop()) {
        return;
      }

      // Don't drop on self
      if (draggedItem.id === table?.id) {
        return;
      }

      const dropResult = onDrop ? onDrop(draggedItem, table, monitor) : {};
      return { ...dropResult, droppedOn: table };
    },
    canDrop: (item) => item.id !== table?.id, // Can't drop on self
    hover: (draggedItem) => {
      // Add this column to hover targets when hovered over
      if (draggedItem.id !== table?.id && table?.id) {
        //   dispatch(addColumnsToHoverTargets(table.id));
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  useEffect(() => {
    // This effect runs whenever isOver changes
    // if (isOver && table?.id) {
    //   dispatch(addColumnsToHoverTargets(table.id));
    // } else if (!isOver && table?.id) {
    //   dispatch(removeColumnsFromHoverTargets(table.id));
    // }
  }, [isOver, table?.id, dispatch]);

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
      // canDropHere,
      ...children.props,
    });
  }

  // Fallback for multiple children or non-element children
  return children;
};

TableDragContainer.displayName = "TableDragContainer";

const EnhancedTableDragContainer = withTableData(TableDragContainer);

EnhancedTableDragContainer.displayName = "EnhancedTableDragContainer";

export { EnhancedTableDragContainer, TableDragContainer };
