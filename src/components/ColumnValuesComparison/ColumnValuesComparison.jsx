/**
 * @fileoverview ColumnValuesComparison Component
 *
 * Provides a comprehensive comparison view for analyzing unique values across multiple
 * columns from different tables or operations. This component calculates and displays
 * various metrics and visualizations to help users understand the overlap and distribution
 * of values across selected columns.
 *
 * Key features:
 * - Displays statistics including unique value count, column count, and Jaccard similarity
 * - Shows value distribution across columns (all, some, or one column)
 * - Renders an interactive value matrix visualization (upset plot style)
 * - Provides scrollable navigation to specific value categories
 * - Uses real-time data fetching through DuckDB queries
 *
 * The Jaccard Index is used to measure the similarity between columns, calculated as the
 * ratio of values that appear in all columns to the total number of unique values.
 *
 * @module components/ColumnValuesComparison/ColumnValuesComparison
 *
 * @example
 * // Compare values across multiple columns
 * <ColumnValuesComparison columnIds={['col1', 'col2', 'col3']} />
 */

import { useCallback, useMemo, useRef } from "react";
import { useValueMatrixData } from "../../hooks/useValueMatrixData";
import { Box, Divider, Typography } from "@mui/material";
import ValueCountUpset from "./ValueCountUpset";
import ParentValueSpread from "./ParentValueSpread";
import DescriptionList from "../ui/DescriptionList";
import { InfoIcon } from "../ui/icons";

/**
 * Categorizes a Jaccard Index value into a human-readable similarity level.
 *
 * The Jaccard Index measures the similarity between finite sets and ranges from 0 to 1,
 * where 0 means no overlap and 1 means complete overlap.
 *
 * @function
 * @param {number} jaccardIndex - The Jaccard Index value (0-1)
 * @returns {string} A categorical label describing the similarity level:
 *   - "none" (0)
 *   - "very low" (< 0.1)
 *   - "low" (0.1 - 0.3)
 *   - "moderate" (0.3 - 0.5)
 *   - "high" (0.5 - 0.7)
 *   - "very high" (0.7 - 1.0)
 *   - "complete" (1.0)
 */
function categorizeJaccardIndex(jaccardIndex) {
  if (jaccardIndex === 0) {
    return "none";
  } else if (jaccardIndex < 0.1) {
    return "very low";
  } else if (jaccardIndex < 0.3) {
    return "low";
  } else if (jaccardIndex < 0.5) {
    return "moderate";
  } else if (jaccardIndex < 0.7) {
    return "high";
  } else if (jaccardIndex < 1) {
    return "very high";
  } else {
    return "complete";
  }
}

/**
 * ColumnValuesComparison Component
 *
 * Displays a comprehensive comparison of unique values across multiple columns,
 * including statistics, distribution charts, and an interactive matrix visualization.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string[]} [props.columnIds=[]] - Array of column IDs to compare
 *
 * @returns {React.ReactElement} A full-height box containing comparison visualizations
 *
 * @description
 * This component:
 * 1. Fetches value data for all specified columns using useValueMatrixData hook
 * 2. Calculates the Jaccard Index to measure column similarity
 * 3. Categorizes values by their distribution across columns (all/some/one)
 * 4. Provides interactive scrolling to specific value categories
 * 5. Renders a matrix visualization showing which values appear in which columns
 *
 * The component manages refs for smooth scrolling to value rows and handles
 * loading and error states appropriately.
 *
 * @see {@link module:hooks/useValueMatrixData}
 * @see {@link module:components/ColumnValuesComparison/ValueCountUpset}
 * @see {@link module:components/ColumnValuesComparison/ParentValueSpread}
 */
