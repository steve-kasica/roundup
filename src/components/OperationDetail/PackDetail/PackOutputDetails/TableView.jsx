import withTableData from "../../../HOC/withTableData";
function TableView({ table }) {
  return <span>{table.name}</span>;
}

const EnhancedTableView = withTableData(TableView);

export default EnhancedTableView;
