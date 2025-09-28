import { useSelector, useDispatch } from "react-redux";
import {
  selectOperation,
  OPERATION_TYPE_PACK,
  updateOperations,
} from "../../slices/operationsSlice";
import PropTypes from "prop-types";
import withOperationData from "../HOC/withOperationData";
import { useCallback } from "react";
import {
  selectColumnIdsByTableId,
  setSelectedColumns,
} from "../../slices/columnsSlice";

export default function withPackOperationData(WrappedComponent) {
  // First wrap with the base operation data HOC
  const ComponentWithOperationData = withOperationData(WrappedComponent);

  function EnhancedPackComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));

    // Pack-specific data
    const isPack = operation?.operationType === OPERATION_TYPE_PACK;

    const setJoinType = useCallback(
      (joinType) => {
        dispatch(
          updateOperations({
            id,
            joinType, // Update join type
          })
        );
      },
      [dispatch, id]
    );

    const leftHandColumns = useSelector((state) =>
      selectColumnIdsByTableId(state, operation?.children[0])
    );
    const rightHandColumns = useSelector((state) =>
      selectColumnIdsByTableId(state, operation?.children[1])
    );

    return (
      <ComponentWithOperationData
        {...props}
        id={id}
        // Pack-specific props
        joinType={operation.joinType}
        joinPredicate={operation.joinPredicate}
        joinKey1={operation.joinKey1}
        joinKey2={operation.joinKey2}
        isPack={isPack}
        leftHandColumns={leftHandColumns}
        rightHandColumns={rightHandColumns}
        // Pack-specific join dispatchers
        setJoinType={setJoinType}
        setLeftTableJoinKey={(columnId) => {
          dispatch(
            updateOperations({
              id,
              joinKey1: columnId,
            })
          );
        }}
        setName={(name) => dispatch(updateOperations({ id, name }))}
        setRightTableJoinKey={(columnId) =>
          dispatch(
            updateOperations({
              id,
              joinKey2: columnId,
            })
          )
        }
        setJoinPredicate={(joinPredicate) =>
          dispatch(updateOperations({ id, joinPredicate }))
        }
        setOperationType={(operationType) =>
          dispatch(updateOperations({ id, operationType }))
        }
        swapTablePositions={() =>
          dispatch(
            updateOperations({
              id,
              joinKey1: operation.joinKey2,
              joinKey2: operation.joinKey1,
              children: operation.children.slice().reverse(),
            })
          )
        }
        selectColumns={useCallback(
          (columnIds) => {
            dispatch(setSelectedColumns(columnIds));
          },
          [dispatch]
        )}
      />
    );
  }

  EnhancedPackComponent.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  };

  return EnhancedPackComponent;
}

withPackOperationData.propTypes = {
  WrappedComponent: PropTypes.elementType.isRequired,
};
