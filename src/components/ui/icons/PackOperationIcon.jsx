import { SvgIcon } from "@mui/material";

const PackOperationIcon = ({ size = 24, ...props }) => {
  const tableWidth = size / 6;
  return (
    <SvgIcon
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      {...props}
    >
      <g>
        <line
          x1={tableWidth}
          y1={size / 2}
          x2={size / 4}
          y2={size / 2}
          stroke="currentColor"
          strokeWidth={3}
        />
        <line
          x1={(3 * size) / 4}
          y1={size / 2}
          x2={size - tableWidth}
          y2={size / 2}
          stroke="currentColor"
          strokeWidth={3}
        />
        <polygon
          points={`
                ${size / 4},${size / 4}
                ${size / 2},${size / 2}
                ${size / 4},${(3 * size) / 4}`}
          fill="currentColor"
        />
        <polygon
          points={`
                ${size / 2},${size / 2}
                ${(3 * size) / 4},${size / 4}
                ${(3 * size) / 4},${(3 * size) / 4}
                    `}
          fill="currentColor"
        />
      </g>
      <rect x={0} y={0} width={tableWidth} height={size} fill="currentColor" />
      <rect
        x={size - tableWidth}
        y={0}
        width={tableWidth}
        height={size}
        fill="currentColor"
      />
    </SvgIcon>
  );
};

export default PackOperationIcon;
