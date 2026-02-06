import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice";
import { withOperationData } from "../../HOC";
import { EnhancedPackOperationParams } from "./PackOperationParams";
import { EnhancedStackOperationParams } from "./StackOperationParams";

const OperationParams = ({ operationType, id, isReadOnly }) => {
  if (operationType === OPERATION_TYPE_PACK) {
    return <EnhancedPackOperationParams id={id} isReadOnly={isReadOnly} />;
  } else if (operationType === OPERATION_TYPE_STACK) {
    return <EnhancedStackOperationParams id={id} isReadOnly={isReadOnly} />;
  } else {
    throw new Error(`Unsupported operation type: ${operationType}`);
  }
};

const EnhancedOperationParams = withOperationData(OperationParams);

export { OperationParams, EnhancedOperationParams };
