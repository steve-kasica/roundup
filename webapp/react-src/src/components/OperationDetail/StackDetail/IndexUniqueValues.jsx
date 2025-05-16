import { useEffect, memo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { requestColumnUniqueValues } from "../../../data/sagas/requestColumnUniqueValues";
import { selectColumnById } from "../../../data/slices/columnsSlice";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import { intersection, union } from "d3";
import AnimatedEllipsis from "../../ui/AnimatedElipse";

const IndexUniqueValues = memo(function IndexUniqueValues({ columnIds }) {
  const dispatch = useDispatch();

  // Local state for filtering groups
  const [showAll, setShowAll] = useState(true);
  const [showSome, setShowSome] = useState(true);
  const [showOne, setShowOne] = useState(true);

  useEffect(() => {
    console.log("requestColumnUniqueValues", columnIds);
    dispatch(requestColumnUniqueValues({ columnIds }));
  }, [dispatch, columnIds]);

  const columns = useSelector((state) =>
    columnIds.map((id) => selectColumnById(state, id))
  );

  console.log("columns", columns);

  let valuesByTableId = new Map(),
    tableIdsByValue = new Map(),
    jaccardIndex;

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

  const isLoading = valuesByTableId.size === 0 && jaccardIndex === undefined;

  return (
    <div
      style={{
        padding: "10px",
        width: "200px",
        height: "200px",
        overflowY: "auto",
      }}
    >
      <div>
        <strong>
          {isLoading ? <AnimatedEllipsis /> : tableIdsByValue.size} unique
          values <br />(
          {isLoading ? (
            <AnimatedEllipsis />
          ) : (
            `${categorizeJaccardIndex(jaccardIndex)} Overlap`
          )}
          )
        </strong>
      </div>
      <br />

      {/* Filter buttons as Chips */}
      <div style={{ display: "flex", gap: "0.25em" }}>
        <Chip
          label={
            <>All ({isLoading ? <AnimatedEllipsis /> : counts.inAllTables})</>
          }
          clickable
          color={showAll ? "success" : "default"}
          variant={showAll ? "filled" : "outlined"}
          onClick={() => setShowAll((v) => !v)}
          size="small"
          disabled={counts.inAllTables === 0}
        />
        <Chip
          label={
            <>
              One ({isLoading ? <AnimatedEllipsis /> : counts.inOnlyOneTable})
            </>
          }
          clickable
          color={showOne ? "error" : "default"}
          variant={showOne ? "filled" : "outlined"}
          onClick={() => setShowOne((v) => !v)}
          size="small"
          disabled={counts.inOnlyOneTable === 0}
        />
        <Chip
          label={
            <>Some ({isLoading ? <AnimatedEllipsis /> : counts.inSomeTables})</>
          }
          clickable
          color={showSome ? "warning" : "default"}
          variant={showSome ? "filled" : "outlined"}
          onClick={() => setShowSome((v) => !v)}
          size="small"
          disabled={counts.inSomeTables === 0}
        />
      </div>
      <hr></hr>

      <div style={{ marginTop: "1em" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5em" }}>
          {[...tableIdsByValue.entries()]
            .filter(([_, tables]) => {
              if (tables.length === counts.tableCount && showAll) return true;
              if (tables.length === 1 && showOne) return true;
              if (
                tables.length !== 1 &&
                tables.length !== counts.tableCount &&
                showSome
              )
                return true;
              return false;
            })
            .map(([key, tables]) => {
              let sx = {};
              if (tables.length === counts.tableCount) {
                sx = { backgroundColor: "#e6f4ea", color: "#137333" };
              } else if (tables.length === 1) {
                sx = { backgroundColor: "#fdecea", color: "#b71c1c" };
              } else {
                sx = { backgroundColor: "#fff8e1", color: "#ff9800" };
              }
              return (
                <Tooltip
                  key={key}
                  title={
                    <div>
                      <strong>Tables:</strong>
                      <ul style={{ margin: 0, paddingLeft: "1.2em" }}>
                        {[...valuesByTableId.keys()].map((tableId) => (
                          <li key={tableId}>
                            {tableId}: {tables.includes(tableId) ? "Yes" : "No"}
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                  arrow
                  placement="top"
                >
                  <span>
                    <Chip label={key} size="small" sx={sx} />
                  </span>
                </Tooltip>
              );
            })}
        </div>
      </div>
    </div>
  );
});

function categorizeJaccardIndex(score) {
  if (score === 0) return "No";
  if (score <= 0.25) return "Low"; // (0, 0.25]
  if (score <= 0.5) return "Some"; // (0.25, 0.5]
  if (score <= 0.75) return "Moderate"; // (0.5, 0.75]
  if (score < 1) return "High"; // (0.75, 1]
  if (score === 1) return "Complete";
}

export default IndexUniqueValues;
