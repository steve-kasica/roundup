import PropTypes from "prop-types";
import withColumnComparisonData from "./withColumnComparisonData";
import MatchSection from "./MatchSection";

function CompareColumns({
  column1,
  column2,
  leftTableName,
  rightTableName,
  noMatchesLeft,
  oneMatch,
  manyMatches,
  noMatchesRight,
}) {
  const totalMatches =
    !column1 || !column2
      ? -1
      : oneMatch.length +
        noMatchesLeft.length +
        manyMatches.length +
        noMatchesRight.length;

  // Helper function to calculate percentage for bar chart

  return (
    <div>
      <MatchSection
        title={`${leftTableName} unmatched`}
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={noMatchesLeft}
        totalMatches={totalMatches}
        matchType="none"
      />
      <MatchSection
        title="Matches"
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={oneMatch}
        totalMatches={totalMatches}
        matchType="single"
      />
      {/* <MatchSection
        title="Many matches"
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={manyMatches}
        totalMatches={totalMatches}
        matchType="many"
      /> */}
      <MatchSection
        title={`${rightTableName} unmatched`}
        leftTitle={column1?.name || "Column 1"}
        rightTitle={column2?.name || "Column 2"}
        matches={noMatchesRight}
        totalMatches={totalMatches}
        matchType="unmatched"
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
  leftTableName: PropTypes.string,
  rightTableName: PropTypes.string,
  leftValueCounts: PropTypes.object,
  rightValueCounts: PropTypes.object,
  noMatches: PropTypes.array,
  oneMatchLeft: PropTypes.array,
  manyMatches: PropTypes.array,
  noMatchesRight: PropTypes.array,
};

const EnhancedCompareColumns = withColumnComparisonData(CompareColumns);
export default EnhancedCompareColumns;
