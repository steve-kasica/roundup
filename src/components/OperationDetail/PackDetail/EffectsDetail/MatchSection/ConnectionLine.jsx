import PropTypes from "prop-types";

function ConnectionLine({
  leftValues,
  rightValues,
  matches,
  strokeColor = "gray",
  strokeWidth = 2,
  strokeOpacity = 1,
  itemHeight,
}) {
  const calcD = (match, leftValues, rightValues) => {
    // Find the position of this match's values in their respective arrays
    const leftIndex = Array.from(leftValues).indexOf(match.left.value);
    const rightIndex = Array.from(rightValues).indexOf(match.right.value);

    // Calculate vertical positions based on array indices
    const leftCount = leftValues.size;
    const rightCount = rightValues.size;

    const startY = leftCount > 1 ? (leftIndex / (leftCount - 1)) * 100 : 50;
    const endY = rightCount > 1 ? (rightIndex / (rightCount - 1)) * 100 : 50;

    // Start from the right edge of left column, end at left edge of right column
    const startX = 0; // This should be adjusted based on your layout
    const endX = 100;

    // Create control points for a smooth curve
    const controlPoint1X = 30;
    const controlPoint2X = 70;

    return `M ${startX} ${startY} C ${controlPoint1X} ${startY} ${controlPoint2X} ${endY} ${endX} ${endY}`;
  };

  return (
    <svg
      style={{
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {matches.map((match, index) => (
        <path
          key={index}
          d={calcD(match, leftValues, rightValues)}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={strokeOpacity}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </svg>
  );
}

ConnectionLine.propTypes = {
  leftValues: PropTypes.array.isRequired,
  rightValues: PropTypes.array.isRequired,
  matches: PropTypes.array.isRequired,
  // Optional props for styling
  barColor: PropTypes.string,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  strokeOpacity: PropTypes.number,
  itemHeight: PropTypes.number.isRequired,
};

export default ConnectionLine;
