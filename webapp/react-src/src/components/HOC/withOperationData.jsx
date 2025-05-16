import { useSelector } from "react-redux";
import {
  selectOperation,
  selectOperationDepth,
  selectFocusedOperationId,
  selectOperationImmediateChildId,
  setOperationHoverStatus,
} from "../../data/slices/operationsSlice";
import { selectOperationColumnCount } from "../../data/selectors";
import { useDispatch } from "react-redux";

export default function withOperationData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    const columnCount = useSelector((state) =>
      selectOperationColumnCount(state, id)
    );
    const focusedOperationId = useSelector(selectFocusedOperationId);

    const childOperationId = useSelector((state) =>
      selectOperationImmediateChildId(state, operation.id)
    );

    return (
      <WrappedComponent
        {...props}
        id={id}
        depth={depth}
        columnCount={columnCount}
        isFocused={operation.id === focusedOperationId}
        isHovered={operation.status.isHovered}
        operationType={operation.operationType}
        tableIds={operation.tableIds}
        childOperationId={childOperationId}
        onHover={() =>
          dispatch(
            setOperationHoverStatus({ operationId: id, isHovered: true })
          )
        }
        onUnhover={() =>
          dispatch(
            setOperationHoverStatus({ operationId: id, isHovered: false })
          )
        }
      />
    );
  };
}
