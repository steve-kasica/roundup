import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag } from "react-dnd";
import {
  selectOperationDepth,
  selectOperationByTableId,
  removeChildFromOperation,
  selectOperation,
} from "../../data/slices/operationsSlice";
import { selectTablesById } from "../../data/slices/tablesSlice";
import {
  setHoveredTable,
  clearHoveredTable,
  selectHoveredTable,
} from "../../data/slices/uiSlice";
import { addTableToSchema } from "../../data/sagas/addTableToSchemaSaga";
import { dataType as SourceTable } from "../../data/slices/tablesSlice";
import {
  selectColumnById,
  selectColumnIdsByTableId,
} from "../../data/slices/columnsSlice";
import { peekTableAction } from "../../data/sagas/peekTableSaga";
import {
  appendToSelectedTables,
  removeFromSelectedTables,
  selectSelectedTables,
} from "../../data/slices/uiSlice";
import PropTypes from "prop-types";

export default function withTableData(WrappedComponent) {
  return function EnhancedComponent({ id, isDraggable = false, ...props }) {
    let parentOperationId,
      parentOperation,
      depth = 0; // These two variables can be null if the table is not part of any operation
    const dispatch = useDispatch();

    const table = useSelector((state) => selectTablesById(state, id));
    const columns = useSelector((state) =>
      table.columnIds.map((columnId) => selectColumnById(state, columnId))
    );
    const columnNames = columns.filter(Boolean).map((col) => col.name);
    const selectedTables = useSelector(selectSelectedTables);

    parentOperationId = useSelector((state) =>
      selectOperationByTableId(state, id)
    );

    parentOperation = useSelector((state) =>
      selectOperation(state, parentOperationId)
    );

    depth = useSelector((state) =>
      selectOperationDepth(state, parentOperationId)
    );

    const hoveredTable = useSelector(selectHoveredTable);

    const isInSchema =
      parentOperationId !== null && parentOperationId !== undefined;

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
        remoteId={table.remoteId}
        name={table.name}
        source={table.source}
        rowCount={table.rowCount}
        tags={table.tags}
        rowsExplored={table.rowsExplored}
        dateCreated={table.dateCreated}
        dateLastModified={table.dateLastModified}
        columnCount={table.columnCount}
        columnIds={table.columnIds}
        columnNames={columns.filter(Boolean).map((col) => col.name)}
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
        removeTableFromSchema={() => {
          if (isInSchema) {
            dispatch(
              removeChildFromOperation({
                operationId: parentOperation.id,
                tableId: id,
              })
            );
          }
        }}
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

withTableData.propTypes = {
  WrappedComponent: PropTypes.elementType,
};

// Add prop types for the EnhancedComponent returned by withTableData
withTableData.EnhancedComponentPropTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDraggable: PropTypes.bool,
};
