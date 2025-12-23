/* eslint-disable react/prop-types */
import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { getColumnValues } from "../../lib/duckdb";
import { withColumnData } from "../HOC";
import { useSelector } from "react-redux";
import { isTableId, selectTablesById } from "../../slices/tablesSlice";
import { selectOperationsById } from "../../slices/operationsSlice";

const ColumnValues = ({
  id,
  databaseName: columnDatabaseName,
  parentId,
  limit = 20,
  scrollTop = 0,
  onScroll = () => null,
}) => {
  const [values, setValues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  const table = useSelector((state) =>
    isTableId(parentId)
      ? selectTablesById(state, parentId)
      : selectOperationsById(state, parentId)
  );

  // Reset state when id or parentId changes
  useEffect(() => {
    setValues([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, [id, parentId]);

  // Load values when offset changes or initial load
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getColumnValues(table.databaseName, columnDatabaseName, limit, offset)
      .then((result) => {
        if (isMounted) {
          setValues((prev) =>
            Array.isArray(result) ? [...prev, ...result] : prev
          );
          setHasMore(Array.isArray(result) && result.length === limit);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, parentId, offset, limit, table.databaseName, columnDatabaseName]);

  // Remove handleLoadMore and inline logic in scroll handler to avoid dependency warning

  // Add scroll event listener for lazy loading and sync
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    // Set scroll position when scrollTop changes
    if (container.scrollTop !== scrollTop) {
      container.scrollTop = scrollTop;
    }
    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 10
      ) {
        if (hasMore && !loading) {
          setOffset((prev) => prev + limit);
        }
      }
      // Notify parent of scroll position
      if (onScroll) {
        onScroll(container.scrollTop);
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, [hasMore, loading, limit, scrollTop, onScroll]);
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        border: "1px solid #eee",
        borderRadius: "4px",
        marginBottom: "10px",
        height: "100%", // Fixed height to enable scrolling
      }}
    >
      <Box
        ref={containerRef}
        sx={{
          padding: "0.5rem",
          overflowY: "auto",
          flexGrow: 1,
          minHeight: 0,
        }}
      >
        {values.map((value, i) => (
          <Typography
            key={i}
            component="div"
            sx={{
              padding: "0.25rem 0",
            }}
          >
            {value}
          </Typography>
        ))}
        {error && <Typography color="error">Error: {error}</Typography>}
        {loading && <Typography>Loading values...</Typography>}
      </Box>
    </Box>
  );
};

ColumnValues.displayName = "ColumnValues";

const EnhancedColumnValues = withColumnData(ColumnValues);

EnhancedColumnValues.displayName = "EnhancedColumnValues";

export { EnhancedColumnValues, ColumnValues };
