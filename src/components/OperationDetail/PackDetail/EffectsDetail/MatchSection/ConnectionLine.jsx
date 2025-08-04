import PropTypes from "prop-types";

function ConnectionLine({
  matchType,
  matchValues,
  strokeColor = "gray",
  strokeWidth = 2,
  strokeOpacity = 1,
  itemHeight,
}) {
  const renderConnection = (matches, index = 0) => {
    if (matchType === "many") {
      const totalHeight =
        matches.length * itemHeight + (matches.length - 1) * 4;
      const startY = (itemHeight / 2 / totalHeight) * 100; // Center of the left ValueView as percentage
      const endY = ((index * (30 + 4) + 30 / 2) / totalHeight) * 100; // Center of each right ValueView with 4px gutter
      const controlPoint1X = 30;
      const controlPoint2X = 70;

      return (
        <path
          key={index}
          d={`M 0 ${startY} C ${controlPoint1X} ${startY}, ${controlPoint2X} ${endY}, 100 ${endY}`}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={strokeOpacity}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    } else {
      return (
        <path
          d="M 0 50 L 100 50"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={strokeOpacity}
          vectorEffect="non-scaling-stroke"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      );
    }
  };

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {matchType === "many"
        ? matchValues.map((_, index) => renderConnection(matchValues, index))
        : renderConnection()}
    </svg>
  );
}

ConnectionLine.propTypes = {
  matchType: PropTypes.oneOf(["single", "none", "many"]).isRequired,
  matchValues: PropTypes.array,
  strokeColor: PropTypes.string,
  strokeWidth: PropTypes.number,
  strokeOpacity: PropTypes.number,
  itemHeight: PropTypes.number.isRequired,
};

export default ConnectionLine;
