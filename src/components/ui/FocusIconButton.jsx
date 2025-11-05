import { IconButton } from "@mui/material";
import { Visibility } from "@mui/icons-material";
const FocusIconButton = (props) => (
  <IconButton
    size="small"
    {...props}
    title="Focus on selected columns (1-2 columns only)"
    color="primary"
  >
    <Visibility fontSize="small" />
  </IconButton>
);

export default FocusIconButton;
