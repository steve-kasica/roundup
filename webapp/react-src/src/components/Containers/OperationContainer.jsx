import { Children, cloneElement } from "react";
import { useSelector } from "react-redux";
import {
  getOperationById,
  getOperationColumnCount,
} from "../../data/selectors";

import {
  selectHoveredOperationId,
  selectHoveredTableId,
  selectSelectedOperationId,
} from "../../data/slices/uiSlice";

export function OperationContainer({ id, onClick, children }) {
  const operation = useSelector((state) => getOperationById(state, id));
  const focusedOperationId = useSelector(selectSelectedOperationId);
  const hoverOperationId = useSelector(selectHoveredOperationId);
  const hoverTableId = useSelector(selectHoveredTableId);
  const columnCount = useSelector((state) =>
    getOperationColumnCount(state, id)
  );

  const isFocused = operation.id === focusedOperationId;
  const isHover =
    operation.id === hoverOperationId ||
    (hoverOperationId === null &&
      operation.children.some((child) => child.id === hoverTableId));

  const className = [
    "OperationView",
    operation.operationType,
    `depth-${operation.depth}`,
    isFocused ? "focused" : undefined,
    isHover ? "hover" : undefined,
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
    <div className={className} data-operation-id={id} onClick={onClick}>
      {enhancedChildren}
    </div>
  );
}
