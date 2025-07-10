import withColumnData from "../HOC/withColumnData";
import PropTypes from "prop-types";

function ColumnVector({ values, isLoading, rowsExplored }) {
  const columnCells = new Array(rowsExplored).fill(null);
  Object.entries(values).forEach(([value, indices]) => {
    indices.forEach((index) => {
      columnCells[index] = value;
    });
  });
  return (
    <div
      className="ColumnVector"
      style={{ width: "100%", textAlign: "center" }}
    >
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        columnCells.map((value, i) => (
          <div style={{ padding: "0.25rem 0" }} key={i}>
            {value}
          </div>
        ))
      )}
    </div>
  );
}

ColumnVector.propTypes = {
  values: PropTypes.object.isRequired,
  isLoading: PropTypes.bool,
  rowsExplored: PropTypes.number.isRequired,
};

const EnhancedColumnVector = withColumnData(ColumnVector);

export default EnhancedColumnVector;
