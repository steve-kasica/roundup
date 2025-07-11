import withOperationData from "../../HOC/withOperationData";

const OperationView = ({ operation }) => {
  return <div>Pack operation detail {operation.name}</div>;
};

const EnhancedOperationView = withOperationData(OperationView);
export default EnhancedOperationView;
