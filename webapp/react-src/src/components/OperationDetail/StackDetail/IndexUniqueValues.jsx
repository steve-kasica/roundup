import { useSelector } from "react-redux";
import { selectColumnById } from "../../../data/slices/columnsSlice";
import { selectSelectedColumnIds } from "../../../data/slices/uiSlice";
import { intersection, union } from "d3";
import AnimatedEllipsis from "../../ui/AnimatedElipse";
import { useRef } from "react";
import { selectTableById } from "../../../data/slices/sourceTablesSlice/tablesSelector";

const ROW_HEIGHT = 32; // px, adjust as needed

export default function IndexUniqueValues() {
  let valuesByTableId = new Map(),
    tableIdsByValue = new Map(),
    jaccardIndex;

  const columnIds = useSelector(selectSelectedColumnIds);

  const columns = useSelector((state) =>
    columnIds.map((id) => selectColumnById(state, id))
  );

  const tables = useSelector((state) =>
    columns.map((column) => selectTableById(state, column.tableId))
  );

  const tableIdToName = new Map(tables.map((table) => [table.id, table.name]));

  const counts = {
    tableCount: columnIds.length,
    inAllTables: 0,
    inSomeTables: 0,
    inOnlyOneTable: 0,
  };

  if (!columns.some((column) => !column || column.status.isLoading)) {
    // Create a map of tableId to Set of unique values
    columns.forEach((column) => {
      valuesByTableId.set(column.tableId, new Set(Object.keys(column.values)));
    });
    // Invert `valuesByTableId` to create a map of value to tableIds
    for (const [tableId, valuesSet] of valuesByTableId.entries()) {
      for (const value of valuesSet) {
        if (!tableIdsByValue.has(value)) {
          tableIdsByValue.set(value, []);
        }
        tableIdsByValue.get(value).push(tableId);
      }
    }

    for (const tables of tableIdsByValue.values()) {
      if (tables.length === counts.tableCount) {
        counts.inAllTables++;
      } else if (tables.length === 1) {
        counts.inOnlyOneTable++;
      } else {
        counts.inSomeTables++;
      }
    }

    jaccardIndex =
      intersection(...valuesByTableId.values()).size /
        union(...valuesByTableId.values()).size || 0;
  }

  const isLoading = valuesByTableId.size === 0;

  // Get all table IDs and unique values for the table
  const allTableIds = Array.from(valuesByTableId.keys());
  const allUniqueValues = Array.from(tableIdsByValue.keys());

  // --- New code for navigation by degree ---
  // Map degree (number of tables) to first value with that degree
  const degreeToValue = new Map();
  const valueToDegree = new Map();
  allUniqueValues.forEach((value) => {
    const degree = tableIdsByValue.get(value).length;
    valueToDegree.set(value, degree);
    if (!degreeToValue.has(degree)) {
      degreeToValue.set(degree, value);
    }
  });
  const sortedDegrees = Array.from(degreeToValue.keys()).sort((a, b) => a - b);

  // Build a map: degree -> count of unique values with that degree
  const degreeCounts = {};
  allUniqueValues.forEach((value) => {
    const degree = valueToDegree.get(value);
    degreeCounts[degree] = (degreeCounts[degree] || 0) + 1;
  });

  // Refs for each value row
  const valueRowRefs = useRef({});
  const bodyRef = useRef(null); // <-- Add this

  // Scroll to the first row with the selected degree
  const scrollToDegree = (degree) => {
    const value = degreeToValue.get(degree);
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
  // --- End new code ---

  const colCount = allTableIds.length + 1;
  const colWidth = `${100 / colCount}%`;

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
        <strong> {tableIdsByValue.size} unique values</strong>
        <br />
        <em>{categorizeJaccardIndex(jaccardIndex)} overlap between tables</em>
      </p>
      <div
        style={{ display: "flex", flexDirection: "column", overflow: "hidden" }}
      >
        {/* --- Navigation bar for degrees --- */}
        {!isLoading && (
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
            {[...sortedDegrees].reverse().map((degree) => (
              <button
                key={degree}
                onClick={() => scrollToDegree(degree)}
                style={{
                  padding: "2px 8px",
                  borderRadius: "12px",
                  border: "1px solid #888",
                  background: "#f5f5f5",
                  cursor: "pointer",
                  fontSize: "0.95em",
                  width: "100%",
                  textAlign: "left",
                }}
                title={`Scroll to values in ${degree} table${
                  degree > 1 ? "s" : ""
                }`}
              >
                {degree} table{degree > 1 ? "s" : ""}{" "}
                <span style={{ color: "#888" }}>({degreeCounts[degree]})</span>
              </button>
            ))}
          </div>
        )}
        {/* --- End navigation bar --- */}
        <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
          {isLoading ? (
            <AnimatedEllipsis />
          ) : (
            <div
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                overflow: "hidden",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  position: "sticky",
                  top: 0,
                  background: "#fff",
                  zIndex: 2,
                  borderBottom: "1px solid #ccc",
                  fontWeight: "bold",
                  height: ROW_HEIGHT,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: colWidth,
                    padding: "4px",
                    textAlign: "right",
                    borderRight: "1px solid #ccc",
                    boxSizing: "border-box",
                  }}
                ></div>
                {allTableIds.map((tableId) => (
                  <div
                    key={tableId}
                    style={{
                      width: colWidth,
                      padding: "4px",
                      textAlign: "center",
                      borderLeft: "1px solid #ccc",
                      boxSizing: "border-box",
                      overflow: "visible",
                    }}
                  >
                    <div
                      style={{ transform: "rotate(-45deg)", wordWrap: "unset" }}
                    >
                      {tableIdToName.get(tableId)}
                    </div>
                  </div>
                ))}
              </div>
              {/* Percent Row */}
              <div
                style={{
                  display: "flex",
                  position: "sticky",
                  top: ROW_HEIGHT,
                  background: "#fff",
                  zIndex: 1,
                  borderBottom: "1px solid #ccc",
                  fontSize: "0.95em",
                  height: ROW_HEIGHT,
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    width: colWidth,
                    padding: "4px",
                    boxSizing: "border-box",
                  }}
                >
                  Coverage
                </div>
                {allTableIds.map((tableId) => {
                  const tableUniqueCount =
                    valuesByTableId.get(tableId)?.size ?? 0;
                  const percent =
                    allUniqueValues.length > 0
                      ? (
                          (tableUniqueCount / allUniqueValues.length) *
                          100
                        ).toFixed(1)
                      : "0.0";
                  return (
                    <div
                      key={tableId + "-percent"}
                      style={{
                        width: colWidth,
                        padding: "4px",
                        textAlign: "center",
                        borderLeft: "1px solid #ccc",
                        boxSizing: "border-box",
                      }}
                    >
                      {percent}%
                    </div>
                  );
                })}
              </div>
              {/* Body */}
              <div
                ref={bodyRef}
                style={{
                  overflowY: "auto",
                  // maxHeight: 128,
                }}
              >
                {allUniqueValues
                  .sort(
                    (a, b) =>
                      tableIdsByValue.get(b).length -
                      tableIdsByValue.get(a).length
                  )
                  .map((value) => (
                    <div
                      key={value}
                      ref={(el) => (valueRowRefs.current[value] = el)}
                      data-degree={valueToDegree.get(value)}
                      style={{
                        display: "flex",
                        borderBottom: "1px solid #eee",
                        alignItems: "center",
                        height: ROW_HEIGHT,
                      }}
                    >
                      <div
                        style={{
                          width: colWidth,
                          padding: "4px",
                          textAlign: "right",
                          borderRight: "1px solid #ccc",
                          background: "#fafafa",
                          boxSizing: "border-box",
                        }}
                      >
                        {value}
                      </div>
                      {allTableIds.map((tableId) => (
                        <div
                          key={tableId}
                          style={{
                            width: colWidth,
                            padding: "4px",
                            textAlign: "center",
                            borderLeft: "1px solid #eee",
                            boxSizing: "border-box",
                          }}
                        >
                          {
                            tableIdsByValue.get(value).includes(tableId) ? (
                              <div
                                style={{
                                  borderRadius: "50%",
                                  width: "12px",
                                  height: "12px",
                                  backgroundColor: "black",
                                  display: "inline-block",
                                  margin: "0 auto",
                                }}
                              ></div> // filled circle
                            ) : (
                              <div
                                style={{
                                  borderRadius: "50%",
                                  width: "12px",
                                  height: "12px",
                                  backgroundColor: "transparent",
                                  border: "1px solid black",
                                  display: "inline-block",
                                  margin: "0 auto",
                                }}
                              ></div>
                            ) // empty circle
                          }
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function categorizeJaccardIndex(score) {
  if (score === 0) return "No";
  if (score < 1) return "Partial"; // (0, 1)
  if (score === 1) return "Complete";
}
