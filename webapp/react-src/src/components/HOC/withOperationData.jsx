import { useSelector } from "react-redux";
import {
  selectOperation,
  selectOperationDepth,
  selectFocusedOperationId,
  setHoveredOperation,
  selectHoveredOperation,
  isOperationId,
  OPERATION_TYPE_STACK,
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_NO_OP,
} from "../../data/slices/operationsSlice";
import { useDispatch } from "react-redux";
import { selectTableById } from "../../data/slices/tablesSlice";
import { selectColumnIdsByTableId } from "../../data/slices/columnsSlice";

const isTableId = (id) => !isOperationId(id); // Interim

export default function withOperationData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    // const columnCount = useSelector((state) =>
    //   selectOperationColumnCount(state, id)
    // );
    const focusedOperationId = useSelector(selectFocusedOperationId);
    const hoveredOperationId = useSelector(selectHoveredOperation);

    const tableColumnCounts = useSelector((state) =>
      operation.children
        .filter(isTableId)
        .map((tableId) => selectColumnIdsByTableId(state, tableId).length)
    );

    let operationColumnCount = 0;
    if (
      operation.operationType === OPERATION_TYPE_STACK ||
      operation.operationType === OPERATION_TYPE_NO_OP
    ) {
      operationColumnCount = Math.max(...tableColumnCounts);
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
