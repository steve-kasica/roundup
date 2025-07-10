import PropTypes from "prop-types";
import withColumnData from "../HOC/withColumnData";

function ColumnHeader({ column }) {
  const isLoading = !column || Object.keys(column).length === 0;
  if (isLoading) {
    return <th className="column-header loading">...</th>;
  } else {
    return <th className="column-header">{column.name}</th>;
  }
}

ColumnHeader.propTypes = {
  column: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool,
};

const EnhancedColumnHeader = withColumnData(ColumnHeader);

export default EnhancedColumnHeader;
