import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { getMatchValues } from "../../../../../lib/duckdb";
import { JOIN_PREDICATES } from "../../../../../slices/operationsSlice";

export const MATCH_TYPES = {
  LEFT_UNJOINED: "left_unjoined",
  RIGHT_UNJOINED: "right_unjoined",
  MATCHES: "matches",
};

export default function withMatchDetailData(WrappedComponent) {
  function EnhancedComponent({
    leftTableId,
    leftColumnId,
    rightTableId,
    rightColumnId,
    joinPredicate = JOIN_PREDICATES.EQUALS,
    matchType = MATCH_TYPES.MATCHES,
    ...props
  }) {
    // Database query state
    const [matches, setMatches] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("total_count"); // 'left_count', 'right_count', or 'total_count'
    const [sortOrder, setSortOrder] = useState("DESC"); // 'ACS' or 'DESC'

    // Effect to execute database query when dependencies change
    useEffect(() => {
      // Failsafe: Check if required parameters are defined
      if (!leftTableId || !rightTableId || !leftColumnId || !rightColumnId) {
        setMatches(null);
        setIsLoadingStats(false);
        setError(null);
        return;
      }

      setIsLoadingStats(true);
      setError(null);

      getMatchValues(
        leftTableId,
        rightTableId,
        leftColumnId,
        rightColumnId,
        joinPredicate,
        matchType,
        100, // Default limit
        sortBy,
        sortOrder
      )
        .then((result) => {
          console.log("Match values:", result);
          setMatches(
            // Format results into the schema expected by the MatchDetails component
            // Also cast BigInt values to Numbers
            result.map((row) => ({
              left: { value: row.left_value, count: Number(row.left_count) },
              right: { value: row.right_value, count: Number(row.right_count) },
              rowCount: Number(row.total_count),
            }))
          );
        })
        .catch((err) => {
          console.error("Error calculating match values:", err);
          setError(err.message || "Failed to calculate match values");
        })
        .finally(() => {
          setIsLoadingStats(false);
        });
    }, [
      leftTableId,
      rightTableId,
      leftColumnId,
      rightColumnId,
      joinPredicate,
      matchType,
      sortBy,
      sortOrder,
    ]);

    return (
      <WrappedComponent
        {...props}
        isLoadingStats={isLoadingStats}
        // Table and column references
        leftTableId={leftTableId}
        rightTableId={rightTableId}
        leftColumnId={leftColumnId}
        rightColumnId={rightColumnId}
        // Database query results
        matches={matches}
        error={error}
        // Callbacks to set sorting
        setSortBy={setSortBy}
        setSortOrder={setSortOrder}
      />
    );
  }

  EnhancedComponent.displayName = `withMatchDetailData(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  EnhancedComponent.propTypes = {
    leftTableId: PropTypes.string.isRequired,
    leftColumnId: PropTypes.string.isRequired,
    rightTableId: PropTypes.string.isRequired,
    rightColumnId: PropTypes.string.isRequired,
    joinType: PropTypes.oneOf([
      "EQUALS",
      "CONTAINS",
      "STARTS_WITH",
      "ENDS_WITH",
    ]),
  };

  return EnhancedComponent;
}
