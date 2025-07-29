import PropTypes from "prop-types";
import withColumnData from "../../../HOC/withColumnData";

function ColumnView({ column }) {
  const values = column.values ? Object.keys(column.values) : [];
  
  return (
    <div className="column-view">
      <h3>{column.name}</h3>
      <div>
        <h4>Values ({values.length}):</h4>
        {values.length > 0 ? (
          <ul>
            {values.map((value, index) => (
              <li key={index}>{value}</li>
            ))}
          </ul>
        ) : (
          <p>No values available</p>
        )}
      </div>
    </div>
  );
}

ColumnView.propTypes = {
  column: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    uniqueValues: PropTypes.number,
    totalRows: PropTypes.number,
    values: PropTypes.object,
  }).isRequired,
};
ColumnView.defaultProps = {
  uniqueValues: 0,
  totalRows: 0,
};

const EnhancedColumnView = withColumnData(ColumnView);
export default EnhancedColumnView;
