/**
 * @fileoverview ColumnIcon Component
 *
 * A simple SVG icon representing a database column, styled as a vertical rectangle
 * divided into three sections to visually represent tabular data structure.
 *
 * This icon is used throughout the application to represent columns in various contexts
 * such as column details panels, schema visualizations, and column lists.
 *
 * @module components/ColumnViews/ColumnIcon
 *
 * @example
 * <ColumnIcon size={32} strokeColor="blue" strokeWidth={2} />
 */

import SvgIcon from "@mui/material/SvgIcon";

/**
 * ColumnIcon Component
 *
 * Renders an SVG icon representing a database column with horizontal dividers.
 *
 * @component
 * @param {Object} props - Component props
 * @param {number} [props.size=24] - Size of the icon in pixels (width and height)
 * @param {string} [props.strokeColor="currentColor"] - Color for the stroke lines
 * @param {number} [props.strokeWidth=2] - Width of the stroke lines in pixels
 * @param {Object} props....props - Additional props passed to MUI SvgIcon
 *
 * @returns {React.ReactElement} An SVG icon of a column
 *
 * @description
 * The icon consists of:
 * - A rounded rectangle representing the column boundary
 * - Two horizontal lines dividing the column into three sections
 * - Transparent fill to show only the outline
 */
const ColumnIcon = ({
  size = 24,
  strokeColor = "currentColor",
  strokeWidth = 2,
  ...props
}) => {
  const rectWidth = size / 3;
  return (
    <SvgIcon {...props}>
      <g transform={`translate(${size / 2 - rectWidth / 2}, ${1})`}>
        <rect
          width={rectWidth}
          height={size - strokeWidth}
          rx="2"
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <line
          x1="0"
          y1={(size - strokeWidth) / 3}
          x2={rectWidth}
          y2={(size - strokeWidth) / 3}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
        <line
          x1="0"
          y1={(2 * (size - strokeWidth)) / 3}
          x2={rectWidth}
          y2={(2 * (size - strokeWidth)) / 3}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
        />
      </g>
    </SvgIcon>
  );
};

export default ColumnIcon;
