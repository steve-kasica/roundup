/**
 * Example of using the withPaginatedRows HOC with DBTableView
 */
import { useEffect, useState, useCallback } from "react";
import ColumnHeader from "./ColumnHeader";
import "./TableView.css";
import PropTypes from "prop-types";
import { summarizeTable } from "../../lib/duckdb";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { formatNumber } from "../../lib/utilities";
import withPaginatedRows from "../HOC/withPaginatedRows";

function DBTableView({
  table,
  operation,
  activeColumnIds,
  onClose,
  // Props from withPaginatedRows HOC
  rows,
  rowsExplored,
  loading,
  hasMore,
  error,
  tableContainerRef,
}) {
  const id = table?.id || operation?.id;
  const rowCount = table?.rowCount || operation?.rowCount || 0;
  const name = table?.name || operation?.name || "View";

  const [columns, setColumns] = useState([]);

  const fetchColumns = useCallback(async () => {
    const columns = await summarizeTable(id, activeColumnIds);
    setColumns(columns);
  }, [id, activeColumnIds]);

  useEffect(() => {
    // Fetch columns when component mounts
    fetchColumns();
  }, [id, fetchColumns]);

  return (
    <div
      className="table-view"
      style={{ position: "relative", height: "300px", paddingBottom: "50px" }}
    >
      <IconButton
        aria-label="close"
        onClick={onClose}
        style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
        size="small"
      >
        <CloseIcon />
      </IconButton>
      <h2>
        {name}{" "}
        <small>
          ({formatNumber(rowCount)} x {columns.length})
        </small>
      </h2>
      <p>
        Rows explored: {formatNumber(rowsExplored)} (
        {Math.round((rowsExplored / rowCount) * 100)}%)
      </p>

      {error && (
        <div
          className="table-error"
          style={{ color: "red", marginBottom: "10px" }}
        >
          Error loading data: {error.message}
        </div>
      )}

      <div
        className="table-container"
        ref={tableContainerRef}
        style={{ overflowY: "auto", height: "inherit" }}
      >
        <table>
          <thead
            style={{
              position: "sticky",
              top: 0,
              zIndex: 10,
              backgroundColor: "white",
            }}
          >
            <tr>
              <th
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: "white",
                  zIndex: 11,
                }}
              ></th>
              {Array.from({ length: columns.length }, (_, i) => (
                <ColumnHeader key={i} id={columns[i]?.column_name} />
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length > 0
              ? rows.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    <td>{rowIndex + 1}.</td>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        {loading && <div className="table-loading">Loading...</div>}
        {!hasMore && rows.length > 0 && (
          <div className="table-end">End of data</div>
        )}
        {!loading && rows.length === 0 && (
          <div className="table-empty">No data available</div>
        )}
      </div>
    </div>
  );
}

DBTableView.propTypes = {
  table: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rowCount: PropTypes.number.isRequired,
    name: PropTypes.string,
  }),
  operation: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rowCount: PropTypes.number,
    name: PropTypes.string,
  }),
  activeColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  onClose: PropTypes.func.isRequired,
  // Props from withPaginatedRows HOC
  rows: PropTypes.array,
  rowsExplored: PropTypes.number,
  loading: PropTypes.bool,
  hasMore: PropTypes.bool,
  error: PropTypes.object,
  tableContainerRef: PropTypes.object,
};

// Export the enhanced component with pagination
const EnhancedDBTableView = withPaginatedRows(DBTableView, {
  pageSize: 25,
  scrollThreshold: 100,
});

EnhancedDBTableView.displayName = "EnhancedDBTableView";

export default EnhancedDBTableView;
