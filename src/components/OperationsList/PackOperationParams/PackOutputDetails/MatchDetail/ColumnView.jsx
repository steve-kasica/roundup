import withColumnData from "../../../../ColumnViews/withColumnData";
function ColumnView({ column }) {
  return column.name;
}

const EnhancedColumnView = withColumnData(ColumnView);

export default EnhancedColumnView;
