import { IconButton } from "@mui/material";
import { VisibilityOff } from "@mui/icons-material";
const ExcludeIconButton = (props) => (
  <IconButton size="small" {...props} title="Exclude columns" color="error">
    <VisibilityOff fontSize="small" />
  </IconButton>
);

export default ExcludeIconButton;
