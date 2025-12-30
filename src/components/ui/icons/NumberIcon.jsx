/**
 * @fileoverview NumberIcon Component
 *
 * A custom SVG icon displaying a number inside a circle. Useful for showing
 * counts, indices, or numbered indicators with tooltip support.
 *
 * Features:
 * - Custom SVG with circle background
 * - Centered text display
 * - Tooltip with number information
 * - Fallback "?" for non-integer values
 * - Customizable styling via props
 *
 * @module components/ui/icons/NumberIcon
 *
 * @example
 * <NumberIcon
 *   number={5}
 *   tooltipText="5 tables selected"
 * />
 */

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
