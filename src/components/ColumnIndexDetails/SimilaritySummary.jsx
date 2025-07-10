import { Box, Typography } from "@mui/material";
import PropTypes from "prop-types";

export default function SimilaritySummary({ data }) {
  const valueCount = data.length;
  const columnCount = data[0] ? data[0].length : 0;

  const jaccardIndex =
    data.filter((row) => !row.includes(0)).length / valueCount;

  return (
    <>
      <Typography variant="body2">
        {valueCount} unique value{valueCount > 1 ? "s" : ""} with{" "}
        <em>{categorizeJaccardIndex(jaccardIndex)}</em> overlap between all{" "}
        {columnCount} columns (Jaccard Index = {jaccardIndex.toFixed(2)}).
      </Typography>
    </>
  );

  function categorizeJaccardIndex(jaccardIndex) {
    if (jaccardIndex === 0) {
      return "no";
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
}

SimilaritySummary.propTypes = {
  data: PropTypes.arrayOf(PropTypes.arrayOf(PropTypes.number)).isRequired,
};
