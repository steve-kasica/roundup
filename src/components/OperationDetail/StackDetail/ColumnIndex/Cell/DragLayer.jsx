import React from "react";
import { useDrag, useDrop } from "react-dnd";
import PropTypes from "prop-types";
import { getEmptyImage } from "react-dnd-html5-backend";
import { useEffect } from "react";

/**
 * Higher-Order Component that adds drag and drop functionality to any component
 *
 * @param {React.Component} WrappedComponent - The component to wrap with DnD functionality
 * @param {Object} options - Configuration options for the DnD behavior
 * @param {string} options.dragType - The type identifier for drag operations
 * @param {string} options.dropType - The type identifier for drop operations (defaults to dragType)
 * @param {Function} options.getDragItem - Function that returns the drag item data
 * @param {Function} options.canDrag - Function that determines if item can be dragged
 * @param {Function} options.canDrop - Function that determines if item can accept drops
 * @param {Function} options.onDrop - Function called when item is dropped
 * @param {Function} options.onHover - Function called when dragging over item
 * @returns {React.Component} Enhanced component with drag and drop capabilities
 */
const withDragAndDrop = (WrappedComponent, options = {}) => {
  const DraggableDroppable = React.forwardRef((props, ref) => {
    const {
      dragType = "ITEM",
      dropType = dragType,
      getDragItem = () => ({ id: props.id }),
      canDrag = () => true,
      canDrop = () => true,
      onDrop = () => {},
      onHover = () => {},
      onDragStart = () => {},
      onDragEnd = () => {},
      hideDefaultPreview = false,
    } = { ...options, ...props.dragDropConfig };

    // Drag functionality
    const [{ isDragging }, dragRef, dragPreviewRef] = useDrag({
      type: dragType,
      item: () => {
        const item = getDragItem(props);
        onDragStart(item, props);
        return item;
      },
      canDrag: () => canDrag(props),
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();
        onDragEnd(item, dropResult, props);
      },
    });

    // Remove default drag preview if requested
    useEffect(() => {
      if (hideDefaultPreview && dragPreviewRef) {
        dragPreviewRef(getEmptyImage(), { captureDraggingState: true });
      }
    }, [dragPreviewRef, hideDefaultPreview]);

    // Drop functionality
    const [{ isOver, canDropHere }, dropRef] = useDrop({
      accept: Array.isArray(dropType) ? dropType : [dropType],
      drop: (item, monitor) => {
        if (monitor.didDrop()) {
          return; // Already handled by a nested drop target
        }
        const dropResult = onDrop(item, props, monitor);
        return dropResult || { dropped: true };
      },
      hover: (item, monitor) => {
        onHover(item, props, monitor);
      },
      canDrop: (item, monitor) => canDrop(item, props, monitor),
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDropHere: monitor.canDrop(),
      }),
    });

    // Combine refs
    const combinedRef = (node) => {
      dragRef(node);
      dropRef(node);
      if (ref) {
        if (typeof ref === "function") {
          ref(node);
        } else {
          ref.current = node;
        }
      }
    };

    // Pass drag and drop state as props to the wrapped component
    const enhancedProps = {
      ...props,
      dragRef,
      dropRef,
      combinedRef,
      dragPreviewRef,
      isDragging,
      isOver,
      canDropHere,
      dragDropState: {
        isDragging,
        isOver,
        canDropHere,
      },
    };

    return <WrappedComponent ref={combinedRef} {...enhancedProps} />;
  });

  DraggableDroppable.displayName = `withDragAndDrop(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  DraggableDroppable.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    dragDropConfig: PropTypes.shape({
      dragType: PropTypes.string,
      dropType: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]),
      getDragItem: PropTypes.func,
      canDrag: PropTypes.func,
      canDrop: PropTypes.func,
      onDrop: PropTypes.func,
      onHover: PropTypes.func,
      onDragStart: PropTypes.func,
      onDragEnd: PropTypes.func,
    }),
  };

  return DraggableDroppable;
};

/**
 * Alternative hook-based approach for components that prefer hooks over HOCs
 */
export function useDragAndDrop({
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

export default withDragAndDrop;
