import { useSelector } from "react-redux";
import {
  selectOperation,
  selectOperationDepth,
  selectFocusedOperationId,
  setHoveredOperation,
  selectHoveredOperation,
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_NO_OP,
} from "../../data/slices/operationsSlice";
import { useDispatch } from "react-redux";
import { selectTablesById, isTableId } from "../../data/slices/tablesSlice";
import PropTypes from "prop-types";

export default function withOperationData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    const focusedOperationId = useSelector(selectFocusedOperationId);
    const hoveredOperationId = useSelector(selectHoveredOperation);
    const tables = useSelector((state) =>
      operation.children
        .filter(isTableId)
        .map((tableId) => selectTablesById(state, tableId))
    );
    const tableColumnCounts = useSelector((state) =>
      tables.map(({ id }) => state.columns.idsByTable[id].length)
    );

    let operationColumnCount = 0;
    if (
      operation.operationType === OPERATION_TYPE_STACK ||
      operation.operationType === OPERATION_TYPE_NO_OP
    ) {
      operationColumnCount = Math.max(...tableColumnCounts, 0);
    } else if (operation.operationType === OPERATION_TYPE_PACK) {
      operationColumnCount = tableColumnCounts.reduce(
        (acc, tableColumnCount) => acc + tableColumnCount,
        0
      );
    } else {
      // Handle other operation types if necessary
      operationColumnCount = 0; // Default to 0 for unsupported types
    }

    const rowCount = -1; // TODO: Implement row count logic

    return (
      <WrappedComponent
        {...props}
        id={id}
        depth={depth}
        columnCount={operationColumnCount}
        rowCount={rowCount}
        isFocused={operation.id === focusedOperationId}
        isHovered={operation.id === hoveredOperationId}
        operationType={operation.operationType}
        childrenIds={operation.children}
        onHover={() => dispatch(setHoveredOperation(id))}
        onUnhover={() => dispatch(setHoveredOperation(null))}
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
