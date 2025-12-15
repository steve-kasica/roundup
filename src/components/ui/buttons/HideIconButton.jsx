import { VisibilityOff } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const HideIconButton = ({ tooltipText = "Hide columns", ...props }) => (
  <TooltipIconButton title={tooltipText} {...props}>
    <VisibilityOff />
  </TooltipIconButton>
);

export default HideIconButton;
