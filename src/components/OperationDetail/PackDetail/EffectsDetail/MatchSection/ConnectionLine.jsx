import PropTypes from "prop-types";

function ConnectionLine({
  matchType,
  matchValues,
  getSectionColor,
  strokeWidth = 5,
  strokeOpacity = 0.6,
}) {
  const renderConnection = (matches, index = 0) => {
    const color = getSectionColor();

    if (matchType === "many") {
      const totalHeight = matches.length * 32 + (matches.length - 1) * 4;
      const startY = (16 / totalHeight) * 100;
      const endY = ((index + 0.5) / matches.length) * 100;
      const controlPoint1X = 30;
      const controlPoint2X = 70;

      return (
        <path
          key={index}
          d={`M 0 ${startY} C ${controlPoint1X} ${startY}, ${controlPoint2X} ${endY}, 100 ${endY}`}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={strokeOpacity}
        />
      );
    } else {
      return (
        <path
          d="M 0 50 L 100 50"
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={strokeOpacity}
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
  getSectionColor: PropTypes.func.isRequired,
  strokeWidth: PropTypes.number,
  strokeOpacity: PropTypes.number,
};

export default ConnectionLine;
