import { Children, cloneElement, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DragPreviewImage, useDrag } from "react-dnd";
import tableIconImage from "../../../public/images/table-icon.png";
import {
  DROP_TARGET_EVENT_INITIALIZE,
  DROP_TARGET_EVENT_PACK,
  DROP_TARGET_EVENT_STACK,
} from "../CompositeTableSchema/TableDropTarget";
import {
  OPERATION_TYPE_NO_OP,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../data/slices/operationsSlice";
import {
  getTableById,
  getHoverOperationTableIds,
  getOperationByTableId,
} from "../../data/selectors";

import { sourceTableSelected } from "../../data/actions";
import {
  setTableSelectedStatus,
  dataType as SourceTable,
} from "../../data/slices/sourceTablesSlice";
import { CHILD_TYPE_TABLE } from "../../data/slices/operationsSlice";

import {
  selectHoveredTableId,
  setHoverTableId,
  unsetHoverTableId,
} from "../../data/slices/uiSlice";

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
    getOperationByTableId(state, id)
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
          // Table has dropped
          let operationType;
          switch (result.dropTargetEvent) {
            case DROP_TARGET_EVENT_INITIALIZE:
              operationType = OPERATION_TYPE_NO_OP;
              break;
            case DROP_TARGET_EVENT_PACK:
              operationType = OPERATION_TYPE_PACK;
              break;
            case DROP_TARGET_EVENT_STACK:
              operationType = OPERATION_TYPE_STACK;
              break;
            default:
              throw new Error("Unknown drop target event");
          }
          // TODO: I think this logic should be encapsulated in a saga to handle
          // whether or not to create new operation or add it to an existing one
          // as well as update the table status in the table slice
          // We might also store operation data in the custom metadata attribute of
          // the table in OpenRefine
          dispatch(sourceTableSelected({ operationType, table }));
          dispatch(setTableSelectedStatus({ tableId: id, isSelected: true }));
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
    "TableView",
    isHover ? "hover" : undefined,
    table.status.isSelected ? "selected" : undefined,
    table.status.isSelected ? `depth-${parentOperation.depth}` : undefined,
    table.status.isSelected ? parentOperation.operationType : undefined,
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
