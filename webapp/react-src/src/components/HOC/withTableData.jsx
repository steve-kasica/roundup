import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag } from "react-dnd";
import {
  selectOperationDepth,
  selectOperationByTableId,
  removeTableFromOperation,
} from "../../data/slices/operationsSlice";
import { getTableById } from "../../data/slices/tablesSlice";
import {
  setHoveredTable,
  clearHoveredTable,
  selectHoveredTable,
} from "../../data/slices/uiSlice";
import { addTableToSchema } from "../../data/sagas/addTableToSchemaSaga";
import { dataType as SourceTable } from "../../data/slices/tablesSlice";
import { selectColumnIdsByTableId } from "../../data/slices/columnsSlice";
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

    const hoveredTable = useSelector(selectHoveredTable);

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
        dateCreated={table.dateCreated}
        dateLastModified={table.dateLastModified}
        columnIds={columnIds}
        parentOperation={parentOperation}
        depth={depth}
        isHovered={hoveredTable === id}
        isSelected={selectedTables.includes(id)}
        isDragging={isDragging}
        isPressed={isPressed}
        isFocused={parentOperation ? true : false}
        dragRef={dragRef}
        onHover={() => dispatch(setHoveredTable(id))}
        onUnhover={() => dispatch(clearHoveredTable())}
        removeTableFromSchema={() =>
          dispatch(
            removeTableFromOperation({
              operationId: parentOperation.id,
              tableId: id,
            })
          )
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
        hoverTable={() => dispatch(setHoveredTable(id))}
        unhoverTable={() => dispatch(clearHoveredTable())}
        peekTable={() => dispatch(peekTableAction({ tableId: id }))}
      />
    );
  };
}
