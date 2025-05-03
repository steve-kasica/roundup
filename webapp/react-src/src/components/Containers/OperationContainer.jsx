import { Children, cloneElement } from "react";
import { useSelector } from "react-redux";
import { selectOperationColumnCount } from "../../data/selectors";
import {
  selectOperation,
  selectOperationDepth,
  selectFocusedOperationId,
} from "../../data/slices/operationsSlice";
import {
  selectHoveredOperationId,
  selectHoveredTableId,
} from "../../data/slices/uiSlice";

export function OperationContainer({ id, onClick, children, style }) {
  const operation = useSelector((state) => selectOperation(state, id));
  const depth = useSelector((state) => selectOperationDepth(state, id));
  const columnCount = useSelector((state) =>
    selectOperationColumnCount(state, id)
  );

  const focusedOperationId = useSelector(selectFocusedOperationId);

  const isFocused = operation.id === focusedOperationId;

  const className = [
    "OperationContainer",
    operation.operationType,
    `depth-${depth}`,
    isFocused ? "focused" : undefined,
    operation.status.isHovered ? "hover" : undefined,
  ]
    .filter(Boolean)
    .join(" ");

  const enhancedChildren = Children.map(children, (child) =>
    cloneElement(child, {
      operation,
      columnCount,
    })
  );

  return (
    <div
      className={className}
      data-operation-id={id}
      onClick={onClick}
      style={style}
    >
      {enhancedChildren}
    </div>
  );
}
