import { useDispatch, useSelector } from "react-redux";
import {
  selectColumnById,
  selectSelectedColumnIds,
} from "../../data/slices/columnsSlice";
import { hsl, scaleLinear } from "d3";
import { useEffect } from "react";
import { requestColumnValues } from "../../data/sagas/requestColumnValues";
import Chip from "@mui/material/Chip";

export default function ColumnDetail() {
  const dispatch = useDispatch();
  const focusedColumnIds = useSelector(selectSelectedColumnIds);
  const focusedColumns = useSelector((state) =>
    focusedColumnIds.map((id) => selectColumnById(state, id))
  );

  useEffect(() => {
    if (focusedColumnIds.length === 0) {
      return;
    }

    const columnsWithMissingValues = focusedColumns.filter(
      ({ valueFacets }) => valueFacets.length === 0
    );
    if (columnsWithMissingValues.length > 0) {
      // If any of the columns have missing values, we need to request them
      dispatch(
        requestColumnValues({
          columnIds: columnsWithMissingValues.map(({ id }) => id),
        })
      );
    }
  }, [focusedColumnIds, focusedColumns, dispatch]);

  // Check if any column is still loading or missing valueFacets
  const isLoading = focusedColumns.some(
    (column) =>
      column.status?.loading ||
      !column.valueFacets ||
      column.valueFacets.length === 0
  );

  if (focusedColumns.length === 0) {
    return <div>No columns selected</div>;
  } else if (isLoading) {
    return <div>Loading...</div>;
  }

  const data = focusedColumns
    .map((column) =>
      column.valueFacets.map(({ value, count }) => ({
        tableId: column.tableId,
        name: column.name,
        value,
        count,
      }))
    )
    .flat();

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
                  {/* Add a horizontal line */}
                  {/* {rowIndex > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "50%",
                        left: 0,
                        right: 0,
                        height: "1px",
                        backgroundColor: "#ccc",
                        zIndex: -1,
                      }}
                    ></div>
                  )} */}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
