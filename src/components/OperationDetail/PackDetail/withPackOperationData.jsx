import { useSelector, useDispatch } from "react-redux";
import {
  selectOperation,
  OPERATION_TYPE_PACK,
  updateOperationJoinSpec,
  updateOperations,
} from "../../../slices/operationsSlice";
import PropTypes from "prop-types";
import withOperationData from "../../HOC/withOperationData";

export default function withPackOperationData(WrappedComponent) {
  // First wrap with the base operation data HOC
  const ComponentWithOperationData = withOperationData(WrappedComponent);

  function EnhancedPackComponent({ id, ...props }) {
    const dispatch = useDispatch();
    const operation = useSelector((state) => selectOperation(state, id));

    // Pack-specific data
    const joinSpec = operation?.joinSpec;
    const isPack = operation?.operationType === OPERATION_TYPE_PACK;

    return (
      <ComponentWithOperationData
        {...props}
        id={id}
        // Pack-specific props
        joinSpec={joinSpec}
        joinType={joinSpec?.joinType}
        joinPredicate={joinSpec?.joinPredicate}
        joinKey1={joinSpec?.joinKey1}
        joinKey2={joinSpec?.joinKey2}
        isPack={isPack}
        // Pack-specific join dispatchers
        setJoinType={(joinType) =>
          dispatch(updateOperationJoinSpec({ id, attributes: { joinType } }))
        }
        setLeftTableJoinKey={(columnId) => {
          dispatch(
            updateOperations({
              id,
              joinSpec: {
                joinKey1: columnId,
                joinKey2: joinSpec.joinKey2, // NO-OP
                joinType: joinSpec.joinType, // NO-OP
                joinPredicate: joinSpec.joinPredicate, // NO-OP
              },
            })
          );
        }}
        setRightTableJoinKey={(columnId) =>
          dispatch(
            updateOperations({
              id,
              joinSpec: {
                joinKey1: joinSpec.joinKey1, // NO-OP
                joinKey2: columnId,
                joinType: joinSpec.joinType, // NO-OP
                joinPredicate: joinSpec.joinPredicate, // NO-OP
              },
            })
          )
        }
        setJoinPredicate={(joinPredicate) =>
          dispatch(
            updateOperationJoinSpec({ id, attributes: { joinPredicate } })
          )
        }
        updateJoinSpec={(attributes) =>
          dispatch(updateOperationJoinSpec({ id, attributes }))
        }
        swapTablePositions={() =>
          dispatch(
            updateOperations({
              id,
              joinSpec: {
                joinKey1: joinSpec.joinKey2,
                joinKey2: joinSpec.joinKey1,
                joinType: joinSpec.joinType, // NO-OP
                joinPredicate: joinSpec.joinPredicate, // NO-OP
              },
              joinKey1: joinSpec.joinKey2,
              joinKey2: joinSpec.joinKey1,
              children: operation.children.slice().reverse(),
            })
          )
        }
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
