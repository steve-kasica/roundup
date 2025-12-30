/**
 * @fileoverview SingleBar Component
 *
 * A simple horizontal bar visualization component for displaying a single value
 * as a proportional bar. Supports optional value/percentage labels and custom
 * scaling via D3 scales or max values.
 *
 * Features:
 * - Horizontal bar with proportional width
 * - Optional D3 scale integration
 * - Value and percentage label display
 * - Customizable colors (bar and background)
 * - Adjustable height
 * - Automatic width clamping to 100%
 *
 * @module components/visualization/SingleBar
 *
 * @example
 * <SingleBar
 *   value={75}
 *   maxValue={100}
 *   height={20}
 *   color="#1976d2"
 *   showValue={true}
 *   showPercentage={true}
 * />
 */

/* eslint-disable react/prop-types */

const SingleBar = ({
  value,
  xAxisScale,
  height = 20,
  color = "#1976d2",
  backgroundColor = "#eee",
  showValue = false,
  showPercentage = false,
  maxValue,
}) => {
  // If xAxisScale is provided, use it; otherwise use maxValue or default to value itself
  const scaleMax = xAxisScale ? xAxisScale.range()[1] : maxValue || value;
  const scaledValue = xAxisScale ? xAxisScale(value) : value;

  // Calculate width percentage
  const widthPercent = scaleMax > 0 ? (scaledValue / scaleMax) * 100 : 0;

  // Ensure width doesn't exceed 100%
  const clampedWidth = Math.min(Math.max(widthPercent, 0), 100);

  // Determine what to display based on flags
  // Both showValue and showPercentage cannot be true at the same time
  const shouldShowText =
    (showValue || showPercentage) && !(showValue && showPercentage);
  const displayText = shouldShowText
    ? showPercentage
      ? `${clampedWidth.toFixed(1)}%`
      : typeof value === "number"
      ? value.toLocaleString()
      : value
    : null;

  return (
    <div
      style={{
        position: "relative",
        height,
        width: "100%",
        backgroundColor,
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${clampedWidth}%`,
          height: "100%",
          backgroundColor: color,
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          borderRadius: 4,
          transition: "width 0.3s ease",
        }}
        title={`Value: ${value.toLocaleString()}`}
      >
        {shouldShowText && clampedWidth > 20 && (
          <span
            style={{
              padding: "0 4px",
              color: "white",
              fontFamily: "sans-serif",
              fontSize: "0.75rem",
              fontWeight: "500",
            }}
          >
            {displayText}
          </span>
        )}
      </div>
      {shouldShowText && clampedWidth <= 20 && (
        <span
          style={{
            position: "absolute",
            left: `${clampedWidth + 1}%`,
            top: "50%",
            transform: "translateY(-50%)",
            padding: "0 4px",
            fontFamily: "sans-serif",
            fontSize: "0.75rem",
            color: "#666",
            whiteSpace: "nowrap",
          }}
        >
          {displayText}
        </span>
      )}
    </div>
  );
};

export default SingleBar;
