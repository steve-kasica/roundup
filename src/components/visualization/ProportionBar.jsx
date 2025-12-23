import { Box } from "@mui/material";

/**
 *
 * A React component that renders a horizontal proportion bar chart.
 * Each segment of the bar represents a proportion of the total,
 * with customizable styles for each segment.
 *
 * @param {{data: Object, barStyles?: Object, height?: number}} params
 * @param {Object} params.data - An object where keys are labels and values are numbers
 * @param {Object} [params.barStyles={}] - An object mapping labels to style objects for each bar segment
 * @param {number} [params.height=20] - The height of the proportion bar in pixels
 * @returns {JSX.Element} The rendered proportion bar component
 */
const ProportionBar = ({
  title,
  data,
  colorScale = () => "#ccc",
  barStyles = {},
  height = "20px",
}) => {
  const total = Object.values(data).reduce((sum, v) => sum + v, 0);
  if (total === 0) {
    return (
      <div
        style={{
          height,
          width: "100%",
          backgroundColor: "#eee",
        }}
      />
    );
  }
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height,
        overflow: "hidden",
      }}
    >
      {Object.entries(data).map(([label, value], index) => {
        const widthPercent = (value / total) * 100;
        console.log(label, value, widthPercent);
        return (
          <Box
            key={index}
            style={{
              width: `${widthPercent}%`,
              display: widthPercent === 0 ? "none" : "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              fontFamily: "sans-serif",
              fontSize: "0.75rem",
              minWidth: "1%",
              backgroundColor: colorScale(label),
              userSelect: "none",
            }}
            title={`${label}: ${value.toLocaleString()} (${widthPercent.toFixed(
              1
            )}%)`}
          >
            <span style={{ padding: "0 4px" }}>{widthPercent.toFixed(1)}%</span>
          </Box>
        );
      })}
    </Box>
  );
};
export default ProportionBar;
