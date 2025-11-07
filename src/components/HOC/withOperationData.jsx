/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import {
  selectOperation,
  selectOperationDepth,
  selectFocusedOperationId,
  setHoveredOperation,
  selectHoveredOperation,
  updateOperations,
} from "../../slices/operationsSlice";
import { useDispatch } from "react-redux";
import { setPeekedTable } from "../../slices/uiSlice";
import {
  excludeColumnFromTable,
  selectColumnIdsByTableId,
  selectRemovedColumnIdsByTableId,
  selectSelectedChildColumnsByOperationId,
  selectSelectedColumnDBNamesByTableId,
  selectSelectedColumnIdsByTableId,
  setFocusedColumnIds,
  setSelectedColumnIds,
  setVisibleColumns as setVisibleColumnsAction,
} from "../../slices/columnsSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga/actions";
import { useCallback, useMemo } from "react";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";
import {
  createColumnsRequest,
  CREATION_MODE_INSERTION,
} from "../../sagas/createColumnsSaga";
import { materializeOperationRequest } from "../../sagas/materializeOperationSaga/actions";
import withAssociatedAlerts from "./withAssociatedAlerts";

export default function withOperationData(WrappedComponent) {
  function EnhancedComponent({
    id,
    alertIds,
    hasAlerts,
    removeAlerts,
    silenceAlerts,
    ...props
  }) {
    const dispatch = useDispatch();

    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    const focusedOperationId = useSelector(selectFocusedOperationId);
    const hoveredOperationId = useSelector(selectHoveredOperation);
    const columnIds = useSelector(
      (state) => selectColumnIdsByTableId(state, id) // TODO, generalize name for operations too
    );
    // Get columnIds associated with this table, both active and "removed"
    const removedColumnIds = useSelector(
      (state) => selectRemovedColumnIdsByTableId(state, id) // TODO, generalize name for operations too
    );

    const selectedChildColumns = useSelector((state) =>
      selectSelectedChildColumnsByOperationId(state, id)
    );

    // Column objects for all columns associated directly with this operation
    const selectedColumnIds = useSelector((state) =>
      selectSelectedColumnIdsByTableId(state, id)
    );

    const selectedColumnNames = useSelector((state) =>
      selectSelectedColumnDBNamesByTableId(state, id)
    );

    // Use useMemo to ensure activeColumnIds updates when table.columnIds or removedColumnIds change
    const activeColumnIds = useMemo(
      () =>
        columnIds.filter((columnId) => !removedColumnIds.includes(columnId)),
      [columnIds, removedColumnIds]
    );

    const isFocused = operation.id === focusedOperationId;
    const isHovered = operation.id === hoveredOperationId;

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
        const updatedChildren = [...(operation.children || [])];
        // Swap the two table IDs
        [updatedChildren[aIndex], updatedChildren[bIndex]] = [
          updatedChildren[bIndex],
          updatedChildren[aIndex],
        ];
        dispatch(
          updateOperations({
            id,
            children: updatedChildren,
          })
        );
      },
      [dispatch, id, operation.children]
    );

    const excludeColumns = useCallback(
      (columnIds) => dispatch(excludeColumnFromTable(columnIds)),
      [dispatch]
    );

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
        depth={depth}
        // Directly associated columns
        columnIds={columnIds} // All column IDs associated with this operation
        activeColumnIds={activeColumnIds} // columns not excluded
        columnCount={activeColumnIds.length || operation.columnCount}
        selectedColumnIds={selectedColumnIds}
        selectedColumnNames={selectedColumnNames}
        removedColumnIds={removedColumnIds} // TODO: @deprecated?
        // Columns that belong to the child tables
        selectedChildColumns={selectedChildColumns}
        // Row stuff
        rowCount={operation.rowCount}
        // Directly associated alerts (from withAssociatedAlerts)
        alertIds={alertIds}
        hasAlerts={hasAlerts}
        removeAlerts={removeAlerts}
        silenceAlerts={silenceAlerts}
        // Interaction props (TODO, is this deprecated?)
        isFocused={isFocused}
        isHovered={isHovered}
        // Interaction handlers
        onHover={() => dispatch(setHoveredOperation(id))}
        onUnhover={() => dispatch(setHoveredOperation(null))}
        peekTable={() => dispatch(setPeekedTable(id))} // todo is this deprecated?
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
