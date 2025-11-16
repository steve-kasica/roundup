import { IconButton } from "@mui/material";
import { Refresh as MaterializeViewIcon } from "@mui/icons-material";

const MaterializeViewIconButton = (props) => (
  <IconButton
    size="small"
    {...props}
    title="Materialize view for better performance"
    color="secondary"
  >
    <MaterializeViewIcon fontSize="small" />
  </IconButton>
);

export default MaterializeViewIconButton;
