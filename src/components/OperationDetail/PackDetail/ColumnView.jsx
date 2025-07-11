import withColumnData from "../../HOC/withColumnData";

const ColumnView = ({ column }) => {
  return <div>{column.name}</div>;
};

const EnhancedColumnView = withColumnData(ColumnView);
export default EnhancedColumnView;
