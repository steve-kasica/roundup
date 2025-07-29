import { useSelector, useDispatch } from "react-redux";
import {
  selectOperation,
  OPERATION_TYPE_PACK,
  updateOperationJoinSpec,
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

    // Pack-specific join handlers
    const setJoinType = (joinType) => {
      dispatch(
        updateOperationJoinSpec({
          id,
          attributes: { joinType },
        })
      );
    };

    const setJoinKey1 = (joinKey1) => {
      dispatch(
        updateOperationJoinSpec({
          id,
          attributes: { joinKey1 },
        })
      );
    };

    const setJoinKey2 = (joinKey2) => {
      dispatch(
        updateOperationJoinSpec({
          id,
          attributes: { joinKey2 },
        })
      );
    };

    const setJoinPredicate = (joinPredicate) => {
      dispatch(
        updateOperationJoinSpec({
          id,
          attributes: { joinPredicate },
        })
      );
    };

    const updateJoinSpec = (attributes) => {
      dispatch(
        updateOperationJoinSpec({
          id,
          attributes,
        })
      );
    };

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
        // Pack-specific join handlers
        setJoinType={setJoinType}
        setJoinKey1={setJoinKey1}
        setJoinKey2={setJoinKey2}
        setJoinPredicate={setJoinPredicate}
        updateJoinSpec={updateJoinSpec}
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
