import PropTypes from "prop-types";

export default function Edges({
  leftValues,
  rightValues,
  matches,
  strokeColor = "gray",
  strokeWidth = 2,
  strokeOpacity = 1,
  itemHeight = 38.02,
}) {
  const leftCount = leftValues.size;
  const rightCount = rightValues.size;
  const maxCount = Math.max(leftCount, rightCount);

  const calcD = ({ left, right }, leftValues, rightValues) => {
    // Find the position of this match's values in their respective arrays
    const leftIndex = [...leftValues].indexOf(left.value) + 1;
    const rightIndex = [...rightValues].indexOf(right.value) + 1;

    const startY = (leftIndex / maxCount - 1 / maxCount / 2) * 100;
    const endY = (rightIndex / maxCount - 1 / maxCount / 2) * 100;

    // Start from the right edge of left column, end at left edge of right column
    const startX = 0;
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
        height: `${itemHeight * maxCount}px`,
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

Edges.propTypes = {
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
