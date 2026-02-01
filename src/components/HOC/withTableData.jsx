/**
 * @fileoverview Higher-order component (HOC) that provides table data and actions
 * to the wrapped component via props. This includes table metadata, child column
 * data, and functions to manipulate the table and its columns.
 *
 * Exports a function `withTableData` that takes a component and returns
 * an enhanced component with table data props.
 *
 * @module components/HOC/withTableData
 */
import { useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";

import { selectSelectedColumnIdsByParentId } from "../../slices/columnsSlice";
import {
  setSelectedColumnIds,
  setFocusedColumnIds,
  removeFromHiddenColumnIds,
  selectSelectedTableIds,
} from "../../slices/uiSlice";
import { selectTablesById } from "../../slices/tablesSlice";

import { deleteTablesRequest } from "../../sagas/deleteTablesSaga";
import { updateTablesRequest } from "../../sagas/updateTablesSaga";
import { insertColumnsRequest } from "../../sagas/createColumnsSaga";
import { setFocusedObjectId } from "../../slices/uiSlice";
import { deleteColumnsRequest } from "../../sagas/deleteColumnsSaga/actions";
import { selectHiddenColumnIdsByParentId } from "../../slices/columnsSlice/selectors";

/**
 * @typedef {Object} TableDataProps
 * @property {string} id - The ID of the table
 * @property {string|null} parentId - The parent ID of the table, if any
 * @property {boolean} isInSchema - Whether the table is part of the current schema
 * @property {string} source - The source of the table (e.g., file path, database)
 * @property {string} databaseName - The name of the database table
 * @property {string} name - The name of the table
 * @property {string} fileName - The file name of the table, if applicable
 * @property {string} extension - The file extension of the table, if applicable
 * @property {number} size - The size of the table in bytes
 * @property {string} mimeType - The MIME type of the table, if applicable
 * @property {Date} dateLastModified - The date the table was last modified
 * @property {number} rowCount - The number of rows in the table
 * @property {function(string): void} setTableName - Function to set the table name
 * @property {function(): void} deleteTable - Function to delete the table
 * @property {Array<string>} columnIds - The IDs of the child columns of the table
 * @property {Array<string>} selectedColumnIds - The IDs of the currently selected columns
 * @property {Array<string>} hiddenColumnIds - The IDs of the currently hidden columns
 * @property {number} columnCount - The number of columns in the table
 * @property {function(Array<string>): void} selectColumns - Function to select columns
 * @property {function(string, string): void} swapColumns - Function to swap two columns
 * @property {function(number, {name: string, fillValue: any}): void} insertColumn - Function to insert a new column
 * @property {function(Array<string>): void} deleteColumns - Function to delete columns
 * @property {function(Array<string>): void} focusColumns - Function to focus specific columns
 */

/**
 * @function withTableData
 * @template T
 * @param {React.ComponentType<T & TableDataProps>} WrappedComponent - The component to be enhanced
 * @returns {React.ComponentType<T & TableDataProps>} Enhanced component with table data props
 */
export default function withTableData(WrappedComponent) {
  const componentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    // Get table data from the Redux store
    const table = useSelector((state) => selectTablesById(state, id));
    const allOperationIds = useSelector((state) => state.operations.allIds);

    const operationIndex = allOperationIds.findIndex((opId) =>
      table ? opId === table.parentId : false,
    );

    // Table identity and metadata
    // ------------------------------------------------------------

    /**
     * The parent ID of the table, if any
     * @returns {string|null} The parent ID of the table
     */
    const parentId = useMemo(() => table.parentId, [table.parentId]);

    /**
     * Whether the table is part of the current schema (has an operation)
     * @returns {boolean} True if the table is part of the schema, false otherwise
     */
    const isInSchema = useMemo(() => parentId !== null, [parentId]);

    const selectedTableIds = useSelector(selectSelectedTableIds);
    const isSelected = useMemo(
      () => selectedTableIds.includes(id),
      [selectedTableIds, id],
    );

    /**
     * The source of the table (e.g., file path, database)
     * @returns {string} The source of the table
     */
    const source = useMemo(() => table.source, [table.source]);

    /**
     * The name of the database table associated with this object
     * @returns {string} The database name of the table
     */
    const databaseName = useMemo(
      () => table.databaseName,
      [table.databaseName],
    );

    /**
     * The name of the table, user defined
     * @returns {string} The name of the table
     */
    const name = useMemo(() => table.name, [table.name]);

    /**
     * The file name of the table, if applicable
     * @returns {string} The file name of the table
     */
    const fileName = useMemo(() => table.fileName, [table.fileName]);

    /**
     * The file extension of the table, if applicable
     * @returns {string} The file extension of the table
     */
    const extension = useMemo(() => table.extension, [table.extension]);

    /**
     * The size of the table in bytes
     * @returns {number} The size of the table in bytes
     */
    const size = useMemo(() => table.size, [table.size]);

    /**
     * The MIME type of the table, if applicable
     * @returns {string} The MIME type of the table
     */
    const mimeType = useMemo(() => table.mimeType, [table.mimeType]);

    /**
     * The date the table was last modified
     * @returns {Date} The date the table was last modified
     */
    const dateLastModified = useMemo(
      () => table.dateLastModified,
      [table.dateLastModified],
    );

    /**
     * The number of rows in the table
     * @returns {number} The number of rows in the table
     */
    const rowCount = useMemo(() => table.rowCount, [table.rowCount]);

    /**
     * @function setTableName
     * Set the name of the table
     * @param {string} name - The new name of the table
     * @returns {void}
     */
    const setTableName = useCallback(
      (name) => {
        dispatch(
          updateTablesRequest({
            tableUpdates: [{ id, name }],
          }),
        );
      },
      [dispatch, id],
    );

    /**
     * @function focusTable
     * Focus the table in the UI
     * @returns {void}
     */
    const focusTable = useCallback(() => {
      dispatch(setFocusedObjectId(id));
    }, [dispatch, id]);

    /**
     * @function removeTableFromSchema
     * Remove the table from the current schema, but does not delete the table itself
     * @returns {void}
     */
    const removeTableFromSchema = useCallback(() => {
      // TODO
    }, []);

    /**
     * @function deleteTable
     * Delete the table
     * @returns {void}
     */
    const deleteTable = useCallback(() => {
      dispatch(deleteTablesRequest([id]));
    }, [dispatch, id]);

    // Child columns
    // ------------------------------------------------------------

    /**
     * The column IDs of the table
     * @returns {Array<string>} The column IDs of the table
     */
    const columnIds = useMemo(() => table.columnIds, [table.columnIds]);

    // Current number of non-hided columns
    const columnCount = useMemo(() => columnIds.length, [columnIds]);

    // Selected columns (only changes when selection changes)
    // TODO: do I still need this?
    const selectedColumnIds = useSelector((state) =>
      selectSelectedColumnIdsByParentId(state, id),
    );

    // Hidden columns (only changes when hidden columns change)
    const hiddenColumnIds = useSelector((state) =>
      selectHiddenColumnIdsByParentId(state, id),
    );

    /**
     * @function selectColumns
     * Select columns in the table
     * @param {Array<string>} selectedColumnIds - The IDs of the columns to select
     * @returns {void}
     */
    const selectColumns = useCallback(
      (selectedColumnIds) => {
        dispatch(setSelectedColumnIds(selectedColumnIds));
      },
      [dispatch],
    );

    /**
     * @function swapColumns
     * Swap two columns in the table
     * @param {string} target - The ID of the target column
     * @param {string} source - The ID of the source column
     * @returns {void}
     */
    const swapColumns = useCallback(
      (target, source) => {
        const sourceIndex = columnIds.indexOf(source);
        const targetIndex = columnIds.indexOf(target);
        if (sourceIndex === -1 || targetIndex === -1) {
          throw new Error(
            `Invalid column IDs for swapping: source (${source}) or target (${target}) not found in active columns of table ${id}.`,
          );
        }
        const nextColumnIds = [...columnIds];
        nextColumnIds[sourceIndex] = target;
        nextColumnIds[targetIndex] = source;

        dispatch(
          updateTablesRequest({
            tableUpdates: [
              {
                id,
                columnIds: nextColumnIds,
              },
            ],
          }),
        );
      },
      [dispatch, columnIds, id],
    );

    /**
     * @function insertColumn
     * Insert a new column into the table at the specified index
     * @param {number} index - The index to insert the column at
     * @param {{name: string, fillValue: any}} param1 - The column details
     * @returns {void}
     */
    const insertColumn = useCallback(
      (index, { name, fillValue }) => {
        dispatch(
          insertColumnsRequest([{ parentId: id, index, name, fillValue }]),
        );
      },
      [dispatch, id],
    );

    /**
     * @function deleteColumns
     * Delete columns from the table
     * @param {Array<string>} columnIdsToDelete - The IDs of the columns to delete
     * @returns {void}
     */
    const deleteColumns = useCallback(
      (columnIdsToDelete) => dispatch(deleteColumnsRequest(columnIdsToDelete)),
      [dispatch],
    );

    /**
     * @function focusColumns
     * Focus specific columns in the table
     * @param {Array<string>} colIds - The IDs of the columns to focus
     * @returns {void}
     */
    const focusColumns = useCallback(
      (colIds) => dispatch(setFocusedColumnIds(colIds)),
      [dispatch],
    );

    const unhideColumns = useCallback(
      (colIds) => {
        dispatch(removeFromHiddenColumnIds(colIds));
      },
      [dispatch],
    );

    return (
      <WrappedComponent
        id={id}
        // Identity and metadata
        parentId={parentId}
        isInSchema={isInSchema}
        isSelected={isSelected}
        source={source}
        databaseName={databaseName}
        name={name}
        fileName={fileName}
        operationIndex={operationIndex}
        extension={extension}
        size={size}
        mimeType={mimeType}
        dateLastModified={dateLastModified}
        rowCount={rowCount}
        setTableName={setTableName}
        focusTable={focusTable}
        removeTableFromSchema={removeTableFromSchema}
        deleteTable={deleteTable}
        // Child columns
        columnIds={columnIds}
        selectedColumnIds={selectedColumnIds}
        hiddenColumnIds={hiddenColumnIds}
        columnCount={columnCount}
        selectColumns={selectColumns}
        swapColumns={swapColumns}
        insertColumn={insertColumn}
        deleteColumns={deleteColumns}
        focusColumns={focusColumns}
        unhideColumns={unhideColumns}
        {...props}
      />
    );
  }

  // Set display name for better debugging in React DevTools
  EnhancedComponent.displayName = `withTableData(${componentName})`;

  // Wrap EnhancedComponent with withAssociatedAlerts
  // Note: Memoization should be applied at the individual component level
  return EnhancedComponent;
}
