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
import PropTypes from "prop-types";
import { setPeekedTable } from "../../slices/uiSlice";
import {
  selectColumnIdsByTableId,
  selectRemovedColumnIdsByTableId,
} from "../../slices/columnsSlice";
import { updateOperationsRequest } from "../../sagas/updateOperationsSaga/actions";
import { useMemo } from "react";

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

    // Use useMemo to ensure activeColumnIds updates when table.columnIds or removedColumnIds change
    const activeColumnIds = useMemo(
      () =>
        columnIds.filter((columnId) => !removedColumnIds.includes(columnId)),
      [columnIds, removedColumnIds]
    );

    return (
      <WrappedComponent
        {...props}
        operation={operation}
        id={id}
        depth={depth}
        columnCount={columnIds.length}
        columnIds={columnIds}
        removedColumnIds={removedColumnIds}
        activeColumnIds={activeColumnIds}
        rowCount={operation?.rowCount}
        isFocused={operation?.id === focusedOperationId}
        isHovered={operation?.id === hoveredOperationId}
        operationType={operation?.operationType}
        childrenIds={operation?.children || []}
        onHover={() => dispatch(setHoveredOperation(id))}
        onUnhover={() => dispatch(setHoveredOperation(null))}
        peekTable={() => dispatch(setPeekedTable(id))}
        renameOperation={(newName) =>
          dispatch(updateOperations({ id, name: newName }))
        }
        focusOperation={() =>
          dispatch(
            updateOperationsRequest({
              operationUpdates: [{ id, isFocused: true }],
            })
          )
        }
      />
    );
  };
}

withOperationData.propTypes = {
  WrappedComponent: PropTypes.elementType,
};

// Add prop types for the EnhancedComponent returned by withOperationData
withOperationData.EnhancedComponentPropTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};
