import { SvgIcon, Tooltip } from "@mui/material";

const NumberIcon = ({ number, tooltipText, ...props }) => {
  const displayNumber = Number.isInteger(number) ? number : "?";

  return (
    <Tooltip title={tooltipText || `Number: ${displayNumber}`} arrow>
      <span>
        <SvgIcon fontSize="small" fontWeight="bold" {...props}>
          <circle
            cx="12"
            cy="12"
            r="10"
            fill="#e0e0e0"
            stroke="currentColor"
            strokeWidth="2"
          />
          <text
            x="12"
            y="13"
            fontSize="12"
            fontWeight="bold"
            dominantBaseline="middle"
            textAnchor="middle"
            fill="currentColor"
          >
            {displayNumber}
          </text>
        </SvgIcon>
      </span>
    </Tooltip>
  );
};

export default NumberIcon;
