import withColumnData from "../HOC/withColumnData";
import PropTypes from "prop-types";

function ColumnHeader({ name, isLoading }) {
  if (isLoading) {
    return <th className="column-header loading">Loading...</th>;
  } else {
    return <th className="column-header">{name}</th>;
  }
}

ColumnHeader.propTypes = {
  name: PropTypes.string,
  isLoading: PropTypes.bool,
};

const EnhancedComponent = withColumnData(ColumnHeader);
export default EnhancedComponent;
