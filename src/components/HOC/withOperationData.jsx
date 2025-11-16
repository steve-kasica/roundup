/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import {
  selectOperationsById,
  selectOperationDepthById,
  selectOperationChildRowCounts,
  updateOperations,
  isOperationId,
} from "../../slices/operationsSlice";
import { useDispatch } from "react-redux";
import {
  selectActiveColumnIdsByParentId,
  selectColumnIdsByParentId,
  selectSelectedColumnIdsByParentId,
} from "../../slices/columnsSlice";
import {
  setFocusedColumnIds,
  setFocusedObjectId,
  setSelectedColumnIds,
  setVisibleColumnIds as setVisibleColumnsAction,
} from "../../slices/uiSlice/uiSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga/actions";
import { useCallback, useMemo } from "react";
import {
  createColumnsRequest,
  CREATION_MODE_INSERTION,
} from "../../sagas/createColumnsSaga";
import withAssociatedAlerts from "./withAssociatedAlerts";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import { group } from "d3";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { updateTablesRequest } from "../../sagas/updateTablesSaga";

export default function withOperationData(WrappedComponent) {
  function EnhancedComponent({
    id,
    alertIds,
    hasAlerts,
    deleteAlerts,
    silenceAlerts,
    ...props
  }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperationsById(state, id));
    const depth = useSelector((state) => selectOperationDepthById(state, id));

    // Get columnIds associated with this table, both active and "removed"
    const columnIds = useSelector((state) =>
      selectColumnIdsByParentId(state, id)
    );

    // Get columnIds of child tables that are active (not excluded)
    const activeChildColumnIds = useSelector((state) =>
      selectActiveColumnIdsByParentId(state, operation.childIds)
    );

    // Get active columnIds of child tables that are selected
    const selectedChildColumnIds = useSelector((state) =>
      selectSelectedColumnIdsByParentId(state, operation.childIds)
    );

    const activeColumnIds = operation.columnIds;

    const removedColumnIds = useMemo(() => {
      return columnIds.filter((colId) => !activeColumnIds.includes(colId));
    }, [columnIds, activeColumnIds]);

    // Column objects for all columns associated directly with this operation
    // TODO: should this be a selector of should the selector draw straight
    // from the ui source, then we memoize a calculation upon it?
    const selectedColumnIds = useSelector((state) =>
      selectSelectedColumnIdsByParentId(state, id)
    );

    const focusedObjectId = useSelector(selectFocusedObjectId);

    const childRowCounts = useSelector((state) =>
      selectOperationChildRowCounts(state, id)
    );

    const isFocused = focusedObjectId === id;
    const isHovered = false; // TODO

    // Define callback functions used by all operation types
    // ----------------------------------------------------------------------------
    const setVisibleColumns = useCallback(
      (columnIds) => {
        dispatch(setVisibleColumnsAction(columnIds));
      },
      [dispatch]
    );

    const selectColumns = useCallback(
      (columnIds) => dispatch(setSelectedColumnIds(columnIds)),
      [dispatch]
    );

    const clearSelectedColumns = useCallback(() => {
      dispatch(setSelectedColumnIds([]));
    }, [dispatch]);

    const insertColumnIntoChildAtIndex = useCallback(
      (childTableId, targetIndex) => {
        dispatch(
          createColumnsRequest({
            mode: CREATION_MODE_INSERTION,
            columnInfo: [{ parentId: childTableId, index: targetIndex }],
          })
        );
      },
      [dispatch]
    );

    const focusColumns = useCallback(
      (colIds) => dispatch(setFocusedColumnIds(colIds)),
      [dispatch]
    );

    const swapTablePositions = useCallback(
      (aIndex, bIndex) => {
        const updatedChildren = [...(operation.childIds || [])];
        // Swap the two table IDs
        [updatedChildren[aIndex], updatedChildren[bIndex]] = [
          updatedChildren[bIndex],
          updatedChildren[aIndex],
        ];
        dispatch(
          updateOperations({
            id,
            childIds: updatedChildren,
          })
        );
      },
      [dispatch, id, operation.childIds]
    );

    // TODO
    const excludeColumns = useCallback(
      (columnIdsToExclude) => {
        const columnIdsToExcludeByParentId = Array.from(
          group(columnIdsToExclude, (columnId) => {
            let parentId = null;
            for (const childColumns of activeChildColumnIds) {
              if (childColumns.includes(columnId)) {
                parentId =
                  operation.childIds[
                    activeChildColumnIds.indexOf(childColumns)
                  ];
                break;
              }
            }
            return parentId;
          }),
          ([parentId, columnIds]) => ({ parentId, columnIds })
        );

        const columnIdsToIncludeByParentId = columnIdsToExcludeByParentId.map(
          ({ parentId, columnIds }) => {
            const activeColumnIds =
              activeChildColumnIds[operation.childIds.indexOf(parentId)];
            return {
              id: parentId,
              columnIds: activeColumnIds.filter(
                (colId) => !columnIds.includes(colId)
              ),
            };
          }
        );

        const tableUpdates = columnIdsToIncludeByParentId.filter(({ id }) =>
          isTableId(id)
        );
        const operationUpdates = columnIdsToIncludeByParentId.filter(({ id }) =>
          isOperationId(id)
        );

        if (tableUpdates.length > 0) {
          dispatch(updateTablesRequest({ tableUpdates }));
        }
        if (operationUpdates.length > 0) {
          dispatch(updateOperationsRequest({ operationUpdates }));
        }
        dispatch(setSelectedColumnIds([]));
      },
      [activeChildColumnIds, dispatch, operation.childIds]
    );

    const materializeOperation = useCallback(
      () =>
        dispatch(
          updateOperationsRequest({
            operationUpdates: [{ id, isMaterialized: null }],
          })
        ),
      [dispatch, id]
    );

    /**
     * Sets the currently focused operation by dispatching the setFocusedObjectId action
     * with the provided operation ID.
     *
     * @function
     * @returns {void}
     */
    const focusOperation = useCallback(
      () => dispatch(setFocusedObjectId(id)),
      [dispatch, id]
    );

    return (
      <WrappedComponent
        // Pass along props directly from the parent component
        {...props}
        id={id}
        // Props via this HOC
        operation={operation}
        name={operation.name}
        databaseName={operation.databaseName}
        operationType={operation.operationType}
        childIds={operation.childIds}
        doesViewExist={operation.doesViewExist}
        isMaterialized={operation.isMaterialized}
        isInSync={operation.isInSync}
        activeChildColumnIds={activeChildColumnIds}
        selectedChildColumnIds={selectedChildColumnIds}
        childRowCounts={childRowCounts}
        depth={depth}
        // Pack-related operations
        joinKey1={operation.joinKey1}
        joinKey2={operation.joinKey2}
        joinPredicate={operation.joinPredicate}
        joinType={operation.joinType}
        // Directly associated columns
        columnIds={columnIds} // All column IDs associated with this operation
        activeColumnIds={activeColumnIds} // columns not excluded
        selectedColumnIds={selectedColumnIds}
        removedColumnIds={removedColumnIds} // TODO: @deprecated?
        // Row stuff
        rowCount={operation.rowCount}
        // Directly associated alerts (from withAssociatedAlerts)
        alertIds={alertIds}
        hasAlerts={hasAlerts}
        deleteAlerts={deleteAlerts}
        silenceAlerts={silenceAlerts}
        // Interaction props (TODO, is this deprecated?)
        isFocused={isFocused}
        isHovered={isHovered}
        // Interaction handlers
        onHover={() => {}} // TODO
        onUnhover={() => {}} // TODO
        // Operation specific callbacks
        swapTablePositions={swapTablePositions}
        renameOperation={(newName) =>
          dispatch(updateOperations({ id, name: newName }))
        }
        setName={(name) =>
          dispatch(
            updateOperationsRequest({ operationUpdates: [{ id, name }] })
          )
        }
        focusOperation={focusOperation}
        setOperationType={(operationType) =>
          dispatch(
            updateOperationsRequest({
              operationUpdates: [
                {
                  id,
                  operationType,
                },
              ],
            })
          )
        }
        materializeOperation={materializeOperation}
        // Callback function related to columns
        selectColumns={selectColumns}
        excludeColumns={excludeColumns}
        clearSelectedColumns={clearSelectedColumns}
        insertColumnIntoChildAtIndex={insertColumnIntoChildAtIndex}
        setVisibleColumns={setVisibleColumns}
        focusColumns={focusColumns}
      />
    );
  }

  // Wrap the EnhancedComponent with withAssociatedAlerts to inject alert props
  return withAssociatedAlerts(EnhancedComponent);
}
