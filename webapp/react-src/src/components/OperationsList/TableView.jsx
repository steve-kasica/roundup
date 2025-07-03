function TableView({ table }) {
  const { id, name } = table;
  return <div>{name}</div>;
}

const EnhancedTableView = withTableData(TableView);

export default EnhancedTableView;
