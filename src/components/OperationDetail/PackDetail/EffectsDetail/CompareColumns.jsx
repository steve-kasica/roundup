import PropTypes from "prop-types";
import withColumnComparisonData from "./withColumnComparisonData";
import BarChart from "./BarChart";
import MatchSection from "./MatchSection";

function CompareColumns({
  column1,
  column2,
  values1,
  noMatches,
  oneMatch,
  manyMatches,
}) {
  if (!column1 || !column2) {
    return (
      <div style={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
        <h2>Effects Detail</h2>
        <p>
          Please select key columns for both tables to see the effects detail.
        </p>
      </div>
    );
  }

  const chipHeight = "32px";

  return (
    <div style={{ padding: "16px", backgroundColor: "#f9f9f9" }}>
      {/* Metrics Section */}
      <div
        style={{
          marginBottom: "16px",
          padding: "12px",
          backgroundColor: "#fff",
          borderRadius: "4px",
          border: "1px solid #ddd",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0" }}>Join Metrics</h4>

        <BarChart
          data={[
            {
              label: "Single",
              value: oneMatch.length,
              color: "#4CAF50",
            },
            {
              label: "None",
              value: noMatches.length,
              color: "#f44336",
            },
            {
              label: "Many",
              value: manyMatches.length,
              color: "#FF9800",
            },
          ]}
          total={values1.size}
        />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          textAlign: "center",
          marginBottom: "16px",
          padding: "8px 0",
          borderBottom: "1px solid #ddd",
        }}
      >
        <div style={{ flex: 1, fontWeight: "bold" }}>
          {column1?.name || "Column 1"}
        </div>
        <div style={{ flex: 1, textAlign: "center" }}></div>
        <div style={{ flex: 1, fontWeight: "bold" }}>
          {column2?.name || "Column 2"}
        </div>
      </div>

      <MatchSection
        title="Single Matches"
        matches={oneMatch}
        matchType="single"
        chipHeight={chipHeight}
      />

      <MatchSection
        title="No Matches"
        matches={noMatches}
        matchType="none"
        chipHeight={chipHeight}
      />

      <MatchSection
        title="Many Matches"
        matches={manyMatches}
        matchType="many"
        chipHeight={chipHeight}
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
};

const EnhancedCompareColumns = withColumnComparisonData(CompareColumns);
export default EnhancedCompareColumns;
