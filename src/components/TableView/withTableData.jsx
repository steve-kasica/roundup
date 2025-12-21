/* eslint-disable react/prop-types */
import { shallowEqual, useDispatch, useSelector } from "react-redux";
import { useCallback, useMemo } from "react";

import {
  selectOperationDepthById,
  selectOperationIdByChildId,
} from "../../slices/operationsSlice";
import {
  selectColumnIdsByParentId,
  selectSelectedColumnIdsByParentId,
} from "../../slices/columnsSlice";
import {
  setSelectedColumnIds,
  setFocusedColumnIds,
} from "../../slices/uiSlice";
import { setVisibleColumnIds as setVisibleColumnsAction } from "../../slices/uiSlice/uiSlice";
import {
  selectTableColumnIds,
  selectTablesById,
} from "../../slices/tablesSlice";

import { deleteTablesRequest } from "../../sagas/deleteTablesSaga";
import { updateTablesRequest } from "../../sagas/updateTablesSaga";
import {
  createColumnsRequest,
  CREATION_MODE_INSERTION,
} from "../../sagas/createColumnsSaga";
import { setFocusedObjectId } from "../../slices/uiSlice";
import withAssociatedAlerts from "../HOC/withAssociatedAlerts";
import { deleteColumnsRequest } from "../../sagas/deleteColumnsSaga/actions";

export default function withTableData(WrappedComponent) {
  const componentName =
    WrappedComponent.displayName || WrappedComponent.name || "Component";

  function EnhancedComponent({
    // Props passed from withAssociatedAlerts
    alertIds,
    totalCount,
    deleteAlerts,
    silenceAlerts,
    // Props passed directly from parent
    id,
    ...props
  }) {
    const dispatch = useDispatch();

    // Get table data from the Redux store
    const table = useSelector((state) => selectTablesById(state, id));

    // Get IDs of all columns associated with this specific table
    const columnIds = useSelector(
      (state) => selectColumnIdsByParentId(state, id),
      shallowEqual
    );

    // Active columns (only changes when exclusion changes)
    const activeColumnIds = useSelector(
      (state) => selectTableColumnIds(state, id),
      shallowEqual
    );

    // Selected columns (only changes when selection changes)
    const selectedColumnIds = useSelector(
      (state) => selectSelectedColumnIdsByParentId(state, id),
      shallowEqual
    );

    // Get related operation data from the Redux store, if any
    const parentOperationId = useSelector((state) =>
      selectOperationIdByChildId(state, id)
    );

    const depth = useSelector((state) =>
      selectOperationDepthById(state, parentOperationId)
    );

    // Callback functions to handle interactions
    // ===========================================
    const selectColumns = useCallback(
      (selectedColumnIds) => {
        dispatch(setSelectedColumnIds(selectedColumnIds));
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
        const nextColumnIds = [...activeColumnIds];
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
          })
        );
      },
      [dispatch, activeColumnIds, id]
    );

    const hideColumns = useCallback(
      (hiddenColumnIds) => {
        dispatch(
          updateTablesRequest({ tableUpdates: [{ id, hiddenColumnIds }] })
        );
      },
      [dispatch, id]
    );

    const unhideColumns = useCallback(
      (columnIdsToUnhide) => {
        dispatch(
          updateTablesRequest({
            tableUpdates: [
              {
                id,
                hiddenColumnIds: table.hiddenColumnIds.filter(
                  (hid) => !columnIdsToUnhide.includes(hid)
                ),
              },
            ],
          })
        );
      },
      [dispatch, id, table.hiddenColumnIds]
    );

    const deleteColumns = useCallback(
      (columnIdsToDelete) =>
        dispatch(deleteColumnsRequest({ columnIds: columnIdsToDelete })),
      [dispatch]
    );

    const setVisibleColumns = useCallback(
      (columnIds) => {
        dispatch(setVisibleColumnsAction(columnIds));
      },
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

    const insertColumn = useCallback(
      (index, { name, fillValue }) => {
        dispatch(
          createColumnsRequest({
            mode: CREATION_MODE_INSERTION,
            columnLocations: [
              {
                parentId: id,
                index,
                fillValue,
                name,
              },
            ],
          })
        );
      },
      [dispatch, id]
    );

    const focusTable = useCallback(() => {
      dispatch(setFocusedObjectId(id));
    }, [dispatch, id]);

    const focusColumns = useCallback(
      (colIds) => dispatch(setFocusedColumnIds(colIds)),
      [dispatch]
    );

    // Current number of non-hided columns
    const columnCount = useMemo(
      () => activeColumnIds.length,
      [activeColumnIds]
    );

    const displayColumnIds = useMemo(
      () =>
        activeColumnIds.reduce((acc, columnId, index) => {
          if (!table.hiddenColumnIds.includes(columnId)) {
            acc.push({ columnId, index });
          } else if (acc[index - 1] !== null) {
            acc.push(null);
          }
          return acc;
        }, []),
      [activeColumnIds, table.hiddenColumnIds]
    );

    // Number of columns when table was initialized
    const initialColumnCount = useMemo(() => columnIds.length, [columnIds]);

    // Number of columns that have been hided
    const removedColumnCount = useMemo(
      () => initialColumnCount - columnCount,
      [initialColumnCount, columnCount]
    );

    // Determine if the table is part of the current schema (has an operation)
    const isInSchema = useSelector(
      (state) => selectOperationIdByChildId(state, id) !== undefined
    );

    return (
      <WrappedComponent
        {...props}
        id={id}
        // Props from withAssociatedAlerts
        alertIds={alertIds}
        totalCount={totalCount}
        deleteAlerts={deleteAlerts}
        silenceAlerts={silenceAlerts}
        // Table properties
        parentId={table.parentId}
        source={table.source}
        databaseName={table.databaseName}
        name={table.name}
        fileName={table.fileName}
        extension={table.extension}
        size={table.size}
        mimeType={table.mimeType}
        dateLastModified={table.dateLastModified}
        rowCount={table.rowCount}
        activeColumnIds={activeColumnIds}
        parentOperationId={parentOperationId} // TODO: should only pass Ids
        isInSchema={isInSchema}
        depth={depth}
        columnIds={columnIds}
        activeColumnsCount={activeColumnIds.length}
        selectedColumnIds={selectedColumnIds}
        hiddenColumnIds={table.hiddenColumnIds}
        displayColumnIds={displayColumnIds}
        initialColumnCount={initialColumnCount}
        columnCount={columnCount}
        removedColumnCount={removedColumnCount}
        // Interaction handlers
        selectColumns={selectColumns}
        swapColumns={swapColumns}
        hideColumns={hideColumns}
        unhideColumns={unhideColumns}
        deleteColumns={deleteColumns}
        focusColumns={focusColumns}
        setTableName={setTableName}
        setVisibleColumns={setVisibleColumns}
        removeTableFromSchema={removeTableFromSchema}
        focusTable={focusTable}
        deleteTable={deleteTable}
        insertColumn={insertColumn}
      />
    );
  }

  // Set display name for better debugging in React DevTools
  EnhancedComponent.displayName = `withTableData(${componentName})`;

  // Wrap EnhancedComponent with withAssociatedAlerts
  // Note: Memoization should be applied at the individual component level
  return withAssociatedAlerts(EnhancedComponent);
}
