import { useSelector } from "react-redux";
import {
  selectOperation,
  selectOperationDepth,
  selectFocusedOperationId,
  setHoveredOperation,
  selectHoveredOperation,
  updateOperations,
  OPERATION_TYPE_PACK,
} from "../../slices/operationsSlice";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import { setPeekedTable } from "../../slices/uiSlice";
import { isTableId } from "../../slices/tablesSlice";
import {
  selectActiveColumnCountByTableId,
  selectColumnIdsByTableId,
} from "../../slices/columnsSlice";

export default function withOperationData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    const focusedOperationId = useSelector(selectFocusedOperationId);
    const hoveredOperationId = useSelector(selectHoveredOperation);
    const columnIds = useSelector((state) =>
      selectColumnIdsByTableId(state, id)
    );

    console.log(operation.name, columnIds);

    return (
      <WrappedComponent
        {...props}
        operation={operation}
        id={id}
        depth={depth}
        columnCount={columnIds.length}
        columnIds={columnIds}
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
