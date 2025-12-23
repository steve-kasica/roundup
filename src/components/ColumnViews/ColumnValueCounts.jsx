/* eslint-disable react/prop-types */
/**
 * ColumnValuesCounts.jsx
 * ------------------------------------------------------------------
 * This component fetches and displays the frequency distribution of
 * unique values within a specified column in a bar chart.
 */
import { BarChart } from "../visualization";
import { usePaginatedValueCounts } from "../../hooks/useValueCounts";
import { formatNumber } from "../../lib/utilities";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

const ColumnValuesCounts = ({ id, approxUnique, limit = 20 }) => {
  const { data, loading, error, total, loadMore } = usePaginatedValueCounts(
    id,
    limit
  );

  if (loading && data.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center">
        <Alert severity="error">{error.message || error}</Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      <Box sx={{ flexGrow: 1, minHeight: 0, overflow: "hidden" }}>
        <BarChart
          data={Object.fromEntries(
            data.map(({ value, count }) => [value, count])
          )}
          xAxisLabel="Count"
          marginLeft={10}
          marginRight={10}
          marginTop={10}
          marginBottom={10}
          color="#3b82f6"
          formatValue={formatNumber}
          onScrollNearBottom={loadMore}
          scrollThreshold={0.9}
          isLoading={loading && data.length > 0}
        />
      </Box>

      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block", flexShrink: 0 }}
      >
        Showing {data.length.toLocaleString()} of{" "}
        {total.toLocaleString() || approxUnique.toLocaleString()} unique values
      </Typography>
    </Box>
  );
};

export default ColumnValuesCounts;
