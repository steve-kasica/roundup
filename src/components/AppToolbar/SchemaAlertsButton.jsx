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
import TooltipIconButton from "../ui/buttons/TooltipIconButton";
import Badge from "@mui/material/Badge";
import { useState } from "react";
import { useSelector } from "react-redux";
import { selectAlertsById } from "../../slices/alertsSlice";
import { Divider, Popover, Typography, Box, List } from "@mui/material";
import { selectFocusedObjectId } from "../../slices/uiSlice";
import { withAssociatedAlerts } from "../HOC";
import { EnhancedAlertDescription } from "../Alerts/AlertDescription";

const SchemaAlertsButton = ({
  alertIds,
  totalCount,
  errorCount,
  warningCount,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const isOpen = Boolean(anchorEl);
  const color =
    errorCount > 0 ? "error" : warningCount > 0 ? "warning" : "default";
  const isDisabled = totalCount === 0;
  console.log("Rendering SchemaAlertsButton with alerts:", totalCount);

  return (
    <>
      <TooltipIconButton
        tooltipText={"View alerts"}
        color={color}
        disabled={isDisabled}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Badge badgeContent={totalCount} color={color}>
          <Icon />
        </Badge>
      </TooltipIconButton>
      {/* Alerts Popover */}
      <Popover
        open={isOpen}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <Box sx={{ maxWidth: 400, maxHeight: 400 }}>
          <Box
            sx={{
              p: 2,
              borderBottom: 1,
              borderColor: "divider",
              backgroundColor: "#f5f5f5",
            }}
          >
            <Typography variant="label" fontWeight="bold">
              Alerts ({totalCount})
            </Typography>
          </Box>
          <List sx={{ maxHeight: 320, overflow: "auto", p: 0 }}>
            {alertIds.map((id, i, arr) => (
              <>
                <EnhancedAlertDescription key={id} id={id} />
                {i < arr.length - 1 && <Divider component="li" />}
              </>
            ))}
          </List>
        </Box>
      </Popover>
    </>
  );
};

const EnhancedSchemaAlertsButton = withAssociatedAlerts(SchemaAlertsButton);

const SchemaAlertsButtonComponent = () => {
  const focusedObjectId = useSelector(selectFocusedObjectId);
  return <EnhancedSchemaAlertsButton id={focusedObjectId} />;
};

export default SchemaAlertsButtonComponent;
