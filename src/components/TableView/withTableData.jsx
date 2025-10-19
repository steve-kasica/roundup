import { shallowEqual, useDispatch, useSelector } from "react-redux";
import PropTypes from "prop-types";
import { useCallback } from "react";

import {
  selectOperationDepth,
  selectOperation,
} from "../../slices/operationsSlice";
import {
  excludeColumnFromTable,
  selectActiveColumnIdsByTableId,
  selectColumnIdsByTableId,
  selectSelectedColumnDBNamesByTableId,
  selectSelectedColumnIdsByTableId,
} from "../../slices/columnsSlice";
import { selectTablesById } from "../../slices/tablesSlice";

import { deleteTablesRequest } from "../../sagas/deleteTablesSaga";
import { updateTablesRequest } from "../../sagas/updateTablesSaga";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";

export default function withTableData(WrappedComponent) {
  const componentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    try {
      // Get table data from the Redux store
      const table = useSelector((state) => selectTablesById(state, id));

      // Columns associated with this specific table
      const columnIds = useSelector(
        (state) => selectColumnIdsByTableId(state, id),
        shallowEqual
      );

      // Active columns (only changes when exclusion changes)
      const activeColumnIds = useSelector(
        (state) => selectActiveColumnIdsByTableId(state, id),
        shallowEqual
      );

      // Selected columns (only changes when selection changes)
      const selectedColumnIds = useSelector(
        (state) => selectSelectedColumnIdsByTableId(state, id),
        shallowEqual
      );

      // Selected column names (only changes when selection changes)
      const selectedColumnNames = useSelector(
        (state) => selectSelectedColumnDBNamesByTableId(state, id),
        shallowEqual
      );

      // Get related operation data from the Redux store, if any
      const parentOperation = useSelector((state) =>
        table.operationId ? selectOperation(state, table.operationId) : null
      );
      const depth = useSelector((state) =>
        table.operationId
          ? selectOperationDepth(state, table.operationId)
          : null
      );

      // Functions to handle interactions
      const handleSelectColumns = useCallback(
        (selectedColumnIds) => {
          dispatch(
            updateColumnsRequest({
              columnUpdates: selectedColumnIds.map((id) => ({
                id,
                isSelected: true,
              })),
            })
          );
        },
        [dispatch]
      );

      const swapColumns = useCallback(
        (target, source) => {
          const sourceIndex = activeColumnIds.indexOf(source);
          const targetIndex = activeColumnIds.indexOf(target);
          if (sourceIndex === -1 || targetIndex === -1) {
            throw new Error(
              `Invalid column IDs for swapping: source (${source}) or target (${target}) not found in active columns of table ${id}.`
            );
          }
          dispatch(
            updateColumnsRequest({
              columnUpdates: [
                { id: source, index: targetIndex },
                { id: target, index: sourceIndex },
              ],
            })
          );
        },
        [dispatch, activeColumnIds, id]
      );

      const excludeColumns = useCallback(
        (columnIds) => dispatch(excludeColumnFromTable(columnIds)),
        [dispatch]
      );

      const setTableName = useCallback(
        (name) => {
          dispatch(
            updateTablesRequest({
              tableUpdates: [{ id, name }],
            })
          );
        },
        [dispatch, id]
      );

      const removeTableFromSchema = useCallback(() => {
        // TODO
      }, []);

      const deleteTable = useCallback(() => {
        dispatch(deleteTablesRequest([id]));
      }, [dispatch, id]);

      const focusTable = useCallback(() => {}, []);

      // Current number of non-excluded columns
      const columnCount = activeColumnIds.length;

      // Number of columns when table was initialized
      const initialColumnCount = columnIds.length;

      // Number of columns that have been excluded
      const removedColumnCount = initialColumnCount - columnCount;

      // Determine if the table is part of the current schema (has an operation)
      const isInSchema = table.operationId !== null;

      return (
        <WrappedComponent
          {...props}
          // Table properties
          table={table}
          rowCount={table.rowCount.toLocaleString()}
          parentOperation={parentOperation} // TODO: should only pass Ids
          isInSchema={isInSchema}
          depth={depth}
          columnIds={columnIds}
          activeColumnIds={activeColumnIds}
          selectedColumnIds={selectedColumnIds}
          initialColumnCount={initialColumnCount}
          columnCount={columnCount}
          removedColumnCount={removedColumnCount}
          selectedColumnNames={selectedColumnNames} // necessary for DB hooks
          // Interaction handlers
          selectColumns={handleSelectColumns}
          swapColumns={swapColumns}
          excludeColumns={excludeColumns}
          setTableName={setTableName}
          removeTableFromSchema={removeTableFromSchema}
          focusTable={focusTable}
          deleteTable={deleteTable}
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
