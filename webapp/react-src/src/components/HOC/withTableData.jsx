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
import {
  selectColumnCountByTableId,
  selectColumnIdsByTableId,
} from "../../data/slices/columnsSlice";
import { peekTableAction } from "../../data/sagas/peekTableSaga";
import {
  appendToSelectedTables,
  removeFromSelectedTables,
  selectSelectedTables,
} from "../../data/slices/uiSlice";

export default function withTableData(WrappedComponent) {
  return function EnhancedComponent({ id, isDraggable = false, ...props }) {
    const dispatch = useDispatch();

    const table = useSelector((state) => getTableById(state, id));
    const columnIds = useSelector((state) =>
      selectColumnIdsByTableId(state, id)
    );
    const selectedTables = useSelector(selectSelectedTables);
    const parentOperation = useSelector((state) =>
      selectOperationByTableId(state, id)
    );
    const depth = useSelector((state) =>
      selectOperationDepth(state, parentOperation?.id)
    );

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
        rowCount={table.rowCount}
        tags={table.tags}
        rowsExplored={table.rowsExplored}
        isHovered={table.status.isHovered}
        dateCreated={table.dateCreated}
        dateLastModified={table.dateLastModified}
        columnIds={columnIds}
        parentOperation={parentOperation}
        depth={depth}
        isSelected={selectedTables.includes(id)}
        isDragging={isDragging}
        isPressed={isPressed}
        isFocused={parentOperation ? true : false}
        dragRef={dragRef}
        onHover={() =>
          dispatch(setTableHoveredStatus({ tableId: id, isHovered: true }))
        }
        onUnhover={() =>
          dispatch(setTableHoveredStatus({ tableId: id, isHovered: false }))
        }
        selectTable={(type, ids) => {
          switch (type) {
            case "single":
              dispatch(appendToSelectedTables(id));
              break;
            case "multi":
              dispatch(appendToSelectedTables(ids));
              break;
          }
        }}
        unselectTable={(type) => {
          switch (type) {
            case "single":
              dispatch(removeFromSelectedTables(id));
              break;
          }
        }}
        hoverTable={() =>
          dispatch(setTableHoveredStatus({ tableId: id, isHovered: true }))
        }
        unhoverTable={() =>
          dispatch(setTableHoveredStatus({ tableId: id, isHovered: false }))
        }
        peekTable={() => dispatch(peekTableAction({ tableId: id }))}
      />
    );
  };
}
