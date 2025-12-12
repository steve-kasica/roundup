import SvgIcon from "@mui/material/SvgIcon";

function VennDiagram(props) {
  const {
    label = "",
    labelFill = "#000",
    leftFill = "#90caf9",
    leftOpacity = 1,
    rightFill = "#a5d6a7",
    rightOpacity = 1,
    overlapFill = "#fff176",
    overlapOpacity = 1,
    stroke = "#000",
    strokeWidth = "1",
    size = "24",
    disabled = false,
    ...otherProps
  } = props;

  // Scale geometry relative to the viewBox size (default baseline: 24)
  const S = Number(size) || 24;
  const r = (6 / 24) * S; // original r=6 in a 24x24 box
  const cy = (12 / 24) * S; // vertical center
  const cxLeft = (9 / 24) * S; // original left cx=9
  const cxRight = (15 / 24) * S; // original right cx=15

  // Intersection y-coordinates for two circles (dx=6, r=6 in baseline):
  // cy ± sqrt(r^2 - (dx/2)^2) => 12 ± 5.196152. Scale to S
  const dy = (5.196152 / 24) * S;
  const yTop = cy + dy;
  const yBottom = cy - dy;

  return (
    <SvgIcon
      {...otherProps}
      viewBox={`0 0 ${S} ${S}`}
      sx={{
        width: S,
        height: S,
        opacity: disabled ? 0.5 : 1,
        ...(otherProps?.sx || {}),
      }}
    >
      <text
        x={S / 2}
        y="5"
        fontSize={S * (4 / 24)}
        fill={labelFill}
        textAnchor="middle"
        alignmentBaseline="middle"
        opacity={disabled ? 0.5 : 1}
      >
        {label}
      </text>
      {/* Left circle */}
      <circle
        cx={cxLeft}
        cy={cy}
        r={r}
        fill={leftFill}
        fillOpacity={disabled ? leftOpacity * 0.5 : leftOpacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={disabled ? 0.5 : 1}
      />
      {/* Right circle */}
      <circle
        cx={cxRight}
        cy={cy}
        r={r}
        fill={rightFill}
        fillOpacity={disabled ? rightOpacity * 0.5 : rightOpacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={disabled ? 0.5 : 1}
      />
      {/* Overlap area */}
      <path
        d={`M ${S * (12 / 24)} ${yTop} A ${r} ${r} 0 0 0 ${
          S * (12 / 24)
        } ${yBottom} A ${r} ${r} 0 0 0 ${S * (12 / 24)} ${yTop} Z`}
        fill={overlapFill}
        fillOpacity={disabled ? overlapOpacity * 0.5 : overlapOpacity}
        stroke={stroke}
        strokeWidth={strokeWidth}
        opacity={disabled ? 0.5 : 1}
      />
    </SvgIcon>
  );
}

export default VennDiagram;
