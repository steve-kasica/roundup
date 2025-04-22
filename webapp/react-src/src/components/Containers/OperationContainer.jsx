import { Children, cloneElement } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getFocusedOperationId,
  getHoverOperationId,
  getHoverTableId,
  getOperationById,
  getOperationColumnCount,
} from "../../data/selectors";
import {
  unhoverOperation,
  hoverOperation,
  focusOperation,
} from "../../data/uiSlice";

export function OperationContainer({ id, children }) {
  const dispatch = useDispatch();
  const operation = useSelector((state) => getOperationById(state, id));
  const focusedOperationId = useSelector(getFocusedOperationId);
  const hoverOperationId = useSelector(getHoverOperationId);
  const hoverTableId = useSelector(getHoverTableId);
  const columnCount = useSelector((state) =>
    getOperationColumnCount(state, id)
  );

  // let OperationView;
  // switch (layout) {
  //   case OPERATION_LAYOUT_BLOCK:
  //     OperationView = OperationBlockView;
  //     break;
  //   case OPERATION_LAYOUT_LIST_ITEM:
  //     OperationView = OperationListItemView;
  //     break;
  //   case "Detail":
  //     OperationView = StackDetailView;
  //     break;
  //   default:
  //     OperationView = OperationBlockView;
  //     break;
  // }

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
    .filter((name) => name)
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
      data-id={id}
      onMouseEnter={handleHoverOperation}
      onMouseLeave={handleUnhoverOperation}
      onClick={handleFocusOperation}
    >
      {/* <OperationView
        id={operation.id}
        parentId={operation.parentId}
        operationType={operation.operationType}
        children={operation.children}
        columnCount={columnCount}
        depth={operation.depth}
        isFocused={isFocused}
      /> */}
      {enhancedChildren}
    </div>
  );

  function handleFocusOperation() {
    dispatch(focusOperation(id));
  }

  function handleHoverOperation() {
    dispatch(hoverOperation(id));
  }

  function handleUnhoverOperation() {
    dispatch(unhoverOperation());
  }
}
