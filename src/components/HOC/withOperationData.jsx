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
  setOperationAttributes,
  updateOperationJoinSpec,
} from "../../slices/operationsSlice";
import { useDispatch } from "react-redux";
import { selectTablesById, isTableId } from "../../slices/tablesSlice";
import PropTypes from "prop-types";
import { setPeekedTable } from "../../slices/uiSlice";

export default function withOperationData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    const focusedOperationId = useSelector(selectFocusedOperationId);
    const hoveredOperationId = useSelector(selectHoveredOperation);

    return (
      <WrappedComponent
        {...props}
        operation={operation}
        id={id}
        depth={depth}
        columnCount={operation?.columnCount}
        rowCount={operation?.rowCount}
        isFocused={operation?.id === focusedOperationId}
        isHovered={operation?.id === hoveredOperationId}
        operationType={operation?.operationType}
        childrenIds={operation?.children || []}
        onHover={() => dispatch(setHoveredOperation(id))}
        onUnhover={() => dispatch(setHoveredOperation(null))}
        peekTable={() => dispatch(setPeekedTable(id))}
        setJoinType={(joinType) => {
          dispatch(
            updateOperationJoinSpec({
              id,
              attributes: { joinType },
            })
          );
        }}
        setJoinKey1={(joinKey1) => {
          dispatch(
            updateOperationJoinSpec({
              id,
              attributes: { joinKey1 },
            })
          );
        }}
        setJoinKey2={(joinKey2) => {
          dispatch(
            updateOperationJoinSpec({
              id,
              attributes: { joinKey2 },
            })
          );
        }}
        setJoinPredicate={(joinPredicate) => {
          dispatch(
            updateOperationJoinSpec({
              id,
              attributes: { joinPredicate },
            })
          );
        }}
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
