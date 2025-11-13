import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import withOperationData from "../HOC/withOperationData";
import { EnhancedPackOperationBlock } from "../PackOperationView/PackOperationBlock";
import { EnhancedStackOperationBlock } from "../StackOperationView/StackOperationBlock";

const OperationBlock = ({ operationType, props }) => {
  if (operationType == OPERATION_TYPE_STACK) {
    return <EnhancedStackOperationBlock {...props} />;
  } else if (operationType === OPERATION_TYPE_PACK) {
    return <EnhancedPackOperationBlock {...props} />;
  }
};

OperationBlock.displayName = "Operation Block";

const EnhancedOperationBlock = withOperationData(OperationBlock);

export { EnhancedOperationBlock, OperationBlock };
