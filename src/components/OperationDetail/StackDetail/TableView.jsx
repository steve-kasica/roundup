import withTableData from "../../HOC/withTableData";
import PropTypes from "prop-types";

function TableView({ table, hoverTable, unhoverTable }) {
  return (
    <div className="cell" onMouseEnter={hoverTable} onMouseLeave={unhoverTable}>
      {table.name}
    </div>
  );
}

TableView.propTypes = {
  table: PropTypes.object.isRequired,
  hoverTable: PropTypes.func.isRequired,
  unhoverTable: PropTypes.func.isRequired,
};

const EnhancedTableView = withTableData(TableView);

export default EnhancedTableView;
