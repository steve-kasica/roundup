import { useCallback, useMemo, useRef } from "react";
import { useValueMatrixData } from "../../hooks/useValueMatrixData";
import { Box, Divider, Typography } from "@mui/material";
import ValueCountUpset from "./ValueCountUpset";
import ParentValueSpread from "./ParentValueSpread";
import DescriptionList from "../ui/DescriptionList";
import { InfoIcon } from "../ui/icons";

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
      <Typography variant="window-title">Compare Columns</Typography>
      <Typography variant="window-subtitle">
        Compaing column values between tables
      </Typography>
      <br></br>
      <Typography variant="window-section-title" sx={{ mb: 1 }}>
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
      <Typography variant="window-section-title" sx={{ mb: 1 }}>
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
      <Typography variant="window-section-title" sx={{ mb: 1 }}>
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
