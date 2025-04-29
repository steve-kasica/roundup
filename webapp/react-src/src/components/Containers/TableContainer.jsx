import { Children, cloneElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag } from "react-dnd";
import {
  DROP_TARGET_EVENT_INITIALIZE,
  DROP_TARGET_EVENT_PACK,
  DROP_TARGET_EVENT_STACK,
} from "../CompositeTableSchema/TableDropTarget";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
  selectOperationDepth,
  selectOperationByTableId,
} from "../../data/slices/operationsSlice";
import { getTableById, getHoverOperationTableIds } from "../../data/selectors";
import { sourceTableSelected } from "../../data/actions";
import {
  setTableSelectedStatus,
  dataType as SourceTable,
} from "../../data/slices/sourceTablesSlice";
import {
  selectHoveredTableId,
  setHoverTableId,
  unsetHoverTableId,
} from "../../data/slices/uiSlice";
import { addTableToSchema } from "../../data/sagas/addTableToSchemaSaga";

export function TableContainer({
  id,
  as: Component = "div",
  operationColumnCount,
  isDraggable = false,
  children,
}) {
  const dispatch = useDispatch();
  const table = useSelector((state) => getTableById(state, id));
  const parentOperation = useSelector((state) =>
    selectOperationByTableId(state, id)
  );
  const depth = useSelector((state) =>
    selectOperationDepth(state, parentOperation?.id)
  );
  const hoverTableId = useSelector(selectHoveredTableId);

  const hoverOperationTableIds = useSelector(getHoverOperationTableIds);

  const isHover =
    table.id === hoverTableId ||
    (hoverTableId === null && hoverOperationTableIds.includes(table.id));

  const isDisabled = false;
  const [isPressed, setIsPressed] = useState(false);

  const [{ isDragging }, dragRef, previewRef] = useDrag(
    () => ({
      type: SourceTable,
      item: { tableId: id },
      canDrag: isDraggable,
      end: (item, monitor) => {
        const result = monitor.getDropResult();
        if (monitor.didDrop() && id === result.tableId) {
          dispatch(
            addTableToSchema({
              tableId: id,
              operationType: result.operationType,
            })
          );
        }
        setIsPressed(false);
      },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [id]
  );

  const className = [
    "TableContainer",
    isHover ? "hover" : undefined,
    parentOperation ? "selected" : undefined,
    depth ? `depth-${depth}` : undefined,
    parentOperation ? parentOperation.operationType : undefined,
    isDisabled ? "disabled" : undefined,
    isDragging ? "dragging" : undefined,
    isPressed ? "pressed" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const enhancedChildren = Children.map(children, (child) =>
    cloneElement(child, {
      table,
      operationColumnCount,
    })
  );

  return (
    <Component
      ref={dragRef}
      className={className}
      data-table-id={id}
      onMouseEnter={() => dispatch(setHoverTableId(id))}
      onMouseLeave={() => dispatch(unsetHoverTableId())}
    >
      {/* <DragPreviewImage connect={previewRef} src={tableIconImage} /> */}
      {enhancedChildren}
    </Component>
  );
}
