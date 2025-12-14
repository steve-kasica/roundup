import SvgIcon from "@mui/material/SvgIcon";

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
