import withTableData from "../../../HOC/withTableData";
import PropTypes from "prop-types";

function TableView({ table }) {
  return <span>{table.name}</span>;
}

TableView.propTypes = {
  table: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

const EnhancedTableView = withTableData(TableView);

export default EnhancedTableView;
