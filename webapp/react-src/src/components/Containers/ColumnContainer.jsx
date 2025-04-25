import { Children, cloneElement, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag, useDrop } from "react-dnd";
import { getEmptyImage } from "react-dnd-html5-backend";
import { DATA_TYPE as COLUMN } from "../../data/slices/columnsSlice";

import { selectColumnById } from "../../data/slices/columnsSlice";
import {
  selectSelectedColumnIds,
  selectHoveredColumnId,
  selectHoveredColumnIndex,
  selectHoveredTableId,
  clearSelectedColumnIds,
  selectDraggedSrcColumnId,
  selectDraggedTargetColumnId,
  setDraggedSrcColumnId,
  unsetDraggedSrcColumnId,
  setDraggedTargetColumnId,
  unsetDraggedTargetColumnId,
  unsetHoverColumnId,
} from "../../data/slices/uiSlice";
import { clear } from "console";

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

  const hoverColumnIndex = useSelector(selectHoveredColumnIndex);
  const hoverColumnId = useSelector(selectHoveredColumnId);
  const selectedColumnIds = useSelector(selectSelectedColumnIds);
  const hoverTableId = useSelector(selectHoveredTableId);
  const draggedSrcColumnId = useSelector(selectDraggedSrcColumnId);
  const draggedTargetColumnId = useSelector(selectDraggedTargetColumnId);

  const isNull = !column;
  const isHovered =
    (hoverColumnId !== null && hoverColumnId === id) ||
    (!hoverColumnId && !hoverTableId && hoverColumnIndex === index) ||
    (!hoverColumnId && !hoverColumnIndex && hoverTableId === tableId);
  const isSelected = column && selectedColumnIds.includes(id);
  // const isLoading = !isNull && status === COLUMN_STATUS_LOADING;
  const isLoading = false;
  const isDragging = draggedSrcColumnId && draggedSrcColumnId === id;
  const isDraggingOver = draggedTargetColumnId && draggedTargetColumnId === id;

  const [, dragRef, previewRef] = useDrag({
    type: COLUMN,
    canDrag: isDraggable && isSelected,
    item: () => {
      dispatch(setDraggedSrcColumnId(id));
      return { id, name, tableId, isNull, index };
    },
    end: () => {
      dispatch(unsetDraggedSrcColumnId());
      dispatch(unsetHoverColumnId());
    },
  });
  const [{ isOver }, dropRef] = useDrop({
    accept: COLUMN,
    drop: (droppedItem) => {
      if (droppedItem.tableId === tableId && !isNull) {
        // Handle the drop logic here
        // dispatch(swapColumns({ sourceId: droppedItem.id, targetId: id }));
      }
      dispatch(unsetDraggedTargetColumnId());
      dispatch(clearSelectedColumnIds());
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  // Disable the default drag preview
  useEffect(() => {
    previewRef(getEmptyImage(), { captureDraggingState: true });
  }, []);

  // Dispatch global drag target set
  useEffect(() => {
    if (isOver) {
      dispatch(setDraggedTargetColumnId(id));
    }
  }, [isOver, id, dispatch]);

  const className = [
    "ColumnView",
    isLoading ? "loading" : undefined,
    isNull ? "null" : undefined,
    isHovered ? "hover" : undefined,
    isSelected ? "selected" : undefined,
    isDragging ? "dragged" : undefined,
    isDraggingOver || isOver ? "dragged-over" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const enhancedChildren = Children.map(children, (child) =>
    cloneElement(child, {
      column,
      isSelected,
    })
  );

  return (
    <div
      ref={(node) => {
        dragRef(node);
        dropRef(node);
      }}
      className={className}
      onClick={() => onClickHandler(column)}
    >
      {enhancedChildren}
    </div>
  );
}
