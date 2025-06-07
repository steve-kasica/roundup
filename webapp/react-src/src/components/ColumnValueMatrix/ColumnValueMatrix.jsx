import { useRef } from "react";
import withColumnValuesData from "../HOC/withColumnValuesData";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

export const COMPONENT_ID = "./ColumnValueMatrix";

const ROW_HEIGHT = 32; // px, adjust as needed

function ColumnValueMatrix({
  columnIds,
  allValues,
  valueCountMatrix,
  columnTableMap,
}) {
  const totalColumnCount = columnIds.length;
  const totalValueCount = allValues.length;
  const yAxisWidth = 33.333; // a fixed percentage width for the Y-axis column (value names)
  const colWidth = `${(100 - yAxisWidth) / totalColumnCount}%`;

  // Sort allValues and valueCountMatrix by degree (descending),
  // and for equal degree, group by the set of columns (tables) where the value appears
  const valueDegreeEntries = allValues.map((value, i) => {
    const row = valueCountMatrix[i];
    const degree = row.filter((c) => c > 0).length;
    // Create a signature: a string of indices of columns with nonzero count, joined by '-'
    const signature = row
      .map((c, idx) => (c > 0 ? idx : null))
      .filter((x) => x !== null)
      .join("-");
    return { value, row, degree, signature };
  });
  valueDegreeEntries.sort((a, b) => {
    if (b.degree !== a.degree) return b.degree - a.degree;
    // For equal degree, group by signature (lexicographically)
    if (a.signature < b.signature) return -1;
    if (a.signature > b.signature) return 1;
    return 0;
  });
  const sortedAllValues = valueDegreeEntries.map((entry) => entry.value);
  const sortedValueCountMatrix = valueDegreeEntries.map((entry) => entry.row);

  // Calculate value distribution across columns
  const categories = {
    all: {
      label: "all columns",
      count: valueDegreeEntries.filter(
        ({ degree }) => degree === totalColumnCount
      ).length,
      firstValue: null, // will be set later
    },
    some: {
      label: "some columns",
      count: valueDegreeEntries.filter(
        ({ degree }) => degree < totalColumnCount && degree > 1
      ).length,
      firstValue: null, // will be set later
    },
    one: {
      label: "one column",
      count: valueDegreeEntries.filter(({ degree }) => degree === 1).length,
      firstValue: null, // will be set later
    },
  };

  const jaccardIndex = categories.all.count / totalValueCount;

  const valueDegree = new Map();
  sortedAllValues.forEach((value, rowIndex) => {
    const row = sortedValueCountMatrix[rowIndex];
    const degree = row.filter((c) => c > 0).length;
    valueDegree.set(value, degree);
    // Map degree category to first value with that degree
    const degreeCategory = categorizeDegree(degree);
    if (categories[degreeCategory].firstValue === null) {
      categories[degreeCategory].firstValue = value;
    }
  });

  // Refs for each value row
  const valueRowRefs = useRef({});
  const bodyRef = useRef(null);

  // Scroll to the first row with the selected degree
  const scrollToDegree = (value) => {
    const rowEl = value && valueRowRefs.current[value];
    const container = bodyRef.current;
    if (rowEl && container) {
      // Calculate offset relative to the scrollable container
      const rowTop = rowEl.offsetTop;
      // Optionally, center the row:
      const scroll =
        rowTop -
        container.offsetTop -
        container.clientHeight / 2 +
        rowEl.clientHeight / 2 +
        rowEl.clientHeight * 7; // compensate for sticky headers
      container.scrollTo({
        top: scroll > 0 ? scroll : 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "300px",
        overflow: "hidden",
      }}
    >
      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Summary
        </Typography>
        <Typography variant="body2">
          {totalValueCount} unique value{totalValueCount > 1 ? "s" : ""} with{" "}
          <em>{categorizeJaccardIndex(jaccardIndex)}</em> overlap between all{" "}
          {totalColumnCount} columns (Jaccard Index = {jaccardIndex.toFixed(2)}
          ).
        </Typography>
      </Box>

      <Box
        sx={{
          mt: 2,
        }}
      >
        <Typography variant="h6">Column inclusion</Typography>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          The number of unique values that appear in each category
        </Typography>
        <Box
          sx={{
            minWidth: "90px",
            marginRight: "8px",
            display: "flex",
            flexDirection: "column",
            gap: "4px",
            alignItems: "flex-start",
          }}
        >
          {Object.entries(categories).map(
            ([key, { label, count, firstValue }]) => (
              <Box
                key={key}
                sx={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "row",
                  width: "100%",
                  alignItems: "center",
                  color: count > 0 ? "#333" : "#aaa",
                  padding: "2px 8px",
                  fontSize: "0.75em",
                  height: "15px",
                  lineHeight: "15px",
                }}
                title={`Click to scroll to values in ${label}`}
              >
                <Box
                  className="label"
                  onClick={() => scrollToDegree(firstValue)}
                  sx={{
                    width: "100px",
                    textAlign: "right",
                    cursor: "pointer",
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: "1em",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                      paddingRight: "15px",
                    }}
                  >
                    {label}
                  </Typography>
                </Box>
                <style>
                  {`
                .bar-container::before {
                content: "—";
                position: absolute;
                margin-left: -10px;
                margin-top: 3px;
                ;}
                `}
                </style>
                <Box
                  className="bar-container"
                  sx={{
                    flex: 1,
                  }}
                >
                  <Box
                    className="bar"
                    sx={{
                      background: "#e0e0e0",
                      width: `${(count / totalValueCount) * 100}%`,
                      minWidth: "1px",
                      textAlign: "right",
                    }}
                  >
                    <Typography
                      component="span"
                      sx={{
                        position: "relative",
                        fontSize: "1em",
                        zIndex: 1,
                        paddingLeft: "4px",
                        whiteSpace: "nowrap",
                        lineHeight: "20px",
                        paddingRight: "5px",
                      }}
                    >
                      <small>{count}</small>
                    </Typography>
                  </Box>
                </Box>
                {/* <span sx={{ color: "#888" }}>({count})</span> */}
              </Box>
            )
          )}
        </Box>
      </Box>

      <Box sx={{ mt: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Value distribution across columns
        </Typography>
        {/* x-axis labels, columns or tables */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box
            sx={{
              borderRadius: "4px",
              overflow: "hidden",
              height: "100%",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                position: "sticky",
                top: 0,
                background: "#fff",
                zIndex: 2,
                borderBottom: "1px solid #ccc",
                fontWeight: "bold",
                height: ROW_HEIGHT + "px",
                alignItems: "center",
              }}
            >
              <Box
                sx={{
                  width: yAxisWidth + "%",
                  padding: "4px",
                  textAlign: "right",
                  borderRight: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              ></Box>
              {columnIds.map((columnId) => (
                <Box
                  key={columnId}
                  sx={{
                    width: colWidth,
                    padding: "4px",
                    textAlign: "center",
                    borderLeft: "1px solid #ccc",
                    boxSizing: "border-box",
                    overflow: "visible",
                  }}
                >
                  <Box sx={{ transform: "rotate(-45deg)", wordWrap: "unset" }}>
                    {columnTableMap.get(columnId)?.name}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
        <Box
          ref={bodyRef}
          sx={{
            overflowY: "auto",
            maxHeight: "400px",
          }}
        >
          {sortedValueCountMatrix.map((row, rowIndex) => (
            <Box
              key={rowIndex}
              sx={{
                display: "flex",
                flexDirection: "row",
                borderBottom: "1px solid #eee",
                height: `${ROW_HEIGHT}px`,
                alignItems: "center",
              }}
            >
              <Box
                ref={(el) =>
                  (valueRowRefs.current[sortedAllValues[rowIndex]] = el)
                }
                sx={{
                  width: yAxisWidth + "%",
                  padding: "4px",
                  textAlign: "right",
                  borderRight: "1px solid #ccc",
                  background: "#fafafa",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {sortedAllValues[rowIndex]}
              </Box>
              {row.map((count, colIndex) => (
                <Box
                  key={colIndex}
                  sx={{
                    width: colWidth,
                    padding: "4px",
                    textAlign: "center",
                    borderLeft: "1px solid #eee",
                    boxSizing: "border-box",
                  }}
                >
                  <CircleMark isFilled={count > 0} />
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );

  function categorizeDegree(degree) {
    if (degree === totalColumnCount) return "all";
    if (degree > 1) return "some";
    if (degree === 1) return "one";
  }
}

function categorizeJaccardIndex(score) {
  if (score === 0) return "no";
  if (score < 1) return "partial"; // (0, 1)
  if (score === 1) return "complete";
}

function CircleMark({ isFilled }) {
  return (
    <Box
      sx={{
        borderRadius: "50%",
        width: "12px",
        height: "12px",
        backgroundColor: isFilled ? "black" : "transparent",
        border: "1px solid black",
        display: "inline-block",
        margin: "0 auto",
      }}
    ></Box>
  );
}

ColumnValueMatrix.propTypes = {
  columnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  allValues: PropTypes.array.isRequired,
  valueCountMatrix: PropTypes.arrayOf(PropTypes.array).isRequired,
  columnTableMap: PropTypes.instanceOf(Map).isRequired,
};

CircleMark.propTypes = {
  isFilled: PropTypes.bool.isRequired,
};

const EnhancedComponent = withColumnValuesData(ColumnValueMatrix);
export default EnhancedComponent;
