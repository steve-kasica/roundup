import { IconButton } from "@mui/material";
import { VisibilityOff } from "@mui/icons-material";
const HideIconButton = (props) => (
  <IconButton size="small" {...props} title="Hide columns">
    <VisibilityOff fontSize="small" />
  </IconButton>
);

export default HideIconButton;
