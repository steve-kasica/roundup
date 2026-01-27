import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../../slices/operationsSlice";
import { withOperationData } from "../../HOC";
import { EnhancedPackOperationParams } from "./PackOperationParams";

const OperationParams = ({ operationType, id }) => {
  if (operationType === OPERATION_TYPE_PACK) {
    return <EnhancedPackOperationParams id={id} />;
  } else if (operationType === OPERATION_TYPE_STACK) {
    return <div>Stack Operation Parameters</div>;
  } else {
    throw new Error(`Unsupported operation type: ${operationType}`);
  }
};

const EnhancedOperationParams = withOperationData(OperationParams);

export { OperationParams, EnhancedOperationParams };
