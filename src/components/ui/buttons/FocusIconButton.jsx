import { CenterFocusStrong } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const FocusIconButton = ({
  tooltipText = "Focus selected columns",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <CenterFocusStrong fontSize="small" />
    </TooltipIconButton>
  );
};

export default FocusIconButton;
