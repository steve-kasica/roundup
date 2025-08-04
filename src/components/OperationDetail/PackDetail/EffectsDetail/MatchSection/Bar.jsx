import PropTypes from "prop-types";

function Bar({
  value,
  width,
  height = "100%",
  barColor = "red",
  backgroundColor = "#f0f0f0",
  opacity = 0.7,
}) {
  const threshold = 10; // Width percentage threshold for inside/outside positioning
  const isLabelInset = width > threshold;

  // Calculate offset based on value length (approximate 6px per character)
  const charWidth = 6; // pixels per character approximation
  const calculatedOffset = String(value).length * charWidth + 3; // +3 for padding

  return (
    <div
      style={{
        width: "100%",
        height: height,
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
          textAlign: "right",
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        {/* The value text */}
        <span
          style={{
            fontSize: "12px",
            fontFamily: "Roboto, sans-serif",
            fontWeight: "medium",
            color: isLabelInset ? "white" : "#222",
            zIndex: 1,
            position: "relative",
            right: isLabelInset ? "4px" : `-${calculatedOffset}px`,
          }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

Bar.propTypes = {
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  barColor: PropTypes.string,
  backgroundColor: PropTypes.string,
  opacity: PropTypes.number,
};

export default Bar;
