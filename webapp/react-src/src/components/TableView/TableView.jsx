import React from "react";
import { useSelector } from "react-redux";
import { selectColumnIdsByTableId } from "../../data/slices/columnsSlice";
import ColumnValues from "./ColumnValues";
import withTableData from "../../components/HOC/withTableData";

function TableView({ id, rowCount, columnIds, name, rowsExplored }) {
  const columnCount = columnIds.length;

  return (
    <>
      <h2>
        {name}{" "}
        <small>
          ({columnCount} x {rowCount})
        </small>
      </h2>
      <p>
        Rows explored: {rowsExplored} (
        {Math.round((rowsExplored / rowCount) * 100)}%)
      </p>
      <div style={{ display: "flex", gap: "2rem", flexDirection: "column" }}>
        {/* Table header */}
        <div style={{ display: "flex", gap: "2rem", flexDirection: "row" }}>
          {columnIds.map((columnId) => (
            <div key={columnId} style={{ width: "100%", textAlign: "center" }}>
              {columnId}
            </div>
          ))}
        </div>
        {/* Table body */}
        <div
          style={{
            display: "flex",
            gap: "2rem",
            width: "100%",
            height: "200px",
            overflowY: "auto",
            border: "1px solid black",
          }}
        >
          {columnIds.map((columnId) => (
            <ColumnValues
              key={columnId}
              id={columnId}
              isDraggable={false}
              rowsExplored={rowsExplored}
            />
          ))}
        </div>
      </div>
    </>
  );
}

const EnahncedTableView = withTableData(TableView);
export default EnahncedTableView;
