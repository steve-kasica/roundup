import { Clear } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const ClearSearchTextButton = ({
  tooltipText = "Clear Search Text",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <Clear />
    </TooltipIconButton>
  );
};

export default ClearSearchTextButton;
