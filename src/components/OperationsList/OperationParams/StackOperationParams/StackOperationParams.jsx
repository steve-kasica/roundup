import { withStackOperationData } from "../../../HOC";

const StackOperationParams = () => {
  return (
    <div style={{ padding: "20px", textAlign: "center", color: "#666" }}>
      <p>Stack Operation Parameters</p>
      <p style={{ fontSize: "14px", fontStyle: "italic" }}>
        Feature coming soon...
      </p>
    </div>
  );
};

const EnhancedStackOperationParams =
  withStackOperationData(StackOperationParams);

export { StackOperationParams, EnhancedStackOperationParams };
