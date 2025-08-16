import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useMemo } from "react";

import {
  selectOperationDepth,
  selectOperation,
} from "../../slices/operationsSlice";
import { setPeekedTable } from "../../slices/uiSlice";
import {
  selectColumnById,
  selectRemovedColumnIdsByTableId,
} from "../../slices/columnsSlice";
import {
  removeFromSelectedTables,
  selectHoveredTable,
  clearHoveredTable,
  setHoveredTable,
  selectSelectedTables,
  changeTablesName,
  selectTablesById,
  setSelectedTables,
  setTablesAttribute,
} from "../../slices/tablesSlice";

import { dropTablesAction } from "../../sagas/dropTablesSaga";
import { removeTablesAction } from "../../sagas/removeTablesSaga";
import { addTablesToSchemaRequest } from "../../sagas/addTablesToSchemaSaga";

export default function withTableData(WrappedComponent) {
  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    // Get table data from the Redux store
    const table = useSelector((state) => selectTablesById(state, id));
    const selectedTables = useSelector(selectSelectedTables) || [];
    const hoveredTable = useSelector(selectHoveredTable);

    // Get columnIds associated with this table, both active and "removed"
    const removedColumnIds = useSelector((state) =>
      selectRemovedColumnIdsByTableId(state, id)
    );

    // Use useMemo to ensure activeColumnIds updates when table.columnIds or removedColumnIds change
    const activeColumnIds = useMemo(
      () =>
        table.columnIds.filter(
          (columnId) => !removedColumnIds.includes(columnId)
        ),
      [table, removedColumnIds]
    );

    // TODO: deprecate selectedColumnIds
    const selectedColumnIds = useSelector(
      (state) => state.columns.idsByTable[table.id]
    );

    // TODO: deprecate columns
    const columns = useSelector((state) =>
      activeColumnIds.map((columnId) => selectColumnById(state, columnId))
    );
    // TODO: should not be here
    const columnNames = columns.filter(Boolean).map((col) => col.name);

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

    return (
      <WrappedComponent
        {...props}
        // Table properties
        table={table}
        removedColumnIds={removedColumnIds}
        activeColumnIds={activeColumnIds}
        columnIds={activeColumnIds} // deprecate
        columnCount={activeColumnIds.length}
        // Other related objects
        columnNames={columnNames} // TODO: remove this, should only pass Ids
        selectedColumnIds={selectedColumnIds}
        parentOperation={parentOperation} // TODO: should only pass Ids
        depth={depth}
        // Interaction state
        isHovered={isHovered}
        isInSchema={isInSchema}
        isSelected={isSelected}
        isFocused={parentOperation ? true : false}
        // Interaction handlers
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
        setTableSelection={(ids) => dispatch(setSelectedTables(ids))}
        unselectTable={() => dispatch(removeFromSelectedTables(id))}
        peekTable={() => dispatch(setPeekedTable(id))}
        renameTable={(newNames) =>
          dispatch(changeTablesName({ ids: id, newNames }))
        }
        dropTable={() => dispatch(dropTablesAction(id))}
        setKeyColumn={(columnId) =>
          dispatch(
            setTablesAttribute({
              ids: id,
              attribute: "keyColumnId",
              value: columnId,
            })
          )
        }
        addSelectedTablesToSchema={(operationType) =>
          dispatch(
            addTablesToSchemaRequest({
              tableIds: selectedTables,
              operationType,
            })
          )
        }
        addTableToSchema={(operationType) =>
          dispatch(
            addTablesToSchemaRequest({
              tableIds: [id],
              operationType,
            })
          )
        }
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
};
