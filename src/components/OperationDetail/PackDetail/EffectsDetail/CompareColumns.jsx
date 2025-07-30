import PropTypes from "prop-types";
import { Chip } from "@mui/material";
import withColumnComparisonData from "./withColumnComparisonData";
import BarChart from "./BarChart";

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

      {/* <BipartiteGraph
        values1={values1}
        values2={values2}
        noMatches={noMatches}
        oneMatch={oneMatch}
        manyMatches={manyMatches}
        column1Name={column1?.name}
        column2Name={column2?.name}
      /> */}
      {/* <svg
        style={{
          width: "100%",
          height: "300px",
          border: "1px solid #ddd",
          backgroundColor: "#fff",
        }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 800 300"
      > */}
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
      <h2>Single Matches</h2>
      <div style={{ height: "300px", overflowY: "auto" }}>
        {oneMatch.map(([value, matches]) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              marginBottom: "8px",
              position: "relative",
            }}
            key={value}
          >
            <Chip
              label={value}
              variant="outlined"
              sx={{
                flex: 1,
                position: "relative",
              }}
            />
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "5px",
                  backgroundColor: "#4CAF50",
                  opacity: 0.6,
                }}
              />
            </div>
            <Chip label={matches[0]} variant="outlined" sx={{ flex: 1 }} />
          </div>
        ))}
      </div>

      <h2>No Matches</h2>
      <div style={{ height: "300px", overflowY: "auto" }}>
        {noMatches.map(([value]) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              marginBottom: "8px",
              position: "relative",
            }}
            key={value}
          >
            <Chip
              label={value}
              variant="outlined"
              sx={{
                flex: 1,
                position: "relative",
              }}
            />
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "5px",
                  backgroundColor: "#f44336",
                  opacity: 0.6,
                }}
              />
            </div>
            <Chip
              label={<em>no match</em>}
              variant="outlined"
              sx={{
                flex: 1,
                position: "relative",
              }}
            />
          </div>
        ))}
      </div>

      <h2>Many Matches</h2>
      <div style={{ height: "300px", overflowY: "auto" }}>
        {manyMatches.map(([value, matches]) => (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              textAlign: "center",
              marginBottom: "8px",
              position: "relative",
            }}
            key={value}
          >
            <Chip
              label={value}
              variant="outlined"
              sx={{
                flex: 1,
                position: "relative",
              }}
            />
            <div
              style={{
                flex: 1,
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "5px",
                  backgroundColor: "#FF9800",
                  opacity: 0.6,
                }}
              />
            </div>
            <Chip
              label={`${matches.length} matches`}
              variant="outlined"
              sx={{ flex: 1 }}
            />
          </div>
        ))}
      </div>
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
