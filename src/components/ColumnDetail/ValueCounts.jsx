/* eslint-disable react/prop-types */
/**
 * ValueCounts.jsx
 * ------------------------------------------------------------------
 * This component fetches and displays the frequency distribution of
 * unique values within a specified column in a bar chart.
 */
import { BarChart } from "../visualization";
import { getValueCounts } from "../../lib/duckdb";
import { useEffect, useState, useCallback } from "react";
import { formatNumber } from "../../lib/utilities";
import { Box, CircularProgress, Typography } from "@mui/material";

const ValueCounts = ({ columnId, tableId, uniqueCount, limit = 20 }) => {
  const [data, setData] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getValueCounts(tableId, columnId, limit, 0);
      const count = Object.keys(result).length;
      if (result && typeof result === "object") {
        setData(result || {});
        setTotal((prev) => prev + count);
      } else {
        setData({});
        setTotal(0);
      }
    } catch (err) {
      setError(err.message);
      setData({});
    } finally {
      setLoading(false);
    }
  }, [columnId, tableId, limit]);

  const loadMoreData = useCallback(async () => {
    if (total >= uniqueCount || loadingMore) return;

    setLoadingMore(true);

    try {
      const result = await getValueCounts(tableId, columnId, limit, total);
      const count = Object.keys(result).length;
      if (result && typeof result === "object" && result) {
        setData((prevData) => ({ ...prevData, ...result }));
        setTotal((prev) => prev + count);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingMore(false);
    }
  }, [columnId, tableId, limit, loadingMore, total, uniqueCount]);

  // Initial load
  useEffect(() => {
    setTotal(0);
    setData({});
    loadInitialData();
  }, [loadInitialData]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
      >
        <Typography variant="body2" color="error">
          Error: {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <BarChart
        data={data}
        xAxisLabel="Count"
        marginLeft={10}
        marginRight={10}
        marginTop={10}
        marginBottom={10}
        color="#3b82f6"
        minHeight={200}
        formatValue={formatNumber}
        onScrollNearBottom={loadMoreData}
        scrollThreshold={0.9}
        isLoading={loadingMore}
      />

      {total > 0 && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          Showing {total} of {uniqueCount} unique values
        </Typography>
      )}
    </Box>
  );
};

export default ValueCounts;
