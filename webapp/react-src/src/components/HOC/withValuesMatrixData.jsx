import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import { selectColumnById } from "../../data/slices/columnsSlice";
import { selectTableByColumnId } from "../../data/slices/tablesSlice";
import { getValuesCountMatrix } from "../../lib/duckdb";

// HOC to provide column values for given columnIds
import React, { useEffect, useState } from "react";

const withValuesMatrixData = (WrappedComponent) => {
  function EnhancedComponent({ columnIds, ...props }) {
    const columns = useSelector((state) =>
      columnIds.map((columnId) => selectColumnById(state, columnId))
    );

    // Get table data based on columnIds
    // Note: tables array is parallel to columnIds and columns array
    const tables = useSelector((state) =>
      selectTableByColumnId(state, columnIds)
    );

    // Run SQL query
    const columnNames = columns.map((column) => column.name);
    const tableNames = tables.map((table) => table.name);

    const valueCountMatrixPromise = getValuesCountMatrix(
      columnNames,
      tableNames
    );

    return (
      <WrappedComponent
        {...props}
        columnIds={columnIds}
        columnNames={columnNames}
        tableNames={tableNames}
        valueCountMatrixPromise={valueCountMatrixPromise} // matrix: [<column>][<value>] = count
      />
    );
  }

  EnhancedComponent.propTypes = {
    columnIds: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  return EnhancedComponent;
};

export default withValuesMatrixData;
