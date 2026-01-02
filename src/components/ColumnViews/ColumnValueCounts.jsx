/**
 * @fileoverview ColumnValueCounts Component
 *
 * Displays a frequency distribution bar chart of unique values within a column,
 * showing the count of occurrences for each value. This component is essential
 * for understanding the distribution of categorical or discrete data.
 *
 * Features:
 * - Paginated loading for performance with large datasets
 * - Scroll-based lazy loading
 * - Loading indicator for additional data
 * - Error handling with user-friendly messages
 * - Responsive bar chart visualization
 *
 * @module components/ColumnViews/ColumnValueCounts
 *
 * @example
 * <ColumnValueCounts id="column-123" approxUnique={500} limit={20} />
 */

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

/**
 * ColumnValuesCounts Component
 *
 * Renders a bar chart showing the frequency distribution of values in a column,
 * with paginated loading for efficient handling of large datasets.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Column identifier
 * @param {number} props.approxUnique - Approximate count of unique values (fallback)
 * @param {number} [props.limit=20] - Number of values to load per page
 *
 * @returns {React.ReactElement} A scrollable bar chart of value frequencies
 *
 * @description
 * Loading behavior:
 * - Shows loading spinner on initial load
 * - Displays bar chart with existing data during subsequent loads
 * - Automatically loads more data when scrolling near bottom
 * - Shows progress text indicating loaded vs total values
 */
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
        variant="data-secondary"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Showing {data.length.toLocaleString()} of{" "}
        {total.toLocaleString() || approxUnique.toLocaleString()} unique values
      </Typography>
    </Box>
  );
};

export default ColumnValuesCounts;
