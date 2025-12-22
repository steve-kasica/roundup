import { withTableData } from "../../../HOC";

function TableView({ table }) {
  return <span>{table.name}</span>;
}

const EnhancedTableView = withTableData(TableView);

export default EnhancedTableView;
