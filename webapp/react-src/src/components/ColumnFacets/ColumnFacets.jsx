import { useDispatch, useSelector } from "react-redux";
import { selectColumnById } from "../../data/slices/columnsSlice";
import { hsl, InternMap, rollup, scaleLinear } from "d3";
import { useEffect } from "react";
import { requestColumnFacets } from "../../data/sagas/requestColumnFacets";
import Chip from "@mui/material/Chip";

export default function ColumnDetail({ columnIds }) {
  const dispatch = useDispatch();

  useEffect(() => {
    if (columnIds.length === 0) {
      return;
    } else {
      // If columnIds is not empty, we need to request the values for the columns
      dispatch(
        requestColumnFacets({
          columnIds,
        })
      );
    }
  }, [columnIds, dispatch]);

  const columns = useSelector((state) =>
    columnIds.map((id) => selectColumnById(state, id))
  );

  // Check if any column is still loading or missing valueFacets
  const isLoading = columns.some(
    (column) =>
      column.status?.loading ||
      !column.valueFacets ||
      column.valueFacets.length === 0
  );

  if (columns.length === 0) {
    return <div>No columns selected</div>;
  } else if (isLoading) {
    return <div>Loading...</div>;
  }

  const data = columns
    .map((column) =>
      column.valueFacets.map(({ value, count }) => ({
        tableId: column.tableId,
        name: column.name,
        value,
        count,
      }))
    )
    .flat();

  const tableIds = Array.from(new Set(data.map(({ tableId }) => tableId)));
  const yDomain = new Set(data.map(({ value }) => value));
  const xDomain = new Set(data.map(({ tableId }) => tableId));

  const maxCount = Math.max(...data.map(({ count }) => count), 0);

  const colorScale = scaleLinear()
    .domain([0, maxCount])
    .range(["#f0f0f0", "#000000"]);

  const isBelowThreshold = (colorValue) => hsl(colorValue).l < 0.5;

  return (
    <table>
      <thead>
        <tr>
          <th>Value</th>
          {Array.from(xDomain).map((tableId) => (
            <th key={tableId} colSpan={2}>
              {tableId}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from(yDomain).map((value, rowIndex) => (
          <tr key={value} style={{ position: "relative" }}>
            <td>{value}</td>
            {Array.from(xDomain).map((tableId) => {
              const cellData = data.find(
                (d) => d.value === value && d.tableId === tableId
              );
              return (
                <td
                  colSpan={2}
                  key={tableId}
                  style={{
                    textAlign: "center",
                    position: "relative",
                  }}
                >
                  <Chip
                    label={cellData ? cellData.count : 0}
                    variant="outlined"
                    size="small"
                    sx={{
                      backgroundColor: cellData
                        ? colorScale(cellData.count)
                        : "white",
                      color:
                        cellData && isBelowThreshold(colorScale(cellData.count))
                          ? "white"
                          : "black",
                    }}
                  />
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
