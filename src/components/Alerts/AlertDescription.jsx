/**
 * @fileoverview AlertDescription Component
 *
 * Displays a single alert message with its severity level, description, and optional
 * silence/unsilence controls for warning-level alerts.
 *
 * This component renders alert information in a consistent list item format, showing:
 * - An appropriate icon based on severity (error or warning)
 * - Alert title or message as primary text
 * - Optional description or details as secondary text
 * - Silence/unsilence toggle button for warnings
 *
 * The component is designed to work within a list of alerts and integrates with the
 * application's alert management system through the withAlertData HOC, which provides
 * Redux state and actions for individual alerts.
 *
 * @module components/Alerts/AlertDescription
 *
 * @example
 * // Using the HOC-enhanced version (recommended)
 * import { EnhancedAlertDescription } from './AlertDescription';
 *
 * <EnhancedAlertDescription id="alert-123" />
 *
 * @example
 * // Using the base component directly
 * import { AlertDescription } from './AlertDescription';
 *
 * <AlertDescription
 *   title="Missing Join Key"
 *   description="The left table is missing a join key"
 *   severity="error"
 *   isSilenced={false}
 *   toggleSilenceAlert={handleToggle}
 * />
 */

import {
  Avatar,
  IconButton,
  ListItem,
  ListItemAvatar,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Error, VolumeOff, VolumeUp, Warning } from "@mui/icons-material";
import withAlertData from "../HOC/withAlertData";
import {
  SEVERITY_ERROR,
  SEVERITY_WARNING,
} from "../../slices/alertsSlice/Alerts";
import AlertErrorIcon from "../ui/icons/AlertErrorIcon";
import AlertWarningIcon from "../ui/icons/AlertWarningIcon";

/**
 * AlertDescription Component
 *
 * Displays an alert message with appropriate severity indicators and optional
 * silence controls for warning-level alerts.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.title] - The primary title/message of the alert
 * @param {string} [props.message] - Alternative field for the alert message (fallback if title is not provided)
 * @param {string} [props.description] - Additional descriptive text shown as secondary text
 * @param {string} [props.details] - Alternative field for details (fallback if description is not provided)
 * @param {boolean} props.isSilenced - Whether the alert is currently silenced
 * @param {('error'|'warning')} props.severity - Severity level of the alert
 * @param {Object} [props.alert] - Full alert object from Redux state (provided by withAlertData HOC)
 * @param {Function} props.toggleSilenceAlert - Callback to toggle the silenced state of the alert
 *
 * @returns {React.ReactElement} A ListItem displaying the alert information
 *
 * @description
 * Visual behaviors:
 * - Error alerts display with an error icon and no silence button
 * - Warning alerts display with a warning icon and include a silence/unsilence button
 * - Silenced alerts are rendered with reduced opacity (0.4)
 * - Secondary text (description/details) is only shown if provided
 */
const AlertDescription = ({
  title,
  message,
  description,
  details,
  isSilenced,
  severity,
  alert,
  toggleSilenceAlert,
}) => {
  const showSilenceButton = severity === SEVERITY_WARNING;

  return (
    <ListItem
      disableGutters
      disablePadding
      secondaryAction={
        showSilenceButton ? (
          <IconButton
            // edge="end"
            aria-label={alert?.isSilenced ? "unsilence alert" : "silence alert"}
            onClick={toggleSilenceAlert}
            size="small"
          >
            {alert?.isSilenced ? <VolumeUp /> : <VolumeOff />}
          </IconButton>
        ) : null
      }
    >
      <ListItemIcon
        sx={{
          justifyContent: "center",
          minWidth: "30px",
          padding: "10px",
          opacity: isSilenced ? 0.4 : 1,
        }}
      >
        {severity === SEVERITY_WARNING ? (
          <AlertWarningIcon />
        ) : (
          <AlertErrorIcon />
        )}
      </ListItemIcon>
      <ListItemText
        sx={{
          opacity: isSilenced ? 0.4 : 1,
          maxWidth: "calc(100% - 90px)",
        }}
        primary={
          <Typography variant="description">
            {title || message || "Alert"}
          </Typography>
        }
        secondary={
          description || details ? (
            <Typography variant="sub-description">
              {description || details}
            </Typography>
          ) : null
        }
      />
    </ListItem>
  );
};

AlertDescription.displayName = "Alert Description";

/**
 * HOC-enhanced version of AlertDescription that automatically connects to Redux
 * alert state and provides necessary data and actions.
 *
 * This is the recommended version to use in most cases as it handles all state
 * management automatically.
 *
 * @type {React.Component}
 * @see {@link module:components/HOC/withAlertData}
 */
const EnhancedAlertDescription = withAlertData(AlertDescription);

export { EnhancedAlertDescription, AlertDescription };
