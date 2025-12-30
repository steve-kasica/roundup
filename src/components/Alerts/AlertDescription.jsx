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

const EnhancedAlertDescription = withAlertData(AlertDescription);

export { EnhancedAlertDescription, AlertDescription };
