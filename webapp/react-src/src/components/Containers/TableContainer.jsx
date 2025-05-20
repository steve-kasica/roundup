import { Children, cloneElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag } from "react-dnd";
import {
  selectOperationDepth,
  selectOperationByTableId,
} from "../../data/slices/operationsSlice";
import { getTableById } from "../../data/selectors";
import {
  setTableHoveredStatus,
  dataType as SourceTable,
} from "../../data/slices/sourceTablesSlice";
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

  const isDisabled = false;
  const [isPressed, setIsPressed] = useState(false);

  const [{ isDragging }, dragRef] = useDrag(
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
    table.status.isHovered ? "hover" : undefined,
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
      onMouseEnter={() =>
        dispatch(setTableHoveredStatus({ tableId: id, isHovered: true }))
      }
      onMouseLeave={() =>
        dispatch(setTableHoveredStatus({ tableId: id, isHovered: false }))
      }
    >
      {enhancedChildren}
    </Component>
  );
}
