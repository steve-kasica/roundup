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
import { selectActiveColumnCountByTableId } from "../../slices/columnsSlice";

export default function withOperationData(WrappedComponent) {
  return function EnhancedComponent({ id, ...props }) {
    const dispatch = useDispatch();

    const operation = useSelector((state) => selectOperation(state, id));
    const depth = useSelector((state) => selectOperationDepth(state, id));
    const focusedOperationId = useSelector(selectFocusedOperationId);
    const hoveredOperationId = useSelector(selectHoveredOperation);

    const columnCount = useSelector((state) => {
      if (!operation || !operation.children) {
        return 0; // If operation or children are not defined, return 0
        // TODO: who is calling this component on start up?
      }
      const childColumnCount = operation.children.map((childId) => {
        if (isTableId(childId)) {
          return selectActiveColumnCountByTableId(state, childId);
        } else {
          return 0;
        }
      });
      if (operation.operationType === OPERATION_TYPE_PACK) {
        return childColumnCount.reduce((a, b) => a + b, 0); // Sum of all child column counts
      } else {
        return Math.max(...childColumnCount); // Max of all child column counts
      }
    });

    return (
      <WrappedComponent
        {...props}
        operation={operation}
        id={id}
        depth={depth}
        columnCount={columnCount}
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
