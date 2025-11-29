import { IconButton, Tooltip } from "@mui/material";
import { CenterFocusStrong } from "@mui/icons-material";
const FocusIconButton = ({
  tooltip = "Focus selected columns (1-2 columns only)",
  size = "small",
  color = "primary",
  disabled,
  ...props
}) => (
  <Tooltip title={tooltip} disableHoverListener={disabled}>
    <span>
      <IconButton size={size} {...props} color={color} disabled={disabled}>
        <CenterFocusStrong fontSize="small" />
      </IconButton>
    </span>
  </Tooltip>
);

export default FocusIconButton;
