import withColumnData from "../../../../ColumnViews/withColumnData";
function ColumnView({ column }) {
  return column.name || column.databaseName || column.id;
}

const EnhancedColumnView = withColumnData(ColumnView);

export default EnhancedColumnView;
