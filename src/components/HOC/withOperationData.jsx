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
  selectColumnIdsByTableId,
  selectRemovedColumnIdsByTableId,
  selectSelectedChildColumnsByOperationId,
  selectSelectedColumnDBNamesByTableId,
  selectSelectedColumnIdsByTableId,
  setFocusedColumnIds,
  setVisibleColumns as setVisibleColumnsAction,
} from "../../slices/columnsSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga/actions";
import { useCallback, useMemo } from "react";
import { selectAlertIdsBySourceId } from "../../slices/alertsSlice/alertsSelectors";
import { updateColumnsRequest } from "../../sagas/updateColumnsSaga";
import {
  createColumnsRequest,
  CREATION_MODE_INSERTION,
} from "../../sagas/createColumnsSaga";

export default function withOperationData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
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

    const alerts = useSelector((state) => selectAlertIdsBySourceId(state, id));

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
    const swapTablePositions = useCallback(
      () => dispatch(),
      // TODO
      // updateOperations({
      //   id,
      //   joinKey1: operation.joinKey2,
      //   joinKey2: operation.joinKey1,
      //   children: operation.children.slice().reverse(),
      // })
      [dispatch]
    );
    const setVisibleColumns = useCallback(
      (columnIds) => {
        dispatch(setVisibleColumnsAction(columnIds));
      },
      [dispatch]
    );

    const selectColumns = useCallback(
      (selectedColumnIds) =>
        dispatch(
          updateColumnsRequest({
            columnUpdates: [
              ...selectedColumnIds.filter(Boolean).map((id) => ({
                id,
                isSelected: true,
              })),
            ],
          })
        ),
      [dispatch]
    );

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

    return (
      <WrappedComponent
        // Pass along props directly from the parent component
        {...props}
        id={id} // Need to pass id explicitly
        // Props derived in this HOC
        operation={operation}
        depth={depth}
        // Directly associated columns
        columnIds={columnIds} // All column IDs associated with this operation
        activeColumnIds={activeColumnIds} // columns not excluded
        columnCount={activeColumnIds.length}
        selectedColumnIds={selectedColumnIds}
        selectedColumnNames={selectedColumnNames}
        removedColumnIds={removedColumnIds} // TODO: @deprecated?
        // Columns that belong to the child tables
        selectedChildColumns={selectedChildColumns}
        // Row stuff
        rowCount={operation.rowCount}
        // Directly associated alerts
        alerts={alerts} // All alerts associted with this operation
        hasAlerts={alerts.length > 0}
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
        // Callback function related to columns
        selectColumns={selectColumns}
        insertColumnIntoChildAtIndex={insertColumnIntoChildAtIndex}
        setVisibleColumns={setVisibleColumns}
        focusColumns={focusColumns}
      />
    );
  };
}
