import { useSelector } from "react-redux";
import { selectColumnById } from "../../data/slices/columnsSlice";
import { ascending, descending, intersection, union } from "d3";
import AnimatedEllipsis from "../ui/AnimatedElipse";
import { useRef } from "react";
import withColumnValuesData from "../HOC/withColumnValuesData";

export const COMPONENT_ID = "./ColumnValueMatrix";

const ROW_HEIGHT = 32; // px, adjust as needed

function ColumnValueMatrix({
  columnIds,
  allValues,
  valueCountMatrix,
  columnTableMap,
  isLoading,
}) {
  const totalColumnCount = columnIds.length;
  const totalValueCount = allValues.length;
  const yAxisWidth = 33.333; // a fixed percentage width for the Y-axis column (value names)
  const colWidth = `${(100 - yAxisWidth) / totalColumnCount}%`;
  let jaccardIndex = 0;

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
      label: "all tables",
      count: valueDegreeEntries.filter(
        ({ degree }) => degree === totalColumnCount
      ).length,
      firstValue: null, // will be set later
    },
    some: {
      label: "some tables",
      count: valueDegreeEntries.filter(
        ({ degree }) => degree < totalColumnCount && degree > 1
      ).length,
      firstValue: null, // will be set later
    },
    one: {
      label: "one table",
      count: valueDegreeEntries.filter(({ degree }) => degree === 1).length,
      firstValue: null, // will be set later
    },
  };

  // jaccardIndex =
  //   intersection(...valuesByTableId.values()).size /
  //     union(...valuesByTableId.values()).size || 0;
  // }

  const valueDegree = new Map();
  const degreeToValue = new Map();
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

  const degrees = ["all tables", "some tables", "one table"]; // fixed categories

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
        rowEl.clientHeight * 2; // compensate for sticky headers
      container.scrollTo({
        top: scroll > 0 ? scroll : 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minWidth: "200px",
        padding: "10px",
        overflow: "hidden",
      }}
    >
      <p>
        <strong>
          {totalValueCount} unique values between {totalColumnCount} columns
        </strong>
        <br />
        <em>{categorizeJaccardIndex(jaccardIndex)} overlap between columns</em>
      </p>
      <div
        style={{
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
            <div
              key={key}
              onClick={() => scrollToDegree(firstValue)}
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                padding: "2px 8px",
                width: "100%",
                cursor: "pointer",
                fontSize: "0.95em",
                height: "20px",
              }}
              title={`Scroll to values in ${label}`}
            >
              <div
                className="bar"
                style={{
                  position: "absolute",
                  top: "0px",
                  left: "0px",
                  height: "100%",
                  background: "#007bff",
                  width: `${(count / totalValueCount) * 100}%`,
                }}
              >
                <span
                  style={{
                    position: "relative",
                    zIndex: 1,
                    color: "#000",
                    paddingLeft: "4px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </span>
              </div>
              {/* <span style={{ color: "#888" }}>({count})</span> */}
            </div>
          )
        )}
      </div>
      {/* x-axis labels, columns or tables */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            borderRadius: "4px",
            overflow: "hidden",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
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
            <div
              style={{
                width: yAxisWidth + "%",
                padding: "4px",
                textAlign: "right",
                borderRight: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            ></div>
            {columnIds.map((columnId) => (
              <div
                key={columnId}
                style={{
                  width: colWidth,
                  padding: "4px",
                  textAlign: "center",
                  borderLeft: "1px solid #ccc",
                  boxSizing: "border-box",
                  overflow: "visible",
                }}
              >
                <div style={{ transform: "rotate(-45deg)", wordWrap: "unset" }}>
                  {columnTableMap.get(columnId)?.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        ref={bodyRef}
        style={{
          overflowY: "auto",
        }}
      >
        {sortedValueCountMatrix.map((row, rowIndex) => (
          <div
            key={rowIndex}
            style={{
              display: "flex",
              flexDirection: "row",
              borderBottom: "1px solid #eee",
              height: `${ROW_HEIGHT}px`,
              alignItems: "center",
            }}
          >
            <div
              ref={(el) =>
                (valueRowRefs.current[sortedAllValues[rowIndex]] = el)
              }
              style={{
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
            </div>
            {row.map((count, colIndex) => (
              <div
                key={colIndex}
                style={{
                  width: colWidth,
                  padding: "4px",
                  textAlign: "center",
                  borderLeft: "1px solid #eee",
                  boxSizing: "border-box",
                }}
              >
                <CircleMark isFilled={count > 0} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );

  function categorizeDegree(degree) {
    if (degree === totalColumnCount) return "all";
    if (degree > 1) return "some";
    if (degree === 1) return "one";
  }
}

function categorizeJaccardIndex(score) {
  if (score === 0) return "No";
  if (score < 1) return "Partial"; // (0, 1)
  if (score === 1) return "Complete";
}

function CircleMark({ isFilled }) {
  return (
    <div
      style={{
        borderRadius: "50%",
        width: "12px",
        height: "12px",
        backgroundColor: isFilled ? "black" : "transparent",
        border: "1px solid black",
        display: "inline-block",
        margin: "0 auto",
      }}
    ></div>
  );
}

const EnhancedComponent = withColumnValuesData(ColumnValueMatrix);
export default EnhancedComponent;
