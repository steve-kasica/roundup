import { useRef } from "react";
import withValuesCountMatrixData from "./withValuesMatrixData";
import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";
import TableView from "./TableView";
import SimilaritySummary from "./SimilaritySummary";
import { extent } from "d3-array";

export const COMPONENT_ID = "./ColumnIndexDetails";

const ROW_HEIGHT = 32; // px, adjust as needed

const Y_AXIS_WIDTH = 33.333; // a fixed percentage width for the Y-axis column (value names)

function ColumnIndexDetails({
  data,
  tableIds,
  uniqueValues,
  valueDegrees, // degrees of each value
  signature, // signature of each value
  error,
  loading,
  columnIds,
}) {
  // Refs for each value row
  const valueRowRefs = useRef([]);
  const bodyRef = useRef(null);

  if (loading) return <pre>Loading...</pre>;
  if (error) return <pre>Error: {error.message}</pre>;

  const columnCount = columnIds.length;
  const colWidth = `${(100 - Y_AXIS_WIDTH) / columnCount}%`;

  const valueCount = uniqueValues.length;

  // Calculate value distribution across columns
  const categories = {
    all: {
      label: "all columns",
      count: valueDegrees.filter((degree) => degree === columnCount).length,
      firstIndex: valueDegrees.findIndex((degree) => degree === columnCount), // will be set later
    },
    some: {
      label: "some columns",
      count: valueDegrees.filter((degree) => degree < columnCount && degree > 1)
        .length,
      firstIndex: valueDegrees.findIndex(
        (degree) => degree < columnCount && degree > 1
      ),
    },
    one: {
      label: "one column",
      count: valueDegrees.filter(
        (degree) => degree === 1 && 1 !== columnCount // prevents counting "all" as "one"
      ).length,
      firstIndex: valueDegrees.findIndex(
        (degree) => degree === 1 && 1 !== columnCount
      ),
    },
  };

  // Scroll to the first row with the selected degree
  const scrollToDegree = (index) => {
    const rowEl = valueRowRefs.current[index];
    const container = bodyRef.current;
    if (rowEl && container) {
      // Calculate offset relative to the scrollable container
      const rowTop = rowEl.offsetTop;
      console.log(rowTop);
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

  const signatureExtent = signature.map((sig) =>
    extent(
      sig
        .split("")
        .map((v, i) => [Number(v), i])
        .filter(([b]) => b)
        .map(([b, i]) => i)
    )
  );

  console.log("Signature extent:", signatureExtent);

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
        <SimilaritySummary data={data} />
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
            ([key, { label, count, firstIndex }]) => (
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
                  onClick={() => {
                    // Scroll to the first index of this category
                    scrollToDegree(firstIndex);
                  }}
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
                      width: `${(count / valueCount) * 100}%`,
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
                  width: Y_AXIS_WIDTH + "%",
                  padding: "4px",
                  textAlign: "right",
                  borderRight: "1px solid #ccc",
                  boxSizing: "border-box",
                }}
              ></Box>
              {tableIds.map((tableId) => (
                <TableView key={tableId} id={tableId} colWidth={colWidth} />
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
          {data.map((row, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                flexDirection: "row",
                borderBottom: "1px solid #eee",
                height: `${ROW_HEIGHT}px`,
                alignItems: "center",
              }}
            >
              <Box
                ref={(el) => (valueRowRefs.current[i] = el)}
                sx={{
                  width: Y_AXIS_WIDTH + "%",
                  padding: "4px",
                  textAlign: "right",
                  borderRight: "1px solid #ccc",
                  background: "#fafafa",
                  boxSizing: "border-box",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {uniqueValues[i]}
              </Box>
              {row.map((count, j) => (
                <Box
                  key={j}
                  sx={{
                    width: colWidth,
                    padding: "4px",
                    textAlign: "center",
                    borderLeft: "none",
                    boxSizing: "border-box",
                    position: "relative",
                    "&::after":
                      valueDegrees[i] > 1
                        ? {
                            content: '""',
                            position: "absolute",
                            top: "45%",
                            left:
                              j > signatureExtent[i][0] &&
                              j <= signatureExtent[i][1]
                                ? "0"
                                : "50%",
                            right:
                              j >= signatureExtent[i][0] &&
                              j < signatureExtent[i][1]
                                ? "0"
                                : "50%",
                            height: "2px",
                            backgroundColor: "black",
                            // transform: "translateY(-50%)",
                            zIndex: 1,
                          }
                        : {},
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
}

function CircleMark({ isFilled }) {
  return (
    <Box
      sx={{
        borderRadius: "50%",
        width: "13px",
        height: "13px",
        backgroundColor: isFilled ? "black" : "#ddd",
        display: "inline-block",
        margin: "0 auto",
      }}
    ></Box>
  );
}

ColumnIndexDetails.propTypes = {
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)),
  tableIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  uniqueValues: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  valueDegrees: PropTypes.arrayOf(PropTypes.number),
  error: PropTypes.object,
  loading: PropTypes.bool,
  columnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
};

CircleMark.propTypes = {
  isFilled: PropTypes.bool.isRequired,
};

const EnhancedComponent = withValuesCountMatrixData(ColumnIndexDetails);
export default EnhancedComponent;
