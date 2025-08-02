import PropTypes from "prop-types";
import withColumnComparisonData from "./withColumnComparisonData";
import MatchSection from "./MatchSection";

function CompareColumns({
  column1,
  column2,
  values1,
  noMatches,
  oneMatch,
  manyMatches,
  unmatchedValues,
}) {
  const totalMatches =
    !column1 || !column2
      ? -1
      : oneMatch.length + noMatches.length + manyMatches.length;

  // Helper function to calculate percentage for bar chart

  return (
    <div>
      <MatchSection
        title="Single match"
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={oneMatch}
        totalMatches={totalMatches}
        matchType="single"
      />

      <MatchSection
        title="No matches"
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={noMatches}
        totalMatches={totalMatches}
        matchType="none"
      />
      <MatchSection
        title="Unmatched values"
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={unmatchedValues}
        totalMatches={totalMatches}
        matchType="unmatched"
      />

      <MatchSection
        title="Many matches"
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={manyMatches}
        totalMatches={totalMatches}
        matchType="many"
      />
    </div>
  );
}

CompareColumns.propTypes = {
  table1: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
  table2: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
  }),
  column1: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    values: PropTypes.object,
  }),
  column2: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    values: PropTypes.object,
  }),
  values1: PropTypes.instanceOf(Set),
  values2: PropTypes.instanceOf(Set),
  noMatches: PropTypes.array,
  oneMatch: PropTypes.array,
  manyMatches: PropTypes.array,
  unmatchedValues: PropTypes.array,
};

const EnhancedCompareColumns = withColumnComparisonData(CompareColumns);
export default EnhancedCompareColumns;
