import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { selectColumnIdsByTableId } from "../../data/slices/columnsSlice";
import ColumnValues from "./ColumnValues";
import withTableData from "../../components/HOC/withTableData";
import OpenRefineAPI from "../../services/open-refine";
import ColumnHeader from "./ColumnHeader";
import "./TableView.css";
import PropTypes from "prop-types";

function TableView({ id, remoteId, name, rowCount, columnIds }) {
  const columnCount = columnIds.length;
  const [rows, setRows] = useState([]);
  const rowsExplored = rows.length;
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 25;
  const tableContainerRef = useRef(null);

  // Fetch rows for a given page
  const fetchRows = useCallback(
    async (pageNum) => {
      setLoading(true);
      const offset = pageNum * pageSize;
      const data = await OpenRefineAPI.getRows(remoteId, offset, pageSize);
      const newRows = data.rows.map((row) => row.cells.map(({ v }) => v));
      setRows((prevRows) => {
        const updatedRows = pageNum === 0 ? newRows : [...prevRows, ...newRows];
        return updatedRows;
      });
      setLoading(false);
    },
    [remoteId, pageSize, rowCount]
  );

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
    <div className="table-view">
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
      <div
        className="table-container"
        ref={tableContainerRef}
        style={{ maxHeight: 500, overflowY: "auto" }}
      >
        <table>
          <thead>
            <tr>
              <th></th>
              {columnIds.map((columnId) => (
                <ColumnHeader key={columnId} id={columnId} />
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

TableView.propTypes = {
  id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  remoteId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  name: PropTypes.string,
  rowCount: PropTypes.number,
  columnIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
};

const EnahncedTableView = withTableData(TableView);
export default EnahncedTableView;
