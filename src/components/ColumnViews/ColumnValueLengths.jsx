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
        variant="caption"
        color="text.secondary"
        sx={{ mt: 1, display: "block", flexShrink: 0 }}
      >
        Showing {data.length.toLocaleString()} of {total.toLocaleString()}{" "}
        unique lengths
      </Typography>
    </Box>
  );
};

export default ColumnValueLengths;
