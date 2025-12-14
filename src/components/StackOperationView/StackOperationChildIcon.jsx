import { SvgIcon } from "@mui/material";

/**
 * Renders a stack of rectangular child icons, optionally highlighting one.
 *
 * @param {Object} props - Component props.
 * @param {number} [props.size=24] - The overall size (width and height) of the icon in pixels.
 * @param {number} [props.count=3] - The number of stacked rectangles to display.
 * @param {number|null} [props.highlightIndex=null] - The index of the rectangle to highlight, or null for no highlight.
 * @param {number} [props.gap=1] - The vertical gap in pixels between rectangles.
 * @param {number} [props.strokeWidth=1] - The stroke width of each rectangle.
 * @param {string} [props.color="currentColor"] - The color of the rectangles and their stroke.
 * @param {string} [props.highlightColor="#000"] - The fill color for the highlighted rectangle.
 * @param {Object} [props.props] - Additional props passed to the SvgIcon component.
 * @returns {JSX.Element} The rendered stack icon.
 */
const StackOperationChildIcon = ({
  size = 24,
  count = 3,
  highlightIndex = null,
  gap = 1,
  strokeColor = "#000",
  strokeWidth = 2,
  ...props
}) => {
  return (
    <SvgIcon color="error" {...props}>
      {Array.from({ length: count }, (_, i) => (
        <g key={i} opacity={highlightIndex === i ? 1 : 0.25}>
          <rect
            x={strokeWidth}
            y={i * (size / count + (i !== count - 1 ? gap : 0)) + strokeWidth}
            width={size - strokeWidth * 2}
            height={size / count - strokeWidth * 2 - gap}
            fill={"transparent"}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            rx={2}
          />
          {[1, 2].map((lineIdx) => (
            <line
              key={lineIdx}
              x1={strokeWidth + ((size - strokeWidth * 2) / 3) * lineIdx}
              x2={strokeWidth + ((size - strokeWidth * 2) / 3) * lineIdx}
              y1={
                i * (size / count + (i !== count - 1 ? gap : 0)) + strokeWidth
              }
              y2={
                i * (size / count + (i !== count - 1 ? gap : 0)) +
                strokeWidth +
                (size / count - strokeWidth * 2 - gap)
              }
              stroke={strokeColor}
              strokeWidth={strokeWidth}
            />
          ))}
        </g>
      ))}
    </SvgIcon>
  );
};

StackOperationChildIcon.displayName = "Stack Operation Child Icon";

export default StackOperationChildIcon;
