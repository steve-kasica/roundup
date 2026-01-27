import { withStackOperationData } from "../../../HOC";

const StackOperationParams = () => {
  return <div>Stack Operation Parameters</div>;
};

const EnhancedStackOperationParams =
  withStackOperationData(StackOperationParams);

export { StackOperationParams, EnhancedStackOperationParams };
