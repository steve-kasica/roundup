import PropTypes from "prop-types";
import withColumnComparisonData from "./withColumnComparisonData";

function CompareColumns({
  table1,
  table2,
  column1,
  column2,
  values1,
  values2,
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

        {/* Bar Chart */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            width: "100%",
          }}
        >
          {/* Single Matches Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                minWidth: "60px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#4CAF50",
              }}
            >
              Single
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                height: "20px",
                overflow: "hidden",
              }}
            >
              {oneMatch.length > 0 && (
                <div
                  style={{
                    width: `${(oneMatch.length / values1.size) * 100}%`,
                    height: "100%",
                    backgroundColor: "#4CAF50",
                  }}
                />
              )}
            </div>
            <div
              style={{
                minWidth: "30px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#4CAF50",
                textAlign: "right",
              }}
            >
              {oneMatch.length}
            </div>
          </div>

          {/* No Matches Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                minWidth: "60px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#f44336",
              }}
            >
              None
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                height: "20px",
                overflow: "hidden",
              }}
            >
              {noMatches.length > 0 && (
                <div
                  style={{
                    width: `${(noMatches.length / values1.size) * 100}%`,
                    height: "100%",
                    backgroundColor: "#f44336",
                  }}
                />
              )}
            </div>
            <div
              style={{
                minWidth: "30px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#f44336",
                textAlign: "right",
              }}
            >
              {noMatches.length}
            </div>
          </div>

          {/* Many Matches Bar */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                minWidth: "60px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#FF9800",
              }}
            >
              Many
            </div>
            <div
              style={{
                flex: 1,
                backgroundColor: "#f0f0f0",
                height: "20px",
                overflow: "hidden",
              }}
            >
              {manyMatches.length > 0 && (
                <div
                  style={{
                    width: `${(manyMatches.length / values1.size) * 100}%`,
                    height: "100%",
                    backgroundColor: "#FF9800",
                  }}
                />
              )}
            </div>
            <div
              style={{
                minWidth: "30px",
                fontSize: "12px",
                fontWeight: "bold",
                color: "#FF9800",
                textAlign: "right",
              }}
            >
              {manyMatches.length}
            </div>
          </div>
        </div>
      </div>

      {/* <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <div style={{ flex: 1 }}>
          <h3>
            {table1?.name} - {column1?.name}
          </h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[...values1].map((value) => (
              <div
                key={value}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                }}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <h3>
            {table2?.name} - {column2?.name}
          </h3>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {[...values2].map((value) => (
              <div
                key={value}
                style={{
                  padding: "4px 8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  backgroundColor: "#fff",
                }}
              >
                {value}
              </div>
            ))}
          </div>
        </div>
      </div> */}
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
