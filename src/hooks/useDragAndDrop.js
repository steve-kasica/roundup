/**
 * @fileoverview useDragAndDrop Hook
 *
 * A unified drag-and-drop hook combining react-dnd drag and drop functionality.
 * Provides a hook-based alternative to HOCs for components that need drag-and-drop
 * interactions.
 *
 * Features:
 * - Combined drag and drop in single hook
 * - Configurable drag and drop types
 * - Custom drag item generation
 * - Can-drag and can-drop predicates
 * - Drag start/end callbacks
 * - Optional default preview hiding
 * - Returns drag/drop refs and state
 *
 * @module hooks/useDragAndDrop
 *
 * @example
 * const { drag, drop, isDragging, isOver, canDrop } = useDragAndDrop({
 *   dragType: 'COLUMN',
 *   dropType: 'COLUMN',
 *   getDragItem: () => ({ columnId }),
 *   canDrop: (item) => item.columnId !== myColumnId,
 *   onDrop: handleDrop,
 * });
 */

import { useEffect } from "react";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";

/**
 * Hook-based approach for components that prefer hooks over HOCs
 */
export default function useDragAndDrop({
  dragType,
  dropType,
  getDragItem,
  canDrag,
  canDrop,
  onDrop,
  onDragStart,
  onDragEnd,
  hideDefaultPreview = false,
}) {
  // Always call useDrag but make it a no-op if dragType is empty
  const [{ isDragging }, drag, dragPreview] = useDrag({
    type: dragType || "__NO_DRAG__",
    item: () => {
      if (!dragType) return null;
      const item = getDragItem ? getDragItem() : {};
      if (onDragStart) {
        onDragStart(item);
      }
      return item;
    },
    canDrag: () => (dragType && canDrag ? canDrag() : false),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      if (!dragType) return;
      const dropResult = monitor.getDropResult();
      if (onDragEnd) {
        onDragEnd(item, dropResult);
      }
    },
  });

  // Drop functionality
  const [{ isOver, canDropHere }, drop] = useDrop({
    accept: Array.isArray(dropType) ? dropType : [dropType],
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        return; // Already handled by a nested drop target
      }
      const dropResult = onDrop ? onDrop(item, monitor) : {};
      return dropResult || { dropped: true };
    },
    canDrop: (item, monitor) => (canDrop ? canDrop(item, monitor) : true),
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
      canDropHere: monitor.canDrop(),
    }),
  });

  // Remove default drag preview if requested and drag is available
  useEffect(() => {
    if (hideDefaultPreview && dragPreview && dragType) {
      dragPreview(getEmptyImage(), { captureDraggingState: true });
    }
  }, [dragPreview, hideDefaultPreview, dragType]);

  const combinedRef = (node) => {
    if (dragType) {
      drag(node);
    }
    drop(node);
  };

  const dropRef = (node) => {
    drop(node);
  };

  return {
    dragRef: drag,
    dropRef,
    combinedRef,
    isDragging,
    isOver,
    canDropHere,
    dragPreview,
  };
}
