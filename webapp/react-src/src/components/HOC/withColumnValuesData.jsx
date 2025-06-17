import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  selectColumnValues,
  selectColumnById,
} from "../../data/slices/columnsSlice/";
import { selectTableByColumnId } from "../../data/slices/tablesSlice/";
import { selectValuesById } from "../../data/slices/valuesSlices";

// HOC to provide column values for given columnIds
const withColumnValuesData = (WrappedComponent) => {
  function EnhancedComponent({ columnIds, ...props }) {
    // Get a double-nested map of key-value object of values group by column ID, for each columnId
    // { <columnIds>: { <value>: [<index>, ...] } }

    const columns = useSelector((state) =>
      columnIds.map((columnId) => selectColumnById(state, columnId))
    );

    // Get table data based on columnIds
    // Note: tables array is parallel to columnIds and columns array
    const tables = useSelector((state) =>
      selectTableByColumnId(state, columnIds)
    );

    const columnTableMap = new Map(
      columnIds.map((columnId, index) => [columnId, tables[index]])
    );

    const values = useSelector((state) =>
      columns.map((column) =>
        selectValuesById(state, Object.keys(column.values))
      )
    );

    const valuesMap = new Map(values.flat().map((value) => [value.id, value]));

    // Collect all unique values across all columns
    const allValues = Array.from(valuesMap.keys());

    // Build the value count matrix as an array of arrays: rows = allValues, columns = columnIds
    // e.g.
    // |    | c1 | c2 | c3 |
    // | v1 |  5 |  3 |  0 |
    // | v2 |  2 |  0 | 7  |
    //
    const valueCountMatrix = allValues.map((valueId) =>
      columns.map((column) => column.values[valueId] || 0)
    );

    return (
      <WrappedComponent
        {...props}
        columnIds={columnIds} // corresponds to column (vertical index) in matrix
        columnNames={columns.map((column) => column.name)} // names of columns
        allValues={allValues.map((valueId) => valuesMap(valueId))} // corresponds to value (horizontal index) in matrix
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
