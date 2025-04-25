import { Children, cloneElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import {
  DATA_TYPE as COLUMN,
  clearSelectedColumns,
  setColumnDragStatus,
  setColumnHoverStatus,
  setColumnSelectedStatus,
} from "../../data/slices/columnsSlice";

import { selectColumnById } from "../../data/slices/columnsSlice";

export function ColumnContainer({
  id,
  index,
  tableId,
  onClickHandler = () => null,
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
      dispatch(setColumnHoverStatus({ id, isHovered: false }));
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
        // Handle the drop logic here
        // dispatch(swapColumns({ sourceId: droppedItem.id, targetId: id }));
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
  useEffect(() => {
    dispatch(setColumnHoverStatus({ id, isHovered: isOver }));
  }, [isOver, id, dispatch]);

  const className = [
    "ColumnView",
    column?.status.isLoading ? "loading" : undefined,
    isNull ? "null" : undefined,
    column?.status.isHovered || isOver ? "hover" : undefined,
    column?.status.isSelected ? "selected" : undefined,
    column?.status.isDragging ? "dragged" : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  console.log(column?.status.isSelected);

  const enhancedChildren = Children.map(children, (child) =>
    cloneElement(child, {
      column,
    })
  );

  return (
    <div
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      className={className}
      onClick={() =>
        dispatch(
          setColumnSelectedStatus({
            id,
            isSelected: !column?.status.isSelected,
          })
        )
      }
      onMouseEnter={() =>
        dispatch(setColumnHoverStatus({ id, isHovered: true }))
      }
      onMouseLeave={() =>
        dispatch(setColumnHoverStatus({ id, isHovered: false }))
      }
    >
      {enhancedChildren}
    </div>
  );
}
