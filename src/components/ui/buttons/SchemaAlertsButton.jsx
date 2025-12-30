/**
 * @fileoverview SchemaAlertsButton Component
 *
 * A button for viewing schema alerts with a badge showing alert count. Displays
 * an error outline icon with a badge indicator for alert notifications.
 *
 * Features:
 * - Error outline icon
 * - Badge with alert count
 * - Customizable badge color
 * - Customizable tooltip text
 * - Props forwarding to TooltipIconButton
 *
 * @module components/ui/buttons/SchemaAlertsButton
 *
 * @example
 * <SchemaAlertsButton
 *   badgeContent={3}
 *   color="error"
 *   tooltipText="View 3 alerts"
 *   onClick={handleViewAlerts}
 * />
 */

import { ErrorOutline as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";
import Badge from "@mui/material/Badge";

const SchemaAlertsButton = ({
  badgeContent,
  color = "info",
  tooltipText = "View alerts",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} color={color} {...props}>
      <Badge badgeContent={badgeContent} color={color}>
        <Icon />
      </Badge>
    </TooltipIconButton>
  );
};

export default SchemaAlertsButton;
