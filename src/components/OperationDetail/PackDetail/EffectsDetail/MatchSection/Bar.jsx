import PropTypes from "prop-types";

function Bar({
  value,
  width,
  height,
  barColor = "red",
  backgroundColor = "#f0f0f0",
  opacity = 0.7,
}) {
  const threshold = 10; // Width percentage threshold for inside/outside positioning
  const isLabelInset = width > threshold;

  return (
    <div
      style={{
        width: "100%",
        height,
        position: "relative",
        display: "flex",
        alignItems: "center",
        backgroundColor,
      }}
    >
      {/* The actual bar */}
      <div
        style={{
          width: `${width}%`,
          height: "100%",
          backgroundColor: barColor,
          opacity,
        }}
      />

      {/* The value text */}
      <span
        style={{
          position: "absolute",
          left: `${width + (isLabelInset ? -10 : 0)}%`,
          fontSize: "10px",
          fontFamily: "Roboto, sans-serif",
          fontWeight: "medium",
          color: isLabelInset ? "white" : "#222",
          zIndex: 1,
        }}
      >
        {value}
      </span>
    </div>
  );
}

Bar.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string.isRequired,
  opacity: PropTypes.number,
};

export default Bar;