const ColumnValuesComparison = ({ columnIds = [] }) => {
  // Refs for each value row
  const valueRowRefs = useRef([]);
  const bodyRef = useRef(null);

  const {
    data,
    uniqueValues,
    valueDegrees,
    signature,
    parentIds,
    loading,
    error,
  } = useValueMatrixData(columnIds, true);

  const valueCount = useMemo(() => uniqueValues.length, [uniqueValues]);

  const jaccardIndex = useMemo(() => {
    if (valueDegrees.length === 0) return 0;
    const columnCount = columnIds.length;
    const intersectCount = valueDegrees.filter(
      (degree) => degree === columnCount
    ).length;
    return intersectCount / valueCount;
  }, [valueDegrees, valueCount, columnIds.length]);

  const categories = useMemo(() => {
    const columnCount = columnIds.length;
    return {
      all: {
        label: "all columns",
        count: valueDegrees.filter((degree) => degree === columnCount).length,
        firstIndex: valueDegrees.findIndex((degree) => degree === columnCount), // will be set later
      },
      some: {
        label: "some columns",
        count: valueDegrees.filter(
          (degree) => degree < columnCount && degree > 1
        ).length,
        firstIndex: valueDegrees.findIndex(
          (degree) => degree < columnCount && degree > 1
        ),
      },
      one: {
        label: "one column",
        count: valueDegrees.filter(
          (degree) => degree === 1 && 1 !== columnCount // prevents counting "all" as "one"
        ).length,
        firstIndex: valueDegrees.findIndex(
          (degree) => degree === 1 && 1 !== columnCount
        ),
      },
    };
  }, [valueDegrees, columnIds.length]);

  const scrollToDegree = useCallback((index) => {
    const rowEl = valueRowRefs.current[index];
    const container = bodyRef.current;
    if (rowEl && container) {
      // Calculate offset relative to the scrollable container
      const rowTop = rowEl.offsetTop;

      // Optionally, center the row:
      const scroll =
        rowTop -
        container.offsetTop -
        container.clientHeight / 2 +
        rowEl.clientHeight / 2 +
        rowEl.clientHeight * 7; // compensate for sticky headers
      container.scrollTo({
        top: scroll > 0 ? scroll : 0,
        behavior: "smooth",
      });
    }
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      height="100%"
      padding={0.5}
      boxSizing={"border-box"}
    >
      <Typography variant="section-title">Compare Columns</Typography>
      <Typography variant="data-secondary">
        Compaing column values between tables
      </Typography>
      <br></br>
      <Typography variant="subsection-title" sx={{ mb: 1 }}>
        Stats
      </Typography>
      <DescriptionList
        data={{
          "Unique values": valueCount.toLocaleString(),
          "Total columns": columnIds.length,
          Similarity: `${categorizeJaccardIndex(jaccardIndex)} (${(
            jaccardIndex * 100
          ).toFixed(0)}%)`,
        }}
      />
      <Divider sx={{ my: 1 }} />
      <Typography variant="subsection-title" sx={{ mb: 1 }}>
        Value Distribution
        <sup>
          <InfoIcon tooltipText="Shows the distribution of unique values across the selected columns." />
        </sup>
      </Typography>
      <ParentValueSpread
        categories={categories}
        valueCount={valueCount}
        scrollToDegree={scrollToDegree}
        loading={loading}
      />
      <Divider sx={{ my: 1 }} />
      <Typography variant="subsection-title" sx={{ mb: 1 }}>
        Value Matrix
        <sup>
          <InfoIcon tooltipText="Shows the proportion of non-null values versus null/missing values in this column. Higher completeness indicates fewer missing values." />
        </sup>
      </Typography>
      {loading ? (
        "Loading"
      ) : error ? (
        "error"
      ) : (
        <ValueCountUpset
          signatures={signature}
          data={data}
          uniqueValues={uniqueValues}
          valueDegrees={valueDegrees}
          parentIds={parentIds}
          valueRowRefs={valueRowRefs}
          bodyRef={bodyRef}
        />
      )}
    </Box>
  );
};
export default ColumnValuesComparison;
