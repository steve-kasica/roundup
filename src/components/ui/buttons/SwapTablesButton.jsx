import { SwapHoriz as Icon } from "@mui/icons-material";
import TooltipIconButton from "./TooltipIconButton";

const SwapTablesButton = ({
  tooltipText = "Swap table positions",
  ...props
}) => {
  return (
    <TooltipIconButton tooltipText={tooltipText} {...props}>
      <Icon />
    </TooltipIconButton>
  );
};

export default SwapTablesButton;
