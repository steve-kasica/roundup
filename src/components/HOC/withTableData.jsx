import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useDrag } from "react-dnd";
import PropTypes from "prop-types";

import {
  selectOperationDepth,
  selectOperation,
} from "../../slices/operationsSlice";
import { setPeekedTable } from "../../slices/uiSlice";
import { selectColumnById } from "../../slices/columnsSlice";
import {
  removeFromSelectedTables,
  selectHoveredTable,
  clearHoveredTable,
  setHoveredTable,
  selectSelectedTables,
  changeTablesName,
  selectTablesById,
  setSelectedTables,
  dataType as SourceTable,
} from "../../slices/tablesSlice";

import { dropTablesAction } from "../../sagas/dropTablesSaga";
import { removeTablesAction } from "../../sagas/removeTablesSaga";
import { addTableToSchema } from "../../sagas/addTableToSchemaSaga";

export default function withTableData(WrappedComponent) {
  function EnhancedComponent({ id, isDraggable = false, ...props }) {
    const dispatch = useDispatch();

    // Get table data from the Redux store
    const table = useSelector((state) => selectTablesById(state, id));
    const selectedTables = useSelector(selectSelectedTables) || [];
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
        name={table.name}
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
        isInSchema={isInSchema}
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
        setTableSelection={(ids) => {
          if (ids === undefined) {
            ids = id;
          }
          dispatch(setSelectedTables(ids));
        }}
        unselectTable={() => dispatch(removeFromSelectedTables(id))}
        peekTable={() => dispatch(setPeekedTable(id))}
        renameTable={(newNames) =>
          dispatch(changeTablesName({ ids: id, newNames }))
        }
        dropTable={() => dispatch(dropTablesAction(id))}
      />
    );
  }

  EnhancedComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    isDraggable: PropTypes.bool,
  };

  return EnhancedComponent;
}

withTableData.propTypes = {
  WrappedComponent: PropTypes.elementType.isRequired,
};

// EnhancedComponent prop types
export const EnhancedComponentPropTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  isDraggable: PropTypes.bool,
};
