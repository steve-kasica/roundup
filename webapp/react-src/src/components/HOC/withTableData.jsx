import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag } from "react-dnd";
import {
  selectOperationDepth,
  selectOperationByTableId,
  removeChildFromOperation,
  selectOperation,
} from "../../data/slices/operationsSlice";
import {
  changeTablesName,
  selectTablesById,
} from "../../data/slices/tablesSlice";
import {
  setHoveredTable,
  clearHoveredTable,
  selectHoveredTable,
  setPeekedTable,
} from "../../data/slices/uiSlice";
import { addTableToSchema } from "../../data/sagas/addTableToSchemaSaga";
import { dataType as SourceTable } from "../../data/slices/tablesSlice";
import { selectColumnById } from "../../data/slices/columnsSlice";
import {
  appendToSelectedTables,
  removeFromSelectedTables,
  selectSelectedTables,
} from "../../data/slices/uiSlice";
import PropTypes from "prop-types";
import { dropTablesAction } from "../../data/sagas/dropTablesSaga";
import { removeTablesAction } from "../../data/sagas/removeTablesSaga";

export default function withTableData(WrappedComponent) {
  return function EnhancedComponent({ id, isDraggable = false, ...props }) {
    const dispatch = useDispatch();

    // Get table data from the Redux store
    const table = useSelector((state) => selectTablesById(state, id));
    const selectedTables = useSelector(selectSelectedTables);
    const hoveredTable = useSelector(selectHoveredTable);

    // Get column data from the Redux store
    const selectedColumnIds = useSelector(
      (state) => state.columns.idsByTable[table.id]
    );
    const columns = useSelector((state) =>
      table.columnIds.map((columnId) => selectColumnById(state, columnId))
    );

    // Get related operation data from the Redux store, if any
    const parentOperation = useSelector((state) =>
      table.operationId ? selectOperation(state, table.operationId) : null
    );
    const depth = useSelector((state) =>
      table.operationId ? selectOperationDepth(state, table.operationId) : null
    );

    const isInSchema = table.operationId !== null;
    const isHovered = hoveredTable === id;
    const isSelected = selectedTables.includes(id);

    // TODO: should not be here
    const columnNames = columns.filter(Boolean).map((col) => col.name);

    const [isPressed, setIsPressed] = useState(false);

    // TODO: this should be in the view
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
        // Table properties
        table={table}
        id={table.id} //
        source={table.source}
        name={table.alias || table.name}
        extension={table.extension}
        size={table.size}
        mimeType={table.mimeType}
        columnCount={table.columnIds.length}
        columnIds={table.columnIds}
        rowCount={table.rowCount}
        rowsExplored={table.rowsExplored}
        dateLastModified={table.dateLastModified}
        // Other related objects
        columnNames={columnNames} // TODO: remove this, should only pass Ids
        selectedColumnIds={selectedColumnIds}
        parentOperation={parentOperation} // TODO: should only pass Ids
        depth={depth}
        // Interaction state
        isHovered={isHovered}
        isSelected={isSelected}
        isDragging={isDragging}
        isPressed={isPressed}
        isFocused={parentOperation ? true : false}
        // Interaction handlers
        dragRef={dragRef}
        onHover={() => dispatch(setHoveredTable(id))} // TODO: remove
        onUnhover={() => dispatch(clearHoveredTable())} // TODO: remove
        hoverTable={() => dispatch(setHoveredTable(id))}
        unhoverTable={() => dispatch(clearHoveredTable())}
        removeTableFromSchema={() => {
          if (isInSchema) {
            dispatch(
              removeTablesAction({
                operationIds: [table.operationId],
                tableIds: [id],
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
        peekTable={() => dispatch(setPeekedTable(id))}
        setTableAlias={(aliases) =>
          dispatch(changeTablesName({ ids: id, aliases }))
        }
        dropTable={() => dispatch(dropTablesAction(id))}
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
