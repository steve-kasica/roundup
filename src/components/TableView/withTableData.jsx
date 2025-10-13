import { useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useCallback, useMemo } from "react";

import {
  selectOperationDepth,
  selectOperation,
} from "../../slices/operationsSlice";
import { setPeekedTable } from "../../slices/uiSlice";
import {
  selectColumnById,
  selectRemovedColumnIdsByTableId,
  selectSelectedColumns,
  setHoveredColumns,
  setSelectedColumns,
} from "../../slices/columnsSlice";
import {
  selectHoveredTable,
  clearHoveredTable,
  setHoveredTable,
  selectSelectedTables,
  changeTablesName,
  selectTablesById,
  setSelectedTables,
  setTablesAttribute,
  removeFromSelectedTables,
} from "../../slices/tablesSlice";

import { deleteTablesRequest } from "../../sagas/deleteTablesSaga";
import { updateTablesRequest } from "../../sagas/updateTablesSaga";
import { createColumnsRequest } from "../../sagas/createColumnsSaga";

export default function withTableData(WrappedComponent) {
  const componentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    try {
      // Get table data from the Redux store
      const table = useSelector((state) => selectTablesById(state, id));
      const selectedTables = useSelector(selectSelectedTables) || [];
      const hoveredTable = useSelector(selectHoveredTable);

      // Get columnIds associated with this table, both active and "removed"
      const removedColumnIds = useSelector((state) =>
        selectRemovedColumnIdsByTableId(state, id)
      );

      // Use useMemo to ensure activeColumnIds updates when columnIds or removedColumnIds change
      // deprecated
      const activeColumnIds = useSelector((state) => {
        const columnIds = Object.values(state.columns.data)
          .filter((col) => col.tableId === id)
          .map((col) => col.id);
        return columnIds;
      });

      // Get selected columns from state
      const allSelectedColumns = useSelector(selectSelectedColumns);

      // The intersection of the set of columns in this table and the set of selected columns
      const selectedColumnIds = useMemo(() => {
        return allSelectedColumns.filter((colId) =>
          activeColumnIds.includes(colId)
        );
      }, [allSelectedColumns, activeColumnIds]);
      const hoveredColumnIds = useSelector((state) =>
        state.columns.hovered.filter((colId) => activeColumnIds.includes(colId))
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
        table.operationId
          ? selectOperationDepth(state, table.operationId)
          : null
      );

      const isInSchema = table.operationId !== null;
      const isHovered = hoveredTable === id;
      const isSelected = selectedTables.includes(id);

      // Functions to handle interactions
      const selectColumns = useCallback(
        (columnIds) => dispatch(setSelectedColumns(columnIds)),
        [dispatch]
      );

      const hoverColumn = useCallback(
        (columnIds) => {
          dispatch(setHoveredColumns(columnIds));
        },
        [dispatch]
      );

      const unhoverColumn = useCallback(() => {
        dispatch(setHoveredColumns([]));
      }, [dispatch]);

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
          hoveredColumnIds={hoveredColumnIds} // Only hovered columnIDs in this table
          parentOperation={parentOperation} // TODO: should only pass Ids
          depth={depth}
          // Interaction state
          isHovered={isHovered}
          isInSchema={isInSchema}
          isSelected={isSelected}
          isFocused={parentOperation ? true : false}
          // Interaction handlers
          selectColumns={selectColumns}
          hoverColumn={hoverColumn}
          unhoverColumn={unhoverColumn}
          swapColumns={(target, source) => {
            const updatedColumnIds = [...activeColumnIds];
            const sourceIndex = updatedColumnIds.indexOf(source);
            const targetIndex = updatedColumnIds.indexOf(target);
            if (sourceIndex === -1 || targetIndex === -1) return; // Invalid indices

            // Remove source columnId from its original position
            updatedColumnIds.splice(sourceIndex, 1);
            // Insert source columnId at the target position
            updatedColumnIds.splice(targetIndex, 0, source);

            // Update the table's columnIds in the store
            dispatch(updateTablesRequest({ id, columnIds: updatedColumnIds }));
          }}
          insertColumn={(index) => {
            dispatch(createColumnsRequest({ tableId: id, index }));
          }}
          // Table action handlers
          onHover={() => dispatch(setHoveredTable(id))} // TODO: remove
          onUnhover={() => dispatch(clearHoveredTable())} // TODO: remove
          hoverTable={() => dispatch(setHoveredTable(id))}
          unhoverTable={() => dispatch(clearHoveredTable())}
          // removeTableFromSchema={() => {
          //   // TODO
          //   if (isInSchema) {
          //     dispatch(
          //       deleteTablesRequest({
          //         operationIds: [table.operationId],
          //         tableIds: [id],
          //       })
          //     );
          //   }
          // }}
          setTableSelection={(ids) => dispatch(setSelectedTables(ids))}
          unselectTable={() => dispatch(removeFromSelectedTables(id))}
          peekTable={() => dispatch(setPeekedTable(id))}
          renameTable={(newNames) =>
            dispatch(changeTablesName({ ids: id, newNames }))
          }
          dropTable={() => dispatch(deleteTablesRequest(id))} // @depricate
          deleteTable={() => dispatch(deleteTablesRequest(id))}
          setKeyColumn={(columnId) =>
            dispatch(
              setTablesAttribute({
                ids: id,
                attribute: "keyColumnId",
                value: columnId,
              })
            )
          }
          // addSelectedTablesToSchema={(operationType) =>
          //   dispatch(
          //     addTablesToSchemaRequest({
          //       tableIds: selectedTables,
          //       operationType,
          //     })
          //   )
          // }
        />
      );
    } catch (error) {
      // Enhanced error with component context
      const enhancedError = new Error(
        `Error in withTableData HOC wrapping ${componentName} (table id: ${id}): ${error.message}`
      );
      enhancedError.originalError = error;
      enhancedError.componentName = componentName;
      enhancedError.tableId = id;
      enhancedError.stack = error.stack;

      console.error(`[withTableData HOC] Error in ${componentName}:`, {
        componentName,
        tableId: id,
        originalError: error,
        props: props,
      });

      throw enhancedError;
    }
  }

  EnhancedComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    isDraggable: PropTypes.bool,
  };

  // Set display name for better debugging in React DevTools
  EnhancedComponent.displayName = `withTableData(${componentName})`;

  return EnhancedComponent;
}

withTableData.propTypes = {
  WrappedComponent: PropTypes.elementType.isRequired,
};

// EnhancedComponent prop types
export const EnhancedComponentPropTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
