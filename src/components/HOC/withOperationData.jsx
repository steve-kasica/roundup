/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import {
  selectOperationsById,
  selectOperationDepthById,
  updateOperations,
} from "../../slices/operationsSlice";
import { useDispatch } from "react-redux";
import {
  selectColumnIdsByParentId,
  selectSelectedColumnIdsByParentId,
} from "../../slices/columnsSlice";
import {
  setFocusedColumnIds,
  setSelectedColumnIds,
  setVisibleColumnIds as setVisibleColumnsAction,
} from "../../slices/uiSlice/uiSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga/actions";
import { useCallback, useMemo } from "react";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";
import {
  createColumnsRequest,
  CREATION_MODE_INSERTION,
} from "../../sagas/createColumnsSaga";
import { materializeOperationRequest } from "../../sagas/materializeOperationSaga/actions";
import withAssociatedAlerts from "./withAssociatedAlerts";
import { selectFocusedObjectId } from "../../slices/uiSlice";

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

    const activeColumnIds = operation.columnIds;

    const removedColumnIds = useMemo(() => {
      return columnIds.filter((colId) => !activeColumnIds.includes(colId));
    }, [columnIds, activeColumnIds]);

    // Column objects for all columns associated directly with this operation
    const selectedColumnIds = useSelector((state) =>
      selectSelectedColumnIdsByParentId(state, id)
    );

    const focusedObjectId = useSelector(selectFocusedObjectId);

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
      (columnIds) =>
        dispatch(
          updateColumnsRequest({
            columnUpdates: [
              ...columnIds.filter(Boolean).map((id) => ({
                id,
                isSelected: true,
              })),
            ],
          })
        ),
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
    const excludeColumns = useCallback((columnIds) => null, [dispatch]);

    const materializeOperation = useCallback(
      () => dispatch(materializeOperationRequest({ operationId: id })),
      [dispatch, id]
    );

    return (
      <WrappedComponent
        // Pass along props directly from the parent component
        {...props}
        id={id} // Need to pass id explicitly
        // Props derived in this HOC
        operation={operation}
        name={operation.name}
        operationType={operation.operationType}
        childIds={operation.childIds}
        doesViewExist={operation.doesViewExist}
        depth={depth}
        // Directly associated columns
        columnIds={columnIds} // All column IDs associated with this operation
        activeColumnIds={activeColumnIds} // columns not excluded
        columnCount={activeColumnIds.length || operation.columnCount}
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
        focusOperation={() =>
          dispatch(
            updateOperationsRequest({
              operationUpdates: [{ id, isFocused: true }],
            })
          )
        }
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
