import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { selectColumnValues } from "../../data/slices/columnsSlice/columnSelectors";
import { selectTableByColumnId } from "../../data/slices/sourceTablesSlice/tablesSelector";

// HOC to provide column values for given columnIds
const withColumnValuesData = (WrappedComponent) => {
  function EnhancedComponent({ columnIds, ...props }) {
    // Get a double-nested map of key-value object of values group by column ID, for each columnId
    // { <columnIds>: { <value>: [<index>, ...] } }

    const columnValues = useSelector((state) =>
      selectColumnValues(state, columnIds)
    );

    // Collect all unique values across all columns
    const allValuesSet = new Set();
    Object.values(columnValues).forEach((valueObj) => {
      Object.keys(valueObj).forEach((value) => {
        allValuesSet.add(value);
      });
    });
    const allValues = Array.from(allValuesSet);

    // Build the value count matrix as an array of arrays: rows = allValues, columns = columnIds
    const valueCountMatrix = allValues.map((value) =>
      columnIds.map((columnId) => {
        const valueObj = columnValues[columnId] || {};
        return Array.isArray(valueObj[value]) ? valueObj[value].length : 0;
      })
    );

    // Get table data based on columnIds
    // Note: tables array is parallel to columnIds array
    const tables = useSelector((state) =>
      selectTableByColumnId(state, columnIds)
    );

    const columnTableMap = new Map(
      columnIds.map((columnId, index) => [columnId, tables[index]])
    );

    return (
      <WrappedComponent
        {...props}
        columnIds={columnIds} // corresponds to column (vertical index) in matrix
        allValues={allValues} // corresponds to value (horizontal index) in matrix
        valueCountMatrix={valueCountMatrix} // matrix: [<column>][<value>] = count
        columnTableMap={columnTableMap}
        isLoading={false}
      />
    );
  }

  EnhancedComponent.propTypes = {
    columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  return EnhancedComponent;
};

export default withColumnValuesData;
