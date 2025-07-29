import { useSelector, useDispatch } from "react-redux";
import PropTypes from "prop-types";

import { selectColumnById } from "../../../../slices/columnsSlice";
import { selectTablesById } from "../../../../slices/tablesSlice";

import { equals } from "./comparisonFunctions";
import { group } from "d3";

const NO_MATCHES = "none";
const ONE_MATCH = "one";
const MANY_MATCHES = "many";

/**
 * Higher-Order Component that provides column comparison data for two tables.
 * Enhances wrapped components with key column comparison utilities and metrics.
 *
 * @param {React.Component} WrappedComponent - The component to enhance
 * @returns {React.Component} Enhanced component with column comparison data
 */
export default function withColumnComparisonData(WrappedComponent) {
  function EnhancedComponent({
    columnId1,
    columnId2,
    comparisonFunction = equals, // Default to equals comparison
    ...props
  }) {
    const dispatch = useDispatch();
    console.log(
      "withColumnComparisonData: columnId1, columnId2, comparisonFunction",
      columnId1,
      columnId2,
      comparisonFunction
    );

    const column1 = useSelector((state) => selectColumnById(state, columnId1));
    const column2 = useSelector((state) => selectColumnById(state, columnId2));

    // Get table data from Redux store (with null checks)
    const table1 = useSelector((state) =>
      column1?.tableId ? selectTablesById(state, column1.tableId) : null
    );
    const table2 = useSelector((state) =>
      column2?.tableId ? selectTablesById(state, column2.tableId) : null
    );

    // Derived properties (with null checks)
    const column1Values = new Set(
      column1?.values ? Object.keys(column1.values) : []
    );
    const column2Values = new Set(
      column2?.values ? Object.keys(column2.values) : []
    );
    const valuesUnion = new Set([...column1Values, ...column2Values]);
    const valuesIntersection = new Set(
      [...column1Values].filter((value) => column2Values.has(value))
    );

    const valueMatches = [...column1Values].map((value1) => {
      const matches = [...column2Values].filter((value2) =>
        comparisonFunction(value1, value2)
      );
      return [value1, matches];
    });

    const matchGroups = group(valueMatches, ([value1, matches]) => {
      switch (matches.length) {
        case 0:
          return NO_MATCHES;
        case 1:
          return ONE_MATCH;
        default:
          return MANY_MATCHES;
      }
    });

    const manyMatches = matchGroups.get("Many") || [];

    // Calculate how many values in column1 correspond with only one value in column2
    const column1ValuesWithSingleColumn2Match = new Set(
      [...column1Values].filter((value1) => {
        // Count how many values in column2 match this value1
        const matchingColumn2Values = [...column2Values].filter((value2) =>
          comparisonFunction(value1, value2)
        );
        return matchingColumn2Values.length === 1;
      })
    );

    // Calculate how many values in column1 are not present in column2
    const column1ValuesNotInColumn2 = new Set(
      [...column1Values].filter((value1) => {
        // Count how many values in column2 match this value1
        const matchingColumn2Values = [...column2Values].filter((value2) =>
          comparisonFunction(value1, value2)
        );
        return matchingColumn2Values.length === 0;
      })
    );

    // Calculate how many values in column2 are not present in column1
    const column2ValuesNotInColumn1 = new Set(
      [...column2Values].filter((value1) => {
        // Count how many values in column2 match this value1
        const matchingColumn1Values = [...column2Values].filter((value2) =>
          comparisonFunction(value2, value1)
        );
        return matchingColumn1Values.length === 0;
      })
    );

    // Calculate how many values in column1 have more than one match in column2
    const column1ValuesWithMultipleColumn2Matches = new Set(
      [...column1Values].filter((value1) => {
        // Count how many values in column2 match this value1
        const matchingColumn2Values = [...column2Values].filter((value2) =>
          comparisonFunction(value1, value2)
        );
        return matchingColumn2Values.length > 1;
      })
    );

    // Calculate how many values in column2 have more than one match in column1
    const column2ValuesWithMultipleColumn1Matches = new Set(
      [...column2Values].filter((value2) => {
        // Count how many values in column1 match this value2
        const matchingColumn1Values = [...column1Values].filter((value1) =>
          comparisonFunction(value2, value1)
        );
        return matchingColumn1Values.length > 1;
      })
    );

    return (
      <WrappedComponent
        {...props}
        table1={table1}
        table2={table2}
        column1={column1}
        column2={column2}
        values1={column1Values}
        values2={column2Values}
        noMatches={matchGroups.get(NO_MATCHES) || []}
        oneMatch={matchGroups.get(ONE_MATCH) || []}
        manyMatches={matchGroups.get(MANY_MATCHES) || []}
      />
    );
  }

  EnhancedComponent.propTypes = {
    columnId1: PropTypes.string, // Can be undefined
    columnId2: PropTypes.string, // Can be undefined
    comparisonFunction: PropTypes.func,
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `withColumnComparisonData(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return EnhancedComponent;
}
