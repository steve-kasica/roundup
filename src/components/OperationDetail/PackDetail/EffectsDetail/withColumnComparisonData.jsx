import { useSelector } from "react-redux";
import PropTypes from "prop-types";

import { selectColumnById } from "../../../../slices/columnsSlice";
import { selectTablesById } from "../../../../slices/tablesSlice";

import { equals } from "./comparisonFunctions";
import {
  hashJoin,
  sortMergeJoin,
  chooseJoinAlgorithm,
} from "../../../../lib/utilities/joinAlgorithms";

const UNMATCHED_LEFT = "none";
const ONE_MATCH = "one";
const MANY_MATCHES = "many";
const UNMATCHED_RIGHT = "unmatched-right";

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
    const leftValues = Array.from(
      new Set(column1?.values ? Object.keys(column1.values) : [])
    );
    const rightValues = Array.from(
      new Set(column2?.values ? Object.keys(column2.values) : [])
    );

    const matchGroups = {};
    matchGroups[UNMATCHED_LEFT] = [];
    matchGroups[ONE_MATCH] = [];
    matchGroups[MANY_MATCHES] = [];
    matchGroups[UNMATCHED_RIGHT] = [];

    // Choose and execute optimal join algorithm
    const algorithm = chooseJoinAlgorithm(
      leftValues.length,
      rightValues.length,
      comparisonFunction
    );

    const joinResult =
      algorithm === "hash"
        ? hashJoin(leftValues, rightValues, comparisonFunction)
        : sortMergeJoin(leftValues, rightValues, comparisonFunction);

    // Transform join results to existing format
    matchGroups[ONE_MATCH] = joinResult.oneToOneMatches.map(
      ([leftValue, rightValue]) => [
        { value: leftValue, count: column1.values[leftValue] },
        [{ value: rightValue, count: column2.values[rightValue] }],
      ]
    );

    // Transform many-to-many matches
    matchGroups[MANY_MATCHES] = joinResult.oneToManyMatches.map(
      ([leftValue, rightValue]) => [
        { value: leftValue, count: column1.values[leftValue] },
        [{ value: rightValue, count: column2.values[rightValue] }],
      ]
    );

    // Calculate unmatched values in the left column
    matchGroups[UNMATCHED_LEFT] = joinResult.unmatchedLeft.map((leftValue) => [
      { value: leftValue, count: column1.values[leftValue] },
      [],
    ]);

    // Calculate unmatched values in the right column
    matchGroups[UNMATCHED_RIGHT] = joinResult.unmatchedRight.map(
      (rightValue) => [
        { value: null, count: 0 },
        [{ value: rightValue, count: column2.values[rightValue] }],
      ]
    );

    return (
      <WrappedComponent
        {...props}
        table1={table1}
        table2={table2}
        column1={column1}
        column2={column2}
        values1={leftValues}
        values2={rightValues}
        leftValueCounts={column1?.values}
        rightValueCounts={column2?.values}
        noMatches={matchGroups[UNMATCHED_LEFT] || []}
        oneMatch={matchGroups[ONE_MATCH] || []}
        manyMatches={matchGroups[MANY_MATCHES] || []}
        unmatchedValues={matchGroups[UNMATCHED_RIGHT] || []}
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
