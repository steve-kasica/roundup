/* eslint-disable react/prop-types */
import {
  OPERATION_TYPE_PACK,
  OPERATION_TYPE_STACK,
} from "../../slices/operationsSlice";
import withOperationData from "../HOC/withOperationData";
import { PackOperationLabel } from "../PackOperationView";
import { StackOperationLabel } from "../StackOperationView";

const OperationLabel = ({ operation }) => {
  if (!operation) {
    return <span>No data</span>;
  } else if (operation.operationType === OPERATION_TYPE_PACK) {
    return <PackOperationLabel operation={operation} />;
  } else if (operation.operationType === OPERATION_TYPE_STACK) {
    return <StackOperationLabel operation={operation} />;
  }
};

const EnhancedOperationLabel = withOperationData(OperationLabel);

export { OperationLabel, EnhancedOperationLabel };
