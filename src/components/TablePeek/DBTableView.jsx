import { useEffect, useState, useRef, useCallback, act } from "react";
import ColumnHeader from "./ColumnHeader";
import "./TableView.css";
import PropTypes from "prop-types";
import { getTableRows, summarizeTable } from "../../lib/duckdb";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { active } from "d3";
import { formatNumber } from "../../lib/utilities";

const pageSize = 25;

export default function DBTableView({
  table,
  removedColumnIds,
  activeColumnIds,
  name,
  onClose,
}) {
  const id = table.id;
  const [columns, setColumns] = useState([]);
  const [rows, setRows] = useState([]);
  const rowsExplored = rows.length;
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const tableContainerRef = useRef(null);

  const fetchColumns = useCallback(async () => {
    const columns = await summarizeTable(id, activeColumnIds);
    setColumns(columns);
  }, [id, activeColumnIds]);

  // Fetch rows for a given page
  const fetchRows = useCallback(
    async (pageNum) => {
      setLoading(true);
      const offset = pageNum * pageSize;
      const newRows = await getTableRows(id, activeColumnIds, pageSize, offset);
      setRows((prevRows) => {
        const updatedRows = pageNum === 0 ? newRows : [...prevRows, ...newRows];
        return updatedRows;
      });
      setLoading(false);
    },
    [id, activeColumnIds]
  );

  useEffect(() => {
    // Fetch columns when component mounts
    fetchColumns();
  }, [id, fetchColumns]);

  // Initial fetch or when id changes
  useEffect(() => {
    setRows([]);
    setPage(0);
    setHasMore(true);
    fetchRows(0);
  }, [id, fetchRows]);

  // Fetch next page when page changes
  useEffect(() => {
    if (page === 0) return;
    fetchRows(page);
  }, [page, fetchRows]);

  // Scroll handler for lazy loading
  useEffect(() => {
    const handleScroll = () => {
      const container = tableContainerRef.current;
      if (!container || loading || !hasMore) return;
      const { scrollTop, scrollHeight, clientHeight } = container;
      // Load more rows when scrolled near the bottom
      if (scrollHeight - scrollTop - clientHeight < 100) {
        setPage((prev) => prev + 1);
      }
    };
    const container = tableContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
    }
    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll);
      }
    };
  }, [loading, hasMore]);

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
          ({formatNumber(table.rowCount)} x {columns.length})
        </small>
      </h2>
      <p>
        Rows explored: {formatNumber(rowsExplored)} (
        {Math.round((rowsExplored / table.rowCount) * 100)}%)
      </p>
      <div
        className="table-container"
        ref={tableContainerRef}
        style={{ overflowY: "auto", height: "inherit" }}
      >
        <table>
          <thead>
            <tr>
              <th></th>
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
        {!hasMore && <div className="table-end">End of data</div>}
      </div>
    </div>
  );
}

DBTableView.propTypes = {
  table: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    rowCount: PropTypes.number.isRequired,
  }).isRequired,
  removedColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  activeColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  name: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

DBTableView.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  remoteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  rowCount: PropTypes.number,
  activeColumnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ).isRequired,
  onClose: PropTypes.func.isRequired,
};
