import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { getValuesCountMatrix } from "../../lib/duckdb";
import { useEffect, useState } from "react";
import { selectTableIdsByColumnIds } from "../../slices/columnsSlice";

// HOC to provide column values for given columnNames
export default function withValuesCountMatrixData(WrappedComponent) {
  function EnhancedComponent({ columnNames, ...props }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uniqueValues, setUniqueValues] = useState(null);
    const [valueDegrees, setValueDegrees] = useState(null);
    const [signature, setSignature] = useState(null);

    const tableIds = useSelector((state) =>
      selectTableIdsByColumnIds(state, columnNames)
    );

    useEffect(() => {
      // Fetch the values count matrix when component mounts or columnNames change
      const fetchValuesCountMatrix = async () => {
        try {
          setLoading(true);

          // Matrix comes out sorted by degree and value alphabetically
          const matrix = await getValuesCountMatrix(columnNames, tableIds);

          setUniqueValues(matrix.map((row) => row[0]));
          setValueDegrees(matrix.map((row) => row[row.length - 2])); // Store the degrees of each value
          setSignature(matrix.map((row) => row[row.length - 1])); // Store the signature of each value
          setData(matrix.map((row) => row.slice(1, -2))); // Exclude the first and last columns (value and degree)
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      };

      fetchValuesCountMatrix();
    }, [columnNames, tableIds]);

    return (
      <WrappedComponent
        {...props}
        data={data} // matrix: [<value>][<table>] = count
        uniqueValues={uniqueValues} // y-axis labels
        valueDegrees={valueDegrees} // degrees of each value
        signature={signature} // signature of each value
        tableIds={tableIds} // x-axis labels
        error={error}
        loading={loading}
        columnNames={columnNames}
      />
    );
  }

  EnhancedComponent.propTypes = {
    columnNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  return EnhancedComponent;
}
