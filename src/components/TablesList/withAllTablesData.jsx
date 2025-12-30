/**
 * @fileoverview withAllTablesData HOC
 *
 * A Higher-Order Component that provides comprehensive table management data and
 * actions to wrapped components. Injects Redux-connected table data, statistics,
 * and action dispatchers for table and operation management.
 *
 * Injected props:
 * - tables: Array of all table objects
 * - selectedTableIds: Currently selected table IDs
 * - setSelectedTableIds: Update selection
 * - rowMax/columnMax/bytesMax: Statistics for scaling
 * - createTables: Create new tables
 * - deleteTables: Delete tables
 * - addNewOperation: Create operation with tables
 *
 * @module components/TablesList/withAllTablesData
 *
 * @example
 * const EnhancedComponent = withAllTablesData(MyComponent);
 */

import { useSelector } from "react-redux";
import { selectAllTablesData } from "../../slices/tablesSlice";
import { useCallback, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { createTablesRequest } from "../../sagas/createTablesSaga";
import { deleteTablesRequest } from "../../sagas/deleteTablesSaga";
import { createOperationsRequest } from "../../sagas/createOperationsSaga/actions";
import { selectRootOperationId } from "../../slices/operationsSlice";

/**
 * withAllTablesData HOC
 *
 * Wraps a component with table data and management functions.
 *
 * @function
 * @param {React.Component} WrappedComponent - Component to enhance
 * @returns {React.Component} Enhanced component with table data props
 */
const withAllTablesData = (WrappedComponent) => {
  return function EnhancedComponent(props) {
    const dispatch = useDispatch();
    const tables = useSelector(selectAllTablesData);
    const rootOperationId = useSelector(selectRootOperationId);
    const [selectedTableIds, setSelectedTableIds] = useState([]); // TODO: delete this?
    const rowMax = useMemo(
      () => Math.max(0, ...tables.map((table) => table.rowCount)),
      [tables]
    );
    const columnMax = useMemo(
      () => Math.max(0, ...tables.map((table) => table.columnIds.length)),
      [tables]
    );
    const bytesMax = useMemo(
      () => Math.max(0, ...tables.map((table) => table.size)),
      [tables]
    );
    const createTables = useCallback(
      (tablesInfo) => {
        dispatch(createTablesRequest({ tablesInfo }));
      },
      [dispatch]
    );

    const deleteTables = useCallback(
      (tableIds) => dispatch(deleteTablesRequest({ tableIds })),
      [dispatch]
    );

    const addNewOperation = useCallback(
      (operationType, tableIds) => {
        const childIds = (rootOperationId ? [rootOperationId] : []).concat(
          tableIds
        );
        dispatch(
          createOperationsRequest({
            operationData: { operationType, childIds },
          })
        );
      },
      [dispatch, rootOperationId]
    );

    return (
      <WrappedComponent
        {...props}
        tables={tables}
        selectedTableIds={selectedTableIds}
        setSelectedTableIds={setSelectedTableIds}
        rowMax={rowMax}
        columnMax={columnMax}
        bytesMax={bytesMax}
        createTables={createTables}
        deleteTables={deleteTables}
        addNewOperation={addNewOperation}
      />
    );
  };
};

export default withAllTablesData;
