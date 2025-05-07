import { Children, cloneElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import {
  DATA_TYPE as COLUMN,
  clearSelectedColumns,
  setColumnDragStatus,
  setColumnHoveredStatus,
  setColumnSelectedStatus,
  swapColumnsRequest,
} from "../../data/slices/columnsSlice";

import { selectColumnById } from "../../data/slices/columnsSlice";

export function ColumnContainer({
  id,
  index,
  tableId,
  children,
  isDraggable = false,
}) {
  const dispatch = useDispatch();
  const column = useSelector((state) => selectColumnById(state, id));

  const isNull = !column;

  const [{ isDragging }, dragRef, previewRef] = useDrag({
    type: COLUMN,
    canDrag: isDraggable && column?.status.isSelected,
    item: () => {
      // In this context `id` is the dragging column. It's different from `id` in useDrop
      return { id, name, tableId, isNull, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => {
      dispatch(setColumnDragStatus({ id, isDragging: false }));
      dispatch(setColumnHoveredStatus({ id, isHovered: false }));
    },
  });

  useEffect(() => {
    dispatch(setColumnDragStatus({ id, isDragging }));
  }, [isDragging, id, dispatch]);

  const [{ isOver }, dropRef] = useDrop({
    accept: COLUMN,
    drop: (droppedItem) => {
      // In this context `droppedItem.id` === `id` in useDrag

      if (droppedItem.tableId === tableId && !isNull) {
        dispatch(
          swapColumnsRequest({ sourceId: droppedItem.id, targetId: id })
        );
      }
      dispatch(setColumnDragStatus({ id, isDragging: false }));
      dispatch(clearSelectedColumns());
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Disable the default drag preview
  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  // If dragging over a column, set the hover status
  // useEffect(() => {
  //   dispatch(setColumnHoveredStatus({ id, isHovered: isOver }));
  // }, [isOver, id, dispatch]);

  const className = [
    "ColumnView",
    column?.status.isLoading ? "loading" : undefined,
    !column ? "null" : false,
    column?.status.isHovered ? "hover" : false,
    column?.status.isSelected ? "selected" : false,
    column?.status.isDragging ? "dragged" : undefined,
    column?.status.isVisible ? "visible" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const enhancedChildren = Children.map(children, (child) =>
    cloneElement(child, {
      id: column?.id,
      name: column?.name,
      index: column?.index,
      tableId: column?.tableId,
      isSelected: column?.status.isSelected,
    })
  );

  return (
    <div
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      className={className}
    >
      {enhancedChildren}
    </div>
  );
}
