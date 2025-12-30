/**
 * @fileoverview InfoIcon Component
 *
 * An information icon component with tooltip. Displays a small info icon with
 * muted styling and hover effects for providing contextual help.
 *
 * Features:
 * - Small info icon (12px)
 * - Disabled text color (muted)
 * - Help cursor on hover
 * - Hover color transition
 * - Tooltip integration
 *
 * @module components/ui/icons/InfoIcon
 *
 * @example
 * <InfoIcon tooltipText="This column represents user IDs" />
 */

import { Info as Icon } from "@mui/icons-material";
import { Tooltip } from "@mui/material";

const InfoIcon = ({ tooltipText, ...props }) => {
  return (
    <Tooltip title={tooltipText} {...props}>
      <span>
        <Icon
          fontSize="small"
          sx={{
            fontSize: 12,
            color: "text.disabled",
            cursor: "help",
            "&:hover": {
              color: "text.secondary",
            },
          }}
        />
      </span>
    </Tooltip>
  );
};

export default InfoIcon;
