import withTableData from "../../HOC/withTableData";

function TableRowLabel(table, onHover, onUnhover) {
  return (
    <div className="cell" onMouseEnter={onHover} onMouseLeave={onUnhover}>
      {table.name}
    </div>
  );
}

const TableRowLabelWithTableData = withTableData(TableRowLabel);

export default TableRowLabelWithTableData;
