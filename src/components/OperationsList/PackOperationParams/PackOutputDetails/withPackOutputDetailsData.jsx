import { useEffect, useState } from "react";
import PropTypes from "prop-types";

/**
 * This HOC interfaces with DuckDB to fetch pack stats based on the provided
 * table and column IDs, as well as the join type. It passes the fetched stats
 * and loading state as props to the wrapped component.
 * @param {*} WrappedComponent
 * @returns
 */
export default function withPackOutputDetailsData(WrappedComponent) {
  function EnhancedComponent({
    leftTableId,
    leftColumnId,
    rightTableId,
    rightColumnId,
    joinType = "EQUALS",
    ...props
  }) {
    // Add state for pack stats
    const [stats, setStats] = useState(null);
    const [isLoadingStats, setIsLoadingStats] = useState(false);

    // Use useEffect to handle the async operation
    useEffect(() => {
      if (leftColumnId && rightColumnId) {
        setIsLoadingStats(true);
      }
    }, [leftTableId, rightTableId, leftColumnId, rightColumnId, joinType]);

    return (
      <WrappedComponent
        {...props}
        isLoadingStats={isLoadingStats}
        left_unjoined={stats?.left_unjoined || 0}
        right_unjoined={stats?.right_unjoined || 0}
        one_to_one_matches={stats?.one_to_one_matches || 0}
        many_to_many_matches={stats?.many_to_many_matches || 0}
        leftTableId={leftTableId}
        leftColumnId={leftColumnId}
        rightTableId={rightTableId}
        rightColumnId={rightColumnId}
      />
    );
  }

  EnhancedComponent.propTypes = {
    leftTableId: PropTypes.string.isRequired,
    leftColumnId: PropTypes.string.isRequired,
    rightTableId: PropTypes.string.isRequired,
    rightColumnId: PropTypes.string.isRequired,
    columnId1: PropTypes.string, // Can be undefined - legacy prop
    columnId2: PropTypes.string, // Can be undefined - legacy prop
    joinType: PropTypes.oneOf([
      "EQUALS",
      "CONTAINS",
      "STARTS_WITH",
      "ENDS_WITH",
    ]),
  };

  // Set display name for debugging
  EnhancedComponent.displayName = `withPackOutputDetailsData(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return EnhancedComponent;
}
