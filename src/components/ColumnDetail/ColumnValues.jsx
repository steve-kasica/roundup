import { Box, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { getColumnValues } from "../../lib/duckdb";

const ColumnValues = ({
  columnId,
  tableId,
  limit = 10,
  scrollTop = 0,
  onScroll = () => null,
}) => {
  const [values, setValues] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);
  // Reset state when columnId or tableId changes
  useEffect(() => {
    setValues([]);
    setOffset(0);
    setHasMore(true);
    setError(null);
  }, [columnId, tableId]);

  // Load values when offset changes or initial load
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    getColumnValues(tableId, columnId, limit, offset)
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
  }, [columnId, tableId, offset, limit]);

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
      ref={containerRef}
      sx={{
        padding: "0.5rem",
        border: "1px solid #eee",
        borderRadius: "4px",
        marginBottom: "10px",
        maxHeight: "100px",
        overflowY: "auto",
      }}
    >
      {values.map((value, i) => (
        <Typography
          key={i}
          component="div"
          sx={{
            backgroundColor: i % 2 === 0 ? "#fafafa" : "#f0f0f0",
            padding: "0.25rem 0.5rem",
            borderRadius: "2px",
          }}
        >
          {value}
        </Typography>
      ))}
      {error && <Typography color="error">Error: {error}</Typography>}
      {loading && <Typography>Loading values...</Typography>}
    </Box>
  );
};

export default ColumnValues;
