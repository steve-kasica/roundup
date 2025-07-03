import PropTypes from "prop-types";

function ColumnHeader({ column }) {
  const isLoading = !column || Object.keys(column).length === 0;
  if (isLoading) {
    return <th className="column-header loading">...</th>;
  } else {
    const { column_name: name } = column;
    return <th className="column-header">{name}</th>;
  }
}

ColumnHeader.propTypes = {
  column: PropTypes.shape({
    column_name: PropTypes.string.isRequired,
  }).isRequired,
  isLoading: PropTypes.bool,
};

export default ColumnHeader;
