/**
 * @fileoverview ColumnValueLengths Component
 *
 * Displays a distribution chart of string lengths within a column, showing how many
 * values have each length and providing examples of values for each length category.
 * This is particularly useful for analyzing text data patterns and validating expected
 * string formats.
 *
 * Features:
 * - Bar chart visualization of length distribution
 * - Tooltip examples showing actual values for each length
 * - Paginated loading for performance
 * - Scroll-based lazy loading
 * - Formatted count display
 *
 * @module components/ColumnViews/ColumnValueLengths
 *
 * @example
 * <ColumnValueLengths id="column-123" limit={20} />
 */

/* eslint-disable react/prop-types */
/**
 * ColumnValueLengths.jsx
 * ------------------------------------------------------------------
 * This component fetches and displays the distribution of string
 * lengths within a specified column, showing counts and examples
 * for each length in a bar chart.
 */
import { BarChart } from "../visualization";
import { usePaginatedValueLength } from "../../hooks/useValueLength";
import { formatNumber } from "../../lib/utilities";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";

/**
 * ColumnValueLengths Component
 *
 * Renders a bar chart showing the distribution of string lengths in a column,
 * with paginated loading and example values in tooltips.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.id - Column identifier
 * @param {number} [props.limit=20] - Number of length categories to load per page
 *
 * @returns {React.ReactElement} A scrollable bar chart of string length frequencies
 *
 * @description
 * Loading behavior:
 * - Shows loading spinner on initial load
 * - Displays bar chart with existing data during subsequent loads
 * - Automatically loads more data when scrolling near bottom
 * - Shows progress text indicating loaded vs total unique lengths
 *
 * Chart features:
 * - X-axis shows count of values with each length
 * - Y-axis shows "Length N" labels
 * - Tooltips display example values for each length with their counts
 * - Green color scheme to differentiate from value counts
 */
const ColumnValueLengths = ({ id, limit = 20 }) => {
  const { data, loading, error, total, loadMore } = usePaginatedValueLength(
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
            data.map(({ length, count }) => [`Length ${length}`, count])
          )}
          tooltipData={Object.fromEntries(
            data.map(({ length, examples }) => [
              `Length ${length}`,
              examples
                .map((ex) => `${ex.value} (${formatNumber(ex.count)})`)
                .join(", "),
            ])
          )}
          xAxisLabel="Count"
          marginLeft={10}
          marginRight={10}
          marginTop={10}
          marginBottom={10}
          color="#10b981"
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
        Showing {data.length.toLocaleString()} of {total.toLocaleString()}{" "}
        unique lengths
      </Typography>
    </Box>
  );
};

export default ColumnValueLengths;
