import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag } from "react-dnd";
import {
  selectOperationDepth,
  selectOperationByTableId,
} from "../../data/slices/operationsSlice";
import { getTableById } from "../../data/selectors";
import { setTableHoveredStatus } from "../../data/slices/sourceTablesSlice";
import { addTableToSchema } from "../../data/sagas/addTableToSchemaSaga";
import { dataType as SourceTable } from "../../data/slices/sourceTablesSlice";

export function withTableData(WrappedComponent) {
  return function EnhancedComponent({ id, isDraggable = false, ...props }) {
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

    return (
      <WrappedComponent
        {...props}
        id={id}
        name={table.name}
        columnCount={table.columnCount}
        table={table}
        parentOperation={parentOperation}
        depth={depth}
        isDragging={isDragging}
        isPressed={isPressed}
        isHovered={table.status.isHovered}
        isFocused={parentOperation ? true : false}
        dragRef={dragRef}
        onHover={() =>
          dispatch(setTableHoveredStatus({ tableId: id, isHovered: true }))
        }
        onUnhover={() =>
          dispatch(setTableHoveredStatus({ tableId: id, isHovered: false }))
        }
      />
    );
  };
}
